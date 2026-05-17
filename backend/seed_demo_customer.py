from datetime import datetime, timedelta, timezone

from app import create_app, db
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog
from app.models.user import User


EMAIL = "ringo.customer.demo@example.com"
PASSWORD = "password123"
FRONTEND_URL = "https://ringo-frontend-ucfchnoxpa-uc.a.run.app"
TWILIO_NUMBER = "+17014197373"


def upsert_demo_customer() -> None:
    app = create_app()
    with app.app_context():
        db.create_all()

        user = User.query.filter_by(email=EMAIL).first()
        if not user:
            user = User(email=EMAIL)
            user.set_password(PASSWORD)
            db.session.add(user)
            db.session.flush()

        business = Business.query.filter_by(user_id=user.id).first()
        if not business:
            business = Business(user_id=user.id, name="Pacific Plumbing Co.")
            db.session.add(business)
            db.session.flush()

        business.name = "Pacific Plumbing Co."
        business.business_type = "Plumbing"
        business.plan = "growth"
        business.twilio_number = TWILIO_NUMBER
        business.booking_url = f"{FRONTEND_URL}/onboarding?ref=pacific-plumbing"
        business.owner_phone = "+14155550100"
        business.timezone = "America/Los_Angeles"
        business.auto_sms_enabled = True
        business.call_forwarding_enabled = False
        business.sms_message = (
            "Hi, this is Pacific Plumbing. Sorry we missed your call. "
            "Reply with your address and issue, or use the booking link below."
        )
        business.voice_message = (
            "Hi, you've reached Pacific Plumbing. We're on another job right now. "
            "Please describe the issue and we will text you right back."
        )
        business.emergency_keywords = [
            "flood",
            "burst",
            "leak",
            "emergency",
            "urgent",
            "no water",
            "pipe broke",
        ]
        business.business_hours = {
            day: {"open": "08:00", "close": "18:00", "enabled": day not in {"sat", "sun"}}
            for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        }

        existing = CallLog.query.filter_by(business_id=business.id).count()
        if existing:
            for sms in (
                SmsLog.query
                .join(CallLog, SmsLog.call_log_id == CallLog.id)
                .filter(CallLog.business_id == business.id)
                .all()
            ):
                if "Book online:" in (sms.message or ""):
                    sms.message = sms.message.split("Book online:", 1)[0].rstrip()
                    sms.message = f"{sms.message} Book online: {business.booking_url}"

        if existing == 0:
            now = datetime.now(timezone.utc)
            rows = [
                ("+14155550117", "Jenna Holcomb", "missed", 0, True, 0, "URGENT - burst pipe in kitchen. Please reply with address and shut off the main valve if safe. Book online:"),
                ("+15105550143", "Mariela Ortiz", "missed", 12, False, 3, "Sorry we missed you. Send the address and a photo of the leak. Book online:"),
                ("+16285550199", None, "answered", 96, False, 8, None),
                ("+14085550177", "Carlos Mendez", "voicemail", 31, False, 15, "We got your voicemail. A technician can call back shortly. Book online:"),
                ("+16505550124", "Greta Lindqvist", "missed", 0, False, 24, "Sorry we missed your call. Reply with the fixture and address. Book online:"),
                ("+14155550231", "Priya Nair", "answered", 144, False, 38, None),
            ]
            sms_count = 0
            for number, name, status, duration, emergency, hours_ago, message in rows:
                call = CallLog(
                    business_id=business.id,
                    caller_number=number,
                    caller_name=name,
                    call_status=status,
                    duration_seconds=duration,
                    emergency=emergency,
                    created_at=now - timedelta(hours=hours_ago),
                )
                db.session.add(call)
                db.session.flush()
                if message:
                    db.session.add(SmsLog(
                        call_log_id=call.id,
                        message_type="sms",
                        message=f"{message} {business.booking_url}",
                        status="sent",
                        twilio_sid=f"SMdemo{call.id:028d}",
                        created_at=call.created_at + timedelta(seconds=11),
                    ))
                    sms_count += 1
            business.sms_count_this_month = sms_count

        db.session.commit()
        print(f"Seeded {EMAIL} / {PASSWORD}")


if __name__ == "__main__":
    upsert_demo_customer()
