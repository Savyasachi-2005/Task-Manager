"""Authentication routes – register and login."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user_schema import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user.

    - **name**: full name (2-100 characters)
    - **email**: unique email address
    - **password**: minimum 6 characters (stored as a bcrypt hash)
    """
    return auth_service.register_user(payload, db)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive a JWT access token",
)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Verify credentials and return a Bearer token.

    Include the returned token in subsequent requests as:
    ``Authorization: Bearer <token>``
    """
    return auth_service.login_user(payload, db)
