import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.business import Business
from app.utils.twilio_helper import get_twilio_client

numbers_bp = Blueprint('numbers', __name__)


def _fmt_number(e164: str) -> str:
    """Format E.164 number as +1 (NXX) NXX-XXXX."""
    digits = e164.lstrip('+')
    if len(digits) == 11 and digits.startswith('1'):
        n = digits[1:]
        return f'+1 ({n[:3]}) {n[3:6]}-{n[6:]}'
    return e164


@numbers_bp.route('/search', methods=['GET'])
@jwt_required()
def search_numbers():
    areacode = request.args.get('areacode', '').strip()
    if not areacode or not areacode.isdigit() or len(areacode) != 3:
        return jsonify({'error': 'A valid 3-digit area code is required'}), 400

    try:
        client = get_twilio_client()
        available = client.available_phone_numbers('US').local.list(
            area_code=areacode,
            limit=8,
        )
        numbers = [
            {
                'phone_number': n.phone_number,
                'friendly_name': _fmt_number(n.phone_number),
                'locality': n.locality or '',
                'region': n.region or '',
            }
            for n in available
        ]
        return jsonify({'numbers': numbers}), 200
    except Exception as exc:
        return jsonify({'error': f'Twilio error: {exc}'}), 500


@numbers_bp.route('/provision', methods=['POST'])
@jwt_required()
def provision_number():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    phone_number = data.get('phone_number', '').strip()
    number_type = data.get('type', 'sms')
    if not phone_number:
        return jsonify({'error': 'phone_number is required'}), 400

    # Release previous number if one is already assigned
    sid_to_release = business.whatsapp_number_sid if number_type == 'whatsapp' else business.twilio_number_sid
    if sid_to_release:
        try:
            client = get_twilio_client()
            client.incoming_phone_numbers(sid_to_release).delete()
        except Exception:
            pass  # Stale SID — safe to continue

    base_url = os.getenv('BASE_URL', 'http://localhost:5000')
    try:
        client = get_twilio_client()
        incoming = client.incoming_phone_numbers.create(
            phone_number=phone_number,
            voice_url=f'{base_url}/api/webhooks/voice',
            voice_method='POST',
            status_callback=f'{base_url}/api/webhooks/status',
            status_callback_method='POST',
        )
        if number_type == 'whatsapp':
            business.whatsapp_number = incoming.phone_number
            business.whatsapp_number_sid = incoming.sid
        else:
            business.twilio_number = incoming.phone_number
            business.twilio_number_sid = incoming.sid
        db.session.commit()
        return jsonify({
            'phone_number': incoming.phone_number,
            'friendly_name': _fmt_number(incoming.phone_number),
            'sid': incoming.sid,
            'type': number_type
        }), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to provision number: {exc}'}), 500


@numbers_bp.route('/release', methods=['POST'])
@jwt_required()
def release_number():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    number_type = request.json.get('type', 'sms') if request.is_json else 'sms'
    sid_to_release = business.whatsapp_number_sid if number_type == 'whatsapp' else business.twilio_number_sid
    if not business or not sid_to_release:
        return jsonify({'error': 'No provisioned number to release'}), 404

    try:
        client = get_twilio_client()
        client.incoming_phone_numbers(sid_to_release).delete()
    except Exception as exc:
        return jsonify({'error': f'Twilio error: {exc}'}), 500

    if number_type == 'whatsapp':
        business.whatsapp_number = None
        business.whatsapp_number_sid = None
    else:
        business.twilio_number = None
        business.twilio_number_sid = None
    db.session.commit()
    return jsonify({'message': 'Number released successfully'}), 200


@numbers_bp.route('/current', methods=['GET'])
@jwt_required()
def current_number():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    return jsonify({
        'phone_number': business.twilio_number,
        'friendly_name': _fmt_number(business.twilio_number) if business.twilio_number else None,
        'sid': business.twilio_number_sid,
        'whatsapp_number': business.whatsapp_number,
        'whatsapp_friendly_name': _fmt_number(business.whatsapp_number) if business.whatsapp_number else None,
        'whatsapp_sid': business.whatsapp_number_sid,
        'call_forwarding_enabled': bool(business.call_forwarding_enabled),
        'owner_phone': business.owner_phone,
        'auto_sms_enabled': bool(business.auto_sms_enabled) if business.auto_sms_enabled is not None else True,
        'auto_whatsapp_enabled': bool(business.auto_whatsapp_enabled),
    }), 200
