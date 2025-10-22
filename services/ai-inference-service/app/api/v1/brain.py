"""
Brain Instance Management Endpoints.

Features:
- Brain lifecycle management
- Adaptation tracking
- Federated learning sync
- Performance analytics
"""

from fastapi import APIRouter, HTTPException, status, Query
from datetime import datetime
import logging

from app.models.brain_instance import (
    LearningProfile,
    AdaptationRequest
)
from app.core.brain_manager import brain_manager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/create", response_model=dict)
async def create_brain_instance(
    learner_id: str,
    learning_profile: LearningProfile
):
    """
    Create new brain instance for learner.
    
    **Brain Cloning Process:**
    1. Clone base model
    2. Apply learner-specific adaptations
    3. Initialize with diagnosis-specific parameters
    4. Set up learning style preferences
    
    **Example:**
    ```json
    {
        "learner_id": "jayden_ofem",
        "learning_profile": {
            "grade_level": 6,
            "reading_level": "4th grade",
            "math_level": "5th grade",
            "learning_style": "visual",
            "diagnoses": ["ADHD", "Dyslexia"],
            "accommodations": {
                "extended_time": true,
                "read_aloud": true
            }
        }
    }
    ```
    """
    try:
        logger.info(
            f"Creating brain for learner {learner_id} "
            f"(grade: {learning_profile.grade_level}, "
            f"diagnoses: {learning_profile.diagnoses})"
        )
        
        brain = await brain_manager.get_or_create_brain(
            learner_id=learner_id,
            learning_profile=learning_profile
        )
        
        return {
            "success": True,
            "data": {
                "brain_id": brain.brain_id,
                "learner_id": brain.learner_id,
                "status": brain.status,
                "created_at": brain.created_at.isoformat(),
                "adaptation_state": brain.adaptation_state,
                "message": "Brain instance created and ready"
            }
        }
        
    except Exception as e:
        logger.error(f"Brain creation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brain creation failed: {str(e)}"
        )


@router.get("/{brain_id}", response_model=dict)
async def get_brain_instance(brain_id: str):
    """
    Get brain instance details.
    
    **Returns:**
    - Brain configuration
    - Learning profile
    - Adaptation state
    - Performance metrics
    - Recent context history
    """
    brain = brain_manager.active_brains.get(brain_id)
    
    if not brain:
        # Try loading from cache
        brain = brain_manager._get_from_cache(brain_id)
    
    if not brain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brain instance {brain_id} not found"
        )
    
    return {
        "success": True,
        "data": {
            "brain_id": brain.brain_id,
            "learner_id": brain.learner_id,
            "status": brain.status,
            "learning_profile": brain.learning_profile.model_dump(),
            "adaptation_state": brain.adaptation_state,
            "metrics": brain.metrics.model_dump(),
            "context_history_count": len(brain.context_history),
            "local_updates": brain.local_updates,
            "created_at": brain.created_at.isoformat(),
            "last_active": brain.last_active.isoformat(),
            "last_synced": brain.last_synced.isoformat()
        }
    }


@router.post("/{brain_id}/adapt")
async def adapt_brain(brain_id: str, request: AdaptationRequest):
    """
    Adapt brain based on interaction outcome.
    
    **Adaptation Triggers:**
    - Student understood hint (success) → Slightly increase complexity
    - Student confused (failure) → Decrease complexity, simplify more
    - Multiple failures → Switch strategy or approach
    
    **Feedback Loop:**
    This is how the brain learns and improves for each learner!
    
    **Example:**
    ```json
    {
        "brain_id": "brain_jayden_ofem",
        "interaction_data": {
            "hint_given": "Try breaking fraction multiplication...",
            "student_response": "success",
            "time_to_success": 180
        },
        "outcome": "success",
        "learner_feedback": "That helped!"
    }
    ```
    """
    try:
        await brain_manager.adapt_brain(
            brain_id=brain_id,
            interaction_data=request.interaction_data,
            outcome=request.outcome
        )
        
        # Get updated brain
        brain = brain_manager.active_brains.get(brain_id)
        
        logger.info(
            f"Brain {brain_id} adapted. "
            f"Outcome: {request.outcome}, "
            f"Total updates: {brain.local_updates if brain else 'unknown'}"
        )
        
        return {
            "success": True,
            "data": {
                "message": "Brain adapted successfully",
                "brain_id": brain_id,
                "outcome": request.outcome,
                "new_complexity_level": (
                    brain.adaptation_state.get("complexity_level")
                    if brain else None
                ),
                "total_adaptations": (
                    brain.local_updates if brain else None
                ),
                "hint_success_rate": (
                    brain.metrics.hint_success_rate if brain else None
                )
            }
        }
        
    except Exception as e:
        logger.error(f"Adaptation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Adaptation failed: {str(e)}"
        )


