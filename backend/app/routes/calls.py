from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.business import Business
from app.models.call_log import CallLog

calls_bp = Blueprint('calls', __name__)

_VALID_STATUSES = {'missed', 'answered', 'voicemail', 'incoming'}


@calls_bp.route('/calls', methods=['GET'])
@jwt_required()
def list_calls():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    status_filter = request.args.get('status', '').strip().lower()
    emergency_only = request.args.get('emergency', '').lower() == 'true'

    query = CallLog.query.filter_by(business_id=business.id)

    if status_filter and status_filter in _VALID_STATUSES:
        query = query.filter(CallLog.call_status == status_filter)

    if emergency_only:
        query = query.filter(CallLog.emergency.is_(True))

    pagination = (
        query
        .order_by(CallLog.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        'calls': [c.to_dict() for c in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
    }), 200
