"""AI service for AI-powered features."""
import logging
from typing import Dict, List, Optional

import httpx

from app.core.config import settings  # type: ignore[import-not-found]
from app.models.homework import (  # type: ignore[import-not-found]
    HomeworkSession,
    HomeworkStep
)
from app.models.learner import Learner  # type: ignore[import-not-found]

logger = logging.getLogger(__name__)


class AIService:
    """
    Service for AI-powered features.

    Integrates with:
    - AI Inference Service (brain cloning)
    - OpenAI/Anthropic APIs
    - Custom fine-tuned models
    """

    def __init__(self):
        self.inference_url = settings.AI_INFERENCE_URL
        self.model_name = settings.AI_MODEL_NAME
        self.temperature = settings.TEMPERATURE
        self.max_tokens = settings.MAX_TOKENS

    async def generate_hint(
        self,
        session: HomeworkSession,
        student_question: Optional[str] = None
    ) -> str:
        """
        Generate adaptive hint for homework session.

        Considers:
        - Current step
        - Problem context
        - Student's reading level
        - Previous hints given
        - IEP accommodations
        """
        # Build context
        context = self._build_homework_context(session)

        # Build prompt
        prompt = self._build_hint_prompt(
            context=context,
            current_step=session.current_step,
            student_question=student_question,
            hints_given=session.hints_given
        )

        # Call AI service
        response = await self._call_ai_inference(prompt)

        return response

    async def generate_explanation(
        self,
        session: HomeworkSession,
        step: HomeworkStep,
        specific_question: Optional[str] = None
    ) -> Dict:
        """
        Generate detailed explanation for a step or concept.

        Returns:
            dict: {
                "text": str,
                "resources": List[Dict]
            }
        """
        context = self._build_homework_context(session)

        prompt = self._build_explanation_prompt(
            context=context,
            step=step,
            specific_question=specific_question
        )

        response = await self._call_ai_inference(prompt)

        # Parse response
        # In production, this would parse structured output
        return {
            "text": response,
            "resources": self._get_learning_resources(
                session.detected_subject,
                step
            )
        }

    def _build_homework_context(self, session: HomeworkSession) -> Dict:
        """Build context for AI prompts."""
        return {
            "problem_statement": session.problem_statement,
            "subject": session.detected_subject or "General",
            "grade_level": session.detected_grade or "Unknown",
            "target_level": session.target_level or session.detected_grade,
            "key_questions": session.key_questions or [],
            "extracted_content": session.extracted_content or {},
            "completed_steps": session.completed_steps or [],
            "settings": session.settings or {}
        }

    def _build_hint_prompt(
        self,
        context: Dict,
        current_step: HomeworkStep,
        student_question: Optional[str],
        hints_given: int
    ) -> str:
        """Build prompt for hint generation."""
        step_descriptions = {
            HomeworkStep.UNDERSTAND: "understanding what the problem is asking",
            HomeworkStep.PLAN: "planning their approach to solve the problem",
            HomeworkStep.SOLVE: "solving the problem step by step",
            HomeworkStep.CHECK: "checking their work and reflecting"
        }

        prompt = f"""You are a supportive homework helper for a student working on {context['subject']}.

Problem: {context['problem_statement']}

Student is currently: {step_descriptions.get(current_step, 'working on the problem')}

Student's level: {context['target_level']}
Hints already given: {hints_given}

{"Student's specific question: " + student_question if student_question else ""}

Provide a helpful hint that:
1. Guides without giving away the answer
2. Uses simple, age-appropriate language
3. Encourages the student to think
4. Builds confidence
5. Is specific to their current step

Hint:"""

        return prompt

    def _build_explanation_prompt(
        self,
        context: Dict,
        step: HomeworkStep,
        specific_question: Optional[str]
    ) -> str:
        """Build prompt for explanation generation."""
        prompt = f"""You are an expert teacher explaining a {context['subject']} concept to a student.

Problem: {context['problem_statement']}

Student needs help with: {step}
{"Specific question: " + specific_question if specific_question else ""}

Student's level: {context['target_level']}

Provide a clear, step-by-step explanation that:
1. Breaks down the concept into simple parts
2. Uses examples the student can relate to
3. Avoids jargon or defines it clearly
4. Includes visual descriptions where helpful
5. Ends with a check for understanding

Explanation:"""

        return prompt

    async def _call_ai_inference(self, prompt: str) -> str:
        """
        Call AI inference service.

        In production, this routes to the federated brain instance.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.inference_url}/v1/generate",
                    json={
                        "prompt": prompt,
                        "model": self.model_name,
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    }
                )

                response.raise_for_status()

                data = response.json()
                return data.get("text", "")

        except httpx.HTTPError as e:
            logger.error(f"AI inference failed: {e}")

            # Fallback to simple hint
            return self._generate_fallback_hint(prompt)

    def _generate_fallback_hint(self, prompt: str) -> str:
        """Generate simple fallback hint if AI service is unavailable."""
        fallback_hints = {
            "understand": "Start by reading the problem carefully. What information do you have? What are you trying to find?",
            "plan": "Think about similar problems you've solved before. What strategy worked? Can you break this into smaller steps?",
            "solve": "Take it one step at a time. Write down each step of your work. If you get stuck, try a different approach.",
            "check": "Read your answer. Does it make sense? Did you answer all parts of the question? Can you check your work another way?"
        }

        # Simple keyword matching
        for step, hint in fallback_hints.items():
            if step in prompt.lower():
                return hint

        return "Take your time and work through the problem step by step. You've got this!"

    def _get_learning_resources(
        self,
        subject: Optional[str],
        step: HomeworkStep
    ) -> List[Dict]:
        """Get relevant learning resources."""
        # In production, this would query a resource database
        # For now, return generic resources

        resources = []

        if subject == "Math":
            resources.append({
                "type": "video",
                "title": "Khan Academy: Math Basics",
                "url": "https://www.khanacademy.org/math"
            })
        elif subject == "Reading" or subject == "ELA":
            resources.append({
                "type": "article",
                "title": "Reading Strategies",
                "url": "https://example.com/reading-strategies"
            })

        return resources

    async def analyze_homework_content(
        self,
        text: str,
        learner: Optional[Learner] = None
    ) -> Dict:
        """
        Analyze homework content to detect subject, grade level, etc.

        Returns:
            dict: {
                "subject": str,
                "grade_level": str,
                "key_concepts": List[str],
                "difficulty": str
            }
        """
        prompt = f"""Analyze this homework problem and identify:
1. Subject (Math, Science, Reading, etc.)
2. Grade level (K-12)
3. Key concepts involved
4. Difficulty level (easy, medium, hard)

Problem:
{text}

Provide analysis in this format:
Subject: [subject]
Grade Level: [grade]
Key Concepts: [concept1, concept2, ...]
Difficulty: [level]"""

        response = await self._call_ai_inference(prompt)

        # Parse response (simplified)
        # In production, use structured output
        lines = response.split('\n')

        analysis = {
            "subject": "Unknown",
            "grade_level": "Unknown",
            "key_concepts": [],
            "difficulty": "medium"
        }

        for line in lines:
            if line.startswith("Subject:"):
                analysis["subject"] = line.split(":", 1)[1].strip()
            elif line.startswith("Grade Level:"):
                analysis["grade_level"] = line.split(":", 1)[1].strip()
            elif line.startswith("Key Concepts:"):
                concepts = line.split(":", 1)[1].strip()
                analysis["key_concepts"] = [
                    c.strip() for c in concepts.split(",")
                ]
            elif line.startswith("Difficulty:"):
                analysis["difficulty"] = line.split(":", 1)[1].strip().lower()

        return analysis