@router.post("/{brain_id}/sync")
async def sync_brain(brain_id: str):
    """
    Sync brain with federated learning server.
    
    **Federated Learning:**
    1. Upload local adaptations to server
    2. Receive global model improvements
    3. Apply updates without losing personalization
    
    **Privacy:** Only model updates are shared, not student data.
    """
    try:
        await brain_manager.sync_brain(brain_id)
        
        brain = brain_manager.active_brains.get(brain_id)
        
        logger.info(f"Brain {brain_id} synced with federated server")
        
        return {
            "success": True,
            "data": {
                "message": "Brain synced successfully",
                "brain_id": brain_id,
                "last_synced": (
                    brain.last_synced.isoformat() if brain else None
                ),
                "local_updates_uploaded": (
                    brain.local_updates if brain else 0
                )
            }
        }
        
    except Exception as e:
        logger.error(f"Sync failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )


@router.get("/{brain_id}/metrics")
async def get_brain_metrics(brain_id: str):
    """
    Get brain performance metrics and analytics.
    
    **Metrics Include:**
    - Total interactions
    - Hint success rate
    - Engagement score
    - Adaptation effectiveness
    - Response time
    """
    brain = brain_manager.active_brains.get(brain_id)
    
    if not brain:
        brain = brain_manager._get_from_cache(brain_id)
    
    if not brain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brain instance {brain_id} not found"
        )
    
    return {
        "success": True,
        "data": {
            "brain_id": brain_id,
            "metrics": {
                "total_interactions": brain.metrics.total_interactions,
                "successful_hints": brain.metrics.successful_hints,
                "hint_success_rate": round(
                    brain.metrics.hint_success_rate * 100, 1
                ),
                "average_response_time": round(
                    brain.metrics.average_response_time, 2
                ),
                "engagement_score": round(
                    brain.metrics.engagement_score, 2
                ),
                "confusion_events": brain.metrics.confusion_events,
                "adaptation_score": round(
                    brain.metrics.adaptation_score, 2
                ),
                "optimal_difficulty": round(
                    brain.adaptation_state.get("complexity_level", 0.5), 2
                )
            },
            "adaptation_state": brain.adaptation_state,
            "local_updates": brain.local_updates,
            "last_synced": brain.last_synced.isoformat(),
            "days_active": (datetime.utcnow() - brain.created_at).days
        }
    }


@router.get("/{brain_id}/history")
async def get_interaction_history(
    brain_id: str,
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get recent interaction history for brain.
    
    **Use Cases:**
    - Debug why hints aren't working
    - Review learning progress
    - Analyze adaptation patterns
    """
    brain = brain_manager.active_brains.get(brain_id)
    
    if not brain:
        brain = brain_manager._get_from_cache(brain_id)
    
    if not brain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brain instance {brain_id} not found"
        )
    
    # Get last N interactions
    history = (
        brain.context_history[-limit:]
        if brain.context_history else []
    )
    
    return {
        "success": True,
        "data": {
            "brain_id": brain_id,
            "total_interactions": len(brain.context_history),
            "returned_count": len(history),
            "history": history
        }
    }


@router.delete("/{brain_id}")
async def delete_brain_instance(brain_id: str):
    """
    Delete brain instance.
    
    **Warning:** This removes all personalization and adaptation.
    Use only when learner is no longer active.
    """
    try:
        # Remove from active brains
        if brain_id in brain_manager.active_brains:
            del brain_manager.active_brains[brain_id]
        
        # Remove from cache
        brain_manager.redis_client.delete(f"brain:{brain_id}")
        
        logger.info(f"Brain {brain_id} deleted")
        
        return {
            "success": True,
            "data": {
                "message": "Brain instance deleted",
                "brain_id": brain_id
            }
        }
        
    except Exception as e:
        logger.error(f"Brain deletion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Brain deletion failed: {str(e)}"
        )


@router.get("/learner/{learner_id}/brains")
async def list_learner_brains(learner_id: str):
    """
    List all brain instances for a learner.
    
    Typically there's one brain per learner, but this handles edge cases.
    """
    brains = []
    
    # Check active brains
    for brain_id, brain in brain_manager.active_brains.items():
        if brain.learner_id == learner_id:
            brains.append({
                "brain_id": brain.brain_id,
                "status": brain.status,
                "created_at": brain.created_at.isoformat(),
                "last_active": brain.last_active.isoformat(),
                "total_interactions": brain.metrics.total_interactions
            })
    
    return {
        "success": True,
        "data": {
            "learner_id": learner_id,
            "brain_count": len(brains),
            "brains": brains
        }
    }
