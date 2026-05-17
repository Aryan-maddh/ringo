from datetime import datetime, timezone
from app import db


class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='active')
    message_template = db.Column(db.Text, nullable=False)
    delay_hours = db.Column(db.Integer, default=24)
    trigger = db.Column(db.String(50), default='missed_call')
    sent_count = db.Column(db.Integer, default=0)
    replied_count = db.Column(db.Integer, default=0)
    booked_count = db.Column(db.Integer, default=0)
    last_sent_at = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'business_id': self.business_id,
            'name': self.name,
            'status': self.status,
            'message_template': self.message_template,
            'delay_hours': self.delay_hours,
            'trigger': self.trigger,
            'sent': self.sent_count,
            'replied': self.replied_count,
            'booked': self.booked_count,
            'last_sent': self.last_sent_at.isoformat() if self.last_sent_at else None,
            'created_at': self.created_at.isoformat(),
        }
