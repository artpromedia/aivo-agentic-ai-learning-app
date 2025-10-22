"""Context builder utilities for AI inference."""
from typing import Dict, Any, List
from app.models.brain_instance import BrainInstance


class ContextBuilder:
    """Builds context for AI inference based on learner profile."""

    @staticmethod
    def build_learner_context(brain: BrainInstance) -> Dict[str, Any]:
        """Build learner context from brain instance."""
        profile = brain.learning_profile

        context = {
            "learner_id": brain.learner_id,
            "age": profile.age,
            "grade_level": profile.grade_level,
            "learning_style": profile.learning_style.value,
            "support_level": profile.support_level,
            "preferred_complexity": profile.preferred_complexity,
        }

        if profile.diagnoses:
            context["diagnoses"] = [d.value for d in profile.diagnoses]

        if profile.accommodations:
            context["accommodations"] = profile.accommodations

        if profile.strengths:
            context["strengths"] = profile.strengths

        if profile.challenges:
            context["challenges"] = profile.challenges

        return context

    @staticmethod
    def build_adaptation_context(
        brain: BrainInstance,
        recent_outcomes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build context for brain adaptation."""
        success_count = sum(
            1 for o in recent_outcomes if o.get("success", False)
        )
        total = len(recent_outcomes)
        success_rate = success_count / total if total > 0 else 0.0

        context = {
            "brain_id": brain.brain_id,
            "current_complexity": (
                brain.learning_profile.preferred_complexity
            ),
            "current_success_rate": brain.metrics.hint_success_rate,
            "recent_success_rate": success_rate,
            "total_interactions": brain.metrics.total_interactions,
            "adaptations_made": brain.metrics.adaptations_made,
        }

        return context

    @staticmethod
    def should_increase_complexity(
        current_rate: float,
        threshold: float = 0.8
    ) -> bool:
        """Determine if complexity should increase."""
        return current_rate >= threshold

    @staticmethod
    def should_decrease_complexity(
        current_rate: float,
        threshold: float = 0.4
    ) -> bool:
        """Determine if complexity should decrease."""
        return current_rate <= threshold
