"""API endpoints for brain instance management."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.core.brain_manager import BrainManager
from app.models.brain_instance import LearningProfile

router = APIRouter(tags=["brain"])

# Initialize brain manager
brain_manager = BrainManager()


@router.post("/create/{learner_id}", response_model=Dict[str, Any])
async def create_brain(
    learner_id: str,
    learning_profile: LearningProfile
) -> Dict[str, Any]:
    """Create or get a brain instance for a learner."""
    try:
        brain = brain_manager.get_or_create_brain(learner_id, learning_profile)

        return {
            "brain_id": brain.brain_id,
            "learner_id": brain.learner_id,
            "status": brain.status.value,
            "created_at": brain.created_at,
            "message": "Brain instance ready"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{learner_id}", response_model=Dict[str, Any])
async def get_brain_stats(learner_id: str) -> Dict[str, Any]:
    """Get statistics for a brain instance."""
    try:
        stats = brain_manager.get_brain_stats(learner_id)

        if not stats:
            raise HTTPException(
                status_code=404,
                detail="Brain not found for this learner"
            )

        return stats

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/{brain_id}", response_model=Dict[str, Any])
async def sync_brain(brain_id: str) -> Dict[str, Any]:
    """Sync brain adaptations to global model."""
    try:
        success = brain_manager.sync_brain(brain_id)

        if not success:
            raise HTTPException(
                status_code=400,
                detail="Failed to sync brain"
            )

        return {
            "brain_id": brain_id,
            "status": "synced",
            "message": "Brain synced successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
