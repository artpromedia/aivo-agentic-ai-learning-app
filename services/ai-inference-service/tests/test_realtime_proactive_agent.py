"""
Tests for Real-Time Proactive Agent

Tests continuous monitoring, trigger detection, intervention decisions,
anti-overhelping safeguards, and effectiveness tracking.
"""

import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.realtime_proactive_agent import (
    InterventionPolicy,
    InterventionTrigger,
    LearnerStateMonitor,
    ProactiveIntervention,
    RealTimeProactiveAgent,
)


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = AsyncMock(spec=AsyncSession)
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    return db


@pytest.fixture
def mock_ai_client():
    """Mock AI client for reasoning."""
    return MagicMock()


@pytest.fixture
def proactive_agent(mock_db, mock_ai_client):
    """Create RealTimeProactiveAgent instance."""
    return RealTimeProactiveAgent(db=mock_db, ai_client=mock_ai_client)


@pytest.fixture
def sample_policy():
    """Sample intervention policy."""
    return InterventionPolicy(
        brain_id="brain_test_001",
        learner_id="learner_test_001",
        max_per_session=4,
        min_time_between_minutes=5,
        autonomy_level=2,
        enabled_triggers=["frustration", "disengagement", "success_momentum"],
        proactive_mode_enabled=True,
        rejection_threshold=2,
    )


# ====================================================================
# TRIGGER DETECTION TESTS
# ====================================================================


def test_detect_frustration_high_severity(proactive_agent):
    """Test frustration detection with high severity."""
    metrics = {"consecutive_errors": 5, "error_rate_last_5min": 0.8}

    trigger = proactive_agent._detect_frustration(metrics)

    assert trigger.trigger_type == "frustration"
    assert trigger.condition_met is True
    assert trigger.severity == "critical"
    assert trigger.confidence >= 0.85
    assert trigger.context["consecutive_errors"] == 5


def test_detect_frustration_not_met(proactive_agent):
    """Test frustration detection when threshold not met."""
    metrics = {"consecutive_errors": 2, "error_rate_last_5min": 0.4}

    trigger = proactive_agent._detect_frustration(metrics)

    assert trigger.trigger_type == "frustration"
    assert trigger.condition_met is False


def test_detect_disengagement_high(proactive_agent):
    """Test disengagement detection for extended idle time."""
    metrics = {
        "seconds_since_last_interaction": 300,  # 5 minutes
        "interactions_last_5min": 0,
    }

    trigger = proactive_agent._detect_disengagement(metrics)

    assert trigger.trigger_type == "disengagement"
    assert trigger.condition_met is True
    assert trigger.severity == "high"
    assert trigger.confidence >= 0.8


def test_detect_success_momentum(proactive_agent):
    """Test success momentum detection."""
    metrics = {"consecutive_successes": 4, "accuracy_last_5min": 0.92}

    trigger = proactive_agent._detect_success_momentum(metrics)

    assert trigger.trigger_type == "success_momentum"
    assert trigger.condition_met is True
    assert trigger.severity in ["medium", "high"]
    assert trigger.confidence >= 0.7


def test_detect_fatigue_from_performance_drop(proactive_agent):
    """Test fatigue detection from declining performance."""
    current_metrics = {"accuracy_last_10min": 0.55, "session_duration_minutes": 25}
    baseline_metrics = {"accuracy": 0.80}

    trigger = proactive_agent._detect_fatigue(current_metrics, baseline_metrics)

    assert trigger.trigger_type == "fatigue"
    assert trigger.condition_met is True
    assert trigger.context["performance_drop"] >= 0.15


def test_detect_stuck_on_problem(proactive_agent):
    """Test stuck detection for long time on problem."""
    metrics = {
        "time_on_current_problem_seconds": 240,  # 4 minutes
        "hint_requests_current_problem": 2,
    }

    trigger = proactive_agent._detect_stuck(metrics)

    assert trigger.trigger_type == "stuck"
    assert trigger.condition_met is True
    assert trigger.severity in ["medium", "high"]


