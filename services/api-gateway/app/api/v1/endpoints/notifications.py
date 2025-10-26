"""
Notifications API Endpoints

Handles email notifications, SMS, and push notifications.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import logging

from app.services.email_service import send_enrollment_confirmation
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)


class EnrollmentNotificationRequest(BaseModel):
    """Request model for enrollment confirmation email."""
    parent_email: EmailStr
    parent_name: str
    learner_name: str
    learner_id: str
    grade_level: str
    age: int
    has_iep: bool = False
    accessibility_features: List[str] = []


@router.post("/enrollment-confirmation")
async def send_enrollment_notification(
    request: EnrollmentNotificationRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Send enrollment confirmation email.
    
    This endpoint is called after a learner is successfully enrolled.
    It sends a comprehensive email with:
    - Learner profile summary
    - Accessibility features enabled
    - Next steps (baseline assessment)
    - Links to dashboard and resources
    """
    try:
        # Log the notification request
        logger.info(
            f"Sending enrollment confirmation to {request.parent_email} "
            f"for learner: {request.learner_name} (ID: {request.learner_id})"
        )
        
        # Send the email
        success = send_enrollment_confirmation(
            parent_email=request.parent_email,
            parent_name=request.parent_name,
            learner_name=request.learner_name,
            learner_id=request.learner_id,
            grade_level=request.grade_level,
            age=request.age,
            has_iep=request.has_iep,
            accessibility_features=request.accessibility_features,
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to send enrollment confirmation email"
            )
        
        logger.info(
            f"✅ Enrollment confirmation sent successfully to {request.parent_email}"
        )
        
        return {
            "success": True,
            "message": f"Enrollment confirmation sent to {request.parent_email}",
            "learner_id": request.learner_id,
        }
        
    except Exception as e:
        logger.error(f"❌ Error sending enrollment confirmation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {str(e)}"
        )


@router.post("/test-email")
async def send_test_email(
    email: EmailStr,
    current_user: User = Depends(get_current_user),
):
    """
    Send a test email to verify email service is working.
    
    Development/testing endpoint.
    """
    try:
        # Send a test enrollment confirmation
        success = send_enrollment_confirmation(
            parent_email=email,
            parent_name="Test Parent",
            learner_name="Test Learner",
            learner_id="test-123",
            grade_level="5th Grade",
            age=10,
            has_iep=True,
            accessibility_features=["textToSpeech", "highContrast", "calmMode"],
        )
        
        if success:
            return {
                "success": True,
                "message": f"Test email sent to {email}",
                "note": "Check server logs for email content (development mode)"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send test email"
            )
            
    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test email: {str(e)}"
        )
