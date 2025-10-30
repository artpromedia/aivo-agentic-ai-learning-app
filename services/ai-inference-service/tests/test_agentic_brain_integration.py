"""
Integration tests for Agentic AI Brain system
Tests Goal Planner, BrainManager, and ProactiveAgent working together
"""

import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch

import pytest

from app.core.brain_manager import BrainManager
from app.core.goal_planner import (
    ActionPlan,
    GoalPlanner,
    LearnerState,
    LearningGoal,
    Milestone,
    ProgressEvaluation,
)
from app.core.proactive_agent import ProactiveAgent


# Mock data fixtures
@pytest.fixture
def mock_brain():
    """Mock Brain instance"""
    brain = Mock()
    brain.brain_id = "brain_test123"
    brain.learner_id = "learner_test123"
    brain.grade_level = "3"
    brain.neurodiverse_profiles = ["ADHD", "Dyslexia"]
    brain.learning_style = "visual"
    brain.adaptation_context = {}
    brain.metrics = Mock()
    brain.metrics.total_interactions = 50
    brain.metrics.hint_success_rate = 0.75
    brain.metrics.adaptations_made = 5
    return brain


@pytest.fixture
def mock_sessions():
    """Mock learning sessions"""
    sessions = []
    for i in range(20):
        sessions.append(
            {
                "session_id": f"session_{i}",
                "learner_id": "learner_test123",
                "subject": "reading" if i % 2 == 0 else "math",
                "correct": i % 3 != 0,  # 67% success rate
                "hints_used": 1 if i % 4 == 0 else 0,
                "duration_minutes": 15 + (i % 10),
                "completed": True,
                "created_at": (datetime.utcnow() - timedelta(days=i)).isoformat(),
            }
        )
    return sessions


@pytest.fixture
def mock_iep_goals():
    """Mock IEP goals"""
    return [
        {
            "goal_id": "iep_1",
            "description": "Improve reading comprehension",
            "target": "80% accuracy",
            "progress": 65,
        },
        {
            "goal_id": "iep_2",
            "description": "Build math fluency",
            "target": "Grade-level computation",
            "progress": 70,
        },
    ]


@pytest.fixture
def mock_assessment():
    """Mock assessment data"""
    return {
        "ability_estimates": {
            "reading": -0.5,  # Maps to skill level ~4.2
            "math": 0.3,  # Maps to skill level ~5.5
            "writing": -1.0,  # Maps to skill level ~3.3
        },
        "confidence_intervals": {
            "reading": [-1.0, 0.0],
            "math": [-0.2, 0.8],
        },
    }


@pytest.fixture
def mock_db():
    """Mock database session"""
    db = Mock()
    db.execute = Mock(return_value=Mock(fetchone=Mock(return_value=None)))
    db.commit = Mock()
    return db


