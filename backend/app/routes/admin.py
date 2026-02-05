from fastapi import APIRouter, Depends, HTTPException, Header
import os
import os
from sqlmodel import Session, select
from ..db_core import get_session, engine, init_db
from ..models import AdminUser, Booking, ContactMessage, Room, PaymentAccount, BookingMeta, StaffMember
from ..schemas import (
    AdminLogin,
    AdminChangePassword,
    RoomCreate,
    RoomUpdate,
    PaymentAccountCreate,
    PaymentAccountUpdate,
    BookingStatusUpdate,
    PaymentProofUpdate,
    StaffCreate,
    StaffUpdate,
)
from datetime import date, timedelta
from typing import Optional
from fastapi.responses import StreamingResponse
import csv
import io
from openpyxl import Workbook
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

# Staff management
@router.get("/staff")
def list_staff(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    return session.exec(select(StaffMember)).all()

@router.post("/staff")
def create_staff(payload: StaffCreate, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    staff = StaffMember(**payload.model_dump())
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff

@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffUpdate, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    staff = session.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(staff, key, value)
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff

@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    staff = session.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    session.delete(staff)
    session.commit()
    return {"message": "Staff deleted"}

# Reports
@router.get("/reports/summary")
def report_summary(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    session: Session = Depends(get_session),
    admin=Depends(get_current_admin),
):
    if not to_date:
        to_date = date.today()
    if not from_date:
        from_date = to_date - timedelta(days=30)

    bookings = session.exec(select(Booking)).all()
    rooms = session.exec(select(Room)).all()

    rooms_count = len(rooms)
    days = (to_date - from_date).days or 1

    # Average price per room_type
    price_map: dict[str, float] = {}
    type_counts: dict[str, int] = {}
    for r in rooms:
        price_map[r.room_type] = price_map.get(r.room_type, 0) + r.price
        type_counts[r.room_type] = type_counts.get(r.room_type, 0) + 1
    for t, total in price_map.items():
        price_map[t] = total / max(type_counts.get(t, 1), 1)

    total_bookings = 0
    booked_nights = 0
    estimated_revenue = 0.0
    for b in bookings:
        if b.check_out < from_date or b.check_in > to_date:
            continue
        total_bookings += 1
        start = max(b.check_in, from_date)
        end = min(b.check_out, to_date)
        nights = max((end - start).days, 0)
        booked_nights += nights
        estimated_revenue += nights * price_map.get(b.room_type, 0)

    occupancy_rate = 0.0
    if rooms_count > 0:
        occupancy_rate = booked_nights / float(rooms_count * days)

    return {
        "from_date": from_date,
        "to_date": to_date,
        "total_bookings": total_bookings,
        "rooms_count": rooms_count,
        "booked_nights": booked_nights,
        "occupancy_rate": occupancy_rate,
        "estimated_revenue": round(estimated_revenue, 2),
    }

def _export_rows_csv(rows: list[dict], filename: str):
    buffer = io.StringIO()
    if not rows:
        rows = [{}]
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

def _export_rows_xlsx(rows: list[dict], filename: str):
    wb = Workbook()
    ws = wb.active
    if not rows:
        rows = [{}]
    headers = list(rows[0].keys())
    ws.append(headers)
    for row in rows:
        ws.append([row.get(h) for h in headers])
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

@router.get("/reports/bookings.csv")
def export_bookings_csv(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    rows = get_bookings(session, admin)
    return _export_rows_csv(rows, "bookings.csv")

@router.get("/reports/bookings.xlsx")
def export_bookings_xlsx(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    rows = get_bookings(session, admin)
    return _export_rows_xlsx(rows, "bookings.xlsx")

@router.get("/reports/staff.csv")
def export_staff_csv(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    rows = [s.model_dump() for s in session.exec(select(StaffMember)).all()]
    return _export_rows_csv(rows, "staff.csv")

@router.get("/reports/staff.xlsx")
def export_staff_xlsx(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    rows = [s.model_dump() for s in session.exec(select(StaffMember)).all()]
    return _export_rows_xlsx(rows, "staff.xlsx")

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
