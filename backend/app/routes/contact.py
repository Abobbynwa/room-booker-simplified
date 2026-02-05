from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from ..db_core import get_session
from ..models import ContactMessage
from ..schemas import ContactCreate
from ..utils.email import send_email
import os

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("/")
def submit_contact(
    contact: ContactCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    msg = ContactMessage(**contact.dict())
    session.add(msg)
    session.commit()
    session.refresh(msg)

    admin_email = os.getenv("ADMIN_ALERT_EMAIL")
    if admin_email:
        subject = "New Contact Message"
        body = (
            f"<p><strong>Name:</strong> {contact.name}</p>"
            f"<p><strong>Email:</strong> {contact.email}</p>"
            f"<p><strong>Message:</strong> {contact.message}</p>"
        )
        background_tasks.add_task(send_email, admin_email, subject, body)

    return {"message": "Contact form submitted successfully"}
