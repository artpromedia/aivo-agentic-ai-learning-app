"""
IEP (Individualized Education Program) endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/{learner_id}")
async def get_iep(learner_id: str):
    """Get IEP for learner"""
    return {"message": f"Get IEP for learner {learner_id} - Coming soon"}


@router.post("/{learner_id}")
async def create_iep(learner_id: str):
    """Create IEP for learner"""
    return {"message": f"Create IEP for learner {learner_id} - Coming soon"}


@router.put("/{learner_id}")
async def update_iep(learner_id: str):
    """Update IEP for learner"""
    return {"message": f"Update IEP for learner {learner_id} - Coming soon"}
