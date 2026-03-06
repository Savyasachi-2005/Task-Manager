"""Task service – CRUD business logic with ownership enforcement."""
import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.schemas.task_schema import (
    PaginatedTasksResponse,
    TaskCreateRequest,
    TaskResponse,
    TaskUpdateRequest,
)


def _get_task_or_404(task_id: uuid.UUID, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    return task


def _assert_ownership(task: Task, current_user: User) -> None:
    """Raise HTTP 403 if a non-admin user tries to access another user's task."""
    if current_user.role != "admin" and task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this task.",
        )


# ---------------------------------------------------------------------------
# CRUD operations
# ---------------------------------------------------------------------------

def create_task(
    payload: TaskCreateRequest, current_user: User, db: Session
) -> TaskResponse:
    task = Task(
        title=payload.title,
        description=payload.description,
        user_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task  # type: ignore[return-value]


def get_tasks(
    current_user: User,
    db: Session,
    page: int = 1,
    page_size: int = 10,
) -> PaginatedTasksResponse:
    query = db.query(Task)

    # Regular users may only see their own tasks
    if current_user.role != "admin":
        query = query.filter(Task.user_id == current_user.id)

    total = query.count()
    tasks = (
        query.order_by(Task.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedTasksResponse(
        tasks=tasks,  # type: ignore[arg-type]
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


def get_task_by_id(
    task_id: uuid.UUID, current_user: User, db: Session
) -> TaskResponse:
    task = _get_task_or_404(task_id, db)
    _assert_ownership(task, current_user)
    return task  # type: ignore[return-value]


def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdateRequest,
    current_user: User,
    db: Session,
) -> TaskResponse:
    task = _get_task_or_404(task_id, db)
    _assert_ownership(task, current_user)

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description

    db.commit()
    db.refresh(task)
    return task  # type: ignore[return-value]


def delete_task(
    task_id: uuid.UUID, current_user: User, db: Session
) -> None:
    task = _get_task_or_404(task_id, db)
    _assert_ownership(task, current_user)
    db.delete(task)
    db.commit()
