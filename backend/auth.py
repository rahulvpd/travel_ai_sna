from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from security import decode_access_token, verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
import models
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
ACCESS_TOKEN_EXPIRE_DAYS = 7

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
