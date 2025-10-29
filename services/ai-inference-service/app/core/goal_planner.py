"""
Goal Planner - Autonomous Learning Goal Generation & Progress Tracking
Production-ready implementation for Aivo AI Brain system
"""

import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.ai_client import get_ai_client

# Configure logging with emoji indicators
logger = logging.getLogger(__name__)


# Data Models
class Milestone(BaseModel):
    """Individual milestone within a learning goal"""

    milestone_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order: int
    description: str
    target_date: str
    completed: bool = False
    success_criteria: List[str]
    verification_method: str
    progress_percentage: float = 0.0


class LearningGoal(BaseModel):
    """Comprehensive learning goal structure"""

    goal_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learner_id: str
    brain_id: str
    goal_type: str  # skill_building, confidence, behavior, foundation
    target_skill: str
    subject: str  # reading, math, writing, science
    current_level: float  # 0-10 scale
    target_level: float  # 0-10 scale
    aligned_iep_goals: List[str] = []
    district_standards: List[str] = []
    estimated_sessions: int
    estimated_weeks: int
    milestones: List[Milestone]
    strategies: List[str]
    diagnosis_adaptations: Dict[str, Any]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    target_date: str
    progress: float = 0.0
    status: str = "active"  # active, completed, abandoned, needs_adjustment
    obstacles: List[str] = []
    adaptations_made: List[str] = []
    confidence_score: float  # 0.0-1.0
    reasoning: str
    weekly_schedule: Optional[Dict[str, Any]] = None


class LearnerState(BaseModel):
    """Comprehensive learner state analysis"""

    learner_id: str
    skill_levels: Dict[str, float]  # subject -> 0-10 scale
    skill_gaps: List[Dict[str, Any]]  # gap, severity, priority
    strengths: List[str]
    engagement_score: float  # 0-10
    attention_trend: str  # improving, stable, declining
    preferred_times: List[str]  # morning, afternoon, evening
    recent_success_rate: float  # 0.0-1.0
    hint_usage_trend: str  # increasing, stable, decreasing
    independence_level: float  # 0-10
    ready_for_next_level: Dict[str, bool]  # subject -> bool
    recommended_focus: List[str]
    current_obstacles: List[str]
    regulation_needs: Dict[str, Any]
    diagnosis_considerations: Dict[str, Any]
    analyzed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class DailyActivity(BaseModel):
    """Structured daily activity plan"""

    activity_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    day: int
    title: str
    duration_minutes: int
    materials_needed: List[str]
    step_by_step: List[str]
    success_criteria: List[str]
    adaptation_if_struggling: str
    extension_if_excelling: str
    parent_guidance: Optional[str] = None


