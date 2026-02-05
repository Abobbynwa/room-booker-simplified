from sqlmodel import SQLModel, Field
from datetime import datetime, date
from typing import Optional

class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
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
    address: Optional[str] = None
    shift: Optional[str] = None
    account_details: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
