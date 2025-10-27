"""
Admin API Endpoints

Operations admin endpoints for licensing vault management,
feature flags, HITL operations, RBAC, and AI provider management.

Updated: 2025-10-26 (Copilot)
By: aivo-ai
"""

from fastapi import APIRouter

from app.api.v1.admin import (
    ai_providers,
    feature_flags,
    hitl,
    iep,
    integrations,
    licenses,
    reports,
    schools,
    settings,
    support,
    training,
    users,
)

router = APIRouter(prefix="/admin", tags=["Admin"])

# Include sub-routers
router.include_router(
    licenses.router,
    prefix="/licenses",
    tags=["Admin - Licenses"]
)
router.include_router(
    feature_flags.router,
    prefix="/feature-flags",
    tags=["Admin - Feature Flags"]
)
router.include_router(
    hitl.router,
    prefix="/hitl",
    tags=["Admin - HITL Operations"]
)
router.include_router(
    users.router,
    prefix="/users",
    tags=["Admin - User Management"]
)
router.include_router(
    schools.router,
    prefix="/schools",
    tags=["Admin - School Management"]
)
router.include_router(
    iep.router,
    prefix="/iep",
    tags=["Admin - IEP Management"]
)
router.include_router(
    training.router,
    prefix="/training",
    tags=["Admin - Professional Development"]
)
router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Admin - District Reports"]
)
router.include_router(
    settings.router,
    prefix="/settings",
    tags=["Admin - Settings"]
)
router.include_router(
    support.router,
    prefix="/support",
    tags=["Admin - Support Desk"]
)
router.include_router(
    integrations.router,
    prefix="/integrations",
    tags=["Admin - Integrations"]
)
router.include_router(
    ai_providers.router,
    prefix="/ai-providers",
    tags=["Admin - AI Providers"]
)

__all__ = ["router"]
