"""
Baseline Assessment API Router
Endpoints for adaptive baseline assessment
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.baseline_assessment_service import BaselineAssessmentService

router = APIRouter(prefix="/api/v1/baseline", tags=["baseline-assessment"])


# ═══════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════

class StartSessionRequest(BaseModel):
    learner_id: str
    grade_band: str  # 'K-5', '6-8', '9-12'
    audio_enabled: bool = False
    tts_enabled: bool = False
    device_info: Optional[dict] = None


class StartSessionResponse(BaseModel):
    session_id: str
    resumed: bool
    current_domain: str
    first_item: dict
    ability_estimates: dict
    standard_errors: dict


class SubmitResponseRequest(BaseModel):
    session_id: str
    item_id: str
    response: dict  # {selectedOptions, constructedResponse, audioUrl, selfRating}
    engagement_metrics: dict
    time_started: str  # ISO datetime
    time_submitted: str  # ISO datetime


class SubmitResponseResponse(BaseModel):
    scored: bool
    correct: bool
    score: float
    max_score: float
    updated_theta: float
    updated_se: float
    should_stop_domain: bool
    next_domain: Optional[str] = None
    next_item: Optional[dict] = None
    assessment_complete: bool


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    current_domain: str
    domains_completed: list
    items_answered: int
    ability_estimates: dict
    standard_errors: dict


# ═══════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@router.post("/start-session", response_model=StartSessionResponse)
async def start_session(
    request: StartSessionRequest,
    db: Session = Depends(get_db)
):
    """
    Start a new baseline assessment session or resume existing
    
    Returns first item and initial ability estimates
    """
    try:
        result = BaselineAssessmentService.start_session(
            db=db,
            learner_id=request.learner_id,
            grade_band=request.grade_band,
            audio_enabled=request.audio_enabled,
            tts_enabled=request.tts_enabled,
            device_info=request.device_info
        )
        
        return StartSessionResponse(
            session_id=result["session_id"],
            resumed=result["resumed"],
            current_domain=result["current_domain"],
            first_item=result["first_item"],
            ability_estimates=result["ability_estimates"],
            standard_errors=result["standard_errors"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit-response", response_model=SubmitResponseResponse)
async def submit_response(
    request: SubmitResponseRequest,
    db: Session = Depends(get_db)
):
    """
    Submit item response and get next item
    
    Scores response, updates ability estimate using IRT, applies stopping rules,
    and returns next item or domain transition
    """
    try:
        time_started = datetime.fromisoformat(request.time_started.replace('Z', '+00:00'))
        time_submitted = datetime.fromisoformat(request.time_submitted.replace('Z', '+00:00'))
        
        result = BaselineAssessmentService.submit_response(
            db=db,
            session_id=request.session_id,
            item_id=request.item_id,
            response_data=request.response,
            engagement_metrics=request.engagement_metrics,
            time_started=time_started,
            time_submitted=time_submitted
        )
        
        return SubmitResponseResponse(
            scored=result["scored"],
            correct=result["correct"],
            score=result["score"],
            max_score=result["maxScore"],
            updated_theta=result["updatedTheta"],
            updated_se=result["updatedSE"],
            should_stop_domain=result["shouldStopDomain"],
            next_domain=result.get("nextDomain"),
            next_item=result.get("nextItem"),
            assessment_complete=result["assessmentComplete"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/session/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current session status and progress
    """
    try:
        from sqlalchemy import text
        import json
        
        session = db.execute(
            text("""
                SELECT id, status, current_domain, domains_completed_json,
                       items_answered, ability_estimates_json, standard_errors_json
                FROM baseline_sessions WHERE id = :id
            """),
            {"id": session_id}
        ).fetchone()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionStatusResponse(
            session_id=session[0],
            status=session[1],
            current_domain=session[2],
            domains_completed=json.loads(session[3] or '[]'),
            items_answered=session[4],
            ability_estimates=json.loads(session[5] or '{}'),
            standard_errors=json.loads(session[6] or '{}')
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/{session_id}/pause")
async def pause_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Pause an in-progress session
    """
    try:
        from sqlalchemy import text
        
        db.execute(
            text("""
                UPDATE baseline_sessions
                SET status = 'paused', paused_at = :now
                WHERE id = :id AND status = 'in_progress'
            """),
            {"id": session_id, "now": datetime.utcnow()}
        )
        db.commit()
        
        return {"message": "Session paused", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/{session_id}/resume")
async def resume_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Resume a paused session
    """
    try:
        from sqlalchemy import text
        
        db.execute(
            text("""
                UPDATE baseline_sessions
                SET status = 'in_progress', resumed_at = :now
                WHERE id = :id AND status = 'paused'
            """),
            {"id": session_id, "now": datetime.utcnow()}
        )
        db.commit()
        
        return {"message": "Session resumed", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/items/{domain}/{grade_band}")
async def get_domain_items(
    domain: str,
    grade_band: str,
    db: Session = Depends(get_db)
):
    """
    Get all active items for a domain and grade band (for testing/preview)
    """
    try:
        from sqlalchemy import text
        import json
        
        items = db.execute(
            text("""
                SELECT id, item_type, stem, difficulty, discrimination, cognitive_level
                FROM baseline_items
                WHERE domain = :domain AND grade_band = :grade_band AND status = 'active'
                ORDER BY difficulty
            """),
            {"domain": domain, "grade_band": grade_band}
        ).fetchall()
        
        return {
            "domain": domain,
            "grade_band": grade_band,
            "item_count": len(items),
            "items": [
                {
                    "id": row[0],
                    "type": row[1],
                    "stem": row[2],
                    "difficulty": row[3],
                    "discrimination": row[4],
                    "cognitive_level": row[5]
                }
                for row in items
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
