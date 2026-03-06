"""Pydantic schemas for Task-related requests and responses."""
import math
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request payloads
# ---------------------------------------------------------------------------

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["Finish the report"])
    description: Optional[str] = Field(
        None, max_length=1000, examples=["Draft the Q1 financial report"]
    )


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


# ---------------------------------------------------------------------------
# Response payloads
# ---------------------------------------------------------------------------

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedTasksResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
