"""
Integration Tests for ReasoningEngine v2 (ReAct Pattern)
Tests all three reasoning modes with structured Pydantic outputs
"""

import asyncio
import json
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.reasoning_engine import (
    InterventionDecision,
    ReasoningEngine,
    ReasoningStep,
    ReasoningTrace,
    SessionReflection,
    StrategyPhase,
    TeachingStrategy,
    reason_intervention,
)


class TestReasoningEngineV2Integration:
    """Integration tests for ReasoningEngine v2 with ReAct pattern"""

    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        db = MagicMock()
        db.execute = MagicMock(return_value=MagicMock())
        db.commit = MagicMock()
        return db

    @pytest.fixture
    def reasoning_engine(self):
        """Create ReasoningEngine instance"""
        return ReasoningEngine()

    @pytest.fixture
    def mock_ai_client(self):
        """Mock AI client responses"""
        with patch("app.core.reasoning_engine.get_ai_client") as mock:
            client = AsyncMock()
            mock.return_value = client
            yield client

    # ==================== Intervention Reasoning Tests ====================

    @pytest.mark.asyncio
    async def test_intervention_reasoning_adhd_learner(
        self, reasoning_engine, mock_db, mock_ai_client
    ):
        """Test intervention reasoning for ADHD learner struggling with math"""

        # Mock AI responses for 5-step ReAct loop
        mock_responses = [
            # Step 1: Thought
            {
                "thought": (
                    "Learner made 3 consecutive errors on fraction problems. "
                    "ADHD diagnosis suggests attention may be wavering."
                ),
                "action": "analyze_error_patterns",
                "reasoning_complete": False,
                "confidence": 0.70,
            },
            # Step 2: Action result + next thought
            {
                "thought": (
                    "Error pattern shows denominator confusion. "
                    "Need to check if visual aids were effective before."
                ),
                "action": "review_past_successes",
                "reasoning_complete": False,
                "confidence": 0.75,
            },
            # Step 3: Final decision
            {
                "thought": "Visual approach with short 10-min session recommended",
                "action": "make_decision",
                "reasoning_complete": True,
                "confidence": 0.85,
            },
        ]

        # Mock observations
        mock_observations = {
            "analyze_error_patterns": (
                "All 3 errors involve denominator confusion. "
                "Pattern suggests systematic conceptual gap."
            ),
            "review_past_successes": (
                "Historical data shows 'visual' interventions were 80% effective"
            ),
        }

        # Mock final decision
        mock_decision = {
            "intervention_type": "explanation",
            "specific_action": ("Provide visual fraction model focusing on denominators"),
            "parameters": {
                "complexity_level": "simple",
                "tone": "encouraging",
                "format": "visual",
                "duration": "10 min",
            },
            "reasoning_summary": (
                "Visual learner with denominator confusion needs concrete visual model"
            ),
            "expected_outcome": ("Learner understands denominator role through visualization"),
            "fallback_plan": "Request teacher help if still confused",
            "confidence": 0.85,
        }

        call_count = [0]

        async def mock_chat_completion(*args, **kwargs):
            """Mock AI responses for ReAct loop"""
            content = kwargs.get("messages", [{}])[-1].get("content", "")

            if "What is your analytical thought" in content:
                response = mock_responses[call_count[0]]
                call_count[0] += 1
            elif "What action should you take" in content:
                action = mock_responses[call_count[0] - 1]["action"]
                response = {"action": action, "reasoning_complete": False}
            elif "make a final intervention decision" in content:
                response = mock_decision
            else:
                # Default observation response
                action = mock_responses[call_count[0] - 1].get("action", "")
                observation = mock_observations.get(action, "Observation complete")
                response = {"observation": observation}

            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(response)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=500),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        # Execute intervention reasoning
        decision = await reason_intervention(
            brain_id="brain_123",
            learner_id="learner_456",
            context="homework_struggling",
            problem_type="fraction_division",
            recent_errors=[
                {"type": "denominator_confusion", "subject": "math"},
                {"type": "denominator_confusion", "subject": "math"},
                {"type": "denominator_confusion", "subject": "math"},
            ],
            frustration_level="high",
            learning_profile={
                "diagnoses": ["ADHD"],
                "learning_style": "visual",
                "attention_span_minutes": 12,
            },
            session_history=[],
            db=mock_db,
        )

        # Assertions
        assert isinstance(decision, InterventionDecision)
        assert decision.intervention_type == "explanation"
        assert "visual" in decision.specific_action.lower()
        assert decision.parameters["format"] == "visual"
        assert decision.parameters["duration"] == "10 min"
        assert decision.confidence >= 0.8
        assert decision.evidence_based is True
        assert "denominator" in decision.reasoning_summary.lower()
        assert decision.fallback_plan != ""

    @pytest.mark.asyncio
    async def test_intervention_reasoning_asd_learner(
        self, reasoning_engine, mock_db, mock_ai_client
    ):
        """Test intervention for ASD learner needing structure"""

        mock_decision = {
            "intervention_type": "adjust_difficulty",
            "specific_action": "Provide structured step-by-step breakdown",
            "parameters": {
                "complexity_level": "simple",
                "tone": "neutral",
                "format": "structured_list",
                "duration": "15 min",
            },
            "reasoning_summary": "ASD learner needs predictable structure",
            "expected_outcome": "Reduced anxiety, improved task completion",
            "fallback_plan": "Break into even smaller micro-steps",
            "confidence": 0.78,
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_decision)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=400),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        decision = await reason_intervention(
            brain_id="brain_789",
            learner_id="learner_asd",
            context="task_overwhelmed",
            problem_type="multi_step_problem",
            recent_errors=[{"type": "incomplete", "subject": "science"}],
            frustration_level="moderate",
            learning_profile={
                "diagnoses": ["ASD"],
                "learning_style": "visual",
                "attention_span_minutes": 20,
            },
            session_history=[],
            db=mock_db,
        )

        assert decision.intervention_type == "adjust_difficulty"
        assert "structure" in decision.specific_action.lower()
        assert decision.parameters["format"] == "structured_list"
        assert decision.confidence >= 0.7

    # ==================== Strategy Planning Tests ====================

    @pytest.mark.asyncio
    async def test_strategy_planning_multi_phase(self, reasoning_engine, mock_db, mock_ai_client):
        """Test multi-phase teaching strategy creation"""

        mock_strategy = {
            "learning_goal": "Master fraction division",
            "phases": [
                {
                    "phase_number": 1,
                    "phase_name": "Foundation Building",
                    "duration_estimate": "2-3 days",
                    "key_activities": [
                        "Review fraction basics",
                        "Introduce division concept",
                    ],
                    "success_criteria": [
                        "Can identify numerator and denominator",
                        "Understands division as splitting",
                    ],
                    "diagnosis_adaptations": {
                        "ADHD": "10-min bursts with movement breaks",
                        "Dyslexia": "Visual fraction models",
                    },
                    "checkpoints": [
                        {
                            "checkpoint_name": "End of Phase 1",
                            "pass_criteria": "80% accuracy on basics",
                            "fail_criteria": "Below 50%",
                        }
                    ],
                    "contingency_plans": {
                        "stuck": "Review prerequisites with simpler examples",
                        "overwhelmed": "Reduce session length to 5 minutes",
                        "ahead": "Add challenging word problems",
                        "disengaged": "Switch to hands-on manipulatives",
                    },
                },
                {
                    "phase_number": 2,
                    "phase_name": "Guided Practice",
                    "duration_estimate": "3-5 days",
                    "key_activities": [
                        "Practice with scaffolding",
                        "Gradual complexity increase",
                    ],
                    "success_criteria": [
                        "Can solve with hints",
                        "Explains process verbally",
                    ],
                    "diagnosis_adaptations": {
                        "ADHD": "Frequent success celebrations",
                        "Dyslexia": "Audio explanations available",
                    },
                    "checkpoints": [
                        {
                            "checkpoint_name": "Mid-Phase 2",
                            "pass_criteria": "70% accuracy with hints",
                            "fail_criteria": "Below 40%",
                        }
                    ],
                    "contingency_plans": {
                        "stuck": "Return to Phase 1 for reinforcement",
                        "overwhelmed": "One problem type at a time",
                        "ahead": "Introduce mixed operations",
                        "disengaged": "Gamify practice sessions",
                    },
                },
                {
                    "phase_number": 3,
                    "phase_name": "Independent Application",
                    "duration_estimate": "2-3 days",
                    "key_activities": [
                        "Independent problem solving",
                        "Real-world applications",
                    ],
                    "success_criteria": [
                        "Solves without hints",
                        "Applies to word problems",
                    ],
                    "diagnosis_adaptations": {
                        "ADHD": "Variety of problem formats",
                        "Dyslexia": "Reduced text, more visuals",
                    },
                    "checkpoints": [
                        {
                            "checkpoint_name": "Final Assessment",
                            "pass_criteria": "80% independent accuracy",
                            "fail_criteria": "Below 60%",
                        }
                    ],
                    "contingency_plans": {
                        "stuck": "Additional guided practice",
                        "overwhelmed": "Extended timeline",
                        "ahead": "Teach peer tutoring",
                        "disengaged": "Real-world project",
                    },
                },
            ],
            "scaffolding_sequence": [
                "Step 1: Concrete fraction models",
                "Step 2: Visual diagrams with labels",
                "Step 3: Symbolic notation introduced",
                "Step 4: Mixed visual and symbolic",
                "Step 5: Pure symbolic problems",
            ],
            "total_duration_estimate": "1-2 weeks",
            "diagnosis_considerations": {
                "ADHD": "Short sessions, frequent breaks, movement",
                "Dyslexia": "Visual over text, audio support",
            },
            "overall_contingencies": {
                "major_setback": "Restart from Phase 1 with simpler goals",
                "family_emergency": "Pause and resume with review",
                "motivational_crisis": "Switch to high-interest topics",
            },
            "confidence": 0.82,
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_strategy)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=800),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        strategy = await reasoning_engine.plan_teaching_strategy(
            brain_id="brain_123",
            learner_id="learner_456",
            learning_goal="Master fraction division",
            constraints={
                "attention_span_minutes": 12,
                "energy_level": "moderate",
                "time_available": "2 weeks",
                "diagnoses": ["ADHD", "Dyslexia"],
            },
            db=mock_db,
        )

        # Assertions
        assert isinstance(strategy, TeachingStrategy)
        assert strategy.learning_goal == "Master fraction division"
        assert len(strategy.phases) == 3

        # Phase 1 assertions
        phase1 = strategy.phases[0]
        assert isinstance(phase1, StrategyPhase)
        assert phase1.phase_name == "Foundation Building"
        assert "ADHD" in phase1.diagnosis_adaptations
        assert len(phase1.checkpoints) > 0
        assert "stuck" in phase1.contingency_plans

        # Phase 2 assertions
        phase2 = strategy.phases[1]
        assert phase2.phase_name == "Guided Practice"

        # Phase 3 assertions
        phase3 = strategy.phases[2]
        assert phase3.phase_name == "Independent Application"

        # Overall strategy assertions
        assert len(strategy.scaffolding_sequence) == 5
        assert strategy.total_duration_estimate == "1-2 weeks"
        assert strategy.confidence >= 0.8
        assert "ADHD" in strategy.diagnosis_considerations

    # ==================== Session Reflection Tests ====================

    @pytest.mark.asyncio
    async def test_session_reflection_honest_critique(
        self, reasoning_engine, mock_db, mock_ai_client
    ):
        """Test session reflection with honest self-critique"""

        mock_reflection = {
            "session_id": "session_123",
            "brain_id": "brain_456",
            "engagement_analysis": {
                "what_worked": [
                    "Visual diagrams captured attention",
                    "Short 10-min bursts maintained focus",
                ],
                "what_hindered": [
                    "Too much text in explanations",
                    "Session ran 5 minutes too long",
                ],
                "engagement_level": "moderate",
                "evidence": "Attention dropped after 15 minutes",
            },
            "hint_effectiveness": {
                "hints_provided": 8,
                "too_easy": 1,
                "too_hard": 2,
                "just_right": 5,
                "evidence": "Learner solved problems immediately after hints 5-7",
            },
            "strategy_assessment": {
                "approach_used": "Visual scaffolding with incremental practice",
                "effectiveness": "moderate",
                "learner_response": "Engaged initially, frustrated near end",
                "missed_opportunities": [
                    "Should have taken break after 3 consecutive errors",
                    "Could have simplified problem 4 earlier",
                ],
            },
            "pattern_recognition": [
                "Consistently struggles after 3+ consecutive errors",
                "Visual aids work well for initial learning",
                "Needs breaks every 10-12 minutes (ADHD)",
            ],
            "adjustments_needed": [
                {
                    "area": "pacing",
                    "specific_change": "Introduce 2-min breaks every 10 minutes",
                    "reasoning": "ADHD requires frequent mental resets",
                },
                {
                    "area": "hint_calibration",
                    "specific_change": "Reduce hint complexity by 20%",
                    "reasoning": "2 hints were too advanced",
                },
            ],
            "successes": [
                "Visual fraction model was highly effective",
                "Learner mastered denominator concept",
            ],
            "concerns": [
                "Frustration escalated quickly without intervention",
                "May need teacher involvement if pattern continues",
            ],
            "self_critique": (
                "I should have recognized frustration building after error 2 "
                "and suggested a break. My hint complexity was inconsistent. "
                "I need to better calibrate difficulty in real-time."
            ),
            "next_session_plan": {
                "focus_areas": ["Emotion regulation", "Break timing"],
                "strategies_to_try": [
                    "Pre-emptive breaks every 10 min",
                    "Movement activities between problems",
                ],
                "anticipated_challenges": [
                    "Maintaining engagement during breaks",
                    "Balancing breaks with learning time",
                ],
            },
            "confidence_in_assessment": 0.78,
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_reflection)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=600),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        reflection = await reasoning_engine.reflect_on_session(
            brain_id="brain_456",
            learner_id="learner_789",
            session_data={
                "session_id": "session_123",
                "hints_provided": 8,
                "time_on_task_minutes": 17,
                "errors": 5,
                "frustration_events": 2,
                "successes": ["Solved problem 5"],
                "strategies_used": ["Visual diagrams", "Think-alouds"],
            },
            db=mock_db,
        )

        # Assertions
        assert isinstance(reflection, SessionReflection)
        assert reflection.session_id == "session_123"
        assert reflection.brain_id == "brain_456"

        # Engagement analysis
        assert len(reflection.engagement_analysis["what_worked"]) > 0
        assert len(reflection.engagement_analysis["what_hindered"]) > 0
        assert reflection.engagement_analysis["engagement_level"] in [
            "low",
            "moderate",
            "high",
        ]

        # Hint effectiveness
        assert reflection.hint_effectiveness["hints_provided"] == 8
        assert reflection.hint_effectiveness["just_right"] == 5

        # Strategy assessment
        assert "missed_opportunities" in reflection.strategy_assessment
        assert len(reflection.strategy_assessment["missed_opportunities"]) > 0

        # Pattern recognition
        assert len(reflection.pattern_recognition) >= 2

        # Adjustments
        assert len(reflection.adjustments_needed) >= 1
        adj = reflection.adjustments_needed[0]
        assert "area" in adj
        assert "specific_change" in adj
        assert "reasoning" in adj

        # Self-critique
        assert reflection.self_critique != ""
        assert len(reflection.self_critique) > 50  # Substantive critique
        assert "should have" in reflection.self_critique.lower()

        # Next session plan
        assert len(reflection.next_session_plan["focus_areas"]) > 0
        assert len(reflection.next_session_plan["strategies_to_try"]) > 0

        assert reflection.confidence_in_assessment >= 0.7

    # ==================== Error Handling Tests ====================

    @pytest.mark.asyncio
    async def test_intervention_reasoning_with_ai_failure(
        self, reasoning_engine, mock_db, mock_ai_client
    ):
        """Test fallback behavior when AI fails"""

        async def mock_failed_completion(*args, **kwargs):
            raise Exception("API timeout")

        mock_ai_client.chat.completions.create = mock_failed_completion

        # Should return fallback decision without crashing
        decision = await reason_intervention(
            brain_id="brain_123",
            learner_id="learner_456",
            context="homework_struggling",
            problem_type="math",
            recent_errors=[],
            frustration_level="moderate",
            learning_profile={"diagnoses": [], "learning_style": "visual"},
            session_history=[],
            db=mock_db,
        )

        # Fallback decision should be returned
        assert isinstance(decision, InterventionDecision)
        assert decision.intervention_type in [
            "hint",
            "explanation",
            "break",
            "adjust_difficulty",
        ]
        assert decision.confidence < 0.5  # Low confidence for fallback

    # ==================== Data Model Tests ====================

    def test_reasoning_step_model(self):
        """Test ReasoningStep Pydantic model"""
        step = ReasoningStep(
            step_number=1,
            thought="Analyzing error patterns",
            action="investigate_errors",
            observation="3 consecutive denominator errors",
            confidence=0.8,
        )

        assert step.step_number == 1
        assert step.confidence == 0.8
        assert 0.0 <= step.confidence <= 1.0

    def test_intervention_decision_model(self):
        """Test InterventionDecision Pydantic model"""
        decision = InterventionDecision(
            intervention_type="explanation",
            specific_action="Provide visual model",
            parameters={"format": "visual"},
            reasoning_summary="Visual learner needs concrete model",
            expected_outcome="Improved understanding",
            fallback_plan="Request teacher help",
            confidence=0.85,
        )

        assert decision.intervention_type == "explanation"
        assert decision.confidence == 0.85
        assert decision.evidence_based is True

    def test_strategy_phase_model(self):
        """Test StrategyPhase Pydantic model"""
        phase = StrategyPhase(
            phase_number=1,
            phase_name="Foundation",
            duration_estimate="2 days",
            key_activities=["Review basics"],
            success_criteria=["80% accuracy"],
            diagnosis_adaptations={"ADHD": "short bursts"},
            checkpoints=[{"name": "checkpoint1"}],
            contingency_plans={"stuck": "Review prerequisites"},
        )

        assert phase.phase_number == 1
        assert len(phase.contingency_plans) > 0

    def test_session_reflection_model(self):
        """Test SessionReflection Pydantic model"""
        reflection = SessionReflection(
            session_id="session_123",
            brain_id="brain_456",
            engagement_analysis={"what_worked": ["visuals"]},
            hint_effectiveness={"hints_provided": 5},
            strategy_assessment={"effectiveness": "moderate"},
            pattern_recognition=["pattern 1"],
            adjustments_needed=[{"area": "pacing"}],
            successes=["success 1"],
            concerns=["concern 1"],
            self_critique="I should have...",
            next_session_plan={"focus_areas": ["breaks"]},
            confidence_in_assessment=0.75,
        )

        assert reflection.session_id == "session_123"
        assert reflection.confidence_in_assessment == 0.75


