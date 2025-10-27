"""
School Management API Endpoints

Provides CRUD operations for managing schools within districts.
Used by District Portal to manage individual schools.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from app.core.database import get_db
from app.api.deps import require_admin
from app.models.license import SchoolAccount, DistrictAccount


router = APIRouter()


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class SchoolBase(BaseModel):
    """Base schema for school data."""
    school_name: str = Field(..., min_length=1, max_length=500)
    school_code: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    principal_name: Optional[str] = Field(None, max_length=255)
    principal_email: Optional[EmailStr] = None
    admin_email: Optional[EmailStr] = None
    seats_allocated: int = Field(default=0, ge=0)


class SchoolCreate(SchoolBase):
    """Schema for creating a new school."""
    district_id: str = Field(..., description="ID of the parent district")


class SchoolUpdate(BaseModel):
    """Schema for updating an existing school."""
    school_name: Optional[str] = Field(None, min_length=1, max_length=500)
    school_code: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=255)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    principal_name: Optional[str] = Field(None, max_length=255)
    principal_email: Optional[EmailStr] = None
    admin_email: Optional[EmailStr] = None
    seats_allocated: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class SchoolResponse(SchoolBase):
    """Schema for school response."""
    id: str
    district_id: str
    district_name: Optional[str] = None
    seats_used: int
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class SchoolStatsResponse(BaseModel):
    """Schema for school statistics."""
    total_schools: int
    active_schools: int
    inactive_schools: int
    total_seats_allocated: int
    total_seats_used: int
    total_seats_available: int


# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/", response_model=List[SchoolResponse])
async def list_schools(
    district_id: Optional[str] = Query(None, description="Filter by district ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by school name"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    List all schools with optional filtering.
    
    Filters:
    - district_id: Show only schools from specific district
    - is_active: Filter by active/inactive status
    - search: Search school name (case-insensitive)
    - limit/offset: Pagination
    """
    query = db.query(SchoolAccount)
    
    # Apply filters
    if district_id:
        query = query.filter(SchoolAccount.district_id == district_id)
    
    if is_active is not None:
        query = query.filter(SchoolAccount.is_active == is_active)
    
    if search:
        query = query.filter(SchoolAccount.school_name.ilike(f"%{search}%"))
    
    # Order by name
    query = query.order_by(SchoolAccount.school_name)
    
    # Pagination
    schools = query.offset(offset).limit(limit).all()
    
    # Enrich with district name
    result = []
    for school in schools:
        school_dict = {
            "id": school.id,
            "district_id": school.district_id,
            "school_name": school.school_name,
            "school_code": school.school_code,
            "address": school.address,
            "city": school.city,
            "state": school.state,
            "postal_code": school.postal_code,
            "principal_name": school.principal_name,
            "principal_email": school.principal_email,
            "admin_email": school.admin_email,
            "seats_allocated": school.seats_allocated,
            "seats_used": school.seats_used,
            "is_active": school.is_active,
            "created_at": school.created_at.isoformat() if school.created_at else None,
            "updated_at": school.updated_at.isoformat() if school.updated_at else None,
        }
        
        # Get district name
        if school.district:
            school_dict["district_name"] = school.district.district_name
        
        result.append(SchoolResponse(**school_dict))
    
    return result


