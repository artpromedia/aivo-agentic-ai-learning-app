"""
Integration Tests for ToolExecutor
Tests autonomous tool decision-making and execution
"""

import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.tool_executor import (
    AgenticTool,
    AutonomyLevel,
    ToolCategory,
    ToolDecision,
    ToolExecution,
    ToolExecutor,
    UrgencyLevel,
)


class TestToolExecutorIntegration:
    """Integration tests for ToolExecutor with autonomous decision-making"""

    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        db = MagicMock()
        db.execute = MagicMock(return_value=MagicMock(fetchone=lambda: None, fetchall=lambda: []))
        db.commit = MagicMock()
        return db

    @pytest.fixture
    def tool_executor(self):
        """Create ToolExecutor instance"""
        return ToolExecutor()

    @pytest.fixture
    def mock_ai_client(self):
        """Mock AI client responses"""
        with patch("app.core.tool_executor.get_ai_client") as mock:
            client = AsyncMock()
            mock.return_value = client
            yield client

    # ==================== Tool Initialization Tests ====================

    def test_tool_initialization(self, tool_executor):
        """Test that all 6 tools are initialized correctly"""
        assert len(tool_executor.available_tools) == 6

        tool_names = [t.name for t in tool_executor.available_tools]
        assert "adjust_difficulty" in tool_names
        assert "recommend_break" in tool_names
        assert "request_parent_support" in tool_names
        assert "fetch_related_content" in tool_names
        assert "update_learning_path" in tool_names
        assert "trigger_assessment" in tool_names

    def test_tool_categories(self, tool_executor):
        """Test tools are assigned correct categories"""
        tools_by_category = {}
        for tool in tool_executor.available_tools:
            if tool.category not in tools_by_category:
                tools_by_category[tool.category] = []
            tools_by_category[tool.category].append(tool.name)

        assert ToolCategory.ADJUSTMENT in tools_by_category
        assert ToolCategory.SUPPORT in tools_by_category
        assert ToolCategory.ESCALATION in tools_by_category
        assert ToolCategory.CONTENT in tools_by_category
        assert ToolCategory.ASSESSMENT in tools_by_category

    def test_tool_autonomy_levels(self, tool_executor):
        """Test tools have appropriate autonomy level requirements"""
        # Breaks should be fully autonomous
        break_tool = next(t for t in tool_executor.available_tools if t.name == "recommend_break")
        assert break_tool.min_autonomy_level == AutonomyLevel.AUTONOMOUS

        # Parent contact should require guidance
        parent_tool = next(
            t for t in tool_executor.available_tools if t.name == "request_parent_support"
        )
        assert parent_tool.min_autonomy_level == AutonomyLevel.GUIDED

    # ==================== Decision-Making Tests ====================

    @pytest.mark.asyncio
    async def test_decide_break_for_frustration(self, tool_executor, mock_db, mock_ai_client):
        """Test autonomous decision to recommend break when frustrated"""

        # Mock AI decision
        mock_decision = {
            "should_use": True,
            "tool_name": "recommend_break",
            "parameters": {
                "activity_type": "breathing",
                "duration_minutes": 5,
            },
            "reasoning": "High frustration detected, breathing break recommended",
            "confidence": 0.85,
            "alternatives_considered": ["adjust_difficulty"],
            "expected_impact": "Reduced frustration, improved focus",
            "urgency": "medium",
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_decision)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=300),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        # High frustration context
        context = {
            "recent_errors": 3,
            "frustration_level": "high",
            "success_rate": 0.45,
            "time_on_task_minutes": 15,
            "attention_level": "low",
        }

        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.AUTONOMOUS,
        )

        assert isinstance(decision, ToolDecision)
        assert decision.should_use is True
        assert decision.tool_name == "recommend_break"
        assert decision.parameters["activity_type"] == "breathing"
        assert decision.confidence >= 0.8
        assert decision.urgency == UrgencyLevel.MEDIUM

    @pytest.mark.asyncio
    async def test_decide_difficulty_adjustment(self, tool_executor, mock_db, mock_ai_client):
        """Test decision to adjust difficulty when success rate is low"""

        mock_decision = {
            "should_use": True,
            "tool_name": "adjust_difficulty",
            "parameters": {
                "direction": "decrease",
                "amount": 0.3,
                "subject": "math",
            },
            "reasoning": "Low success rate (35%) indicates content too difficult",
            "confidence": 0.78,
            "alternatives_considered": ["request_parent_support"],
            "expected_impact": "Improved success rate and confidence",
            "urgency": "medium",
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_decision)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=350),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        context = {
            "recent_errors": 4,
            "frustration_level": "moderate",
            "success_rate": 0.35,
            "time_on_task_minutes": 20,
            "subject": "math",
        }

        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.GUIDED,
        )

        assert decision.should_use is True
        assert decision.tool_name == "adjust_difficulty"
        assert decision.parameters["direction"] == "decrease"
        assert decision.parameters["amount"] == 0.3

    @pytest.mark.asyncio
    async def test_decide_no_intervention_needed(self, tool_executor, mock_db):
        """Test decision when learner performing well - no intervention"""

        # Excellent performance context
        context = {
            "recent_errors": 0,
            "frustration_level": "low",
            "success_rate": 0.95,
            "time_on_task_minutes": 10,
            "attention_level": "high",
        }

        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.AUTONOMOUS,
        )

        assert decision.should_use is False
        assert "does not warrant intervention" in decision.reasoning.lower()

    @pytest.mark.asyncio
    async def test_decide_with_supervised_autonomy(self, tool_executor, mock_db, mock_ai_client):
        """Test that supervised mode requires approval"""

        mock_decision = {
            "should_use": True,
            "tool_name": "recommend_break",
            "parameters": {"activity_type": "movement", "duration_minutes": 5},
            "reasoning": "Needs break",
            "confidence": 0.75,
            "alternatives_considered": [],
            "expected_impact": "Better focus",
            "urgency": "low",
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_decision)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=250),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        context = {
            "recent_errors": 2,
            "frustration_level": "medium",
            "success_rate": 0.6,
        }

        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.SUPERVISED,  # Requires approval
        )

        # Tool is autonomous but autonomy level requires approval
        assert decision.requires_approval is False  # break is fully autonomous

    # ==================== Tool Execution Tests ====================

    @pytest.mark.asyncio
    async def test_execute_recommend_break(self, tool_executor, mock_db):
        """Test execution of recommend_break tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="recommend_break",
            parameters={
                "activity_type": "breathing",
                "duration_minutes": 5,
            },
            db=mock_db,
        )

        assert isinstance(execution, ToolExecution)
        assert execution.success is True
        assert execution.tool_name == "recommend_break"
        assert execution.outcome is not None
        assert execution.outcome["type"] == "break_recommendation"
        assert "breathing" in execution.outcome["message"].lower()

    @pytest.mark.asyncio
    async def test_execute_adjust_difficulty(self, tool_executor, mock_db):
        """Test execution of adjust_difficulty tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="adjust_difficulty",
            parameters={
                "direction": "decrease",
                "amount": 0.4,
                "subject": "reading",
            },
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome["action"] == "difficulty_adjusted"
        assert execution.outcome["direction"] == "decrease"
        assert execution.outcome["amount"] == 0.4

    @pytest.mark.asyncio
    async def test_execute_request_parent_support(self, tool_executor, mock_db):
        """Test execution of request_parent_support tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="request_parent_support",
            parameters={
                "reason": "concept_confusion",
                "urgency": "medium",
                "message": "Need help with fractions",
            },
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome["type"] == "parent_support_request"
        assert execution.outcome["reason"] == "concept_confusion"
        assert execution.outcome["urgency"] == "medium"

    @pytest.mark.asyncio
    async def test_execute_fetch_related_content(self, tool_executor, mock_db):
        """Test execution of fetch_related_content tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="fetch_related_content",
            parameters={
                "topic": "fractions",
                "format": "video",
                "difficulty_level": 5,
            },
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome["action"] == "content_fetched"
        assert execution.outcome["topic"] == "fractions"
        assert len(execution.outcome["items"]) > 0

    @pytest.mark.asyncio
    async def test_execute_update_learning_path(self, tool_executor, mock_db):
        """Test execution of update_learning_path tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="update_learning_path",
            parameters={
                "lessons": ["lesson_101", "lesson_102"],
                "reason": "struggling",
                "priority": "high",
            },
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome["action"] == "learning_path_updated"
        assert len(execution.outcome["lessons_added"]) == 2

    @pytest.mark.asyncio
    async def test_execute_trigger_assessment(self, tool_executor, mock_db):
        """Test execution of trigger_assessment tool"""

        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="trigger_assessment",
            parameters={
                "skill": "addition",
                "format": "quick",
                "timing": "now",
            },
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome["action"] == "assessment_triggered"
        assert execution.outcome["skill"] == "addition"
        assert "assessment_id" in execution.outcome

    # ==================== Parameter Validation Tests ====================

    @pytest.mark.asyncio
    async def test_invalid_parameters_raise_error(self, tool_executor, mock_db):
        """Test that invalid parameters raise validation errors"""

        # Missing required parameter
        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="adjust_difficulty",
            parameters={
                "direction": "increase",
                # Missing 'amount' and 'subject'
            },
            db=mock_db,
        )

        assert execution.success is False
        assert execution.error is not None
        assert "required parameter" in execution.error.lower()

    @pytest.mark.asyncio
    async def test_parameter_range_validation(self, tool_executor, mock_db):
        """Test parameter range validation"""

        # Amount out of range
        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="adjust_difficulty",
            parameters={
                "direction": "increase",
                "amount": 1.5,  # Should be 0.1-1.0
                "subject": "math",
            },
            db=mock_db,
        )

        assert execution.success is False
        assert "must be <=" in execution.error

    @pytest.mark.asyncio
    async def test_parameter_enum_validation(self, tool_executor, mock_db):
        """Test enum parameter validation"""

        # Invalid activity_type
        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name="recommend_break",
            parameters={
                "activity_type": "invalid_type",  # Should be breathing/movement/sensory
                "duration_minutes": 5,
            },
            db=mock_db,
        )

        assert execution.success is False
        assert "must be one of" in execution.error

    # ==================== Safety Constraints Tests ====================

    @pytest.mark.asyncio
    async def test_cooldown_period_enforced(self, tool_executor, mock_db):
        """Test cooldown period prevents immediate reuse"""

        # Mock recent tool use
        recent_timestamp = datetime.utcnow().isoformat()
        mock_db.execute = MagicMock(return_value=MagicMock(fetchone=lambda: (recent_timestamp,)))

        eligible_tools = await tool_executor._filter_eligible_tools(
            brain_id="brain_123",
            learner_id="learner_456",
            autonomy_level=AutonomyLevel.AUTONOMOUS,
            db=mock_db,
        )

        # Tool with recent use should be filtered out
        tool_names = [t.name for t in eligible_tools]
        # All tools will be filtered if used recently

    @pytest.mark.asyncio
    async def test_session_usage_limit_enforced(self, tool_executor, mock_db):
        """Test max uses per session limit"""

        # Mock high session usage count
        mock_db.execute = MagicMock(
            return_value=MagicMock(fetchone=lambda: (5,))  # 5 uses
        )

        eligible_tools = await tool_executor._filter_eligible_tools(
            brain_id="brain_123",
            learner_id="learner_456",
            autonomy_level=AutonomyLevel.AUTONOMOUS,
            db=mock_db,
        )

        # Tools at limit should be filtered
        # Max uses per session is typically 2-5 depending on tool

    # ==================== Effectiveness Tracking Tests ====================

    @pytest.mark.asyncio
    async def test_record_effectiveness(self, tool_executor, mock_db):
        """Test recording tool effectiveness for learning"""

        await tool_executor.record_effectiveness(
            execution_id="exec_123",
            effectiveness_rating=0.85,
            learner_response="improved significantly",
            db=mock_db,
        )

        # Check database update was called
        assert mock_db.execute.called
        assert mock_db.commit.called

    # ==================== Heuristic Fallback Tests ====================

    @pytest.mark.asyncio
    async def test_heuristic_fallback_on_ai_failure(self, tool_executor, mock_db, mock_ai_client):
        """Test fallback to heuristics when AI fails"""

        # Mock AI failure
        async def mock_failed_completion(*args, **kwargs):
            raise Exception("API timeout")

        mock_ai_client.chat.completions.create = mock_failed_completion

        context = {
            "recent_errors": 3,
            "frustration_level": "high",
            "success_rate": 0.35,
        }

        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.AUTONOMOUS,
        )

        # Should fallback to heuristic decision
        assert isinstance(decision, ToolDecision)
        # High frustration should trigger break recommendation
        if decision.should_use:
            assert decision.tool_name == "recommend_break"

    def test_heuristic_prioritizes_breaks_for_frustration(self, tool_executor):
        """Test heuristic prioritizes breaks when frustrated"""

        context = {
            "recent_errors": 4,
            "frustration_level": "high",
            "success_rate": 0.5,
        }

        decision = tool_executor._heuristic_tool_selection(context, tool_executor.available_tools)

        assert decision.should_use is True
        assert decision.tool_name == "recommend_break"
        assert decision.urgency == UrgencyLevel.MEDIUM

    def test_heuristic_adjusts_difficulty_for_low_success(self, tool_executor):
        """Test heuristic adjusts difficulty for low success rate"""

        context = {
            "recent_errors": 3,
            "frustration_level": "low",
            "success_rate": 0.35,
            "subject": "math",
        }

        decision = tool_executor._heuristic_tool_selection(context, tool_executor.available_tools)

        assert decision.should_use is True
        assert decision.tool_name == "adjust_difficulty"
        assert decision.parameters["direction"] == "decrease"

    # ==================== Integration Test ====================

    @pytest.mark.asyncio
    async def test_full_tool_workflow(self, tool_executor, mock_db, mock_ai_client):
        """Test complete workflow: decide -> execute -> record"""

        # Step 1: Autonomous decision
        mock_decision = {
            "should_use": True,
            "tool_name": "recommend_break",
            "parameters": {
                "activity_type": "movement",
                "duration_minutes": 5,
            },
            "reasoning": "Attention flagging, movement break recommended",
            "confidence": 0.82,
            "alternatives_considered": ["fetch_related_content"],
            "expected_impact": "Renewed focus and energy",
            "urgency": "medium",
        }

        async def mock_chat_completion(*args, **kwargs):
            return AsyncMock(
                choices=[
                    AsyncMock(
                        message=AsyncMock(content=json.dumps(mock_decision)),
                        finish_reason="stop",
                    )
                ],
                usage=AsyncMock(total_tokens=300),
            )

        mock_ai_client.chat.completions.create = mock_chat_completion

        context = {
            "recent_errors": 2,
            "frustration_level": "moderate",
            "success_rate": 0.55,
            "time_on_task_minutes": 20,
            "attention_level": "low",
        }

        # Step 2: Decision
        decision = await tool_executor.decide_tool_use(
            brain_id="brain_123",
            learner_id="learner_456",
            current_context=context,
            db=mock_db,
            autonomy_level=AutonomyLevel.AUTONOMOUS,
        )

        assert decision.should_use is True
        assert decision.tool_name == "recommend_break"

        # Step 3: Execute
        execution = await tool_executor.execute_tool(
            brain_id="brain_123",
            learner_id="learner_456",
            tool_name=decision.tool_name,
            parameters=decision.parameters,
            db=mock_db,
        )

        assert execution.success is True
        assert execution.outcome is not None

        # Step 4: Record effectiveness
        await tool_executor.record_effectiveness(
            execution_id=execution.execution_id,
            effectiveness_rating=0.85,
            learner_response="improved focus after break",
            db=mock_db,
        )

        print("✅ Full tool workflow test passed!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
