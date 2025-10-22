"""
AI Inference Generation Endpoints.

Features:
- Brain-aware generation
- Diagnosis-specific adaptations
- Learning style optimization
- Context-aware responses
"""

from fastapi import APIRouter, HTTPException, status
from typing import Optional, Dict, Any
import time
import logging
import re

from app.models.brain_instance import (
    InferenceRequest,
    InferenceResponse,
    LearningProfile,
    LearningStyle
)
from app.core.brain_manager import brain_manager
from app.services.hint_generator import HintGenerator, ExplanationGenerator
from app.services.inference import InferenceEngine
from app.utils.prompt_templates import PromptTemplates

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
hint_generator = HintGenerator()
explanation_generator = ExplanationGenerator()
inference_engine = InferenceEngine()
templates = PromptTemplates()


@router.post("/generate", response_model=InferenceResponse)
async def generate_text(request: InferenceRequest):
    """
    Generate AI text response with brain-aware personalization.
    
    **Brain-Aware Features:**
    - Uses learner's brain instance if available
    - Adapts to diagnosis-specific needs
    - Adjusts for reading level
    - Applies learning style preferences
    
    **Usage:**
    ```json
    {
        "learner_id": "learner_123",
        "prompt": "Explain photosynthesis",
        "simplify_language": true,
        "reading_level_target": "5th grade"
    }
    ```
    """
    start_time = time.time()
    
    try:
        brain = None
        
        # Get or create brain instance if learner specified
        if request.brain_id or request.learner_id:
            learner_id = (
                request.learner_id or
                request.brain_id.replace("brain_", "")
            )
            
            # Create learning profile from request context
            profile = _create_learning_profile_from_request(request)
            
            brain = await brain_manager.get_or_create_brain(
                learner_id=learner_id,
                learning_profile=profile
            )
            
            logger.info(f"Using brain {brain.brain_id} for generation")
        
        # Enhance prompt based on brain state
        enhanced_prompt = request.prompt
        
        if brain:
            enhanced_prompt = _enhance_prompt_with_brain_context(
                prompt=request.prompt,
                brain=brain,
                simplify=request.simplify_language,
                target_level=request.reading_level_target
            )
        
        # Get generation parameters
        generation_params = _get_generation_params(brain, request)
        
        # Generate response
        text = await inference_engine.generate(
            prompt=enhanced_prompt,
            **generation_params
        )
        
        # Post-process for accessibility
        if request.simplify_language and brain:
            text = _simplify_for_reading_level(
                text=text,
                target_level=brain.learning_profile.reading_level
            )
        
        processing_time = time.time() - start_time
        
        # Log for analytics
        logger.info(
            f"Generated {len(text)} chars in {processing_time:.2f}s "
            f"using {inference_engine.provider} "
            f"(brain: {brain.brain_id if brain else 'none'})"
        )
        
        return InferenceResponse(
            text=text,
            brain_id=brain.brain_id if brain else None,
            model_used=inference_engine.provider,
            tokens_used=len(text) // 4,
            processing_time=processing_time,
            confidence=0.85,
            reading_level=request.reading_level_target
        )
        
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )


@router.post("/hint", response_model=InferenceResponse)
async def generate_hint(
    learner_id: str,
    problem_context: Dict[str, Any],
    student_question: Optional[str] = None,
    hints_given: int = 0
):
    """
    Generate adaptive hint using learner's brain instance.
    
    **Adaptive Features:**
    - Diagnosis-specific formatting (ADHD, ASD, Dyslexia, Anxiety)
    - Reading level adjustment
    - Learning style optimization
    - Progressive scaffolding
    - Encouragement based on attempt count
    
    **Example Request:**
    ```json
    {
        "learner_id": "jayden_ofem",
        "problem_context": {
            "subject": "Math",
            "problem_statement": "Solve: 3/4 × 1/3",
            "current_step": "solve",
            "grade_level": 6,
            "reading_level": "4th grade",
            "diagnoses": ["ADHD", "Dyslexia"]
        },
        "student_question": "How do I multiply fractions?",
        "hints_given": 1
    }
    ```
    """
    start_time = time.time()
    
    try:
        # Extract learning profile from context
        profile = _create_learning_profile_from_context(problem_context)
        
        # Get or create brain instance
        brain = await brain_manager.get_or_create_brain(
            learner_id=learner_id,
            learning_profile=profile
        )
        
        logger.info(
            f"Generating hint for {learner_id} using brain {brain.brain_id} "
            f"(hint #{hints_given + 1}, diagnoses: {profile.diagnoses})"
        )
        
        # Generate adaptive hint
        hint = await hint_generator.generate_hint(
            brain=brain,
            problem_context=problem_context,
            student_question=student_question,
            hints_given=hints_given
        )
        
        # Add encouragement based on hint count
        encouragement_suffix = templates.get_hint_count_suffix(hints_given)
        hint = hint + encouragement_suffix
        
        processing_time = time.time() - start_time
        
        # Update brain metrics
        brain.metrics.total_interactions += 1
        brain.last_active = time.time()
        
        return InferenceResponse(
            text=hint,
            brain_id=brain.brain_id,
            model_used=inference_engine.provider,
            tokens_used=len(hint) // 4,
            processing_time=processing_time,
            confidence=0.9,
            reading_level=profile.reading_level
        )
        
    except Exception as e:
        logger.error(f"Hint generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hint generation failed: {str(e)}"
        )


