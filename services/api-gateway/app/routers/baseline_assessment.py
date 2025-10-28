"""
Baseline Assessment API Router - Enhanced for Neurodiverse Support
Endpoints for adaptive baseline assessment with accessibility features
"""
from datetime import datetime
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.baseline_assessment_service import BaselineAssessmentService

router = APIRouter(prefix="/api/v1/baseline", tags=["baseline-assessment"])


# ═══════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════

class AccessibilityPreferences(BaseModel):
    """Learner accessibility preferences"""
    fontSize: str = 'medium'
    fontFamily: str = 'default'
    highContrast: bool = False
    colorScheme: str = 'calm-blue'
    reduceAnimations: bool = False
    textToSpeech: bool = False
    ttsVoice: str = 'female'
    ttsSpeed: float = 1.0
    soundEffects: bool = True
    showTimer: bool = False
    autoAdvance: bool = False
    keyboardNav: bool = True
    breakReminders: bool = True
    breakInterval: int = 15
    focusMode: bool = False
    showHints: bool = True
    showConfidenceSlider: bool = True
    showEncouragement: bool = True


class StartSessionRequest(BaseModel):
    learner_id: str
    grade_band: str  # 'K-5', '6-8', '9-12'
    audio_enabled: bool = False
    tts_enabled: bool = False
    device_info: Optional[dict] = None
    accessibility_preferences: Optional[AccessibilityPreferences] = None


class ItemWithAccessibility(BaseModel):
    """Enhanced item response with accessibility metadata"""
    id: str
    domain: str
    subDomain: str
    type: str
    stem: str
    stimulus: Optional[str] = None
    stimulusType: Optional[str] = None
    stimulusUrl: Optional[str] = None
    options: Optional[List[Dict]] = None
    parameters: Dict[str, Any]
    readAloud: bool
    allowCalculator: bool
    gradeBand: str
    hintText: Optional[str] = None
    visualSupportUrl: Optional[str] = None
    audioSupportUrl: Optional[str] = None
    estimatedDifficultyLevel: Optional[str] = None
    neurodiverseFriendly: bool = False


class StartSessionResponse(BaseModel):
    session_id: str
    resumed: bool
    current_domain: str
    first_item: ItemWithAccessibility
    ability_estimates: dict
    standard_errors: dict
    ui_config: Dict[str, Any]  # UI configuration based on preferences


class EngagementMetrics(BaseModel):
    """Enhanced engagement tracking"""
    hesitationCount: int = 0
    usedHint: bool = False
    usedReadAloud: bool = False
    confidenceLevel: Optional[int] = None  # 1-5
    focusLevel: Optional[str] = None  # 'high', 'medium', 'low'
    timeSpentMs: int
    deviceType: Optional[str] = None


class SubmitResponseRequest(BaseModel):
    session_id: str
    item_id: str
    response: dict
    engagement_metrics: EngagementMetrics
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
    next_item: Optional[ItemWithAccessibility] = None
    assessment_complete: bool
    encouragement_message: str  # Personalized feedback
    should_suggest_break: bool = False


class BreakRequest(BaseModel):
    session_id: str
    break_type: str  # 'breathing', 'physical', 'mindful', 'custom'
    activity_name: Optional[str] = None


class BreakResponse(BaseModel):
    break_id: str
    activity_suggestion: Dict[str, Any]
    mindfulness_prompts: List[str]
    estimated_duration_minutes: int


class PreviewItemsRequest(BaseModel):
    domain: str
    grade_band: str
    accessibility_features: Optional[List[str]] = None
    limit: int = 5


