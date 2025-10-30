"""
Comprehensive test suite for Agentic BrainManager Integration (Prompt 9)

Tests all new methods added in Prompt 8:
- run_autonomous_cycle()
- make_decision()
- on_session_start()
- on_session_end()
- on_hint_given()
- on_error()
- _initialize_agentic_brain()
"""

import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from app.models.brain import BrainInstance, BrainStatus, LearningProfile

from app.core.brain_manager import BrainManager
from app.core.config import settings


# Fixtures
@pytest.fixture
def mock_brain():
    """Create mock brain instance"""
    return BrainInstance(
        brain_id="brain_test_123",
        learner_id="learner_test_456",
        base_model_name="gpt-4-turbo",
        base_model_version="1.0.0",
        learning_profile=LearningProfile(
            learner_id="learner_test_456",
            age=8,
            grade_level="3",
            diagnoses=["adhd", "dyslexia"],
            learning_pace="moderate",
            preferred_complexity="moderate",
            sensory_preferences={"visual": "high", "auditory": "medium"},
            attention_span_minutes=20,
            support_needs=["frequent_breaks", "visual_aids"],
        ),
        status=BrainStatus.ACTIVE,
        model_params={"temperature": 0.7, "max_tokens": 4096},
        adaptation_context={
            "last_adaptation": datetime.utcnow().isoformat(),
            "adaptations_count": 5,
        },
    )


@pytest.fixture
def mock_sessions():
    """Create mock learning sessions"""
    sessions = []
    for i in range(7):
        sessions.append(
            {
                "session_id": f"session_{i}",
                "learner_id": "learner_test_456",
                "brain_id": "brain_test_123",
                "subject": "math" if i % 2 == 0 else "reading",
                "duration_minutes": 15 + i,
                "success_rate": 0.7 + (i * 0.05),
                "error_rate": 0.3 - (i * 0.05),
                "hints_used": i % 3,
                "completed": True,
                "created_at": (datetime.utcnow() - timedelta(days=i)).isoformat(),
                "problems_attempted": 10,
                "problems_correct": 7 + i,
            }
        )
    return sessions


@pytest.fixture
def mock_learning_goals():
    """Create mock learning goals"""
    return [
        Mock(
            goal_id="goal_1",
            learner_id="learner_test_456",
            brain_id="brain_test_123",
            target_skill="Reading Comprehension",
            subject="reading",
            current_level=6.2,
            target_level=7.5,
            progress=45.0,
            status="active",
            created_at=datetime.utcnow() - timedelta(days=7),
            target_date=datetime.utcnow() + timedelta(days=7),
        ),
        Mock(
            goal_id="goal_2",
            learner_id="learner_test_456",
            brain_id="brain_test_123",
            target_skill="Math Fluency",
            subject="math",
            current_level=5.5,
            target_level=6.8,
            progress=60.0,
            status="active",
            created_at=datetime.utcnow() - timedelta(days=5),
            target_date=datetime.utcnow() + timedelta(days=9),
        ),
    ]


@pytest.fixture
def mock_db():
    """Create mock database session"""
    db = Mock()
    db.execute = Mock(
        return_value=Mock(fetchall=Mock(return_value=[]), fetchone=Mock(return_value=None))
    )
    db.commit = Mock()
    db.rollback = Mock()
    return db


@pytest.fixture
def brain_manager():
    """Create BrainManager instance"""
    return BrainManager()


