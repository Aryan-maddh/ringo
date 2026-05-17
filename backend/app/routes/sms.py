from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog
from app.utils.sms_sender import send_reply_sms

sms_bp = Blueprint('sms', __name__)


@sms_bp.route('/sms', methods=['GET'])
@jwt_required()
def list_sms():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    call_log_id = request.args.get('call_log_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)

    query = (
        SmsLog.query
        .join(CallLog, SmsLog.call_log_id == CallLog.id)
        .filter(CallLog.business_id == business.id)
    )
    if call_log_id:
        query = query.filter(SmsLog.call_log_id == call_log_id)

    pagination = query.order_by(SmsLog.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    # enrich each SMS with caller info from call_log
    results = []
    for s in pagination.items:
        cl = CallLog.query.get(s.call_log_id)
        results.append({
            **s.to_dict(),
            'caller_number': cl.caller_number if cl else None,
            'caller_name': cl.caller_name if cl else None,
            'emergency': cl.emergency if cl else False,
        })

    return jsonify({
        'sms': results,
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
    }), 200


@sms_bp.route('/sms/conversations', methods=['GET'])
@jwt_required()
def list_conversations():
    """Return SMS logs grouped as conversations by caller_number."""
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    # Get all call_logs with associated SMS for this business
    call_logs = (
        CallLog.query
        .filter_by(business_id=business.id)
        .order_by(CallLog.created_at.desc())
        .all()
    )

    # Group by caller_number
    conv_map: dict = {}
    for cl in call_logs:
        num = cl.caller_number
        if num not in conv_map:
            conv_map[num] = {
                'caller_number': num,
                'caller_name': cl.caller_name,
                'emergency': cl.emergency,
                'last_call_at': cl.created_at.isoformat(),
                'call_count': 0,
                'messages': [],
            }
        conv_map[num]['call_count'] += 1
        # include this call's SMS messages
        for sms in cl.sms_logs:
            conv_map[num]['messages'].append({
                **sms.to_dict(),
                'caller_number': num,
            })

    conversations = sorted(conv_map.values(), key=lambda c: c['last_call_at'], reverse=True)
    return jsonify({'conversations': conversations, 'total': len(conversations)}), 200


@sms_bp.route('/sms/reply', methods=['POST'])
@jwt_required()
def reply_sms():
    """Send a manual SMS reply to a caller number."""
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    to = data.get('to', '').strip()
    message = data.get('message', '').strip()

    if not to:
        return jsonify({'error': 'Recipient number (to) is required'}), 400
    if not message:
        return jsonify({'error': 'Message body is required'}), 400
    if len(message) > 1600:
        return jsonify({'error': 'Message exceeds 1600 characters'}), 400
    if not business.twilio_number:
        return jsonify({'error': 'No Twilio number configured for this business'}), 400

    # find or use the most recent call_log for this caller
    call_log = (
        CallLog.query
        .filter_by(business_id=business.id, caller_number=to)
        .order_by(CallLog.created_at.desc())
        .first()
    )
    if not call_log:
        # create a placeholder call_log so we can attach the SMS
        call_log = CallLog(
            business_id=business.id,
            caller_number=to,
            call_status='manual-reply',
        )
        db.session.add(call_log)
        db.session.flush()

    sms = send_reply_sms(
        to=to,
        from_=business.twilio_number,
        body=message,
        call_log_id=call_log.id,
    )
    return jsonify(sms.to_dict()), 201
