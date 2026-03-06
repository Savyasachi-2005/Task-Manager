"""Authentication service – register and login business logic."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.utils.jwt_handler import create_access_token
from app.utils.password_hash import hash_password, verify_password


def register_user(payload: UserRegisterRequest, db: Session) -> UserResponse:
    """
    Create a new user account.

    Raises HTTP 409 if the email is already taken.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        # Role defaults to "user" via the model column default
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user  # type: ignore[return-value]


def login_user(payload: UserLoginRequest, db: Session) -> TokenResponse:
    """
    Verify credentials and return a JWT access token.

    Uses a constant-time comparison (via bcrypt) to prevent timing attacks.
    Raises a generic HTTP 401 to avoid leaking whether the email exists.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Intentionally vague error message (no email enumeration)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"user_id": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)
