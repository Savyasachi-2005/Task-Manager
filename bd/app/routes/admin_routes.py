"""Admin-only routes with elevated privileges."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth_dependency import require_admin
from app.models.user import User
from app.schemas.task_schema import PaginatedTasksResponse
from app.services import task_service

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get(
    "/tasks",
    response_model=PaginatedTasksResponse,
    summary="[Admin] View all tasks across all users",
)
def list_all_tasks(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    **Admin-only endpoint**
    
    Returns a paginated list of ALL tasks across ALL users.
    
    - Requires `admin` role
    - Returns 403 if user is not an admin
    """
    return task_service.get_tasks(current_user, db, page, page_size)
