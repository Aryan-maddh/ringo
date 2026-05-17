from datetime import datetime, timezone
from app import db


class Business(db.Model):
    __tablename__ = 'businesses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    business_type = db.Column(db.String(100))

    # Platform-managed Twilio number (assigned from master account)
    twilio_number = db.Column(db.String(20), index=True)
    twilio_number_sid = db.Column(db.String(50))  # SID for releasing number

    # WhatsApp integration
    whatsapp_number = db.Column(db.String(20), index=True)
    whatsapp_number_sid = db.Column(db.String(50))
    auto_whatsapp_enabled = db.Column(db.Boolean, default=False, nullable=False)
    whatsapp_message = db.Column(db.Text)


    # Business contact / forwarding
    owner_phone = db.Column(db.String(20))
    timezone = db.Column(db.String(100), default='America/New_York')

    # Call behaviour
    call_forwarding_enabled = db.Column(db.Boolean, default=False, nullable=False)
    auto_sms_enabled = db.Column(db.Boolean, default=True, nullable=False)
    voice_message = db.Column(db.Text)

    # SMS content
    sms_message = db.Column(db.Text)
    booking_url = db.Column(db.String(500))
    emergency_keywords = db.Column(db.JSON)
    business_hours = db.Column(db.JSON)

    # Usage tracking
    sms_count_this_month = db.Column(db.Integer, default=0)

    # Billing
    plan = db.Column(db.String(20), default='starter', nullable=False)
    suspended = db.Column(db.Boolean, default=False, nullable=False)
    stripe_customer_id = db.Column(db.String(100))
    stripe_subscription_id = db.Column(db.String(100))

    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    call_logs = db.relationship('CallLog', backref='business', lazy=True, cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'business_type': self.business_type,
            'twilio_number': self.twilio_number,
            'twilio_number_sid': self.twilio_number_sid,
            'whatsapp_number': self.whatsapp_number,
            'whatsapp_number_sid': self.whatsapp_number_sid,
            'owner_phone': self.owner_phone,
            'timezone': self.timezone or 'America/New_York',
            'call_forwarding_enabled': bool(self.call_forwarding_enabled),
            'auto_sms_enabled': bool(self.auto_sms_enabled) if self.auto_sms_enabled is not None else True,
            'auto_whatsapp_enabled': bool(self.auto_whatsapp_enabled),
            'voice_message': self.voice_message,
            'sms_message': self.sms_message,
            'whatsapp_message': self.whatsapp_message,
            'booking_url': self.booking_url,
            'emergency_keywords': self.emergency_keywords,
            'business_hours': self.business_hours,
            'sms_count_this_month': self.sms_count_this_month or 0,
            'plan': self.plan,
            'suspended': self.suspended,
            'created_at': self.created_at.isoformat(),
        }
