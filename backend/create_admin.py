#!/usr/bin/env python3
"""Create an admin user for the app.

Usage:
  python create_admin.py --email admin@example.com --password secret
Or interactively:
  python create_admin.py --email admin@example.com
  (you will be prompted for a password)

This script runs inside the `backend` directory and uses the same
database configuration as the app (falls back to SQLite when Postgres
is not available).
"""
import sys
import os
import getpass
import argparse

# Ensure `app` package (backend/app) is importable
ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.db_core import init_db, engine
from sqlmodel import Session, select
from app.models import AdminUser
from app.utils.security import hash_password


def create_admin(email: str, password: str) -> None:
    """Create an admin user if not exists."""
    # Ensure tables exist
    init_db()

    with Session(engine) as session:
        existing = session.exec(select(AdminUser).where(AdminUser.email == email)).first()
        if existing:
            print(f"Admin with email '{email}' already exists (id={existing.id}).")
            return

        hashed = hash_password(password)
        admin = AdminUser(email=email, password_hash=hashed)
        session.add(admin)
        session.commit()
        session.refresh(admin)
        print(f"Created admin: id={admin.id}, email={admin.email}")


def main():
    parser = argparse.ArgumentParser(description="Create an admin user for Room Booker backend")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=False, help="Admin password (will prompt if omitted)")
    args = parser.parse_args()

    email = args.email
    password = args.password
    if not password:
        password = getpass.getpass("Password: ")
        password2 = getpass.getpass("Confirm password: ")
        if password != password2:
            print("Passwords do not match. Aborting.")
            sys.exit(1)

    create_admin(email, password)


if __name__ == "__main__":
    main()
