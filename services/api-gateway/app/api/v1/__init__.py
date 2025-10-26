"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1 import auth  # pylint: disable=import-error
from app.api.v1 import admin  # pylint: disable=import-error
from app.api.v1 import ai  # pylint: disable=import-error
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
    assessments,
    notifications,
)
from app.routers import model_cloning  # pylint: disable=import-error
from app.routers import baseline_assessment  # pylint: disable=import-error

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
api_router.include_router(
    assessments.router, prefix="/assessments", tags=["assessments"]
)
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["notifications"]
)

# AI/ML routes (brain cloning, model management)
api_router.include_router(ai.router, prefix="/ai")

# Model cloning routes (explainable AI personalization)
api_router.include_router(
    model_cloning.router,
    prefix="/model-cloning",
    tags=["model-cloning"]
)

# Baseline assessment routes (adaptive IRT-based testing)
api_router.include_router(baseline_assessment.router)

# Admin routes (requires admin role)
api_router.include_router(admin.router)
