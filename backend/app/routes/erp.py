from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from ..db_core import get_session
from ..models import (
    AdminUser,
    StaffMember,
    GuestProfile,
    GuestReceipt,
    CheckInRecord,
    HousekeepingTask,
    FloorPlanItem,
    Room,
    Booking,
    BookingMeta,
    PaymentAccount,
)
from ..schemas import (
    ERPLogin,
    ERPUserResponse,
    StaffCreate,
    StaffUpdate,
    GuestProfileCreate,
    GuestProfileUpdate,
    GuestReceiptCreate,
    CheckInCreate,
    CheckInUpdate,
    HousekeepingCreate,
    HousekeepingUpdate,
    FloorPlanItemCreate,
    FloorPlanItemUpdate,
    BookingStatusUpdate,
    PaymentProofUpdate,
)
from ..utils.security import verify_password, create_access_token, decode_access_token, hash_password

router = APIRouter(prefix="/api/erp", tags=["ERP"])


def _get_current_erp_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        decoded = decode_access_token(token)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _require_admin(user: dict):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")


@router.post("/login")
def erp_login(payload: ERPLogin, session: Session = Depends(get_session)):
    # Check admin users first
    admin = session.exec(select(AdminUser).where(AdminUser.email == payload.email)).first()
    if admin and verify_password(payload.password, admin.password_hash):
        token = create_access_token({"sub": admin.email, "role": "admin", "name": admin.email})
        return {"access_token": token, "user": {"email": admin.email, "role": "admin", "name": admin.email}}

    staff = session.exec(select(StaffMember).where(StaffMember.email == payload.email)).first()
    if not staff or not staff.password_hash or not verify_password(payload.password, staff.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    role = (staff.role or "employee").lower()
    token = create_access_token({"sub": staff.email, "role": role, "name": staff.name})
    return {"access_token": token, "user": {"email": staff.email, "role": role, "name": staff.name}}


@router.get("/me")
def erp_me(user: dict = Depends(_get_current_erp_user)):
    return {"email": user.get("sub"), "role": user.get("role"), "name": user.get("name")}


# Rooms
@router.get("/rooms")
def list_rooms(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(Room)).all()


@router.put("/rooms/{room_id}")
def update_room(room_id: int, payload: dict, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for key, value in payload.items():
        if hasattr(room, key):
            setattr(room, key, value)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


# Bookings
@router.get("/bookings")
def list_bookings(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
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


@router.post("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    user: dict = Depends(_get_current_erp_user),
    session: Session = Depends(get_session),
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
def update_booking_proof(
    booking_id: int,
    payload: PaymentProofUpdate,
    user: dict = Depends(_get_current_erp_user),
    session: Session = Depends(get_session),
):
    meta = session.exec(select(BookingMeta).where(BookingMeta.booking_id == booking_id)).first()
    if not meta:
        meta = BookingMeta(booking_id=booking_id)
    meta.payment_proof = payload.payment_proof
    session.add(meta)
    session.commit()
    session.refresh(meta)
    return {"message": "Payment proof updated"}


# Reports
@router.get("/reports/summary")
def report_summary(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    bookings = session.exec(select(Booking)).all()
    rooms = session.exec(select(Room)).all()

    rooms_count = len(rooms)
    days = 30

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
        total_bookings += 1
        nights = max((b.check_out - b.check_in).days, 0)
        booked_nights += nights
        estimated_revenue += nights * price_map.get(b.room_type, 0)

    occupancy_rate = 0.0
    if rooms_count > 0:
        occupancy_rate = booked_nights / float(rooms_count * days)

    return {
        "total_bookings": total_bookings,
        "rooms_count": rooms_count,
        "booked_nights": booked_nights,
        "occupancy_rate": occupancy_rate,
        "estimated_revenue": round(estimated_revenue, 2),
    }


@router.get("/payment-accounts")
def list_payment_accounts(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(PaymentAccount)).all()


# Staff
@router.get("/staff")
def list_staff(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    _require_admin(user)
    return session.exec(select(StaffMember)).all()


@router.post("/staff")
def create_staff(payload: StaffCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    _require_admin(user)
    data = payload.model_dump()
    password = data.pop("password", None)
    staff = StaffMember(**data)
    if password:
        staff.password_hash = hash_password(password)
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff


@router.put("/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffUpdate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    _require_admin(user)
    staff = session.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    for key, value in data.items():
        setattr(staff, key, value)
    if password:
        staff.password_hash = hash_password(password)
    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff


@router.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    _require_admin(user)
    staff = session.get(StaffMember, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    session.delete(staff)
    session.commit()
    return {"message": "Staff deleted"}


# Guests + receipts
@router.get("/guests")
def list_guests(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(GuestProfile)).all()


@router.post("/guests")
def create_guest(payload: GuestProfileCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    guest = GuestProfile(**payload.model_dump())
    session.add(guest)
    session.commit()
    session.refresh(guest)
    return guest


@router.put("/guests/{guest_id}")
def update_guest(guest_id: int, payload: GuestProfileUpdate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    guest = session.get(GuestProfile, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(guest, key, value)
    session.add(guest)
    session.commit()
    session.refresh(guest)
    return guest


@router.delete("/guests/{guest_id}")
def delete_guest(guest_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    guest = session.get(GuestProfile, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    session.delete(guest)
    session.commit()
    return {"message": "Guest deleted"}


@router.post("/guests/{guest_id}/receipts")
def add_receipt(guest_id: int, payload: GuestReceiptCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    receipt = GuestReceipt(guest_id=guest_id, **payload.model_dump())
    session.add(receipt)
    session.commit()
    session.refresh(receipt)
    return receipt


@router.get("/guests/{guest_id}/receipts")
def list_receipts(guest_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(GuestReceipt).where(GuestReceipt.guest_id == guest_id)).all()


@router.delete("/guests/{guest_id}/receipts/{receipt_id}")
def delete_receipt(guest_id: int, receipt_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    receipt = session.get(GuestReceipt, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    session.delete(receipt)
    session.commit()
    return {"message": "Receipt deleted"}


# Check-in/out
@router.get("/checkins")
def list_checkins(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(CheckInRecord)).all()


@router.post("/checkins")
def create_checkin(payload: CheckInCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    record = CheckInRecord(**payload.model_dump())
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.put("/checkins/{checkin_id}")
def update_checkin(checkin_id: int, payload: CheckInUpdate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    record = session.get(CheckInRecord, checkin_id)
    if not record:
        raise HTTPException(status_code=404, detail="Check-in record not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    if payload.status == "checked_in" and not record.checked_in_at:
        record.checked_in_at = datetime.utcnow()
    if payload.status == "checked_out" and not record.checked_out_at:
        record.checked_out_at = datetime.utcnow()
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


# Housekeeping
@router.get("/housekeeping")
def list_housekeeping(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(HousekeepingTask)).all()


@router.post("/housekeeping")
def create_housekeeping(payload: HousekeepingCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    task = HousekeepingTask(**payload.model_dump())
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.put("/housekeeping/{task_id}")
def update_housekeeping(task_id: int, payload: HousekeepingUpdate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    task = session.get(HousekeepingTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    if payload.status == "completed" and not task.completed_at:
        task.completed_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/housekeeping/{task_id}")
def delete_housekeeping(task_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    task = session.get(HousekeepingTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"message": "Task deleted"}


# Floor plan
@router.get("/floorplan")
def list_floorplan(user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    return session.exec(select(FloorPlanItem)).all()


@router.post("/floorplan")
def create_floorplan_item(payload: FloorPlanItemCreate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    item = FloorPlanItem(**payload.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/floorplan/{item_id}")
def update_floorplan_item(item_id: int, payload: FloorPlanItemUpdate, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    item = session.get(FloorPlanItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Floor plan item not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/floorplan/{item_id}")
def delete_floorplan_item(item_id: int, user: dict = Depends(_get_current_erp_user), session: Session = Depends(get_session)):
    item = session.get(FloorPlanItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Floor plan item not found")
    session.delete(item)
    session.commit()
    return {"message": "Floor plan item deleted"}