@router.post("/", response_model=SchoolResponse, status_code=status.HTTP_201_CREATED)
async def create_school(
    school_data: SchoolCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Create a new school under a district.
    
    Requires admin privileges.
    """
    # Verify district exists
    district = db.query(DistrictAccount).filter(
        DistrictAccount.id == school_data.district_id
    ).first()
    
    if not district:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"District with ID {school_data.district_id} not found"
        )
    
    # Check if school with same name already exists in this district
    existing = db.query(SchoolAccount).filter(
        SchoolAccount.district_id == school_data.district_id,
        SchoolAccount.school_name == school_data.school_name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"School '{school_data.school_name}' already exists in this district"
        )
    
    # Create school
    school = SchoolAccount(
        district_id=school_data.district_id,
        school_name=school_data.school_name,
        school_code=school_data.school_code,
        address=school_data.address,
        city=school_data.city,
        state=school_data.state,
        postal_code=school_data.postal_code,
        principal_name=school_data.principal_name,
        principal_email=school_data.principal_email,
        admin_email=school_data.admin_email,
        seats_allocated=school_data.seats_allocated,
        seats_used=0,
        is_active=True,
    )
    
    db.add(school)
    db.commit()
    db.refresh(school)
    
    return SchoolResponse(
        id=school.id,
        district_id=school.district_id,
        district_name=district.district_name,
        school_name=school.school_name,
        school_code=school.school_code,
        address=school.address,
        city=school.city,
        state=school.state,
        postal_code=school.postal_code,
        principal_name=school.principal_name,
        principal_email=school.principal_email,
        admin_email=school.admin_email,
        seats_allocated=school.seats_allocated,
        seats_used=school.seats_used,
        is_active=school.is_active,
        created_at=school.created_at.isoformat() if school.created_at else None,
        updated_at=school.updated_at.isoformat() if school.updated_at else None,
    )


@router.get("/stats", response_model=SchoolStatsResponse)
async def get_school_stats(
    district_id: Optional[str] = Query(None, description="Filter stats by district"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Get aggregated statistics about schools.
    
    Optionally filter by district.
    """
    query = db.query(SchoolAccount)
    
    if district_id:
        query = query.filter(SchoolAccount.district_id == district_id)
    
    schools = query.all()
    
    total_schools = len(schools)
    active_schools = sum(1 for s in schools if s.is_active)
    inactive_schools = total_schools - active_schools
    total_seats_allocated = sum(s.seats_allocated for s in schools)
    total_seats_used = sum(s.seats_used for s in schools)
    total_seats_available = total_seats_allocated - total_seats_used
    
    return SchoolStatsResponse(
        total_schools=total_schools,
        active_schools=active_schools,
        inactive_schools=inactive_schools,
        total_seats_allocated=total_seats_allocated,
        total_seats_used=total_seats_used,
        total_seats_available=total_seats_available,
    )


@router.get("/{school_id}", response_model=SchoolResponse)
async def get_school(
    school_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Get details of a specific school by ID.
    """
    school = db.query(SchoolAccount).filter(SchoolAccount.id == school_id).first()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School with ID {school_id} not found"
        )
    
    district_name = school.district.district_name if school.district else None
    
    return SchoolResponse(
        id=school.id,
        district_id=school.district_id,
        district_name=district_name,
        school_name=school.school_name,
        school_code=school.school_code,
        address=school.address,
        city=school.city,
        state=school.state,
        postal_code=school.postal_code,
        principal_name=school.principal_name,
        principal_email=school.principal_email,
        admin_email=school.admin_email,
        seats_allocated=school.seats_allocated,
        seats_used=school.seats_used,
        is_active=school.is_active,
        created_at=school.created_at.isoformat() if school.created_at else None,
        updated_at=school.updated_at.isoformat() if school.updated_at else None,
    )


@router.patch("/{school_id}", response_model=SchoolResponse)
async def update_school(
    school_id: str,
    school_data: SchoolUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Update an existing school.
    
    Only provided fields will be updated.
    """
    school = db.query(SchoolAccount).filter(SchoolAccount.id == school_id).first()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School with ID {school_id} not found"
        )
    
    # Update only provided fields
    update_data = school_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(school, field, value)
    
    db.commit()
    db.refresh(school)
    
    district_name = school.district.district_name if school.district else None
    
    return SchoolResponse(
        id=school.id,
        district_id=school.district_id,
        district_name=district_name,
        school_name=school.school_name,
        school_code=school.school_code,
        address=school.address,
        city=school.city,
        state=school.state,
        postal_code=school.postal_code,
        principal_name=school.principal_name,
        principal_email=school.principal_email,
        admin_email=school.admin_email,
        seats_allocated=school.seats_allocated,
        seats_used=school.seats_used,
        is_active=school.is_active,
        created_at=school.created_at.isoformat() if school.created_at else None,
        updated_at=school.updated_at.isoformat() if school.updated_at else None,
    )


@router.delete("/{school_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_school(
    school_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Delete a school.
    
    This is a hard delete. Consider soft delete (setting is_active=False) instead.
    """
    school = db.query(SchoolAccount).filter(SchoolAccount.id == school_id).first()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School with ID {school_id} not found"
        )
    
    # Check if school has active users/students
    # This is a safety check - you may want to prevent deletion if there are users
    if school.seats_used > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete school with {school.seats_used} seats in use. Deactivate first."
        )
    
    db.delete(school)
    db.commit()
    
    return None


@router.post("/{school_id}/activate", response_model=SchoolResponse)
async def activate_school(
    school_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Activate a school (soft undelete).
    """
    school = db.query(SchoolAccount).filter(SchoolAccount.id == school_id).first()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School with ID {school_id} not found"
        )
    
    school.is_active = True
    db.commit()
    db.refresh(school)
    
    district_name = school.district.district_name if school.district else None
    
    return SchoolResponse(
        id=school.id,
        district_id=school.district_id,
        district_name=district_name,
        school_name=school.school_name,
        school_code=school.school_code,
        address=school.address,
        city=school.city,
        state=school.state,
        postal_code=school.postal_code,
        principal_name=school.principal_name,
        principal_email=school.principal_email,
        admin_email=school.admin_email,
        seats_allocated=school.seats_allocated,
        seats_used=school.seats_used,
        is_active=school.is_active,
        created_at=school.created_at.isoformat() if school.created_at else None,
        updated_at=school.updated_at.isoformat() if school.updated_at else None,
    )


@router.post("/{school_id}/deactivate", response_model=SchoolResponse)
async def deactivate_school(
    school_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin),
):
    """
    Deactivate a school (soft delete).
    """
    school = db.query(SchoolAccount).filter(SchoolAccount.id == school_id).first()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"School with ID {school_id} not found"
        )
    
    school.is_active = False
    db.commit()
    db.refresh(school)
    
    district_name = school.district.district_name if school.district else None
    
    return SchoolResponse(
        id=school.id,
        district_id=school.district_id,
        district_name=district_name,
        school_name=school.school_name,
        school_code=school.school_code,
        address=school.address,
        city=school.city,
        state=school.state,
        postal_code=school.postal_code,
        principal_name=school.principal_name,
        principal_email=school.principal_email,
        admin_email=school.admin_email,
        seats_allocated=school.seats_allocated,
        seats_used=school.seats_used,
        is_active=school.is_active,
        created_at=school.created_at.isoformat() if school.created_at else None,
        updated_at=school.updated_at.isoformat() if school.updated_at else None,
    )