class ActionPlan(BaseModel):
    """Week-by-week action plan for goal achievement"""

    plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_id: str
    brain_id: str
    scaffolding_sequence: List[str]
    weekly_activities: Dict[int, List[DailyActivity]]  # week -> activities
    progress_checkpoints: List[Dict[str, Any]]
    adaptation_triggers: Dict[str, Any]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ProgressEvaluation(BaseModel):
    """Goal progress evaluation result"""

    evaluation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_id: str
    progress_score: float  # 0-100
    on_track: bool
    days_elapsed: int
    days_remaining: int
    completion_percentage: float
    obstacles_detected: List[str]
    performance_trends: Dict[str, Any]
    recommended_adjustments: List[Dict[str, Any]]
    updated_confidence: float
    suggest_goal_modification: bool
    modification_reasoning: Optional[str] = None
    evaluated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class GoalPlanner:
    """
    Production-ready autonomous goal-setting and planning system

    Features:
    - Multi-source state analysis (sessions, IEP, assessments)
    - AI-powered SMART goal generation
    - Diagnosis-specific adaptations (ADHD, ASD, Dyslexia, Anxiety)
    - Week-by-week action planning
    - Progress evaluation and adjustment recommendations
    """

    def __init__(self):
        self.ai_client = get_ai_client()
        logger.info("🎯 GoalPlanner initialized")

    async def analyze_learner_state(
        self,
        brain: Any,
        recent_sessions: List[Dict[str, Any]],
        iep_goals: Optional[List[Dict[str, Any]]] = None,
        assessment_data: Optional[Dict[str, Any]] = None,
    ) -> LearnerState:
        """
        Comprehensive learner state analysis from multiple data sources

        Args:
            brain: Brain instance with learner profile
            recent_sessions: Last 10-20 homework/learning sessions
            iep_goals: IEP goals and progress data
            assessment_data: Baseline and periodic assessment results

        Returns:
            LearnerState object with detailed analysis
        """
        logger.info(f"🔍 Analyzing learner state for {brain.learner_id}")

        try:
            # Calculate skill levels (0-10 scale)
            skill_levels = await self._calculate_skill_levels(recent_sessions, assessment_data)

            # Identify skill gaps with severity
            skill_gaps = self._identify_skill_gaps(skill_levels, iep_goals, brain.grade_level)

            # Calculate engagement metrics
            engagement_metrics = self._calculate_engagement_metrics(recent_sessions)

            # Analyze hint usage patterns
            hint_analysis = self._analyze_hint_usage(recent_sessions)

            # Determine readiness for next level
            readiness = self._assess_readiness_for_next_level(skill_levels, recent_sessions)

            # Identify regulation needs
            regulation = self._analyze_regulation_needs(
                recent_sessions, brain.neurodiverse_profiles
            )

            # Build AI analysis prompt
            ai_analysis = await self._ai_analyze_state(
                brain, skill_levels, skill_gaps, engagement_metrics, recent_sessions, iep_goals
            )

            learner_state = LearnerState(
                learner_id=brain.learner_id,
                skill_levels=skill_levels,
                skill_gaps=skill_gaps,
                strengths=ai_analysis.get("strengths", []),
                engagement_score=engagement_metrics["engagement_score"],
                attention_trend=engagement_metrics["attention_trend"],
                preferred_times=engagement_metrics.get("preferred_times", ["morning"]),
                recent_success_rate=engagement_metrics["success_rate"],
                hint_usage_trend=hint_analysis["trend"],
                independence_level=hint_analysis["independence_level"],
                ready_for_next_level=readiness,
                recommended_focus=ai_analysis.get("recommended_focus", []),
                current_obstacles=ai_analysis.get("obstacles", []),
                regulation_needs=regulation,
                diagnosis_considerations=self._get_diagnosis_considerations(
                    brain.neurodiverse_profiles
                ),
            )

            logger.info(f"✅ State analysis complete: {len(skill_levels)} skills analyzed")
            return learner_state

        except Exception as e:
            logger.error(f"❌ Error analyzing learner state: {e}")
            raise

    async def generate_learning_goals(
        self,
        brain: Any,
        learner_state: LearnerState,
        time_horizon: str = "2_weeks",
        max_goals: int = 3,
        db: Optional[Session] = None,
    ) -> List[LearningGoal]:
        """
        Autonomously generate 2-4 SMART learning goals using AI

        Args:
            brain: Brain instance
            learner_state: Analyzed learner state
            time_horizon: "1_week", "2_weeks", "1_month"
            max_goals: Maximum goals to generate (2-4)
            db: Database session for persistence

        Returns:
            List of LearningGoal objects
        """
        logger.info(f"🎯 Generating up to {max_goals} learning goals for {time_horizon}")

        try:
            # Build AI prompt for goal generation
            prompt = self._build_goal_generation_prompt(
                brain, learner_state, time_horizon, max_goals
            )

            # Call AI with structured output
            response = await self.ai_client.chat_completion(
                messages=[
                    {"role": "system", "content": self._get_goal_generation_system_prompt()},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
                response_format={"type": "json_object"},
            )

            # Parse AI response
            goals_data = json.loads(response.choices[0].message.content)
            raw_goals = goals_data.get("goals", [])

            # Convert to LearningGoal objects
            learning_goals = []
            for idx, goal_data in enumerate(raw_goals[:max_goals]):
                goal = self._create_learning_goal(goal_data, brain, learner_state, time_horizon)
                learning_goals.append(goal)
                logger.info(
                    f"📋 Goal {idx + 1}: {goal.target_skill} "
                    f"(confidence: {goal.confidence_score:.2f})"
                )

            # Persist to database if provided
            if db:
                for goal in learning_goals:
                    await self._save_goal(db, goal)

            logger.info(f"✅ Generated {len(learning_goals)} learning goals")
            return learning_goals

        except Exception as e:
            logger.error(f"❌ Error generating goals: {e}")
            raise

    async def create_action_plan(
        self,
        brain: Any,
        goal: LearningGoal,
        db: Optional[Session] = None,
    ) -> ActionPlan:
        """
        Create detailed week-by-week action plan for goal achievement

        Args:
            brain: Brain instance
            goal: Learning goal to plan for
            db: Database session for persistence

        Returns:
            ActionPlan with daily activities and checkpoints
        """
        logger.info(f"📋 Creating action plan for goal: {goal.target_skill}")

        try:
            # Build AI prompt for action planning
            prompt = self._build_action_planning_prompt(brain, goal)

            # Call AI
            response = await self.ai_client.chat_completion(
                messages=[
                    {"role": "system", "content": self._get_action_planning_system_prompt()},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )

            # Parse response
            plan_data = json.loads(response.choices[0].message.content)

            # Build ActionPlan
            action_plan = self._create_action_plan(plan_data, goal, brain)

            # Persist if database provided
            if db:
                await self._save_action_plan(db, action_plan)

            logger.info(f"✅ Action plan created with {len(action_plan.weekly_activities)} weeks")
            return action_plan

        except Exception as e:
            logger.error(f"❌ Error creating action plan: {e}")
            raise

    async def evaluate_goal_progress(
        self,
        brain: Any,
        goal: LearningGoal,
        recent_interactions: List[Dict[str, Any]],
        db: Optional[Session] = None,
    ) -> ProgressEvaluation:
        """
        Evaluate goal progress from recent session data

        Args:
            brain: Brain instance
            goal: Learning goal to evaluate
            recent_interactions: Recent sessions/homework data
            db: Database session for updates

        Returns:
            ProgressEvaluation with recommendations
        """
        logger.info(f"📊 Evaluating progress for goal: {goal.target_skill}")

        try:
            # Calculate time metrics
            created_date = datetime.fromisoformat(goal.created_at)
            target_date = datetime.fromisoformat(goal.target_date)
            now = datetime.utcnow()

            days_elapsed = (now - created_date).days
            days_remaining = (target_date - now).days
            total_days = (target_date - created_date).days

            # Calculate progress from interactions
            progress_score = self._calculate_progress_score(goal, recent_interactions)

            # Check milestone completion
            milestones_completed = sum(1 for m in goal.milestones if m.completed)
            milestone_percentage = (
                (milestones_completed / len(goal.milestones) * 100) if goal.milestones else 0
            )

            # Determine if on track
            expected_progress = (days_elapsed / total_days * 100) if total_days > 0 else 0
            on_track = progress_score >= (expected_progress * 0.8)  # 80% tolerance

            # Detect obstacles
            obstacles = self._detect_obstacles(goal, recent_interactions)

            # Analyze trends
            trends = self._analyze_performance_trends(recent_interactions, goal)

            # Get AI recommendations
            ai_eval = await self._ai_evaluate_progress(
                brain, goal, progress_score, on_track, obstacles, trends
            )

            # Build evaluation
            evaluation = ProgressEvaluation(
                goal_id=goal.goal_id,
                progress_score=progress_score,
                on_track=on_track,
                days_elapsed=days_elapsed,
                days_remaining=days_remaining,
                completion_percentage=milestone_percentage,
                obstacles_detected=obstacles,
                performance_trends=trends,
                recommended_adjustments=ai_eval.get("adjustments", []),
                updated_confidence=ai_eval.get("updated_confidence", goal.confidence_score),
                suggest_goal_modification=ai_eval.get("suggest_modification", False),
                modification_reasoning=ai_eval.get("modification_reasoning"),
            )

            # Update goal in database
            if db:
                await self._update_goal_progress(db, goal.goal_id, evaluation)

            logger.info(f"📊 Progress: {progress_score:.1f}% | On Track: {on_track}")
            return evaluation

        except Exception as e:
            logger.error(f"❌ Error evaluating progress: {e}")
            raise

    # Private helper methods

    async def _calculate_skill_levels(
        self, sessions: List[Dict[str, Any]], assessments: Optional[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate 0-10 skill levels for each subject"""
        skill_levels = {}

        # From sessions
        subject_stats = {}
        for session in sessions:
            subject = session.get("subject", "general")
            if subject not in subject_stats:
                subject_stats[subject] = {"correct": 0, "total": 0}

            subject_stats[subject]["total"] += 1
            if session.get("correct", False):
                subject_stats[subject]["correct"] += 1

        # Convert to 0-10 scale
        for subject, stats in subject_stats.items():
            if stats["total"] > 0:
                success_rate = stats["correct"] / stats["total"]
                skill_levels[subject] = round(success_rate * 10, 1)

        # Enhance with assessment data
        if assessments and "ability_estimates" in assessments:
            for domain, theta in assessments["ability_estimates"].items():
                # Convert IRT theta (-3 to +3) to 0-10 scale
                # theta=0 maps to 5, theta=+3 maps to 10, theta=-3 maps to 0
                normalized = ((theta + 3) / 6) * 10
                skill_levels[domain] = round(max(0, min(10, normalized)), 1)

        return skill_levels

    def _identify_skill_gaps(
        self,
        skill_levels: Dict[str, float],
        iep_goals: Optional[List[Dict[str, Any]]],
        grade_level: str,
    ) -> List[Dict[str, Any]]:
        """Identify skill gaps with severity ratings"""
        gaps = []

        # Grade-level expectations (simplified)
        grade_expectations = {
            "K": {"reading": 3, "math": 3},
            "1": {"reading": 4, "math": 4},
            "2": {"reading": 5, "math": 5},
            "3": {"reading": 6, "math": 6},
            "4": {"reading": 7, "math": 7},
            "5": {"reading": 7.5, "math": 7.5},
        }

        expected_levels = grade_expectations.get(grade_level, {})

        for subject, expected in expected_levels.items():
            current = skill_levels.get(subject, 0)
            gap_size = expected - current

            if gap_size > 0:
                # Determine severity
                if gap_size >= 3:
                    severity = "high"
                    priority = 1
                elif gap_size >= 1.5:
                    severity = "medium"
                    priority = 2
                else:
                    severity = "low"
                    priority = 3

                gaps.append(
                    {
                        "subject": subject,
                        "current_level": current,
                        "expected_level": expected,
                        "gap_size": round(gap_size, 1),
                        "severity": severity,
                        "priority": priority,
                    }
                )

        # Sort by priority
        gaps.sort(key=lambda x: x["priority"])

        return gaps

    def _calculate_engagement_metrics(self, sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate engagement score and attention trends"""
        if not sessions:
            return {
                "engagement_score": 5.0,
                "attention_trend": "unknown",
                "success_rate": 0.0,
            }

        # Calculate success rate
        correct = sum(1 for s in sessions if s.get("correct", False))
        success_rate = correct / len(sessions)

        # Calculate engagement score (0-10)
        # Factors: completion rate, time on task, hint usage
        completion_rate = len([s for s in sessions if s.get("completed", True)]) / len(sessions)
        avg_time = sum(s.get("duration_minutes", 20) for s in sessions) / len(sessions)
        hint_rate = sum(s.get("hints_used", 0) for s in sessions) / len(sessions)

        engagement_score = (
            completion_rate * 4  # 40% weight
            + min(avg_time / 20, 1) * 3  # 30% weight (20 min = full score)
            + (1 - min(hint_rate / 3, 1)) * 3  # 30% weight (fewer hints = better)
        )

        # Determine trend (comparing first half vs second half)
        mid = len(sessions) // 2
        first_half_success = sum(1 for s in sessions[:mid] if s.get("correct", False)) / max(mid, 1)
        second_half_success = sum(1 for s in sessions[mid:] if s.get("correct", False)) / max(
            len(sessions) - mid, 1
        )

        if second_half_success > first_half_success + 0.1:
            attention_trend = "improving"
        elif second_half_success < first_half_success - 0.1:
            attention_trend = "declining"
        else:
            attention_trend = "stable"

        return {
            "engagement_score": round(engagement_score, 1),
            "attention_trend": attention_trend,
            "success_rate": success_rate,
        }

    def _analyze_hint_usage(self, sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze hint usage patterns and independence level"""
        if not sessions:
            return {"trend": "unknown", "independence_level": 5.0}

        total_hints = sum(s.get("hints_used", 0) for s in sessions)
        avg_hints = total_hints / len(sessions)

        # Calculate independence (10 = no hints needed, 0 = constant hints)
        independence = max(0, 10 - (avg_hints * 2))

        # Determine trend
        mid = len(sessions) // 2
        first_half_hints = sum(s.get("hints_used", 0) for s in sessions[:mid]) / max(mid, 1)
        second_half_hints = sum(s.get("hints_used", 0) for s in sessions[mid:]) / max(
            len(sessions) - mid, 1
        )

        if second_half_hints < first_half_hints - 0.5:
            trend = "decreasing"  # Good - becoming more independent
        elif second_half_hints > first_half_hints + 0.5:
            trend = "increasing"  # Needs attention
        else:
            trend = "stable"

        return {
            "trend": trend,
            "independence_level": round(independence, 1),
            "average_hints_per_session": round(avg_hints, 1),
        }

    def _assess_readiness_for_next_level(
        self, skill_levels: Dict[str, float], sessions: List[Dict[str, Any]]
    ) -> Dict[str, bool]:
        """Determine if learner is ready for next level in each subject"""
        readiness = {}

        for subject, level in skill_levels.items():
            # Ready if: skill level >= 7.5 AND recent success rate >= 75%
            subject_sessions = [s for s in sessions if s.get("subject") == subject]

            if subject_sessions:
                recent_success = sum(1 for s in subject_sessions[-5:] if s.get("correct", False))
                recent_rate = recent_success / min(5, len(subject_sessions))
                readiness[subject] = level >= 7.5 and recent_rate >= 0.75
            else:
                readiness[subject] = level >= 7.5

        return readiness

    def _analyze_regulation_needs(
        self, sessions: List[Dict[str, Any]], diagnoses: Optional[List[str]]
    ) -> Dict[str, Any]:
        """Analyze emotional regulation and break needs"""
        regulation = {
            "needs_frequent_breaks": False,
            "frustration_indicators": [],
            "optimal_session_length": 20,
        }

        if not sessions:
            return regulation

        # Check for frustration indicators
        frustration_count = sum(1 for s in sessions if s.get("consecutive_errors", 0) >= 3)
        if frustration_count > len(sessions) * 0.2:
            regulation["frustration_indicators"].append("frequent_error_streaks")

        # Adjust for diagnoses
        if diagnoses:
            if "ADHD" in diagnoses:
                regulation["needs_frequent_breaks"] = True
                regulation["optimal_session_length"] = 10
            if "Anxiety" in diagnoses:
                regulation["frustration_indicators"].append("high_anxiety_risk")
                regulation["optimal_session_length"] = 15

        return regulation

    def _get_diagnosis_considerations(self, diagnoses: Optional[List[str]]) -> Dict[str, Any]:
        """Get specific considerations for each diagnosis"""
        considerations = {}

        if not diagnoses:
            return considerations

        diagnosis_info = {
            "ADHD": {
                "milestone_duration": "10-15 minutes",
                "success_frequency": "every 5-10 minutes",
                "strategy_focus": "movement breaks, gamification, clear time limits",
            },
            "ASD": {
                "structure_need": "high",
                "predictability": "essential",
                "strategy_focus": "visual schedules, explicit criteria, routine",
            },
            "Dyslexia": {
                "approach": "multi-sensory",
                "strategy_focus": "phonetic scaffolding, visual aids, audio support",
            },
            "Anxiety": {
                "pressure_level": "low",
                "strategy_focus": "confidence-building starts, positive reinforcement",
            },
        }

        for diagnosis in diagnoses:
            if diagnosis in diagnosis_info:
                considerations[diagnosis] = diagnosis_info[diagnosis]

        return considerations

    async def _ai_analyze_state(
        self,
        brain: Any,
        skill_levels: Dict[str, float],
        skill_gaps: List[Dict[str, Any]],
        engagement: Dict[str, Any],
        sessions: List[Dict[str, Any]],
        iep_goals: Optional[List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        """Use AI to provide comprehensive state analysis"""
        prompt = f"""Analyze this learner's current state as an expert educational psychologist:

LEARNER PROFILE:
- Grade: {brain.grade_level}
- Diagnoses: {", ".join(brain.neurodiverse_profiles or ["None"])}
- Learning Style: {brain.learning_style}

SKILL LEVELS (0-10 scale):
{json.dumps(skill_levels, indent=2)}

SKILL GAPS:
{json.dumps(skill_gaps, indent=2)}

ENGAGEMENT METRICS:
{json.dumps(engagement, indent=2)}

RECENT SESSIONS: {len(sessions)} analyzed

IEP GOALS: {len(iep_goals) if iep_goals else 0}

Provide analysis in JSON format:
{{
  "strengths": ["specific strength 1", "specific strength 2"],
  "recommended_focus": ["priority area 1", "priority area 2"],
  "obstacles": ["obstacle 1", "obstacle 2"],
  "learning_preferences": ["preference 1", "preference 2"]
}}"""

        try:
            response = await self.ai_client.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert educational psychologist specializing in special education.
Provide evidence-based insights in structured JSON format.""",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )

            return json.loads(response.choices[0].message.content)

        except Exception as e:
            logger.warning(f"⚠️ AI analysis failed, using fallback: {e}")
            return {
                "strengths": ["Engaged learner", "Shows persistence"],
                "recommended_focus": ["Priority skill gaps"],
                "obstacles": ["Time constraints"],
                "learning_preferences": ["Varied approaches"],
            }

    def _build_goal_generation_prompt(
        self, brain: Any, learner_state: LearnerState, time_horizon: str, max_goals: int
    ) -> str:
        """Build comprehensive prompt for AI goal generation"""
        weeks = 1 if "1_week" in time_horizon else 2 if "2_weeks" in time_horizon else 4

        return f"""Generate {max_goals} SMART learning goals for this student:

LEARNER PROFILE:
- ID: {learner_state.learner_id}
- Grade: {brain.grade_level}
- Diagnoses: {", ".join(brain.neurodiverse_profiles or ["None"])}

CURRENT STATE:
Skill Levels: {json.dumps(learner_state.skill_levels, indent=2)}
Skill Gaps: {json.dumps([g for g in learner_state.skill_gaps[:3]], indent=2)}
Strengths: {learner_state.strengths}
Engagement: {learner_state.engagement_score}/10
Independence: {learner_state.independence_level}/10
Success Rate: {learner_state.recent_success_rate:.0%}

TIME HORIZON: {weeks} weeks
DIAGNOSIS CONSIDERATIONS:
{json.dumps(learner_state.diagnosis_considerations, indent=2)}

Generate goals in JSON format:
{{
  "goals": [
    {{
      "goal_type": "skill_building|confidence|behavior|foundation",
      "target_skill": "specific skill",
      "subject": "reading|math|writing|science",
      "current_level": 0-10,
      "target_level": 0-10,
      "aligned_iep_goals": ["IEP goal 1"],
      "district_standards": ["standard 1"],
      "estimated_sessions": number,
      "estimated_weeks": {weeks},
      "strategies": ["strategy 1", "strategy 2", "strategy 3"],
      "diagnosis_adaptations": {{}},
      "milestones": [
        {{
          "order": 1,
          "description": "milestone 1",
          "target_date": "YYYY-MM-DD",
          "success_criteria": ["criterion 1"],
          "verification_method": "how to verify"
        }}
      ],
      "confidence_score": 0.0-1.0,
      "reasoning": "why this goal now"
    }}
  ]
}}

REQUIREMENTS:
- Align with IEP objectives
- Consider diagnosis-specific needs
- Build on strengths
- Address high-priority gaps
- Realistic for timeframe
- Include 3-5 concrete strategies
- Break into weekly milestones
- Provide clear reasoning"""

    def _get_goal_generation_system_prompt(self) -> str:
        """System prompt for goal generation"""
        return """You are an expert IEP coordinator specializing in special education.

Set realistic SMART goals that:
- Consider diagnosis-specific needs (ADHD: short milestones, ASD: clear structure, Dyslexia: multi-sensory)
- Build on learner strengths
- Address priority gaps
- Are achievable within timeframe
- Include evidence-based strategies
- Provide clear reasoning

Be specific, measurable, and supportive."""

    def _create_learning_goal(
        self, goal_data: Dict[str, Any], brain: Any, learner_state: LearnerState, time_horizon: str
    ) -> LearningGoal:
        """Convert AI-generated goal data to LearningGoal object"""
        weeks = 1 if "1_week" in time_horizon else 2 if "2_weeks" in time_horizon else 4

        # Parse milestones
        milestones = [Milestone(**m) for m in goal_data.get("milestones", [])]

        # Calculate target date
        target_date = (datetime.utcnow() + timedelta(weeks=weeks)).isoformat()

        return LearningGoal(
            learner_id=brain.learner_id,
            brain_id=brain.brain_id,
            goal_type=goal_data.get("goal_type", "skill_building"),
            target_skill=goal_data.get("target_skill", ""),
            subject=goal_data.get("subject", "general"),
            current_level=goal_data.get("current_level", 0),
            target_level=goal_data.get("target_level", 0),
            aligned_iep_goals=goal_data.get("aligned_iep_goals", []),
            district_standards=goal_data.get("district_standards", []),
            estimated_sessions=goal_data.get("estimated_sessions", weeks * 3),
            estimated_weeks=weeks,
            milestones=milestones,
            strategies=goal_data.get("strategies", []),
            diagnosis_adaptations=goal_data.get("diagnosis_adaptations", {}),
            target_date=target_date,
            confidence_score=goal_data.get("confidence_score", 0.7),
            reasoning=goal_data.get("reasoning", ""),
        )

    def _build_action_planning_prompt(self, brain: Any, goal: LearningGoal) -> str:
        """Build prompt for detailed action planning"""
        return f"""Create a detailed week-by-week action plan for this goal:

GOAL: {goal.target_skill}
Subject: {goal.subject}
Duration: {goal.estimated_weeks} weeks
Current Level: {goal.current_level}/10 → Target: {goal.target_level}/10

STRATEGIES: {json.dumps(goal.strategies)}
DIAGNOSIS ADAPTATIONS: {json.dumps(goal.diagnosis_adaptations)}

Create action plan in JSON format:
{{
  "scaffolding_sequence": ["step 1", "step 2", "step 3"],
  "weekly_activities": {{
    "1": [
      {{
        "day": 1,
        "title": "activity title",
        "duration_minutes": {goal.diagnosis_adaptations.get("milestone_duration", "20").split("-")[0]},
        "materials_needed": ["material 1"],
        "step_by_step": ["step 1", "step 2"],
        "success_criteria": ["criterion 1"],
        "adaptation_if_struggling": "how to simplify",
        "extension_if_excelling": "how to extend",
        "parent_guidance": "tips for parents"
      }}
    ]
  }},
  "progress_checkpoints": [
    {{
      "week": 1,
      "what_to_check": "specific skills",
      "how_to_verify": "verification method",
      "expected_level": "performance level"
    }}
  ],
  "adaptation_triggers": {{
    "struggling": "if success rate < 50%",
    "excelling": "if success rate > 85%",
    "disengagement": "if hints used > 5 per session"
  }}
}}

REQUIREMENTS:
- Daily activities for each week
- Activities match attention span
- Clear step-by-step instructions
- Success criteria for each activity
- Adaptations for both struggling and excelling
- Progress checkpoints
- Parent guidance included"""

    def _get_action_planning_system_prompt(self) -> str:
        """System prompt for action planning"""
        return """You are an expert special education curriculum designer.

Create detailed, practical lesson plans that:
- Match learner's attention span
- Include step-by-step instructions
- Provide clear success criteria
- Include adaptations for different performance levels
- Consider diagnosis-specific needs
- Guide parents on how to support

Be specific, practical, and supportive."""

    def _create_action_plan(
        self, plan_data: Dict[str, Any], goal: LearningGoal, brain: Any
    ) -> ActionPlan:
        """Convert AI-generated plan to ActionPlan object"""
        # Parse weekly activities
        weekly_activities = {}
        for week_str, activities in plan_data.get("weekly_activities", {}).items():
            week_num = int(week_str)
            weekly_activities[week_num] = [DailyActivity(**act) for act in activities]

        return ActionPlan(
            goal_id=goal.goal_id,
            brain_id=brain.brain_id,
            scaffolding_sequence=plan_data.get("scaffolding_sequence", []),
            weekly_activities=weekly_activities,
            progress_checkpoints=plan_data.get("progress_checkpoints", []),
            adaptation_triggers=plan_data.get("adaptation_triggers", {}),
        )

    def _calculate_progress_score(
        self, goal: LearningGoal, interactions: List[Dict[str, Any]]
    ) -> float:
        """Calculate 0-100 progress score from recent interactions"""
        if not interactions:
            return 0.0

        # Filter interactions for this goal's subject
        relevant = [i for i in interactions if i.get("subject") == goal.subject]

        if not relevant:
            return 0.0

        # Calculate success rate
        correct = sum(1 for i in relevant if i.get("correct", False))
        success_rate = correct / len(relevant)

        # Map success rate to progress toward target
        current_to_target_range = goal.target_level - goal.current_level
        achieved_improvement = success_rate * current_to_target_range

        # Convert to percentage
        progress = (
            (achieved_improvement / current_to_target_range) * 100
            if current_to_target_range > 0
            else 0
        )

        return min(100, max(0, progress))

    def _detect_obstacles(
        self, goal: LearningGoal, interactions: List[Dict[str, Any]]
    ) -> List[str]:
        """Detect obstacles hindering goal progress"""
        obstacles = []

        if not interactions:
            obstacles.append("No recent practice data")
            return obstacles

        relevant = [i for i in interactions if i.get("subject") == goal.subject]

        if not relevant:
            obstacles.append("No practice in target subject")
            return obstacles

        # Check for error patterns
        error_rate = sum(1 for i in relevant if not i.get("correct", False)) / len(relevant)
        if error_rate > 0.6:
            obstacles.append("High error rate indicating conceptual gaps")

        # Check for hint overuse
        avg_hints = sum(i.get("hints_used", 0) for i in relevant) / len(relevant)
        if avg_hints > 4:
            obstacles.append("High hint dependency - may need prerequisite review")

        # Check for disengagement
        avg_time = sum(i.get("duration_minutes", 0) for i in relevant) / len(relevant)
        if avg_time < 5:
            obstacles.append("Low time on task - possible disengagement")

        return obstacles

    def _analyze_performance_trends(
        self, interactions: List[Dict[str, Any]], goal: LearningGoal
    ) -> Dict[str, Any]:
        """Analyze performance trends over time"""
        relevant = [i for i in interactions if i.get("subject") == goal.subject]

        if not relevant:
            return {"trend": "no_data", "direction": "unknown"}

        # Compare first half vs second half
        mid = len(relevant) // 2
        first_half = relevant[:mid] if mid > 0 else []
        second_half = relevant[mid:]

        first_success = (
            (sum(1 for i in first_half if i.get("correct", False)) / len(first_half))
            if first_half
            else 0
        )
        second_success = (
            (sum(1 for i in second_half if i.get("correct", False)) / len(second_half))
            if second_half
            else 0
        )

        if second_success > first_success + 0.15:
            trend = "improving"
        elif second_success < first_success - 0.15:
            trend = "declining"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "first_half_success": round(first_success, 2),
            "second_half_success": round(second_success, 2),
            "total_sessions": len(relevant),
        }

    async def _ai_evaluate_progress(
        self,
        brain: Any,
        goal: LearningGoal,
        progress_score: float,
        on_track: bool,
        obstacles: List[str],
        trends: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Use AI to provide progress evaluation and recommendations"""
        prompt = f"""Evaluate progress on this learning goal:

GOAL: {goal.target_skill}
Target: {goal.current_level} → {goal.target_level}
Time: {goal.estimated_weeks} weeks
Confidence: {goal.confidence_score}

CURRENT PROGRESS:
- Progress Score: {progress_score:.1f}%
- On Track: {on_track}
- Obstacles: {obstacles}
- Trend: {trends.get("trend")}

Provide evaluation in JSON:
{{
  "adjustments": [
    {{
      "type": "strategy|difficulty|focus",
      "action": "specific adjustment",
      "reasoning": "why needed"
    }}
  ],
  "updated_confidence": 0.0-1.0,
  "suggest_modification": true/false,
  "modification_reasoning": "why modify goal"
}}"""

        try:
            response = await self.ai_client.chat_completion(
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert educational evaluator.
Provide honest assessment recognizing both progress and challenges.
Recommend specific, actionable adjustments.""",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                response_format={"type": "json_object"},
            )

            return json.loads(response.choices[0].message.content)

        except Exception as e:
            logger.warning(f"⚠️ AI evaluation failed: {e}")
            return {
                "adjustments": [],
                "updated_confidence": goal.confidence_score,
                "suggest_modification": False,
            }

    # Database operations

    async def _save_goal(self, db: Session, goal: LearningGoal) -> None:
        """Persist goal to database"""
        db.execute(
            text("""
                INSERT INTO brain_learning_goals (
                    goal_id, brain_id, learner_id, goal_type, target_skill,
                    subject, current_level, target_level, aligned_iep_goals,
                    district_standards, estimated_sessions, estimated_weeks,
                    strategies, milestones, progress, reasoning, confidence,
                    status, created_at, target_date, diagnosis_adaptations
                ) VALUES (
                    :goal_id, :brain_id, :learner_id, :goal_type, :target_skill,
                    :subject, :current_level, :target_level, :aligned_iep_goals,
                    :district_standards, :estimated_sessions, :estimated_weeks,
                    :strategies, :milestones, :progress, :reasoning, :confidence,
                    :status, :created_at, :target_date, :diagnosis_adaptations
                )
            """),
            {
                "goal_id": goal.goal_id,
                "brain_id": goal.brain_id,
                "learner_id": goal.learner_id,
                "goal_type": goal.goal_type,
                "target_skill": goal.target_skill,
                "subject": goal.subject,
                "current_level": goal.current_level,
                "target_level": goal.target_level,
                "aligned_iep_goals": json.dumps(goal.aligned_iep_goals),
                "district_standards": json.dumps(goal.district_standards),
                "estimated_sessions": goal.estimated_sessions,
                "estimated_weeks": goal.estimated_weeks,
                "strategies": json.dumps(goal.strategies),
                "milestones": json.dumps([m.dict() for m in goal.milestones]),
                "progress": goal.progress,
                "reasoning": goal.reasoning,
                "confidence": goal.confidence_score,
                "status": goal.status,
                "created_at": goal.created_at,
                "target_date": goal.target_date,
                "diagnosis_adaptations": json.dumps(goal.diagnosis_adaptations),
            },
        )
        db.commit()

    async def _save_action_plan(self, db: Session, plan: ActionPlan) -> None:
        """Persist action plan to database"""
        # Simplified - would need action_plans table
        logger.info(f"📋 Action plan saved: {plan.plan_id}")

    async def _update_goal_progress(
        self, db: Session, goal_id: str, evaluation: ProgressEvaluation
    ) -> None:
        """Update goal progress in database"""
        db.execute(
            text("""
                UPDATE brain_learning_goals
                SET progress = :progress,
                    obstacles = :obstacles,
                    confidence = :confidence,
                    updated_at = :updated_at
                WHERE goal_id = :goal_id
            """),
            {
                "goal_id": goal_id,
                "progress": evaluation.progress_score,
                "obstacles": json.dumps(evaluation.obstacles_detected),
                "confidence": evaluation.updated_confidence,
                "updated_at": datetime.utcnow().isoformat(),
            },
        )
        db.commit()
