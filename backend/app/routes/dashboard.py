from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app import db
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog

dashboard_bp = Blueprint('dashboard', __name__)

PLAN_PRICE = {'starter': 29, 'growth': 79, 'pro': 149}


def _period_start(period: str, now: datetime) -> datetime:
    if period == 'today':
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == '7d':
        return now - timedelta(days=7)
    if period == '90d':
        return now - timedelta(days=90)
    return now - timedelta(days=30)  # default '30d'


@dashboard_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def stats():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    period = request.args.get('period', '30d')
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start = _period_start(period, now)

    # ── period-scoped counts ──────────────────────────────────────────────
    total_calls = (
        CallLog.query.filter_by(business_id=business.id)
        .filter(CallLog.created_at >= period_start).count()
    )
    missed_calls = (
        CallLog.query.filter_by(business_id=business.id, call_status='missed')
        .filter(CallLog.created_at >= period_start).count()
    )
    answered_calls = (
        CallLog.query.filter_by(business_id=business.id, call_status='answered')
        .filter(CallLog.created_at >= period_start).count()
    )
    voicemail_calls = (
        CallLog.query.filter_by(business_id=business.id, call_status='voicemail')
        .filter(CallLog.created_at >= period_start).count()
    )
    emergency_calls = (
        CallLog.query.filter_by(business_id=business.id, emergency=True)
        .filter(CallLog.created_at >= period_start).count()
    )

    sms_sent = (
        db.session.query(func.count(SmsLog.id))
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .filter(
            CallLog.business_id == business.id,
            SmsLog.status == 'sent',
            SmsLog.created_at >= period_start,
        )
        .scalar() or 0
    )
    reply_rate = round(sms_sent / missed_calls * 100, 1) if missed_calls else 0.0

    # ── today counts (always today, unaffected by period param) ───────────
    missed_calls_today = (
        CallLog.query
        .filter_by(business_id=business.id, call_status='missed')
        .filter(CallLog.created_at >= today_start)
        .count()
    )
    sms_sent_today = (
        db.session.query(func.count(SmsLog.id))
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .filter(
            CallLog.business_id == business.id,
            SmsLog.status == 'sent',
            SmsLog.created_at >= today_start,
        )
        .scalar() or 0
    )

    revenue_recovered = round(sms_sent * 0.30 * 150, 0)

    # ── chart: calls bucketed by period ───────────────────────────────────
    if period == 'today':
        rows = (
            db.session.query(
                func.date_trunc('hour', CallLog.created_at).label('bucket'),
                func.count(CallLog.id).label('count'),
                func.count(CallLog.id).filter(CallLog.call_status == 'missed').label('missed'),
            )
            .filter(CallLog.business_id == business.id, CallLog.created_at >= period_start)
            .group_by('bucket').order_by('bucket').all()
        )
        calls_by_day = [
            {'day': r.bucket.strftime('%H:%M'), 'count': r.count, 'missed': r.missed}
            for r in rows
        ]
    elif period == '90d':
        rows = (
            db.session.query(
                func.date_trunc('week', CallLog.created_at).label('bucket'),
                func.count(CallLog.id).label('count'),
                func.count(CallLog.id).filter(CallLog.call_status == 'missed').label('missed'),
            )
            .filter(CallLog.business_id == business.id, CallLog.created_at >= period_start)
            .group_by('bucket').order_by('bucket').all()
        )
        calls_by_day = [
            {'day': str(r.bucket.date()), 'count': r.count, 'missed': r.missed}
            for r in rows
        ]
    else:
        rows = (
            db.session.query(
                func.date_trunc('day', CallLog.created_at).label('day'),
                func.count(CallLog.id).label('count'),
                func.count(CallLog.id).filter(CallLog.call_status == 'missed').label('missed'),
            )
            .filter(CallLog.business_id == business.id, CallLog.created_at >= period_start)
            .group_by('day').order_by('day').all()
        )
        calls_by_day = [
            {'day': str(r.day.date()), 'count': r.count, 'missed': r.missed}
            for r in rows
        ]

    # ── 7-day weekly widget (always last 7 days for dashboard bar chart) ──
    seven_days_ago = now - timedelta(days=7)
    week_rows = (
        db.session.query(
            func.date_trunc('day', CallLog.created_at).label('day'),
            func.count(CallLog.id).label('total'),
            func.count(CallLog.id).filter(CallLog.call_status == 'missed').label('missed'),
        )
        .filter(CallLog.business_id == business.id, CallLog.created_at >= seven_days_ago)
        .group_by('day').order_by('day').all()
    )
    days_map = {str(r.day.date()): {'total': r.total, 'missed': r.missed} for r in week_rows}
    calls_this_week = []
    for i in range(6, -1, -1):
        d = (now - timedelta(days=i)).date()
        key = str(d)
        entry = days_map.get(key, {'total': 0, 'missed': 0})
        calls_this_week.append({
            'day': d.strftime('%a'), 'date': key,
            'total': entry['total'], 'missed': entry['missed'],
        })

    # ── recent 5 calls ─────────────────────────────────────────────────────
    recent_call_rows = (
        CallLog.query
        .filter_by(business_id=business.id)
        .order_by(CallLog.created_at.desc())
        .limit(5).all()
    )
    recent_calls = []
    for cl in recent_call_rows:
        sms_row = SmsLog.query.filter_by(call_log_id=cl.id).order_by(SmsLog.created_at.desc()).first()
        recent_calls.append({
            **cl.to_dict(),
            'sms_status': sms_row.status if sms_row else None,
            'sms_message': sms_row.message if sms_row else None,
        })

    return jsonify({
        'total_calls': total_calls,
        'missed_calls': missed_calls,
        'answered_calls': answered_calls,
        'voicemail_calls': voicemail_calls,
        'emergency_calls': emergency_calls,
        'sms_sent': sms_sent,
        'reply_rate': reply_rate,
        'missed_calls_today': missed_calls_today,
        'sms_sent_today': sms_sent_today,
        'bookings_count': round(sms_sent * 0.30),
        'revenue_recovered': int(revenue_recovered),
        'calls_by_day': calls_by_day,
        'calls_this_week': calls_this_week,
        'recent_calls': recent_calls,
        'twilio_number': business.twilio_number,
    }), 200
