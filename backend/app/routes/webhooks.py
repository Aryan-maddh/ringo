import os
from flask import Blueprint, request
from twilio.twiml.voice_response import VoiceResponse, Gather, Dial
from app import db
from app.models.business import Business
from app.models.call_log import CallLog
from app.utils.sms_sender import send_reply_sms, send_reply_whatsapp

webhooks_bp = Blueprint('webhooks', __name__)

DEFAULT_EMERGENCY_KEYWORDS = [
    'emergency', 'urgent', 'flood', 'burst', 'leak', 'no power',
    'fire', 'stuck', 'broken', 'flooding', 'gas leak', 'no heat',
    'no hot water', 'pipe broke', 'sparks', 'smoke',
]


def _is_emergency(text: str, keywords: list) -> bool:
    if not text:
        return False
    lower = text.lower()
    return any(kw in lower for kw in keywords)


def _build_sms(business: Business, is_emergency: bool) -> str:
    body = business.sms_message or (
        f"Hi! Sorry I missed your call from {business.name}. "
        "I'll get back to you shortly. Reply to book an appointment."
    )
    if business.booking_url:
        body = f"{body}\nBook online: {business.booking_url}"
    if is_emergency:
        body = f"⚠️ URGENT — {body}"
    return body


def _build_whatsapp(business: Business, is_emergency: bool) -> str:
    body = business.whatsapp_message or (
        f"Hi! Sorry I missed your call from {business.name}. "
        "I'll get back to you shortly here on WhatsApp."
    )
    if business.booking_url:
        body = f"{body}\nBook online: {business.booking_url}"
    if is_emergency:
        body = f"⚠️ URGENT — {body}"
    return body


@webhooks_bp.route('/voice', methods=['POST'])
def voice():
    from_number = request.form.get('From', '')
    to_number = request.form.get('To', '')

    response = VoiceResponse()
    business = Business.query.filter_by(twilio_number=to_number).first()

    if not business:
        response.say('This number is not configured. Please contact support.')
        return str(response), 200, {'Content-Type': 'text/xml'}

    call_log = CallLog(
        business_id=business.id,
        caller_number=from_number,
        call_status='incoming',
    )
    db.session.add(call_log)
    db.session.commit()

    base_url = os.getenv('BASE_URL', 'http://localhost:5000')
    action_url = f'{base_url}/api/webhooks/missed-call?call_log_id={call_log.id}'

    if business.call_forwarding_enabled and business.owner_phone:
        # Forward call to owner; missed-call fires if they don't answer
        dial = Dial(
            action=action_url,
            method='POST',
            timeout=20,
        )
        dial.number(business.owner_phone)
        response.append(dial)
    else:
        # Play greeting, gather speech, then send SMS
        greeting = business.voice_message or (
            f"Hi, you've reached {business.name}. We're unavailable right now. "
            "Please briefly describe your issue and we'll text you right back."
        )
        gather = Gather(
            input='speech',
            timeout=3,
            action=action_url,
            method='POST',
            action_on_empty_result=True,
        )
        gather.say(greeting)
        response.append(gather)

    return str(response), 200, {'Content-Type': 'text/xml'}


@webhooks_bp.route('/missed-call', methods=['POST'])
def missed_call():
    from_number = request.form.get('From', '')
    to_number = request.form.get('To', '')
    speech_result = request.form.get('SpeechResult', '')
    call_duration = request.form.get('CallDuration', '0')
    call_log_id = request.args.get('call_log_id', type=int)
    dial_call_status = request.form.get('DialCallStatus', '')

    response = VoiceResponse()
    business = Business.query.filter_by(twilio_number=to_number).first()

    if not business:
        response.hangup()
        return str(response), 200, {'Content-Type': 'text/xml'}

    # If forwarded call was answered, just mark it and return
    if dial_call_status == 'completed':
        if call_log_id:
            call_log = db.session.get(CallLog, call_log_id)
            if call_log:
                call_log.call_status = 'answered'
                db.session.commit()
        response.hangup()
        return str(response), 200, {'Content-Type': 'text/xml'}

    keywords = business.emergency_keywords or DEFAULT_EMERGENCY_KEYWORDS
    is_emergency = _is_emergency(speech_result, keywords)

    # Find or update the call log
    call_log = None
    if call_log_id:
        call_log = db.session.get(CallLog, call_log_id)

    if not call_log:
        call_log = (
            CallLog.query
            .filter_by(business_id=business.id, caller_number=from_number, call_status='incoming')
            .order_by(CallLog.created_at.desc())
            .first()
        )

    if call_log:
        call_log.call_status = 'missed'
        call_log.emergency = is_emergency
        try:
            call_log.duration_seconds = int(call_duration)
        except (ValueError, TypeError):
            pass
        db.session.commit()
    else:
        call_log = CallLog(
            business_id=business.id,
            caller_number=from_number,
            call_status='missed',
            emergency=is_emergency,
        )
        db.session.add(call_log)
        db.session.commit()

    # Send SMS if auto-SMS is enabled
    if business.auto_sms_enabled is not False and business.twilio_number:
        sms_body = _build_sms(business, is_emergency)
        send_reply_sms(
            to=from_number,
            from_=business.twilio_number,
            body=sms_body,
            call_log_id=call_log.id,
        )
        # Increment monthly SMS counter
        business.sms_count_this_month = (business.sms_count_this_month or 0) + 1
        db.session.commit()

    # Send WhatsApp if auto-WhatsApp is enabled
    if business.auto_whatsapp_enabled and business.twilio_number:
        wa_body = _build_whatsapp(business, is_emergency)
        send_reply_whatsapp(
            to=from_number,
            from_=business.twilio_number,
            body=wa_body,
            call_log_id=call_log.id,
        )

    response.say("Thanks! We've sent you a text and will follow up shortly.")
    response.hangup()
    return str(response), 200, {'Content-Type': 'text/xml'}


@webhooks_bp.route('/status', methods=['POST'])
def call_status():
    """Twilio status callback — update call record with final status."""
    call_sid = request.form.get('CallSid', '')
    call_status_val = request.form.get('CallStatus', '')
    to_number = request.form.get('To', '')
    from_number = request.form.get('From', '')
    duration = request.form.get('CallDuration', '0')

    business = Business.query.filter_by(twilio_number=to_number).first()
    if business and call_status_val in ('no-answer', 'busy', 'failed', 'canceled'):
        call_log = (
            CallLog.query
            .filter_by(business_id=business.id, caller_number=from_number)
            .order_by(CallLog.created_at.desc())
            .first()
        )
        if call_log and call_log.call_status == 'incoming':
            call_log.call_status = 'missed'
            try:
                call_log.duration_seconds = int(duration)
            except (ValueError, TypeError):
                pass
            db.session.commit()

    return '', 204