def test_detect_breakthrough(proactive_agent):
    """Test breakthrough detection from sudden improvement."""
    current_metrics = {
        "accuracy_last_5min": 0.85,
        "accuracy_previous_5min": 0.45,
        "errors_before_breakthrough": 3,
    }
    baseline_metrics = {}

    trigger = proactive_agent._detect_breakthrough(current_metrics, baseline_metrics)

    assert trigger.trigger_type == "breakthrough"
    assert trigger.condition_met is True
    assert trigger.context["improvement"] >= 0.3


# ====================================================================
# INTERVENTION PLANNING TESTS
# ====================================================================


def test_plan_frustration_intervention_adhd(proactive_agent):
    """Test frustration intervention planning for ADHD learner."""
    trigger = InterventionTrigger(
        trigger_type="frustration",
        condition_met=True,
        severity="medium",
        confidence=0.75,
        context={"consecutive_errors": 3},
    )
    diagnosis = {"diagnoses": ["adhd"]}

    intervention_type, message, params = proactive_agent._plan_frustration_intervention(
        trigger, diagnosis
    )

    assert intervention_type == "offer_hint_or_break"
    assert "hint" in message.lower() or "break" in message.lower()
    assert "hint" in params["options"]
    assert "break" in params["options"]


def test_plan_frustration_intervention_anxiety(proactive_agent):
    """Test frustration intervention planning for anxiety learner."""
    trigger = InterventionTrigger(
        trigger_type="frustration",
        condition_met=True,
        severity="medium",
        confidence=0.75,
        context={"consecutive_errors": 3},
    )
    diagnosis = {"diagnoses": ["anxiety"]}

    intervention_type, message, params = proactive_agent._plan_frustration_intervention(
        trigger, diagnosis
    )

    assert intervention_type == "offer_hint_or_break"
    assert "okay" in message.lower() or "breathing" in message.lower()
    # Gentle, encouraging tone


def test_plan_disengagement_intervention_adhd(proactive_agent):
    """Test disengagement intervention for ADHD learner."""
    trigger = InterventionTrigger(
        trigger_type="disengagement",
        condition_met=True,
        severity="medium",
        confidence=0.75,
        context={"seconds_idle": 150},
    )
    diagnosis = {"diagnoses": ["adhd"]}

    intervention_type, message, params = proactive_agent._plan_disengagement_intervention(
        trigger, diagnosis
    )

    assert intervention_type == "re_engagement_prompt"
    assert "game" in message.lower() or "switch" in message.lower()
    # ADHD: Proactive redirection


def test_plan_momentum_intervention(proactive_agent):
    """Test success momentum intervention."""
    trigger = InterventionTrigger(
        trigger_type="success_momentum",
        condition_met=True,
        severity="medium",
        confidence=0.8,
        context={"consecutive_successes": 4},
    )
    diagnosis = {}

    intervention_type, message, params = proactive_agent._plan_momentum_intervention(
        trigger, diagnosis
    )

    assert intervention_type == "offer_challenge"
    assert "amazing" in message.lower() or "great" in message.lower()
    assert "challenge" in params["options"]


def test_plan_stuck_intervention_asd(proactive_agent):
    """Test stuck intervention for ASD learner."""
    trigger = InterventionTrigger(
        trigger_type="stuck",
        condition_met=True,
        severity="high",
        confidence=0.85,
        context={"time_on_problem": 240},
    )
    diagnosis = {"diagnoses": ["asd"]}

    intervention_type, message, params = proactive_agent._plan_stuck_intervention(
        trigger, diagnosis
    )

    assert intervention_type == "offer_strategy_hint"
    assert "step" in message.lower()
    # ASD: Predictable, structured help


# ====================================================================
# ANTI-OVERHELPING SAFEGUARDS TESTS
# ====================================================================