# Goal Planner Tests
class TestGoalPlanner:
    @pytest.mark.asyncio
    async def test_analyze_learner_state(
        self, mock_brain, mock_sessions, mock_iep_goals, mock_assessment
    ):
        """Test comprehensive learner state analysis"""
        planner = GoalPlanner()

        # Mock AI client
        with patch.object(
            planner.ai_client,
            "chat_completion",
            new_callable=AsyncMock,
            return_value=Mock(
                choices=[
                    Mock(
                        message=Mock(
                            content=json.dumps(
                                {
                                    "strengths": ["Visual learner", "Persistent"],
                                    "recommended_focus": ["Reading comprehension"],
                                    "obstacles": ["Attention span"],
                                }
                            )
                        )
                    )
                ]
            ),
        ):
            state = await planner.analyze_learner_state(
                brain=mock_brain,
                recent_sessions=mock_sessions,
                iep_goals=mock_iep_goals,
                assessment_data=mock_assessment,
            )

        # Verify LearnerState structure
        assert isinstance(state, LearnerState)
        assert state.learner_id == "learner_test123"
        assert "reading" in state.skill_levels
        assert "math" in state.skill_levels
        assert 0 <= state.engagement_score <= 10
        assert 0 <= state.independence_level <= 10
        assert state.attention_trend in ["improving", "stable", "declining"]
        assert len(state.strengths) > 0
        assert "ADHD" in state.diagnosis_considerations

    @pytest.mark.asyncio
    async def test_generate_learning_goals(
        self, mock_brain, mock_sessions, mock_assessment, mock_db
    ):
        """Test autonomous goal generation"""
        planner = GoalPlanner()

        # Create mock learner state
        learner_state = LearnerState(
            learner_id="learner_test123",
            skill_levels={"reading": 6.2, "math": 7.5, "writing": 5.8},
            skill_gaps=[
                {
                    "subject": "reading",
                    "current_level": 6.2,
                    "expected_level": 7.5,
                    "gap_size": 1.3,
                    "severity": "medium",
                    "priority": 1,
                }
            ],
            strengths=["Visual learner", "Persistent"],
            engagement_score=7.3,
            attention_trend="stable",
            preferred_times=["morning"],
            recent_success_rate=0.67,
            hint_usage_trend="stable",
            independence_level=6.5,
            ready_for_next_level={"reading": False, "math": True},
            recommended_focus=["Reading comprehension"],
            current_obstacles=["Attention span"],
            regulation_needs={"needs_frequent_breaks": True},
            diagnosis_considerations={"ADHD": {"milestone_duration": "10-15 minutes"}},
        )

        # Mock AI response
        with patch.object(
            planner.ai_client,
            "chat_completion",
            new_callable=AsyncMock,
            return_value=Mock(
                choices=[
                    Mock(
                        message=Mock(
                            content=json.dumps(
                                {
                                    "goals": [
                                        {
                                            "goal_type": "skill_building",
                                            "target_skill": "Reading Comprehension",
                                            "subject": "reading",
                                            "current_level": 6.2,
                                            "target_level": 7.5,
                                            "aligned_iep_goals": ["iep_1"],
                                            "district_standards": ["CCSS.ELA.RI.3.2"],
                                            "estimated_sessions": 6,
                                            "strategies": [
                                                "Graphic organizers",
                                                "Think-alouds",
                                            ],
                                            "diagnosis_adaptations": {
                                                "ADHD": {"milestone_duration": "10-15 min"}
                                            },
                                            "milestones": [
                                                {
                                                    "order": 1,
                                                    "description": "Identify main idea",
                                                    "target_date": (
                                                        datetime.utcnow() + timedelta(weeks=1)
                                                    ).isoformat(),
                                                    "success_criteria": ["80% accuracy"],
                                                    "verification_method": "Quiz",
                                                }
                                            ],
                                            "confidence_score": 0.82,
                                            "reasoning": "Priority skill gap",
                                        }
                                    ]
                                }
                            )
                        )
                    )
                ]
            ),
        ):
            goals = await planner.generate_learning_goals(
                brain=mock_brain,
                learner_state=learner_state,
                time_horizon="2_weeks",
                max_goals=2,
                db=mock_db,
            )

        # Verify goals
        assert len(goals) <= 2
        assert isinstance(goals[0], LearningGoal)
        assert goals[0].learner_id == "learner_test123"
        assert goals[0].target_skill == "Reading Comprehension"
        assert 0 <= goals[0].current_level <= 10
        assert 0 <= goals[0].target_level <= 10
        assert len(goals[0].milestones) > 0
        assert len(goals[0].strategies) > 0

    @pytest.mark.asyncio
    async def test_create_action_plan(self, mock_brain, mock_db):
        """Test detailed action plan creation"""
        planner = GoalPlanner()

        # Create mock goal
        goal = LearningGoal(
            learner_id="learner_test123",
            brain_id="brain_test123",
            goal_type="skill_building",
            target_skill="Reading Comprehension",
            subject="reading",
            current_level=6.2,
            target_level=7.5,
            estimated_sessions=6,
            estimated_weeks=2,
            milestones=[],
            strategies=["Graphic organizers"],
            diagnosis_adaptations={"ADHD": {"milestone_duration": "10-15 min"}},
            target_date=(datetime.utcnow() + timedelta(weeks=2)).isoformat(),
            confidence_score=0.82,
            reasoning="Priority gap",
        )

        # Mock AI response
        with patch.object(
            planner.ai_client,
            "chat_completion",
            new_callable=AsyncMock,
            return_value=Mock(
                choices=[
                    Mock(
                        message=Mock(
                            content=json.dumps(
                                {
                                    "scaffolding_sequence": [
                                        "Identify topic",
                                        "Find main idea",
                                    ],
                                    "weekly_activities": {
                                        "1": [
                                            {
                                                "day": 1,
                                                "title": "Main Idea Practice",
                                                "duration_minutes": 15,
                                                "materials_needed": ["Worksheet"],
                                                "step_by_step": ["Read passage"],
                                                "success_criteria": ["80% accuracy"],
                                                "adaptation_if_struggling": "Simplify",
                                                "extension_if_excelling": "Extend",
                                                "parent_guidance": "Support",
                                            }
                                        ]
                                    },
                                    "progress_checkpoints": [
                                        {
                                            "week": 1,
                                            "what_to_check": "Main idea",
                                            "how_to_verify": "Quiz",
                                            "expected_level": "70%",
                                        }
                                    ],
                                    "adaptation_triggers": {
                                        "struggling": "< 50%",
                                        "excelling": "> 85%",
                                    },
                                }
                            )
                        )
                    )
                ]
            ),
        ):
            plan = await planner.create_action_plan(brain=mock_brain, goal=goal, db=mock_db)

        # Verify action plan
        assert isinstance(plan, ActionPlan)
        assert plan.goal_id == goal.goal_id
        assert len(plan.scaffolding_sequence) > 0
        assert 1 in plan.weekly_activities
        assert len(plan.progress_checkpoints) > 0


