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

    token = create_access_token({"sub": staff.email, "role": "employee", "name": staff.name})
    return {"access_token": token, "user": {"email": staff.email, "role": "employee", "name": staff.name}}


@router.get("/me")
def erp_me(user: dict = Depends(_get_current_erp_user)):
    return {"email": user.get("sub"), "role": user.get("role"), "name": user.get("name")}


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
