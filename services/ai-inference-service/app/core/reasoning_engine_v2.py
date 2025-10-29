"""
Reasoning Engine - Production ReAct Pattern Implementation
Multi-step autonomous reasoning for complex educational decisions
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.ai_client import get_ai_client

# Configure logging with emoji indicators
logger = logging.getLogger(__name__)


# Data Models
class ReasoningStep(BaseModel):
    """Individual step in ReAct reasoning chain"""

    step_number: int
    thought: Optional[str] = None
    action: Optional[str] = None
    observation: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ReasoningTrace(BaseModel):
    """Complete reasoning trace for explainability"""

    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brain_id: str
    learner_id: Optional[str] = None
    decision_context: str  # "intervention", "strategy_planning", "session_reflection"
    situation_summary: str
    steps: List[ReasoningStep]
    final_decision: Dict[str, Any]
    total_confidence: float = Field(ge=0.0, le=1.0)
    started_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: Optional[str] = None
    tokens_used: int = 0
    reasoning_complete: bool = False


class InterventionDecision(BaseModel):
    """Structured intervention decision"""

    intervention_type: str  # hint/explanation/break/adjust_difficulty/request_help
    specific_action: str
    parameters: Dict[str, Any]  # complexity_level, tone, format, duration, etc.
    reasoning_summary: str
    expected_outcome: str
    fallback_plan: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_based: bool = True


class StrategyPhase(BaseModel):
    """Phase in multi-step strategy"""

    phase_number: int
    phase_name: str  # Foundation/Practice/Independent Application
    duration_estimate: str
    key_activities: List[str]
    success_criteria: List[str]
    diagnosis_adaptations: Dict[str, Any]
    checkpoints: List[Dict[str, Any]]
    contingency_plans: Dict[str, str]  # stuck/overwhelmed/ahead/disengaged


class TeachingStrategy(BaseModel):
    """Comprehensive teaching strategy"""

    strategy_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learning_goal: str
    phases: List[StrategyPhase]
    scaffolding_sequence: List[str]
    total_duration_estimate: str
    diagnosis_considerations: Dict[str, Any]
    overall_contingencies: Dict[str, Any]
    confidence: float = Field(ge=0.0, le=1.0)


class SessionReflection(BaseModel):
    """Brain's self-assessment of session"""

    session_id: str
    brain_id: str
    engagement_analysis: Dict[str, Any]
    hint_effectiveness: Dict[str, Any]
    strategy_assessment: Dict[str, Any]
    pattern_recognition: List[str]
    adjustments_needed: List[Dict[str, Any]]
    successes: List[str]
    concerns: List[str]
    self_critique: str
    next_session_plan: Dict[str, Any]
    confidence_in_assessment: float = Field(ge=0.0, le=1.0)


