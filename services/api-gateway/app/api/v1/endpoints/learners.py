"""
Learner management endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_learners():
    """Get all learners"""
    return {"message": "Learners endpoint - Coming soon"}


@router.post("/")
async def create_learner():
    """Create new learner"""
    return {"message": "Create learner endpoint - Coming soon"}


@router.get("/{learner_id}")
async def get_learner(learner_id: str):
    """Get learner by ID"""
    return {"message": f"Get learner {learner_id} - Coming soon"}
