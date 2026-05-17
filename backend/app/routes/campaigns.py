from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.business import Business
from app.models.campaign import Campaign

campaigns_bp = Blueprint('campaigns', __name__)


def _get_business():
    user_id = int(get_jwt_identity())
    return Business.query.filter_by(user_id=user_id).first()


@campaigns_bp.route('/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404
    campaigns = (
        Campaign.query
        .filter_by(business_id=business.id)
        .order_by(Campaign.created_at.desc())
        .all()
    )
    return jsonify({'campaigns': [c.to_dict() for c in campaigns]}), 200


@campaigns_bp.route('/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'name is required'}), 400

    campaign = Campaign(
        business_id=business.id,
        name=name,
        message_template=data.get(
            'message_template',
            f'Hi! We missed your call to {business.name}. Can we help you today? Reply to book.',
        ),
        delay_hours=int(data.get('delay_hours', 24)),
        trigger=data.get('trigger', 'missed_call'),
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify(campaign.to_dict()), 201


@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    campaign = Campaign.query.filter_by(id=campaign_id, business_id=business.id).first()
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    data = request.get_json(silent=True) or {}
    if 'name' in data:
        campaign.name = data['name'].strip() or campaign.name
    if 'status' in data and data['status'] in ('active', 'paused'):
        campaign.status = data['status']
    if 'message_template' in data:
        campaign.message_template = data['message_template']
    if 'delay_hours' in data:
        campaign.delay_hours = int(data['delay_hours'])
    if 'trigger' in data:
        campaign.trigger = data['trigger']

    db.session.commit()
    return jsonify(campaign.to_dict()), 200


@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    business = _get_business()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    campaign = Campaign.query.filter_by(id=campaign_id, business_id=business.id).first()
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    db.session.delete(campaign)
    db.session.commit()
    return jsonify({'message': 'Campaign deleted'}), 200
