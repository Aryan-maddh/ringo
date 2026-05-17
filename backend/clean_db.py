import os
import sys

from app import create_app, db
from app.models.user import User
from app.models.business import Business
from app.models.call_log import CallLog
from app.models.sms_log import SmsLog
from app.utils.twilio_helper import get_twilio_client

app = create_app()

with app.app_context():
    # 1. Identify the real user's email
    fake_emails = ['marco@pacificplumbing.com', 'sarah@brightelectrical.com', 'james@coolglacierhvac.com']
    real_users = User.query.filter(User.email.notin_(fake_emails)).all()
    
    if not real_users:
        print("No real user found! Please register a user first.")
        sys.exit(1)
        
    real_user = real_users[-1] # take the most recently created real user
    
    # 2. Delete all other users and businesses
    users_to_delete = User.query.filter(User.id != real_user.id).all()
    for u in users_to_delete:
        db.session.delete(u)
        
    # businesses are cascading deleted or we can delete manually:
    businesses_to_delete = Business.query.filter(Business.user_id != real_user.id).all()
    for b in businesses_to_delete:
        db.session.delete(b)
        
    # 3. Wipe ALL CallLogs and SmsLogs (to make it production ready, fresh stats)
    db.session.query(SmsLog).delete()
    db.session.query(CallLog).delete()
    
    db.session.commit()
    print(f"Cleaned up fake data. Kept user: {real_user.email}")
    
    # 4. Sync Twilio number to the real user's business
    business = Business.query.filter_by(user_id=real_user.id).first()
    if not business:
        print("Real user has no business created. Creating one...")
        business = Business(user_id=real_user.id, name="My Business", plan="starter")
        db.session.add(business)
        db.session.commit()
        
    try:
        client = get_twilio_client()
        incoming_numbers = client.incoming_phone_numbers.list()
        if incoming_numbers:
            first_num = incoming_numbers[0]
            business.twilio_number = first_num.phone_number
            business.twilio_number_sid = first_num.sid
            db.session.commit()
            print(f"Successfully synced Twilio number {first_num.phone_number} to business {business.name}!")
        else:
            print("No incoming phone numbers found on the Twilio account.")
    except Exception as e:
        print(f"Failed to fetch Twilio numbers: {e}")
        
    print("Database is now production ready!")
