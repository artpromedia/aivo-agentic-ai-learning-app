"""
RBAC Management API - User Roles, Permissions, and Impersonation.

Endpoints for managing users, roles, and access control.
Created: 2025-10-26
"""
from datetime import datetime, timedelta
from typing import List, Optional
import csv
import io
import os
import time
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, EmailStr, ValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session
from PIL import Image

from app.api.deps import get_db, require_admin, get_current_user
from app.models import User, UserRole
from app.core.security import get_password_hash

router = APIRouter()

# Create upload directory for avatars
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic Schemas
class UserResponse(BaseModel):
    """User response schema."""
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    onboarding_status: str
    school_name: Optional[str] = None
    district_name: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class UserCreate(BaseModel):
    """User creation schema."""
    email: EmailStr
    full_name: str
    password: str
    role: UserRole
    school_name: Optional[str] = None
    district_name: Optional[str] = None


class UserUpdate(BaseModel):
    """User update schema."""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    school_name: Optional[str] = None
    district_name: Optional[str] = None


class RoleUpdateRequest(BaseModel):
    """Role update request."""
    role: UserRole


class ImpersonateRequest(BaseModel):
    """Impersonation request."""
    target_user_id: str
    reason: Optional[str] = None


class ImpersonateResponse(BaseModel):
    """Impersonation response."""
    token: str
    user: UserResponse
    impersonator_id: str
    expires_at: str


class UpdateMyProfileRequest(BaseModel):
    """Schema for updating current user's own profile."""
    email: EmailStr
    full_name: str


class AvatarUploadResponse(BaseModel):
    """Avatar upload response."""
    avatar_url: str
    message: str


# Endpoints
@router.get("/", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(
        None,
        description="Filter by active status"
    ),
    search: Optional[str] = Query(
        None,
        description="Search by email or name"
    ),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: dict = Depends(require_admin),
):
    """
    List all users with optional filtering.

    Filters:
    - role: Filter by user role
    - is_active: Filter by active status
    - search: Search by email or full name
    - limit: Maximum number of results (default 50)
    - offset: Pagination offset
    """
    query = db.query(User)

    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_pattern)) |
            (User.full_name.ilike(search_pattern))
        )

    # Apply pagination
    users = query.order_by(User.created_at.desc()).offset(offset).limit(
        limit
    ).all()

    return users


@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Create a new user.

    Requires admin authentication.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create user (password hashing should be done in service layer)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=user_data.password,  # TODO: Hash password
        role=user_data.role,
        school_name=user_data.school_name,
        district_name=user_data.district_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Update user details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


