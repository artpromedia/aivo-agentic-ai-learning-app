"""API endpoints for hint and explanation generation."""
from fastapi import APIRouter, HTTPException
from app.core.brain_manager import BrainManager
from app.services.hint_generator import HintGenerator, ExplanationGenerator
from app.models.brain_instance import (
    HintRequest,
    HintResponse,
    ExplanationRequest,
    ExplanationResponse
)

router = APIRouter(tags=["generate"])

# Initialize services
brain_manager = BrainManager()
hint_generator = HintGenerator()
explanation_generator = ExplanationGenerator()


@router.post("/hint", response_model=HintResponse)
async def generate_hint(hint_request: HintRequest) -> HintResponse:
    """Generate an adaptive hint for a learner."""
    try:
        # Get brain instance
        brain = brain_manager._get_brain_by_id(hint_request.brain_id)
        if not brain:
            raise HTTPException(status_code=404, detail="Brain not found")

        # Generate hint
        hint_response = await hint_generator.generate_hint(
            brain,
            hint_request
        )

        # Update brain activity
        brain.update_activity()
        brain_manager._cache_brain(brain)

        return hint_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explanation", response_model=ExplanationResponse)
async def generate_explanation(
    explanation_request: ExplanationRequest
) -> ExplanationResponse:
    """Generate a detailed explanation for a concept."""
    try:
        # Get brain instance
        brain = brain_manager._get_brain_by_id(explanation_request.brain_id)
        if not brain:
            raise HTTPException(status_code=404, detail="Brain not found")

        # Generate explanation
        explanation_response = (
            await explanation_generator.generate_explanation(
                brain,
                explanation_request
            )
        )

        # Update brain activity
        brain.update_activity()
        brain_manager._cache_brain(brain)

        return explanation_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
