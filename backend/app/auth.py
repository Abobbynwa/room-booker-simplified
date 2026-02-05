from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from .db_core import get_session
from .models import AdminUser
from .schemas import AdminLogin
from .utils.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ✅ Optional route to create first admin user
@router.post("/register")
def register_admin(credentials: AdminLogin, session: Session = Depends(get_session)):
    existing_admin = session.exec(select(AdminUser).where(AdminUser.email == credentials.email)).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")

    hashed_pw = hash_password(credentials.password)
    new_admin = AdminUser(email=credentials.email, password_hash=hashed_pw)
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    return {"message": f"Admin created for {new_admin.email}"}

# ✅ Login route (returns JWT token)
@router.post("/login")
def login(credentials: AdminLogin, session: Session = Depends(get_session)):
    admin = session.exec(select(AdminUser).where(AdminUser.email == credentials.email)).first()
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": admin.email})
    return {"access_token": token, "token_type": "bearer"}

# ✅ Verify and decode JWT
def get_current_admin(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        decoded = decode_access_token(token)
        return decoded["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
