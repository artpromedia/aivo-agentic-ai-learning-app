"""
Assessment API Endpoints - API Gateway.

Proxies assessment requests to AI Inference Service.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.learner import Learner
from app.api.deps import get_current_user
from app.schemas.response import success_response
from app.services.ai_service import AIService

router = APIRouter()


@router.get("/check-required/{learner_id}", response_model=dict)
async def check_assessment_required(
    learner_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if learner requires an assessment.
    
    **Called on:**
    - Login
    - Dashboard load
    - Every session start
    
    **Returns:**
    - assessment_required: true/false
    - assessment: Assessment object if required
    - days_until_next: Days until next scheduled assessment
    
    **Triggers:**
    - First login → Baseline assessment
    - Every 90 days → Quarterly assessment
    """
    # Verify learner access
    learner = db.query(Learner).filter(
        Learner.id == learner_id,
        Learner.user_id == current_user.id
    ).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )
    
    # Proxy to AI Inference Service
    ai_service = AIService()
    
    try:
        result = await ai_service.check_assessment_due(learner_id)
        
        return success_response(
            data={
                "assessment_required": result.get("is_due", False),
                "assessment": {
                    "id": result.get("schedule_id"),
                    "type": result.get("assessment_type"),
                    "scheduled_date": result.get("scheduled_date"),
                    "message": _get_assessment_message(result.get("assessment_type"))
                } if result.get("is_due") else None,
                "days_until_next": result.get("days_since_last"),
                "message": _get_assessment_message(result.get("assessment_type")) if result.get("is_due") else "No assessment required."
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check assessment: {str(e)}"
        )


@router.post("/{assessment_id}/start", response_model=dict)
async def start_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start an assessment.
    
    **Actions:**
    - Marks assessment as IN_PROGRESS
    - Returns questions to begin
    - Starts timer
    """
    # Note: For now, proxy to BaselineAssessment.tsx component
    # Full comprehensive assessment will use AI Inference Service
    
    return success_response(
        data={
            "assessment_id": assessment_id,
            "status": "ready",
            "message": "Navigate to /assessment to begin",
            "redirect_url": f"/assessment?schedule_id={assessment_id}"
        }
    )


@router.post("/quick/submit", response_model=dict)
async def submit_quick_assessment(
    learner_id: str,
    schedule_id: str,
    responses: list,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit quick assessment (5 questions).
    
    Proxies to AI Inference Service.
    """
    # Verify learner access
    learner = db.query(Learner).filter(
        Learner.id == learner_id,
        Learner.user_id == current_user.id
    ).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )
    
    # Proxy to AI Inference Service
    ai_service = AIService()
    
    try:
        result = await ai_service.submit_quick_assessment(
            schedule_id=schedule_id,
            learner_id=learner_id,
            responses=responses
        )
        
        return success_response(
            data=result,
            message=_get_completion_message(result.get("overall_score", 0))
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit assessment: {str(e)}"
        )


@router.get("/{assessment_id}/results", response_model=dict)
async def get_assessment_results(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed assessment results.
    
    **Returns:**
    - Overall score
    - Subject breakdowns
    - Strengths and weaknesses
    - Recommended next steps
    - Brain model changes
    """
    # Proxy to AI Inference Service
    ai_service = AIService()
    
    try:
        result = await ai_service.get_assessment_results(assessment_id)
        
        return success_response(data=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get results: {str(e)}"
        )


@router.get("/learner/{learner_id}/history", response_model=dict)
async def get_assessment_history(
    learner_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get learner's assessment history.
    
    **Shows:**
    - All completed assessments
    - Progress over time
    - Brain model evolution
    """
    # Verify learner access
    learner = db.query(Learner).filter(
        Learner.id == learner_id,
        Learner.user_id == current_user.id
    ).first()
    
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )
    
    # Proxy to AI Inference Service
    ai_service = AIService()
    
    try:
        result = await ai_service.get_assessment_history(learner_id)
        
        return success_response(data=result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}"
        )


def _get_assessment_message(assessment_type: Optional[str]) -> str:
    """Get user-friendly assessment message."""
    if assessment_type == "baseline":
        return "Welcome! Let's start with a quick assessment to understand your learning level. This helps us personalize your experience."
    elif assessment_type == "quarterly":
        return "Time for your 90-day progress check! Let's see how much you've learned."
    else:
        return "Assessment ready to start."


def _get_completion_message(score: float) -> str:
    """Get encouraging completion message."""
    if score >= 90:
        return "🌟 Outstanding work! Your personalized learning brain is now optimized for your advanced skills!"
    elif score >= 75:
        return "🎉 Great job! Your learning brain has been updated to match your current level!"
    elif score >= 60:
        return "👍 Good effort! Your brain has been adjusted to support your learning journey!"
    else:
        return "💪 Keep going! Your brain is now personalized to help you succeed!"
