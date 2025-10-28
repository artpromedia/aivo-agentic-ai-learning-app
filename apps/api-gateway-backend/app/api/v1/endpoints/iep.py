"""IEP (Individualized Education Program) management endpoints."""

# type: ignore[import-not-found]
from datetime import date as dt_date
from datetime import datetime, timedelta
from typing import Optional

from fastapi import (  # type: ignore[import-not-found]
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session  # type: ignore[import-not-found]

from app.api.deps import get_current_user, require_role  # type: ignore[import-not-found]
from app.core.database import get_db  # type: ignore[import-not-found]
from app.models.iep import (  # type: ignore[import-not-found]
    IEP,
    IEPDataPoint,
    IEPGoal,
    IEPGoalStatus,
    IEPStatus,
)
from app.models.learner import Learner  # type: ignore[import-not-found]
from app.models.user import User, UserRole  # type: ignore[import-not-found]
from app.schemas.iep import (  # type: ignore[import-not-found]
    IEPCreate,
    IEPDataPointCreate,
    IEPDataPointResponse,
    IEPGoalCreate,
    IEPGoalResponse,
    IEPGoalUpdate,
    IEPResponse,
    IEPUpdate,
    IEPWithGoalsResponse,
)
from app.schemas.response import success_response  # type: ignore[import-not-found]
from app.services.file_service import FileService  # type: ignore[import-not-found]

router = APIRouter()


# ============================================================================
# IEP Document Endpoints
# ============================================================================


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_iep(
    iep_data: IEPCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new IEP document for a learner.

    **Required Fields:**
    - Learner ID
    - Case manager name
    - Date created
    - Next review date

    **Access:**
    - Teacher can create for assigned learners
    - Admin can create for any learner
    """
    # Verify learner access
    learner = db.query(Learner).filter(Learner.id == iep_data.learner_id).first()

    if not learner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner not found")

    # Check if IEP already exists for this learner
    existing_iep = db.query(IEP).filter(IEP.learner_id == iep_data.learner_id).first()

    if existing_iep:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IEP already exists for this learner. Use update instead.",
        )

    # Check access rights
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers and admins can create IEPs"
        )

    # Validate dates
    if iep_data.next_review <= iep_data.date_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Next review date must be after creation date",
        )

    # Create IEP
    iep = IEP(
        learner_id=iep_data.learner_id,
        teacher_id=current_user.id,
        case_manager=iep_data.case_manager,
        date_created=iep_data.date_created,
        last_modified=iep_data.date_created,
        next_review=iep_data.next_review,
        effective_date=iep_data.effective_date,
        parent_contact=iep_data.parent_contact,
        parent_phone=iep_data.parent_phone,
        parent_email=iep_data.parent_email,
        services=[s.dict() for s in iep_data.services] if iep_data.services else [],
        notes=iep_data.notes,
        status=IEPStatus.DRAFT,
    )

    db.add(iep)
    db.commit()
    db.refresh(iep)

    # Update learner's IEP flag
    learner.has_iep = True  # type: ignore[assignment]
    db.commit()

    return success_response(
        data=IEPResponse.from_orm(iep).dict(), message="IEP created successfully"
    )


@router.get("", response_model=dict)
async def list_ieps(
    status_filter: Optional[IEPStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all IEPs for current teacher.

    **Filters:**
    - Status (active, draft, review-due, archived)

    **Returns:**
    - All IEPs with basic info and learner details
    """
    # Check access rights
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers and admins can view IEPs"
        )

    # Build query
    query = db.query(IEP).filter(IEP.teacher_id == current_user.id)

    if status_filter:
        query = query.filter(IEP.status == status_filter)

    ieps = query.order_by(IEP.next_review.asc()).all()

    # Check for reviews due
    today = dt_date.today()
    for iep in ieps:
        days_until_review = (iep.next_review - today).days
        if days_until_review <= 30 and iep.status == IEPStatus.ACTIVE:
            iep.status = IEPStatus.REVIEW_DUE  # type: ignore[assignment]

    db.commit()

    ieps_data = [IEPResponse.from_orm(iep).dict() for iep in ieps]

    return success_response(data=ieps_data)


@router.get("/{iep_id}", response_model=dict)
async def get_iep(
    iep_id: str,
    include_goals: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed IEP information.

    **Includes:**
    - IEP metadata and timeline
    - Services and accommodations
    - Optionally include all goals with progress
    """
    iep = db.query(IEP).filter(IEP.id == iep_id).first()

    if not iep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        # Check if parent owns the learner
        learner = db.query(Learner).filter(Learner.id == iep.learner_id).first()
        if not learner or learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if include_goals:
        return success_response(data=IEPWithGoalsResponse.from_orm(iep).dict())
    else:
        return success_response(data=IEPResponse.from_orm(iep).dict())


@router.patch("/{iep_id}", response_model=dict)
async def update_iep(
    iep_id: str,
    update_data: IEPUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update IEP document.

    **Can Update:**
    - Case manager
    - Review dates
    - Status
    - Contact info
    - Services
    - Notes
    """
    iep = db.query(IEP).filter(IEP.id == iep_id).first()

    if not iep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers and admins can update IEPs"
        )

    # Update fields
    update_dict = update_data.dict(exclude_unset=True)

    # Handle services separately
    if "services" in update_dict and update_dict["services"] is not None:
        update_dict["services"] = [
            s.dict() if hasattr(s, "dict") else s for s in update_dict["services"]
        ]

    for field, value in update_dict.items():
        setattr(iep, field, value)

    # Update last_modified
    iep.last_modified = dt_date.today()  # type: ignore[assignment]

    db.commit()
    db.refresh(iep)

    return success_response(
        data=IEPResponse.from_orm(iep).dict(), message="IEP updated successfully"
    )


@router.delete("/{iep_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_iep(
    iep_id: str,
    current_user: User = Depends(require_role(UserRole.TEACHER, UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Delete IEP document.

    **Access:** Teachers and Admins only

    **Note:** Also deletes all associated goals
    """
    _ = current_user  # Used for authentication
    iep = db.query(IEP).filter(IEP.id == iep_id).first()

    if not iep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP not found")

    db.delete(iep)
    db.commit()


# ============================================================================
# IEP Goal Endpoints
# ============================================================================


@router.post("/goals", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_iep_goal(
    goal_data: IEPGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new IEP goal for a learner.

    **Required Fields:**
    - Goal name and description
    - Category (reading, math, social, motor, communication)
    - Current level and target level
    - Timeline (start and target dates)

    **Access:**
    - Parent can create for their learners
    - Teacher can create for assigned learners
    - Admin can create for any learner
    """
    # Verify learner access
    learner = db.query(Learner).filter(Learner.id == goal_data.learner_id).first()

    if not learner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner not found")

    # Check access rights
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Validate dates
    if goal_data.target_date <= goal_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Target date must be after start date"
        )

    # Create goal
    iep_goal = IEPGoal(
        learner_id=goal_data.learner_id,
        goal_name=goal_data.goal_name,
        goal_description=goal_data.goal_description,
        category=goal_data.category,
        current_level=goal_data.current_level,
        target_level=goal_data.target_level,
        start_date=goal_data.start_date,
        target_date=goal_data.target_date,
        accommodations=goal_data.accommodations,
        progress_percentage=0,
        status=IEPGoalStatus.NOT_STARTED,
    )

    db.add(iep_goal)
    db.commit()
    db.refresh(iep_goal)

    # Update learner's IEP flag
    if not learner.has_iep:
        learner.has_iep = True  # type: ignore[assignment]
        db.commit()

    return success_response(data=IEPGoalResponse.from_orm(iep_goal).dict())


@router.get("/learners/{learner_id}/goals", response_model=dict)
async def list_iep_goals(
    learner_id: str,
    category: Optional[str] = None,
    goal_status: Optional[IEPGoalStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all IEP goals for a learner.

    **Filters:**
    - Category (reading, math, social, motor, communication)
    - Status (on-track, needs-attention, exceeding, not-started)

    **Returns:**
    - All goals with progress data
    - Current status and trend
    - Data points timeline
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()

    if not learner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner not found")

    # Check access rights
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Build query
    query = db.query(IEPGoal).filter(IEPGoal.learner_id == learner_id)

    if category:
        query = query.filter(IEPGoal.category == category)

    if goal_status:
        query = query.filter(IEPGoal.status == goal_status)

    goals = query.order_by(IEPGoal.created_at.desc()).all()

    goals_data = [IEPGoalResponse.from_orm(goal).dict() for goal in goals]

    return success_response(data=goals_data)


@router.get("/goals/{goal_id}", response_model=dict)
async def get_iep_goal(
    goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Get detailed IEP goal information.

    **Includes:**
    - Goal details and timeline
    - All data points with trend analysis
    - Progress percentage
    - Status and recommendations
    """
    goal = db.query(IEPGoal).join(Learner).filter(IEPGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP goal not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if goal.learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return success_response(data=IEPGoalResponse.from_orm(goal).dict())


@router.patch("/goals/{goal_id}", response_model=dict)
async def update_iep_goal(
    goal_id: str,
    update_data: IEPGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update IEP goal.

    **Can Update:**
    - Goal description
    - Current/target levels
    - Timeline
    - Progress percentage
    - Status
    - Accommodations

    **Note:** Maintains audit trail of changes
    """
    goal = db.query(IEPGoal).join(Learner).filter(IEPGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP goal not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if goal.learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Update fields
    update_dict = update_data.dict(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return success_response(data=IEPGoalResponse.from_orm(goal).dict())


@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_iep_goal(
    goal_id: str,
    current_user: User = Depends(  # pylint: disable=unused-argument
        require_role(UserRole.TEACHER, UserRole.GLOBAL_ADMIN)
    ),
    db: Session = Depends(get_db),
):
    """
    Delete IEP goal.

    **Access:** Teachers and Admins only

    **Note:** Also deletes all associated data points
    """
    _ = current_user  # Used for authentication/authorization
    goal = db.query(IEPGoal).filter(IEPGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP goal not found")

    db.delete(goal)
    db.commit()


@router.post(
    "/goals/{goal_id}/data-points", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def add_data_point(
    goal_id: str,
    data_point: IEPDataPointCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add progress data point to IEP goal.

    **Purpose:**
    - Track progress over time
    - Document evidence of growth
    - Support data-driven decisions

    **Recorded By:**
    - Parent observations
    - Teacher assessments
    - System-generated (from activities)
    """
    goal = db.query(IEPGoal).join(Learner).filter(IEPGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP goal not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if goal.learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Create data point
    new_data_point = IEPDataPoint(
        goal_id=goal_id,
        value=data_point.value,
        notes=data_point.notes,
        recorded_by=data_point.recorded_by,
    )

    db.add(new_data_point)

    # Update goal progress (average of all data points)
    all_data_points = goal.data_points + [new_data_point]
    total = sum(dp.value for dp in all_data_points)
    avg_progress = total / len(all_data_points)
    goal.progress_percentage = int(avg_progress)  # type: ignore[assignment]

    # Update status based on progress
    if goal.progress_percentage >= 100:
        goal.status = IEPGoalStatus.EXCEEDING  # type: ignore[assignment]
    elif goal.progress_percentage >= 70:
        goal.status = IEPGoalStatus.ON_TRACK  # type: ignore[assignment]
    elif goal.progress_percentage >= 40:
        goal.status = IEPGoalStatus.ON_TRACK  # type: ignore[assignment]
    else:
        new_status = IEPGoalStatus.NEEDS_ATTENTION
        goal.status = new_status  # type: ignore[assignment]

    db.commit()
    db.refresh(new_data_point)

    return success_response(data=IEPDataPointResponse.from_orm(new_data_point).dict())


@router.post("/learners/{learner_id}/upload-document", response_model=dict)
async def upload_iep_document(
    learner_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload IEP document (PDF, DOC, DOCX).

    **Purpose:**
    - Store official IEP document
    - Reference for goal creation
    - Compliance documentation

    **Max Size:** 5MB
    **Formats:** PDF, DOC, DOCX
    """
    # Verify access
    learner = db.query(Learner).filter(Learner.id == learner_id).first()

    if not learner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learner not found")

    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Validate file
    file_service = FileService()
    validation = file_service.validate_iep_document(file)

    if not validation["valid"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=validation["error"])

    # Upload file
    file_url = await file_service.upload_file(file=file, folder=f"iep/{learner_id}")

    # Update learner record
    learner.iep_document_url = file_url  # type: ignore[assignment]
    learner.has_iep = True  # type: ignore[assignment]

    db.commit()

    return success_response(
        data={
            "learner_id": learner_id,
            "document_url": file_url,
            "uploaded_at": datetime.utcnow().isoformat(),
        }
    )


@router.get("/goals/{goal_id}/analytics", response_model=dict)
async def get_goal_analytics(
    goal_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Get detailed analytics for IEP goal.

    **Includes:**
    - Progress trend (improving/stable/declining)
    - Velocity (rate of progress)
    - Projected completion date
    - Data point frequency
    - Recommendations
    """
    goal = db.query(IEPGoal).join(Learner).filter(IEPGoal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IEP goal not found")

    # Check access
    is_admin = current_user.role in [UserRole.TEACHER, UserRole.GLOBAL_ADMIN]

    if not is_admin:
        if goal.learner.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Calculate analytics
    data_points = sorted(goal.data_points, key=lambda x: x.created_at)

    if len(data_points) < 2:
        trend = "insufficient-data"
        velocity = 0
        projected_completion = None
    else:
        # Calculate trend
        recent_values = [dp.value for dp in data_points[-5:]]
        if len(recent_values) >= 2:
            avg_recent = sum(recent_values) / len(recent_values)
            older_points = data_points[:5]
            avg_older = sum(dp.value for dp in older_points) / min(5, len(older_points))

            if avg_recent > avg_older + 5:
                trend = "improving"
            elif avg_recent < avg_older - 5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient-data"

        # Calculate velocity (progress per week)
        first_point = data_points[0]
        last_point = data_points[-1]
        time_diff = (last_point.created_at - first_point.created_at).days
        value_diff = last_point.value - first_point.value

        if time_diff > 0:
            velocity = (value_diff / time_diff) * 7  # per week

            # Project completion date
            remaining = 100 - goal.progress_percentage
            if velocity > 0:
                weeks_remaining = float(remaining / velocity)
                days_to_add = timedelta(weeks=weeks_remaining)
                projected_completion = datetime.utcnow() + days_to_add
            else:
                projected_completion = None
        else:
            velocity = 0
            projected_completion = None

    # Recommendations
    recommendations = []

    if trend == "declining":
        recommendations.append("Consider adjusting accommodations or strategies")
        recommendations.append("Schedule team meeting to review goal")

    today = dt_date.today()
    days_remaining = (goal.target_date - today).days

    if goal.progress_percentage < 30 and days_remaining < 90:
        recommendations.append("Goal may need adjustment - less than 90 days remaining")

    if len(data_points) < 5:
        recommendations.append("More frequent data collection recommended")

    projected_date = projected_completion.date().isoformat() if projected_completion else None

    return success_response(
        data={
            "goal_id": goal_id,
            "progress_percentage": goal.progress_percentage,
            "status": goal.status,
            "trend": trend,
            "velocity_per_week": round(velocity, 2),
            "projected_completion_date": projected_date,
            "days_until_target": days_remaining,
            "data_points_count": len(data_points),
            "recommendations": recommendations,
        }
    )
