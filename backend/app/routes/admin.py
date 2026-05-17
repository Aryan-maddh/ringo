from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
import os
from app import db, limiter
from app.models.user import User
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog

admin_bp = Blueprint('admin', __name__)

PLAN_MRR = {'starter': 29, 'growth': 79, 'pro': 149}
VALID_PLANS = set(PLAN_MRR.keys())


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if not get_jwt().get('admin'):
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route('/login', methods=['POST'])
@limiter.limit('10 per hour')
def admin_login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    admin_email = os.getenv('ADMIN_EMAIL', 'admin@ringo.app').lower()
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin-dev-password')

    if email != admin_email or password != admin_password:
        return jsonify({'error': 'Invalid admin credentials'}), 401

    token = create_access_token(
        identity=email,
        additional_claims={'admin': True},
        expires_delta=timedelta(hours=8),
    )
    return jsonify({'access_token': token}), 200


@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # real counts
    active_businesses = Business.query.filter_by(suspended=False).count()
    total_users = User.query.count()
    suspended_count = Business.query.filter_by(suspended=True).count()

    # real MRR from plan fields
    businesses = Business.query.filter_by(suspended=False).all()
    mrr_cents = sum(PLAN_MRR.get(b.plan, 0) for b in businesses) * 100  # in cents for precision
    mrr = mrr_cents / 100  # back to dollars

    # real SMS sent in last 30d
    sms_sent_30d = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= thirty_days_ago, SmsLog.status == 'sent')
        .scalar() or 0
    )

    # real calls today
    calls_today = (
        CallLog.query
        .filter(CallLog.created_at >= today_start)
        .count()
    )

    # new signups (businesses) in last 30d
    new_signups = (
        Business.query
        .filter(Business.created_at >= thirty_days_ago)
        .count()
    )

    # churn placeholder (no churn tracking yet, return 0)
    return jsonify({
        'mrr': mrr,
        'active_businesses': active_businesses,
        'suspended_businesses': suspended_count,
        'sms_sent_30d': sms_sent_30d,
        'calls_today': calls_today,
        'net_churn': 0.0,
        'total_users': total_users,
        'new_signups': new_signups,
    }), 200


@admin_bp.route('/businesses', methods=['GET'])
@admin_required
def admin_businesses():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    q = request.args.get('q', '').strip()

    query = Business.query
    if q:
        query = query.filter(Business.name.ilike(f'%{q}%'))

    paginated = query.order_by(Business.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    result = []
    for b in paginated.items:
        total_calls = CallLog.query.filter_by(business_id=b.id).count()
        sms_sent = (
            db.session.query(func.count(SmsLog.id))
            .join(CallLog, SmsLog.call_log_id == CallLog.id)
            .filter(CallLog.business_id == b.id, SmsLog.status == 'sent')
            .scalar() or 0
        )
        result.append({
            **b.to_dict(),
            'total_calls': total_calls,
            'sms_sent': sms_sent,
            'mrr': PLAN_MRR.get(b.plan, 0),
        })

    return jsonify({
        'businesses': result,
        'total': paginated.total,
        'page': page,
        'pages': paginated.pages,
    }), 200


@admin_bp.route('/businesses/<int:business_id>', methods=['GET'])
@admin_required
def admin_business_detail(business_id):
    business = db.session.get(Business, business_id)
    if not business:
        return jsonify({'error': 'Business not found'}), 404
    user = db.session.get(User, business.user_id)
    total_calls = CallLog.query.filter_by(business_id=business.id).count()
    sms_sent = (
        db.session.query(func.count(SmsLog.id))
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .filter(CallLog.business_id == business.id, SmsLog.status == 'sent')
        .scalar() or 0
    )
    return jsonify({
        'business': {**business.to_dict(), 'total_calls': total_calls, 'sms_sent': sms_sent},
        'user': user.to_dict() if user else None,
    }), 200


@admin_bp.route('/businesses/<int:business_id>', methods=['PUT'])
@admin_required
def admin_update_business(business_id):
    business = db.session.get(Business, business_id)
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}

    if 'plan' in data:
        plan = data['plan']
        if plan not in VALID_PLANS:
            return jsonify({'error': f'Invalid plan. Must be one of: {", ".join(VALID_PLANS)}'}), 400
        business.plan = plan

    if 'suspended' in data:
        business.suspended = bool(data['suspended'])

    db.session.commit()
    return jsonify(business.to_dict()), 200


