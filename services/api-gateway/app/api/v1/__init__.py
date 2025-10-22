"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1 import auth  # pylint: disable=import-error
from app.api.v1.endpoints import (  # pylint: disable=import-error
    health,
    users,
    learners,
    iep,
    brain,
    homework,
    progress,
    sensory,
    regulation,
    analytics,
)

api_router = APIRouter()

# Include authentication router (no prefix, already has /auth)
api_router.include_router(auth.router)

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(
    learners.router, prefix="/learners", tags=["learners"]
)
api_router.include_router(iep.router, prefix="/iep", tags=["iep"])
api_router.include_router(brain.router, prefix="/brain", tags=["brain"])
api_router.include_router(
    homework.router, prefix="/homework", tags=["homework"]
)
api_router.include_router(
    progress.router, prefix="/progress", tags=["progress"]
)
api_router.include_router(
    sensory.router, prefix="/sensory", tags=["sensory"]
)
api_router.include_router(
    regulation.router, prefix="/regulation", tags=["regulation"]
)
api_router.include_router(
    analytics.router, prefix="/analytics", tags=["analytics"]
)
