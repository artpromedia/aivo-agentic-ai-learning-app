"""
Assessment API Endpoints.

REST API for both Quick and Comprehensive assessments.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    QuickAssessmentSubmission,
    AssessmentScheduleResponse,
    AssessmentResultResponse,
    AssessmentHistoryResponse,
    AssessmentDueResponse,
)

router = APIRouter()


@router.get("/check/{learner_id}", response_model=AssessmentDueResponse)
async def check_assessment_due(
    learner_id: str,
    db: Session = Depends(deps.get_db)
):
    """
    Check if learner needs an assessment.
    
    Returns pending assessment or creates new one if 90 days passed.
    """
    service = AssessmentService(db)
    
    try:
        result = await service.check_assessment_due(learner_id)
        
        return AssessmentDueResponse(
            is_due=result["is_due"],
            assessment_type=result.get("assessment_type"),
            scheduled_date=result["schedule"].scheduled_date if result.get("schedule") else None,
            days_since_last=result["schedule"].days_since_last if result.get("schedule") else None,
            schedule_id=str(result["schedule"].id) if result.get("schedule") else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schedule/learner/{learner_id}", response_model=List[AssessmentScheduleResponse])
async def get_learner_schedules(
    learner_id: str,
    db: Session = Depends(deps.get_db)
):
    """Get all assessment schedules for a learner."""
    from app.models.assessment import AssessmentSchedule
    
    schedules = db.query(AssessmentSchedule).filter(
        AssessmentSchedule.learner_id == learner_id
    ).order_by(AssessmentSchedule.created_at.desc()).all()
    
    return schedules


@router.post("/quick/submit", response_model=AssessmentResultResponse)
async def submit_quick_assessment(
    submission: QuickAssessmentSubmission,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """
    Submit quick assessment (5 questions).
    
    Saves responses, analyzes results, and triggers brain adaptation.
    """
    service = AssessmentService(db)
    
    try:
        result = await service.submit_quick_assessment(
            schedule_id=submission.schedule_id,
            learner_id=submission.learner_id,
            responses=[r.dict() for r in submission.responses]
        )
        
        # Get full result from DB
        from app.models.assessment import AssessmentResult
        
        result_obj = db.query(AssessmentResult).filter(
            AssessmentResult.id == result["result_id"]
        ).first()
        
        if not result_obj:
            raise HTTPException(status_code=404, detail="Result not found")
        
        return result_obj
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process assessment: {str(e)}"
        )


@router.get("/results/learner/{learner_id}", response_model=List[AssessmentResultResponse])
async def get_learner_results(
    learner_id: str,
    limit: int = 10,
    db: Session = Depends(deps.get_db)
):
    """Get assessment results history for a learner."""
    from app.models.assessment import AssessmentResult
    
    results = db.query(AssessmentResult).filter(
        AssessmentResult.learner_id == learner_id
    ).order_by(AssessmentResult.created_at.desc()).limit(limit).all()
    
    return results


@router.get("/history/learner/{learner_id}", response_model=AssessmentHistoryResponse)
async def get_assessment_history(
    learner_id: str,
    db: Session = Depends(deps.get_db)
):
    """Get complete assessment history with progress tracking."""
    service = AssessmentService(db)
    
    try:
        history = await service.get_assessment_history(learner_id)
        
        return AssessmentHistoryResponse(
            learner_id=history["learner_id"],
            total_assessments=history["total_assessments"],
            results=history["results"],
            upcoming_schedules=history["upcoming_schedules"],
            completion_rate=history["completion_rate"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark-overdue")
async def mark_overdue_assessments(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """
    Mark overdue assessments (called by scheduler).
    
    Marks assessments as overdue if not completed within 7 days.
    """
    service = AssessmentService(db)
    
    try:
        count = await service.mark_overdue()
        return {"marked_overdue": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/schedule/first/{learner_id}", response_model=AssessmentScheduleResponse)
async def create_first_assessment(
    learner_id: str,
    db: Session = Depends(deps.get_db)
):
    """Create first assessment for new learner (called on enrollment)."""
    service = AssessmentService(db)
    
    try:
        schedule = await service.create_first_assessment(learner_id)
        return schedule
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Comprehensive assessment endpoints (placeholder - full implementation in next phase)

@router.post("/comprehensive/create")
async def create_comprehensive_assessment(
    learner_id: str,
    schedule_id: str,
    subjects: List[str],
    db: Session = Depends(deps.get_db)
):
    """
    Create comprehensive assessment with AI-generated questions.
    
    TODO: Full implementation in next phase.
    """
    return {
        "message": "Comprehensive assessment creation coming soon",
        "note": "Use quick assessment for now"
    }


@router.post("/comprehensive/answer")
async def submit_comprehensive_answer(
    question_id: str,
    learner_answer: str,
    time_spent_seconds: int,
    db: Session = Depends(deps.get_db)
):
    """
    Submit answer for comprehensive assessment question.
    
    TODO: Full implementation in next phase.
    """
    return {
        "message": "Comprehensive assessment submission coming soon",
        "note": "Use quick assessment for now"
    }


@router.post("/comprehensive/complete")
async def complete_comprehensive_assessment(
    assessment_id: str,
    db: Session = Depends(deps.get_db)
):
    """
    Complete comprehensive assessment and generate results.
    
    TODO: Full implementation in next phase.
    """
    return {
        "message": "Comprehensive assessment completion coming soon",
        "note": "Use quick assessment for now"
    }
