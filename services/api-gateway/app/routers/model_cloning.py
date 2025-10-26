"""
Model Cloning API Endpoints
Explainable AI model personalization with transparency
"""
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.model_cloning_service import ModelCloningService

router = APIRouter()


# ============================================================
# Request/Response Models
# ============================================================

class ConsentRequest(BaseModel):
    learner_id: str
    consented_by: str


class ConsentResponse(BaseModel):
    consent_id: str
    message: str


class BuildModelRequest(BaseModel):
    learner_id: str
    consent_id: str
    privacy_settings: Dict[str, Any] = {
        "store_audio": False,
        "store_images": False,
        "store_free_text_long_term": False,
        "retention_days": 30,
        "history_length": "short",
        "homework_uploads": "none",
    }


class BuildModelResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    
    model_id: str
    status: str
    message: str


# ============================================================
# Endpoints
# ============================================================

@router.get(
    "/model-intro/{learner_id}",
    summary="Get Model Cloning Introduction Data"
)
def get_model_intro(
    learner_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get information to show in the model cloning introduction screen.

    Shows:
    - Baseline assessment summary (redacted for privacy)
    - What data will be used
    - Privacy control options
    - Estimated processing time
    """
    try:
        service = ModelCloningService(db)
        return service.get_model_intro_data(learner_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/record-consent",
    response_model=ConsentResponse,
    summary="Record Parent Consent for Model Creation"
)
def record_consent(
    request: ConsentRequest,
    http_request: Request,
    db: Session = Depends(get_db)
) -> ConsentResponse:
    """
    Record parent/guardian consent for model creation.

    This is required before any model building can begin.
    Logs consent with timestamp, IP address, and full consent text.
    """
    try:
        service = ModelCloningService(db)

        # Get client IP
        ip_address = http_request.client.host if http_request.client else None
        user_agent = http_request.headers.get("user-agent")

        consent_id = service.record_model_creation_consent(
            learner_id=request.learner_id,
            consented_by=request.consented_by,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return ConsentResponse(
            consent_id=consent_id,
            message="Consent recorded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/build-model",
    response_model=BuildModelResponse,
    summary="Build Personalized Learning Model"
)
def build_model(
    request: BuildModelRequest,
    db: Session = Depends(get_db)
) -> BuildModelResponse:
    """
    Build a personalized AI learning model for a learner.

    This executes a 5-step process:
    1. Copy base Aivo Brain to private sandbox
    2. Apply baseline assessment results
    3. Generate personalized learning pathways
    4. Set age-appropriate safety guardrails
    5. Link support tools (Homework Helper, TTS, etc.)

    Each step is logged with transparency about what data is used.
    Takes approximately 5 seconds to complete.
    """
    try:
        service = ModelCloningService(db)

        # Verify consent exists
        consent_check = db.execute(
            "SELECT id FROM model_creation_consent WHERE id = ?",
            (request.consent_id,)
        ).fetchone()

        if not consent_check:
            raise HTTPException(
                status_code=400,
                detail="Consent record not found. Please record consent first."
            )

        # Build the model
        model_id = service.build_personalized_model(
            learner_id=request.learner_id,
            privacy_settings=request.privacy_settings,
            consent_id=request.consent_id,
            actor_id=request.learner_id,  # System action
        )

        return BuildModelResponse(
            model_id=model_id,
            status="ready",
            message="Model built successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/model/{model_id}/build-steps",
    summary="Get Model Build Steps"
)
def get_build_steps(
    model_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the transparent build steps for a model.

    Shows what data was used in each step, what was produced,
    and a plain-language explanation of each operation.
    """
    try:
        steps = db.execute(
            """
            SELECT step_number, step_name, description, data_inputs,
                   data_outputs, explanation, duration_ms, status
            FROM model_build_steps
            WHERE learner_model_id = ?
            ORDER BY step_number
            """,
            (model_id,)
        ).fetchall()

        if not steps:
            raise HTTPException(
                status_code=404,
                detail="Model not found or no build steps recorded"
            )

        import json
        return {
            "model_id": model_id,
            "steps": [
                {
                    "step_number": row[0],
                    "step_name": row[1],
                    "description": row[2],
                    "data_inputs": json.loads(row[3]),
                    "data_outputs": json.loads(row[4]),
                    "explanation": row[5],
                    "duration_ms": row[6],
                    "status": row[7],
                }
                for row in steps
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/model/{model_id}/audit-trail",
    summary="Get Model Audit Trail"
)
def get_audit_trail(
    model_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get complete audit trail for a model.

    Shows all operations performed on the model with timestamps,
    actors, and event details for full transparency.
    """
    try:
        events = db.execute(
            """
            SELECT event_type, event_timestamp, actor_id, actor_role,
                   event_data, ip_address
            FROM model_audit_trail
            WHERE learner_model_id = ?
            ORDER BY event_timestamp DESC
            LIMIT ?
            """,
            (model_id, limit)
        ).fetchall()

        import json
        return {
            "model_id": model_id,
            "total_events": len(events),
            "events": [
                {
                    "event_type": row[0],
                    "timestamp": row[1],
                    "actor_id": row[2],
                    "actor_role": row[3],
                    "event_data": json.loads(row[4]) if row[4] else {},
                    "ip_address": row[5],
                }
                for row in events
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/model/{model_id}/card",
    summary="Get Model Card"
)
def get_model_card(
    model_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the Model Card (ML documentation standard).

    Provides comprehensive documentation about the model including:
    - Model details and version
    - Intended uses and limitations
    - Training data used
    - Ethical considerations
    - Recommendations for use
    """
    try:
        card = db.execute(
            """
            SELECT json_export
            FROM model_cards
            WHERE learner_model_id = ?
            """,
            (model_id,)
        ).fetchone()

        if not card:
            raise HTTPException(
                status_code=404,
                detail="Model card not found"
            )

        import json
        return json.loads(card[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