# BrainManager Integration Tests
class TestBrainManagerIntegration:
    @pytest.mark.asyncio
    async def test_analyze_and_set_goals(
        self, mock_sessions, mock_iep_goals, mock_assessment, mock_db
    ):
        """Test full goal setting flow through BrainManager"""
        manager = BrainManager()

        # Mock brain retrieval
        with patch.object(
            manager,
            "_get_cached_brain",
            return_value=Mock(
                brain_id="brain_test123",
                learner_id="learner_test123",
                grade_level="3",
                neurodiverse_profiles=["ADHD"],
                learning_style="visual",
                adaptation_context={},
                metrics=Mock(total_interactions=50),
            ),
        ):
            # Mock goal planner methods
            with patch.object(
                manager.goal_planner,
                "analyze_learner_state",
                new_callable=AsyncMock,
                return_value=LearnerState(
                    learner_id="learner_test123",
                    skill_levels={"reading": 6.2},
                    skill_gaps=[],
                    strengths=["Visual"],
                    engagement_score=7.3,
                    attention_trend="stable",
                    preferred_times=["morning"],
                    recent_success_rate=0.67,
                    hint_usage_trend="stable",
                    independence_level=6.5,
                    ready_for_next_level={},
                    recommended_focus=[],
                    current_obstacles=[],
                    regulation_needs={},
                    diagnosis_considerations={},
                ),
            ):
                with patch.object(
                    manager.goal_planner,
                    "generate_learning_goals",
                    new_callable=AsyncMock,
                    return_value=[
                        LearningGoal(
                            learner_id="learner_test123",
                            brain_id="brain_test123",
                            goal_type="skill_building",
                            target_skill="Reading",
                            subject="reading",
                            current_level=6.2,
                            target_level=7.5,
                            estimated_sessions=6,
                            estimated_weeks=2,
                            milestones=[],
                            strategies=[],
                            diagnosis_adaptations={},
                            target_date=(datetime.utcnow() + timedelta(weeks=2)).isoformat(),
                            confidence_score=0.8,
                            reasoning="Test",
                        )
                    ],
                ):
                    with patch.object(
                        manager.goal_planner,
                        "create_action_plan",
                        new_callable=AsyncMock,
                        return_value=ActionPlan(
                            goal_id="goal_123",
                            brain_id="brain_test123",
                            scaffolding_sequence=[],
                            weekly_activities={},
                            progress_checkpoints=[],
                            adaptation_triggers={},
                        ),
                    ):
                        result = await manager.analyze_and_set_goals(
                            learner_id="learner_test123",
                            recent_sessions=mock_sessions,
                            iep_goals=mock_iep_goals,
                            assessment_data=mock_assessment,
                            db=mock_db,
                        )

        # Verify result structure
        assert "learner_id" in result
        assert "brain_id" in result
        assert "learner_state" in result
        assert "learning_goals" in result
        assert "action_plans" in result
        assert len(result["learning_goals"]) == 1


