"""
FastAPI dependency functions for authentication and authorization.

Usage
-----
Route dependency::

    @router.get("/protected")
    def protected(current_user: User = Depends(get_current_user)):
        ...

Admin-only route::

    @router.get("/admin-only")
    def admin_only(current_user: User = Depends(require_admin)):
        ...
"""
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.jwt_handler import decode_access_token

_bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract the bearer token from the *Authorization* header, validate it,
    and return the corresponding User ORM object.

    Raises HTTP 401 on any authentication failure.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str: str | None = payload.get("user_id")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing user_id claim.",
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: invalid user_id.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Extend *get_current_user* by additionally requiring the admin role.

    Raises HTTP 403 when the authenticated user is not an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required for this action.",
        )
    return current_user
