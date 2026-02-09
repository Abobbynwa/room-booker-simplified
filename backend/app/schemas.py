from pydantic import BaseModel
from datetime import date, datetime

class BookingCreate(BaseModel):
    name: str
    email: str
    room_type: str
    check_in: date
    check_out: date
    payment_proof: str | None = None

class ContactCreate(BaseModel):
    name: str
    email: str
    message: str

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminChangePassword(BaseModel):
    current_password: str
    new_password: str

class AdminChangeEmail(BaseModel):
    current_password: str
    new_email: str

class RoomCreate(BaseModel):
    name: str
    room_type: str
    price: float
    capacity: int
    amenities: str | None = None
    image_url: str | None = None
    is_available: bool = True

class RoomUpdate(BaseModel):
    name: str | None = None
    room_type: str | None = None
    price: float | None = None
    capacity: int | None = None
    amenities: str | None = None
    image_url: str | None = None
    is_available: bool | None = None

class PaymentAccountCreate(BaseModel):
    label: str
    bank_name: str
    account_name: str
    account_number: str
    instructions: str | None = None

class PaymentAccountUpdate(BaseModel):
    label: str | None = None
    bank_name: str | None = None
    account_name: str | None = None
    account_number: str | None = None
    instructions: str | None = None

class BookingStatusUpdate(BaseModel):
    status: str
    payment_status: str | None = None

class PaymentProofUpdate(BaseModel):
    payment_proof: str

class StaffCreate(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    address: str | None = None
    shift: str | None = None
    account_details: str | None = None
    status: str = "active"
    department: str | None = None
    gender: str | None = None
    house_resident: bool = False
    state_of_origin: str | None = None
    town: str | None = None
    next_of_kin_name: str | None = None
    next_of_kin_phone: str | None = None
    salary: float | None = None
    hired_at: date | None = None
    password: str | None = None
    staff_code: str | None = None

class StaffUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None
    address: str | None = None
    shift: str | None = None
    account_details: str | None = None
    status: str | None = None
    department: str | None = None
    gender: str | None = None
    house_resident: bool | None = None
    state_of_origin: str | None = None
    town: str | None = None
    next_of_kin_name: str | None = None
    next_of_kin_phone: str | None = None
    salary: float | None = None
    hired_at: date | None = None
    password: str | None = None
    staff_code: str | None = None

class ERPLogin(BaseModel):
    email: str | None = None
    password: str | None = None
    role: str | None = None
    staff_code: str | None = None

class ERPUserResponse(BaseModel):
    email: str
    role: str
    name: str

class InventoryCreate(BaseModel):
    name: str
    category: str = "general"
    quantity: float = 0
    unit: str = "pcs"
    status: str = "available"

class InventoryUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    quantity: float | None = None
    unit: str | None = None
    status: str | None = None

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    audience: str = "staff"  # staff | public | all
    is_active: bool = True
    expires_at: datetime | None = None

class AnnouncementUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    audience: str | None = None
    is_active: bool | None = None
    expires_at: datetime | None = None

class GuestProfileCreate(BaseModel):
    guest_name: str
    email: str
    phone: str
    preferences: str | None = None
    notes: str | None = None

class GuestProfileUpdate(BaseModel):
    guest_name: str | None = None
    email: str | None = None
    phone: str | None = None
    preferences: str | None = None
    notes: str | None = None

class GuestReceiptCreate(BaseModel):
    name: str
    data_url: str

class CheckInCreate(BaseModel):
    booking_id: int
    guest_name: str
    room_id: str
    room_number: str
    checked_in_at: datetime | None = None
    checked_out_at: datetime | None = None
    status: str = "expected"
    notes: str | None = None

class CheckInUpdate(BaseModel):
    guest_name: str | None = None
    room_id: str | None = None
    room_number: str | None = None
    checked_in_at: datetime | None = None
    checked_out_at: datetime | None = None
    status: str | None = None
    notes: str | None = None

class HousekeepingCreate(BaseModel):
    room_id: str
    room_number: str
    task_type: str
    status: str
    priority: str
    assigned_to: str
    description: str

class HousekeepingUpdate(BaseModel):
    room_id: str | None = None
    room_number: str | None = None
    task_type: str | None = None
    status: str | None = None
    priority: str | None = None
    assigned_to: str | None = None
    description: str | None = None
    completed_at: datetime | None = None

class FloorPlanItemCreate(BaseModel):
    room_id: str
    room_number: str
    x: float
    y: float
    width: float
    height: float
    floor: str = "1"

class FloorPlanItemUpdate(BaseModel):
    room_id: str | None = None
    room_number: str | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None
    floor: str | None = None

class StaffDocumentCreate(BaseModel):
    name: str
    url: str
