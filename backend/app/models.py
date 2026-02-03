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
