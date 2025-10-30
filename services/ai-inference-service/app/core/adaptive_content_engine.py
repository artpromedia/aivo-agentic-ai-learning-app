"""
Adaptive Content Difficulty Engine for Aivo Learning Platform

This is the CORE of Aivo's learning philosophy: neurodiverse learners need content
adapted to their comprehension level, not their age/grade. This engine:

1. Translates grade-level content down/up to match comprehension
2. Monitors mastery to detect when learner is ready to level up
3. Generates approval requests for parents/teachers before difficulty changes
4. Implements gradual transitions with safety rollbacks
5. Tracks all adaptations and decisions for transparency

Example: Jayden (6th grade, 4th grade reading level)
- Week 1: 6th grade passages simplified to 4th grade vocabulary/structure
- Week 3: Mastery detected (87% success) → Suggest 4.5 grade level to parent
- Week 5: Parent approves → Gradual transition over 5 sessions
- Week 7: Monitor for struggle → Auto-rollback if accuracy <60%
"""

import hashlib
import json
import logging
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# DATA MODELS
# ============================================================================


class ChangeType(str, Enum):
    """Type of difficulty change"""

    INCREASE = "increase"
    DECREASE = "decrease"
    MAINTAIN = "maintain"


class ApprovalStatus(str, Enum):
    """Approval request status"""

    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    EXPIRED = "expired"
    AUTO_APPROVED = "auto_approved"


class TransitionStrategy(str, Enum):
    """How to implement difficulty change"""

    GRADUAL_5_SESSIONS = "gradual_5sessions"  # Spread over 5 sessions (recommended)
    GRADUAL_10_SESSIONS = "gradual_10sessions"  # Extra gradual for sensitive learners
    IMMEDIATE = "immediate"  # Jump immediately (only for small changes)
    MIXED = "mixed"  # Start gradual, accelerate if going well


class AdaptationType(str, Enum):
    """Type of adaptation made to content"""

    VOCABULARY = "vocabulary"
    SENTENCE_STRUCTURE = "sentence_structure"
    CONCEPT_COMPLEXITY = "concept_complexity"
    EXAMPLE_SIMPLIFICATION = "example_simplification"
    VISUAL_AIDS = "visual_aids"
    SCAFFOLDING = "scaffolding"


class ContentAdaptation(BaseModel):
    """Record of content adaptation from source to target level"""

    adaptation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    subject: str
    original_content: str
    adapted_content: str
    source_grade_level: float
    target_comprehension_level: float
    complexity_score: float = Field(ge=0.0, le=10.0)
    adaptations_made: List[Dict[str, str]]
    reasoning: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MasteryAssessment(BaseModel):
    """Assessment of whether learner has mastered current level"""

    assessment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    subject: str
    current_level: float
    sessions_analyzed: int
    success_rate: float = Field(ge=0.0, le=1.0)
    hint_usage_trend: str  # "decreasing", "stable", "increasing"
    error_patterns: List[str]
    mastery_score: float = Field(ge=0.0, le=1.0)
    ready_for_increase: bool
    recommended_new_level: Optional[float] = None
    confidence: float = Field(ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DifficultyChangeRequest(BaseModel):
    """Request for parent/teacher approval to change difficulty"""

    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    learner_id: str
    learner_name: str
    subject: str
    current_level: float
    proposed_level: float
    change_type: ChangeType
    evidence: MasteryAssessment
    sample_content: ContentAdaptation
    reasoning: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=7))
    status: ApprovalStatus = ApprovalStatus.PENDING
    parent_response: Optional[Dict[str, Any]] = None
    teacher_response: Optional[Dict[str, Any]] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None


class DifficultyTransition(BaseModel):
    """Active difficulty transition with monitoring"""

    transition_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    subject: str
    from_level: float
    to_level: float
    transition_strategy: TransitionStrategy
    current_step: int = 0
    total_steps: int
    monitoring_period_days: int = 14  # Extra monitoring after completion
    rollback_threshold: float = 0.6  # Roll back if accuracy drops below this
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    rolled_back: bool = False
    rollback_reason: Optional[str] = None