# ============================================================================
# TEST CLASS: run_autonomous_cycle()
# ============================================================================
class TestAutonomousCycle:
    """Test suite for run_autonomous_cycle() method"""

    @pytest.mark.asyncio
    async def test_autonomous_cycle_disabled_mode(self, brain_manager, mock_db):
        """Test autonomous cycle when agentic mode is disabled"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", False):
            result = await brain_manager.run_autonomous_cycle(
                brain_id="brain_test_123", trigger="scheduled", db=mock_db
            )

        assert result["status"] == "disabled"
        assert "message" in result

    @pytest.mark.asyncio
    async def test_autonomous_cycle_scheduled_trigger(
        self, brain_manager, mock_brain, mock_sessions, mock_learning_goals, mock_db
    ):
        """Test full autonomous cycle with scheduled trigger"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            # Mock brain retrieval
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                # Mock session fetching
                with patch.object(
                    brain_manager,
                    "_fetch_recent_sessions",
                    new_callable=AsyncMock,
                    return_value=mock_sessions,
                ):
                    # Mock agentic components
                    brain_manager.reasoning_engine = Mock()
                    brain_manager.reasoning_engine.reflect_on_session = AsyncMock(
                        return_value={
                            "summary": "Learner showing improvement",
                            "insights": ["Better focus on math", "Needs reading support"],
                        }
                    )

                    brain_manager.brain_memory = Mock()
                    brain_manager.brain_memory.store_episode = AsyncMock()
                    brain_manager.brain_memory.extract_patterns = AsyncMock(
                        return_value=["Struggles in morning", "Excels with visuals"]
                    )

                    brain_manager.goal_planner = Mock()
                    brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                        return_value=Mock(
                            skill_levels={"reading": 6.5, "math": 7.0}, engagement_score=7.5
                        )
                    )
                    brain_manager.goal_planner.generate_learning_goals = AsyncMock(
                        return_value=[Mock(goal_id="goal_new_1", target_skill="Writing")]
                    )
                    brain_manager.goal_planner.evaluate_goal_progress = AsyncMock(
                        return_value={"progress": 50.0, "needs_adjustment": False}
                    )

                    # Mock goal fetching
                    with patch.object(
                        brain_manager,
                        "_fetch_active_goals",
                        new_callable=AsyncMock,
                        return_value=[],
                    ):
                        with patch.object(
                            brain_manager,
                            "_fetch_iep_goals",
                            new_callable=AsyncMock,
                            return_value=[],
                        ):
                            with patch.object(
                                brain_manager,
                                "_fetch_assessments",
                                new_callable=AsyncMock,
                                return_value={},
                            ):
                                # Run cycle
                                result = await brain_manager.run_autonomous_cycle(
                                    brain_id="brain_test_123", trigger="scheduled", db=mock_db
                                )

        # Verify result structure
        assert result["brain_id"] == "brain_test_123"
        assert result["trigger"] == "scheduled"
        assert "timestamp" in result
        assert "sessions_analyzed" in result
        assert result["sessions_analyzed"] == 7
        assert result["reflections_stored"] >= 0
        assert result["goals_generated"] >= 0
        assert result["memory_updated"] is True
        assert isinstance(result["actions"], list)

    @pytest.mark.asyncio
    async def test_autonomous_cycle_no_sessions(self, brain_manager, mock_brain, mock_db):
        """Test autonomous cycle with no recent sessions"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                with patch.object(
                    brain_manager, "_fetch_recent_sessions", new_callable=AsyncMock, return_value=[]
                ):
                    brain_manager.goal_planner = Mock()
                    brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                        return_value=Mock(skill_levels={})
                    )

                    with patch.object(
                        brain_manager,
                        "_fetch_active_goals",
                        new_callable=AsyncMock,
                        return_value=[],
                    ):
                        with patch.object(
                            brain_manager,
                            "_fetch_iep_goals",
                            new_callable=AsyncMock,
                            return_value=[],
                        ):
                            with patch.object(
                                brain_manager,
                                "_fetch_assessments",
                                new_callable=AsyncMock,
                                return_value={},
                            ):
                                result = await brain_manager.run_autonomous_cycle(
                                    brain_id="brain_test_123", trigger="manual", db=mock_db
                                )

        assert result["sessions_analyzed"] == 0
        assert result["reflections_stored"] == 0

    @pytest.mark.asyncio
    async def test_autonomous_cycle_error_handling(self, brain_manager, mock_db):
        """Test autonomous cycle error handling"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(
                brain_manager, "_get_brain_by_id", side_effect=ValueError("Brain not found")
            ):
                result = await brain_manager.run_autonomous_cycle(
                    brain_id="brain_invalid", trigger="scheduled", db=mock_db
                )

        assert result["status"] == "failed"
        assert "error" in result
        assert "Brain not found" in result["error"]

    @pytest.mark.asyncio
    async def test_autonomous_cycle_updates_brain_context(self, brain_manager, mock_brain, mock_db):
        """Test that cycle updates brain's adaptation context"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                with patch.object(
                    brain_manager, "_fetch_recent_sessions", new_callable=AsyncMock, return_value=[]
                ):
                    brain_manager.goal_planner = Mock()
                    brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                        return_value=Mock(skill_levels={})
                    )

                    with patch.object(
                        brain_manager,
                        "_fetch_active_goals",
                        new_callable=AsyncMock,
                        return_value=[],
                    ):
                        with patch.object(
                            brain_manager,
                            "_fetch_iep_goals",
                            new_callable=AsyncMock,
                            return_value=[],
                        ):
                            with patch.object(
                                brain_manager,
                                "_fetch_assessments",
                                new_callable=AsyncMock,
                                return_value={},
                            ):
                                with patch.object(brain_manager, "_cache_brain"):
                                    await brain_manager.run_autonomous_cycle(
                                        brain_id="brain_test_123", trigger="scheduled", db=mock_db
                                    )

        # Verify brain context was updated
        assert "last_autonomous_cycle" in mock_brain.adaptation_context


# ============================================================================
# TEST CLASS: make_decision()
# ============================================================================
class TestMakeDecision:
    """Test suite for make_decision() method"""

    @pytest.mark.asyncio
    async def test_decision_disabled_mode(self, brain_manager, mock_db):
        """Test decision making when agentic mode is disabled"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", False):
            result = await brain_manager.make_decision(
                brain_id="brain_test_123",
                decision_type="intervention",
                context={"errors": 3},
                db=mock_db,
            )

        assert result["status"] == "disabled"
        assert result["decision"] == "no_action"

    @pytest.mark.asyncio
    async def test_intervention_decision(self, brain_manager, mock_brain, mock_db):
        """Test intervention decision making"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                brain_manager.reasoning_engine = Mock()
                brain_manager.reasoning_engine.reason_about_intervention = AsyncMock(
                    return_value={
                        "final_decision": {
                            "action": "provide_hint",
                            "hint_level": "simple",
                            "reason": "Learner struggling but engaged",
                        },
                        "reasoning": "Learner made 3 errors but shows persistence",
                        "confidence": 0.85,
                    }
                )

                brain_manager.brain_memory = Mock()
                brain_manager.brain_memory.recall_relevant_memories = AsyncMock(return_value=[])
                brain_manager.brain_memory.store_episode = AsyncMock()

                result = await brain_manager.make_decision(
                    brain_id="brain_test_123",
                    decision_type="intervention",
                    context={"errors": 3, "frustration": "medium", "time_on_problem": 180},
                    db=mock_db,
                )

        assert "final_decision" in result
        assert result["final_decision"]["action"] == "provide_hint"
        assert "reasoning" in result
        assert "confidence" in result

    @pytest.mark.asyncio
    async def test_difficulty_adjustment_decision(self, brain_manager, mock_brain, mock_db):
        """Test difficulty adjustment decision"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                brain_manager.reasoning_engine = Mock()
                brain_manager.reasoning_engine.reason = AsyncMock(
                    return_value={
                        "final_decision": {"action": "increase_difficulty", "new_level": 7.5},
                        "reasoning": "95% success rate indicates readiness",
                        "confidence": 0.9,
                    }
                )

                brain_manager.brain_memory = Mock()
                brain_manager.brain_memory.recall_relevant_memories = AsyncMock(return_value=[])
                brain_manager.brain_memory.store_episode = AsyncMock()

                result = await brain_manager.make_decision(
                    brain_id="brain_test_123",
                    decision_type="difficulty",
                    context={"success_rate": 0.95, "current_level": 6.5},
                    db=mock_db,
                )

        assert result["final_decision"]["action"] == "increase_difficulty"

    @pytest.mark.asyncio
    async def test_decision_with_memory_recall(self, brain_manager, mock_brain, mock_db):
        """Test decision making uses relevant memories"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                brain_manager.brain_memory = Mock()
                brain_manager.brain_memory.recall_relevant_memories = AsyncMock(
                    return_value=[
                        Mock(
                            model_dump=Mock(
                                return_value={
                                    "event_type": "intervention",
                                    "outcome": "successful",
                                    "context": "Similar situation last week",
                                }
                            )
                        )
                    ]
                )
                brain_manager.brain_memory.store_episode = AsyncMock()

                brain_manager.reasoning_engine = Mock()
                brain_manager.reasoning_engine.reason_about_intervention = AsyncMock(
                    return_value={
                        "final_decision": {"action": "no_action"},
                        "reasoning": "Past memory shows learner recovers independently",
                    }
                )

                result = await brain_manager.make_decision(
                    brain_id="brain_test_123",
                    decision_type="intervention",
                    context={"errors": 2},
                    db=mock_db,
                )

        # Verify memory was recalled
        brain_manager.brain_memory.recall_relevant_memories.assert_called_once()


# ============================================================================
# TEST CLASS: Session Lifecycle Hooks
# ============================================================================
class TestSessionHooks:
    """Test suite for session lifecycle hooks"""

    @pytest.mark.asyncio
    async def test_session_start_monitoring_enabled(self, brain_manager, mock_db):
        """Test session start with monitoring enabled"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(settings, "AGENTIC_PROACTIVE_MONITORING", True):
                brain_manager.proactive_agent = Mock()
                brain_manager.proactive_agent.start_monitoring = AsyncMock(
                    return_value={"monitoring": True, "policy": {}}
                )

                with patch.object(
                    brain_manager,
                    "_get_intervention_policy",
                    new_callable=AsyncMock,
                    return_value={"autonomy_level": "GUIDED"},
                ):
                    result = await brain_manager.on_session_start(
                        brain_id="brain_test_123",
                        session_id="session_789",
                        context={"subject": "math", "difficulty": "medium"},
                        db=mock_db,
                    )

        assert result["monitoring"] is True
        brain_manager.proactive_agent.start_monitoring.assert_called_once()

    @pytest.mark.asyncio
    async def test_session_start_monitoring_disabled(self, brain_manager, mock_db):
        """Test session start with monitoring disabled"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", False):
            result = await brain_manager.on_session_start(
                brain_id="brain_test_123", session_id="session_789", context={}, db=mock_db
            )

        assert result["monitoring"] is False

    @pytest.mark.asyncio
    async def test_session_end_with_reflection(self, brain_manager, mock_db):
        """Test session end triggers reflection"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.proactive_agent = Mock()
            brain_manager.proactive_agent.stop_monitoring = AsyncMock()

            brain_manager.reasoning_engine = Mock()
            brain_manager.reasoning_engine.reflect_on_session = AsyncMock(
                return_value={
                    "insights": ["Good progress on fractions"],
                    "patterns": ["Performs better in afternoon"],
                }
            )

            brain_manager.brain_memory = Mock()
            brain_manager.brain_memory.store_episode = AsyncMock()

            with patch.object(brain_manager, "_calculate_session_importance", return_value=0.75):
                result = await brain_manager.on_session_end(
                    brain_id="brain_test_123",
                    session_id="session_789",
                    session_data={"completed": True, "success_rate": 0.85, "duration_minutes": 25},
                    db=mock_db,
                )

        assert result["reflected"] is True
        assert result["memory_stored"] is True
        assert result["monitoring_stopped"] is True
        assert len(result["insights"]) > 0

    @pytest.mark.asyncio
    async def test_session_end_low_importance(self, brain_manager, mock_db):
        """Test session end with low importance doesn't store memory"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.proactive_agent = Mock()
            brain_manager.proactive_agent.stop_monitoring = AsyncMock()

            brain_manager.reasoning_engine = Mock()
            brain_manager.reasoning_engine.reflect_on_session = AsyncMock(
                return_value={"insights": []}
            )

            brain_manager.brain_memory = Mock()

            with patch.object(
                brain_manager,
                "_calculate_session_importance",
                return_value=0.3,  # Below threshold
            ):
                result = await brain_manager.on_session_end(
                    brain_id="brain_test_123",
                    session_id="session_789",
                    session_data={"completed": True, "success_rate": 0.6},
                    db=mock_db,
                )

        assert result["memory_stored"] is False

    @pytest.mark.asyncio
    async def test_hint_given_hook(self, brain_manager, mock_db):
        """Test hint given hook stores episode"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.brain_memory = Mock()
            brain_manager.brain_memory.store_episode = AsyncMock()

            await brain_manager.on_hint_given(
                brain_id="brain_test_123",
                hint_data={"hint_type": "visual", "problem_id": "prob_123", "hint_level": "simple"},
                db=mock_db,
            )

            brain_manager.brain_memory.store_episode.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_hook_triggers_intervention(self, brain_manager, mock_db):
        """Test error hook checks for intervention need"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.proactive_agent = Mock()
            brain_manager.proactive_agent.detect_triggers = AsyncMock(return_value=True)

            with patch.object(
                brain_manager,
                "make_decision",
                new_callable=AsyncMock,
                return_value={
                    "final_decision": {"action": "provide_support"},
                    "reasoning": "Pattern of errors detected",
                },
            ):
                result = await brain_manager.on_error(
                    brain_id="brain_test_123",
                    error_data={
                        "error_type": "calculation",
                        "consecutive_errors": 3,
                        "time_struggling": 120,
                    },
                    db=mock_db,
                )

        assert result["intervention"] is True
        assert "decision" in result

    @pytest.mark.asyncio
    async def test_error_hook_no_intervention(self, brain_manager, mock_db):
        """Test error hook when no intervention needed"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.proactive_agent = Mock()
            brain_manager.proactive_agent.detect_triggers = AsyncMock(return_value=False)

            result = await brain_manager.on_error(
                brain_id="brain_test_123",
                error_data={"error_type": "minor", "consecutive_errors": 1},
                db=mock_db,
            )

        assert result["intervention"] is False


