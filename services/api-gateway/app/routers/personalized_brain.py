"""
Personalized Brain API Endpoints
=================================

Endpoints for managing personalized learner brain instances:
- Clone main brain for new learners
- Check brain status and performance
- Trigger manual retraining
- View learning milestones
"""

import json
import logging
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Add AI inference service to path
sys.path.insert(
    0,
    str(Path(__file__).parent.parent.parent.parent.parent / "ai-inference-service" / "scripts"),
)

from app.core.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


class BrainCloneRequest(BaseModel):
    """Request to clone brain for learner"""

    learner_id: str


class BrainStatusResponse(BaseModel):
    """Brain instance status"""

    brain_instance_id: str
    learner_id: str
    learner_name: str
    status: str
    current_grade_level: int
    cloned_from_version: str
    total_retraining_cycles: int
    last_retrained_at: Optional[str]
    next_retraining_due: Optional[str]
    average_accuracy: Optional[float]
    questions_answered: int
    learning_velocity: Optional[float]


@router.post("/clone")
async def clone_brain_for_learner(request: BrainCloneRequest, db: Session = Depends(get_db)):
    """
    Clone main Aivo brain for a specific learner.
    Creates personalized brain instance based on learner profile.
    """
    try:
        from personalized_brain_cloner import PersonalizedBrainCloner

        cloner = PersonalizedBrainCloner()
        brain_instance_id = await cloner.clone_brain_for_learner(request.learner_id)

        if not brain_instance_id:
            raise HTTPException(status_code=500, detail="Failed to clone brain for learner")

        return {
            "success": True,
            "brain_instance_id": brain_instance_id,
            "learner_id": request.learner_id,
            "message": "Brain cloned successfully",
        }

    except Exception as e:
        logger.error(f"Brain clone error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{learner_id}", response_model=BrainStatusResponse)
async def get_brain_status(learner_id: str, db: Session = Depends(get_db)):
    """Get learner's brain instance status"""
    try:
        # Query brain instance
        from app.models.base import BaseModel

        result = db.execute(
            """
            SELECT 
                b.id, b.learner_id, b.status, b.current_grade_level,
                b.cloned_from_version, b.total_retraining_cycles,
                b.last_retrained_at, b.next_retraining_due,
                b.average_accuracy, b.questions_answered,
                b.learning_velocity,
                l.first_name, l.last_name
            FROM learner_brain_instances b
            JOIN learners l ON b.learner_id = l.id
            WHERE b.learner_id = :learner_id
              AND b.status = 'active'
            ORDER BY b.created_at DESC
            LIMIT 1
        """,
            {"learner_id": learner_id},
        )

        row = result.fetchone()
        if not row:
            raise HTTPException(
                status_code=404, detail="No active brain instance found for learner"
            )

        return BrainStatusResponse(
            brain_instance_id=row[0],
            learner_id=row[1],
            learner_name=f"{row[11]} {row[12]}",
            status=row[2],
            current_grade_level=row[3],
            cloned_from_version=row[4],
            total_retraining_cycles=row[5],
            last_retrained_at=row[6],
            next_retraining_due=row[7],
            average_accuracy=row[8],
            questions_answered=row[9],
            learning_velocity=row[10],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get brain status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain/{learner_id}")
async def trigger_manual_retrain(learner_id: str, db: Session = Depends(get_db)):
    """Manually trigger brain retraining for a learner"""
    try:
        from daily_learner_retraining import DailyLearnerRetraining

        trainer = DailyLearnerRetraining()

        # Get brain instance
        result = db.execute(
            """
            SELECT id, learner_id, current_grade_level, model_config
            FROM learner_brain_instances
            WHERE learner_id = :learner_id AND status = 'active'
        """,
            {"learner_id": learner_id},
        )

        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No active brain instance")

        brain_instance_id = row[0]

        # Collect interactions and retrain
        interactions = trainer.collect_daily_interactions(
            learner_id, brain_instance_id, days_back=7
        )

        if len(interactions) < 5:
            raise HTTPException(
                status_code=400, detail="Not enough interaction data for retraining"
            )

        performance = trainer.analyze_performance(interactions)
        success = await trainer.retrain_brain(
            brain_instance_id, learner_id, interactions, performance
        )

        if not success:
            raise HTTPException(status_code=500, detail="Retraining failed")

        return {
            "success": True,
            "message": "Brain retrained successfully",
            "interactions_processed": len(interactions),
            "new_accuracy": performance["accuracy"],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manual retrain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/milestones/{learner_id}")
async def get_learner_milestones(learner_id: str, db: Session = Depends(get_db)):
    """Get learning milestones for a learner"""
    try:
        result = db.execute(
            """
            SELECT 
                id, milestone_type, previous_state, new_state,
                triggered_by, trigger_date, description,
                brain_updated, created_at
            FROM learner_milestones
            WHERE learner_id = :learner_id
            ORDER BY created_at DESC
            LIMIT 20
        """,
            {"learner_id": learner_id},
        )

        milestones = []
        for row in result:
            milestones.append(
                {
                    "id": row[0],
                    "milestone_type": row[1],
                    "previous_state": json.loads(row[2]) if row[2] else {},
                    "new_state": json.loads(row[3]) if row[3] else {},
                    "triggered_by": row[4],
                    "trigger_date": row[5],
                    "description": row[6],
                    "brain_updated": row[7],
                    "created_at": row[8],
                }
            )

        return {"learner_id": learner_id, "milestones": milestones, "count": len(milestones)}

    except Exception as e:
        logger.error(f"Get milestones error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance/{learner_id}")
async def get_performance_history(learner_id: str, days: int = 30, db: Session = Depends(get_db)):
    """Get learner's performance history"""
    try:
        from datetime import timedelta

        start_date = (date.today() - timedelta(days=days)).isoformat()

        result = db.execute(
            """
            SELECT 
                snapshot_date, period_type, total_interactions,
                accuracy_percentage, subject_performance,
                learning_velocity, engagement_score
            FROM brain_performance_snapshots
            WHERE learner_id = :learner_id
              AND snapshot_date >= :start_date
            ORDER BY snapshot_date ASC
        """,
            {"learner_id": learner_id, "start_date": start_date},
        )

        snapshots = []
        for row in result:
            snapshots.append(
                {
                    "date": row[0],
                    "period_type": row[1],
                    "total_interactions": row[2],
                    "accuracy": row[3],
                    "subject_performance": json.loads(row[4]) if row[4] else [],
                    "learning_velocity": row[5],
                    "engagement_score": row[6],
                }
            )

        return {
            "learner_id": learner_id,
            "days": days,
            "snapshots": snapshots,
            "count": len(snapshots),
        }

    except Exception as e:
        logger.error(f"Get performance history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
