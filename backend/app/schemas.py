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
