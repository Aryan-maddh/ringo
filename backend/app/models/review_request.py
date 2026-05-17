from datetime import datetime, timezone
from app import db


class ReviewRequest(db.Model):
    __tablename__ = 'review_requests'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False, index=True)
    caller_name = db.Column(db.String(255), default='Unknown caller')
    phone = db.Column(db.String(20), nullable=False)
    platform = db.Column(db.String(50), default='Google')
    status = db.Column(db.String(20), default='sent')
    rating = db.Column(db.Integer, nullable=True)
    review_url = db.Column(db.String(500))
    sent_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'business_id': self.business_id,
            'caller_name': self.caller_name,
            'phone': self.phone,
            'platform': self.platform,
            'status': self.status,
            'rating': self.rating,
            'review_url': self.review_url,
            'sent_at': self.sent_at.isoformat(),
        }
