"""
Authentication endpoints for PROMPT 63
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
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
def register_parent(data: RegisterParentRequest, db: Session = Depends(get_db)):
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
    
    try:
        email_service.send_verification_email(data.email, data.full_name, str(user.id))
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return {"message": "Parent account created successfully", "user_id": str(user.id), "email": user.email}


# Endpoint 2: Register Teacher
@router.post("/register/teacher", status_code=status.HTTP_201_CREATED)
def register_teacher(data: RegisterTeacherRequest, db: Session = Depends(get_db)):
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
    
    try:
        email_service.send_verification_email(data.email, data.full_name, str(user.id))
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
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
def login(email: EmailStr, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    
    user.last_login = datetime.utcnow()
    db.commit()
    
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
def logout(refresh_token: Optional[str] = None, db: Session = Depends(get_db)):
    return {"message": "Logged out successfully"}


# Endpoint 5: Refresh Token
@router.post("/refresh")
def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
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
def add_child(data: AddChildRequest, authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    
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
        parent_id=user.id,
        school_name=data.school_name,
        district_name=data.district_name,
        state_code=data.state_code,
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
