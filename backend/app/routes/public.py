from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime
from ..db_core import get_session
from ..models import Announcement

router = APIRouter(prefix="/api/public", tags=["Public"])

@router.get("/announcements")
def list_public_announcements(session: Session = Depends(get_session)):
    now = datetime.utcnow()
    announcements = session.exec(select(Announcement)).all()
    filtered = []
    for a in announcements:
        if not a.is_active:
            continue
        if a.expires_at and a.expires_at < now:
            continue
        if a.audience not in ("public", "all"):
            continue
        filtered.append(a)
    return filtered