@router.post("/explanation", response_model=Dict[str, Any])
async def generate_explanation(
    learner_id: str,
    problem_context: Dict[str, Any],
    concept: str,
    specific_question: Optional[str] = None
):
    """
    Generate comprehensive explanation with examples.
    
    **Returns:**
    - Main explanation text
    - Visual aids suggestions
    - Practice problems
    - Related concepts
    
    **Example Request:**
    ```json
    {
        "learner_id": "jason_ofem",
        "problem_context": {
            "subject": "Math",
            "grade_level": 9,
            "diagnoses": ["ASD", "Anxiety"]
        },
        "concept": "quadratic equations",
        "specific_question": "What is factoring?"
    }
    ```
    """
    start_time = time.time()
    
    try:
        # Extract learning profile
        profile = _create_learning_profile_from_context(problem_context)
        
        # Get brain instance
        brain = await brain_manager.get_or_create_brain(
            learner_id=learner_id,
            learning_profile=profile
        )
        
        logger.info(
            f"Generating explanation for {learner_id} on '{concept}' "
            f"(diagnoses: {profile.diagnoses})"
        )
        
        # Generate structured explanation
        explanation = await explanation_generator.generate_explanation(
            brain=brain,
            problem_context=problem_context,
            concept=concept,
            specific_question=specific_question
        )
        
        processing_time = time.time() - start_time
        
        # Add metadata
        result = {
            "success": True,
            "data": {
                **explanation,
                "brain_id": brain.brain_id,
                "adapted_for": profile.diagnoses,
                "reading_level": profile.reading_level,
                "processing_time": processing_time
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Explanation generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explanation generation failed: {str(e)}"
        )


@router.post("/feedback")
async def record_feedback(
    learner_id: str,
    interaction_id: str,
    feedback_type: str,
    outcome: str,
    details: Optional[Dict[str, Any]] = None
):
    """
    Record feedback on AI response for brain adaptation.
    
    **Feedback Types:**
    - `helpful`: Response was helpful
    - `confusing`: Response was confusing
    - `too_hard`: Content too complex
    - `too_easy`: Content too simple
    - `off_topic`: Response didn't address question
    
    **Outcomes:**
    - `success`: Student understood and progressed
    - `partial`: Student partially understood
    - `failure`: Student still confused
    
    **Usage:**
    This feeds into brain's adaptive learning to improve future responses.
    """
    try:
        brain_id = f"brain_{learner_id}"
        
        # Prepare interaction data
        interaction_data = {
            "interaction_id": interaction_id,
            "feedback_type": feedback_type,
            "timestamp": time.time(),
            "details": details or {}
        }
        
        # Adapt brain based on feedback
        await brain_manager.adapt_brain(
            brain_id=brain_id,
            interaction_data=interaction_data,
            outcome=outcome
        )
        
        logger.info(
            f"Recorded {outcome} feedback ({feedback_type}) "
            f"for {brain_id}"
        )
        
        return {
            "success": True,
            "data": {
                "message": "Feedback recorded successfully",
                "brain_id": brain_id,
                "feedback_type": feedback_type,
                "outcome": outcome
            }
        }
        
    except Exception as e:
        logger.error(f"Feedback recording failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feedback recording failed: {str(e)}"
        )


# ========================================
# HELPER FUNCTIONS
# ========================================

def _create_learning_profile_from_request(
    request: InferenceRequest
) -> LearningProfile:
    """Create learning profile from inference request."""
    context = request.context or {}
    return LearningProfile(
        grade_level=context.get("grade_level", 9),
        reading_level=request.reading_level_target or "9th grade",
        math_level="9th grade",
        learning_style=LearningStyle.VISUAL,
        diagnoses=context.get("diagnoses", []),
        accommodations=context.get("accommodations", {}),
        use_examples=request.include_examples,
        use_visuals=request.include_visuals
    )


def _create_learning_profile_from_context(
    context: Dict[str, Any]
) -> LearningProfile:
    """Create learning profile from problem context."""
    return LearningProfile(
        grade_level=context.get("grade_level", 9),
        reading_level=context.get("reading_level", "9th grade"),
        math_level=context.get("math_level", "9th grade"),
        learning_style=LearningStyle(
            context.get("learning_style", "visual")
        ),
        diagnoses=context.get("diagnoses", []),
        accommodations=context.get("accommodations", {}),
        subject_strengths=context.get("subject_strengths", []),
        subject_challenges=context.get("subject_challenges", [])
    )


def _enhance_prompt_with_brain_context(
    prompt: str,
    brain,
    simplify: bool,
    target_level: Optional[str]
) -> str:
    """Enhance prompt with brain-specific context."""
    enhancements = []
    
    # Add diagnosis-specific instructions
    if "ADHD" in brain.learning_profile.diagnoses:
        enhancements.append(
            "Keep response brief and focused. Use bullet points."
        )
    
    if "ASD" in brain.learning_profile.diagnoses:
        enhancements.append(
            "Be literal and concrete. No figurative language."
        )
    
    if "Dyslexia" in brain.learning_profile.diagnoses:
        enhancements.append("Use short sentences and simple words.")
    
    if "Anxiety" in brain.learning_profile.diagnoses:
        enhancements.append(
            "Use calm, reassuring tone. No time pressure."
        )
    
    # Add reading level instruction
    if target_level or simplify:
        level = target_level or brain.learning_profile.reading_level
        enhancements.append(
            f"Use language appropriate for {level} reading level."
        )
    
    # Add learning style preference
    learning_style = brain.learning_profile.learning_style
    if learning_style == LearningStyle.VISUAL:
        enhancements.append(
            "Include visual descriptions or suggest diagrams."
        )
    elif learning_style == LearningStyle.AUDITORY:
        enhancements.append(
            "Use conversational, easy-to-read-aloud language."
        )
    elif learning_style == LearningStyle.KINESTHETIC:
        enhancements.append(
            "Suggest hands-on or movement-based approaches."
        )
    
    # Combine
    if enhancements:
        enhancement_text = (
            "\n\nIMPORTANT ADAPTATIONS:\n" +
            "\n".join(f"- {e}" for e in enhancements)
        )
        return prompt + enhancement_text
    
    return prompt


def _get_generation_params(
    brain,
    request: InferenceRequest
) -> Dict[str, Any]:
    """Get generation parameters based on brain and request."""
    if brain:
        return {
            "temperature": brain.adaptation_state.get("temperature", 0.7),
            "max_tokens": (
                request.max_tokens or
                brain.adaptation_state.get("max_tokens", 500)
            ),
            "top_p": request.top_p or 0.9
        }
    else:
        return {
            "temperature": request.temperature or 0.7,
            "max_tokens": request.max_tokens or 500,
            "top_p": request.top_p or 0.9
        }


def _simplify_for_reading_level(text: str, target_level: str) -> str:
    """
    Simplify text for target reading level.
    
    In production: Use NLP tools like:
    - Flesch-Kincaid readability score
    - Vocabulary simplification
    - Sentence shortening
    """
    # Extract grade number
    match = re.search(r'(\d+)', target_level)
    grade = int(match.group(1)) if match else 9
    
    # Basic simplification rules
    if grade <= 3:
        # Primary grades - very simple
        # In production: Actually simplify vocabulary/sentence structure
        pass
    elif grade <= 5:
        # Upper elementary
        pass
    elif grade <= 8:
        # Middle school
        pass
    
    # For now, return as-is
    # In production, implement actual simplification
    return text
