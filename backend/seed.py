"""
Seed the database with test data.
Run: venv/Scripts/python seed.py
"""

from app import create_app, db
from app.models.user import User
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog
from datetime import datetime, timedelta, timezone
import random

app = create_app()

BUSINESSES = [
    {
        'email': 'marco@pacificplumbing.com',
        'password': 'password123',
        'name': 'Pacific Plumbing Co.',
        'business_type': 'Plumbing',
        'twilio_number': '+14155550136',
        'booking_url': 'https://pacificplumbing.com/book',
        'sms_message': "Hi! This is Pacific Plumbing. Sorry we missed your call — Marco's on a job. What's the issue and address? We'll send a quote within 15 min.",
        'plan': 'growth',
        'emergency_keywords': ['flood', 'burst', 'leak', 'emergency', 'urgent', 'no water', 'pipe broke'],
    },
    {
        'email': 'sarah@brightelectrical.com',
        'password': 'password123',
        'name': 'Bright Electrical Services',
        'business_type': 'Electrical',
        'twilio_number': '+14155550188',
        'booking_url': 'https://brightelectrical.com/book',
        'sms_message': "Hi from Bright Electrical! Missed your call — what's the issue? Reply with your address and we'll get back to you ASAP.",
        'plan': 'starter',
        'emergency_keywords': ['no power', 'outage', 'sparks', 'fire', 'emergency', 'urgent', 'breaker'],
    },
    {
        'email': 'james@coolglacierhvac.com',
        'password': 'password123',
        'name': 'Cool Glacier HVAC',
        'business_type': 'HVAC',
        'twilio_number': '+14155550209',
        'booking_url': 'https://coolglacierhvac.com/book',
        'sms_message': "Hey! Cool Glacier HVAC here. We missed your call. AC out or heating issue? Send us your address and we'll schedule you in today.",
        'plan': 'pro',
        'emergency_keywords': ['no heat', 'no ac', 'furnace', 'emergency', 'frozen', 'broken', 'stuck'],
    },
]

CALLERS = [
    ('+14155550117', 'Jenna Holcomb'),
    ('+14155550188', 'Devon Park'),
    ('+15105550143', 'Mariela Ortiz'),
    ('+16285550199', None),
    ('+14155550162', 'Hassan Patel'),
    ('+16505550124', 'Greta Lindqvist'),
    ('+14085550177', 'Carlos Mendez'),
    ('+14155550231', 'Priya Nair'),
    ('+14155550098', 'Tom Fitzgerald'),
    ('+15105550312', 'Amy Chen'),
    ('+16505550441', 'Bob Turner'),
    ('+14155550555', 'Lily Wang'),
]

STATUSES = ['missed', 'missed', 'missed', 'answered', 'missed', 'voicemail']

SMS_MESSAGES = [
    "Hi! Sorry we missed your call. We'll text you right back. Reply with your issue and address.",
    "Thanks for calling! We're on a job right now. Can you describe the issue and drop your address?",
    "Got your missed call — what's going on? Send us the address and we'll schedule you in.",
    "Hey! Missed your call. What's the issue? We'll get back to you with a quote within 15 min.",
    "Hi there! We missed you. What's the problem and what's your address? We can be there today.",
]


def seed():
    with app.app_context():
        db.create_all()

        if CallLog.query.count() > 0:
            print("Call logs already seeded. Skipping.")
            return

        now = datetime.now(timezone.utc)
        created_businesses = []

        for bd in BUSINESSES:
            user = User(email=bd['email'])
            user.set_password(bd['password'])
            db.session.add(user)
            db.session.flush()

            hours = {
                day: {'open': '08:00', 'close': '18:00', 'enabled': i < 5}
                for i, day in enumerate(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
            }
            biz = Business(
                user_id=user.id,
                name=bd['name'],
                business_type=bd['business_type'],
                twilio_number=bd['twilio_number'],
                booking_url=bd['booking_url'],
                sms_message=bd['sms_message'],
                plan=bd['plan'],
                emergency_keywords=bd['emergency_keywords'],
                business_hours=hours,
            )
            db.session.add(biz)
            db.session.flush()
            created_businesses.append(biz)
            print(f"  Created business: {biz.name} (user: {user.email})")

        # ── 20 call logs spread across businesses and last 14 days ──
        call_logs = []
        for i in range(20):
            biz = created_businesses[i % len(created_businesses)]
            caller_num, caller_name = CALLERS[i % len(CALLERS)]
            status = random.choice(STATUSES)
            is_emg = random.random() < 0.15
            age_hours = random.uniform(0, 14 * 24)
            ts = now - timedelta(hours=age_hours)
            dur = random.randint(0, 120) if status != 'missed' else random.randint(0, 30)
            cl = CallLog(
                business_id=biz.id,
                caller_number=caller_num,
                caller_name=caller_name,
                call_status=status,
                duration_seconds=dur,
                emergency=is_emg,
                created_at=ts,
            )
            db.session.add(cl)
            db.session.flush()
            call_logs.append(cl)

        print(f"  Created {len(call_logs)} call logs")

        # ── 15 sms logs (only for missed calls) ──
        missed_logs = [c for c in call_logs if c.call_status == 'missed']
        sms_count = 0
        for cl in missed_logs[:15]:
            msg = random.choice(SMS_MESSAGES)
            sms = SmsLog(
                call_log_id=cl.id,
                message=msg,
                status='sent',
                twilio_sid=f'SM{cl.id:032x}',
                created_at=cl.created_at + timedelta(seconds=random.randint(8, 15)),
            )
            db.session.add(sms)
            sms_count += 1

        db.session.commit()
        print(f"  Created {sms_count} SMS logs")
        print("\nSeed complete!")
        print("\nTest logins:")
        for bd in BUSINESSES:
            print(f"  {bd['email']} / {bd['password']}")


if __name__ == '__main__':
    seed()
