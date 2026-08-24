# app/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
import logging

# Load .env variables
load_dotenv()

# Default to SQLite for local testing; change to PostgreSQL when ready
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./roomdb.sqlite")
# Render and some managed Postgres providers still expose the old scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=os.getenv("SQL_ECHO", "false").lower() == "true", connect_args=connect_args)


def init_db():
    """Create all tables defined in SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def check_db_connection():
    """Raise when the configured database cannot be reached."""
    with engine.connect() as connection:
        connection.exec_driver_sql("SELECT 1")


def get_session():
    """Yield a database session for FastAPI dependency injection."""
    with Session(engine) as session:
        yield session
