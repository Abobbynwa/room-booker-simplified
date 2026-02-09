from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session, select
from ..db_core import get_session
from ..models import Booking, BookingMeta
from ..schemas import BookingCreate
from ..utils.email import send_email
from ..utils.sms import send_sms
import os
import random
import string

router = APIRouter(prefix="/api/booking", tags=["Booking"])

@router.post("/")
def submit_booking(
    booking: BookingCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    # generate unique reference
    ref = None
    for _ in range(5):
        candidate = "BK" + "".join(random.choices(string.digits, k=8))
        exists = session.exec(
            select(Booking).where(Booking.reference_number == candidate)
        ).first()
        if not exists:
            ref = candidate
            break
    if not ref:
        raise HTTPException(status_code=500, detail="Failed to generate reference")

    b = Booking(reference_number=ref, **booking.dict())
    session.add(b)
    session.commit()
    session.refresh(b)

    # Create metadata row for ERP status tracking
    meta = BookingMeta(booking_id=b.id)
    if booking.payment_proof:
        meta.payment_proof = booking.payment_proof
        meta.payment_status = "pending"
    session.add(meta)
    session.commit()

    admin_email = os.getenv("ADMIN_ALERT_EMAIL")
    admin_phone = os.getenv("ADMIN_ALERT_PHONE")
    if admin_email:
        subject = "New Booking Received"
        body = (
            f"<p><strong>Name:</strong> {booking.name}</p>"
            f"<p><strong>Email:</strong> {booking.email}</p>"
            f"<p><strong>Room Type:</strong> {booking.room_type}</p>"
            f"<p><strong>Check In:</strong> {booking.check_in}</p>"
            f"<p><strong>Check Out:</strong> {booking.check_out}</p>"
            f"<p><strong>Reference:</strong> {b.reference_number}</p>"
        )
        background_tasks.add_task(send_email, admin_email, subject, body)
    # guest confirmation email
    subject = "Booking received"
    status_link = os.getenv("PUBLIC_STATUS_URL", "https://room-booker-web.onrender.com/#/booking-status")
    body = (
        f"<p>Hi {booking.name},</p>"
        f"<p>Your booking has been received.</p>"
        f"<p><strong>Reference:</strong> {b.reference_number}</p>"
        f"<p>You can check your status here: <a href='{status_link}'>Check Booking Status</a></p>"
    )
    background_tasks.add_task(send_email, booking.email, subject, body)
    if admin_phone:
        sms_body = (
            f"New booking: {booking.name} ({booking.email}) "
            f"Room: {booking.room_type} {booking.check_in} to {booking.check_out}"
        )
        background_tasks.add_task(send_sms, admin_phone, sms_body)

    return {"message": "Booking submitted successfully", "reference_number": b.reference_number}


@router.get("/reference/{reference}")
def get_booking_by_reference(reference: str, session: Session = Depends(get_session)):
    booking = session.exec(select(Booking).where(Booking.reference_number == reference)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    meta = session.exec(select(BookingMeta).where(BookingMeta.booking_id == booking.id)).first()
    return {
        "id": booking.id,
        "reference_number": booking.reference_number,
        "name": booking.name,
        "email": booking.email,
        "phone": booking.phone,
        "room_type": booking.room_type,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "created_at": booking.created_at,
        "status": meta.status if meta else "pending",
        "payment_status": meta.payment_status if meta else "unpaid",
        "payment_proof": meta.payment_proof if meta else None,
    }
