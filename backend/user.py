"""
Travel AI Tamil Nadu — User CRUD helpers
Provides utility functions for user management against the SQLAlchemy models.
"""
from sqlalchemy.orm import Session
from models import User
from security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str):
    """Return a User record matching the given email, or None."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, password: str, full_name: str = ""):
    """Create and persist a new User record."""
    hashed = get_password_hash(password)
    user = User(email=email, hashed_password=hashed, full_name=full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user by email + password. Returns the User or None."""
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
