"""
Real-Time Proactive Agent - Continuous Monitoring & Autonomous Interventions

This module implements a real-time proactive agent that continuously monitors
learner state during active sessions and autonomously initiates helpful
interventions WITHOUT waiting to be asked.

Features:
- Real-time monitoring (30-second polling)
- Autonomous trigger detection (frustration, disengagement, etc.)
- Smart intervention decisions with reasoning
- Anti-overhelping safeguards
- WebSocket-based state updates
- Comprehensive logging and learning
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


# ====================================================================
# DATA MODELS
# ====================================================================


class LearnerStateMonitor(BaseModel):
    """
    Current state of learner being monitored.
    """

    brain_id: str
    learner_id: str
    session_id: str
    current_metrics: Dict[str, Any]
    baseline_metrics: Dict[str, Any]
    state_changes: List[Dict[str, Any]] = Field(default_factory=list)
    alerts: List[str] = Field(default_factory=list)
    monitoring_start: datetime
    last_update: datetime


class InterventionTrigger(BaseModel):
    """
    Detected condition that may warrant intervention.
    """

    trigger_id: str = Field(default_factory=lambda: str(uuid4()))
    trigger_type: str  # frustration, disengagement, success_momentum, etc.
    condition_met: bool
    severity: str  # low, medium, high, critical
    confidence: float = Field(ge=0.0, le=1.0)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = Field(default_factory=dict)
    reasoning: str = ""


class ProactiveIntervention(BaseModel):
    """
    Autonomous intervention taken by the agent.
    """

    intervention_id: str = Field(default_factory=lambda: str(uuid4()))
    brain_id: str
    learner_id: str
    session_id: str
    trigger: InterventionTrigger
    intervention_type: str  # hint, break, encouragement, etc.
    message: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    learner_response: Optional[str] = None  # accepted, rejected, ignored
    response_timestamp: Optional[datetime] = None
    effectiveness: Optional[float] = None  # 0.0-1.0
    follow_up_observed: bool = False


class InterventionPolicy(BaseModel):
    """
    Policy settings for autonomous interventions.
    """

    brain_id: str
    learner_id: str
    max_per_session: int = 4
    min_time_between_minutes: int = 5
    autonomy_level: int = 2  # 1=monitor only, 2=low-stakes, 3=full
    enabled_triggers: List[str] = Field(
        default_factory=lambda: [
            "frustration",
            "disengagement",
            "success_momentum",
            "fatigue",
            "stuck",
            "breakthrough",
        ]
    )
    proactive_mode_enabled: bool = True
    rejection_threshold: int = 2  # Back off after N rejections
    diagnosis_considerations: Dict[str, Any] = Field(default_factory=dict)


# ====================================================================
# REAL-TIME PROACTIVE AGENT
# ====================================================================


class RealTimeProactiveAgent:
    """
    Autonomous agent for real-time learner monitoring and proactive
    interventions.

    Continuously monitors learner state during active sessions and
    autonomously initiates helpful interventions based on detected patterns.
    """

    # Monitoring configuration
    POLLING_INTERVAL_SECONDS = 30

    # Trigger thresholds
    FRUSTRATION_ERROR_THRESHOLD = 3
    DISENGAGEMENT_TIME_THRESHOLD = 120  # 2 minutes
    SUCCESS_MOMENTUM_THRESHOLD = 3
    STUCK_TIME_THRESHOLD = 180  # 3 minutes
    FATIGUE_DECLINE_THRESHOLD = 0.15  # 15% performance drop

    def __init__(self, db: Optional[AsyncSession] = None, ai_client: Optional[Any] = None):
        """
        Initialize Real-Time Proactive Agent.

        Args:
            db: Database session for persistence
            ai_client: AI client for reasoning (optional)
        """
        self.db = db
        self.ai_client = ai_client
        self.active_monitors: Dict[str, LearnerStateMonitor] = {}
        self.intervention_policies: Dict[str, InterventionPolicy] = {}
        self._monitoring_tasks: Dict[str, asyncio.Task] = {}

        logger.info("🤖 RealTimeProactiveAgent initialized")

    async def start_session_monitoring(
        self,
        brain_id: str,
        learner_id: str,
        session_id: str,
        baseline_metrics: Dict[str, Any],
        db: Optional[AsyncSession] = None,
    ) -> None:
        """
        Start real-time monitoring for an active learning session.

        Args:
            brain_id: Brain identifier
            learner_id: Learner identifier
            session_id: Active session identifier
            baseline_metrics: Baseline performance metrics
            db: Database session (optional override)
        """
        db = db or self.db

        monitor_key = f"{learner_id}_{session_id}"

        # Check if already monitoring
        if monitor_key in self.active_monitors:
            logger.warning(f"⚠️ Already monitoring {monitor_key}")
            return

        # Load intervention policy
        policy = await self._load_intervention_policy(
            brain_id=brain_id, learner_id=learner_id, db=db
        )
        self.intervention_policies[monitor_key] = policy

        # Initialize monitor
        monitor = LearnerStateMonitor(
            brain_id=brain_id,
            learner_id=learner_id,
            session_id=session_id,
            current_metrics={},
            baseline_metrics=baseline_metrics,
            monitoring_start=datetime.utcnow(),
            last_update=datetime.utcnow(),
        )
        self.active_monitors[monitor_key] = monitor

        # Start monitoring task
        task = asyncio.create_task(self._monitoring_loop(monitor_key, db))
        self._monitoring_tasks[monitor_key] = task

        logger.info(f"🔍 Started monitoring session {session_id} for learner {learner_id}")

    async def stop_session_monitoring(self, learner_id: str, session_id: str) -> Dict[str, Any]:
        """
        Stop monitoring for a completed session.

        Args:
            learner_id: Learner identifier
            session_id: Session identifier

        Returns:
            Monitoring summary
        """
        monitor_key = f"{learner_id}_{session_id}"

        if monitor_key not in self.active_monitors:
            logger.warning(f"⚠️ No active monitor for {monitor_key}")
            return {}

        # Cancel monitoring task
        if monitor_key in self._monitoring_tasks:
            self._monitoring_tasks[monitor_key].cancel()
            del self._monitoring_tasks[monitor_key]

        # Get final summary
        monitor = self.active_monitors[monitor_key]
        duration = (datetime.utcnow() - monitor.monitoring_start).total_seconds()

        summary = {
            "session_id": session_id,
            "learner_id": learner_id,
            "duration_seconds": duration,
            "total_alerts": len(monitor.alerts),
            "state_changes": len(monitor.state_changes),
            "final_metrics": monitor.current_metrics,
        }

        # Cleanup
        del self.active_monitors[monitor_key]
        del self.intervention_policies[monitor_key]

        logger.info(f"✅ Stopped monitoring session {session_id} (duration: {duration:.0f}s)")

        return summary

    async def _monitoring_loop(self, monitor_key: str, db: AsyncSession) -> None:
        """
        Continuous monitoring loop (runs every 30 seconds).

        Args:
            monitor_key: Monitor identifier
            db: Database session
        """
        logger.info(f"🔄 Starting monitoring loop for {monitor_key}")

        try:
            while True:
                # Get current monitor state
                if monitor_key not in self.active_monitors:
                    logger.info(f"🛑 Monitor {monitor_key} removed, stopping loop")
                    break

                monitor = self.active_monitors[monitor_key]
                policy = self.intervention_policies[monitor_key]

                # Check if proactive mode is enabled
                if not policy.proactive_mode_enabled:
                    logger.debug(f"⏸️ Proactive mode disabled for {monitor_key}")
                    await asyncio.sleep(self.POLLING_INTERVAL_SECONDS)
                    continue

                # Monitor learner state
                triggers = await self.monitor_learner_state(
                    brain_id=monitor.brain_id,
                    learner_id=monitor.learner_id,
                    session_id=monitor.session_id,
                    db=db,
                )

                # Decide if intervention needed
                if triggers:
                    intervention = await self.decide_intervention(
                        brain_id=monitor.brain_id,
                        learner_id=monitor.learner_id,
                        session_id=monitor.session_id,
                        triggers=triggers,
                        db=db,
                    )

                    # Execute intervention if decided
                    if intervention:
                        await self._execute_and_track_intervention(intervention=intervention, db=db)

                # Wait for next poll
                await asyncio.sleep(self.POLLING_INTERVAL_SECONDS)

        except asyncio.CancelledError:
            logger.info(f"🛑 Monitoring loop cancelled for {monitor_key}")
        except Exception as e:
            logger.error(f"❌ Monitoring loop error for {monitor_key}: {e}")

    async def monitor_learner_state(
        self, brain_id: str, learner_id: str, session_id: str, db: Optional[AsyncSession] = None
    ) -> List[InterventionTrigger]:
        """
        Monitor learner state and detect intervention triggers.

        Called every 30 seconds during active session.

        Args:
            brain_id: Brain identifier
            learner_id: Learner identifier
            session_id: Session identifier
            db: Database session (optional override)

        Returns:
            List of detected triggers (sorted by severity)
        """
        db = db or self.db
        monitor_key = f"{learner_id}_{session_id}"

        # Get current metrics
        current_metrics = await self._get_current_metrics(
            learner_id=learner_id, session_id=session_id, db=db
        )

        # Update monitor
        if monitor_key in self.active_monitors:
            monitor = self.active_monitors[monitor_key]
            monitor.current_metrics = current_metrics
            monitor.last_update = datetime.utcnow()

        # Get baseline metrics
        baseline = (
            self.active_monitors[monitor_key].baseline_metrics
            if monitor_key in self.active_monitors
            else {}
        )

        # Detect triggers
        triggers = []

        # 1. Frustration Detection (3+ consecutive errors)
        frustration_trigger = self._detect_frustration(current_metrics)
        if frustration_trigger.condition_met:
            triggers.append(frustration_trigger)

        # 2. Disengagement (2+ minutes no interaction)
        disengagement_trigger = self._detect_disengagement(current_metrics)
        if disengagement_trigger.condition_met:
            triggers.append(disengagement_trigger)

        # 3. Success Momentum (3+ consecutive successes)
        momentum_trigger = self._detect_success_momentum(current_metrics)
        if momentum_trigger.condition_met:
            triggers.append(momentum_trigger)

        # 4. Fatigue Pattern (declining performance)
        fatigue_trigger = self._detect_fatigue(current_metrics, baseline)
        if fatigue_trigger.condition_met:
            triggers.append(fatigue_trigger)

        # 5. Stuck on Problem (3+ minutes on single problem)
        stuck_trigger = self._detect_stuck(current_metrics)
        if stuck_trigger.condition_met:
            triggers.append(stuck_trigger)

        # 6. Breakthrough Moment (sudden understanding)
        breakthrough_trigger = self._detect_breakthrough(current_metrics, baseline)
        if breakthrough_trigger.condition_met:
            triggers.append(breakthrough_trigger)

        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        triggers.sort(key=lambda t: (severity_order.get(t.severity, 99), -t.confidence))

        return triggers

    def _detect_frustration(self, metrics: Dict[str, Any]) -> InterventionTrigger:
        """Detect frustration from consecutive errors."""
        consecutive_errors = metrics.get("consecutive_errors", 0)
        error_rate = metrics.get("error_rate_last_5min", 0.0)

        condition_met = consecutive_errors >= self.FRUSTRATION_ERROR_THRESHOLD

        # Calculate severity and confidence
        if consecutive_errors >= 5:
            severity = "critical"
            confidence = 0.9
        elif consecutive_errors >= 4:
            severity = "high"
            confidence = 0.8
        elif consecutive_errors >= 3:
            severity = "medium"
            confidence = 0.7
        else:
            severity = "low"
            confidence = 0.5

        return InterventionTrigger(
            trigger_type="frustration",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={"consecutive_errors": consecutive_errors, "error_rate": error_rate},
            reasoning=f"Detected {consecutive_errors} consecutive errors, indicating frustration",
        )

    def _detect_disengagement(self, metrics: Dict[str, Any]) -> InterventionTrigger:
        """Detect disengagement from lack of interaction."""
        seconds_since_interaction = metrics.get("seconds_since_last_interaction", 0)
        interaction_frequency = metrics.get("interactions_last_5min", 0)

        condition_met = seconds_since_interaction >= self.DISENGAGEMENT_TIME_THRESHOLD

        # Calculate severity
        if seconds_since_interaction >= 300:  # 5 minutes
            severity = "high"
            confidence = 0.85
        elif seconds_since_interaction >= 180:  # 3 minutes
            severity = "medium"
            confidence = 0.75
        else:
            severity = "low"
            confidence = 0.6

        return InterventionTrigger(
            trigger_type="disengagement",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={
                "seconds_idle": seconds_since_interaction,
                "recent_interactions": interaction_frequency,
            },
            reasoning=f"No interaction for {seconds_since_interaction}s, possible disengagement",
        )

    def _detect_success_momentum(self, metrics: Dict[str, Any]) -> InterventionTrigger:
        """Detect success momentum from consecutive successes."""
        consecutive_successes = metrics.get("consecutive_successes", 0)
        accuracy = metrics.get("accuracy_last_5min", 0.0)

        condition_met = consecutive_successes >= self.SUCCESS_MOMENTUM_THRESHOLD

        if consecutive_successes >= 5:
            severity = "high"
            confidence = 0.9
        elif consecutive_successes >= 4:
            severity = "medium"
            confidence = 0.8
        else:
            severity = "low"
            confidence = 0.7

        return InterventionTrigger(
            trigger_type="success_momentum",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={"consecutive_successes": consecutive_successes, "accuracy": accuracy},
            reasoning=f"{consecutive_successes} consecutive successes, learner building confidence",
        )

    def _detect_fatigue(
        self, current_metrics: Dict[str, Any], baseline_metrics: Dict[str, Any]
    ) -> InterventionTrigger:
        """Detect fatigue from declining performance."""
        current_accuracy = current_metrics.get("accuracy_last_10min", 0.0)
        baseline_accuracy = baseline_metrics.get("accuracy", 0.8)

        performance_drop = baseline_accuracy - current_accuracy
        time_on_task = current_metrics.get("session_duration_minutes", 0)

        condition_met = performance_drop >= self.FATIGUE_DECLINE_THRESHOLD and time_on_task >= 20

        if performance_drop >= 0.25:  # 25% drop
            severity = "high"
            confidence = 0.85
        elif performance_drop >= 0.20:
            severity = "medium"
            confidence = 0.75
        else:
            severity = "low"
            confidence = 0.6

        return InterventionTrigger(
            trigger_type="fatigue",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={"performance_drop": performance_drop, "time_on_task_minutes": time_on_task},
            reasoning=f"Performance dropped {performance_drop:.1%} after {time_on_task}min, possible fatigue",
        )

    def _detect_stuck(self, metrics: Dict[str, Any]) -> InterventionTrigger:
        """Detect learner stuck on single problem."""
        time_on_current_problem = metrics.get("time_on_current_problem_seconds", 0)
        hint_requests = metrics.get("hint_requests_current_problem", 0)

        condition_met = time_on_current_problem >= self.STUCK_TIME_THRESHOLD

        if time_on_current_problem >= 300:  # 5 minutes
            severity = "high"
            confidence = 0.9
        elif time_on_current_problem >= 240:  # 4 minutes
            severity = "medium"
            confidence = 0.8
        else:
            severity = "low"
            confidence = 0.7

        return InterventionTrigger(
            trigger_type="stuck",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={"time_on_problem": time_on_current_problem, "hint_requests": hint_requests},
            reasoning=f"Spent {time_on_current_problem}s on problem, likely stuck",
        )

    def _detect_breakthrough(
        self, current_metrics: Dict[str, Any], baseline_metrics: Dict[str, Any]
    ) -> InterventionTrigger:
        """Detect breakthrough moment from sudden improvement."""
        current_accuracy = current_metrics.get("accuracy_last_5min", 0.0)
        previous_accuracy = current_metrics.get("accuracy_previous_5min", 0.0)

        improvement = current_accuracy - previous_accuracy
        recent_errors_before = current_metrics.get("errors_before_breakthrough", 0)

        condition_met = (
            improvement >= 0.3  # 30% improvement
            and recent_errors_before >= 2
        )

        if improvement >= 0.5:
            severity = "high"
            confidence = 0.85
        else:
            severity = "medium"
            confidence = 0.75

        return InterventionTrigger(
            trigger_type="breakthrough",
            condition_met=condition_met,
            severity=severity,
            confidence=confidence,
            context={"improvement": improvement, "previous_struggles": recent_errors_before},
            reasoning=f"Sudden {improvement:.1%} improvement after struggles, breakthrough moment",
        )

    async def decide_intervention(
        self,
        brain_id: str,
        learner_id: str,
        session_id: str,
        triggers: List[InterventionTrigger],
        db: Optional[AsyncSession] = None,
    ) -> Optional[ProactiveIntervention]:
        """
        Use reasoning to decide IF and HOW to intervene.

        Considers:
        - Intervention history (avoid over-helping)
        - Learner preferences
        - Diagnosis needs
        - Parent settings
        - Intervention value vs. interruption cost

        Args:
            brain_id: Brain identifier
            learner_id: Learner identifier
            session_id: Session identifier
            triggers: List of detected triggers
            db: Database session (optional override)

        Returns:
            ProactiveIntervention if decided, None otherwise
        """
        db = db or self.db
        monitor_key = f"{learner_id}_{session_id}"

        # Get policy
        if monitor_key not in self.intervention_policies:
            logger.warning(f"⚠️ No policy for {monitor_key}")
            return None

        policy = self.intervention_policies[monitor_key]

        # Check if any triggers are enabled
        enabled_triggers = [t for t in triggers if t.trigger_type in policy.enabled_triggers]
        if not enabled_triggers:
            logger.debug(f"⏸️ No enabled triggers for {monitor_key}")
            return None

        # Get most urgent trigger
        primary_trigger = enabled_triggers[0]

        # Get recent interventions for this session
        recent_interventions = await self._get_recent_interventions(
            learner_id=learner_id, session_id=session_id, db=db
        )

        # Apply anti-overhelping safeguards
        if not self._should_intervene(
            policy=policy, recent_interventions=recent_interventions, trigger=primary_trigger
        ):
            logger.debug(f"🛡️ Safeguards prevent intervention for {monitor_key}")
            return None

        # Decide intervention type and message
        intervention_plan = self._plan_intervention(
            brain_id=brain_id,
            learner_id=learner_id,
            session_id=session_id,
            trigger=primary_trigger,
            policy=policy,
        )

        logger.info(
            f"🎯 Intervention planned: {intervention_plan.intervention_type} "
            f"for {learner_id} (trigger: {primary_trigger.trigger_type})"
        )

        return intervention_plan

    def _should_intervene(
        self,
        policy: InterventionPolicy,
        recent_interventions: List[ProactiveIntervention],
        trigger: InterventionTrigger,
    ) -> bool:
        """
        Apply anti-overhelping safeguards.

        Args:
            policy: Intervention policy
            recent_interventions: Recent interventions for session
            trigger: Current trigger

        Returns:
            True if intervention should proceed, False otherwise
        """
        # Check max interventions per session
        if len(recent_interventions) >= policy.max_per_session:
            logger.debug(f"🛡️ Max interventions reached ({policy.max_per_session})")
            return False

        # Check minimum time between interventions
        if recent_interventions:
            last_intervention = recent_interventions[-1]
            time_since_last = (datetime.utcnow() - last_intervention.timestamp).total_seconds() / 60

            if time_since_last < policy.min_time_between_minutes:
                logger.debug(
                    f"🛡️ Too soon since last intervention "
                    f"({time_since_last:.1f}min < {policy.min_time_between_minutes}min)"
                )
                return False

        # Check rejection threshold
        recent_rejections = [
            i for i in recent_interventions[-3:] if i.learner_response == "rejected"
        ]
        if len(recent_rejections) >= policy.rejection_threshold:
            logger.info(f"🛡️ Backing off due to {len(recent_rejections)} recent rejections")
            return False

        # Check trigger severity vs. autonomy level
        if policy.autonomy_level == 1:
            # Monitor only, no interventions
            return False
        elif policy.autonomy_level == 2:
            # Low-stakes only
            if trigger.severity in ["critical", "high"]:
                logger.debug(f"🛡️ Autonomy level 2 cannot handle {trigger.severity} severity")
                return False

        # All checks passed
        return True

    def _plan_intervention(
        self,
        brain_id: str,
        learner_id: str,
        session_id: str,
        trigger: InterventionTrigger,
        policy: InterventionPolicy,
    ) -> ProactiveIntervention:
        """
        Plan specific intervention based on trigger.

        Args:
            brain_id: Brain identifier
            learner_id: Learner identifier
            session_id: Session identifier
            trigger: Detected trigger
            policy: Intervention policy

        Returns:
            Planned intervention
        """
        diagnosis = policy.diagnosis_considerations

        # Map trigger to intervention
        if trigger.trigger_type == "frustration":
            intervention_type, message, params = self._plan_frustration_intervention(
                trigger, diagnosis
            )
        elif trigger.trigger_type == "disengagement":
            intervention_type, message, params = self._plan_disengagement_intervention(
                trigger, diagnosis
            )
        elif trigger.trigger_type == "success_momentum":
            intervention_type, message, params = self._plan_momentum_intervention(
                trigger, diagnosis
            )
        elif trigger.trigger_type == "fatigue":
            intervention_type, message, params = self._plan_fatigue_intervention(trigger, diagnosis)
        elif trigger.trigger_type == "stuck":
            intervention_type, message, params = self._plan_stuck_intervention(trigger, diagnosis)
        elif trigger.trigger_type == "breakthrough":
            intervention_type, message, params = self._plan_breakthrough_intervention(
                trigger, diagnosis
            )
        else:
            # Fallback
            intervention_type = "encouragement"
            message = "You're doing great! Keep going!"
            params = {}

        return ProactiveIntervention(
            brain_id=brain_id,
            learner_id=learner_id,
            session_id=session_id,
            trigger=trigger,
            intervention_type=intervention_type,
            message=message,
            parameters=params,
        )

    def _plan_frustration_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for frustration."""
        consecutive_errors = trigger.context.get("consecutive_errors", 3)

        # Check diagnosis
        has_adhd = "adhd" in diagnosis.get("diagnoses", [])
        has_anxiety = "anxiety" in diagnosis.get("diagnoses", [])

        if has_anxiety:
            # Gentle, encouraging approach
            message = (
                f"I notice these {consecutive_errors} problems have been tricky. "
                "That's totally okay! Would you like:\n"
                "• A hint to help you figure it out?\n"
                "• Take a quick breathing break?"
            )
        elif has_adhd:
            # Direct, actionable
            message = (
                "Let's try something different! Choose one:\n"
                "• Get a helpful hint\n"
                "• Take a 2-minute movement break\n"
                "• Try an easier problem first"
            )
        else:
            # Standard approach
            message = (
                f"I notice you've had {consecutive_errors} tricky problems in a row. "
                "Would you like a hint, or should we take a quick break?"
            )

        return (
            "offer_hint_or_break",
            message,
            {"consecutive_errors": consecutive_errors, "options": ["hint", "break"]},
        )

    def _plan_disengagement_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for disengagement."""
        has_adhd = "adhd" in diagnosis.get("diagnoses", [])

        if has_adhd:
            # Proactive redirection helpful
            message = (
                "It seems quiet over there! Let's keep the momentum going. "
                "Want to try:\n"
                "• A fun game-based problem?\n"
                "• Switch to a different topic?"
            )
        else:
            # Gentle check-in
            message = (
                "Everything going okay? I'm here if you need anything! "
                "Let me know if you want to try something different."
            )

        return (
            "re_engagement_prompt",
            message,
            {"idle_time": trigger.context.get("seconds_idle", 0)},
        )

    def _plan_momentum_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for success momentum."""
        consecutive_successes = trigger.context.get("consecutive_successes", 3)

        message = (
            f"Amazing! You got {consecutive_successes} in a row correct! 🌟\n"
            "You're really getting this. Ready for:\n"
            "• A challenge problem?\n"
            "• Keep practicing at this level?"
        )

        return (
            "offer_challenge",
            message,
            {"consecutive_successes": consecutive_successes, "options": ["challenge", "continue"]},
        )

    def _plan_fatigue_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for fatigue."""
        time_on_task = trigger.context.get("time_on_task_minutes", 0)

        message = (
            f"You've been working hard for {time_on_task} minutes! "
            "Great effort! Let's:\n"
            "• Take a 3-minute break\n"
            "• Switch to a different subject\n"
            "• Keep going (if you're feeling good!)"
        )

        return (
            "suggest_break",
            message,
            {"time_on_task_minutes": time_on_task, "break_duration_minutes": 3},
        )

    def _plan_stuck_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for stuck on problem."""
        time_on_problem = trigger.context.get("time_on_problem", 0)

        has_asd = "asd" in diagnosis.get("diagnoses", [])

        if has_asd:
            # Predictable, structured help
            message = (
                "This problem is tough! Let me break it down into steps:\n"
                "Step 1: [First part of solution]\n"
                "Would you like to see the next step?"
            )
        else:
            message = (
                f"You've been thinking about this one for {time_on_problem // 60} minutes. "
                "That shows great persistence! Let me help:\n"
                "• See a strategy hint?\n"
                "• Break it into smaller steps?"
            )

        return "offer_strategy_hint", message, {"time_on_problem_seconds": time_on_problem}

    def _plan_breakthrough_intervention(
        self, trigger: InterventionTrigger, diagnosis: Dict[str, Any]
    ) -> tuple[str, str, Dict[str, Any]]:
        """Plan intervention for breakthrough moment."""
        improvement = trigger.context.get("improvement", 0.3)

        message = (
            "I can tell it clicked! That's awesome! 🎉\n"
            "Let's practice one more to make sure you've got it."
        )

        return (
            "reinforce_with_practice",
            message,
            {"improvement": improvement, "provide_similar_problem": True},
        )

    async def _execute_and_track_intervention(
        self, intervention: ProactiveIntervention, db: AsyncSession
    ) -> None:
        """
        Execute intervention and track for learning.

        Args:
            intervention: Planned intervention
            db: Database session
        """
        logger.info(
            f"🎯 Executing intervention: {intervention.intervention_type} "
            f"for {intervention.learner_id}"
        )

        # Store intervention in database
        await self._store_intervention(intervention, db)

        # TODO: Send intervention to learner via WebSocket
        # await self._send_intervention_websocket(intervention)

        # Schedule follow-up observation (after 2 minutes)
        asyncio.create_task(
            self._observe_intervention_response(
                intervention_id=intervention.intervention_id, delay_seconds=120
            )
        )

    async def _observe_intervention_response(
        self, intervention_id: str, delay_seconds: int
    ) -> None:
        """
        Observe learner response to intervention after delay.

        Args:
            intervention_id: Intervention identifier
            delay_seconds: Delay before observation
        """
        await asyncio.sleep(delay_seconds)

        # TODO: Check learner response
        # response = await self._check_learner_response(intervention_id)
        # effectiveness = await self._calculate_effectiveness(intervention_id)

        logger.info(f"👀 Observed response to intervention {intervention_id}")

    async def _get_current_metrics(
        self, learner_id: str, session_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get current session metrics for learner.

        Args:
            learner_id: Learner identifier
            session_id: Session identifier
            db: Database session

        Returns:
            Current metrics dictionary
        """
        # Query recent session data
        query = text("""
            SELECT 
                COUNT(*) FILTER (WHERE correct = 1) as correct_count,
                COUNT(*) FILTER (WHERE correct = 0) as error_count,
                AVG(CASE WHEN correct = 1 THEN 1.0 ELSE 0.0 END) as accuracy,
                MAX(created_at) as last_interaction
            FROM homework_submissions
            WHERE learner_id = :learner_id
            AND session_id = :session_id
            AND created_at >= datetime('now', '-5 minutes')
        """)

        result = await db.execute(query, {"learner_id": learner_id, "session_id": session_id})
        row = result.fetchone()

        if not row:
            return {}

        # Calculate metrics
        correct_count = row[0] or 0
        error_count = row[1] or 0
        accuracy = row[2] or 0.0
        last_interaction = row[3]

        # Calculate time since last interaction
        if last_interaction:
            last_time = datetime.fromisoformat(last_interaction)
            seconds_idle = (datetime.utcnow() - last_time).total_seconds()
        else:
            seconds_idle = 0

        return {
            "consecutive_errors": error_count,
            "consecutive_successes": correct_count,
            "accuracy_last_5min": accuracy,
            "seconds_since_last_interaction": seconds_idle,
            "interactions_last_5min": correct_count + error_count,
        }

    async def _get_recent_interventions(
        self, learner_id: str, session_id: str, db: AsyncSession
    ) -> List[ProactiveIntervention]:
        """
        Get recent interventions for session.

        Args:
            learner_id: Learner identifier
            session_id: Session identifier
            db: Database session

        Returns:
            List of recent interventions
        """
        query = text("""
            SELECT *
            FROM brain_proactive_interventions
            WHERE learner_id = :learner_id
            AND session_id = :session_id
            ORDER BY timestamp DESC
        """)

        result = await db.execute(query, {"learner_id": learner_id, "session_id": session_id})
        rows = result.fetchall()

        interventions = []
        for row in rows:
            # Parse row into ProactiveIntervention (simplified)
            intervention = ProactiveIntervention(
                intervention_id=row[0],
                brain_id=row[1],
                learner_id=row[2],
                session_id=row[3],
                trigger=InterventionTrigger(
                    trigger_type=row[4], condition_met=True, severity="medium", confidence=0.8
                ),
                intervention_type=row[5],
                message=row[6],
                parameters=json.loads(row[7]) if row[7] else {},
                timestamp=row[8],
                learner_response=row[9],
                effectiveness=row[10],
            )
            interventions.append(intervention)

        return interventions

    async def _load_intervention_policy(
        self, brain_id: str, learner_id: str, db: AsyncSession
    ) -> InterventionPolicy:
        """
        Load intervention policy for learner.

        Args:
            brain_id: Brain identifier
            learner_id: Learner identifier
            db: Database session

        Returns:
            Intervention policy
        """
        query = text("""
            SELECT *
            FROM brain_intervention_policies
            WHERE brain_id = :brain_id
            AND learner_id = :learner_id
        """)

        result = await db.execute(query, {"brain_id": brain_id, "learner_id": learner_id})
        row = result.fetchone()

        if row:
            return InterventionPolicy(
                brain_id=row[0],
                learner_id=row[1],
                max_per_session=row[2],
                min_time_between_minutes=row[3],
                autonomy_level=row[4],
                enabled_triggers=json.loads(row[5]) if row[5] else [],
                proactive_mode_enabled=row[6],
                rejection_threshold=row[7],
                diagnosis_considerations=json.loads(row[8]) if row[8] else {},
            )
        else:
            # Return default policy
            return InterventionPolicy(brain_id=brain_id, learner_id=learner_id)

    async def _store_intervention(
        self, intervention: ProactiveIntervention, db: AsyncSession
    ) -> None:
        """
        Store intervention in database.

        Args:
            intervention: Intervention to store
            db: Database session
        """
        query = text("""
            INSERT INTO brain_proactive_interventions (
                intervention_id, brain_id, learner_id, session_id,
                trigger_type, intervention_type, message, parameters,
                timestamp, learner_response, effectiveness
            ) VALUES (
                :intervention_id, :brain_id, :learner_id, :session_id,
                :trigger_type, :intervention_type, :message, :parameters,
                :timestamp, :learner_response, :effectiveness
            )
        """)

        await db.execute(
            query,
            {
                "intervention_id": intervention.intervention_id,
                "brain_id": intervention.brain_id,
                "learner_id": intervention.learner_id,
                "session_id": intervention.session_id,
                "trigger_type": intervention.trigger.trigger_type,
                "intervention_type": intervention.intervention_type,
                "message": intervention.message,
                "parameters": json.dumps(intervention.parameters),
                "timestamp": intervention.timestamp,
                "learner_response": intervention.learner_response,
                "effectiveness": intervention.effectiveness,
            },
        )
        await db.commit()