def test_should_intervene_max_reached(proactive_agent, sample_policy):
    """Test intervention blocked by max per session."""
    # Create 4 recent interventions (at policy max)
    recent_interventions = [
        ProactiveIntervention(
            brain_id="brain_001",
            learner_id="learner_001",
            session_id="session_001",
            trigger=MagicMock(),
            intervention_type="hint",
            message="test",
            timestamp=datetime.utcnow() - timedelta(minutes=i * 10),
        )
        for i in range(4)
    ]

    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=recent_interventions, trigger=trigger
    )

    assert should is False


def test_should_intervene_too_soon(proactive_agent, sample_policy):
    """Test intervention blocked by minimum time between."""
    # Recent intervention 2 minutes ago (min is 5 minutes)
    recent_interventions = [
        ProactiveIntervention(
            brain_id="brain_001",
            learner_id="learner_001",
            session_id="session_001",
            trigger=MagicMock(),
            intervention_type="hint",
            message="test",
            timestamp=datetime.utcnow() - timedelta(minutes=2),
        )
    ]

    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=recent_interventions, trigger=trigger
    )

    assert should is False


def test_should_intervene_rejection_threshold(proactive_agent, sample_policy):
    """Test intervention blocked by rejection threshold."""
    # 2 recent rejections (at threshold)
    recent_interventions = [
        ProactiveIntervention(
            brain_id="brain_001",
            learner_id="learner_001",
            session_id="session_001",
            trigger=MagicMock(),
            intervention_type="hint",
            message="test",
            timestamp=datetime.utcnow() - timedelta(minutes=i * 10),
            learner_response="rejected",
        )
        for i in range(2)
    ]

    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=recent_interventions, trigger=trigger
    )

    assert should is False


def test_should_intervene_autonomy_level_1(proactive_agent, sample_policy):
    """Test intervention blocked by autonomy level 1 (monitor only)."""
    sample_policy.autonomy_level = 1

    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=[], trigger=trigger
    )

    assert should is False


def test_should_intervene_autonomy_level_2_critical(proactive_agent, sample_policy):
    """Test autonomy level 2 cannot handle critical severity."""
    sample_policy.autonomy_level = 2

    trigger = InterventionTrigger(
        trigger_type="frustration",
        condition_met=True,
        severity="critical",  # Too severe for level 2
        confidence=0.9,
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=[], trigger=trigger
    )

    assert should is False


def test_should_intervene_allowed(proactive_agent, sample_policy):
    """Test intervention allowed when all checks pass."""
    # Last intervention was 10 minutes ago (> 5 min minimum)
    recent_interventions = [
        ProactiveIntervention(
            brain_id="brain_001",
            learner_id="learner_001",
            session_id="session_001",
            trigger=MagicMock(),
            intervention_type="hint",
            message="test",
            timestamp=datetime.utcnow() - timedelta(minutes=10),
            learner_response="accepted",
        )
    ]

    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    should = proactive_agent._should_intervene(
        policy=sample_policy, recent_interventions=recent_interventions, trigger=trigger
    )

    assert should is True


# ====================================================================
# MONITORING WORKFLOW TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_start_session_monitoring(proactive_agent, mock_db):
    """Test starting session monitoring."""
    brain_id = "brain_test_001"
    learner_id = "learner_test_001"
    session_id = "session_test_001"
    baseline_metrics = {"accuracy": 0.75, "average_speed": 45}

    # Mock policy load
    mock_result = MagicMock()
    mock_result.fetchone.return_value = None
    mock_db.execute.return_value = mock_result

    await proactive_agent.start_session_monitoring(
        brain_id=brain_id,
        learner_id=learner_id,
        session_id=session_id,
        baseline_metrics=baseline_metrics,
        db=mock_db,
    )

    monitor_key = f"{learner_id}_{session_id}"

    # Verify monitor created
    assert monitor_key in proactive_agent.active_monitors
    assert monitor_key in proactive_agent.intervention_policies

    monitor = proactive_agent.active_monitors[monitor_key]
    assert monitor.brain_id == brain_id
    assert monitor.learner_id == learner_id
    assert monitor.session_id == session_id
    assert monitor.baseline_metrics == baseline_metrics


