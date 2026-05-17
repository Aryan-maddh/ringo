from datetime import datetime, timezone
from app import db


class CallLog(db.Model):
    __tablename__ = 'call_logs'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False, index=True)
    caller_number = db.Column(db.String(20), nullable=False)
    caller_name = db.Column(db.String(255))
    call_status = db.Column(db.String(50))
    duration_seconds = db.Column(db.Integer, default=0)
    emergency = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sms_logs = db.relationship('SmsLog', backref='call', lazy=True, cascade='all, delete-orphan')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'business_id': self.business_id,
            'caller_number': self.caller_number,
            'caller_name': self.caller_name,
            'call_status': self.call_status,
            'duration_seconds': self.duration_seconds or 0,
            'emergency': self.emergency,
            'created_at': self.created_at.isoformat(),
        }
