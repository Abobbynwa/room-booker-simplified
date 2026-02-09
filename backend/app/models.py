from sqlmodel import SQLModel, Field
from datetime import datetime, date
from typing import Optional

class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    reference_number: str
    name: str
    email: str
    phone: Optional[str] = None
    room_type: str
    check_in: date
    check_out: date
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    password_hash: str

# ERP entities
class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    room_type: str
    price: float
    capacity: int
    amenities: Optional[str] = None  # comma-separated list
    image_url: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    bank_name: str
    account_name: str
    account_number: str
    instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingMeta(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int
    status: str = "pending"
    payment_status: str = "unpaid"
    payment_proof: Optional[str] = None  # base64 or URL
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StaffMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: str
    role: str
    staff_code: Optional[str] = None
    department: Optional[str] = None
    gender: Optional[str] = None
    house_resident: bool = False
    state_of_origin: Optional[str] = None
    town: Optional[str] = None
    next_of_kin_name: Optional[str] = None
    next_of_kin_phone: Optional[str] = None
    address: Optional[str] = None
    shift: Optional[str] = None
    account_details: Optional[str] = None
    status: str = "active"
    salary: float = 0
    hired_at: Optional[date] = None
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StaffDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    staff_id: int
    name: str
    url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class GuestProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    guest_name: str
    email: str
    phone: str
    preferences: Optional[str] = None  # comma-separated
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GuestReceipt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    guest_id: int
    name: str
    data_url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class CheckInRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int
    guest_name: str
    room_id: str
    room_number: str
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    status: str = "expected"
    notes: Optional[str] = None

class HousekeepingTask(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: str
    room_number: str
    task_type: str
    status: str
    priority: str
    assigned_to: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class FloorPlanItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: str
    room_number: str
    x: float
    y: float
    width: float
    height: float
    floor: str = "1"

class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    category: str = "general"  # kitchen | bar | general
    quantity: float = 0
    unit: str = "pcs"
    status: str = "available"  # available | low | out
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    message: str
    audience: str = "staff"  # staff | public | all
    is_active: bool = True
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
