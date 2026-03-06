# Import all models here so SQLAlchemy's metadata discovers them
# before Base.metadata.create_all() is called in main.py
from app.models.user import User  # noqa: F401
from app.models.task import Task  # noqa: F401