# ============================================================================
# TEST CLASS: _initialize_agentic_brain()
# ============================================================================
class TestInitializeAgenticBrain:
    """Test suite for agentic brain initialization"""

    @pytest.mark.asyncio
    async def test_initialize_new_brain(self, brain_manager, mock_brain, mock_db):
        """Test initialization of agentic features for new brain"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            brain_manager.goal_planner = Mock()
            brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                return_value=Mock(skill_levels={"reading": 5.0})
            )
            brain_manager.goal_planner.generate_learning_goals = AsyncMock(
                return_value=[
                    Mock(goal_id="goal_1", target_skill="Reading"),
                    Mock(goal_id="goal_2", target_skill="Math"),
                ]
            )

            brain_manager.brain_memory = Mock()
            brain_manager.brain_memory.initialize_brain = AsyncMock()

            brain_manager.tool_executor = Mock()
            brain_manager.tool_executor.initialize_policy = AsyncMock()

            with patch.object(
                brain_manager, "_fetch_iep_goals", new_callable=AsyncMock, return_value=[]
            ):
                with patch.object(
                    brain_manager, "_fetch_assessments", new_callable=AsyncMock, return_value={}
                ):
                    with patch.object(brain_manager, "_cache_brain"):
                        await brain_manager._initialize_agentic_brain(brain=mock_brain, db=mock_db)

        # Verify initialization steps
        assert mock_brain.adaptation_context["agentic_initialized"] is True
        assert mock_brain.adaptation_context["initial_goals_count"] == 2
        brain_manager.brain_memory.initialize_brain.assert_called_once()
        brain_manager.tool_executor.initialize_policy.assert_called_once()

    @pytest.mark.asyncio
    async def test_initialize_disabled_mode(self, brain_manager, mock_brain, mock_db):
        """Test initialization does nothing when mode disabled"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", False):
            await brain_manager._initialize_agentic_brain(brain=mock_brain, db=mock_db)

        # Verify nothing happened
        assert "agentic_initialized" not in mock_brain.adaptation_context


