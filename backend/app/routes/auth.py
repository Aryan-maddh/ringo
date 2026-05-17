from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, limiter
from app.models.user import User
from app.models.business import Business

auth_bp = Blueprint('auth', __name__)

_DEFAULT_HOURS = {
    day: {'open': '08:00', 'close': '18:00', 'enabled': i < 5}
    for i, day in enumerate(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
}
_DEFAULT_KEYWORDS = ['flood', 'burst', 'emergency', 'urgent', 'no power']


@auth_bp.route('/register', methods=['POST'])
@limiter.limit('10 per hour')
def register():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    business = Business(
        user_id=user.id,
        name=data.get('business_name') or email.split('@')[0],
        business_type=data.get('business_type'),
        sms_message=(
            "Hi! Sorry I missed your call. I'll get back to you shortly. "
            "Reply to book an appointment."
        ),
        emergency_keywords=_DEFAULT_KEYWORDS,
        business_hours=_DEFAULT_HOURS,
    )
    db.session.add(business)
    db.session.commit()

    return jsonify({
        'access_token': create_access_token(identity=str(user.id)),
        'refresh_token': create_refresh_token(identity=str(user.id)),
        'user': user.to_dict(),
        'business': business.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit('20 per hour')
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    business = Business.query.filter_by(user_id=user.id).first()

    return jsonify({
        'access_token': create_access_token(identity=str(user.id)),
        'refresh_token': create_refresh_token(identity=str(user.id)),
        'user': user.to_dict(),
        'business': business.to_dict() if business else None,
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    return jsonify({'access_token': create_access_token(identity=get_jwt_identity())}), 200
