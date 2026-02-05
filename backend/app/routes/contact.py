from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db_core import get_session
from ..models import ContactMessage
from ..schemas import ContactCreate

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("/")
def submit_contact(contact: ContactCreate, session: Session = Depends(get_session)):
    msg = ContactMessage(**contact.dict())
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return {"message": "Contact form submitted successfully"}
