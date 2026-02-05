#!/usr/bin/env python3
"""Reset an admin user's password.

Usage:
  python reset_admin_password.py --email admin@example.com --password newsecret
Or interactively:
  python reset_admin_password.py --email admin@example.com
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

from sqlmodel import Session, select
from app.db_core import init_db, engine
from app.models import AdminUser
from app.utils.security import hash_password


def reset_admin_password(email: str, password: str) -> None:
    """Reset password for an existing admin user."""
    init_db()

    with Session(engine) as session:
        admin = session.exec(select(AdminUser).where(AdminUser.email == email)).first()
        if not admin:
            print(f"No admin found for '{email}'.")
            return

        admin.password_hash = hash_password(password)
        session.add(admin)
        session.commit()
        session.refresh(admin)
        print(f"Password reset for admin id={admin.id}, email={admin.email}")


def main():
    parser = argparse.ArgumentParser(description="Reset admin password for Room Booker backend")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=False, help="New admin password (will prompt if omitted)")
    args = parser.parse_args()

    email = args.email
    password = args.password
    if not password:
        password = getpass.getpass("New password: ")
        password2 = getpass.getpass("Confirm password: ")
        if password != password2:
            print("Passwords do not match. Aborting.")
            sys.exit(1)

    reset_admin_password(email, password)


if __name__ == "__main__":
    main()
