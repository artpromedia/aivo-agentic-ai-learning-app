"""
Reference to curriculum service models.

Training service uses models from curriculum-service.
Import path: from curriculum-service/app/models/curriculum
"""

# In production, these would be properly imported
# For now, we reference them conceptually

class EducationalStandard:
    """
    Reference to curriculum service model.
    
    Attributes:
        code: str
        description: str
        grade_level: int
        subject: str
        domain: str
        cluster: str
    """
    pass


class BaseModelVersion:
    """
    Reference to curriculum service model.
    
    Attributes:
        version: str
        name: str
        base_model: str
        training_completed_at: datetime
        total_examples: int
        accuracy_score: float
        curriculum_alignment_score: float
        special_ed_optimization: bool
        status: str
        model_path: str
        config: dict
    """
    pass
