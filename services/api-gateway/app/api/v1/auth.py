"""
Complete Authentication API Endpoints
Handles user registration, login, token management, and password reset

Enhanced for Phase 2:
- Redis-based rate limiting for security
- Comprehensive error handling
- Background task integration for emails
- Token blacklisting for logout
- Proper password validation
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy.orm import Session
from redis import Redis

from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    validate_password_strength,
    verify_password,
)
from app.models.user import License, LicenseAssignment, User
from app.services.email_service import EmailService
from app.services.rate_limiter import check_rate_limit, reset_rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])
email_service = EmailService()


# Request Models
class RegisterParentRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    phone: Optional[str] = None


class RegisterTeacherRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    license_key: str
    phone: Optional[str] = None
    district_name: Optional[str] = None


class AddChildRequest(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: str
    grade_level: int = Field(ge=0, le=12)
    school_name: str
    district_name: str
    state_code: str = Field(min_length=2, max_length=2)
    has_iep: bool = False
    diagnoses: Optional[list[str]] = None
    accommodations: Optional[list[str]] = None


class AssignLicenseRequest(BaseModel):
    license_key: str
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: str
    grade_level: int = Field(ge=0, le=12)
    parent_email: Optional[EmailStr] = None
    has_iep: bool = False
    diagnoses: Optional[list[str]] = None
    accommodations: Optional[list[str]] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    role: str
    redirect_url: str


# Endpoint 1: Register Parent
@router.post("/register/parent", status_code=status.HTTP_201_CREATED)
async def register_parent(
    data: RegisterParentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Register a new parent account.
    
    Flow:
    1. Check rate limiting (3 attempts per hour per email)
    2. Validate password strength
    3. Check if email already exists
    4. Create user with hashed password
    5. Send verification email in background
    """
    # Rate limiting: 3 registration attempts per hour per email
    await check_rate_limit(redis, f"register:{data.email}", max_attempts=3, window=3600)
    
    is_valid, error_msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role="parent",
        onboarding_status="profile_complete",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # TODO: Send verification email in background (disabled for development)
    # background_tasks.add_task(
    #     email_service.send_verification_email,
    #     data.email,
    #     data.full_name,
    #     str(user.id)
    # )
    
    # Generate tokens for immediate login
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return {
        "message": "Parent account created successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


# Endpoint 2: Register Teacher
@router.post("/register/teacher", status_code=status.HTTP_201_CREATED)
async def register_teacher(
    data: RegisterTeacherRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Register a new teacher account with license validation.
    
    Flow:
    1. Check rate limiting
    2. Validate license key exists and is active
    3. Verify available seats
    4. Create teacher account
    5. Send verification email in background
    """
    # Rate limiting: 3 registration attempts per hour per email
    await check_rate_limit(redis, f"register:{data.email}", max_attempts=3, window=3600)
    
    is_valid, error_msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    license_obj = db.query(License).filter(License.license_key == data.license_key).first()
    if not license_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid license key")
    
    if not license_obj.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License is inactive")
    
    used_seats = db.query(LicenseAssignment).filter(LicenseAssignment.license_id == license_obj.id).count()
    if used_seats >= license_obj.total_seats:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No available seats")
    
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role="teacher",
        district_name=data.district_name or license_obj.district_name,
        license_id=license_obj.id,
        onboarding_status="profile_complete",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send verification email in background
    background_tasks.add_task(
        email_service.send_verification_email,
        data.email,
        data.full_name,
        str(user.id)
    )
    
    return {
        "message": "Teacher account created successfully",
        "user_id": str(user.id),
        "email": user.email,
        "license_info": {
            "license_type": license_obj.license_type,
            "district_name": license_obj.district_name,
            "seats_available": license_obj.total_seats - used_seats,
            "total_seats": license_obj.total_seats,
        },
    }


# Endpoint 3: Login
@router.post("/login", response_model=LoginResponse)
async def login(
    email: EmailStr,
    password: str,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Authenticate user and return JWT tokens.
    
    Flow:
    1. Check rate limiting (5 attempts per 15 minutes)
    2. Verify credentials
    3. Check account status
    4. Generate tokens
    5. Store refresh token in Redis
    6. Update last_login
    7. Reset rate limit on success
    """
    # Rate limiting: 5 login attempts per 15 minutes per email
    rate_limit_key = f"login:{email}"
    await check_rate_limit(redis, rate_limit_key, max_attempts=5, window=900)
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Increment failed login counter
        redis.incr(f"{rate_limit_key}:failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not verify_password(password, user.hashed_password):
        # Increment failed login counter
        redis.incr(f"{rate_limit_key}:failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    # Store refresh token in Redis (7 days expiration)
    redis.setex(
        f"refresh_token:{str(user.id)}",
        timedelta(days=7),
        refresh_token
    )
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Reset rate limit on successful login
    reset_rate_limit(redis, rate_limit_key)
    redis.delete(f"{rate_limit_key}:failed")
    
    redirect_url = get_redirect_url(user)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        role=user.role,
        redirect_url=redirect_url,
    )


def get_redirect_url(user: User) -> str:
    if user.role == "parent":
        return "/onboarding/add-child" if user.onboarding_status == "profile_complete" else "https://parent.aivoai.com/dashboard"
    elif user.role == "teacher":
        return "/onboarding/assign-license" if user.onboarding_status == "profile_complete" else "https://teacher.aivoai.com/dashboard"
    elif user.role == "admin":
        return "https://admin.aivoai.com/dashboard"
    return "/dashboard"


# Endpoint 4: Logout
@router.post("/logout")
async def logout(
    authorization: str = Header(None),
    refresh_token: Optional[str] = None,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Logout user by blacklisting their access token.
    
    Flow:
    1. Decode access token
    2. Add token to Redis blacklist
    3. Remove refresh token from Redis
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            
            # Blacklist access token (30 min expiration matches token lifetime)
            redis.setex(f"blacklist:{token}", timedelta(minutes=30), "1")
            
            # Remove refresh token
            redis.delete(f"refresh_token:{user_id}")
            
        except Exception:
            pass  # Continue even if token is invalid
    
    return {"message": "Logged out successfully"}


# Endpoint 5: Refresh Token
@router.post("/refresh")
async def refresh_access_token(
    refresh_token: str,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Generate new access token using refresh token.
    
    Flow:
    1. Decode refresh token
    2. Verify token exists in Redis
    3. Verify user still active
    4. Generate new access token
    """
    try:
        payload = decode_token(refresh_token)
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    
    # Verify refresh token in Redis
    stored_token = redis.get(f"refresh_token:{user_id}")
    if not stored_token or stored_token.decode() != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint 6: Get Current User
@router.get("/me")
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "onboarding_status": user.onboarding_status,
        "email_verified": user.is_verified,
        "district_name": user.district_name,
    }


# Endpoint 7: Add Child (Parent)
@router.post("/parent/add-child", status_code=status.HTTP_201_CREATED)
def add_child(
    data: AddChildRequest,
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "parent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only parents can add children")
    
    from app.models.learner import Learner
    
    learner = Learner(
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=datetime.fromisoformat(data.date_of_birth),
        grade_level=data.grade_level,
        user_id=user.id,  # Changed from parent_id to user_id
        has_iep=data.has_iep,
        diagnoses=data.diagnoses or [],
        accommodations=data.accommodations or [],
    )
    
    db.add(learner)
    user.onboarding_status = "child_added"
    db.commit()
    db.refresh(learner)
    
    try:
        email_service.send_welcome_email(user.email, user.full_name, learner.first_name)
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
    
    return {
        "message": "Child added successfully",
        "learner_id": str(learner.id),
        "assessment_id": None,
        "redirect_url": f"/onboarding/assessment/{learner.id}",
    }


# Endpoint 8: Assign License (Teacher)
@router.post("/teacher/assign-license", status_code=status.HTTP_201_CREATED)
def assign_license(data: AssignLicenseRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only teachers can assign licenses")
    
    license_obj = db.query(License).filter(License.license_key == data.license_key).first()
    if not license_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid license key")
    
    used_seats = db.query(LicenseAssignment).filter(LicenseAssignment.license_id == license_obj.id).count()
    if used_seats >= license_obj.total_seats:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No available seats on this license")
    
    from app.models.learner import Learner
    
    learner = Learner(
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=datetime.fromisoformat(data.date_of_birth),
        grade_level=data.grade_level,
        district_name=license_obj.district_name,
        has_iep=data.has_iep,
        diagnoses=data.diagnoses or [],
        accommodations=data.accommodations or [],
    )
    
    db.add(learner)
    db.flush()
    
    assignment = LicenseAssignment(
        license_id=license_obj.id,
        learner_id=learner.id,
        teacher_id=user.id,
    )
    db.add(assignment)
    
    if user.onboarding_status == "profile_complete":
        user.onboarding_status = "license_assigned"
    
    db.commit()
    db.refresh(learner)
    
    return {
        "message": "License assigned successfully",
        "learner_id": str(learner.id),
        "assessment_id": None,
        "seats_remaining": license_obj.total_seats - used_seats - 1,
        "redirect_url": f"/onboarding/assessment/{learner.id}",
    }


# Endpoint 9: Verify Email
@router.post("/verify-email/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.is_verified = True
    db.commit()
    
    return {"message": "Email verified successfully"}


# Endpoint 10: Request Password Reset
@router.post("/request-password-reset")
def request_password_reset(email: EmailStr, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If email exists, reset link will be sent"}
    
    return {"message": "If email exists, reset link will be sent"}


# Endpoint 11: Reset Password
@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    is_valid, error_msg = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    try:
        payload = decode_token(token)
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}


# ============================================================================
# TEACHER LICENSING ENDPOINTS
# ============================================================================

class ValidateLicenseResponse(BaseModel):
    valid: bool
    license_type: Optional[str] = None
    district_name: Optional[str] = None
    available_seats: Optional[int] = None
    total_seats: Optional[int] = None
    expires_at: Optional[str] = None
    error: Optional[str] = None


class TeacherAssignLicenseRequest(BaseModel):
    license_key: str
    teacher_id: str
    learner_data: dict = Field(..., description="Complete learner profile data")


class TeacherAssignLicenseResponse(BaseModel):
    success: bool
    learner_id: Optional[str] = None
    license_id: Optional[str] = None
    seats_remaining: Optional[int] = None
    redirect_url: Optional[str] = None
    error: Optional[str] = None


@router.get("/validate-license/{license_key}", response_model=ValidateLicenseResponse)
async def validate_license(
    license_key: str,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Validate a district bulk license key.
    
    Checks:
    - License exists
    - License is active
    - License hasn't expired
    - License has available seats
    
    Returns license details if valid.
    """
    # Rate limiting: 10 validation attempts per minute per IP
    # (IP tracking would be added via request: Request parameter)
    await check_rate_limit(redis, f"validate_license:{license_key}", max_attempts=10, window=60)
    
    # Query license
    license_obj = db.query(License).filter(
        License.license_key == license_key
    ).first()
    
    if not license_obj:
        return ValidateLicenseResponse(
            valid=False,
            error="License key not found"
        )
    
    # Check if expired
    if license_obj.expires_at and license_obj.expires_at < datetime.utcnow():
        return ValidateLicenseResponse(
            valid=False,
            error=f"License expired on {license_obj.expires_at.strftime('%Y-%m-%d')}"
        )
    
    # Check if active
    if license_obj.status != "active":
        return ValidateLicenseResponse(
            valid=False,
            error=f"License status is '{license_obj.status}', not active"
        )
    
    # Get total seats from license_metadata
    total_seats = 1  # Default for individual licenses
    if license_obj.license_metadata and isinstance(license_obj.license_metadata, dict):
        total_seats = license_obj.license_metadata.get("total_seats", 1)
    
    # Check available seats
    available_seats = total_seats - (license_obj.used_seats or 0)
    if available_seats <= 0:
        return ValidateLicenseResponse(
            valid=False,
            error=f"No available seats (all {total_seats} seats used)"
        )
    
    # License is valid
    return ValidateLicenseResponse(
        valid=True,
        license_type=license_obj.license_type or "individual",
        district_name=license_obj.district_name,
        available_seats=available_seats,
        total_seats=total_seats,
        expires_at=license_obj.expires_at.isoformat() if license_obj.expires_at else None
    )


@router.post("/teacher/assign-license", response_model=TeacherAssignLicenseResponse)
async def teacher_assign_license(
    data: TeacherAssignLicenseRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Assign a district license to a student (teacher enrollment).
    
    Flow:
    1. Validate license key and availability
    2. Create learner record
    3. Create license assignment
    4. Update license used_seats (via trigger)
    5. Link learner to teacher
    6. Send notification emails
    7. Return learner ID and redirect URL
    """
    # Rate limiting: 30 enrollments per hour per teacher
    await check_rate_limit(redis, f"teacher_enroll:{data.teacher_id}", max_attempts=30, window=3600)
    
    # Validate license
    license_obj = db.query(License).filter(
        License.license_key == data.license_key,
        License.status == "active"
    ).first()
    
    if not license_obj:
        return TeacherAssignLicenseResponse(
            success=False,
            error="Invalid or inactive license key"
        )
    
    # Check expiration
    if license_obj.expires_at and license_obj.expires_at < datetime.utcnow():
        return TeacherAssignLicenseResponse(
            success=False,
            error="License has expired"
        )
    
    # Check available seats
    total_seats = 1
    if license_obj.license_metadata and isinstance(license_obj.license_metadata, dict):
        total_seats = license_obj.license_metadata.get("total_seats", 1)
    
    available_seats = total_seats - (license_obj.used_seats or 0)
    if available_seats <= 0:
        return TeacherAssignLicenseResponse(
            success=False,
            error="No available seats on this license"
        )
    
    # Verify teacher exists
    teacher = db.query(User).filter(
        User.id == data.teacher_id,
        User.role.in_(["teacher", "teacher_admin"])
    ).first()
    
    if not teacher:
        return TeacherAssignLicenseResponse(
            success=False,
            error="Teacher not found or invalid role"
        )
    
    try:
        # Import Learner model (assuming it exists)
        from app.models.learner import Learner
        
        # Create learner record
        learner_data = data.learner_data
        learner = Learner(
            first_name=learner_data.get("first_name"),
            last_name=learner_data.get("last_name"),
            date_of_birth=learner_data.get("date_of_birth"),
            grade=learner_data.get("grade", learner_data.get("grade_level")),
            gender=learner_data.get("gender"),
            diagnoses=learner_data.get("diagnoses", []),
            accommodations=learner_data.get("accommodations", []),
            accessibility_prefs=learner_data.get("accessibility_prefs", {}),
            has_iep=learner_data.get("has_iep", False),
            iep_details=learner_data.get("iep_details"),
            enrolled_by_teacher_id=data.teacher_id,
            enrollment_type="teacher",
            onboarding_status="profile_complete",
        )
        db.add(learner)
        db.flush()  # Get learner.id without committing
        
        # Create license assignment
        assignment = LicenseAssignment(
            license_id=license_obj.id,
            learner_id=learner.id,
            teacher_id=data.teacher_id,
            assigned_by_role="teacher",
            assignment_metadata={
                "assigned_at": datetime.utcnow().isoformat(),
                "district": license_obj.district_name,
                "grade": learner.grade,
            }
        )
        db.add(assignment)
        
        # Link assignment to learner
        learner.license_assignment_id = assignment.id
        
        # Commit transaction (triggers will update used_seats)
        db.commit()
        db.refresh(learner)
        db.refresh(license_obj)
        
        # Calculate new available seats
        new_available_seats = total_seats - license_obj.used_seats
        
        # Generate redirect URL for baseline assessment
        redirect_url = f"http://localhost:5173?learner_id={learner.id}&token=temp_token&return_to=baseline_assessment"
        
        # Send notification emails in background
        # background_tasks.add_task(
        #     email_service.send_teacher_enrollment_confirmation,
        #     teacher.email,
        #     teacher.full_name,
        #     f"{learner.first_name} {learner.last_name}"
        # )
        
        return TeacherAssignLicenseResponse(
            success=True,
            learner_id=str(learner.id),
            license_id=str(license_obj.id),
            seats_remaining=new_available_seats,
            redirect_url=redirect_url
        )
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        return TeacherAssignLicenseResponse(
            success=False,
            error=f"Failed to assign license: {str(e)}"
        )
