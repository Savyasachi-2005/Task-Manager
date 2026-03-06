"""Task CRUD routes with JWT-protected endpoints."""
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.user import User
from app.schemas.task_schema import (
    PaginatedTasksResponse,
    TaskCreateRequest,
    TaskResponse,
    TaskUpdateRequest,
)
from app.services import task_service

router = APIRouter(prefix="/api/v1/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
def create_task(
    payload: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a task owned by the currently authenticated user."""
    return task_service.create_task(payload, current_user, db)


@router.get(
    "",
    response_model=PaginatedTasksResponse,
    summary="List tasks (paginated)",
)
def list_tasks(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a paginated list of tasks.

    - **Users** see only their own tasks.
    - **Admins** see all tasks across all users.
    """
    return task_service.get_tasks(current_user, db, page, page_size)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Retrieve a single task",
)
def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a task by its UUID. Users may only access their own tasks."""
    return task_service.get_task_by_id(task_id, current_user, db)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
)
def update_task(
    task_id: UUID,
    payload: TaskUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Partially update a task.

    Only the fields provided in the request body are updated
    (omit a field to leave it unchanged).
    """
    return task_service.update_task(task_id, payload, current_user, db)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete a task. Non-admin users may only delete their own tasks."""
    task_service.delete_task(task_id, current_user, db)
