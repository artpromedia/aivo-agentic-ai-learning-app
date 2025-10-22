"""Basic tests for AI Inference Service."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert "status" in data


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_brain_instance_creation():
    """Test brain instance model."""
    from app.models.brain_instance import (
        BrainInstance,
        LearningProfile,
        LearningStyle,
        BrainStatus
    )

    profile = LearningProfile(
        learner_id="test_learner",
        age=10,
        grade_level="5th grade",
        learning_style=LearningStyle.VISUAL,
        diagnoses=[],
        strengths=["reading"],
        challenges=["math"],
        accommodations=["extra time"],
        preferred_complexity="moderate",
        support_level="moderate"
    )

    brain = BrainInstance(
        brain_id="test_brain_123",
        learner_id="test_learner",
        base_model_name="gpt-4-turbo",
        base_model_version="1.0.0",
        learning_profile=profile,
        status=BrainStatus.ACTIVE
    )

    assert brain.brain_id == "test_brain_123"
    assert brain.learner_id == "test_learner"
    assert brain.status == BrainStatus.ACTIVE


def test_record_interaction():
    """Test recording brain interactions."""
    from app.models.brain_instance import (
        BrainInstance,
        LearningProfile,
        LearningStyle,
        BrainStatus
    )

    profile = LearningProfile(
        learner_id="test_learner",
        age=10,
        grade_level="5th grade",
        learning_style=LearningStyle.VISUAL
    )

    brain = BrainInstance(
        brain_id="test_brain_123",
        learner_id="test_learner",
        base_model_name="gpt-4-turbo",
        base_model_version="1.0.0",
        learning_profile=profile,
        status=BrainStatus.ACTIVE
    )

    # Record successful interaction
    brain.record_interaction(
        success=True,
        complexity_used="moderate",
        tokens=100,
        response_time_ms=500.0
    )

    assert brain.metrics.total_interactions == 1
    assert brain.metrics.successful_hints == 1
    assert brain.metrics.hint_success_rate == 1.0
    assert brain.metrics.total_tokens_used == 100


def test_prompt_templates():
    """Test prompt template generation."""
    from app.utils.prompt_templates import PromptTemplates

    templates = PromptTemplates()

    hint_prompt = templates.get_hint_template(
        problem_context="Solve 2 + 2",
        current_attempt="3",
        complexity_level="moderate",
        learning_style="visual",
        diagnoses=["adhd"],
        subject="math",
        grade_level="2nd grade"
    )

    assert "2nd grade" in hint_prompt
    assert "math" in hint_prompt
    assert "visual" in hint_prompt
    assert "moderate" in hint_prompt
    assert "adhd" in hint_prompt.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
