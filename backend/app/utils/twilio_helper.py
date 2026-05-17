import os
from twilio.rest import Client


def get_twilio_client() -> Client:
    sid = os.getenv('TWILIO_ACCOUNT_SID')
    token = os.getenv('TWILIO_AUTH_TOKEN')
    if not sid or not token:
        raise RuntimeError('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env')
    return Client(sid, token)