@pytest.mark.asyncio
async def test_stop_session_monitoring(proactive_agent):
    """Test stopping session monitoring."""
    learner_id = "learner_test_001"
    session_id = "session_test_001"
    monitor_key = f"{learner_id}_{session_id}"

    # Setup active monitor
    monitor = LearnerStateMonitor(
        brain_id="brain_001",
        learner_id=learner_id,
        session_id=session_id,
        current_metrics={},
        baseline_metrics={},
        monitoring_start=datetime.utcnow() - timedelta(minutes=30),
        last_update=datetime.utcnow(),
    )
    proactive_agent.active_monitors[monitor_key] = monitor
    proactive_agent.intervention_policies[monitor_key] = InterventionPolicy(
        brain_id="brain_001", learner_id=learner_id
    )

    summary = await proactive_agent.stop_session_monitoring(
        learner_id=learner_id, session_id=session_id
    )

    # Verify cleanup
    assert monitor_key not in proactive_agent.active_monitors
    assert monitor_key not in proactive_agent.intervention_policies

    # Verify summary
    assert summary["session_id"] == session_id
    assert summary["learner_id"] == learner_id
    assert "duration_seconds" in summary


@pytest.mark.asyncio
async def test_monitor_learner_state(proactive_agent, mock_db):
    """Test monitoring learner state and trigger detection."""
    brain_id = "brain_test_001"
    learner_id = "learner_test_001"
    session_id = "session_test_001"

    # Setup active monitor
    monitor_key = f"{learner_id}_{session_id}"
    proactive_agent.active_monitors[monitor_key] = LearnerStateMonitor(
        brain_id=brain_id,
        learner_id=learner_id,
        session_id=session_id,
        current_metrics={},
        baseline_metrics={"accuracy": 0.75},
        monitoring_start=datetime.utcnow(),
        last_update=datetime.utcnow(),
    )

    # Mock metrics query
    mock_result = MagicMock()
    mock_result.fetchone.return_value = (3, 5, 0.5, datetime.utcnow().isoformat())
    mock_db.execute.return_value = mock_result

    triggers = await proactive_agent.monitor_learner_state(
        brain_id=brain_id, learner_id=learner_id, session_id=session_id, db=mock_db
    )

    # Should detect triggers
    assert isinstance(triggers, list)
    # Should be sorted by severity
    if len(triggers) > 1:
        severities = [t.severity for t in triggers]
        assert severities == sorted(
            severities, key=lambda s: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(s, 99)
        )


@pytest.mark.asyncio
async def test_decide_intervention_with_triggers(proactive_agent, mock_db):
    """Test intervention decision with detected triggers."""
    brain_id = "brain_test_001"
    learner_id = "learner_test_001"
    session_id = "session_test_001"

    # Setup policy
    monitor_key = f"{learner_id}_{session_id}"
    proactive_agent.intervention_policies[monitor_key] = InterventionPolicy(
        brain_id=brain_id,
        learner_id=learner_id,
        proactive_mode_enabled=True,
        enabled_triggers=["frustration"],
    )

    # Create trigger
    triggers = [
        InterventionTrigger(
            trigger_type="frustration",
            condition_met=True,
            severity="medium",
            confidence=0.75,
            context={"consecutive_errors": 3},
        )
    ]

    # Mock recent interventions query
    mock_result = MagicMock()
    mock_result.fetchall.return_value = []
    mock_db.execute.return_value = mock_result

    intervention = await proactive_agent.decide_intervention(
        brain_id=brain_id,
        learner_id=learner_id,
        session_id=session_id,
        triggers=triggers,
        db=mock_db,
    )

    # Should decide to intervene
    assert intervention is not None
    assert intervention.intervention_type == "offer_hint_or_break"
    assert intervention.trigger.trigger_type == "frustration"


