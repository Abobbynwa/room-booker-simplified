from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from .db_core import init_db
from .routes import contact, booking, admin, erp

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
app.include_router(erp.router)

# Catch-all route for any unknown path/method to return 200 instead of 404.
@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
def catch_all(full_path: str):
    return JSONResponse(status_code=200, content={"status": "ok", "path": f"/{full_path}"})
