# app/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Default to SQLite for local testing; change to PostgreSQL when ready
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./roomdb.sqlite")

# Create the SQLModel engine
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Create all tables defined in SQLModel metadata."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Yield a database session for FastAPI dependency injection."""
    with Session(engine) as session:
        yield session