@pytest.mark.asyncio
async def test_decide_intervention_disabled_trigger(proactive_agent, mock_db):
    """Test no intervention when trigger type disabled."""
    brain_id = "brain_test_001"
    learner_id = "learner_test_001"
    session_id = "session_test_001"

    # Setup policy with frustration disabled
    monitor_key = f"{learner_id}_{session_id}"
    proactive_agent.intervention_policies[monitor_key] = InterventionPolicy(
        brain_id=brain_id,
        learner_id=learner_id,
        proactive_mode_enabled=True,
        enabled_triggers=["disengagement"],  # frustration NOT enabled
    )

    # Create frustration trigger
    triggers = [
        InterventionTrigger(
            trigger_type="frustration",  # Disabled
            condition_met=True,
            severity="medium",
            confidence=0.75,
        )
    ]

    # Mock recent interventions query
    mock_result = MagicMock()
    mock_result.fetchall.return_value = []
    mock_db.execute.return_value = mock_result

    intervention = await proactive_agent.decide_intervention(
        brain_id=brain_id,
        learner_id=learner_id,
        session_id=session_id,
        triggers=triggers,
        db=mock_db,
    )

    # Should NOT intervene
    assert intervention is None


# ====================================================================
# DATA MODEL TESTS
# ====================================================================


def test_intervention_trigger_model():
    """Test InterventionTrigger model."""
    trigger = InterventionTrigger(
        trigger_type="frustration",
        condition_met=True,
        severity="high",
        confidence=0.85,
        context={"consecutive_errors": 4},
        reasoning="Detected 4 consecutive errors",
    )

    assert trigger.trigger_id is not None
    assert trigger.trigger_type == "frustration"
    assert trigger.condition_met is True
    assert trigger.severity == "high"
    assert trigger.confidence == 0.85
    assert trigger.detected_at is not None


def test_proactive_intervention_model():
    """Test ProactiveIntervention model."""
    trigger = InterventionTrigger(
        trigger_type="frustration", condition_met=True, severity="medium", confidence=0.75
    )

    intervention = ProactiveIntervention(
        brain_id="brain_001",
        learner_id="learner_001",
        session_id="session_001",
        trigger=trigger,
        intervention_type="offer_hint_or_break",
        message="Would you like a hint?",
        parameters={"options": ["hint", "break"]},
    )

    assert intervention.intervention_id is not None
    assert intervention.brain_id == "brain_001"
    assert intervention.intervention_type == "offer_hint_or_break"
    assert intervention.timestamp is not None
    assert intervention.learner_response is None  # Not yet responded


def test_intervention_policy_defaults():
    """Test InterventionPolicy default values."""
    policy = InterventionPolicy(brain_id="brain_001", learner_id="learner_001")

    assert policy.max_per_session == 4
    assert policy.min_time_between_minutes == 5
    assert policy.autonomy_level == 2
    assert policy.proactive_mode_enabled is True
    assert policy.rejection_threshold == 2
    assert len(policy.enabled_triggers) == 6  # All default triggers


def test_learner_state_monitor_model():
    """Test LearnerStateMonitor model."""
    monitor = LearnerStateMonitor(
        brain_id="brain_001",
        learner_id="learner_001",
        session_id="session_001",
        current_metrics={"accuracy": 0.75},
        baseline_metrics={"accuracy": 0.80},
        monitoring_start=datetime.utcnow(),
        last_update=datetime.utcnow(),
    )

    assert monitor.brain_id == "brain_001"
    assert monitor.current_metrics["accuracy"] == 0.75
    assert monitor.baseline_metrics["accuracy"] == 0.80
    assert len(monitor.state_changes) == 0
    assert len(monitor.alerts) == 0
