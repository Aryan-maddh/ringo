from datetime import datetime, timezone
from app import db


class SmsLog(db.Model):
    __tablename__ = 'sms_logs'

    id = db.Column(db.Integer, primary_key=True)
    call_log_id = db.Column(db.Integer, db.ForeignKey('call_logs.id'), nullable=False, index=True)
    message_type = db.Column(db.String(20), default='sms')
    message = db.Column(db.Text)
    status = db.Column(db.String(50))
    twilio_sid = db.Column(db.String(50))
    error = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'call_log_id': self.call_log_id,
            'message_type': self.message_type,
            'message': self.message,
            'status': self.status,
            'twilio_sid': self.twilio_sid,
            'error': self.error,
            'created_at': self.created_at.isoformat(),
        }
