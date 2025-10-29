"""
Reasoning Engine - Multi-step reasoning using ReAct pattern
Thought → Action → Observation → Repeat
"""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.ai_client import get_ai_client


class ReasoningEngine:
    """
    Multi-step reasoning system using ReAct (Reason + Act) pattern

    Enables Brain to:
    - Break down complex decisions into steps
    - Gather information before acting
    - Reflect on outcomes
    - Build reasoning chains for explainability
    """

    def __init__(self):
        self.ai_client = get_ai_client()

    async def reason_and_decide(
        self,
        context: Dict[str, Any],
        decision_type: str,
        max_steps: int = 5,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Execute ReAct reasoning loop for a decision

        Args:
            context: Current situation/state
            decision_type: Type of decision being made
            max_steps: Maximum reasoning steps
            db: Database session for trace logging

        Returns:
            Final decision with full reasoning chain
        """
        reasoning_chain = []
        observations = {}
        current_step = 1

        # Initial thought
        thought = await self._generate_thought(
            context, decision_type, reasoning_chain, observations
        )
        reasoning_chain.append({"step": current_step, "type": "thought", "content": thought})

        while current_step < max_steps:
            current_step += 1

            # Decide on action
            action = await self._decide_action(context, thought, reasoning_chain, observations)

            if action["type"] == "conclude":
                # Ready to make final decision
                break

            reasoning_chain.append({"step": current_step, "type": "action", "content": action})

            # Execute action and get observation
            observation = await self._execute_action(action, context)
            observations[action["name"]] = observation

            reasoning_chain.append(
                {
                    "step": current_step + 1,
                    "type": "observation",
                    "content": observation,
                }
            )

            # Generate next thought based on observation
            thought = await self._generate_thought(
                context, decision_type, reasoning_chain, observations
            )
            reasoning_chain.append(
                {
                    "step": current_step + 2,
                    "type": "thought",
                    "content": thought,
                }
            )

            current_step += 2

        # Make final decision
        final_decision = await self._make_final_decision(
            context, decision_type, reasoning_chain, observations
        )

        result = {
            "decision_id": str(uuid.uuid4()),
            "decision_type": decision_type,
            "reasoning_chain": reasoning_chain,
            "observations": observations,
            "final_decision": final_decision,
            "confidence": final_decision.get("confidence", 0.5),
            "timestamp": datetime.utcnow().isoformat(),
        }

        # Log reasoning trace for explainability
        if db:
            await self._save_reasoning_trace(db, result, context)

        return result

    async def reflect_on_session(
        self, brain_id: str, session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Reflect on completed learning session

        Analyzes:
        - What worked well
        - What didn't work
        - Patterns observed
        - Lessons learned
        - Adjustments needed
        """
        reflection_prompt = self._build_reflection_prompt(session_data)

        response = await self.ai_client.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": self._get_reflection_system_prompt(),
                },
                {"role": "user", "content": reflection_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        reflection = json.loads(response.choices[0].message.content)

        return {
            "brain_id": brain_id,
            "session_id": session_data.get("session_id"),
            "reflection": reflection,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def plan_teaching_strategy(
        self,
        learner_profile: Dict[str, Any],
        target_skill: str,
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Plan multi-step teaching strategy for a skill

        Uses reasoning to:
        - Assess learner's current understanding
        - Identify prerequisite gaps
        - Select appropriate instructional methods
        - Sequence learning activities
        - Anticipate challenges
        """
        planning_context = {
            "learner_profile": learner_profile,
            "target_skill": target_skill,
            "additional_context": context,
        }

        strategy = await self.reason_and_decide(
            context=planning_context,
            decision_type="teaching_strategy",
            max_steps=7,
        )

        return strategy

    async def diagnose_error_pattern(
        self,
        errors: List[Dict[str, Any]],
        learner_profile: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Diagnose underlying cause of error patterns

        Reasoning steps:
        1. Analyze error types
        2. Check for patterns (systematic vs random)
        3. Consider learner profile
        4. Hypothesize root cause
        5. Recommend intervention
        """
        diagnosis_context = {
            "errors": errors,
            "learner_profile": learner_profile,
        }

        diagnosis = await self.reason_and_decide(
            context=diagnosis_context,
            decision_type="error_diagnosis",
            max_steps=5,
        )

        return diagnosis

    async def _generate_thought(
        self,
        context: Dict[str, Any],
        decision_type: str,
        reasoning_chain: List[Dict[str, Any]],
        observations: Dict[str, Any],
    ) -> str:
        """Generate next thought in reasoning chain"""
        prompt = f"""You are reasoning through a decision about: {decision_type}

Current Context:
{json.dumps(context, indent=2)}

Previous Reasoning:
{json.dumps(reasoning_chain[-3:] if len(reasoning_chain) > 3 else reasoning_chain, indent=2)}

Observations Gathered:
{json.dumps(observations, indent=2)}

What is your next THOUGHT? Consider:
- What am I observing in the current situation?
- What patterns or insights emerge?
- What might be the underlying cause?
- What information might I still need?

Respond with a single clear thought (1-2 sentences)."""

        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=100,
        )

        return response.choices[0].message.content.strip()

    async def _decide_action(
        self,
        context: Dict[str, Any],
        current_thought: str,
        reasoning_chain: List[Dict[str, Any]],
        observations: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Decide what action to take next"""
        prompt = f"""Based on this thought: "{current_thought}"

Available Actions:
- check_learner_history: Review past performance patterns
- analyze_error_type: Examine specific error characteristics  
- check_prerequisites: Verify foundational knowledge
- assess_engagement: Evaluate emotional/motivational state
- conclude: Make final decision

What ACTION should be taken next?

Respond in JSON format:
{{
  "type": "action_name" or "conclude",
  "name": "action_name",
  "reasoning": "why this action"
}}"""

        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    async def _execute_action(self, action: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Execute an investigation action and return observation"""
        action_name = action.get("name", "")

        if action_name == "check_learner_history":
            # Simulate checking history
            return self._check_learner_history(context)

        elif action_name == "analyze_error_type":
            return self._analyze_error_type(context)

        elif action_name == "check_prerequisites":
            return self._check_prerequisites(context)

        elif action_name == "assess_engagement":
            return self._assess_engagement(context)

        else:
            return "Action not found or not implemented"

    def _check_learner_history(self, context: Dict[str, Any]) -> str:
        """Check learner's historical performance patterns"""
        learner_profile = context.get("learner_profile", {})
        recent_performance = learner_profile.get("recent_performance", {})

        success_rate = recent_performance.get("success_rate", 0.0)
        trend = "improving" if success_rate > 0.6 else "struggling"

        return f"Historical pattern shows: {trend} trend, {success_rate:.0%} success rate in similar tasks"

    def _analyze_error_type(self, context: Dict[str, Any]) -> str:
        """Analyze characteristics of errors"""
        errors = context.get("errors", [])

        if not errors:
            return "No recent errors to analyze"

        # Categorize errors
        systematic = len([e for e in errors if e.get("type") == "systematic"])
        careless = len([e for e in errors if e.get("type") == "careless"])

        if systematic > careless:
            return "Errors appear systematic, suggesting conceptual gap"
        else:
            return "Errors appear inconsistent, may be attention-related"

    def _check_prerequisites(self, context: Dict[str, Any]) -> str:
        """Check if prerequisite skills are mastered"""
        target_skill = context.get("target_skill", "")
        learner_profile = context.get("learner_profile", {})

        # Simplified prerequisite check
        skill_levels = learner_profile.get("skill_levels", {})

        if skill_levels:
            avg_level = sum(skill_levels.values()) / len(skill_levels)
            if avg_level < 0.5:
                return "Prerequisites appear weak, may need foundational review"
            else:
                return "Prerequisites appear adequate"
        else:
            return "Prerequisite information not available"

    def _assess_engagement(self, context: Dict[str, Any]) -> str:
        """Assess learner's engagement and emotional state"""
        session_data = context.get("session_data", {})

        hints_used = session_data.get("hints_used", 0)
        time_on_task = session_data.get("time_on_task_minutes", 0)

        if hints_used > 5:
            return "High hint usage suggests frustration or uncertainty"
        elif time_on_task < 5:
            return "Short time on task may indicate disengagement"
        else:
            return "Engagement appears normal"

    async def _make_final_decision(
        self,
        context: Dict[str, Any],
        decision_type: str,
        reasoning_chain: List[Dict[str, Any]],
        observations: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Make final decision based on reasoning chain"""
        prompt = f"""You have completed this reasoning chain for: {decision_type}

Reasoning Chain:
{json.dumps(reasoning_chain, indent=2)}

Observations:
{json.dumps(observations, indent=2)}

Make your FINAL DECISION. Include:
- The specific decision/action to take
- Confidence level (0.0-1.0)
- Key reasoning points
- Expected outcome

Respond in JSON format:
{{
  "decision": "specific action or conclusion",
  "confidence": 0.0-1.0,
  "key_reasons": ["reason 1", "reason 2", "reason 3"],
  "expected_outcome": "what we expect to happen",
  "alternative_if_fails": "backup plan"
}}"""

        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    def _build_reflection_prompt(self, session_data: Dict[str, Any]) -> str:
        """Build prompt for session reflection"""
        return f"""Reflect on this completed learning session:

Session Data:
{json.dumps(session_data, indent=2)}

Provide structured reflection:

1. **What worked well**: Teaching strategies that were effective
2. **What didn't work**: Approaches that didn't resonate
3. **Patterns observed**: Behavioral or learning patterns noticed
4. **Lessons learned**: Insights about this learner
5. **Adjustments needed**: Changes to make for next session

Respond in JSON format:
{{
  "worked_well": ["...", "..."],
  "didnt_work": ["...", "..."],
  "patterns_observed": ["...", "..."],
  "lessons_learned": ["...", "..."],
  "adjustments_needed": ["...", "..."]
}}"""

    def _get_reflection_system_prompt(self) -> str:
        """System prompt for reflection"""
        return """You are an experienced special education teacher reflecting on a learning session.

Be honest and insightful about:
- What teaching strategies were effective
- Where the learner struggled
- Patterns in behavior and learning
- Actionable adjustments for improvement

Focus on practical, specific observations rather than generic statements."""

    async def _save_reasoning_trace(
        self, db: Session, result: Dict[str, Any], context: Dict[str, Any]
    ) -> None:
        """Save reasoning trace for explainability and auditing"""
        db.execute(
            text("""
                INSERT INTO brain_reasoning_traces (
                    trace_id, brain_id, decision_context, decision_type,
                    reasoning_steps, final_decision, confidence,
                    created_at
                ) VALUES (
                    :trace_id, :brain_id, :decision_context,
                    :decision_type, :reasoning_steps, :final_decision,
                    :confidence, :created_at
                )
            """),
            {
                "trace_id": result["decision_id"],
                "brain_id": context.get("brain_id", "unknown"),
                "decision_context": json.dumps(context),
                "decision_type": result["decision_type"],
                "reasoning_steps": json.dumps(result["reasoning_chain"]),
                "final_decision": json.dumps(result["final_decision"]),
                "confidence": result["confidence"],
                "created_at": result["timestamp"],
            },
        )
        db.commit()
