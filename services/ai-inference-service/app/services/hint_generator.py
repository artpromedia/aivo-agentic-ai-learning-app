"""Adaptive hint generation for special education learners."""
from typing import Dict, Any, List
from app.models.brain_instance import (
    BrainInstance,
    HintRequest,
    HintResponse,
    ExplanationRequest,
    ExplanationResponse,
    DiagnosisType
)
from app.utils.prompt_templates import PromptTemplates


class HintGenerator:
    """Generates adaptive hints based on learner profile."""

    def __init__(self):
        """Initialize hint generator."""
        self.templates = PromptTemplates()

    async def generate_hint(
        self,
        brain: BrainInstance,
        hint_request: HintRequest
    ) -> HintResponse:
        """Generate an adaptive hint for the learner."""
        # Determine complexity level
        complexity_level = (
            hint_request.hint_level
            or brain.learning_profile.preferred_complexity
        )

        # Build diagnosis-specific context
        diagnosis_context = self._build_diagnosis_context(brain)

        # Generate hint prompt
        prompt = self.templates.get_hint_template(
            problem_context=hint_request.problem_context,
            current_attempt=hint_request.current_attempt or "",
            complexity_level=complexity_level,
            learning_style=brain.learning_profile.learning_style.value,
            diagnoses=[d.value for d in brain.learning_profile.diagnoses],
            subject=hint_request.subject,
            grade_level=hint_request.grade_level
        )

        # In production, call inference engine
        # For now, return structured response
        hint_text = self._generate_hint_text(
            hint_request.problem_context,
            complexity_level,
            brain
        )

        # Generate follow-up questions
        follow_ups = self._generate_follow_ups(
            hint_request.problem_context,
            complexity_level
        )

        # Suggest visual aids if learner is visual
        visual_aids = []
        if brain.learning_profile.learning_style.value == "visual":
            visual_aids = self._suggest_visual_aids(
                hint_request.problem_context
            )

        return HintResponse(
            brain_id=brain.brain_id,
            hint_text=hint_text,
            complexity_level=complexity_level,
            estimated_support_level=brain.learning_profile.support_level,
            follow_up_questions=follow_ups,
            visual_aids_suggested=visual_aids,
            metadata={
                "prompt_used": prompt[:200],
                "diagnosis_adaptations": diagnosis_context
            }
        )

    def _generate_hint_text(
        self,
        problem_context: str,
        complexity_level: str,
        brain: BrainInstance
    ) -> str:
        """Generate hint text based on complexity and profile."""
        # Simplified version - in production, call inference engine
        base_hint = "Let's break down this problem step by step."

        if complexity_level == "simple":
            return (
                f"{base_hint} Focus on the first part: "
                f"what information do you have?"
            )
        elif complexity_level == "moderate":
            return (
                f"{base_hint} Think about: "
                f"1) What information is given? "
                f"2) What are you trying to find?"
            )
        else:  # detailed
            return (
                f"{base_hint} Consider these steps: "
                f"1) Identify all given information, "
                f"2) Determine what you need to find, "
                f"3) Think about strategies you've used before."
            )

    def _build_diagnosis_context(self, brain: BrainInstance) -> Dict[str, Any]:
        """Build context for diagnosis-specific adaptations."""
        context = {}

        for diagnosis in brain.learning_profile.diagnoses:
            if diagnosis == DiagnosisType.ADHD:
                context["adhd_adaptations"] = {
                    "short_chunks": True,
                    "clear_structure": True,
                    "frequent_breaks": True
                }
            elif diagnosis == DiagnosisType.ASD:
                context["asd_adaptations"] = {
                    "explicit_instructions": True,
                    "visual_supports": True,
                    "predictable_format": True
                }
            elif diagnosis == DiagnosisType.DYSLEXIA:
                context["dyslexia_adaptations"] = {
                    "phonetic_breakdown": True,
                    "visual_spelling": True,
                    "multi_sensory": True
                }

        return context

    def _generate_follow_ups(
        self,
        problem_context: str,
        complexity_level: str
    ) -> List[str]:
        """Generate follow-up questions."""
        if complexity_level == "simple":
            return [
                "What do you notice first?",
                "Can you point to the important information?"
            ]
        elif complexity_level == "moderate":
            return [
                "What strategy might work here?",
                "Have you seen a similar problem before?",
                "What's your first step?"
            ]
        else:  # detailed
            return [
                "What patterns do you see?",
                "How does this connect to what you learned before?",
                "What would happen if you tried a different approach?"
            ]

    def _suggest_visual_aids(self, problem_context: str) -> List[str]:
        """Suggest visual aids for visual learners."""
        return [
            "diagram",
            "number_line",
            "color_coding",
            "graphic_organizer"
        ]


class ExplanationGenerator:
    """Generates detailed explanations for concepts."""

    def __init__(self):
        """Initialize explanation generator."""
        self.templates = PromptTemplates()

    async def generate_explanation(
        self,
        brain: BrainInstance,
        explanation_request: ExplanationRequest
    ) -> ExplanationResponse:
        """Generate a detailed explanation."""
        complexity_level = brain.learning_profile.preferred_complexity

        # Build diagnosis-specific prompt
        prompt = self.templates.get_explanation_template(
            concept=explanation_request.concept,
            subject=explanation_request.subject,
            grade_level=explanation_request.grade_level,
            complexity_level=complexity_level,
            learning_style=brain.learning_profile.learning_style.value,
            diagnoses=[d.value for d in brain.learning_profile.diagnoses]
        )

        # In production, call inference engine
        explanation_text = self._generate_explanation_text(
            explanation_request.concept,
            complexity_level
        )

        examples = self._generate_examples(
            explanation_request.concept,
            complexity_level
        )

        analogies = self._generate_analogies(
            explanation_request.concept,
            brain.learning_profile.age
        )

        return ExplanationResponse(
            brain_id=brain.brain_id,
            explanation_text=explanation_text,
            examples=examples,
            analogies=analogies,
            complexity_level=complexity_level,
            metadata={
                "prompt_used": prompt[:200],
                "learning_style": brain.learning_profile.learning_style.value
            }
        )

    def _generate_explanation_text(
        self,
        concept: str,
        complexity_level: str
    ) -> str:
        """Generate explanation text."""
        # Simplified - in production, call inference engine
        if complexity_level == "simple":
            return (
                f"{concept} is a way to solve problems. "
                f"Let me show you a simple way to think about it."
            )
        elif complexity_level == "moderate":
            return (
                f"{concept} helps us understand and solve problems. "
                f"Here's how it works and why it's useful."
            )
        else:  # detailed
            return (
                f"{concept} is an important concept that connects to "
                f"many areas. Let me explain the key principles and "
                f"how they relate to what you already know."
            )

    def _generate_examples(
        self,
        concept: str,
        complexity_level: str
    ) -> List[str]:
        """Generate examples."""
        return [
            f"Example 1: Simple case of {concept}",
            f"Example 2: Real-world use of {concept}"
        ]

    def _generate_analogies(self, concept: str, age: int) -> List[str]:
        """Generate age-appropriate analogies."""
        if age < 10:
            return [
                f"{concept} is like building with blocks",
                f"Think of {concept} as sorting toys"
            ]
        else:
            return [
                f"{concept} is like planning a trip",
                f"Think of {concept} as organizing your schedule"
            ]