class PreviewItemsResponse(BaseModel):
    items: List[Dict[str, Any]]
    total_available: int


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
    with accessibility preferences
    
    Returns first item, initial ability estimates, and UI configuration
    """
    try:
        # Save accessibility preferences if provided
        if request.accessibility_preferences:
            BaselineAssessmentService.save_accessibility_preferences(
                db=db,
                learner_id=request.learner_id,
                preferences=request.accessibility_preferences.dict()
            )
        
        result = BaselineAssessmentService.start_session(
            db=db,
            learner_id=request.learner_id,
            grade_band=request.grade_band,
            audio_enabled=(
                request.audio_enabled or
                (request.accessibility_preferences.textToSpeech
                 if request.accessibility_preferences else False)
            ),
            tts_enabled=(
                request.tts_enabled or
                (request.accessibility_preferences.textToSpeech
                 if request.accessibility_preferences else False)
            ),
            device_info=request.device_info
        )
        
        # Generate UI configuration
        prefs = request.accessibility_preferences
        ui_config = {
            "colorScheme": prefs.colorScheme if prefs else "calm-blue",
            "fontSize": prefs.fontSize if prefs else "medium",
            "showEncouragement": prefs.showEncouragement if prefs else True,
            "breakInterval": prefs.breakInterval if prefs else 15,
            "focusMode": prefs.focusMode if prefs else False
        }
        
        return StartSessionResponse(
            session_id=result["session_id"],
            resumed=result["resumed"],
            current_domain=result["current_domain"],
            first_item=ItemWithAccessibility(**result["first_item"]),
            ability_estimates=result["ability_estimates"],
            standard_errors=result["standard_errors"],
            ui_config=ui_config
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/submit-response", response_model=SubmitResponseResponse)
async def submit_response(
    request: SubmitResponseRequest,
    db: Session = Depends(get_db)
):
    """
    Submit item response with enhanced engagement tracking
    Returns next item with personalized encouragement
    """
    try:
        time_started = datetime.fromisoformat(
            request.time_started.replace('Z', '+00:00')
        )
        time_submitted = datetime.fromisoformat(
            request.time_submitted.replace('Z', '+00:00')
        )
        
        result = BaselineAssessmentService.submit_response(
            db=db,
            session_id=request.session_id,
            item_id=request.item_id,
            response_data=request.response,
            engagement_metrics=request.engagement_metrics.dict(),
            time_started=time_started,
            time_submitted=time_submitted
        )
        
        # Generate encouragement message
        encouragement = BaselineAssessmentService.generate_encouragement(
            correct=result["correct"],
            confidence_level=request.engagement_metrics.confidenceLevel,
            items_answered=result.get("items_answered", 0),
            grade_band=result.get("grade_band", "K-5")
        )
        
        # Check if break should be suggested
        should_suggest_break = BaselineAssessmentService.should_suggest_break(
            db=db,
            session_id=request.session_id
        )
        
        response_data = {
            "scored": result["scored"],
            "correct": result["correct"],
            "score": result["score"],
            "max_score": result["maxScore"],
            "updated_theta": result["updatedTheta"],
            "updated_se": result["updatedSE"],
            "should_stop_domain": result["shouldStopDomain"],
            "next_domain": result.get("nextDomain"),
            "assessment_complete": result["assessmentComplete"],
            "encouragement_message": encouragement,
            "should_suggest_break": should_suggest_break
        }
        
        if result.get("nextItem"):
            response_data["next_item"] = (
                ItemWithAccessibility(**result["nextItem"])
            )
        
        return SubmitResponseResponse(**response_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sessions/{session_id}/break", response_model=BreakResponse)
async def start_break(
    session_id: str,
    request: BreakRequest,
    db: Session = Depends(get_db)
):
    """
    Pause session and provide break activity suggestions
    """
    try:
        break_id = BaselineAssessmentService.start_break(
            db=db,
            session_id=session_id,
            break_type=request.break_type,
            activity_name=request.activity_name
        )
        
        # Get session info for context
        session_info = BaselineAssessmentService.get_session_status(
            db, session_id
        )
        grade_band = session_info.get("grade_band", "K-5")
        
        # Generate activity suggestion
        activity = BaselineAssessmentService.get_break_activity(
            break_type=request.break_type,
            grade_band=grade_band
        )
        
        # Generate mindfulness prompts
        prompts = BaselineAssessmentService.get_mindfulness_prompts(
            grade_band
        )
        
        return BreakResponse(
            break_id=break_id,
            activity_suggestion=activity,
            mindfulness_prompts=prompts,
            estimated_duration_minutes=5
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sessions/{session_id}/break/{break_id}/end")
async def end_break(
    session_id: str,
    break_id: str,
    felt_helpful: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    End break and resume assessment
    """
    try:
        BaselineAssessmentService.end_break(
            db=db,
            break_id=break_id,
            felt_helpful=felt_helpful
        )
        
        return {
            "message": "Break ended successfully",
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/items/preview", response_model=PreviewItemsResponse)
async def preview_items(
    domain: str,
    grade_band: str,
    accessibility_features: Optional[str] = None,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Preview questions by domain/grade_band for parents/teachers
    Returns sanitized items without correct answers
    """
    try:
        features_list = (
            accessibility_features.split(',')
            if accessibility_features else []
        )
        
        items, total = BaselineAssessmentService.get_preview_items(
            db=db,
            domain=domain,
            grade_band=grade_band,
            accessibility_features=features_list,
            limit=limit
        )
        
        # Sanitize items (remove correct answers)
        sanitized_items = []
        for item in items:
            sanitized = {
                "id": item["id"],
                "domain": item["domain"],
                "subDomain": item["subDomain"],
                "type": item["type"],
                "stem": item["stem"],
                "stimulus": item.get("stimulus"),
                "estimatedDifficultyLevel": item.get(
                    "estimatedDifficultyLevel"
                ),
                "estimatedTime": item.get("estimatedTime"),
                "neurodiverseFriendly": item.get(
                    "neurodiverseFriendly", False
                )
            }
            
            # Include options but without correct flags
            if item.get("options"):
                sanitized["options"] = [
                    {"id": opt["id"], "label": opt["label"]}
                    for opt in item["options"]
                ]
            
            sanitized_items.append(sanitized)
        
        return PreviewItemsResponse(
            items=sanitized_items,
            total_available=total
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sessions/{session_id}/status")
async def get_session_status(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current session status with accessibility usage report
    """
    try:
        status = BaselineAssessmentService.get_session_status(
            db, session_id
        )
        
        # Add accessibility usage report
        accessibility_report = (
            BaselineAssessmentService.get_accessibility_usage_report(
                db=db,
                session_id=session_id
            )
        )
        
        return {
            **status,
            "accessibility_usage": accessibility_report
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/results/{session_id}")
async def get_results(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get final assessment results with neurodiverse-specific recommendations
    """
    try:
        results = BaselineAssessmentService.get_results(db, session_id)
        
        # Generate neurodiverse-specific recommendations
        neurodiverse_recommendations = (
            BaselineAssessmentService.generate_neurodiverse_recommendations(
                db=db,
                session_id=session_id,
                results=results
            )
        )
        
        # Format for IEP documentation
        iep_report = BaselineAssessmentService.format_for_iep(
            results=results,
            neurodiverse_recommendations=neurodiverse_recommendations
        )
        
        return {
            **results,
            "neurodiverse_recommendations": neurodiverse_recommendations,
            "iep_report": iep_report
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/learner/{learner_id}/accessibility-preferences")
async def get_accessibility_preferences(
    learner_id: str,
    db: Session = Depends(get_db)
):
    """
    Get learner's saved accessibility preferences
    """
    try:
        preferences = BaselineAssessmentService.get_accessibility_preferences(
            db=db,
            learner_id=learner_id
        )
        
        if not preferences:
            # Return defaults
            return AccessibilityPreferences().dict()
        
        return preferences
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/learner/{learner_id}/accessibility-preferences")
async def update_accessibility_preferences(
    learner_id: str,
    preferences: AccessibilityPreferences,
    db: Session = Depends(get_db)
):
    """
    Update learner's accessibility preferences
    """
    try:
        BaselineAssessmentService.save_accessibility_preferences(
            db=db,
            learner_id=learner_id,
            preferences=preferences.dict()
        )
        
        return {"message": "Preferences updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/session/{session_id}", response_model=SessionStatusResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current session status and progress (legacy endpoint)
    """
    try:
        import json
        from sqlalchemy import text
        
        session = db.execute(
            text("""
                SELECT id, status, current_domain, domains_completed_json,
                       items_answered, ability_estimates_json,
                       standard_errors_json
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
        import json
        from sqlalchemy import text
        
        items = db.execute(
            text("""
                SELECT id, item_type, stem, difficulty,
                       discrimination, cognitive_level
                FROM baseline_items
                WHERE domain = :domain AND grade_band = :grade_band
                      AND status = 'active'
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