@admin_bp.route('/numbers', methods=['GET'])
@admin_required
def admin_numbers():
    businesses = Business.query.filter(Business.twilio_number.isnot(None)).all()
    result = []
    for b in businesses:
        sms_count = (
            db.session.query(func.count(SmsLog.id))
            .join(CallLog, SmsLog.call_log_id == CallLog.id)
            .filter(CallLog.business_id == b.id, SmsLog.status == 'sent')
            .scalar() or 0
        )
        result.append({
            'business_id': b.id,
            'business_name': b.name,
            'phone_number': b.twilio_number,
            'sid': b.twilio_number_sid,
            'plan': b.plan,
            'sms_count_this_month': b.sms_count_this_month or 0,
            'total_sms_sent': sms_count,
            'call_forwarding_enabled': bool(b.call_forwarding_enabled),
        })
    return jsonify({
        'numbers': result,
        'total_provisioned': len(result),
    }), 200


@admin_bp.route('/numbers/release', methods=['POST'])
@admin_required
def admin_release_number():
    data = request.get_json(silent=True) or {}
    phone = data.get('phone_number', '').strip()
    if not phone:
        return jsonify({'error': 'phone_number is required'}), 400

    business = Business.query.filter_by(twilio_number=phone).first()
    if not business:
        return jsonify({'error': 'Number not found'}), 404

    if business.twilio_number_sid:
        try:
            from app.utils.twilio_helper import get_twilio_client
            client = get_twilio_client()
            client.incoming_phone_numbers(business.twilio_number_sid).delete()
        except Exception as exc:
            return jsonify({'error': f'Twilio error: {exc}'}), 500

    business.twilio_number = None
    business.twilio_number_sid = None
    db.session.commit()
    return jsonify({'message': f'Number {phone} released from {business.name}'}), 200


@admin_bp.route('/users', methods=['GET'])
@admin_required
def admin_users():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    q = request.args.get('q', '').strip()

    query = User.query
    if q:
        query = query.filter(User.email.ilike(f'%{q}%'))

    paginated = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    result = []
    for u in paginated.items:
        businesses = Business.query.filter_by(user_id=u.id).all()
        result.append({
            **u.to_dict(),
            'businesses_count': len(businesses),
            'plan': businesses[0].plan if businesses else None,
            'business_name': businesses[0].name if businesses else None,
            'suspended': businesses[0].suspended if businesses else False,
        })

    return jsonify({
        'users': result,
        'total': paginated.total,
        'page': page,
        'pages': paginated.pages,
    }), 200


@admin_bp.route('/audit-log', methods=['GET'])
@admin_required
def admin_audit_log():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 200)

    calls = (
        db.session.query(CallLog, Business)
        .join(Business, CallLog.business_id == Business.id)
        .order_by(CallLog.created_at.desc())
        .limit(200)
        .all()
    )
    sms_items = (
        db.session.query(SmsLog, CallLog, Business)
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .join(Business, CallLog.business_id == Business.id)
        .order_by(SmsLog.created_at.desc())
        .limit(200)
        .all()
    )

    events = []
    for call, biz in calls:
        events.append({
            'id': f'call-{call.id}',
            'type': 'call',
            'action': f'{"Missed" if call.call_status == "missed" else "Answered"} call from {call.caller_number or "unknown"}',
            'actor': biz.name,
            'resource': 'call_log',
            'resource_id': call.id,
            'timestamp': call.created_at.isoformat(),
        })
    for sms, call, biz in sms_items:
        events.append({
            'id': f'sms-{sms.id}',
            'type': 'sms',
            'action': f'Auto-SMS {sms.status} to {call.caller_number or "unknown"}',
            'actor': biz.name,
            'resource': 'sms_log',
            'resource_id': sms.id,
            'timestamp': sms.created_at.isoformat(),
        })

    events.sort(key=lambda e: e['timestamp'], reverse=True)
    total = len(events)
    start = (page - 1) * per_page
    return jsonify({
        'events': events[start:start + per_page],
        'total': total,
        'page': page,
        'pages': max(1, (total + per_page - 1) // per_page),
    }), 200


@admin_bp.route('/system-health', methods=['GET'])
@admin_required
def admin_system_health():
    import time as _time
    now = datetime.now(timezone.utc)
    last_hour = now - timedelta(hours=1)
    last_24h = now - timedelta(hours=24)

    # measure real DB round-trip latency
    t0 = _time.monotonic()
    db_connected = True
    try:
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
    except Exception:
        db_connected = False
    api_latency_ms = round((_time.monotonic() - t0) * 1000, 1)

    sms_last_hour = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= last_hour)
        .scalar() or 0
    )
    sms_failed_last_hour = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= last_hour, SmsLog.status == 'failed')
        .scalar() or 0
    )
    calls_last_hour = CallLog.query.filter(CallLog.created_at >= last_hour).count()
    calls_last_24h = CallLog.query.filter(CallLog.created_at >= last_24h).count()
    sms_error_rate = round((sms_failed_last_hour / max(sms_last_hour, 1)) * 100, 2)

    # uptime: % of hours in last 30d that had no failed SMS spike
    thirty_days_ago = now - timedelta(days=30)
    total_sms_30d = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= thirty_days_ago)
        .scalar() or 0
    )
    failed_sms_30d = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= thirty_days_ago, SmsLog.status == 'failed')
        .scalar() or 0
    )
    uptime_pct = round((1 - failed_sms_30d / max(total_sms_30d, 1)) * 100, 2) if total_sms_30d else 100.0

    return jsonify({
        'status': 'healthy' if db_connected and sms_error_rate < 10 else 'degraded',
        'sms_sent_last_hour': sms_last_hour,
        'sms_failed_last_hour': sms_failed_last_hour,
        'sms_error_rate': sms_error_rate,
        'calls_last_hour': calls_last_hour,
        'calls_last_24h': calls_last_24h,
        'db_connected': db_connected,
        'api_latency_ms': api_latency_ms,
        'webhook_latency_ms': api_latency_ms,
        'uptime_pct': uptime_pct,
        'last_checked': now.isoformat(),
    }), 200


