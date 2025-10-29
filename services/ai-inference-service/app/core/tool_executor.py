"""
Tool Executor - Autonomous Tool Use and Action Execution
Enables Aivo AI Brain to autonomously decide when and how to use tools
"""

import json
import logging
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.ai_client import get_ai_client

# Configure logging with emoji indicators
logger = logging.getLogger(__name__)


# Enums
class AutonomyLevel(str, Enum):
    """Parent-configured autonomy levels"""

    SUPERVISED = "supervised"  # Require approval for all actions
    GUIDED = "guided"  # Allow adjustments, require approval for parent contact
    AUTONOMOUS = "autonomous"  # Full autonomy within configured bounds


class ToolCategory(str, Enum):
    """Tool categories for permission management"""

    ADJUSTMENT = "adjustment"  # Difficulty, pacing adjustments
    SUPPORT = "support"  # Breaks, regulation activities
    ESCALATION = "escalation"  # Parent/teacher notifications
    CONTENT = "content"  # Content delivery and modification
    ASSESSMENT = "assessment"  # Testing and evaluation


class UrgencyLevel(str, Enum):
    """Urgency levels for interventions"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


# Data Models
class ToolParameter(BaseModel):
    """Parameter schema for a tool"""

    name: str
    type: str  # string, number, boolean, array
    description: str
    required: bool = True
    enum: Optional[List[str]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    default: Optional[Any] = None


class AgenticTool(BaseModel):
    """Definition of a tool the Brain can use"""

    tool_id: str
    name: str
    description: str
    category: ToolCategory
    parameters: List[ToolParameter]
    required_permissions: List[str]
    effectiveness_score: float = Field(default=0.5, ge=0.0, le=1.0)
    usage_count: int = 0
    success_count: int = 0
    min_autonomy_level: AutonomyLevel = AutonomyLevel.AUTONOMOUS
    cooldown_minutes: int = 5  # Minimum time between uses
    max_uses_per_session: int = 3


class ToolDecision(BaseModel):
    """Decision about whether and how to use a tool"""

    decision_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    should_use: bool
    tool_name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    reasoning: str
    confidence: float = Field(ge=0.0, le=1.0)
    alternatives_considered: List[str] = []
    expected_impact: str = ""
    requires_approval: bool = False
    urgency: UrgencyLevel = UrgencyLevel.LOW
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ToolExecution(BaseModel):
    """Record of a tool execution"""

    execution_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    learner_id: str
    tool_name: str
    parameters: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    outcome: Optional[Dict[str, Any]] = None
    effectiveness_rating: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    learner_response: Optional[str] = None
    execution_duration_ms: Optional[int] = None
    error: Optional[str] = None
    success: bool = True


class ToolExecutor:
    """
    Autonomous tool executor for Aivo AI Brain

    Capabilities:
    - Autonomous decision-making about tool use
    - Safe tool execution with permissions
    - Learning from outcomes
    - Rate limiting and safety constraints
    """

    def __init__(self):
        self.available_tools = self._initialize_tools()
        self.decision_temperature = 0.4  # Balanced reasoning
        logger.info("🔧 ToolExecutor initialized with 6 tools")

    def _initialize_tools(self) -> List[AgenticTool]:
        """Initialize available tools with configurations"""
        return [
            # Tool 1: Adjust Difficulty
            AgenticTool(
                tool_id="tool_adjust_difficulty",
                name="adjust_difficulty",
                description="Adjust content difficulty based on performance",
                category=ToolCategory.ADJUSTMENT,
                parameters=[
                    ToolParameter(
                        name="direction",
                        type="string",
                        description="Direction to adjust",
                        enum=["increase", "decrease"],
                    ),
                    ToolParameter(
                        name="amount",
                        type="number",
                        description="Amount to adjust (0.1-1.0 scale)",
                        min_value=0.1,
                        max_value=1.0,
                    ),
                    ToolParameter(
                        name="subject",
                        type="string",
                        description="Subject area to adjust",
                    ),
                ],
                required_permissions=["adjust_content"],
                min_autonomy_level=AutonomyLevel.GUIDED,
                cooldown_minutes=10,
                max_uses_per_session=2,
            ),
            # Tool 2: Recommend Break
            AgenticTool(
                tool_id="tool_recommend_break",
                name="recommend_break",
                description="Suggest self-regulation break activity",
                category=ToolCategory.SUPPORT,
                parameters=[
                    ToolParameter(
                        name="activity_type",
                        type="string",
                        description="Type of break activity",
                        enum=["breathing", "movement", "sensory"],
                    ),
                    ToolParameter(
                        name="duration_minutes",
                        type="number",
                        description="Duration of break in minutes",
                        min_value=3,
                        max_value=10,
                    ),
                ],
                required_permissions=["suggest_activities"],
                min_autonomy_level=AutonomyLevel.AUTONOMOUS,
                cooldown_minutes=5,
                max_uses_per_session=4,
            ),
            # Tool 3: Request Parent Support
            AgenticTool(
                tool_id="tool_request_parent_support",
                name="request_parent_support",
                description="Notify parent/teacher for intervention",
                category=ToolCategory.ESCALATION,
                parameters=[
                    ToolParameter(
                        name="reason",
                        type="string",
                        description="Reason for parent support",
                        enum=[
                            "concept_confusion",
                            "emotional_support",
                            "technical_issue",
                        ],
                    ),
                    ToolParameter(
                        name="urgency",
                        type="string",
                        description="Urgency level",
                        enum=["low", "medium", "high"],
                    ),
                    ToolParameter(
                        name="message",
                        type="string",
                        description="Message for parent",
                        required=False,
                    ),
                ],
                required_permissions=["contact_parent"],
                min_autonomy_level=AutonomyLevel.GUIDED,
                cooldown_minutes=30,
                max_uses_per_session=2,
            ),
            # Tool 4: Fetch Related Content
            AgenticTool(
                tool_id="tool_fetch_related_content",
                name="fetch_related_content",
                description="Retrieve supplementary learning materials",
                category=ToolCategory.CONTENT,
                parameters=[
                    ToolParameter(
                        name="topic",
                        type="string",
                        description="Specific concept to find content for",
                    ),
                    ToolParameter(
                        name="format",
                        type="string",
                        description="Content format",
                        enum=["video", "game", "reading", "practice"],
                    ),
                    ToolParameter(
                        name="difficulty_level",
                        type="number",
                        description="Difficulty level (0-10 scale)",
                        min_value=0,
                        max_value=10,
                    ),
                ],
                required_permissions=["access_content_library"],
                min_autonomy_level=AutonomyLevel.AUTONOMOUS,
                cooldown_minutes=5,
                max_uses_per_session=5,
            ),
            # Tool 5: Update Learning Path
            AgenticTool(
                tool_id="tool_update_learning_path",
                name="update_learning_path",
                description="Modify upcoming lesson sequence",
                category=ToolCategory.ADJUSTMENT,
                parameters=[
                    ToolParameter(
                        name="lessons",
                        type="array",
                        description="List of lesson IDs to add/modify",
                    ),
                    ToolParameter(
                        name="reason",
                        type="string",
                        description="Reason for path change",
                        enum=["mastery", "struggling", "interest"],
                    ),
                    ToolParameter(
                        name="priority",
                        type="string",
                        description="Priority level",
                        enum=["low", "medium", "high"],
                    ),
                ],
                required_permissions=["modify_learning_path"],
                min_autonomy_level=AutonomyLevel.GUIDED,
                cooldown_minutes=15,
                max_uses_per_session=2,
            ),
            # Tool 6: Trigger Assessment
            AgenticTool(
                tool_id="tool_trigger_assessment",
                name="trigger_assessment",
                description="Initiate skill check assessment",
                category=ToolCategory.ASSESSMENT,
                parameters=[
                    ToolParameter(
                        name="skill",
                        type="string",
                        description="Specific skill to assess",
                    ),
                    ToolParameter(
                        name="format",
                        type="string",
                        description="Assessment format",
                        enum=["quick", "comprehensive"],
                    ),
                    ToolParameter(
                        name="timing",
                        type="string",
                        description="When to run assessment",
                        enum=["now", "scheduled"],
                        default="now",
                    ),
                ],
                required_permissions=["trigger_assessments"],
                min_autonomy_level=AutonomyLevel.GUIDED,
                cooldown_minutes=20,
                max_uses_per_session=1,
            ),
        ]

    async def decide_tool_use(
        self,
        brain_id: str,
        learner_id: str,
        current_context: Dict[str, Any],
        db: Session,
        autonomy_level: AutonomyLevel = AutonomyLevel.AUTONOMOUS,
    ) -> ToolDecision:
        """
        Autonomous decision about whether and how to use tools

        Args:
            brain_id: Brain ID
            learner_id: Learner ID
            current_context: Current session context with metrics
            db: Database session
            autonomy_level: Parent-configured autonomy level

        Returns:
            ToolDecision with reasoning and parameters
        """
        logger.info(f"🤔 Deciding tool use for learner {learner_id}...")

        try:
            # Filter tools by autonomy level and permissions
            eligible_tools = await self._filter_eligible_tools(
                brain_id=brain_id,
                learner_id=learner_id,
                autonomy_level=autonomy_level,
                db=db,
            )

            if not eligible_tools:
                logger.info("⚠️ No eligible tools available")
                return ToolDecision(
                    should_use=False,
                    reasoning="No tools available at current autonomy level",
                    confidence=1.0,
                )

            # Check if intervention is needed based on context
            needs_intervention = self._assess_intervention_need(current_context)

            if not needs_intervention:
                logger.info("✅ No intervention needed")
                return ToolDecision(
                    should_use=False,
                    reasoning="Context does not warrant intervention",
                    confidence=0.9,
                )

            # Use AI reasoning to decide which tool and parameters
            decision = await self._reason_tool_selection(
                brain_id=brain_id,
                learner_id=learner_id,
                current_context=current_context,
                eligible_tools=eligible_tools,
                db=db,
            )

            # Check if approval required based on autonomy level
            if decision.should_use:
                tool = self._get_tool_by_name(decision.tool_name)
                if tool and tool.min_autonomy_level.value > autonomy_level.value:
                    decision.requires_approval = True
                    logger.info(f"⚠️ Tool {decision.tool_name} requires approval")

            return decision

        except Exception as e:
            logger.error(f"❌ Error in tool decision: {e}")
            return ToolDecision(
                should_use=False,
                reasoning=f"Decision error: {str(e)}",
                confidence=0.0,
            )

    def _assess_intervention_need(self, context: Dict[str, Any]) -> bool:
        """
        Threshold-based assessment of whether intervention is needed

        Args:
            context: Current session context

        Returns:
            True if intervention warranted
        """
        # Extract key metrics
        recent_errors = context.get("recent_errors", 0)
        frustration_level = context.get("frustration_level", "low")
        success_rate = context.get("success_rate", 1.0)
        time_on_task = context.get("time_on_task_minutes", 0)
        attention_level = context.get("attention_level", "high")

        # Intervention thresholds
        needs_difficulty_adjustment = (
            success_rate > 0.8 or success_rate < 0.4
        ) and recent_errors >= 3

        needs_break = (
            frustration_level in ["medium", "high"]
            or recent_errors >= 3
            or attention_level == "low"
        )

        needs_support = success_rate < 0.3 and recent_errors >= 5 and time_on_task > 15

        needs_content = context.get("interest_shown", False) or (
            success_rate < 0.5 and context.get("needs_alternative", False)
        )

        return any(
            [
                needs_difficulty_adjustment,
                needs_break,
                needs_support,
                needs_content,
            ]
        )

    async def _filter_eligible_tools(
        self,
        brain_id: str,
        learner_id: str,
        autonomy_level: AutonomyLevel,
        db: Session,
    ) -> List[AgenticTool]:
        """
        Filter tools based on permissions, cooldowns, and usage limits

        Args:
            brain_id: Brain ID
            learner_id: Learner ID
            autonomy_level: Current autonomy level
            db: Database session

        Returns:
            List of eligible tools
        """
        eligible = []

        for tool in self.available_tools:
            # Check autonomy level
            if tool.min_autonomy_level.value > autonomy_level.value:
                continue

            # Check permissions (simplified - assume all granted for now)
            # In production, query brain permissions from database
            has_permissions = True  # TODO: Implement permission check

            if not has_permissions:
                continue

            # Check cooldown
            last_use = await self._get_last_tool_use(
                brain_id=brain_id,
                learner_id=learner_id,
                tool_name=tool.name,
                db=db,
            )

            if last_use:
                time_since_use = (
                    datetime.utcnow() - datetime.fromisoformat(last_use)
                ).total_seconds() / 60
                if time_since_use < tool.cooldown_minutes:
                    logger.debug(
                        f"⏰ Tool {tool.name} on cooldown "
                        f"({time_since_use:.1f} / {tool.cooldown_minutes} min)"
                    )
                    continue

            # Check session usage limit
            session_uses = await self._get_session_tool_uses(
                brain_id=brain_id,
                learner_id=learner_id,
                tool_name=tool.name,
                db=db,
            )

            if session_uses >= tool.max_uses_per_session:
                logger.debug(
                    f"📊 Tool {tool.name} at session limit "
                    f"({session_uses} / {tool.max_uses_per_session})"
                )
                continue

            eligible.append(tool)

        logger.info(f"✅ {len(eligible)} eligible tools")
        return eligible

    async def _reason_tool_selection(
        self,
        brain_id: str,
        learner_id: str,
        current_context: Dict[str, Any],
        eligible_tools: List[AgenticTool],
        db: Session,
    ) -> ToolDecision:
        """
        Use AI reasoning to select tool and parameters

        Args:
            brain_id: Brain ID
            learner_id: Learner ID
            current_context: Session context
            eligible_tools: Available tools
            db: Database session

        Returns:
            ToolDecision with selected tool and parameters
        """
        # Build prompt for AI reasoning
        tool_descriptions = "\n".join(
            [
                f"- {tool.name}: {tool.description} (effectiveness: {tool.effectiveness_score:.2f})"
                for tool in eligible_tools
            ]
        )

        system_prompt = (
            "You are an expert educational AI deciding which tool to use "
            "to support a learner. Analyze the context and recommend the "
            "most appropriate tool with optimal parameters."
        )

        user_prompt = f"""
