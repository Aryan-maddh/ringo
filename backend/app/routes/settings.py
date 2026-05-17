from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.business import Business

settings_bp = Blueprint('settings', __name__)

_ALLOWED_FIELDS = frozenset([
    'name', 'business_type', 'booking_url',
    'sms_message', 'business_hours', 'emergency_keywords',
    'owner_phone', 'timezone', 'auto_sms_enabled',
    'call_forwarding_enabled', 'voice_message',
    'auto_whatsapp_enabled', 'whatsapp_message',
])


def _settings_dict(b: Business) -> dict:
    return {
        'id': b.id,
        'name': b.name,
        'business_type': b.business_type,
        'twilio_number': b.twilio_number,
        'twilio_number_sid': b.twilio_number_sid,
        'whatsapp_number': b.whatsapp_number,
        'whatsapp_number_sid': b.whatsapp_number_sid,
        'booking_url': b.booking_url,
        'sms_message': b.sms_message,
        'whatsapp_message': b.whatsapp_message,
        'business_hours': b.business_hours,
        'emergency_keywords': b.emergency_keywords,
        'owner_phone': b.owner_phone,
        'timezone': b.timezone or 'America/New_York',
        'auto_sms_enabled': bool(b.auto_sms_enabled) if b.auto_sms_enabled is not None else True,
        'auto_whatsapp_enabled': bool(b.auto_whatsapp_enabled),
        'call_forwarding_enabled': bool(b.call_forwarding_enabled),
        'voice_message': b.voice_message,
        'sms_count_this_month': b.sms_count_this_month or 0,
        'plan': b.plan,
    }


@settings_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404
    return jsonify(_settings_dict(business)), 200


@settings_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    for field in _ALLOWED_FIELDS.intersection(data):
        setattr(business, field, data[field])

    db.session.commit()
    return jsonify(_settings_dict(business)), 200