# ==================== End-to-End Workflow Test ====================


@pytest.mark.asyncio
async def test_full_agentic_workflow():
    """
    Test complete agentic workflow:
    1. Goal Planner creates goals
    2. ProactiveAgent monitors progress
    3. ReasoningEngine decides interventions
    4. Session Reflection provides feedback
    """
    from app.core.brain_manager import BrainManager
    from app.core.goal_planner import GoalPlanner
    from app.core.proactive_agent import ProactiveAgent

    # Mock database
    mock_db = MagicMock()
    mock_db.execute = MagicMock(return_value=MagicMock(fetchall=lambda: []))
    mock_db.commit = MagicMock()

    # Initialize components
    brain_manager = BrainManager()
    goal_planner = GoalPlanner()
    proactive_agent = ProactiveAgent()
    reasoning_engine = ReasoningEngine()

    # Step 1: Create learning goals
    with patch.object(goal_planner, "analyze_and_create_goals") as mock_goals:
        mock_goals.return_value = {
            "goals": [
                {
                    "goal_id": "goal_123",
                    "target_skill": "Fraction division",
                    "progress": 0,
                }
            ]
        }

        goals = await goal_planner.analyze_and_create_goals(
            learner_id="learner_456",
            baseline_results={},
            iep_goals=[],
            district_standards=[],
            db=mock_db,
        )

        assert len(goals["goals"]) > 0

    # Step 2: ReasoningEngine creates teaching strategy
    with patch.object(reasoning_engine, "plan_teaching_strategy") as mock_strategy:
        mock_strategy.return_value = TeachingStrategy(
            learning_goal="Fraction division",
            phases=[
                StrategyPhase(
                    phase_number=1,
                    phase_name="Foundation",
                    duration_estimate="2 days",
                    key_activities=["activity"],
                    success_criteria=["criteria"],
                    diagnosis_adaptations={},
                    checkpoints=[],
                    contingency_plans={},
                )
            ],
            scaffolding_sequence=["step1"],
            total_duration_estimate="1 week",
            diagnosis_considerations={},
            overall_contingencies={},
            confidence=0.8,
        )

        strategy = await reasoning_engine.plan_teaching_strategy(
            brain_id="brain_123",
            learner_id="learner_456",
            learning_goal="Fraction division",
            constraints={},
            db=mock_db,
        )

        assert isinstance(strategy, TeachingStrategy)
        assert len(strategy.phases) > 0

    # Step 3: ProactiveAgent monitors and intervenes
    with patch.object(proactive_agent, "_monitor_learner") as mock_monitor:
        mock_monitor.return_value = {
            "learner_id": "learner_456",
            "goals_evaluated": 1,
            "interventions_taken": 1,
            "notifications_sent": 0,
        }

        result = await proactive_agent._monitor_learner(
            learner_id="learner_456", brain_id="brain_123", db=mock_db
        )

        assert result["goals_evaluated"] > 0

    # Step 4: Session reflection
    with patch.object(reasoning_engine, "reflect_on_session") as mock_reflect:
        mock_reflect.return_value = SessionReflection(
            session_id="session_123",
            brain_id="brain_123",
            engagement_analysis={"what_worked": ["visuals"]},
            hint_effectiveness={"hints_provided": 5},
            strategy_assessment={"effectiveness": "good"},
            pattern_recognition=["pattern"],
            adjustments_needed=[],
            successes=["success"],
            concerns=[],
            self_critique="Good session",
            next_session_plan={"focus_areas": []},
            confidence_in_assessment=0.8,
        )

        reflection = await reasoning_engine.reflect_on_session(
            brain_id="brain_123",
            learner_id="learner_456",
            session_data={"session_id": "session_123"},
            db=mock_db,
        )

        assert isinstance(reflection, SessionReflection)
        assert reflection.confidence_in_assessment >= 0.7

    print("✅ Full agentic workflow test passed!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
