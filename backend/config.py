"""
Production configuration for Room Booker API
Set these environment variables before deploying to production.
"""

import os
from dotenv import load_dotenv

# Load from .env file
load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./roomdb.sqlite"  # Fallback to SQLite
)

# Security
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-me-in-production"
)

# Email Configuration
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM", MAIL_USERNAME)
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_TLS = os.getenv("MAIL_TLS", "True").lower() == "true"
MAIL_SSL = os.getenv("MAIL_SSL", "False").lower() == "true"

# CORS
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"  # Development defaults
).split(",")

# API Settings
API_TITLE = "Room Booker API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "Hotel Room Booking Management System"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
