from dotenv import load_dotenv
import os

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")

def send_sms(to: str, body: str):
    """Send SMS via Twilio. Returns status dict."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM:
        return {"status": "SMS skipped (missing credentials)"}
    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        msg = client.messages.create(to=to, from_=TWILIO_FROM, body=body)
        return {"status": "SMS sent", "sid": msg.sid}
    except Exception as e:
        return {"status": "SMS failed", "error": str(e)}