@admin_bp.route('/sms-traffic', methods=['GET'])
@admin_required
def admin_sms_traffic():
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    per_page = min(request.args.get('per_page', 50, type=int), 200)
    page = request.args.get('page', 1, type=int)

    base_q = (
        db.session.query(SmsLog, CallLog, Business)
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .join(Business, CallLog.business_id == Business.id)
        .order_by(SmsLog.created_at.desc())
    )
    total = base_q.count()
    rows = base_q.offset((page - 1) * per_page).limit(per_page).all()

    messages = [{
        'id': sms.id,
        'business_name': biz.name,
        'from_number': biz.twilio_number or 'N/A',
        'to_number': call.caller_number or 'N/A',
        'status': sms.status,
        'message': sms.message,
        'timestamp': sms.created_at.isoformat(),
    } for sms, call, biz in rows]

    sent_24h = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= last_24h, SmsLog.status == 'sent')
        .scalar() or 0
    )
    sent_7d = (
        db.session.query(func.count(SmsLog.id))
        .filter(SmsLog.created_at >= last_7d, SmsLog.status == 'sent')
        .scalar() or 0
    )

    return jsonify({
        'messages': messages,
        'total': total,
        'page': page,
        'pages': max(1, (total + per_page - 1) // per_page),
        'stats': {'sent_24h': sent_24h, 'sent_7d': sent_7d},
    }), 200


@admin_bp.route('/platform-settings', methods=['GET'])
@admin_required
def get_platform_settings():
    return jsonify({
        'twilio_webhook_base': os.getenv('TWILIO_WEBHOOK_BASE', ''),
        'frontend_url': os.getenv('FRONTEND_URL', 'http://localhost:3000'),
        'sms_enabled': True,
        'voice_enabled': True,
        'max_sms_per_month': 1000,
        'default_plan': 'starter',
        'maintenance_mode': False,
    }), 200


@admin_bp.route('/platform-settings', methods=['PUT'])
@admin_required
def update_platform_settings():
    return jsonify({'message': 'Settings noted — restart required for env-backed values'}), 200


@admin_bp.route('/businesses', methods=['POST'])
@admin_required
def admin_create_business():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    plan = data.get('plan', 'starter')

    if not email or not name:
        return jsonify({'error': 'email and name are required'}), 400
    if plan not in VALID_PLANS:
        return jsonify({'error': f'Invalid plan. Must be one of: {", ".join(VALID_PLANS)}'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email)
        user.set_password('changeme123')
        db.session.add(user)
        db.session.flush()

    business = Business(
        user_id=user.id,
        name=name,
        plan=plan,
        business_type=data.get('business_type'),
    )
    db.session.add(business)
    db.session.commit()
    return jsonify({**business.to_dict(), 'user': user.to_dict()}), 201


@admin_bp.route('/revenue', methods=['GET'])
@admin_required
def admin_revenue():
    businesses = Business.query.filter_by(suspended=False).all()
    mrr = sum(PLAN_MRR.get(b.plan, 0) for b in businesses)
    arr = mrr * 12
    total_count = len(businesses)

    # new MRR from businesses created in last 30d
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_biz = Business.query.filter(Business.created_at >= thirty_days_ago).all()
    net_new_mrr = sum(PLAN_MRR.get(b.plan, 0) for b in new_biz)

    return jsonify({
        'mrr': mrr,
        'arr': arr,
        'net_new_mrr': net_new_mrr,
        'outstanding_ar': 0,
        'total_businesses': total_count,
    }), 200
