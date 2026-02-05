from fastapi import APIRouter, Depends, HTTPException, Header
import os
from sqlmodel import Session, select
from ..db_core import get_session, engine, init_db
from ..models import AdminUser, Booking, ContactMessage, Room, PaymentAccount, BookingMeta
from ..schemas import (
    AdminLogin,
    AdminChangePassword,
    RoomCreate,
    RoomUpdate,
    PaymentAccountCreate,
    PaymentAccountUpdate,
    BookingStatusUpdate,
    PaymentProofUpdate,
)
from ..utils.security import verify_password, create_access_token, decode_access_token, hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/login")
def admin_login(credentials: AdminLogin, session: Session = Depends(get_session)):
    admin = session.exec(select(AdminUser).where(AdminUser.email == credentials.email)).first()
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": admin.email})
    return {"access_token": token, "token_type": "bearer"}

def get_current_admin(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        decoded = decode_access_token(token)
        return decoded["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/init")
def init_admin(credentials: AdminLogin, session: Session = Depends(get_session)):
    """Create the first admin user only if no admins exist.

    This endpoint is intentionally one-time: it will fail with 403
    once any `AdminUser` exists in the database.
    """
    existing_any = session.exec(select(AdminUser)).first()
    if existing_any:
        raise HTTPException(status_code=403, detail="Admin already initialized")

    hashed_pw = hash_password(credentials.password)
    new_admin = AdminUser(email=credentials.email, password_hash=hashed_pw)
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    return {"message": f"Admin created for {new_admin.email}"}



@router.get("/bookings")
def get_bookings(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    bookings = session.exec(select(Booking)).all()
    metas = session.exec(select(BookingMeta)).all()
    meta_map = {m.booking_id: m for m in metas}
    enriched = []
    for b in bookings:
        meta = meta_map.get(b.id)
        enriched.append({
            "id": b.id,
            "name": b.name,
            "email": b.email,
            "room_type": b.room_type,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "created_at": b.created_at,
            "status": meta.status if meta else "pending",
            "payment_status": meta.payment_status if meta else "unpaid",
            "payment_proof": meta.payment_proof if meta else None,
        })
    return enriched

@router.get("/messages")
def get_messages(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    return session.exec(select(ContactMessage)).all()

# Rooms management
@router.get("/rooms")
def list_rooms(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    return session.exec(select(Room)).all()

@router.post("/rooms")
def create_room(payload: RoomCreate, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    room = Room(**payload.model_dump())
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

@router.put("/rooms/{room_id}")
def update_room(room_id: int, payload: RoomUpdate, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

@router.delete("/rooms/{room_id}")
def delete_room(room_id: int, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    session.delete(room)
    session.commit()
    return {"message": "Room deleted"}

# Payment accounts management
@router.get("/payment-accounts")
def list_payment_accounts(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    return session.exec(select(PaymentAccount)).all()

@router.post("/payment-accounts")
def create_payment_account(
    payload: PaymentAccountCreate,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    account = PaymentAccount(**payload.model_dump())
    session.add(account)
    session.commit()
    session.refresh(account)
    return account

@router.put("/payment-accounts/{account_id}")
def update_payment_account(
    account_id: int,
    payload: PaymentAccountUpdate,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    account = session.get(PaymentAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account

@router.delete("/payment-accounts/{account_id}")
def delete_payment_account(
    account_id: int,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    account = session.get(PaymentAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    session.delete(account)
    session.commit()
    return {"message": "Account deleted"}

# Booking status updates + payment proof
@router.post("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    meta = session.exec(select(BookingMeta).where(BookingMeta.booking_id == booking_id)).first()
    if not meta:
        meta = BookingMeta(booking_id=booking_id)
    meta.status = payload.status
    if payload.payment_status:
        meta.payment_status = payload.payment_status
    session.add(meta)
    session.commit()
    session.refresh(meta)
    return {"message": "Booking status updated"}

@router.post("/bookings/{booking_id}/payment-proof")
def update_payment_proof(
    booking_id: int,
    payload: PaymentProofUpdate,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    meta = session.exec(select(BookingMeta).where(BookingMeta.booking_id == booking_id)).first()
    if not meta:
        meta = BookingMeta(booking_id=booking_id)
    meta.payment_proof = payload.payment_proof
    session.add(meta)
    session.commit()
    session.refresh(meta)
    return {"message": "Payment proof updated"}

@router.post("/change-password")
def change_password(
    payload: AdminChangePassword,
    session: Session = Depends(get_session),
    admin_email: str = Depends(get_current_admin),
):
    admin = session.exec(select(AdminUser).where(AdminUser.email == admin_email)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    admin.password_hash = hash_password(payload.new_password)
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return {"message": "Password updated successfully"}

# Temporary password reset endpoint (remove after use).
@router.post("/reset-password")
def reset_password(
    credentials: AdminLogin,
    session: Session = Depends(get_session),
    x_admin_reset_token: str = Header(None),
):
    expected = os.getenv("ADMIN_RESET_TOKEN")
    if not expected:
        raise HTTPException(status_code=403, detail="Password reset disabled")
    if not x_admin_reset_token or x_admin_reset_token != expected:
        raise HTTPException(status_code=401, detail="Invalid reset token")

    admin = session.exec(select(AdminUser).where(AdminUser.email == credentials.email)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    admin.password_hash = hash_password(credentials.password)
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return {"message": f"Password reset for {admin.email}"}
