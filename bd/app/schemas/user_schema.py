"""Pydantic schemas for User-related requests and responses."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Request payloads
# ---------------------------------------------------------------------------

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=6, examples=["s3cur3P@ss"])


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., examples=["s3cur3P@ss"])


# ---------------------------------------------------------------------------
# Response payloads
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: Literal["user", "admin"]
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
