"""
Progress tracking endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/{learner_id}")
async def get_progress(learner_id: str):
    """Get progress for learner"""
    return {
        "message": f"Get progress for learner {learner_id} - Coming soon"
    }


@router.post("/{learner_id}")
async def record_progress(learner_id: str):
    """Record progress for learner"""
    return {
        "message": f"Record progress for learner {learner_id} - Coming soon"
    }
