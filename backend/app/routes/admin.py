from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from ..db_core import get_session, engine, init_db
from ..models import AdminUser, Booking, ContactMessage
from ..schemas import AdminLogin, AdminChangePassword
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
    return session.exec(select(Booking)).all()

@router.get("/messages")
def get_messages(session: Session = Depends(get_session), admin=Depends(get_current_admin)):
    return session.exec(select(ContactMessage)).all()

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
