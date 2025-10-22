"""API endpoints for brain adaptation."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.core.brain_manager import BrainManager
from app.models.brain_instance import AdaptationRequest

router = APIRouter(tags=["adapt"])

# Initialize brain manager
brain_manager = BrainManager()


@router.post("/brain", response_model=Dict[str, Any])
async def adapt_brain(adaptation_request: AdaptationRequest) -> Dict[str, Any]:
    """Adapt a brain instance based on recent learning outcomes."""
    try:
        brain = brain_manager.adapt_brain(
            adaptation_request.brain_id,
            adaptation_request.recent_outcomes
        )

        return {
            "brain_id": brain.brain_id,
            "status": brain.status.value,
            "preferred_complexity": (
                brain.learning_profile.preferred_complexity
            ),
            "adaptations_made": brain.metrics.adaptations_made,
            "success_rate": brain.metrics.hint_success_rate,
            "message": "Brain adapted successfully"
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/record-interaction/{brain_id}", response_model=Dict[str, Any])
async def record_interaction(
    brain_id: str,
    success: bool,
    complexity_used: str,
    tokens: int,
    response_time_ms: float
) -> Dict[str, Any]:
    """Record an interaction outcome for a brain instance."""
    try:
        brain = brain_manager._get_brain_by_id(brain_id)
        if not brain:
            raise HTTPException(status_code=404, detail="Brain not found")

        brain.record_interaction(
            success=success,
            complexity_used=complexity_used,
            tokens=tokens,
            response_time_ms=response_time_ms
        )

        brain_manager._cache_brain(brain)

        return {
            "brain_id": brain.brain_id,
            "total_interactions": brain.metrics.total_interactions,
            "success_rate": brain.metrics.hint_success_rate,
            "message": "Interaction recorded"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
