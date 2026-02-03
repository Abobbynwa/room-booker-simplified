from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from dotenv import load_dotenv
import os

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_TLS = True
MAIL_SSL = False

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_TLS=MAIL_TLS,
    MAIL_SSL=MAIL_SSL,
    USE_CREDENTIALS=True
)

async def send_email(to: EmailStr, subject: str, body: str):
    """Send an email via FastAPI-Mail."""
    message = MessageSchema(
        subject=subject,
        recipients=[to],
        body=body,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
    return {"status": "Email sent"}