@router.patch("/{user_id}/roles", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role_data: RoleUpdateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Update user role.

    Quick endpoint for changing user roles.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role_data.role
    db.commit()
    db.refresh(user)

    return user


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Activate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()
    db.refresh(user)

    return user


@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    db.refresh(user)

    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Delete a user account.

    WARNING: This permanently deletes the user and all related data.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return None


@router.post("/{user_id}/impersonate", response_model=ImpersonateResponse)
async def impersonate_user(
    user_id: str,
    request: ImpersonateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Impersonate a user for support/debugging.

    Returns a special token that allows acting as the target user.
    All actions are logged with the impersonator's ID.
    """
    # Find target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # TODO: Generate impersonation token with special claims
    # For now, return mock response
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    return ImpersonateResponse(
        token="impersonation_token_placeholder",
        user=UserResponse.from_orm(target_user),
        impersonator_id=current_user.get("user_id", "admin"),
        expires_at=expires_at,
    )


@router.get("/stats/summary")
async def get_user_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Get user statistics summary.

    Returns counts by role, activity status, etc.
    """
    # Total users
    total_users = db.query(func.count(User.id)).scalar()

    # Active users
    active_users = db.query(func.count(User.id)).filter(
        User.is_active == True  # noqa: E712
    ).scalar()

    # Users by role
    users_by_role = {}
    for role in UserRole:
        count = db.query(func.count(User.id)).filter(
            User.role == role
        ).scalar()
        users_by_role[role.value] = count

    # Verified users
    verified_users = db.query(func.count(User.id)).filter(
        User.is_verified == True  # noqa: E712
    ).scalar()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "verified_users": verified_users,
        "unverified_users": total_users - verified_users,
        "users_by_role": users_by_role,
    }


class CSVImportResult(BaseModel):
    """CSV import result schema."""
    total_rows: int
    successful: int
    failed: int
    errors: List[dict]
    created_users: List[UserResponse]


@router.post("/import-csv", response_model=CSVImportResult)
async def import_users_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """
    Import users from CSV file.
    
    Expected CSV columns: email, full_name, password, role, school_name (optional), district_name (optional)
    
    Returns summary of import operation with created users and any errors.
    """
    # Validate file type
    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")
    
    # Read and decode CSV
    try:
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {str(e)}")
    
    # Track results
    total_rows = 0
    successful = 0
    failed = 0
    errors = []
    created_users = []
    
    # Process each row
    for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (header is row 1)
        total_rows += 1
        
        try:
            # Validate required fields
            email = row.get('email', '').strip()
            full_name = row.get('full_name', '').strip()
            password = row.get('password', '').strip()
            role = row.get('role', '').strip()
            
            if not email:
                raise ValueError("Email is required")
            if not full_name:
                raise ValueError("Full name is required")
            if not password:
                raise ValueError("Password is required")
            if not role:
                raise ValueError("Role is required")
            
            # Validate role
            try:
                user_role = UserRole(role.lower())
            except ValueError:
                valid_roles = ', '.join([r.value for r in UserRole])
                raise ValueError(f"Invalid role '{role}'. Must be one of: {valid_roles}")
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                raise ValueError(f"User with email '{email}' already exists")
            
            # Create user
            new_user = User(
                email=email,
                full_name=full_name,
                hashed_password=get_password_hash(password),
                role=user_role,
                school_name=row.get('school_name', '').strip() or None,
                district_name=row.get('district_name', '').strip() or None,
                is_active=True,
                is_verified=False,
                onboarding_status='pending',
            )
            
            db.add(new_user)
            db.flush()  # Flush to get ID but don't commit yet
            
            # Add to successful list
            created_users.append(UserResponse.from_orm(new_user))
            successful += 1
            
        except Exception as e:
            failed += 1
            errors.append({
                'row': row_num,
                'email': row.get('email', 'N/A'),
                'error': str(e)
            })
            db.rollback()  # Rollback this user creation
    
    # Commit all successful creations
    if successful > 0:
        db.commit()
    
    return CSVImportResult(
        total_rows=total_rows,
        successful=successful,
        failed=failed,
        errors=errors,
        created_users=created_users
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's profile.
    
    Returns the authenticated user's profile information.
    """
    return current_user


@router.put("/me/profile", response_model=UserResponse)
async def update_my_profile(
    profile_data: UpdateMyProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current user's own profile.
    
    Users can update their own email and full name.
    Cannot change: role, is_active, is_verified, onboarding_status.
    
    Args:
        profile_data: Profile update data (email, full_name)
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Updated user profile
    
    Raises:
        HTTPException 400: Email already in use by another user
    """
    # Check if email is being changed and if it's already taken
    if profile_data.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Email '{profile_data.email}' is already in use"
            )
    
    # Update user profile
    current_user.email = profile_data.email
    current_user.full_name = profile_data.full_name
    current_user.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update profile: {str(e)}"
        )
    
    return current_user


@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload avatar image for current user.
    
    Accepts image files (JPEG, PNG, WEBP), validates size and type,
    resizes to max 512x512 pixels, and saves to uploads/avatars/.
    
    Args:
        file: Image file upload
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Avatar URL and success message
    
    Raises:
        HTTPException 400: Invalid file type or size
        HTTPException 500: Failed to process or save image
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, WEBP)"
        )
    
    # Read file contents
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Validate file size (5MB max)
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image file size must be less than 5MB"
        )
    
    # Open and validate image with PIL
    try:
        image = Image.open(io.BytesIO(contents))
        
        # Convert RGBA to RGB if necessary (for JPEG)
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])  # 3 is the alpha channel
            image = background
        elif image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}"
        )
    
    # Resize to max 512x512 (maintain aspect ratio)
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1].lower() if file.filename and '.' in file.filename else 'jpg'
    if file_ext not in ('jpg', 'jpeg', 'png', 'webp'):
        file_ext = 'jpg'
    
    filename = f"{current_user.id}-{int(time.time())}.{file_ext}"
    filepath = UPLOAD_DIR / filename
    
    # Save optimized image
    try:
        if file_ext == 'jpg' or file_ext == 'jpeg':
            image.save(filepath, 'JPEG', optimize=True, quality=85)
        elif file_ext == 'png':
            image.save(filepath, 'PNG', optimize=True)
        elif file_ext == 'webp':
            image.save(filepath, 'WEBP', quality=85)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save image: {str(e)}"
        )
    
    # Delete old avatar file if it exists (and it's a local file)
    if current_user.avatar:
        old_avatar_path = current_user.avatar.lstrip('/')
        if not old_avatar_path.startswith('http'):
            old_file = Path(old_avatar_path)
            if old_file.exists() and old_file.is_file():
                try:
                    old_file.unlink()
                except Exception:
                    pass  # Ignore errors when deleting old file
    
    # Update user avatar in database
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar = avatar_url
    current_user.updated_at = datetime.utcnow()
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        # Try to delete the uploaded file if DB update fails
        try:
            filepath.unlink()
        except Exception:
            pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user avatar: {str(e)}"
        )
    
    return AvatarUploadResponse(
        avatar_url=avatar_url,
        message="Avatar uploaded successfully"
    )


