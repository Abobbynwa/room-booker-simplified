from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from ..db_core import get_session
from ..models import Booking
from ..schemas import BookingCreate
from ..utils.email import send_email
import os

router = APIRouter(prefix="/api/booking", tags=["Booking"])

@router.post("/")
def submit_booking(
    booking: BookingCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    b = Booking(**booking.dict())
    session.add(b)
    session.commit()
    session.refresh(b)

    admin_email = os.getenv("ADMIN_ALERT_EMAIL")
    if admin_email:
        subject = "New Booking Received"
        body = (
            f"<p><strong>Name:</strong> {booking.name}</p>"
            f"<p><strong>Email:</strong> {booking.email}</p>"
            f"<p><strong>Room Type:</strong> {booking.room_type}</p>"
            f"<p><strong>Check In:</strong> {booking.check_in}</p>"
            f"<p><strong>Check Out:</strong> {booking.check_out}</p>"
        )
        background_tasks.add_task(send_email, admin_email, subject, body)

    return {"message": "Booking submitted successfully"}