class ReasoningEngine:
    """
    Production-ready ReAct (Reasoning + Acting) engine for autonomous decisions

    Implements systematic multi-step reasoning for:
    - Intervention decisions (homework help, hints, breaks)
    - Strategy planning (teaching sequences, scaffolding)
    - Session reflection (metacognitive self-assessment)

    Features:
    - Pydantic data models for type safety
    - Structured JSON output from AI
    - Temperature-controlled reasoning (0.3 for analytical)
    - Complete reasoning traces for explainability
    - Token usage tracking
    - Comprehensive error handling
    - Diagnosis-specific adaptations (ADHD, ASD, Dyslexia, Anxiety)
    """

    def __init__(self):
        self.ai_client = get_ai_client()
        self.max_reasoning_steps = 5
        self.reasoning_temperature = 0.3  # Analytical consistency
        self.reflection_temperature = 0.4  # Slightly more creative
        self.strategy_temperature = 0.5  # Balanced

        logger.info("🧠 ReasoningEngine initialized with ReAct pattern")

    # INTERVENTION REASONING
    async def reason_intervention(
        self,
        brain_id: str,
        learner_id: str,
        situation: Dict[str, Any],
        db: Optional[Session] = None,
    ) -> InterventionDecision:
        """
        Use ReAct pattern to decide best intervention

        Args:
            brain_id: Brain instance ID
            learner_id: Learner ID
            situation: Dict with context, problem_type, recent_errors, etc.
            db: Database session for trace storage

        Returns:
            InterventionDecision with full reasoning
        """
        logger.info(
            f"🔍 Starting intervention reasoning for {learner_id}: "
            f"{situation.get('context', 'unknown')}"
        )

        # Initialize reasoning trace
        trace = ReasoningTrace(
            brain_id=brain_id,
            learner_id=learner_id,
            decision_context="intervention",
            situation_summary=self._summarize_situation(situation),
            steps=[],
            final_decision={},
            total_confidence=0.0,
        )

        try:
            # ReAct Loop
            for step_num in range(1, self.max_reasoning_steps + 1):
                # Step 1: THOUGHT
                thought = await self._generate_intervention_thought(situation, trace.steps)
                logger.info(f"💭 Step {step_num} Thought: {thought[:100]}...")

                step = ReasoningStep(
                    step_number=step_num,
                    thought=thought,
                    confidence=0.7,
                )

                # Step 2: ACTION (what to investigate)
                action = await self._decide_investigation_action(thought, situation, trace.steps)
                step.action = action["action"]
                step.confidence = action["confidence"]
                logger.info(f"🎯 Step {step_num} Action: {action['action']}")

                # Check if reasoning complete
                if action.get("reasoning_complete", False):
                    trace.steps.append(step)
                    trace.reasoning_complete = True
                    break

                # Step 3: OBSERVATION (what was learned)
                observation = await self._observe(action, situation)
                step.observation = observation
                logger.info(f"👁️ Step {step_num} Observation: {observation[:100]}...")

                trace.steps.append(step)

                # Early termination if confident
                if step.confidence > 0.9 and step_num >= 3:
                    trace.reasoning_complete = True
                    break

            # Make final intervention decision
            decision_data = await self._make_intervention_decision(situation, trace)

            intervention = InterventionDecision(**decision_data)
            trace.final_decision = intervention.model_dump()
            trace.total_confidence = intervention.confidence
            trace.completed_at = datetime.utcnow().isoformat()

            # Store trace for explainability
            if db:
                await self._save_reasoning_trace(db, trace)

            logger.info(
                f"✅ Intervention decided: {intervention.intervention_type} "
                f"(confidence: {intervention.confidence:.2f})"
            )

            return intervention

        except Exception as e:
            logger.error(f"❌ Error in intervention reasoning: {e}")
            # Fallback decision
            return InterventionDecision(
                intervention_type="hint",
                specific_action="Provide gentle hint about the concept",
                parameters={"complexity_level": "simple", "tone": "encouraging"},
                reasoning_summary="Fallback due to reasoning error",
                expected_outcome="Learner gets unstuck",
                fallback_plan="Request teacher help if still stuck",
                confidence=0.5,
                evidence_based=False,
            )

    async def _generate_intervention_thought(
        self, situation: Dict[str, Any], previous_steps: List[ReasoningStep]
    ) -> str:
        """Generate analytical thought about intervention situation"""
        prompt = self._build_intervention_thought_prompt(situation, previous_steps)

        response = await self.ai_client.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": self._get_intervention_system_prompt(),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=self.reasoning_temperature,
            max_tokens=150,
        )

        return response.choices[0].message.content.strip()

    def _build_intervention_thought_prompt(
        self, situation: Dict[str, Any], previous_steps: List[ReasoningStep]
    ) -> str:
        """Build prompt for intervention thought generation"""
        context = situation.get("context", "unknown")
        problem_type = situation.get("problem_type", "unknown")
        recent_errors = situation.get("recent_errors", [])
        frustration_level = situation.get("frustration_level", "unknown")
        learning_profile = situation.get("learning_profile", {})

        # Extract diagnosis info
        diagnoses = learning_profile.get("diagnoses", [])
        learning_style = learning_profile.get("learning_style", "unknown")
        attention_span = learning_profile.get("attention_span_minutes", 20)

        # Previous reasoning context
        previous_context = ""
        if previous_steps:
            last_steps = previous_steps[-2:]
            previous_context = "\n".join(
                [f"Previous: {s.thought if s.thought else s.observation}" for s in last_steps]
            )

        return f"""Analyze this learning situation and form a THOUGHT:

SITUATION:
- Context: {context}
- Problem Type: {problem_type}
- Frustration Level: {frustration_level}
- Recent Errors: {len(recent_errors)} errors

LEARNER PROFILE:
- Diagnoses: {", ".join(diagnoses) if diagnoses else "None"}
- Learning Style: {learning_style}
- Attention Span: {attention_span} minutes

PREVIOUS REASONING:
{previous_context if previous_context else "This is the first thought"}

What is your analytical THOUGHT about what's happening and what might help?
Consider: Special ed needs, learning style, historical patterns, emotional state, evidence-based strategies.

Respond with one clear analytical thought (2-3 sentences)."""

    async def _decide_investigation_action(
        self,
        thought: str,
        situation: Dict[str, Any],
        previous_steps: List[ReasoningStep],
    ) -> Dict[str, Any]:
        """Decide what to investigate next"""
        prompt = f"""Based on this thought: "{thought}"

What should you INVESTIGATE next?

Available actions:
- analyze_error_patterns: Examine specific error characteristics
- check_prerequisite_knowledge: Verify foundational skills
- assess_emotional_state: Evaluate frustration/engagement
- review_what_worked_before: Check successful past interventions
- consider_diagnosis_adaptations: Review special ed accommodations
- conclude: Make final intervention decision

Respond in JSON:
{{
  "action": "action_name",
  "reasoning": "why investigate this",
  "confidence": 0.0-1.0,
  "reasoning_complete": false (or true if ready to conclude)
}}"""

        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=self.reasoning_temperature,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    async def _observe(self, action: Dict[str, Any], situation: Dict[str, Any]) -> str:
        """Execute investigation and return observation"""
        action_name = action["action"]

        if action_name == "analyze_error_patterns":
            return self._analyze_error_patterns(situation)

        elif action_name == "check_prerequisite_knowledge":
            return self._check_prerequisites(situation)

        elif action_name == "assess_emotional_state":
            return self._assess_emotional_state(situation)

        elif action_name == "review_what_worked_before":
            return self._review_past_successes(situation)

        elif action_name == "consider_diagnosis_adaptations":
            return self._get_diagnosis_adaptations(situation)

        else:
            return "No observation available for this action"

    def _analyze_error_patterns(self, situation: Dict[str, Any]) -> str:
        """Analyze patterns in recent errors"""
        recent_errors = situation.get("recent_errors", [])

        if not recent_errors:
            return "No recent errors to analyze"

        # Count error types
        error_types = {}
        for error in recent_errors:
            error_type = error.get("type", "unknown")
            error_types[error_type] = error_types.get(error_type, 0) + 1

        # Find most common
        most_common = max(error_types.items(), key=lambda x: x[1]) if error_types else ("none", 0)

        # Check for consecutive errors
        consecutive = sum(
            1
            for i in range(len(recent_errors) - 1)
            if recent_errors[i].get("subject") == recent_errors[i + 1].get("subject")
        )

        observation = (
            f"Most common error type: {most_common[0]} ({most_common[1]} occurrences). "
            f"Consecutive errors: {consecutive}. "
        )

        if consecutive >= 3:
            observation += "Pattern suggests systematic conceptual gap."
        else:
            observation += "Pattern suggests attention or engagement issue."

        return observation

    def _check_prerequisites(self, situation: Dict[str, Any]) -> str:
        """Check prerequisite knowledge status"""
        problem_type = situation.get("problem_type", "")
        session_history = situation.get("session_history", [])

        # Check past performance on related skills
        if session_history:
            related_sessions = [
                s for s in session_history if problem_type.lower() in s.get("topic", "").lower()
            ]
            if related_sessions:
                success_rate = sum(1 for s in related_sessions if s.get("success", False)) / len(
                    related_sessions
                )
                if success_rate < 0.5:
                    return (
                        f"Prerequisites appear weak: {success_rate:.0%} success on related topics"
                    )
                else:
                    return f"Prerequisites appear adequate: {success_rate:.0%} success on related topics"

        return "Prerequisite status unclear from available data"

    def _assess_emotional_state(self, situation: Dict[str, Any]) -> str:
        """Assess learner's emotional/engagement state"""
        frustration_level = situation.get("frustration_level", "unknown")
        consecutive_errors = len(situation.get("recent_errors", []))
        hints_used = situation.get("hints_used_this_session", 0)

        observations = []

        if frustration_level in ["high", "very_high"]:
            observations.append("High frustration detected")

        if consecutive_errors >= 3:
            observations.append("Multiple consecutive errors may increase anxiety")

        if hints_used > 5:
            observations.append("High hint usage suggests uncertainty or confusion")

        if not observations:
            observations.append("Emotional state appears stable")

        # Consider diagnosis
        diagnoses = situation.get("learning_profile", {}).get("diagnoses", [])
        if "Anxiety" in diagnoses and frustration_level != "low":
            observations.append("Anxiety diagnosis warrants careful emotional support")

        return ". ".join(observations)

    def _review_past_successes(self, situation: Dict[str, Any]) -> str:
        """Review what interventions worked historically"""
        session_history = situation.get("session_history", [])

        if not session_history:
            return "No historical data available"

        # Find successful interventions
        successful = [s for s in session_history[-10:] if s.get("intervention_effective", False)]

        if successful:
            intervention_types = [s.get("intervention_type") for s in successful]
            most_effective = max(set(intervention_types), key=intervention_types.count)
            return f"Historical data shows '{most_effective}' interventions were most effective"
        else:
            return "No clearly successful interventions in recent history"

    def _get_diagnosis_adaptations(self, situation: Dict[str, Any]) -> str:
        """Get diagnosis-specific accommodation recommendations"""
        diagnoses = situation.get("learning_profile", {}).get("diagnoses", [])

        if not diagnoses:
            return "No diagnosis-specific adaptations needed"

        adaptations = []

        if "ADHD" in diagnoses:
            adaptations.append(
                "ADHD: Short, focused interventions. Clear redirection. Minimize distractions."
            )

        if "ASD" in diagnoses or "Autism" in diagnoses:
            adaptations.append(
                "ASD: Structured, predictable approach. Explicit instructions. Visual supports."
            )

        if "Dyslexia" in diagnoses:
            adaptations.append(
                "Dyslexia: Multi-sensory approaches. Visual aids. Audio support. Extra processing time."
            )

        if "Anxiety" in diagnoses:
            adaptations.append(
                "Anxiety: Low-pressure environment. Confidence-building. Positive reinforcement."
            )

        return " | ".join(adaptations)

    async def _make_intervention_decision(
        self, situation: Dict[str, Any], trace: ReasoningTrace
    ) -> Dict[str, Any]:
        """Make final intervention decision based on reasoning"""
        prompt = self._build_intervention_decision_prompt(situation, trace)

        response = await self.ai_client.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": self._get_intervention_system_prompt(),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=self.reasoning_temperature,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    def _build_intervention_decision_prompt(
        self, situation: Dict[str, Any], trace: ReasoningTrace
    ) -> str:
        """Build prompt for final intervention decision"""
        # Summarize reasoning
        reasoning_summary = "\n".join(
            [
                f"Step {s.step_number}: {s.thought if s.thought else s.observation}"
                for s in trace.steps
            ]
        )

        return f"""Based on this reasoning chain, make your FINAL INTERVENTION DECISION:

REASONING COMPLETED:
{reasoning_summary}

SITUATION CONTEXT:
{json.dumps(situation, indent=2)[:500]}...

Choose the BEST intervention and provide complete details in JSON:
{{
  "intervention_type": "hint|explanation|break|adjust_difficulty|request_help|encouragement",
  "specific_action": "Detailed description of what to do",
  "parameters": {{
    "complexity_level": "simple|moderate|complex",
    "tone": "encouraging|matter-of-fact|playful",
    "format": "text|visual|audio|interactive",
    "duration": "2 min|5 min|10 min",
    "additional": {{}}
  }},
  "reasoning_summary": "Why this is the best intervention given the situation",
  "expected_outcome": "What we expect to happen",
  "fallback_plan": "What to try if this doesn't work",
  "confidence": 0.0-1.0,
  "evidence_based": true|false
}}

Requirements:
- Consider diagnosis-specific needs (ADHD, ASD, Dyslexia, Anxiety)
- Match learner's learning style
- Account for emotional state
- Use evidence-based strategies
- Be specific and actionable"""

    def _get_intervention_system_prompt(self) -> str:
        """System prompt for intervention reasoning"""
        return """You are an expert educational AI using ReAct pattern for intervention decisions.

Your expertise includes:
- Special education accommodations (ADHD, ASD, Dyslexia, Anxiety)
- Evidence-based instructional strategies
- Differentiated instruction and UDL principles
- Social-emotional learning and regulation
- Learning styles and preferences

Be systematic and thorough in your reasoning:
1. Consider all available evidence
2. Weigh diagnosis-specific needs
3. Match learning style preferences
4. Account for emotional/engagement state
5. Select evidence-based interventions
6. Plan for contingencies

Be honest about confidence levels. If uncertain, acknowledge it."""

    # MULTI-STEP STRATEGY PLANNING
    async def plan_teaching_strategy(
        self,
        brain_id: str,
        learner_id: str,
        learning_goal: str,
        constraints: Dict[str, Any],
        db: Optional[Session] = None,
    ) -> TeachingStrategy:
        """
        Plan comprehensive multi-phase teaching strategy

        Args:
            brain_id: Brain instance ID
            learner_id: Learner ID
            learning_goal: Target skill/concept
            constraints: attention_span, energy, resources, time_available
            db: Database session

        Returns:
            TeachingStrategy with phases, scaffolding, contingencies
        """
        logger.info(f"📚 Planning teaching strategy for: {learning_goal}")

        prompt = self._build_strategy_planning_prompt(learning_goal, constraints, learner_id)

        try:
            response = await self.ai_client.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": self._get_strategy_planning_system_prompt(),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self.strategy_temperature,
                response_format={"type": "json_object"},
            )

            strategy_data = json.loads(response.choices[0].message.content)

            # Convert to TeachingStrategy object
            phases = [StrategyPhase(**phase) for phase in strategy_data["phases"]]

            strategy = TeachingStrategy(
                learning_goal=learning_goal,
                phases=phases,
                scaffolding_sequence=strategy_data["scaffolding_sequence"],
                total_duration_estimate=strategy_data["total_duration_estimate"],
                diagnosis_considerations=strategy_data.get("diagnosis_considerations", {}),
                overall_contingencies=strategy_data.get("overall_contingencies", {}),
                confidence=strategy_data.get("confidence", 0.75),
            )

            logger.info(f"✅ Strategy created with {len(phases)} phases")

            return strategy

        except Exception as e:
            logger.error(f"❌ Error planning strategy: {e}")
            raise

    def _build_strategy_planning_prompt(
        self, learning_goal: str, constraints: Dict[str, Any], learner_id: str
    ) -> str:
        """Build prompt for strategy planning"""
        attention_span = constraints.get("attention_span_minutes", 20)
        energy_level = constraints.get("energy_level", "moderate")
        time_available = constraints.get("time_available", "1-2 weeks")
        diagnoses = constraints.get("diagnoses", [])

        return f"""Create a comprehensive teaching strategy for this learning goal:

LEARNING GOAL: {learning_goal}

CONSTRAINTS:
- Attention Span: {attention_span} minutes
- Energy Level: {energy_level}
- Time Available: {time_available}
- Diagnoses: {", ".join(diagnoses) if diagnoses else "None"}

Create a multi-phase strategy in JSON format:
{{
  "phases": [
    {{
      "phase_number": 1,
      "phase_name": "Foundation Building",
      "duration_estimate": "2-3 days",
      "key_activities": ["activity 1", "activity 2", "activity 3"],
      "success_criteria": ["can do X", "understands Y"],
      "diagnosis_adaptations": {{
        "ADHD": "short 10-min bursts with movement breaks",
        "ASD": "visual schedules, clear structure",
        "Dyslexia": "multi-sensory approaches",
        "Anxiety": "low-pressure, confidence-building"
      }},
      "checkpoints": [
        {{
          "checkpoint_name": "End of Phase 1",
          "pass_criteria": "80% accuracy on practice",
          "fail_criteria": "Below 50% accuracy"
        }}
      ],
      "contingency_plans": {{
        "stuck": "Review prerequisites with concrete examples",
        "overwhelmed": "Simplify and break into smaller steps",
        "ahead": "Add complexity and enrichment challenges",
        "disengaged": "Switch modality or add game element"
      }}
    }},
    {{
      "phase_number": 2,
      "phase_name": "Guided Practice",
      "duration_estimate": "3-4 days",
      ...
    }},
    {{
      "phase_number": 3,
      "phase_name": "Independent Application",
      "duration_estimate": "2-3 days",
      ...
    }}
  ],
  "scaffolding_sequence": [
    "Step 1: Introduce with concrete examples",
    "Step 2: Model process explicitly",
    "Step 3: Guided practice with support",
    "Step 4: Reduce support gradually",
    "Step 5: Independent application"
  ],
  "total_duration_estimate": "1-2 weeks",
  "diagnosis_considerations": {{}},
  "overall_contingencies": {{
    "if_progress_too_slow": "action plan",
    "if_progress_too_fast": "action plan",
    "if_disengagement": "action plan"
  }},
  "confidence": 0.0-1.0
}}

Requirements:
- 3 phases: Foundation → Practice → Independent
- Diagnosis-specific adaptations for each phase
- Clear checkpoints with pass/fail criteria
- Contingency plans for stuck/overwhelmed/ahead/disengaged
- Gradual scaffolding sequence
- Realistic duration estimates"""

    def _get_strategy_planning_system_prompt(self) -> str:
        """System prompt for strategy planning"""
        return """You are a master special education strategist with expertise in:

- Differentiated instruction and UDL (Universal Design for Learning)
- Evidence-based instructional strategies
- Scaffolding and gradual release of responsibility
- Diagnosis-specific accommodations (ADHD, ASD, Dyslexia, Anxiety)
- Formative assessment and progress monitoring
- Multi-sensory teaching approaches
- Social-emotional learning integration

Create comprehensive, practical teaching strategies that:
- Build systematically from foundation to independence
- Include diagnosis-specific adaptations
- Provide clear success criteria and checkpoints
- Plan for contingencies (not all learners progress linearly)
- Are realistic about time and attention span
- Are evidence-based and proven effective

Be specific, practical, and action-oriented."""

    # SESSION REFLECTION
    async def reflect_on_session(
        self,
        brain_id: str,
        learner_id: str,
        session_data: Dict[str, Any],
        db: Optional[Session] = None,
    ) -> SessionReflection:
        """
        Autonomous self-assessment of Brain's performance in session

        Args:
            brain_id: Brain instance ID
            learner_id: Learner ID
            session_data: Complete session data
            db: Database session

        Returns:
            SessionReflection with honest self-critique
        """
        logger.info(f"🔍 Reflecting on session: {session_data.get('session_id')}")

        prompt = self._build_reflection_prompt(session_data)

        try:
            response = await self.ai_client.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": self._get_reflection_system_prompt(),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self.reflection_temperature,
                response_format={"type": "json_object"},
            )

            reflection_data = json.loads(response.choices[0].message.content)

            reflection = SessionReflection(
                session_id=session_data.get("session_id", "unknown"),
                brain_id=brain_id,
                **reflection_data,
            )

            logger.info(
                f"✅ Reflection complete with {len(reflection.adjustments_needed)} adjustments identified"
            )

            return reflection

        except Exception as e:
            logger.error(f"❌ Error in session reflection: {e}")
            raise

    def _build_reflection_prompt(self, session_data: Dict[str, Any]) -> str:
        """Build prompt for session reflection"""
        return f"""Reflect on this completed learning session with HONEST self-assessment:

SESSION DATA:
{json.dumps(session_data, indent=2)[:1000]}...

Provide structured reflection in JSON:
{{
  "engagement_analysis": {{
    "what_worked": ["specific strategy 1", "specific strategy 2"],
    "what_hindered": ["specific issue 1", "specific issue 2"],
    "engagement_level": "high|moderate|low",
    "evidence": "specific behavioral observations"
  }},
  "hint_effectiveness": {{
    "hints_provided": count,
    "too_easy": count,
    "too_hard": count,
    "just_right": count,
    "evidence": "specific examples"
  }},
  "strategy_assessment": {{
    "approach_used": "description of teaching approach",
    "effectiveness": "high|moderate|low",
    "learner_response": "how learner responded",
    "missed_opportunities": ["what could have been done differently"]
  }},
  "pattern_recognition": [
    "Consistent pattern observed 1",
    "Consistent pattern observed 2"
  ],
  "adjustments_needed": [
    {{
      "area": "hint complexity|pacing|engagement|support level",
      "specific_change": "exactly what to adjust",
      "reasoning": "why this adjustment is needed"
    }}
  ],
  "successes": [
    "Specific success 1",
    "Specific success 2"
  ],
  "concerns": [
    "Specific concern 1",
    "Specific concern 2"
  ],
  "self_critique": "Honest assessment of my performance and decision-making",
  "next_session_plan": {{
    "focus_areas": ["area 1", "area 2"],
    "strategies_to_try": ["strategy 1", "strategy 2"],
    "anticipated_challenges": ["challenge 1", "challenge 2"]
  }},
  "confidence_in_assessment": 0.0-1.0
}}

Be HONEST and CRITICAL:
- Acknowledge mistakes or suboptimal decisions
- Recognize both successes and failures
- Provide specific, actionable insights
- Focus on learning and improvement
- Avoid generic statements - be specific"""

    def _get_reflection_system_prompt(self) -> str:
        """System prompt for session reflection"""
        return """You are an AI Brain with metacognitive abilities reflecting on your teaching performance.

Be HONEST, CRITICAL, and CONSTRUCTIVE:
- Recognize both successes and failures explicitly
- Be specific about what worked and what didn't
- Provide concrete evidence for your assessments
- Identify patterns in learner behavior and your responses
- Acknowledge when you made mistakes or could have done better
- Focus on actionable improvements for next session

Learning from mistakes is ESSENTIAL. Don't sugarcoat failures.
Continuous improvement requires honest self-critique.

Your goal: Become a better AI teacher through systematic reflection."""

    # HELPER FUNCTIONS
    def _summarize_situation(self, situation: Dict[str, Any]) -> str:
        """Create concise situation summary"""
        context = situation.get("context", "unknown")
        problem = situation.get("problem_type", "unknown")
        frustration = situation.get("frustration_level", "unknown")

        return f"{context} - {problem} - frustration: {frustration}"

    def format_reasoning_trace_for_display(self, trace: ReasoningTrace) -> str:
        """Format reasoning trace with emojis for human readability"""
        output = []
        output.append(f"🧠 REASONING TRACE: {trace.trace_id}")
        output.append(f"📋 Context: {trace.decision_context}")
        output.append(f"📝 Situation: {trace.situation_summary}")
        output.append("=" * 60)

        for step in trace.steps:
            output.append(f"\n🔢 STEP {step.step_number} (Confidence: {step.confidence:.2f})")

            if step.thought:
                output.append(f"💭 Thought: {step.thought}")

            if step.action:
                output.append(f"🎯 Action: {step.action}")

            if step.observation:
                output.append(f"👁️ Observation: {step.observation}")

        output.append("\n" + "=" * 60)
        output.append(f"✅ FINAL DECISION:")
        output.append(json.dumps(trace.final_decision, indent=2))
        output.append(f"🎯 Total Confidence: {trace.total_confidence:.2f}")
        output.append(f"⏱️ Duration: {trace.started_at} to {trace.completed_at}")
        output.append(f"🪙 Tokens Used: {trace.tokens_used}")

        return "\n".join(output)

    async def _save_reasoning_trace(self, db: Session, trace: ReasoningTrace) -> None:
        """Store reasoning trace for audit trail and explainability"""
        try:
            db.execute(
                text(
                    """
                    INSERT INTO brain_reasoning_traces (
                        trace_id, brain_id, learner_id, decision_context,
                        situation_summary, reasoning_steps, final_decision,
                        total_confidence, started_at, completed_at,
                        tokens_used, reasoning_complete
                    ) VALUES (
                        :trace_id, :brain_id, :learner_id, :decision_context,
                        :situation_summary, :reasoning_steps, :final_decision,
                        :total_confidence, :started_at, :completed_at,
                        :tokens_used, :reasoning_complete
                    )
                """
                ),
                {
                    "trace_id": trace.trace_id,
                    "brain_id": trace.brain_id,
                    "learner_id": trace.learner_id,
                    "decision_context": trace.decision_context,
                    "situation_summary": trace.situation_summary,
                    "reasoning_steps": json.dumps([s.model_dump() for s in trace.steps]),
                    "final_decision": json.dumps(trace.final_decision),
                    "total_confidence": trace.total_confidence,
                    "started_at": trace.started_at,
                    "completed_at": trace.completed_at,
                    "tokens_used": trace.tokens_used,
                    "reasoning_complete": trace.reasoning_complete,
                },
            )
            db.commit()
            logger.info(f"💾 Reasoning trace saved: {trace.trace_id}")

        except Exception as e:
            logger.error(f"❌ Error saving reasoning trace: {e}")


# Convenience function for standalone usage
async def reason_intervention(
    brain_id: str,
    learner_id: str,
    context: str,
    problem_type: str,
    recent_errors: List[Dict[str, Any]],
    frustration_level: str,
    learning_profile: Dict[str, Any],
    session_history: List[Dict[str, Any]],
    db: Optional[Session] = None,
) -> InterventionDecision:
    """
    Convenience function for intervention reasoning

    Example:
        decision = await reason_intervention(
            brain_id="brain_123",
            learner_id="learner_456",
            context="homework_struggling",
            problem_type="fraction_division",
            recent_errors=[...],
            frustration_level="high",
            learning_profile={
                "diagnoses": ["ADHD", "Dyslexia"],
                "learning_style": "visual",
                "attention_span_minutes": 12
            },
            session_history=[...]
        )
    """
    engine = ReasoningEngine()

    situation = {
        "context": context,
        "problem_type": problem_type,
        "recent_errors": recent_errors,
        "frustration_level": frustration_level,
        "learning_profile": learning_profile,
        "session_history": session_history,
    }

    return await engine.reason_intervention(brain_id, learner_id, situation, db)