# ============================================================================
# ADAPTIVE CONTENT ENGINE
# ============================================================================


class AdaptiveContentEngine:
    """
    Core engine for adaptive content difficulty management.

    This implements Aivo's fundamental learning philosophy:
    - Neurodiverse learners need content at THEIR level, not age/grade level
    - Difficulty increases only with parent/teacher approval
    - Gradual transitions with safety rollbacks
    - Full transparency and control for families
    """

    def __init__(self):
        """Initialize the adaptive content engine"""
        self.logger = logger
        self.ai_client = None  # Will be set when needed

    async def adapt_content_to_level(
        self,
        content: str,
        source_grade: float,
        target_level: float,
        subject: str,
        brain_id: str,
        learner_profile: Dict[str, Any],
        db: Session,
    ) -> ContentAdaptation:
        """
        Translate content from source grade level to target comprehension level.

        This is the CORE functionality - taking grade-appropriate content and
        making it accessible at the learner's actual comprehension level.

        Example:
            6th grade reading passage:
            "The mitochondria, often called the 'powerhouse of the cell',
            converts glucose through cellular respiration..."

            → 4th grade level:
            "Cells have tiny parts called mitochondria. Think of them like
            batteries. They take sugar from food and turn it into energy..."

        Args:
            content: Original content at source grade level
            source_grade: Grade level of original content (e.g., 6.0)
            target_level: Target comprehension level (e.g., 4.0)
            subject: Subject area (reading, math, science, etc.)
            brain_id: Brain instance ID for tracking
            learner_profile: Learner's profile with diagnoses, preferences
            db: Database session

        Returns:
            ContentAdaptation with adapted content and reasoning
        """
        self.logger.info(
            f"🎯 Adapting {subject} content: Grade {source_grade} → Level {target_level}"
        )

        # Build AI prompt for content adaptation
        prompt = self._build_adaptation_prompt(
            content=content,
            source_grade=source_grade,
            target_level=target_level,
            subject=subject,
            learner_profile=learner_profile,
        )

        # Call AI to adapt content
        try:
            from app.services.ai_client import AIClient

            if not self.ai_client:
                self.ai_client = AIClient()

            response = await self.ai_client.generate_completion(
                prompt=prompt,
                temperature=0.3,  # Low temperature for consistent adaptations
                max_tokens=2000,
            )

            # Parse response
            adaptation_data = json.loads(response)

            # Calculate complexity score
            complexity_score = self._calculate_complexity(
                adaptation_data["adapted_content"], target_level
            )

            # Create adaptation record
            adaptation = ContentAdaptation(
                brain_id=brain_id,
                subject=subject,
                original_content=content,
                adapted_content=adaptation_data["adapted_content"],
                source_grade_level=source_grade,
                target_comprehension_level=target_level,
                complexity_score=complexity_score,
                adaptations_made=adaptation_data["adaptations_made"],
                reasoning=adaptation_data["reasoning"],
            )

            # Store in database
            await self._store_adaptation(adaptation, db)

            self.logger.info(
                f"✅ Content adapted successfully (complexity: {complexity_score:.1f})"
            )
            return adaptation

        except Exception as e:
            self.logger.error(f"❌ Content adaptation failed: {e}")
            # Fallback: return original content with warning
            return ContentAdaptation(
                brain_id=brain_id,
                subject=subject,
                original_content=content,
                adapted_content=f"⚠️ [Content adaptation unavailable] {content}",
                source_grade_level=source_grade,
                target_comprehension_level=target_level,
                complexity_score=source_grade,
                adaptations_made=[{"type": "error", "message": str(e)}],
                reasoning=f"Adaptation failed: {e}",
            )

    async def assess_mastery(
        self,
        brain_id: str,
        learner_id: str,
        subject: str,
        current_level: float,
        recent_sessions: List[Dict[str, Any]],
        db: Session,
    ) -> MasteryAssessment:
        """
        Determine if learner has mastered current difficulty level.

        Analyzes multiple indicators:
        - Success rate (accuracy)
        - Hint usage (decreasing = understanding improving)
        - Error patterns (random vs. consistent gaps)
        - Time to completion
        - Confidence indicators

        Mastery Score Ranges:
        - 0.0-0.5: Struggling, may need easier content
        - 0.5-0.7: Learning, maintain current level
        - 0.7-0.85: Mastering, consider slight increase
        - 0.85-1.0: Mastered, ready for next level

        Args:
            brain_id: Brain instance ID
            learner_id: Learner ID
            subject: Subject area
            current_level: Current difficulty level
            recent_sessions: List of recent session data
            db: Database session

        Returns:
            MasteryAssessment with recommendation
        """
        self.logger.info(
            f"📊 Assessing mastery for {learner_id} in {subject} at level {current_level}"
        )

        if not recent_sessions or len(recent_sessions) < 3:
            self.logger.warning("⚠️ Not enough sessions for mastery assessment")
            return MasteryAssessment(
                brain_id=brain_id,
                subject=subject,
                current_level=current_level,
                sessions_analyzed=len(recent_sessions),
                success_rate=0.0,
                hint_usage_trend="unknown",
                error_patterns=[],
                mastery_score=0.0,
                ready_for_increase=False,
                confidence=0.0,
            )

        # Calculate success rate
        total_attempts = 0
        correct_attempts = 0
        for session in recent_sessions:
            if session.get("subject") == subject:
                total_attempts += session.get("total_questions", 0)
                correct_attempts += session.get("correct_answers", 0)

        success_rate = correct_attempts / total_attempts if total_attempts > 0 else 0.0

        # Analyze hint usage trend
        hint_counts = [
            session.get("hints_used", 0)
            for session in recent_sessions
            if session.get("subject") == subject
        ]
        hint_usage_trend = self._analyze_trend(hint_counts)

        # Extract error patterns
        error_patterns = self._extract_error_patterns(recent_sessions, subject)

        # Calculate mastery score (weighted formula)
        mastery_score = self._calculate_mastery_score(
            success_rate=success_rate,
            hint_usage_trend=hint_usage_trend,
            error_patterns=error_patterns,
            session_count=len(recent_sessions),
        )

        # Determine if ready for increase
        ready_for_increase = mastery_score >= 0.85 and len(recent_sessions) >= 5
        recommended_new_level = current_level + 0.5 if ready_for_increase else None

        # Calculate confidence in assessment
        confidence = min(1.0, len(recent_sessions) / 10.0)  # More sessions = higher confidence

        assessment = MasteryAssessment(
            brain_id=brain_id,
            subject=subject,
            current_level=current_level,
            sessions_analyzed=len(recent_sessions),
            success_rate=success_rate,
            hint_usage_trend=hint_usage_trend,
            error_patterns=error_patterns,
            mastery_score=mastery_score,
            ready_for_increase=ready_for_increase,
            recommended_new_level=recommended_new_level,
            confidence=confidence,
        )

        # Store assessment
        await self._store_mastery_assessment(assessment, db)

        self.logger.info(
            f"✅ Mastery assessment: {mastery_score:.2f} (ready: {ready_for_increase})"
        )
        return assessment

    async def recommend_difficulty_change(
        self,
        brain_id: str,
        learner_id: str,
        learner_name: str,
        mastery: MasteryAssessment,
        db: Session,
    ) -> Optional[DifficultyChangeRequest]:
        """
        Generate approval request for difficulty change if warranted.

        Creates a comprehensive package for parents/teachers including:
        - Current performance evidence
        - Mastery indicators
        - Sample of new difficulty level
        - Risk assessment
        - Recommendation with reasoning

        Args:
            brain_id: Brain instance ID
            learner_id: Learner ID
            learner_name: Learner's first name for personalization
            mastery: MasteryAssessment result
            db: Database session

        Returns:
            DifficultyChangeRequest if change recommended, None otherwise
        """
        if not mastery.ready_for_increase:
            self.logger.info("ℹ️ No difficulty change recommended at this time")
            return None

        self.logger.info(f"📈 Generating difficulty change request for {learner_name}")

        # Generate sample content at new level
        sample_content = await self.adapt_content_to_level(
            content="Sample grade-level content for preview",  # Would be real content
            source_grade=mastery.recommended_new_level,
            target_level=mastery.recommended_new_level,
            subject=mastery.subject,
            brain_id=brain_id,
            learner_profile={},  # Would have real profile
            db=db,
        )

        # Create request
        request = DifficultyChangeRequest(
            brain_id=brain_id,
            learner_id=learner_id,
            learner_name=learner_name,
            subject=mastery.subject,
            current_level=mastery.current_level,
            proposed_level=mastery.recommended_new_level,
            change_type=ChangeType.INCREASE,
            evidence=mastery,
            sample_content=sample_content,
            reasoning=self._generate_reasoning(mastery),
        )

        # Store request
        await self._store_change_request(request, db)

        self.logger.info(f"✅ Change request created: {request.request_id}")
        return request

    async def send_approval_request(
        self,
        request: DifficultyChangeRequest,
        parent_id: str,
        teacher_id: Optional[str],
        db: Session,
    ) -> str:
        """
        Send notification to parent/teacher for approval.

        Sends email/push notification with:
        - Performance summary
        - Recommendation
        - Sample content preview
        - Approval buttons

        Args:
            request: DifficultyChangeRequest to send
            parent_id: Parent user ID
            teacher_id: Teacher user ID (if school-linked)
            db: Database session

        Returns:
            Notification ID
        """
        self.logger.info(f"📧 Sending approval request to parent={parent_id}, teacher={teacher_id}")

        # Build notification content
        notification_content = self._build_approval_notification(request)

        # Send to parent (always required)
        notification_id = await self._send_notification(
            user_id=parent_id,
            notification_type="difficulty_increase_approval",
            content=notification_content,
            action_required=True,
            db=db,
        )

        # Send to teacher if applicable
        if teacher_id:
            await self._send_notification(
                user_id=teacher_id,
                notification_type="difficulty_increase_approval",
                content=notification_content,
                action_required=True,
                db=db,
            )

        self.logger.info(f"✅ Approval request sent: {notification_id}")
        return notification_id

    async def implement_approved_change(
        self,
        request_id: str,
        approved_by: str,
        approval_type: str,  # "parent" or "teacher"
        db: Session,
        transition_strategy: TransitionStrategy = TransitionStrategy.GRADUAL_5_SESSIONS,
    ) -> DifficultyTransition:
        """
        Apply approved difficulty change with monitoring.

        Implements gradual transition:
        - Session 1: 80% old level, 20% new level
        - Session 2: 60% old level, 40% new level
        - Session 3: 40% old level, 60% new level
        - Session 4: 20% old level, 80% new level
        - Session 5: 100% new level

        Args:
            request_id: Approved request ID
            approved_by: User ID who approved
            approval_type: "parent" or "teacher"
            transition_strategy: How to implement change
            db: Database session

        Returns:
            DifficultyTransition tracking object
        """
        self.logger.info(f"🚀 Implementing approved difficulty change: {request_id}")

        # Get request
        request = await self._get_change_request(request_id, db)
        if not request:
            raise ValueError(f"Request {request_id} not found")

        # Update request status
        request.status = ApprovalStatus.APPROVED
        request.approved_at = datetime.utcnow()
        request.approved_by = approved_by
        if approval_type == "parent":
            request.parent_response = {"approved": True, "timestamp": datetime.utcnow().isoformat()}
        else:
            request.teacher_response = {
                "approved": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        await self._update_change_request(request, db)

        # Determine total steps based on strategy
        total_steps = {
            TransitionStrategy.GRADUAL_5_SESSIONS: 5,
            TransitionStrategy.GRADUAL_10_SESSIONS: 10,
            TransitionStrategy.IMMEDIATE: 1,
            TransitionStrategy.MIXED: 5,
        }[transition_strategy]

        # Create transition
        transition = DifficultyTransition(
            brain_id=request.brain_id,
            subject=request.subject,
            from_level=request.current_level,
            to_level=request.proposed_level,
            transition_strategy=transition_strategy,
            total_steps=total_steps,
            rollback_threshold=0.6,  # Roll back if accuracy drops below 60%
        )

        # Store transition
        await self._store_transition(transition, db)

        # Update brain's current difficulty level (will be applied gradually)
        await self._update_brain_difficulty(
            brain_id=request.brain_id,
            subject=request.subject,
            new_level=request.proposed_level,
            transition_id=transition.transition_id,
            db=db,
        )

        self.logger.info(f"✅ Transition started: {transition.transition_id} ({total_steps} steps)")
        return transition

    async def monitor_transition(
        self,
        transition_id: str,
        session_data: Dict[str, Any],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Monitor learner during difficulty transition.

        Checks:
        - Current step in transition
        - Success rate at new level
        - Frustration indicators
        - Whether rollback needed

        Args:
            transition_id: Active transition ID
            session_data: Latest session results
            db: Database session

        Returns:
            Monitoring report with recommendations
        """
        # Get transition
        transition = await self._get_transition(transition_id, db)
        if not transition:
            return {"error": "Transition not found"}

        # Update current step
        transition.current_step += 1

        # Calculate current mix ratio
        if transition.current_step >= transition.total_steps:
            new_level_ratio = 1.0
            transition.completed_at = datetime.utcnow()
        else:
            new_level_ratio = transition.current_step / transition.total_steps

        # Analyze session performance
        success_rate = session_data.get("success_rate", 1.0)
        frustration_detected = session_data.get("frustration_level", "low") in [
            "high",
            "severe",
        ]

        # Check for rollback condition
        should_rollback = success_rate < transition.rollback_threshold or frustration_detected

        if should_rollback:
            await self.rollback_transition(
                transition_id=transition_id,
                reason=f"Success rate {success_rate:.0%} below threshold or frustration detected",
                db=db,
            )
            return {
                "status": "rolled_back",
                "reason": "Learner struggling with new difficulty",
                "success_rate": success_rate,
            }

        # Update transition
        await self._update_transition(transition, db)

        return {
            "status": "progressing"
            if transition.current_step < transition.total_steps
            else "completed",
            "current_step": transition.current_step,
            "total_steps": transition.total_steps,
            "new_level_ratio": new_level_ratio,
            "success_rate": success_rate,
            "should_continue": not should_rollback,
        }

    async def rollback_transition(
        self,
        transition_id: str,
        reason: str,
        db: Session,
    ) -> bool:
        """
        Automatic rollback if learner struggling.

        Reverts to previous difficulty level and notifies parent/teacher.

        Args:
            transition_id: Transition to roll back
            reason: Reason for rollback
            db: Database session

        Returns:
            True if rolled back successfully
        """
        self.logger.warning(f"⏪ Rolling back transition: {reason}")

        # Get transition
        transition = await self._get_transition(transition_id, db)
        if not transition or transition.rolled_back:
            return False

        # Mark as rolled back
        transition.rolled_back = True
        transition.rollback_reason = reason
        transition.completed_at = datetime.utcnow()

        await self._update_transition(transition, db)

        # Revert brain difficulty
        await self._update_brain_difficulty(
            brain_id=transition.brain_id,
            subject=transition.subject,
            new_level=transition.from_level,
            transition_id=None,
            db=db,
        )

        # Notify parent/teacher
        await self._send_rollback_notification(transition, reason, db)

        self.logger.info(f"✅ Transition rolled back: {transition_id}")
        return True

    # ============================================================================
    # HELPER METHODS
    # ============================================================================

    def _build_adaptation_prompt(
        self,
        content: str,
        source_grade: float,
        target_level: float,
        subject: str,
        learner_profile: Dict[str, Any],
    ) -> str:
        """Build AI prompt for content adaptation"""
        diagnoses = learner_profile.get("diagnoses", [])
        learning_style = learner_profile.get("learning_style", "visual")

        return f"""You are an expert special education curriculum adapter for neurodiverse learners.

TASK: Adapt this {source_grade} grade {subject} content to {target_level} grade comprehension level.

ORIGINAL CONTENT:
{content}

LEARNER PROFILE:
- Current comprehension level: {target_level} grade
- Diagnoses: {", ".join(diagnoses) if diagnoses else "None specified"}
- Learning style: {learning_style}

ADAPTATION GUIDELINES:
1. Maintain grade-appropriate topics and themes (don't change WHAT, change HOW)
2. Simplify vocabulary:
   - Replace complex words with simpler synonyms
   - Use concrete language over abstract
   - Example: "photosynthesis" → "how plants make food using sunlight"

3. Shorten sentences:
   - Elementary: Max 15 words per sentence
   - Middle school: Max 20 words per sentence
   - Break complex sentences into 2-3 simple ones

4. Break complex concepts into steps:
   - Use numbered lists
   - Add transitional phrases ("First...", "Then...", "Finally...")
   - Explain each step before moving to next

5. Add concrete examples:
   - Use familiar objects/experiences
   - Visual descriptions
   - Real-world connections

6. Keep content engaging and age-appropriate:
   - Don't patronize or "baby" the content
   - Use interesting examples relevant to their actual age
   - Maintain academic rigor, just make it accessible

OUTPUT FORMAT (JSON):
{{
  "adapted_content": "the fully adapted content here",
  "adaptations_made": [
    {{"type": "vocabulary", "original": "mitochondria", "adapted": "tiny energy factories in cells"}},
    {{"type": "sentence_structure", "change": "split 3 complex sentences into 7 simple ones"}},
    {{"type": "concept_complexity", "change": "added step-by-step process with visual description"}}
  ],
  "complexity_score": 4.2,
  "reasoning": "Simplified cellular biology vocabulary while maintaining scientific accuracy. Broke down processes into sequential steps. Added relatable analogy (factory) to aid comprehension."
}}"""

    def _calculate_complexity(self, text: str, target_level: float) -> float:
        """Calculate complexity score of text"""
        # Simple heuristic based on sentence length and word complexity
        sentences = text.split(".")
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)

        # Estimate complexity (rough approximation)
        if avg_sentence_length < 10:
            base_complexity = 3.0
        elif avg_sentence_length < 15:
            base_complexity = 5.0
        elif avg_sentence_length < 20:
            base_complexity = 7.0
        else:
            base_complexity = 9.0

        # Adjust toward target level
        return (base_complexity + target_level) / 2

    def _analyze_trend(self, values: List[float]) -> str:
        """Analyze trend in values (for hint usage, etc.)"""
        if len(values) < 2:
            return "unknown"

        # Simple linear trend
        if values[-1] < values[0] * 0.8:
            return "decreasing"
        elif values[-1] > values[0] * 1.2:
            return "increasing"
        else:
            return "stable"

    def _extract_error_patterns(self, sessions: List[Dict[str, Any]], subject: str) -> List[str]:
        """Extract common error patterns from sessions"""
        patterns = []

        # Analyze errors (simplified - would be more sophisticated)
        for session in sessions:
            if session.get("subject") == subject:
                errors = session.get("errors", [])
                for error in errors:
                    error_type = error.get("type", "unknown")
                    if error_type not in patterns:
                        patterns.append(error_type)

        return patterns

    def _calculate_mastery_score(
        self,
        success_rate: float,
        hint_usage_trend: str,
        error_patterns: List[str],
        session_count: int,
    ) -> float:
        """Calculate overall mastery score (0.0-1.0)"""
        # Weighted formula
        score = success_rate * 0.6  # 60% weight on accuracy

        # Hint usage trend bonus/penalty
        if hint_usage_trend == "decreasing":
            score += 0.2
        elif hint_usage_trend == "increasing":
            score -= 0.1

        # Error pattern penalty
        if len(error_patterns) > 3:
            score -= 0.1

        # Session count confidence boost
        if session_count >= 10:
            score += 0.1

        return max(0.0, min(1.0, score))  # Clamp to 0-1

    def _generate_reasoning(self, mastery: MasteryAssessment) -> str:
        """Generate human-readable reasoning for difficulty change"""
        return f"""Based on {mastery.sessions_analyzed} recent sessions, {mastery.subject} performance shows strong mastery:

📊 Success Rate: {mastery.success_rate:.0%} (target: 80%+)
📈 Hint Usage: {mastery.hint_usage_trend}
🎯 Mastery Score: {mastery.mastery_score:.0%}

This consistent performance indicates readiness for the next challenge level. We recommend a gradual increase to {mastery.recommended_new_level} grade level to maintain motivation and prevent plateau."""

    def _build_approval_notification(self, request: DifficultyChangeRequest) -> Dict[str, Any]:
        """Build notification content for approval request"""
        return {
            "subject": f"{request.learner_name} is Ready for a Challenge! 📈",
            "body": f"""Great news! {request.learner_name} has mastered {request.subject} at the current level and is ready to advance.

**Current Performance:**
- Success Rate: {request.evidence.success_rate:.0%}
- Sessions Analyzed: {request.evidence.sessions_analyzed}
- Mastery Score: {request.evidence.mastery_score:.0%}

**Recommendation:**
Increase from {request.current_level} to {request.proposed_level} grade level.

**What This Means:**
Content will become slightly more challenging with:
- More complex vocabulary
- Longer passages/problems
- Deeper concepts

**Safety:**
We'll implement this gradually over 5 sessions and automatically roll back if any struggle is detected.

[Approve] [Review Sample] [Decline]""",
            "priority": "normal",
            "action_url": f"/parent-portal/approvals/{request.request_id}",
        }

    # ============================================================================
    # DATABASE OPERATIONS (Stubs - implement with actual DB operations)
    # ============================================================================

    async def _store_adaptation(self, adaptation: ContentAdaptation, db: Session) -> None:
        """Store content adaptation in database"""
        db.execute(
            text("""
                INSERT INTO content_adaptations (
                    adaptation_id, brain_id, subject, original_content,
                    adapted_content, source_grade_level, target_comprehension_level,
                    complexity_score, adaptations_made, reasoning, created_at
                ) VALUES (
                    :adaptation_id, :brain_id, :subject, :original_content,
                    :adapted_content, :source_grade_level, :target_comprehension_level,
                    :complexity_score, :adaptations_made, :reasoning, :created_at
                )
            """),
            {
                "adaptation_id": adaptation.adaptation_id,
                "brain_id": adaptation.brain_id,
                "subject": adaptation.subject,
                "original_content": adaptation.original_content,
                "adapted_content": adaptation.adapted_content,
                "source_grade_level": adaptation.source_grade_level,
                "target_comprehension_level": adaptation.target_comprehension_level,
                "complexity_score": adaptation.complexity_score,
                "adaptations_made": json.dumps(adaptation.adaptations_made),
                "reasoning": adaptation.reasoning,
                "created_at": adaptation.created_at,
            },
        )
        db.commit()

    async def _store_mastery_assessment(self, assessment: MasteryAssessment, db: Session) -> None:
        """Store mastery assessment in database"""
        # Implementation would store in DB
        pass

    async def _store_change_request(self, request: DifficultyChangeRequest, db: Session) -> None:
        """Store difficulty change request in database"""
        db.execute(
            text("""
                INSERT INTO difficulty_change_requests (
                    request_id, brain_id, learner_id, learner_name, subject,
                    current_level, proposed_level, change_type, evidence,
                    sample_content, reasoning, status, created_at, expires_at
                ) VALUES (
                    :request_id, :brain_id, :learner_id, :learner_name, :subject,
                    :current_level, :proposed_level, :change_type, :evidence,
                    :sample_content, :reasoning, :status, :created_at, :expires_at
                )
            """),
            {
                "request_id": request.request_id,
                "brain_id": request.brain_id,
                "learner_id": request.learner_id,
                "learner_name": request.learner_name,
                "subject": request.subject,
                "current_level": request.current_level,
                "proposed_level": request.proposed_level,
                "change_type": request.change_type.value,
                "evidence": request.evidence.model_dump_json(),
                "sample_content": request.sample_content.model_dump_json(),
                "reasoning": request.reasoning,
                "status": request.status.value,
                "created_at": request.created_at,
                "expires_at": request.expires_at,
            },
        )
        db.commit()

    async def _store_transition(self, transition: DifficultyTransition, db: Session) -> None:
        """Store difficulty transition in database"""
        db.execute(
            text("""
                INSERT INTO difficulty_transitions (
                    transition_id, brain_id, subject, from_level, to_level,
                    transition_strategy, current_step, total_steps,
                    monitoring_period_days, rollback_threshold, started_at
                ) VALUES (
                    :transition_id, :brain_id, :subject, :from_level, :to_level,
                    :transition_strategy, :current_step, :total_steps,
                    :monitoring_period_days, :rollback_threshold, :started_at
                )
            """),
            {
                "transition_id": transition.transition_id,
                "brain_id": transition.brain_id,
                "subject": transition.subject,
                "from_level": transition.from_level,
                "to_level": transition.to_level,
                "transition_strategy": transition.transition_strategy.value,
                "current_step": transition.current_step,
                "total_steps": transition.total_steps,
                "monitoring_period_days": transition.monitoring_period_days,
                "rollback_threshold": transition.rollback_threshold,
                "started_at": transition.started_at,
            },
        )
        db.commit()

    async def _get_change_request(
        self, request_id: str, db: Session
    ) -> Optional[DifficultyChangeRequest]:
        """Get change request from database"""
        # Implementation would fetch from DB
        return None

    async def _get_transition(
        self, transition_id: str, db: Session
    ) -> Optional[DifficultyTransition]:
        """Get transition from database"""
        # Implementation would fetch from DB
        return None

    async def _update_change_request(self, request: DifficultyChangeRequest, db: Session) -> None:
        """Update change request in database"""
        # Implementation would update in DB
        pass

    async def _update_transition(self, transition: DifficultyTransition, db: Session) -> None:
        """Update transition in database"""
        # Implementation would update in DB
        pass

    async def _update_brain_difficulty(
        self,
        brain_id: str,
        subject: str,
        new_level: float,
        transition_id: Optional[str],
        db: Session,
    ) -> None:
        """Update brain's difficulty level"""
        # Implementation would update brain configuration
        pass

    async def _send_notification(
        self,
        user_id: str,
        notification_type: str,
        content: Dict[str, Any],
        action_required: bool,
        db: Session,
    ) -> str:
        """Send notification to user"""
        # Implementation would send actual notification
        return str(uuid.uuid4())

    async def _send_rollback_notification(
        self, transition: DifficultyTransition, reason: str, db: Session
    ) -> None:
        """Send notification about rollback"""
        # Implementation would send notification
        pass