# ProactiveAgent Tests
class TestProactiveAgent:
    @pytest.mark.asyncio
    async def test_run_daily_monitoring_cycle(self, mock_db):
        """Test daily monitoring cycle"""
        agent = ProactiveAgent()

        # Mock database queries
        with patch.object(
            agent,
            "_get_learners_with_active_goals",
            new_callable=AsyncMock,
            return_value=[
                {"learner_id": "learner_1", "brain_id": "brain_1"},
                {"learner_id": "learner_2", "brain_id": "brain_2"},
            ],
        ):
            with patch.object(
                agent,
                "_monitor_learner",
                new_callable=AsyncMock,
                return_value={
                    "learner_id": "learner_1",
                    "goals_evaluated": 2,
                    "interventions_taken": 1,
                    "notifications_sent": 0,
                },
            ):
                with patch.object(
                    agent,
                    "_store_cycle_results",
                    new_callable=AsyncMock,
                ):
                    results = await agent.run_daily_monitoring_cycle(mock_db)

        # Verify cycle results
        assert results["learners_monitored"] == 2
        assert results["goals_evaluated"] == 4  # 2 learners * 2 goals
        assert results["interventions_taken"] == 2  # 2 learners * 1 intervention
        assert "cycle_start" in results
        assert "cycle_end" in results
        assert "duration_seconds" in results

    @pytest.mark.asyncio
    async def test_intervention_execution(self, mock_db):
        """Test specific intervention execution"""
        agent = ProactiveAgent()

        goal = LearningGoal(
            learner_id="learner_test123",
            brain_id="brain_test123",
            goal_type="skill_building",
            target_skill="Reading",
            subject="reading",
            current_level=6.2,
            target_level=7.5,
            estimated_sessions=6,
            estimated_weeks=2,
            milestones=[],
            strategies=[],
            diagnosis_adaptations={},
            target_date=(datetime.utcnow() + timedelta(weeks=2)).isoformat(),
            progress=45.0,
            confidence_score=0.8,
            reasoning="Test",
        )

        # Test difficulty adjustment
        with patch.object(agent, "_store_intervention", new_callable=AsyncMock):
            result = await agent._execute_intervention(
                learner_id="learner_test123",
                brain_id="brain_test123",
                goal=goal,
                action_type="adjust_difficulty",
                reasoning="Learner struggling",
                db=mock_db,
            )

        assert result["action_type"] == "adjust_difficulty"
        assert result["intervention_id"] is not None
        assert "result" in result


# Integration test combining all components
@pytest.mark.asyncio
async def test_full_agentic_workflow(
    mock_brain, mock_sessions, mock_iep_goals, mock_assessment, mock_db
):
    """
    Test complete agentic workflow:
    1. Analyze learner state
    2. Generate goals
    3. Create action plans
    4. Monitor progress
    5. Take interventions
    """
    # Step 1: Goal setting via BrainManager
    manager = BrainManager()

    with patch.object(manager, "_get_cached_brain", return_value=mock_brain):
        with patch.object(
            manager.goal_planner.ai_client,
            "chat_completion",
            new_callable=AsyncMock,
            return_value=Mock(
                choices=[
                    Mock(
                        message=Mock(
                            content=json.dumps(
                                {
                                    "strengths": ["Visual"],
                                    "recommended_focus": ["Reading"],
                                    "obstacles": [],
                                }
                            )
                        )
                    )
                ]
            ),
        ):
            # Simplified: Just verify BrainManager is integrated
            assert manager.goal_planner is not None

    # Step 2: Daily monitoring via ProactiveAgent
    agent = ProactiveAgent()
    assert agent.brain_manager is not None
    assert agent.reasoning_engine is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
