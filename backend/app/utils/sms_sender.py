from app import db
from app.models.sms_log import SmsLog
from app.utils.twilio_helper import get_twilio_client


def send_reply_sms(to: str, from_: str, body: str, call_log_id: int) -> SmsLog:
    sms_log = SmsLog(call_log_id=call_log_id, message_type='sms', message=body, status='pending')
    db.session.add(sms_log)
    db.session.flush()

    try:
        msg = get_twilio_client().messages.create(body=body, from_=from_, to=to)
        sms_log.status = 'sent'
        sms_log.twilio_sid = msg.sid
    except Exception as exc:
        sms_log.status = 'failed'
        sms_log.error = str(exc)

    db.session.commit()
    return sms_log


def send_reply_whatsapp(to: str, from_: str, body: str, call_log_id: int) -> SmsLog:
    whatsapp_log = SmsLog(call_log_id=call_log_id, message_type='whatsapp', message=body, status='pending')
    db.session.add(whatsapp_log)
    db.session.flush()

    wa_to = f"whatsapp:{to}" if not to.startswith('whatsapp:') else to
    wa_from = f"whatsapp:{from_}" if not from_.startswith('whatsapp:') else from_

    try:
        msg = get_twilio_client().messages.create(body=body, from_=wa_from, to=wa_to)
        whatsapp_log.status = 'sent'
        whatsapp_log.twilio_sid = msg.sid
    except Exception as exc:
        whatsapp_log.status = 'failed'
        whatsapp_log.error = str(exc)

    db.session.commit()
    return whatsapp_log
