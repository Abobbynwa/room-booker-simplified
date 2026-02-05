from pydantic import BaseModel
from datetime import date

class BookingCreate(BaseModel):
    name: str
    email: str
    room_type: str
    check_in: date
    check_out: date

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
