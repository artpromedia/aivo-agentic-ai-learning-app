"""
Admin API Endpoints

Operations admin endpoints for licensing vault management.

Updated: 2025-10-23 21:52:51 UTC
By: aivo-ai
"""

from fastapi import APIRouter
from app.api.v1.admin import licenses

router = APIRouter(prefix="/admin", tags=["Admin"])

# Include sub-routers
router.include_router(licenses.router, prefix="/licenses", tags=["Admin - Licenses"])

__all__ = ["router"]
