# app/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
import logging

# Load .env variables
load_dotenv()

# Default to SQLite for local testing; change to PostgreSQL when ready
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./roomdb.sqlite")

def _create_engine_with_fallback(url: str):
    """Try to create an engine for `url`. If connecting fails, fall back to a local SQLite file.

    This prevents startup crashes for development machines that don't have the
    production Postgres database available or when the credentials are placeholders.
    """
    # If the URL explicitly points to SQLite, just create that engine.
    try:
        if url.startswith("sqlite"):
            return create_engine(url, echo=True)

        # For non-SQLite DBs, try to create an engine and connect briefly.
        engine = create_engine(url, echo=True)
        try:
            # Try a short-lived connection to validate credentials/availability.
            with engine.connect() as _:
                pass
            return engine
        except Exception as conn_err:
            logging.warning(
                "Database connection failed for %s: %s. Falling back to SQLite.",
                url,
                conn_err,
            )
    except Exception as e:
        logging.warning("Failed to create engine for %s: %s", url, e)

    fallback = "sqlite:///./roomdb.sqlite"
    logging.info("Using fallback database: %s", fallback)
    return create_engine(fallback, echo=True)


# Create the SQLModel engine (with a safe fallback)
engine = _create_engine_with_fallback(DATABASE_URL)


def init_db():
    """Create all tables defined in SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Yield a database session for FastAPI dependency injection."""
    with Session(engine) as session:
        yield session
