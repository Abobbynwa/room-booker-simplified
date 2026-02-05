import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db_core import init_db
from app.routes import contact, booking, admin

app = FastAPI(title="Room Booker API")

origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(contact.router)
app.include_router(booking.router)
app.include_router(admin.router)
