"""
District Detection Service.

Identifies learner's school district and creates district-aware brain.
"""

import logging
from typing import Dict, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class DistrictDetectionService:
    """Detect and assign school district to learner."""
    
    def __init__(self):
        self.ai_inference_url = settings.AI_INFERENCE_URL
    
    async def detect_and_assign_district(
        self,
        learner_id: str,
        learning_profile: Dict[str, Any],
        location_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Detect district and create district-aware brain.
        
        Process:
        1. Identify school district from location
        2. Request district-aware brain from AI service
        3. Return district info for learner profile
        
        Args:
            learner_id: Unique learner identifier
            learning_profile: {
                "grade_level": 6,
                "reading_level": "6th grade",
                "math_level": "6th grade",
                "diagnoses": ["ADHD"],
                "accommodations": {}
            }
            location_data: {
                "postal_code": "90001",
                "school_name": "MLK Middle School",
                "city": "Los Angeles",
                "state": "CA",
                "country_code": "US"
            }
        
        Returns:
            District information dict
        """
        logger.info(
            f"Detecting district for learner {learner_id} "
            f"at location: {location_data.get('postal_code', 'Unknown')}"
        )
        
        try:
            # Call AI service to clone district-aware brain
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ai_inference_url}/v1/brain/create-district-aware",
                    json={
                        "learner_id": learner_id,
                        "learning_profile": learning_profile,
                        "location_data": location_data
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                district_info = result.get("data", {}).get("district_info", {})
                
                if district_info:
                    logger.info(
                        f"✅ Assigned learner {learner_id} to district: "
                        f"{district_info.get('district_name', 'Unknown')}"
                    )
                else:
                    logger.warning(
                        f"No district detected for learner {learner_id}"
                    )
                
                return district_info
        
        except httpx.HTTPError as e:
            logger.error(f"District detection failed: {e}", exc_info=True)
            # Return empty district info on failure
            return {}
        except Exception as e:
            logger.error(
                f"Unexpected error in district detection: {e}",
                exc_info=True
            )
            return {}
    
    def validate_location_data(
        self,
        location_data: Dict[str, Any]
    ) -> bool:
        """
        Validate that location data has minimum required fields.
        
        At least one of: postal_code, school_name, or coordinates
        """
        has_postal = bool(location_data.get("postal_code"))
        has_school = bool(location_data.get("school_name"))
        has_coords = bool(
            location_data.get("latitude") and location_data.get("longitude")
        )
        
        return has_postal or has_school or has_coords
    
    def format_district_info_for_storage(
        self,
        district_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Format district info for storage in learner settings.
        
        Extracts only the necessary fields to avoid storing too much data.
        """
        if not district_info:
            return {}
        
        return {
            "district_id": district_info.get("district_id"),
            "district_name": district_info.get("district_name"),
            "standards_count": district_info.get("standards_count", 0),
            "current_quarter": district_info.get("current_quarter"),
            "detected_at": district_info.get("detected_at")
        }
