from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db_core import get_session
from ..models import Booking
from ..schemas import BookingCreate

router = APIRouter(prefix="/api/booking", tags=["Booking"])

@router.post("/")
def submit_booking(booking: BookingCreate, session: Session = Depends(get_session)):
    b = Booking(**booking.dict())
    session.add(b)
    session.commit()
    session.refresh(b)
    return {"message": "Booking submitted successfully"}