# ============================================================================
# TEST CLASS: Helper Methods
# ============================================================================
class TestHelperMethods:
    """Test suite for helper methods"""

    def test_calculate_session_importance_breakthrough(self, brain_manager):
        """Test importance calculation for breakthrough session"""
        session_data = {
            "success_rate": 0.95,  # High success = +0.4
            "error_rate": 0.05,
            "duration_minutes": 35,  # Long = +0.2
            "hints_used": 2,  # Hints = +0.1
        }

        importance = brain_manager._calculate_session_importance(session_data)

        assert importance >= 0.7  # Should be high
        assert importance <= 1.0

    def test_calculate_session_importance_struggle(self, brain_manager):
        """Test importance calculation for struggle session"""
        session_data = {
            "success_rate": 0.3,
            "error_rate": 0.7,  # High errors = +0.3
            "duration_minutes": 40,  # Long = +0.2
            "hints_used": 5,  # Hints = +0.1
        }

        importance = brain_manager._calculate_session_importance(session_data)

        assert importance >= 0.6
        assert importance <= 1.0

    def test_calculate_session_importance_routine(self, brain_manager):
        """Test importance calculation for routine session"""
        session_data = {
            "success_rate": 0.7,
            "error_rate": 0.3,
            "duration_minutes": 15,
            "hints_used": 0,
        }

        importance = brain_manager._calculate_session_importance(session_data)

        assert importance < 0.5  # Should be low

    def test_should_update_goals_no_goals(self, brain_manager):
        """Test goal update check with no active goals"""
        result = brain_manager._should_update_goals(active_goals=[], learner_state=Mock())

        assert result is True

    def test_should_update_goals_too_few(self, brain_manager):
        """Test goal update check with too few goals"""
        result = brain_manager._should_update_goals(
            active_goals=[Mock()],  # Only 1 goal
            learner_state=Mock(),
        )

        assert result is True

    def test_should_update_goals_stale(self, brain_manager):
        """Test goal update check with stale goals"""
        old_goal = Mock()
        old_goal.created_at = datetime.utcnow() - timedelta(days=30)

        result = brain_manager._should_update_goals(
            active_goals=[old_goal, old_goal], learner_state=Mock()
        )

        assert result is True

    def test_should_update_goals_fresh(self, brain_manager):
        """Test goal update check with fresh goals"""
        fresh_goal = Mock()
        fresh_goal.created_at = datetime.utcnow() - timedelta(days=3)

        result = brain_manager._should_update_goals(
            active_goals=[fresh_goal, fresh_goal, fresh_goal], learner_state=Mock()
        )

        assert result is False