Current Context:
- Recent errors: {current_context.get("recent_errors", 0)}
- Frustration level: {current_context.get("frustration_level", "low")}
- Success rate: {current_context.get("success_rate", 1.0):.2f}
- Time on task: {current_context.get("time_on_task_minutes", 0)} minutes
- Attention level: {current_context.get("attention_level", "high")}

Available Tools:
{tool_descriptions}

Decide:
1. Should a tool be used? (yes/no)
2. Which tool is most appropriate?
3. What parameters should be used?
4. What is the expected impact?
5. What alternatives did you consider?

Respond in JSON format:
{{
    "should_use": true/false,
    "tool_name": "tool_name or null",
    "parameters": {{"param": "value"}},
    "reasoning": "explanation of decision",
    "confidence": 0.0-1.0,
    "alternatives_considered": ["tool1", "tool2"],
    "expected_impact": "description of expected outcome",
    "urgency": "low/medium/high"
}}
"""

        try:
            ai_client = get_ai_client()

            response = await ai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self.decision_temperature,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)

            # Create ToolDecision from AI response
            decision = ToolDecision(
                should_use=result.get("should_use", False),
                tool_name=result.get("tool_name"),
                parameters=result.get("parameters", {}),
                reasoning=result.get("reasoning", ""),
                confidence=result.get("confidence", 0.5),
                alternatives_considered=result.get("alternatives_considered", []),
                expected_impact=result.get("expected_impact", ""),
                urgency=UrgencyLevel(result.get("urgency", "low")),
            )

            logger.info(
                f"🎯 Decision: {decision.tool_name if decision.should_use else 'no tool'} "
                f"(confidence: {decision.confidence:.2f})"
            )

            return decision

        except Exception as e:
            logger.error(f"❌ AI reasoning failed: {e}")
            # Fallback to heuristic decision
            return self._heuristic_tool_selection(current_context, eligible_tools)

    def _heuristic_tool_selection(
        self,
        current_context: Dict[str, Any],
        eligible_tools: List[AgenticTool],
    ) -> ToolDecision:
        """
        Fallback heuristic-based tool selection

        Args:
            current_context: Session context
            eligible_tools: Available tools

        Returns:
            ToolDecision based on heuristics
        """
        recent_errors = current_context.get("recent_errors", 0)
        frustration_level = current_context.get("frustration_level", "low")
        success_rate = current_context.get("success_rate", 1.0)

        # Priority 1: Break if frustrated
        if frustration_level in ["medium", "high"] and any(
            t.name == "recommend_break" for t in eligible_tools
        ):
            return ToolDecision(
                should_use=True,
                tool_name="recommend_break",
                parameters={
                    "activity_type": "breathing",
                    "duration_minutes": 5,
                },
                reasoning="High frustration detected, break recommended",
                confidence=0.7,
                urgency=UrgencyLevel.MEDIUM,
            )

        # Priority 2: Adjust difficulty if needed
        if (success_rate < 0.4 or success_rate > 0.8) and any(
            t.name == "adjust_difficulty" for t in eligible_tools
        ):
            direction = "decrease" if success_rate < 0.4 else "increase"
            return ToolDecision(
                should_use=True,
                tool_name="adjust_difficulty",
                parameters={
                    "direction": direction,
                    "amount": 0.3,
                    "subject": current_context.get("subject", "general"),
                },
                reasoning=f"Success rate {success_rate:.2f} warrants adjustment",
                confidence=0.6,
                urgency=UrgencyLevel.LOW,
            )

        # No intervention needed
        return ToolDecision(
            should_use=False,
            reasoning="No clear intervention needed (heuristic fallback)",
            confidence=0.5,
        )

    async def execute_tool(
        self,
        brain_id: str,
        learner_id: str,
        tool_name: str,
        parameters: Dict[str, Any],
        db: Session,
    ) -> ToolExecution:
        """
        Execute a tool with given parameters

        Args:
            brain_id: Brain ID
            learner_id: Learner ID
            tool_name: Name of tool to execute
            parameters: Tool parameters
            db: Database session

        Returns:
            ToolExecution record
        """
        execution_start = datetime.utcnow()
        logger.info(f"⚡ Executing tool: {tool_name}")

        execution = ToolExecution(
            brain_id=brain_id,
            learner_id=learner_id,
            tool_name=tool_name,
            parameters=parameters,
        )

        try:
            # Validate parameters
            tool = self._get_tool_by_name(tool_name)
            if not tool:
                raise ValueError(f"Tool {tool_name} not found")

            self._validate_parameters(tool, parameters)

            # Execute tool-specific logic
            outcome = await self._execute_tool_action(
                tool_name=tool_name,
                parameters=parameters,
                brain_id=brain_id,
                learner_id=learner_id,
                db=db,
            )

            execution.outcome = outcome
            execution.success = True

            # Update tool statistics
            tool.usage_count += 1
            tool.success_count += 1

            logger.info(f"✅ Tool {tool_name} executed successfully")

        except Exception as e:
            logger.error(f"❌ Tool execution failed: {e}")
            execution.error = str(e)
            execution.success = False

        # Calculate duration
        execution_end = datetime.utcnow()
        duration = (execution_end - execution_start).total_seconds() * 1000
        execution.execution_duration_ms = int(duration)

        # Store execution record
        await self._store_execution(execution, db)

        return execution

    async def _execute_tool_action(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        brain_id: str,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """
        Execute specific tool action

        Args:
            tool_name: Tool to execute
            parameters: Tool parameters
            brain_id: Brain ID
            learner_id: Learner ID
            db: Database session

        Returns:
            Outcome dictionary
        """
        if tool_name == "adjust_difficulty":
            return await self._adjust_difficulty(
                direction=parameters["direction"],
                amount=parameters["amount"],
                subject=parameters["subject"],
                brain_id=brain_id,
                learner_id=learner_id,
                db=db,
            )

        elif tool_name == "recommend_break":
            return await self._recommend_break(
                activity_type=parameters["activity_type"],
                duration_minutes=parameters["duration_minutes"],
                learner_id=learner_id,
                db=db,
            )

        elif tool_name == "request_parent_support":
            return await self._request_parent_support(
                reason=parameters["reason"],
                urgency=parameters["urgency"],
                message=parameters.get("message", ""),
                learner_id=learner_id,
                db=db,
            )

        elif tool_name == "fetch_related_content":
            return await self._fetch_related_content(
                topic=parameters["topic"],
                format=parameters["format"],
                difficulty_level=parameters["difficulty_level"],
                learner_id=learner_id,
                db=db,
            )

        elif tool_name == "update_learning_path":
            return await self._update_learning_path(
                lessons=parameters["lessons"],
                reason=parameters["reason"],
                priority=parameters["priority"],
                brain_id=brain_id,
                learner_id=learner_id,
                db=db,
            )

        elif tool_name == "trigger_assessment":
            return await self._trigger_assessment(
                skill=parameters["skill"],
                format=parameters["format"],
                timing=parameters.get("timing", "now"),
                learner_id=learner_id,
                db=db,
            )

        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    # Tool-specific implementations

    async def _adjust_difficulty(
        self,
        direction: str,
        amount: float,
        subject: str,
        brain_id: str,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Adjust content difficulty"""
        # Update brain configuration
        adjustment = {
            "direction": direction,
            "amount": amount,
            "subject": subject,
            "timestamp": datetime.utcnow().isoformat(),
        }

        db.execute(
            text("""
                UPDATE ai_brains
                SET configuration = json_set(
                    configuration,
                    '$.difficulty_adjustment',
                    :adjustment
                )
                WHERE brain_id = :brain_id
            """),
            {"brain_id": brain_id, "adjustment": json.dumps(adjustment)},
        )
        db.commit()

        return {
            "action": "difficulty_adjusted",
            "direction": direction,
            "amount": amount,
            "subject": subject,
        }

    async def _recommend_break(
        self,
        activity_type: str,
        duration_minutes: int,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Recommend self-regulation break"""
        recommendation = {
            "type": "break_recommendation",
            "activity_type": activity_type,
            "duration_minutes": duration_minutes,
            "message": self._get_break_message(activity_type),
        }

        # In production, send to learner UI
        logger.info(f"💆 Break recommended: {activity_type} for {duration_minutes} min")

        return recommendation

    def _get_break_message(self, activity_type: str) -> str:
        """Get appropriate break message"""
        messages = {
            "breathing": "Let's take a breathing break! Follow the guide.",
            "movement": "Time to move! Let's do some stretches.",
            "sensory": "Let's try a calming sensory activity.",
        }
        return messages.get(activity_type, "Let's take a quick break!")

    async def _request_parent_support(
        self,
        reason: str,
        urgency: str,
        message: str,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Request parent/teacher support"""
        notification = {
            "type": "parent_support_request",
            "learner_id": learner_id,
            "reason": reason,
            "urgency": urgency,
            "message": message or self._get_default_support_message(reason),
            "timestamp": datetime.utcnow().isoformat(),
        }

        # In production, send via notification service
        logger.info(f"📧 Parent support requested: {reason} ({urgency})")

        return notification

    def _get_default_support_message(self, reason: str) -> str:
        """Get default support message"""
        messages = {
            "concept_confusion": ("Your child needs help understanding a concept."),
            "emotional_support": ("Your child could use some encouragement."),
            "technical_issue": "There's a technical issue to address.",
        }
        return messages.get(reason, "Your child needs assistance.")

    async def _fetch_related_content(
        self,
        topic: str,
        format: str,
        difficulty_level: float,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Fetch supplementary learning materials"""
        # In production, query content library API
        content = {
            "action": "content_fetched",
            "topic": topic,
            "format": format,
            "difficulty_level": difficulty_level,
            "items": [
                {
                    "id": f"content_{uuid.uuid4().hex[:8]}",
                    "title": f"{format.title()} about {topic}",
                    "url": f"/content/{format}/{topic}",
                }
            ],
        }

        logger.info(f"📚 Content fetched: {format} about {topic}")
        return content

    async def _update_learning_path(
        self,
        lessons: List[str],
        reason: str,
        priority: str,
        brain_id: str,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Modify upcoming lesson sequence"""
        path_update = {
            "action": "learning_path_updated",
            "lessons_added": lessons,
            "reason": reason,
            "priority": priority,
            "timestamp": datetime.utcnow().isoformat(),
        }

        # In production, update learning path in database
        logger.info(f"🛤️ Learning path updated: {len(lessons)} lessons ({reason})")

        return path_update

    async def _trigger_assessment(
        self,
        skill: str,
        format: str,
        timing: str,
        learner_id: str,
        db: Session,
    ) -> Dict[str, Any]:
        """Initiate skill check assessment"""
        assessment = {
            "action": "assessment_triggered",
            "skill": skill,
            "format": format,
            "timing": timing,
            "assessment_id": f"assessment_{uuid.uuid4().hex[:8]}",
            "scheduled_at": datetime.utcnow().isoformat() if timing == "now" else None,
        }

        logger.info(f"📝 Assessment triggered: {skill} ({format})")
        return assessment

    def _validate_parameters(self, tool: AgenticTool, parameters: Dict[str, Any]) -> None:
        """
        Validate tool parameters against schema

        Args:
            tool: Tool definition
            parameters: Parameters to validate

        Raises:
            ValueError: If validation fails
        """
        for param in tool.parameters:
            if param.required and param.name not in parameters:
                raise ValueError(f"Missing required parameter: {param.name}")

            if param.name in parameters:
                value = parameters[param.name]

                # Type validation
                if param.type == "number":
                    if not isinstance(value, (int, float)):
                        raise ValueError(f"{param.name} must be a number")
                    if param.min_value and value < param.min_value:
                        raise ValueError(f"{param.name} must be >= {param.min_value}")
                    if param.max_value and value > param.max_value:
                        raise ValueError(f"{param.name} must be <= {param.max_value}")

                elif param.type == "string":
                    if not isinstance(value, str):
                        raise ValueError(f"{param.name} must be a string")
                    if param.enum and value not in param.enum:
                        raise ValueError(f"{param.name} must be one of {param.enum}")

    async def record_effectiveness(
        self,
        execution_id: str,
        effectiveness_rating: float,
        learner_response: str,
        db: Session,
    ) -> None:
        """
        Record effectiveness of tool execution for learning

        Args:
            execution_id: Execution ID
            effectiveness_rating: 0.0-1.0 rating
            learner_response: Description of learner response
            db: Database session
        """
        logger.info(f"📊 Recording effectiveness: {effectiveness_rating:.2f}")

        # Update execution record
        db.execute(
            text("""
                UPDATE brain_tool_executions
                SET effectiveness_rating = :rating,
                    learner_response = :response
                WHERE execution_id = :execution_id
            """),
            {
                "execution_id": execution_id,
                "rating": effectiveness_rating,
                "response": learner_response,
            },
        )
        db.commit()

        # Update tool effectiveness score (moving average)
        # TODO: Implement sophisticated learning algorithm

    def _get_tool_by_name(self, tool_name: Optional[str]) -> Optional[AgenticTool]:
        """Get tool definition by name"""
        if not tool_name:
            return None
        for tool in self.available_tools:
            if tool.name == tool_name:
                return tool
        return None

    async def _get_last_tool_use(
        self, brain_id: str, learner_id: str, tool_name: str, db: Session
    ) -> Optional[str]:
        """Get timestamp of last tool use"""
        result = db.execute(
            text("""
                SELECT timestamp
                FROM brain_tool_executions
                WHERE brain_id = :brain_id
                AND learner_id = :learner_id
                AND tool_name = :tool_name
                ORDER BY timestamp DESC
                LIMIT 1
            """),
            {
                "brain_id": brain_id,
                "learner_id": learner_id,
                "tool_name": tool_name,
            },
        ).fetchone()

        return result[0] if result else None

    async def _get_session_tool_uses(
        self, brain_id: str, learner_id: str, tool_name: str, db: Session
    ) -> int:
        """Get number of times tool used in current session"""
        # Session = last 60 minutes
        session_start = datetime.utcnow() - timedelta(minutes=60)

        result = db.execute(
            text("""
                SELECT COUNT(*)
                FROM brain_tool_executions
                WHERE brain_id = :brain_id
                AND learner_id = :learner_id
                AND tool_name = :tool_name
                AND timestamp >= :session_start
            """),
            {
                "brain_id": brain_id,
                "learner_id": learner_id,
                "tool_name": tool_name,
                "session_start": session_start.isoformat(),
            },
        ).fetchone()

        return result[0] if result else 0

    async def _store_execution(self, execution: ToolExecution, db: Session) -> None:
        """Store tool execution record"""
        db.execute(
            text("""
                INSERT INTO brain_tool_executions (
                    execution_id, brain_id, learner_id, tool_name,
                    parameters, timestamp, outcome, effectiveness_rating,
                    learner_response, execution_duration_ms, error, success
                ) VALUES (
                    :execution_id, :brain_id, :learner_id, :tool_name,
                    :parameters, :timestamp, :outcome, :effectiveness_rating,
                    :learner_response, :execution_duration_ms, :error, :success
                )
            """),
            {
                "execution_id": execution.execution_id,
                "brain_id": execution.brain_id,
                "learner_id": execution.learner_id,
                "tool_name": execution.tool_name,
                "parameters": json.dumps(execution.parameters),
                "timestamp": execution.timestamp,
                "outcome": json.dumps(execution.outcome) if execution.outcome else None,
                "effectiveness_rating": execution.effectiveness_rating,
                "learner_response": execution.learner_response,
                "execution_duration_ms": execution.execution_duration_ms,
                "error": execution.error,
                "success": execution.success,
            },
        )
        db.commit()
