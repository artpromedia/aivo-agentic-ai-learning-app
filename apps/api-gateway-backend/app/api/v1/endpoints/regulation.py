"""Self-regulation API endpoints."""
# pylint: disable=import-error
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db  # type: ignore[import-not-found]
from app.models.user import User  # type: ignore[import-not-found]
from app.models.learner import Learner  # type: ignore[import-not-found]
from app.models.regulation import (  # type: ignore[import-not-found]
    RegulationSession,
    EmotionHistory,
    EmotionType
)
from app.schemas.regulation import (  # type: ignore[import-not-found]
    RegulationSessionCreate,
    RegulationSessionComplete,
    RegulationSessionResponse,
    EmotionCheckIn,
    EmotionHistoryResponse
)
from app.schemas.response import (  # type: ignore[import-not-found]
    success_response,
    paginated_response
)
from app.api.deps import get_current_user  # type: ignore[import-not-found]
from app.services.regulation_service import (  # type: ignore[import-not-found]
    RegulationService
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/activities", response_model=dict)
async def get_regulation_activities():
    """
    Get all available self-regulation activities.

    **Activity Types:**
    - **Breathing**: Box breathing, belly breathing, five-finger breathing
    - **Movement**: Body scan, shake it out, wall pushes
    - **Sensory**: 5-4-3-2-1 grounding, cold water reset, quiet corner
    - **Grounding**: Count backwards, alphabet game
    - **Visualization**: Safe place, balloon worries

    **Filtered by:**
    - Difficulty level (easy, medium, advanced)
    - Best for (anxiety, anger, overstimulation, etc.)
    - Duration
    """
    regulation_service = RegulationService()
    activities = regulation_service.get_all_activities()

    logger.info("Retrieved %d regulation activities", len(activities))

    return success_response(
        data=[activity.model_dump() for activity in activities]
    )


@router.post(
    "/check-in",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def emotion_check_in(
    check_in_data: EmotionCheckIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record emotion check-in.

    **Purpose:**
    - Track emotional state over time
    - Identify patterns and triggers
    - Provide data for IEP progress
    - Recommend regulation activities

    **Returns:**
    - Emotion recorded
    - Recommended activities (if emotion level >= 4)
    - Historical trends
    """
    # Verify learner access
    learner = db.query(Learner).filter(
        Learner.id == check_in_data.learner_id,
        Learner.user_id == current_user.id
    ).first()

    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )

    # Create emotion history record
    emotion_record = EmotionHistory(
        learner_id=check_in_data.learner_id,
        emotion=check_in_data.emotion,
        level=check_in_data.level,
        trigger=check_in_data.trigger,
        context=check_in_data.context
    )

    db.add(emotion_record)
    db.commit()
    db.refresh(emotion_record)

    logger.info(
        "Recorded emotion check-in for learner %s: %s (level %d)",
        check_in_data.learner_id, check_in_data.emotion, check_in_data.level
    )

    # Get recommendations if needed (level 4-5)
    recommendations = None
    if check_in_data.level >= 4:
        regulation_service = RegulationService()
        recommendations = regulation_service.get_recommendations(
            emotion=check_in_data.emotion
        )

    response_data = {
        "emotion_record": EmotionHistoryResponse.model_validate(
            emotion_record
        ).model_dump(),
        "recommendations": (
            [act.model_dump() for act in recommendations]
            if recommendations else None
        )
    }

    return success_response(data=response_data)


@router.get("/learners/{learner_id}/emotions", response_model=dict)
async def get_emotion_history(
    learner_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get emotion check-in history for learner.

    **Analytics:**
    - Emotion trends over time
    - Most common emotions
    - Identified triggers
    - Effective strategies

    **Useful for:**
    - Parent/teacher reports
    - IEP meetings
    - Identifying patterns
    """
    # Verify access
    learner = db.query(Learner).filter(
        Learner.id == learner_id,
        Learner.user_id == current_user.id
    ).first()

    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )

    # Get emotion history
    since_date = datetime.utcnow() - timedelta(days=days)

    emotions = db.query(EmotionHistory).filter(
        EmotionHistory.learner_id == learner_id,
        EmotionHistory.created_at >= since_date
    ).order_by(EmotionHistory.created_at.desc()).all()

    # Calculate analytics
    emotion_data = [
        EmotionHistoryResponse.model_validate(e).model_dump()
        for e in emotions
    ]

    # Most common emotions
    emotion_counts: dict = {}
    for emotion in emotions:
        key = emotion.emotion.value
        emotion_counts[key] = emotion_counts.get(key, 0) + 1

    # Average level per emotion
    emotion_levels: dict = {}
    for emotion in emotions:
        key = emotion.emotion.value
        if key not in emotion_levels:
            emotion_levels[key] = []
        emotion_levels[key].append(emotion.level)

    avg_levels = {
        emotion_key: sum(levels) / len(levels)
        for emotion_key, levels in emotion_levels.items()
    }

    logger.info(
        "Retrieved %d emotion records for learner %s (last %d days)",
        len(emotions), learner_id, days
    )

    return success_response(
        data={
            "emotions": emotion_data,
            "analytics": {
                "total_check_ins": len(emotions),
                "most_common_emotions": dict(sorted(
                    emotion_counts.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5]),
                "average_levels": avg_levels,
                "period_days": days
            }
        }
    )


@router.post(
    "/sessions",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def start_regulation_session(
    session_data: RegulationSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a self-regulation activity session.

    **Process:**
    1. Record starting emotion
    2. Begin activity (breathing, movement, etc.)
    3. Track duration
    4. Record ending emotion
    5. Calculate effectiveness
    """
    # Verify learner access
    learner = db.query(Learner).filter(
        Learner.id == session_data.learner_id,
        Learner.user_id == current_user.id
    ).first()

    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )

    # Get activity details
    regulation_service = RegulationService()
    activity = regulation_service.get_activity_by_id(session_data.activity_id)

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    # Create session
    session = RegulationSession(
        learner_id=session_data.learner_id,
        activity_id=session_data.activity_id,
        activity_type=activity.type.value,
        emotion_before=session_data.emotion_before.emotion,
        emotion_before_level=session_data.emotion_before.level,
        emotion_before_trigger=session_data.emotion_before.trigger,
        completed=False
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    logger.info(
        "Started regulation session %s for learner %s (activity: %s)",
        session.id, session_data.learner_id, session_data.activity_id
    )

    return success_response(
        data={
            "session": RegulationSessionResponse.model_validate(
                session
            ).model_dump(),
            "activity": activity.model_dump()
        }
    )


@router.patch("/sessions/{session_id}/complete", response_model=dict)
async def complete_regulation_session(
    session_id: str,
    completion_data: RegulationSessionComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete a regulation session.

    **Records:**
    - Ending emotion state
    - Session duration
    - Effectiveness (before/after comparison)
    - Notes on what helped
    """
    # Verify session access
    session = db.query(RegulationSession).join(Learner).filter(
        RegulationSession.id == session_id,
        Learner.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied"
        )

    # Calculate duration
    duration_seconds = int(
        (datetime.utcnow() - session.created_at).total_seconds()
    )

    # Update session - type: ignore for SQLAlchemy Column types
    # pylint: disable=assigning-non-slot
    emotion_val = completion_data.emotion_after.emotion
    level_val = completion_data.emotion_after.level
    session.emotion_after = emotion_val  # type: ignore[assignment]
    session.emotion_after_level = level_val  # type: ignore[assignment]
    session.completed = True  # type: ignore[assignment]
    session.duration_seconds = duration_seconds  # type: ignore[assignment]
    session.notes = completion_data.notes  # type: ignore[assignment]

    db.commit()
    db.refresh(session)

    # Also record emotion in history
    emotion_record = EmotionHistory(
        learner_id=session.learner_id,
        emotion=completion_data.emotion_after.emotion,
        level=completion_data.emotion_after.level,
        trigger=None,
        strategy=f"Completed {session.activity_id} activity",
        context="regulation_activity_end"
    )

    db.add(emotion_record)
    db.commit()

    # Calculate improvement
    improvement = session.emotion_before_level - session.emotion_after_level

    logger.info(
        "Completed regulation session %s (improvement: %d)",
        session_id, improvement
    )

    return success_response(
        data={
            "session": RegulationSessionResponse.model_validate(
                session
            ).model_dump(),
            "improvement": {
                "before_level": session.emotion_before_level,
                "after_level": session.emotion_after_level,
                "change": improvement,
                "effective": improvement > 0
            }
        }
    )


@router.get("/learners/{learner_id}/sessions", response_model=dict)
async def get_regulation_sessions(
    learner_id: str,
    days: int = 30,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get regulation session history for learner.

    **Includes:**
    - All completed sessions
    - Effectiveness metrics
    - Most helpful activities
    - Usage patterns
    """
    # Verify access
    learner = db.query(Learner).filter(
        Learner.id == learner_id,
        Learner.user_id == current_user.id
    ).first()

    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learner not found or access denied"
        )

    # Get sessions
    since_date = datetime.utcnow() - timedelta(days=days)

    query = db.query(RegulationSession).filter(
        RegulationSession.learner_id == learner_id,
        RegulationSession.created_at >= since_date
    )

    total = query.count()

    sessions = query.order_by(
        RegulationSession.created_at.desc()
    ).offset((page - 1) * page_size).limit(page_size).all()

    session_data = [
        RegulationSessionResponse.model_validate(session).model_dump()
        for session in sessions
    ]

    logger.info(
        "Retrieved %d regulation sessions for learner %s",
        len(sessions), learner_id
    )

    return paginated_response(
        items=session_data,
        page=page,
        page_size=page_size,
        total=total
    )


@router.get("/recommendations/{emotion}", response_model=dict)
async def get_activity_recommendations(
    emotion: EmotionType
):
    """
    Get recommended activities for specific emotion.

    **Tailored Recommendations:**
    - Anxious → Breathing exercises, grounding
    - Angry → Movement breaks, wall pushes
    - Overstimulated → Quiet corner, sensory breaks
    - Tired → Energizing movements
    """
    regulation_service = RegulationService()
    # Convert model EmotionType to schema EmotionType
    from app.schemas.regulation import EmotionType as SchemaEmotionType
    schema_emotion = SchemaEmotionType(emotion.value)
    recommendations = regulation_service.get_recommendations(schema_emotion)

    logger.info(
        "Retrieved %d recommendations for emotion %s",
        len(recommendations), emotion
    )

    return success_response(
        data={
            "emotion": emotion,
            "recommendations": [act.model_dump() for act in recommendations],
            "count": len(recommendations)
        }
    )