# ============================================================================
# INTEGRATION TESTS
# ============================================================================
class TestIntegration:
    """Integration tests combining multiple methods"""

    @pytest.mark.asyncio
    async def test_full_session_lifecycle(self, brain_manager, mock_db):
        """Test complete session lifecycle with all hooks"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(settings, "AGENTIC_PROACTIVE_MONITORING", True):
                # Setup mocks
                brain_manager.proactive_agent = Mock()
                brain_manager.proactive_agent.start_monitoring = AsyncMock(
                    return_value={"monitoring": True}
                )
                brain_manager.proactive_agent.stop_monitoring = AsyncMock()

                brain_manager.reasoning_engine = Mock()
                brain_manager.reasoning_engine.reflect_on_session = AsyncMock(
                    return_value={"insights": ["Good progress"]}
                )

                brain_manager.brain_memory = Mock()
                brain_manager.brain_memory.store_episode = AsyncMock()

                with patch.object(
                    brain_manager,
                    "_get_intervention_policy",
                    new_callable=AsyncMock,
                    return_value={},
                ):
                    with patch.object(
                        brain_manager, "_calculate_session_importance", return_value=0.8
                    ):
                        # Start session
                        start_result = await brain_manager.on_session_start(
                            brain_id="brain_test_123",
                            session_id="session_integration",
                            context={"subject": "math"},
                            db=mock_db,
                        )

                        assert start_result["monitoring"] is True

                        # End session
                        end_result = await brain_manager.on_session_end(
                            brain_id="brain_test_123",
                            session_id="session_integration",
                            session_data={
                                "completed": True,
                                "success_rate": 0.85,
                                "duration_minutes": 20,
                            },
                            db=mock_db,
                        )

                        assert end_result["reflected"] is True
                        assert end_result["memory_stored"] is True
                        assert end_result["monitoring_stopped"] is True

    @pytest.mark.asyncio
    async def test_autonomous_cycle_to_decision_flow(self, brain_manager, mock_brain, mock_db):
        """Test autonomous cycle triggering decisions"""
        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                # Setup autonomous cycle mocks
                with patch.object(
                    brain_manager,
                    "_fetch_recent_sessions",
                    new_callable=AsyncMock,
                    return_value=[{"session_id": "s1"}],
                ):
                    brain_manager.reasoning_engine = Mock()
                    brain_manager.reasoning_engine.reflect_on_session = AsyncMock(
                        return_value={"summary": "Test", "insights": []}
                    )

                    brain_manager.brain_memory = Mock()
                    brain_manager.brain_memory.store_episode = AsyncMock()
                    brain_manager.brain_memory.extract_patterns = AsyncMock(return_value=[])

                    brain_manager.goal_planner = Mock()
                    brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                        return_value=Mock(skill_levels={})
                    )

                    with patch.object(
                        brain_manager,
                        "_fetch_active_goals",
                        new_callable=AsyncMock,
                        return_value=[],
                    ):
                        with patch.object(
                            brain_manager,
                            "_fetch_iep_goals",
                            new_callable=AsyncMock,
                            return_value=[],
                        ):
                            with patch.object(
                                brain_manager,
                                "_fetch_assessments",
                                new_callable=AsyncMock,
                                return_value={},
                            ):
                                with patch.object(brain_manager, "_cache_brain"):
                                    # Run cycle
                                    cycle_result = await brain_manager.run_autonomous_cycle(
                                        brain_id="brain_test_123", trigger="scheduled", db=mock_db
                                    )

                    assert "actions" in cycle_result

                    # Now test decision making
                    brain_manager.reasoning_engine.reason_about_intervention = AsyncMock(
                        return_value={
                            "final_decision": {"action": "adjust_difficulty"},
                            "reasoning": "Based on cycle analysis",
                        }
                    )

                    brain_manager.brain_memory.recall_relevant_memories = AsyncMock(return_value=[])

                    decision_result = await brain_manager.make_decision(
                        brain_id="brain_test_123",
                        decision_type="difficulty",
                        context={"success_rate": 0.9},
                        db=mock_db,
                    )

                    assert decision_result["final_decision"]["action"] == "adjust_difficulty"


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================
class TestPerformance:
    """Performance and load tests"""

    @pytest.mark.asyncio
    async def test_autonomous_cycle_performance(self, brain_manager, mock_brain, mock_db):
        """Test autonomous cycle completes in reasonable time"""
        import time

        with patch.object(settings, "ENABLE_AGENTIC_MODE", True):
            with patch.object(brain_manager, "_get_brain_by_id", return_value=mock_brain):
                with patch.object(
                    brain_manager, "_fetch_recent_sessions", new_callable=AsyncMock, return_value=[]
                ):
                    brain_manager.goal_planner = Mock()
                    brain_manager.goal_planner.analyze_learner_state = AsyncMock(
                        return_value=Mock(skill_levels={})
                    )

                    with patch.object(
                        brain_manager,
                        "_fetch_active_goals",
                        new_callable=AsyncMock,
                        return_value=[],
                    ):
                        with patch.object(
                            brain_manager,
                            "_fetch_iep_goals",
                            new_callable=AsyncMock,
                            return_value=[],
                        ):
                            with patch.object(
                                brain_manager,
                                "_fetch_assessments",
                                new_callable=AsyncMock,
                                return_value={},
                            ):
                                start_time = time.time()

                                await brain_manager.run_autonomous_cycle(
                                    brain_id="brain_test_123", trigger="scheduled", db=mock_db
                                )

                                elapsed = time.time() - start_time

        # Should complete within 5 seconds
        assert elapsed < 5.0


if __name__ == "__main__":
    # Run tests with coverage
    pytest.main(
        [
            __file__,
            "-v",
            "--cov=app.core.brain_manager",
            "--cov-report=html",
            "--cov-report=term-missing",
        ]
    )
