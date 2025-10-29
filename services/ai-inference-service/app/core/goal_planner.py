"""
Goal Planner - Autonomous Learning Goal Generation
Analyzes learner state and generates personalized SMART goals
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.ai_client import get_ai_client
from app.models.brain import Brain


class GoalPlanner:
    """Autonomous goal-setting system for personalized learning"""

    def __init__(self):
        self.ai_client = get_ai_client()

    async def analyze_learner_state(
        self,
        brain: Brain,
        recent_sessions: List[Dict[str, Any]],
        iep_goals: Optional[List[Dict[str, Any]]] = None,
        assessment_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Analyzes complete learner state to inform goal generation

        Returns comprehensive state analysis including:
        - Current skill levels per domain
        - Learning patterns and preferences
        - Strengths and gaps
        - Emotional/behavioral patterns
        - Progress trends
        """
        # Calculate success rates by domain
        domain_performance = self._calculate_domain_performance(recent_sessions)

        # Identify learning patterns
        patterns = self._identify_learning_patterns(recent_sessions, brain)

        # Analyze assessment data if available
        skill_levels = {}
        if assessment_data:
            skill_levels = assessment_data.get("ability_estimates", {})

        # Synthesize IEP alignment
        iep_alignment = {}
        if iep_goals:
            iep_alignment = self._analyze_iep_alignment(iep_goals, domain_performance)

        learner_state = {
            "learner_id": brain.learner_id,
            "grade_level": brain.grade_level,
            "diagnoses": brain.neurodiverse_profiles or [],
            "learning_style": brain.learning_style,
            "domain_performance": domain_performance,
            "skill_levels": skill_levels,
            "patterns": patterns,
            "iep_alignment": iep_alignment,
            "attention_span_minutes": self._estimate_attention_span(brain),
            "strengths": self._identify_strengths(domain_performance),
            "gaps": self._identify_gaps(domain_performance),
            "analyzed_at": datetime.utcnow().isoformat(),
        }

        return learner_state

    async def generate_learning_goals(
        self,
        brain: Brain,
        learner_state: Dict[str, Any],
        time_horizon: str = "2_weeks",
        max_goals: int = 3,
        db: Optional[Session] = None,
    ) -> List[Dict[str, Any]]:
        """
        Autonomously generates personalized learning goals using AI

        Args:
            brain: Brain instance
            learner_state: Complete learner analysis
            time_horizon: "1_week", "2_weeks", "1_month"
            max_goals: Maximum number of goals to generate
            db: Database session for persistence

        Returns:
            List of goal objects with strategies and milestones
        """
        # Build prompt for AI goal generation
        prompt = self._build_goal_generation_prompt(learner_state, time_horizon, max_goals)

        # Call AI to generate goals
        response = await self.ai_client.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": self._get_goal_planner_system_prompt(),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        # Parse AI response
        goals_data = json.loads(response.choices[0].message.content)
        goals = goals_data.get("goals", [])

        # Enrich and validate goals
        enriched_goals = []
        for goal in goals[:max_goals]:
            enriched_goal = self._enrich_goal(goal, brain.brain_id, learner_state)
            enriched_goals.append(enriched_goal)

        # Persist to database if session provided
        if db:
            for goal in enriched_goals:
                await self._save_goal(db, goal)

        return enriched_goals

    async def evaluate_goal_progress(
        self,
        goal_id: str,
        recent_sessions: List[Dict[str, Any]],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Evaluates progress toward a specific learning goal

        Returns:
            Progress report with completion percentage and insights
        """
        # Retrieve goal from database
        goal = await self._get_goal(db, goal_id)
        if not goal:
            return {"error": "Goal not found"}

        # Calculate progress metrics
        target_skill = goal.get("target_skill")
        current_level = goal.get("current_level", 0.0)
        target_level = goal.get("target_level", 1.0)

        # Analyze recent performance on target skill
        skill_performance = self._calculate_skill_performance(recent_sessions, target_skill)

        # Calculate progress percentage
        progress = 0.0
        if target_level > current_level:
            improvement = skill_performance - current_level
            progress = min(100.0, (improvement / (target_level - current_level)) * 100)

        # Check milestone completion
        milestones = goal.get("milestones", [])
        completed_milestones = []
        for milestone in milestones:
            if self._is_milestone_met(milestone, skill_performance):
                completed_milestones.append(milestone)

        # Generate AI insights on progress
        insights = await self._generate_progress_insights(
            goal, skill_performance, completed_milestones
        )

        progress_report = {
            "goal_id": goal_id,
            "progress_percentage": round(progress, 1),
            "current_performance": round(skill_performance, 2),
            "target_performance": target_level,
            "milestones_completed": len(completed_milestones),
            "total_milestones": len(milestones),
            "insights": insights,
            "recommendation": self._get_recommendation(progress),
            "evaluated_at": datetime.utcnow().isoformat(),
        }

        # Update goal in database
        await self._update_goal_progress(db, goal_id, progress_report)

        return progress_report

    def _calculate_domain_performance(self, sessions: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate success rate by domain from recent sessions"""
        domain_stats = {}

        for session in sessions:
            domain = session.get("domain", "general")
            correct = session.get("correct", False)

            if domain not in domain_stats:
                domain_stats[domain] = {"correct": 0, "total": 0}

            domain_stats[domain]["total"] += 1
            if correct:
                domain_stats[domain]["correct"] += 1

        # Calculate success rates
        performance = {}
        for domain, stats in domain_stats.items():
            if stats["total"] > 0:
                performance[domain] = stats["correct"] / stats["total"]

        return performance

    def _identify_learning_patterns(
        self, sessions: List[Dict[str, Any]], brain: Brain
    ) -> Dict[str, Any]:
        """Identify behavioral and learning patterns"""
        patterns = {
            "best_time_of_day": "morning",  # Placeholder
            "average_session_length": 0,
            "hint_usage_rate": 0.0,
            "frustration_indicators": [],
            "engagement_level": "medium",
        }

        if not sessions:
            return patterns

        # Calculate average session length
        total_duration = sum(s.get("duration_minutes", 0) for s in sessions)
        patterns["average_session_length"] = total_duration / len(sessions) if sessions else 0

        # Calculate hint usage
        hint_requests = sum(1 for s in sessions if s.get("hints_used", 0) > 0)
        patterns["hint_usage_rate"] = hint_requests / len(sessions)

        # Check for frustration indicators
        frustration_signals = [s for s in sessions if s.get("consecutive_errors", 0) >= 3]
        if frustration_signals:
            patterns["frustration_indicators"].append("multiple_consecutive_errors")

        return patterns

    def _analyze_iep_alignment(
        self,
        iep_goals: List[Dict[str, Any]],
        performance: Dict[str, float],
    ) -> Dict[str, Any]:
        """Check alignment with IEP goals"""
        alignment = {
            "total_iep_goals": len(iep_goals),
            "aligned_goals": [],
            "priority_areas": [],
        }

        for iep_goal in iep_goals:
            domain = iep_goal.get("domain", "")
            target = iep_goal.get("target_performance", 0.8)

            current_performance = performance.get(domain, 0.0)

            if current_performance < target:
                alignment["priority_areas"].append(
                    {
                        "domain": domain,
                        "gap": target - current_performance,
                        "iep_goal": iep_goal.get("description", ""),
                    }
                )

        return alignment

    def _estimate_attention_span(self, brain: Brain) -> int:
        """Estimate appropriate attention span based on profile"""
        base_span = 20  # Base 20 minutes

        diagnoses = brain.neurodiverse_profiles or []

        # Adjust for ADHD
        if "ADHD" in diagnoses:
            base_span = 10

        # Adjust for age/grade
        grade = brain.grade_level or "K"
        if grade in ["K", "1", "2"]:
            base_span = min(base_span, 15)

        return base_span

    def _identify_strengths(self, performance: Dict[str, float]) -> List[str]:
        """Identify domains where learner excels"""
        strengths = []
        for domain, success_rate in performance.items():
            if success_rate >= 0.75:
                strengths.append(domain)
        return strengths

    def _identify_gaps(self, performance: Dict[str, float]) -> List[str]:
        """Identify domains needing improvement"""
        gaps = []
        for domain, success_rate in performance.items():
            if success_rate < 0.60:
                gaps.append(domain)
        return gaps

    def _build_goal_generation_prompt(
        self,
        learner_state: Dict[str, Any],
        time_horizon: str,
        max_goals: int,
    ) -> str:
        """Build detailed prompt for AI goal generation"""
        diagnoses = learner_state.get("diagnoses", [])
        grade = learner_state.get("grade_level", "K")
        attention_span = learner_state.get("attention_span_minutes", 20)
        learning_style = learner_state.get("learning_style", "mixed")
        strengths = learner_state.get("strengths", [])
        gaps = learner_state.get("gaps", [])
        domain_perf = learner_state.get("domain_performance", {})

        prompt = f"""You are an expert IEP coordinator setting SMART goals for a {grade} grade student with {", ".join(diagnoses) if diagnoses else "no diagnosed needs"}.

Current State:
- Learning Style: {learning_style}
- Attention Span: {attention_span} minutes
- Strengths: {", ".join(strengths) if strengths else "Still assessing"}
- Areas for Growth: {", ".join(gaps) if gaps else "Maintaining current level"}

Domain Performance:
{json.dumps(domain_perf, indent=2)}

Generate {max_goals} achievable goals for the next {time_horizon.replace("_", " ")} that:
1. Build on identified strengths
2. Address highest-priority gaps
3. Are appropriately challenging but achievable
4. Consider {attention_span} minute attention span
5. Use {learning_style} learning strategies
6. Are specific and measurable (SMART format)

For each goal, provide:
- goal_type: "skill_building", "confidence", "behavior", or "foundation"
- target_skill: Specific skill to develop (e.g., "fraction denominators")
- current_level: Estimated current mastery (0.0-1.0)
- target_level: Target mastery by end of timeframe (0.0-1.0)
- strategies: List of 3-4 teaching strategies tailored to this learner
- milestones: 3-4 checkpoints to measure progress
- reasoning: Why this goal is important NOW for this learner
- confidence: Your confidence in achievability (0.0-1.0)

Return JSON format:
{{
  "goals": [
    {{
      "goal_type": "...",
      "target_skill": "...",
      "current_level": 0.0,
      "target_level": 0.0,
      "strategies": ["...", "...", "..."],
      "milestones": [
        {{"description": "...", "target_date": "YYYY-MM-DD", "metric": 0.0}},
        ...
      ],
      "reasoning": "...",
      "confidence": 0.0
    }}
  ]
}}"""

        return prompt

    def _get_goal_planner_system_prompt(self) -> str:
        """System prompt for goal planning AI"""
        return """You are an expert educational psychologist and IEP coordinator specializing in personalized learning for neurodiverse students.

Your expertise includes:
- Creating SMART goals aligned with cognitive profiles
- Understanding ADHD, ASD, Dyslexia, and other learning differences
- Designing achievable milestones that build confidence
- Selecting evidence-based instructional strategies
- Balancing challenge with achievability

Always consider:
- The learner's emotional state and confidence
- Their attention span and processing speed
- Their learning style preferences
- Their current skill levels and recent progress
- The importance of building on strengths while addressing gaps

Be encouraging, realistic, and data-driven in your recommendations."""

    def _enrich_goal(
        self,
        goal: Dict[str, Any],
        brain_id: str,
        learner_state: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Add metadata and IDs to goal"""
        goal_id = str(uuid.uuid4())

        enriched = {
            "goal_id": goal_id,
            "brain_id": brain_id,
            "learner_id": learner_state.get("learner_id"),
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "progress": 0.0,
            **goal,
        }

        return enriched

    async def _save_goal(self, db: Session, goal: Dict[str, Any]) -> None:
        """Persist goal to database"""
        db.execute(
            text("""
                INSERT INTO brain_learning_goals (
                    goal_id, brain_id, learner_id, goal_type,
                    target_skill, current_level, target_level,
                    strategies, milestones, progress, reasoning,
                    confidence, status, created_at
                ) VALUES (
                    :goal_id, :brain_id, :learner_id, :goal_type,
                    :target_skill, :current_level, :target_level,
                    :strategies, :milestones, :progress, :reasoning,
                    :confidence, :status, :created_at
                )
            """),
            {
                "goal_id": goal["goal_id"],
                "brain_id": goal["brain_id"],
                "learner_id": goal["learner_id"],
                "goal_type": goal.get("goal_type"),
                "target_skill": goal.get("target_skill"),
                "current_level": goal.get("current_level", 0.0),
                "target_level": goal.get("target_level", 1.0),
                "strategies": json.dumps(goal.get("strategies", [])),
                "milestones": json.dumps(goal.get("milestones", [])),
                "progress": goal.get("progress", 0.0),
                "reasoning": goal.get("reasoning"),
                "confidence": goal.get("confidence", 0.5),
                "status": goal.get("status", "active"),
                "created_at": goal.get("created_at"),
            },
        )
        db.commit()

    async def _get_goal(self, db: Session, goal_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve goal from database"""
        result = db.execute(
            text("""
                SELECT goal_id, brain_id, learner_id, goal_type,
                       target_skill, current_level, target_level,
                       strategies, milestones, progress, reasoning,
                       confidence, status, created_at
                FROM brain_learning_goals
                WHERE goal_id = :goal_id
            """),
            {"goal_id": goal_id},
        ).fetchone()

        if not result:
            return None

        return {
            "goal_id": result[0],
            "brain_id": result[1],
            "learner_id": result[2],
            "goal_type": result[3],
            "target_skill": result[4],
            "current_level": result[5],
            "target_level": result[6],
            "strategies": json.loads(result[7]) if result[7] else [],
            "milestones": json.loads(result[8]) if result[8] else [],
            "progress": result[9],
            "reasoning": result[10],
            "confidence": result[11],
            "status": result[12],
            "created_at": result[13],
        }

    def _calculate_skill_performance(
        self, sessions: List[Dict[str, Any]], target_skill: str
    ) -> float:
        """Calculate current performance on target skill"""
        relevant_sessions = [
            s for s in sessions if target_skill.lower() in s.get("skill", "").lower()
        ]

        if not relevant_sessions:
            return 0.0

        correct = sum(1 for s in relevant_sessions if s.get("correct"))
        return correct / len(relevant_sessions)

    def _is_milestone_met(self, milestone: Dict[str, Any], current_performance: float) -> bool:
        """Check if milestone criteria is met"""
        target_metric = milestone.get("metric", 1.0)
        return current_performance >= target_metric

    async def _generate_progress_insights(
        self,
        goal: Dict[str, Any],
        current_performance: float,
        completed_milestones: List[Dict[str, Any]],
    ) -> str:
        """Generate AI insights on goal progress"""
        prompt = f"""Analyze this learning goal progress:

Goal: {goal.get("target_skill")}
Target Level: {goal.get("target_level")}
Current Performance: {current_performance}
Milestones Completed: {len(completed_milestones)}/{len(goal.get("milestones", []))}

Provide 2-3 sentence insight:
- Is learner on track?
- What's working well?
- Any adjustments needed?

Be encouraging and specific."""

        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150,
        )

        return response.choices[0].message.content.strip()

    def _get_recommendation(self, progress: float) -> str:
        """Get recommendation based on progress"""
        if progress >= 80:
            return "Excellent progress! Consider advancing to next level."
        elif progress >= 60:
            return "Good progress. Continue current strategies."
        elif progress >= 40:
            return "Making progress. May need strategy adjustment."
        else:
            return "Limited progress. Recommend goal review and strategy change."

    async def _update_goal_progress(
        self, db: Session, goal_id: str, progress_report: Dict[str, Any]
    ) -> None:
        """Update goal progress in database"""
        db.execute(
            text("""
                UPDATE brain_learning_goals
                SET progress = :progress,
                    updated_at = :updated_at
                WHERE goal_id = :goal_id
            """),
            {
                "goal_id": goal_id,
                "progress": progress_report.get("progress_percentage", 0.0),
                "updated_at": datetime.utcnow(),
            },
        )
        db.commit()
