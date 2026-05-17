from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.business import Business
from app.models.review_request import ReviewRequest

reviews_bp = Blueprint('reviews', __name__)


def _get_business():
    user_id = int(get_jwt_identity())
    return Business.query.filter_by(user_id=user_id).first()


@reviews_bp.route('/reviews', methods=['GET'])
@jwt_required()
def get_reviews():
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404
    reviews = (
        ReviewRequest.query
        .filter_by(business_id=business.id)
        .order_by(ReviewRequest.sent_at.desc())
        .all()
    )
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


@reviews_bp.route('/reviews', methods=['POST'])
@jwt_required()
def send_review():
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    phone = data.get('phone', '').strip()
    if not phone:
        return jsonify({'error': 'phone is required'}), 400

    review = ReviewRequest(
        business_id=business.id,
        caller_name=data.get('caller_name', 'Unknown caller'),
        phone=phone,
        platform=data.get('platform', 'Google'),
        review_url=data.get('review_url', ''),
    )
    db.session.add(review)
    db.session.commit()

    if business.twilio_number and phone:
        try:
            from app.utils.sms_sender import send_sms
            review_link = review.review_url or 'https://g.page/review'
            msg = (
                f'Hi! Thanks for contacting {business.name}. '
                f'We\'d love your feedback — it only takes 30 seconds: {review_link}'
            )
            send_sms(business.twilio_number, phone, msg)
        except Exception:
            pass

    return jsonify(review.to_dict()), 201
