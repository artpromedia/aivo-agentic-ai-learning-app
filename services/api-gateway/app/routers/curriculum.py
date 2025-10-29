"""
Curriculum API Router
Endpoints for curriculum standards and progress reporting
"""

from typing import Optional

from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.curriculum_service import CurriculumService

router = APIRouter(prefix="/api/curriculum", tags=["curriculum"])


@router.get("/standards")
async def get_standards(
    district_id: str = "default-district",
    domain: Optional[str] = None,
    grade_band: Optional[str] = None,
    sub_domain: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get curriculum standards for a district

    Query Parameters:
    - district_id: District identifier (default: "default-district")
    - domain: Filter by domain (reading, math, science, etc.)
    - grade_band: Filter by grade band (K-5, 6-8, 9-12)
    - sub_domain: Filter by sub-domain (optional)

    Returns:
        List of curriculum standards
    """
    try:
        if domain and grade_band:
            standards = CurriculumService.get_standards_for_domain(
                db=db,
                district_id=district_id,
                domain=domain,
                grade_band=grade_band,
                sub_domain=sub_domain,
            )
            return {
                "districtId": district_id,
                "domain": domain,
                "gradeBand": grade_band,
                "subDomain": sub_domain,
                "count": len(standards),
                "standards": standards,
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Both domain and grade_band are required",
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learners/{learner_id}/curriculum")
async def get_learner_curriculum(learner_id: str, db: Session = Depends(get_db)):
    """
    Get curriculum standards for a specific learner's district and grade

    Path Parameters:
    - learner_id: Learner identifier

    Returns:
        Curriculum organized by domain
    """
    try:
        curriculum = CurriculumService.get_district_curriculum(db=db, learner_id=learner_id)
        return curriculum
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learners/{learner_id}/progress")
async def get_learner_progress(
    learner_id: str,
    domain: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Get comprehensive progress report for a learner

    Path Parameters:
    - learner_id: Learner identifier

    Query Parameters:
    - domain: Filter by specific domain (optional)

    Returns:
        Progress report with coverage and mastery metrics
    """
    try:
        report = CurriculumService.get_learner_progress_report(
            db=db, learner_id=learner_id, domain=domain
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learners/{learner_id}/unassessed")
async def get_unassessed_standards(
    learner_id: str,
    domain: str,
    grade_band: str,
    limit: int = 5,
    db: Session = Depends(get_db),
):
    """
    Get priority standards that need assessment for a learner

    Path Parameters:
    - learner_id: Learner identifier

    Query Parameters:
    - domain: Domain to check (reading, math, science, etc.)
    - grade_band: Grade band (K-5, 6-8, 9-12)
    - limit: Maximum number of standards to return (default: 5)

    Returns:
        List of unassessed or under-assessed standards
    """
    try:
        unassessed = CurriculumService.get_unassessed_standards(
            db=db,
            learner_id=learner_id,
            domain=domain,
            grade_band=grade_band,
            limit=limit,
        )
        return {
            "learnerId": learner_id,
            "domain": domain,
            "gradeBand": grade_band,
            "count": len(unassessed),
            "standards": unassessed,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/items/{item_id}/standards")
async def map_item_standards(
    item_id: str,
    standard_codes: list[str],
    alignment_strength: str = "primary",
    verified_by: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Map an assessment item to curriculum standards

    Path Parameters:
    - item_id: Assessment item identifier

    Request Body:
    - standard_codes: List of standard codes (e.g., ["CCSS.ELA-LITERACY.RL.K-5.1"])
    - alignment_strength: "primary", "secondary", or "tangential" (default: "primary")
    - verified_by: Email of educator verifying alignment (optional)

    Returns:
        Success confirmation
    """
    try:
        if alignment_strength not in ["primary", "secondary", "tangential"]:
            raise HTTPException(
                status_code=400,
                detail="alignment_strength must be primary, secondary, or tangential",
            )

        CurriculumService.map_item_to_standards(
            db=db,
            item_id=item_id,
            standard_codes=standard_codes,
            alignment_strength=alignment_strength,
            verified_by=verified_by,
        )

        return {
            "success": True,
            "itemId": item_id,
            "standardsMapped": len(standard_codes),
            "alignmentStrength": alignment_strength,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
