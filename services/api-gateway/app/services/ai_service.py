"""
AI Service - Integration with AI Inference Service.

Handles:
- Brain-aware hint generation
- Adaptive explanations
- Feedback loop for brain adaptation
- Fallback handling
"""

import logging
from typing import Dict, List, Optional, Any
import httpx
from datetime import datetime

from app.core.config import settings
from app.models.homework import HomeworkSession, HomeworkStep
from app.models.learner import Learner

logger = logging.getLogger(__name__)


class AIService:
    """
    Service for AI-powered features via AI Inference Service.
    
    Features:
    - Brain cloning per learner
    - Diagnosis-specific adaptations
    - Real-time learning adaptation
    - Comprehensive fallback system
    """
    
    def __init__(self):
        self.inference_url = settings.AI_INFERENCE_URL
        self.timeout = httpx.Timeout(30.0, connect=10.0)
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client
    
    async def close(self):
        """Close HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
    
    async def ensure_brain_exists(self, learner: Learner) -> str:
        """
        Ensure brain instance exists for learner.
        
        Returns:
            brain_id: ID of the brain instance
        """
        brain_id = f"brain_{learner.id}"
        
        try:
            client = await self._get_client()
            
            # Check if brain exists
            response = await client.get(
                f"{self.inference_url}/v1/brain/{brain_id}"
            )
            
            if response.status_code == 200:
                logger.debug(f"Brain {brain_id} already exists")
                return brain_id
            
        except httpx.HTTPError:
            # Brain doesn't exist, create it
            pass
        
        # Create brain
        try:
            logger.info(f"Creating brain for learner {learner.id}")
            
            learning_profile = {
                "grade_level": learner.grade_level,
                "reading_level": (
                    learner.current_reading_level or
                    f"{learner.grade_level}th grade"
                ),
                "math_level": (
                    learner.current_math_level or
                    f"{learner.grade_level}th grade"
                ),
                "learning_style": "visual",  # Default, can be customized
                "diagnoses": learner.diagnoses or [],
                "accommodations": learner.accommodations or {},
                "subject_strengths": [],
                "subject_challenges": []
            }
            
            client = await self._get_client()
            response = await client.post(
                f"{self.inference_url}/v1/brain/create",
                json={
                    "learner_id": learner.id,
                    "learning_profile": learning_profile
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            logger.info(
                f"Created brain {brain_id} for "
                f"{learner.first_name} {learner.last_name}"
            )
            
            return brain_id
            
        except Exception as e:
            logger.error(f"Failed to create brain: {e}")
            return brain_id  # Return ID anyway, will use fallback
    
    async def generate_hint(
        self,
        session: HomeworkSession,
        student_question: Optional[str] = None
    ) -> str:
        """
        Generate adaptive hint using learner's brain instance.
        
        Args:
            session: Homework session with context
            student_question: Optional specific question from student
            
        Returns:
            Adaptive hint text
        """
        learner = session.learner
        
        # Ensure brain exists
        brain_id = await self.ensure_brain_exists(learner)
        
        # Build comprehensive problem context
        problem_context = {
            "subject": session.detected_subject or "General",
            "problem_statement": session.problem_statement,
            "current_step": session.current_step,
            "grade_level": learner.grade_level,
            "reading_level": (
                learner.current_reading_level or
                f"{learner.grade_level}th grade"
            ),
            "math_level": (
                learner.current_math_level or
                f"{learner.grade_level}th grade"
            ),
            "diagnoses": learner.diagnoses or [],
            "accommodations": learner.accommodations or {},
            "key_questions": session.key_questions or [],
            "completed_steps": session.completed_steps or [],
            "difficulty_adjustment": session.difficulty_adjustment
        }
        
        try:
            logger.info(
                f"Generating hint for {learner.first_name} "
                f"via brain {brain_id} "
                f"(subject: {session.detected_subject}, "
                f"step: {session.current_step}, "
                f"hint #{session.hints_given + 1})"
            )
            
            client = await self._get_client()
            response = await client.post(
                f"{self.inference_url}/v1/hint",
                json={
                    "learner_id": learner.id,
                    "problem_context": problem_context,
                    "student_question": student_question,
                    "hints_given": session.hints_given
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            hint_text = data.get("text", "")
            
            logger.info(
                f"Generated {len(hint_text)} char hint using "
                f"brain {brain_id} in "
                f"{data.get('processing_time', 0):.2f}s"
            )
            
            return hint_text
            
        except httpx.HTTPError as e:
            logger.error(f"AI service request failed: {e}")
            logger.warning("Falling back to static hints")
            return self._generate_fallback_hint(
                step=session.current_step,
                subject=session.detected_subject,
                diagnoses=learner.diagnoses
            )
        
        except Exception as e:
            logger.error(f"Unexpected error in hint generation: {e}")
            return self._generate_fallback_hint(
                step=session.current_step,
                subject=session.detected_subject,
                diagnoses=learner.diagnoses
            )
    
    async def generate_explanation(
        self,
        session: HomeworkSession,
        step: HomeworkStep,
        specific_question: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate detailed explanation using learner's brain instance.
        
        Args:
            session: Homework session
            step: Current step needing explanation
            specific_question: Specific question to address
            
        Returns:
            Dict with explanation text, examples, and resources
        """
        learner = session.learner
        
        # Ensure brain exists
        brain_id = await self.ensure_brain_exists(learner)
        
        # Build context
        problem_context = {
            "subject": session.detected_subject or "General",
            "problem_statement": session.problem_statement,
            "grade_level": learner.grade_level,
            "reading_level": (
                learner.current_reading_level or
                f"{learner.grade_level}th grade"
            ),
            "diagnoses": learner.diagnoses or [],
            "accommodations": learner.accommodations or {}
        }
        
        try:
            logger.info(
                f"Generating explanation for {learner.first_name} "
                f"via brain {brain_id} (concept: {step})"
            )
            
            client = await self._get_client()
            response = await client.post(
                f"{self.inference_url}/v1/explanation",
                json={
                    "learner_id": learner.id,
                    "problem_context": problem_context,
                    "concept": step,
                    "specific_question": specific_question
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            explanation = result.get("data", {})
            
            logger.info(f"Generated explanation via brain {brain_id}")
            
            return {
                "text": explanation.get("text", ""),
                "examples": explanation.get("examples", []),
                "visual_aids": explanation.get("visual_aids", []),
                "resources": self._get_learning_resources(
                    session.detected_subject,
                    step
                )
            }
            
        except httpx.HTTPError as e:
            logger.error(f"AI service request failed: {e}")
            return self._generate_fallback_explanation(
                step, session.detected_subject
            )
        
        except Exception as e:
            logger.error(f"Unexpected error in explanation generation: {e}")
            return self._generate_fallback_explanation(
                step, session.detected_subject
            )
    
    async def record_hint_feedback(
        self,
        session: HomeworkSession,
        hint_text: str,
        outcome: str,
        feedback: Optional[str] = None
    ):
        """
        Record feedback on hint to adapt brain.
        
        Args:
            session: Homework session
            hint_text: The hint that was given
            outcome: 'success', 'partial', or 'failure'
            feedback: Optional text feedback from student
        """
        learner = session.learner
        brain_id = f"brain_{learner.id}"
        
        interaction_data = {
            "interaction_type": "hint",
            "hint_text": hint_text,
            "subject": session.detected_subject,
            "step": session.current_step,
            "hints_given": session.hints_given,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            client = await self._get_client()
            await client.post(
                f"{self.inference_url}/v1/feedback",
                json={
                    "learner_id": learner.id,
                    "interaction_id": (
                        f"{session.id}_hint_{session.hints_given}"
                    ),
                    "feedback_type": "hint_outcome",
                    "outcome": outcome,
                    "details": {
                        **interaction_data,
                        "feedback": feedback
                    }
                }
            )
            
            logger.info(f"Recorded {outcome} feedback for brain {brain_id}")
            
        except Exception as e:
            logger.warning(f"Failed to record feedback (non-critical): {e}")
    
    async def adapt_brain_from_session(
        self,
        session: HomeworkSession,
        outcome: str
    ):
        """
        Adapt brain based on overall session outcome.
        
        Args:
            session: Completed homework session
            outcome: 'success', 'partial', or 'failure'
        """
        learner = session.learner
        brain_id = f"brain_{learner.id}"
        
        interaction_data = {
            "session_id": session.id,
            "subject": session.detected_subject,
            "total_hints": session.hints_given,
            "steps_completed": len(session.completed_steps or []),
            "time_spent": (
                session.updated_at - session.created_at
            ).total_seconds(),
            "difficulty_level": session.difficulty_adjustment,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            client = await self._get_client()
            await client.post(
                f"{self.inference_url}/v1/brain/{brain_id}/adapt",
                json={
                    "brain_id": brain_id,
                    "interaction_data": interaction_data,
                    "outcome": outcome
                }
            )
            
            logger.info(
                f"Adapted brain {brain_id} based on "
                f"session outcome: {outcome}"
            )
            
        except Exception as e:
            logger.warning(f"Failed to adapt brain (non-critical): {e}")
    
    async def analyze_homework_content(
        self,
        text: str,
        learner: Optional[Learner] = None
    ) -> Dict[str, Any]:
        """
        Analyze homework content to detect subject, grade level, etc.
        
        Args:
            text: Homework text to analyze
            learner: Optional learner for context
            
        Returns:
            Dict with subject, grade_level, key_concepts, difficulty
        """
        try:
            context = {}
            if learner:
                context = {
                    "grade_level": learner.grade_level,
                    "reading_level": learner.current_reading_level,
                    "diagnoses": learner.diagnoses
                }
            
            client = await self._get_client()
            response = await client.post(
                f"{self.inference_url}/v1/generate",
                json={
                    "learner_id": learner.id if learner else None,
                    "prompt": self._build_analysis_prompt(text),
                    "context": context,
                    "max_tokens": 300
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            analysis_text = data.get("text", "")
            
            # Parse analysis (simplified)
            analysis = self._parse_analysis(analysis_text)
            
            logger.info(f"Analyzed content: {analysis}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"Content analysis failed: {e}")
            return {
                "subject": "Unknown",
                "grade_level": "Unknown",
                "key_concepts": [],
                "difficulty": "medium"
            }
    
    # ========================================
    # FALLBACK METHODS
    # ========================================
    
    def _generate_fallback_hint(
        self,
        step: HomeworkStep,
        subject: Optional[str] = None,
        diagnoses: Optional[List[str]] = None
    ) -> str:
        """
        Generate fallback hint when AI service is unavailable.
        
        Uses diagnosis-specific templates for better UX.
        """
        diagnoses = diagnoses or []
        
        # Diagnosis-specific fallbacks
        if "ADHD" in diagnoses:
            fallbacks = {
                HomeworkStep.UNDERSTAND: (
                    "Let's focus on ONE thing:\n"
                    "• Read the question\n"
                    "• What are you trying to find?\n\n"
                    "Take it slow! 🎯"
                ),
                HomeworkStep.PLAN: (
                    "Pick ONE strategy:\n"
                    "• Draw it\n"
                    "• Make a list\n"
                    "• Write steps\n\n"
                    "Which feels right? 💡"
                ),
                HomeworkStep.SOLVE: (
                    "Take it step by step:\n"
                    "1. Do first step\n"
                    "2. Check it\n"
                    "3. Next step\n\n"
                    "You've got this! 💪"
                ),
                HomeworkStep.CHECK: (
                    "Quick check:\n"
                    "• Did you answer the question?\n"
                    "• Does it make sense?\n\n"
                    "Great work! ✨"
                )
            }
        elif "ASD" in diagnoses:
            fallbacks = {
                HomeworkStep.UNDERSTAND: (
                    "Step 1: Read the problem.\n"
                    "Step 2: Identify what you know (write it down).\n"
                    "Step 3: Identify what you need to find (underline it)."
                ),
                HomeworkStep.PLAN: (
                    "Step 1: Think of a similar problem.\n"
                    "Step 2: Choose one strategy (draw, list, equation).\n"
                    "Step 3: Write out your steps in order."
                ),
                HomeworkStep.SOLVE: (
                    "Step 1: Follow your plan exactly.\n"
                    "Step 2: Show each step clearly.\n"
                    "Step 3: Label what you're doing at each step."
                ),
                HomeworkStep.CHECK: (
                    "Step 1: Reread the question.\n"
                    "Step 2: Check your calculations.\n"
                    "Step 3: Verify your answer makes sense."
                )
            }
        elif "Dyslexia" in diagnoses:
            fallbacks = {
                HomeworkStep.UNDERSTAND: (
                    "Read it slowly.\n"
                    "What do you know?\n"
                    "What do you need?\n"
                    "Say it out loud."
                ),
                HomeworkStep.PLAN: (
                    "What can you do?\n"
                    "Pick one way.\n"
                    "Draw it if you can.\n"
                    "Make it simple."
                ),
                HomeworkStep.SOLVE: (
                    "Go slow.\n"
                    "One step.\n"
                    "Then next step.\n"
                    "You can do it!"
                ),
                HomeworkStep.CHECK: (
                    "Read it again.\n"
                    "Did you answer it?\n"
                    "Does it make sense?\n"
                    "Good job!"
                )
            }
        else:
            # General fallbacks
            fallbacks = {
                HomeworkStep.UNDERSTAND: (
                    "Start by reading the problem carefully. "
                    "What information do you have? "
                    "What are you trying to find?"
                ),
                HomeworkStep.PLAN: (
                    "Think about similar problems you've solved before. "
                    "What strategy worked? "
                    "Can you break this into smaller steps?"
                ),
                HomeworkStep.SOLVE: (
                    "Take it one step at a time. "
                    "Write down each step of your work. "
                    "If you get stuck, try a different approach."
                ),
                HomeworkStep.CHECK: (
                    "Read your answer. Does it make sense? "
                    "Did you answer all parts of the question? "
                    "Can you check your work another way?"
                )
            }
        
        hint = fallbacks.get(
            step,
            "Take your time and work through the problem step by step. "
            "You've got this!"
        )
        
        # Add subject-specific tip if available
        if subject == "Math":
            hint += (
                "\n\n💡 Math tip: Draw a picture or diagram "
                "to visualize the problem!"
            )
        elif subject == "Reading":
            hint += (
                "\n\n💡 Reading tip: Look for evidence in the text "
                "to support your answer!"
            )
        
        return hint
    
    def _generate_fallback_explanation(
        self,
        step: HomeworkStep,
        subject: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate fallback explanation."""
        explanations = {
            HomeworkStep.UNDERSTAND: {
                "text": (
                    "Understanding the problem is the first and most "
                    "important step. Read it carefully, maybe twice. "
                    "Look for what you know (given information) and "
                    "what you need to find (the question). Highlight "
                    "or underline key words. Try to restate the problem "
                    "in your own words."
                ),
                "examples": [
                    "If the problem says 'Sarah has 5 apples and gives "
                    "2 away', you KNOW: Sarah starts with 5 apples. "
                    "You NEED TO FIND: How many she has left."
                ]
            },
            HomeworkStep.PLAN: {
                "text": (
                    "Planning means choosing a strategy before you start "
                    "solving. Think about what worked before. Will you "
                    "draw a picture? Make a table? Write an equation? "
                    "Breaking the problem into smaller steps makes it easier."
                ),
                "examples": [
                    "For word problems, drawing a picture often helps.",
                    "For multi-step problems, list out each step "
                    "before you start."
                ]
            },
            HomeworkStep.SOLVE: {
                "text": (
                    "Now it's time to follow your plan! Work step by step, "
                    "showing your thinking clearly. Label each step so you "
                    "(and others) can follow your work. If you get stuck, "
                    "it's okay to try a different approach."
                ),
                "examples": [
                    "Show all your calculations.",
                    "Use clear labels (Step 1, Step 2, etc.).",
                    "Don't erase mistakes - cross them out and try again."
                ]
            },
            HomeworkStep.CHECK: {
                "text": (
                    "Checking is how you catch mistakes! Reread the "
                    "question to make sure you answered what was asked. "
                    "Check your calculations. Think about whether your "
                    "answer makes sense in real life. Try solving a "
                    "different way to verify."
                ),
                "examples": [
                    "If you got a negative number for 'number of apples', "
                    "something's wrong!",
                    "Try working backwards from your answer.",
                    "Use the inverse operation to check (if you added, "
                    "try subtracting)."
                ]
            }
        }
        
        return {
            **explanations.get(
                step,
                {
                    "text": "Let's work through this together!",
                    "examples": []
                }
            ),
            "visual_aids": [],
            "resources": self._get_learning_resources(subject, step)
        }
    
    def _get_learning_resources(
        self,
        subject: Optional[str],
        step: HomeworkStep
    ) -> List[Dict[str, str]]:
        """Get relevant learning resources."""
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
                "url": "https://www.readingrockets.org/strategies"
            })
        
        return resources
    
    def _build_analysis_prompt(self, text: str) -> str:
        """Build prompt for content analysis."""
        return f"""Analyze this homework problem and identify:
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
    
    def _parse_analysis(self, text: str) -> Dict[str, Any]:
        """Parse analysis text into structured data."""
        analysis = {
            "subject": "Unknown",
            "grade_level": "Unknown",
            "key_concepts": [],
            "difficulty": "medium"
        }
        
        lines = text.split('\n')
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
                analysis["difficulty"] = (
                    line.split(":", 1)[1].strip().lower()
                )
        
        return analysis


# Global AI service instance
ai_service = AIService()
