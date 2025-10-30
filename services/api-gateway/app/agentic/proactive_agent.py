"""
Proactive Agent - Autonomous monitoring and intervention system
Enables Aivo AI Brain to continuously monitor learner state and
initiate helpful interventions without waiting to be asked.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS
# ============================================================================


class TriggerType(str, Enum):
    """Types of intervention triggers"""

    FRUSTRATION = "frustration"  # 3+ consecutive errors
    DISENGAGEMENT = "disengagement"  # 2+ minutes no interaction
    SUCCESS_MOMENTUM = "success_momentum"  # 3+ consecutive successes
    FATIGUE_PATTERN = "fatigue_pattern"  # Declining performance
    STUCK_ON_PROBLEM = "stuck_on_problem"  # 3+ minutes on single problem
    BREAKTHROUGH_MOMENT = "breakthrough_moment"  # Concept clicked


class InterventionType(str, Enum):
    """Types of interventions"""

    UNSOLICITED_HINT = "unsolicited_hint"
    BREAK_SUGGESTION = "break_suggestion"
    DIFFICULTY_ADJUSTMENT = "difficulty_adjustment"
    ENCOURAGEMENT = "encouragement"
    RESOURCE_RECOMMENDATION = "resource_recommendation"
    PARENT_NOTIFICATION = "parent_notification"


class LearnerResponse(str, Enum):
    """How learner responded to intervention"""

    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IGNORED = "ignored"
    DISMISSED = "dismissed"


class AutonomyLevel(int, Enum):
    """Parent-configured autonomy levels"""

    MONITORING_ONLY = 1  # Watch but don't act
    LOW_STAKES = 2  # Hints and encouragement only
    FULL_AUTONOMY = 3  # All interventions including breaks


# ============================================================================
# DATA MODELS
# ============================================================================


class LearnerMetrics(BaseModel):
    """Current learner performance metrics"""

    accuracy: float = Field(ge=0.0, le=1.0)
    speed_percentile: float = Field(ge=0.0, le=1.0)
    completion_rate: float = Field(ge=0.0, le=1.0)
    time_on_task_seconds: int
    interaction_frequency: float  # interactions per minute
    cursor_activity: float = Field(ge=0.0, le=1.0)
    hint_requests: int
    consecutive_errors: int
    consecutive_successes: int
    pause_length_seconds: int
    session_duration_minutes: int


class EngagementIndicators(BaseModel):
    """Engagement level indicators"""

    time_since_last_interaction: int  # seconds
    avg_response_time: float  # seconds
    interaction_variance: float  # consistency indicator
    focus_score: float = Field(ge=0.0, le=1.0)


class EmotionalSignals(BaseModel):
    """Detected emotional state signals"""

    frustration_score: float = Field(ge=0.0, le=1.0)
    confidence_score: float = Field(ge=0.0, le=1.0)
    engagement_score: float = Field(ge=0.0, le=1.0)
    stress_indicators: List[str] = []


class LearnerStateMonitor(BaseModel):
    """Complete learner state snapshot"""

    brain_id: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    current_metrics: LearnerMetrics
    baseline_metrics: Optional[LearnerMetrics] = None
    engagement: EngagementIndicators
    emotional_signals: EmotionalSignals
    state_changes: Dict[str, Any] = {}
    alerts: List[str] = []


class InterventionTrigger(BaseModel):
    """Detected trigger for intervention"""

    trigger_id: str = Field(default_factory=lambda: str(uuid4()))
    trigger_type: TriggerType
    condition_met: str
    severity: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = {}


class ProactiveIntervention(BaseModel):
    """Autonomous intervention record"""

    intervention_id: str = Field(default_factory=lambda: str(uuid4()))
    brain_id: str
    session_id: str
    trigger: InterventionTrigger
    intervention_type: InterventionType
    message: str
    parameters: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    learner_response: Optional[LearnerResponse] = None
    response_time_seconds: Optional[int] = None
    effectiveness: Optional[float] = Field(None, ge=0.0, le=1.0)
    reasoning: str


class InterventionPolicy(BaseModel):
    """Per-learner intervention policy configuration"""

    brain_id: str
    autonomy_level: AutonomyLevel = AutonomyLevel.LOW_STAKES
    max_per_session: int = 4
    min_time_between_minutes: int = 5
    enabled_triggers: List[TriggerType] = [
        TriggerType.FRUSTRATION,
        TriggerType.SUCCESS_MOMENTUM,
        TriggerType.BREAKTHROUGH_MOMENT,
    ]
    disabled_by_learner: bool = False
    parent_configured_at: Optional[datetime] = None


# ============================================================================
# PROACTIVE AGENT
# ============================================================================


class ProactiveAgent:
    """
    Autonomous monitoring and intervention system.

    Continuously monitors learner state and proactively initiates
    helpful interventions based on detected patterns and triggers.
    """

    def __init__(self, db: Session):
        self.db = db
        self.active_monitors: Dict[str, asyncio.Task] = {}
        self.intervention_history: Dict[str, List[ProactiveIntervention]] = {}

    # ========================================================================
    # MONITORING
    # ========================================================================

    async def start_monitoring(
        self, brain_id: str, session_id: str, policy: InterventionPolicy
    ) -> None:
        """
        Start continuous monitoring for a learner session.

        Polls every 30 seconds during active session.
        Detects state changes and triggers interventions.
        """
        monitor_key = f"{brain_id}:{session_id}"

        if monitor_key in self.active_monitors:
            logger.warning(f"Monitor already active for {monitor_key}")
            return

        # Create monitoring task
        task = asyncio.create_task(self._monitor_loop(brain_id, session_id, policy))
        self.active_monitors[monitor_key] = task

        logger.info(f"🔍 Started proactive monitoring for {monitor_key}")

    async def stop_monitoring(self, brain_id: str, session_id: str) -> None:
        """Stop monitoring for a session"""
        monitor_key = f"{brain_id}:{session_id}"

        if monitor_key in self.active_monitors:
            self.active_monitors[monitor_key].cancel()
            del self.active_monitors[monitor_key]
            logger.info(f"⏹️ Stopped monitoring for {monitor_key}")

    async def _monitor_loop(
        self, brain_id: str, session_id: str, policy: InterventionPolicy
    ) -> None:
        """Main monitoring loop - runs every 30 seconds"""
        try:
            while True:
                # Monitor learner state
                triggers = await self.monitor_learner_state(brain_id, session_id)

                if triggers:
                    # Get recent interventions
                    recent = self._get_recent_interventions(brain_id, session_id, minutes=5)

                    # Decide if intervention needed
                    intervention = await self.decide_intervention(
                        brain_id=brain_id,
                        session_id=session_id,
                        triggers=triggers,
                        recent_interventions=recent,
                        policy=policy,
                    )

                    if intervention:
                        # Execute intervention
                        await self.execute_intervention(intervention)

                        # Store in history
                        if brain_id not in self.intervention_history:
                            self.intervention_history[brain_id] = []
                        self.intervention_history[brain_id].append(intervention)

                # Wait 30 seconds before next check
                await asyncio.sleep(30)

        except asyncio.CancelledError:
            logger.info(f"Monitoring cancelled for {brain_id}:{session_id}")
        except Exception as e:
            logger.error(f"Monitor loop error: {e}", exc_info=True)

    async def monitor_learner_state(
        self, brain_id: str, session_id: str
    ) -> List[InterventionTrigger]:
        """
        Monitor current learner state and detect triggers.

        Called every 30 seconds during active session.

        Returns:
            List of triggered intervention conditions
        """
        # Get current state snapshot
        state = await self._get_learner_state(brain_id, session_id)

        if not state:
            return []

        triggers = []
        metrics = state.current_metrics
        engagement = state.engagement

        # Check each trigger condition

        # 1. FRUSTRATION: 3+ consecutive errors
        if metrics.consecutive_errors >= 3:
            triggers.append(
                InterventionTrigger(
                    trigger_type=TriggerType.FRUSTRATION,
                    condition_met=f"{metrics.consecutive_errors} consecutive errors",
                    severity=min(metrics.consecutive_errors / 5.0, 1.0),
                    confidence=0.85,
                    context={
                        "consecutive_errors": metrics.consecutive_errors,
                        "accuracy": metrics.accuracy,
                    },
                )
            )

        # 2. DISENGAGEMENT: 2+ minutes no interaction
        if engagement.time_since_last_interaction >= 120:
            triggers.append(
                InterventionTrigger(
                    trigger_type=TriggerType.DISENGAGEMENT,
                    condition_met=(
                        f"{engagement.time_since_last_interaction}s since last interaction"
                    ),
                    severity=min(engagement.time_since_last_interaction / 180.0, 1.0),
                    confidence=0.75,
                    context={
                        "idle_time": engagement.time_since_last_interaction,
                        "focus_score": engagement.focus_score,
                    },
                )
            )

        # 3. SUCCESS MOMENTUM: 3+ consecutive successes
        if metrics.consecutive_successes >= 3:
            triggers.append(
                InterventionTrigger(
                    trigger_type=TriggerType.SUCCESS_MOMENTUM,
                    condition_met=(f"{metrics.consecutive_successes} consecutive successes"),
                    severity=0.5,  # Lower severity (positive trigger)
                    confidence=0.90,
                    context={
                        "consecutive_successes": metrics.consecutive_successes,
                        "accuracy": metrics.accuracy,
                    },
                )
            )

        # 4. FATIGUE PATTERN: Declining performance over time
        if state.baseline_metrics:
            accuracy_drop = state.baseline_metrics.accuracy - metrics.accuracy
            if accuracy_drop > 0.15 and metrics.session_duration_minutes > 20:
                triggers.append(
                    InterventionTrigger(
                        trigger_type=TriggerType.FATIGUE_PATTERN,
                        condition_met=(
                            f"Accuracy dropped {accuracy_drop:.1%} over "
                            f"{metrics.session_duration_minutes} minutes"
                        ),
                        severity=accuracy_drop,
                        confidence=0.70,
                        context={
                            "accuracy_drop": accuracy_drop,
                            "session_duration": metrics.session_duration_minutes,
                        },
                    )
                )

        # 5. STUCK ON PROBLEM: 3+ minutes on single problem
        if metrics.time_on_task_seconds >= 180 and engagement.time_since_last_interaction < 30:
            triggers.append(
                InterventionTrigger(
                    trigger_type=TriggerType.STUCK_ON_PROBLEM,
                    condition_met=(f"{metrics.time_on_task_seconds}s on current problem"),
                    severity=min(metrics.time_on_task_seconds / 300.0, 1.0),
                    confidence=0.80,
                    context={
                        "time_on_task": metrics.time_on_task_seconds,
                        "hint_requests": metrics.hint_requests,
                    },
                )
            )

        # 6. BREAKTHROUGH: Suddenly gets concept
        if (
            metrics.consecutive_successes >= 2
            and state.emotional_signals.confidence_score > 0.7
            and metrics.accuracy > 0.8
        ):
            # Check if previous performance was struggling
            if state.baseline_metrics and state.baseline_metrics.accuracy < 0.6:
                triggers.append(
                    InterventionTrigger(
                        trigger_type=TriggerType.BREAKTHROUGH_MOMENT,
                        condition_met=(
                            f"Accuracy improved from "
                            f"{state.baseline_metrics.accuracy:.1%} to "
                            f"{metrics.accuracy:.1%}"
                        ),
                        severity=0.6,
                        confidence=0.75,
                        context={
                            "accuracy_improvement": (
                                metrics.accuracy - state.baseline_metrics.accuracy
                            ),
                            "confidence_score": (state.emotional_signals.confidence_score),
                        },
                    )
                )

        # Sort by severity and confidence
        triggers.sort(key=lambda t: t.severity * t.confidence, reverse=True)

        return triggers

    # ========================================================================
    # DECISION MAKING
    # ========================================================================

    async def decide_intervention(
        self,
        brain_id: str,
        session_id: str,
        triggers: List[InterventionTrigger],
        recent_interventions: List[ProactiveIntervention],
        policy: InterventionPolicy,
    ) -> Optional[ProactiveIntervention]:
        """
        Use reasoning to decide IF and HOW to intervene.

        Considers:
        - Intervention history (avoid over-helping)
        - Learner preferences and diagnosis
        - Parent settings (autonomy level)
        - Value vs. interruption cost

        Returns:
            ProactiveIntervention plan or None if should not intervene
        """
        # Check if proactive mode disabled
        if policy.disabled_by_learner:
            logger.debug("Proactive mode disabled by learner")
            return None

        # Check max interventions per session
        session_interventions = [i for i in recent_interventions if i.session_id == session_id]
        if len(session_interventions) >= policy.max_per_session:
            logger.debug(f"Max interventions ({policy.max_per_session}) reached for session")
            return None

        # Check minimum time between interventions
        if recent_interventions:
            last_intervention = recent_interventions[0]
            time_since = (datetime.utcnow() - last_intervention.timestamp).total_seconds() / 60
            if time_since < policy.min_time_between_minutes:
                logger.debug(f"Only {time_since:.1f} minutes since last intervention")
                return None

        # Check if recent interventions rejected (back off)
        recent_rejected = [
            i for i in recent_interventions[:2] if i.learner_response == LearnerResponse.REJECTED
        ]
        if len(recent_rejected) >= 2:
            logger.info("🛑 Backing off - 2+ recent interventions rejected")
            return None

        # Find highest priority enabled trigger
        enabled_trigger = None
        for trigger in triggers:
            if trigger.trigger_type in policy.enabled_triggers:
                enabled_trigger = trigger
                break

        if not enabled_trigger:
            return None

        # Check autonomy level permissions
        intervention_type = self._get_intervention_type(enabled_trigger, policy.autonomy_level)
        if not intervention_type:
            logger.debug(
                f"Autonomy level {policy.autonomy_level} insufficient "
                f"for trigger {enabled_trigger.trigger_type}"
            )
            return None

        # Generate intervention message and reasoning
        message, reasoning = self._generate_intervention_content(
            brain_id, enabled_trigger, intervention_type
        )

        # Create intervention plan
        intervention = ProactiveIntervention(
            brain_id=brain_id,
            session_id=session_id,
            trigger=enabled_trigger,
            intervention_type=intervention_type,
            message=message,
            reasoning=reasoning,
            parameters=self._get_intervention_parameters(enabled_trigger, intervention_type),
        )

        logger.info(
            f"🤖 Decided to intervene: {intervention_type.value} "
            f"for {enabled_trigger.trigger_type.value}"
        )

        return intervention

    def _get_intervention_type(
        self, trigger: InterventionTrigger, autonomy_level: AutonomyLevel
    ) -> Optional[InterventionType]:
        """Determine appropriate intervention type based on trigger and autonomy"""

        # Autonomy Level 1: No interventions
        if autonomy_level == AutonomyLevel.MONITORING_ONLY:
            return None

        # Map triggers to intervention types
        intervention_map = {
            TriggerType.FRUSTRATION: InterventionType.UNSOLICITED_HINT,
            TriggerType.DISENGAGEMENT: InterventionType.ENCOURAGEMENT,
            TriggerType.SUCCESS_MOMENTUM: InterventionType.ENCOURAGEMENT,
            TriggerType.FATIGUE_PATTERN: InterventionType.BREAK_SUGGESTION,
            TriggerType.STUCK_ON_PROBLEM: InterventionType.UNSOLICITED_HINT,
            TriggerType.BREAKTHROUGH_MOMENT: InterventionType.ENCOURAGEMENT,
        }

        intervention_type = intervention_map.get(trigger.trigger_type)

        # Autonomy Level 2: Only low-stakes interventions
        if autonomy_level == AutonomyLevel.LOW_STAKES:
            if intervention_type == InterventionType.BREAK_SUGGESTION:
                return None  # Break suggestions require Level 3

        return intervention_type

    def _generate_intervention_content(
        self, brain_id: str, trigger: InterventionTrigger, intervention_type: InterventionType
    ) -> tuple[str, str]:
        """Generate personalized message and reasoning for intervention"""

        # Message templates by trigger type
        messages = {
            TriggerType.FRUSTRATION: (
                "I notice these problems are tricky. "
                "Would you like a hint about {concept}? "
                "Or we could take a quick break?"
            ),
            TriggerType.DISENGAGEMENT: (
                "It seems quiet. Want to try something different? I have a fun activity idea! 🎮"
            ),
            TriggerType.SUCCESS_MOMENTUM: (
                "You're doing great! {successes} in a row! 🌟 Ready for a challenge problem?"
            ),
            TriggerType.FATIGUE_PATTERN: (
                "You've been working hard for a while. "
                "How about a quick break? Maybe some stretches? 🧘"
            ),
            TriggerType.STUCK_ON_PROBLEM: ("This one is tough! Let me break it down into steps..."),
            TriggerType.BREAKTHROUGH_MOMENT: (
                "I can tell it clicked! Let's practice one more to make it stick! 💡"
            ),
        }

        message_template = messages.get(
            trigger.trigger_type, "I'm here to help if you need anything!"
        )

        # Format message with context
        message = message_template.format(
            concept=trigger.context.get("concept", "this topic"),
            successes=trigger.context.get("consecutive_successes", 3),
        )

        # Generate reasoning
        reasoning = (
            f"Detected {trigger.trigger_type.value} "
            f"(severity: {trigger.severity:.2f}, "
            f"confidence: {trigger.confidence:.2f}). "
            f"Condition: {trigger.condition_met}. "
            f"Offering {intervention_type.value} intervention."
        )

        return message, reasoning

    def _get_intervention_parameters(
        self, trigger: InterventionTrigger, intervention_type: InterventionType
    ) -> Dict[str, Any]:
        """Generate parameters for intervention execution"""
        params = {
            "trigger_context": trigger.context,
            "can_dismiss": True,
            "timeout_seconds": 30,
        }

        if intervention_type == InterventionType.UNSOLICITED_HINT:
            params["hint_level"] = "gentle"
            params["show_full_solution"] = False

        elif intervention_type == InterventionType.BREAK_SUGGESTION:
            params["break_duration_minutes"] = 5
            params["suggested_activities"] = ["stretching", "water break", "quick walk"]

        elif intervention_type == InterventionType.DIFFICULTY_ADJUSTMENT:
            if trigger.trigger_type == TriggerType.FRUSTRATION:
                params["adjustment"] = "easier"
            else:
                params["adjustment"] = "harder"

        return params

    # ========================================================================
    # EXECUTION
    # ========================================================================

    async def execute_intervention(self, intervention: ProactiveIntervention) -> None:
        """
        Execute the planned intervention.

        Sends message to learner and tracks response.
        """
        logger.info(f"🎯 Executing intervention: {intervention.intervention_type.value}")
        logger.info(f"💬 Message: {intervention.message}")

        # In production, this would:
        # 1. Send message via WebSocket to learner UI
        # 2. Display as non-intrusive notification
        # 3. Wait for learner response (accept/reject/dismiss)
        # 4. Update intervention record with response

        # Store intervention in database
        await self._store_intervention(intervention)

    async def _store_intervention(self, intervention: ProactiveIntervention) -> None:
        """Store intervention in database for audit trail"""
        # Implementation would insert into brain_proactive_interventions table
        logger.info(f"💾 Stored intervention: {intervention.intervention_id}")

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _get_recent_interventions(
        self, brain_id: str, session_id: str, minutes: int = 5
    ) -> List[ProactiveIntervention]:
        """Get recent interventions for rate limiting"""
        if brain_id not in self.intervention_history:
            return []

        cutoff = datetime.utcnow() - timedelta(minutes=minutes)
        return [i for i in self.intervention_history[brain_id] if i.timestamp >= cutoff]

    async def _get_learner_state(
        self, brain_id: str, session_id: str
    ) -> Optional[LearnerStateMonitor]:
        """Get current learner state snapshot"""
        # In production, this would:
        # 1. Query latest metrics from database
        # 2. Calculate engagement indicators
        # 3. Detect emotional signals
        # 4. Compare to baseline

        # Mock data for now
        return LearnerStateMonitor(
            brain_id=brain_id,
            session_id=session_id,
            current_metrics=LearnerMetrics(
                accuracy=0.65,
                speed_percentile=0.50,
                completion_rate=0.70,
                time_on_task_seconds=45,
                interaction_frequency=2.5,
                cursor_activity=0.60,
                hint_requests=1,
                consecutive_errors=2,
                consecutive_successes=0,
                pause_length_seconds=10,
                session_duration_minutes=15,
            ),
            engagement=EngagementIndicators(
                time_since_last_interaction=45,
                avg_response_time=12.5,
                interaction_variance=0.3,
                focus_score=0.70,
            ),
            emotional_signals=EmotionalSignals(
                frustration_score=0.45,
                confidence_score=0.60,
                engagement_score=0.70,
                stress_indicators=[],
            ),
        )


# ============================================================================
# USAGE EXAMPLE
# ============================================================================


async def example_usage():
    """Example of how to use ProactiveAgent"""
    from sqlalchemy.orm import Session

    # Create agent
    db = Session()  # Mock session
    agent = ProactiveAgent(db)

    # Define policy
    policy = InterventionPolicy(
        brain_id="brain_123",
        autonomy_level=AutonomyLevel.FULL_AUTONOMY,
        max_per_session=4,
        min_time_between_minutes=5,
        enabled_triggers=[
            TriggerType.FRUSTRATION,
            TriggerType.SUCCESS_MOMENTUM,
            TriggerType.DISENGAGEMENT,
        ],
    )

    # Start monitoring
    await agent.start_monitoring(brain_id="brain_123", session_id="session_456", policy=policy)

    # Monitoring runs automatically every 30 seconds
    # Agent will detect triggers and intervene autonomously

    # Stop monitoring when session ends
    await agent.stop_monitoring("brain_123", "session_456")
