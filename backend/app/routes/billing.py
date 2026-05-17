import os
import stripe
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.business import Business

billing_bp = Blueprint('billing', __name__)

PLANS = {
    'starter': {'price': 29, 'name': 'Starter', 'features': ['50 auto-replies/mo', '1 phone number', 'Email support']},
    'growth':  {'price': 79, 'name': 'Growth',  'features': ['500 auto-replies/mo', '3 phone numbers', 'Priority support', 'Analytics']},
    'pro':     {'price': 149, 'name': 'Pro',     'features': ['Unlimited replies', '10 phone numbers', 'Dedicated support', 'API access', 'White-label']},
}

STRIPE_PRICE_IDS = {
    'starter': os.getenv('STRIPE_PRICE_STARTER', ''),
    'growth':  os.getenv('STRIPE_PRICE_GROWTH', ''),
    'pro':     os.getenv('STRIPE_PRICE_PRO', ''),
}


def _stripe_client():
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
    return stripe


@billing_bp.route('/billing', methods=['GET'])
@jwt_required()
def get_billing():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    plan_key = business.plan or 'starter'
    plan_info = PLANS.get(plan_key, PLANS['starter'])

    return jsonify({
        'plan': plan_key,
        'plan_name': plan_info['name'],
        'price': plan_info['price'],
        'features': plan_info['features'],
        'stripe_customer_id': business.stripe_customer_id,
        'has_subscription': bool(business.stripe_subscription_id),
        'all_plans': PLANS,
    }), 200


@billing_bp.route('/billing/create-checkout', methods=['POST'])
@jwt_required()
def create_checkout():
    user_id = int(get_jwt_identity())
    business = Business.query.filter_by(user_id=user_id).first()
    if not business:
        return jsonify({'error': 'Business not found'}), 404

    data = request.get_json(silent=True) or {}
    plan = data.get('plan', 'growth')
    if plan not in PLANS:
        return jsonify({'error': 'Invalid plan'}), 400

    stripe_key = os.getenv('STRIPE_SECRET_KEY', '')
    if not stripe_key or stripe_key.startswith('sk_test_xxx'):
        # Return a mock checkout URL when Stripe is not configured
        return jsonify({
            'checkout_url': f'https://checkout.stripe.com/demo?plan={plan}',
            'note': 'Stripe not configured — using demo URL',
        }), 200

    s = _stripe_client()
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    price_id = STRIPE_PRICE_IDS.get(plan, '')

    if not price_id:
        return jsonify({'error': f'Stripe price ID for "{plan}" not configured in .env'}), 400

    try:
        # get or create customer
        customer_id = business.stripe_customer_id
        if not customer_id:
            from app.models.user import User
            user = db.session.get(User, user_id)
            customer = s.customers.create(email=user.email if user else '', name=business.name)
            customer_id = customer.id
            business.stripe_customer_id = customer_id
            db.session.commit()

        session = s.checkout.sessions.create(
            customer=customer_id,
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{'price': price_id, 'quantity': 1}],
            success_url=f'{frontend_url}/settings?billing=success',
            cancel_url=f'{frontend_url}/settings?billing=cancel',
            metadata={'business_id': str(business.id), 'plan': plan},
        )
        return jsonify({'checkout_url': session.url}), 200
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400


@billing_bp.route('/billing/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature', '')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', '')

    try:
        s = _stripe_client()
        event = s.webhooks.construct_event(payload, sig_header, webhook_secret)
    except Exception:
        return jsonify({'error': 'Invalid signature'}), 400

    if event['type'] == 'checkout.session.completed':
        session_obj = event['data']['object']
        business_id = int(session_obj.get('metadata', {}).get('business_id', 0))
        plan = session_obj.get('metadata', {}).get('plan', 'starter')
        sub_id = session_obj.get('subscription')

        if business_id:
            biz = db.session.get(Business, business_id)
            if biz:
                biz.plan = plan
                biz.stripe_subscription_id = sub_id
                db.session.commit()

    elif event['type'] == 'customer.subscription.deleted':
        sub = event['data']['object']
        biz = Business.query.filter_by(stripe_subscription_id=sub['id']).first()
        if biz:
            biz.plan = 'starter'
            biz.stripe_subscription_id = None
            db.session.commit()

    return jsonify({'received': True}), 200
