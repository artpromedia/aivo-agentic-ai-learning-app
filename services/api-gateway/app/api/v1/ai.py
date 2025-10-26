"""
AI/ML endpoints for model management
"""
from fastapi import APIRouter
from app.api.v1.endpoints import brain

router = APIRouter()

# Include brain cloning endpoints under /ai
router.include_router(brain.router, tags=["ai"])
