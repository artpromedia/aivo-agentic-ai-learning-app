"""Brain instance management with federated learning."""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

import redis

from app.core.config import settings
from app.core.goal_planner import GoalPlanner, LearnerState, LearningGoal
from app.models.brain_instance import BrainInstance, BrainStatus, LearningProfile


class BrainManager:
    """Manages brain instance lifecycle, cloning, and adaptation."""

    def __init__(self):
        """Initialize brain manager with Redis connection."""
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.base_model_name = settings.BASE_MODEL_NAME
        self.base_model_version = settings.BASE_MODEL_VERSION
        self.goal_planner = GoalPlanner()  # Initialize goal planner for autonomous goal setting

    def get_or_create_brain(
        self, learner_id: str, learning_profile: LearningProfile
    ) -> BrainInstance:
        """Get existing brain or create a new cloned instance."""
        # Try to get from cache
        cached_brain = self._get_cached_brain(learner_id)
        if cached_brain:
            cached_brain.update_activity()
            self._cache_brain(cached_brain)
            return cached_brain

        # Check if needs cloning
        if not settings.ENABLE_BRAIN_CLONING:
            # Return a generic brain instance
            return self._create_generic_brain(learner_id, learning_profile)

        # Clone a new brain
        brain = self._clone_brain(learner_id, learning_profile)
        brain.status = BrainStatus.ACTIVE
        self._cache_brain(brain)
        return brain

    def _clone_brain(self, learner_id: str, learning_profile: LearningProfile) -> BrainInstance:
        """Clone a new brain instance from the base model."""
        brain_id = f"brain_{learner_id}_{uuid.uuid4().hex[:8]}"

        # Initialize model parameters based on learning profile
        model_params = self._initialize_model_params(learning_profile)

        brain = BrainInstance(
            brain_id=brain_id,
            learner_id=learner_id,
            base_model_name=self.base_model_name,
            base_model_version=self.base_model_version,
            learning_profile=learning_profile,
            status=BrainStatus.INITIALIZING,
            model_params=model_params,
            adaptation_context={},
        )

        return brain

    def _create_generic_brain(
        self, learner_id: str, learning_profile: LearningProfile
    ) -> BrainInstance:
        """Create a generic brain instance (no cloning)."""
        brain_id = f"brain_{learner_id}_generic"

        brain = BrainInstance(
            brain_id=brain_id,
            learner_id=learner_id,
            base_model_name=self.base_model_name,
            base_model_version=self.base_model_version,
            learning_profile=learning_profile,
            status=BrainStatus.ACTIVE,
            model_params={},
            adaptation_context={},
        )

        return brain

    def _initialize_model_params(self, learning_profile: LearningProfile) -> Dict[str, Any]:
        """Initialize model parameters based on learning profile."""
        params = {
            "temperature": settings.DEFAULT_TEMPERATURE,
            "max_tokens": settings.DEFAULT_MAX_TOKENS,
        }

        # Adjust temperature based on diagnoses
        if "adhd" in [d.value for d in learning_profile.diagnoses]:
            params["temperature"] = 0.6  # More focused responses
        if "anxiety" in [d.value for d in learning_profile.diagnoses]:
            params["temperature"] = 0.5  # More predictable responses

        # Adjust max tokens based on attention span
        if learning_profile.attention_span_minutes:
            if learning_profile.attention_span_minutes < 15:
                params["max_tokens"] = 2048  # Shorter responses
            elif learning_profile.attention_span_minutes > 30:
                params["max_tokens"] = 8192  # Longer explanations OK

        return params

    def adapt_brain(self, brain_id: str, recent_outcomes: List[Dict[str, Any]]) -> BrainInstance:
        """Adapt brain based on recent learning outcomes."""
        brain = self._get_brain_by_id(brain_id)
        if not brain:
            raise ValueError(f"Brain {brain_id} not found")

        brain.status = BrainStatus.ADAPTING

        # Analyze outcomes
        success_rate = (
            sum(1 for o in recent_outcomes if o.get("success", False)) / len(recent_outcomes)
            if recent_outcomes
            else 0.0
        )

        # Adapt complexity preference
        if success_rate > 0.8:
            # Learner is doing well, increase complexity
            self._increase_complexity(brain)
        elif success_rate < 0.4:
            # Learner struggling, decrease complexity
            self._decrease_complexity(brain)

        # Update adaptation context
        brain.adaptation_context["last_adaptation"] = datetime.utcnow()
        brain.adaptation_context["outcomes_analyzed"] = len(recent_outcomes)
        brain.adaptation_context["success_rate"] = success_rate

        # Update metrics
        brain.metrics.adaptations_made += 1
        brain.metrics.last_adaptation_time = datetime.utcnow()

        brain.status = BrainStatus.ACTIVE
        self._cache_brain(brain)

        return brain

    def _increase_complexity(self, brain: BrainInstance):
        """Increase complexity level for the brain."""
        complexity_levels = ["simple", "moderate", "detailed"]
        current = brain.learning_profile.preferred_complexity
        current_idx = complexity_levels.index(current)
        if current_idx < len(complexity_levels) - 1:
            brain.learning_profile.preferred_complexity = complexity_levels[current_idx + 1]

    def _decrease_complexity(self, brain: BrainInstance):
        """Decrease complexity level for the brain."""
        complexity_levels = ["simple", "moderate", "detailed"]
        current = brain.learning_profile.preferred_complexity
        current_idx = complexity_levels.index(current)
        if current_idx > 0:
            brain.learning_profile.preferred_complexity = complexity_levels[current_idx - 1]

    def sync_brain(self, brain_id: str) -> bool:
        """Sync brain adaptations back to global model."""
        if not settings.FEDERATED_LEARNING_ENABLED:
            return False

        brain = self._get_brain_by_id(brain_id)
        if not brain:
            return False

        brain.status = BrainStatus.SYNCING

        # In production, this would aggregate learnings
        # and update the base model
        # For now, just mark as synced
        brain.last_synced = datetime.utcnow()
        brain.status = BrainStatus.ACTIVE
        self._cache_brain(brain)

        return True

    def should_sync_brain(self, brain: BrainInstance) -> bool:
        """Check if brain should be synced."""
        if not settings.FEDERATED_LEARNING_ENABLED:
            return False

        if not brain.last_synced:
            return True

        time_since_sync = (datetime.utcnow() - brain.last_synced).total_seconds()
        return time_since_sync >= settings.BRAIN_SYNC_INTERVAL

    def _get_cached_brain(self, learner_id: str) -> Optional[BrainInstance]:
        """Get brain from Redis cache."""
        cache_key = f"brain:{learner_id}"
        cached_data = self.redis_client.get(cache_key)

        if cached_data:
            data = json.loads(cached_data)
            return BrainInstance(**data)

        return None

    def _get_brain_by_id(self, brain_id: str) -> Optional[BrainInstance]:
        """Get brain by brain_id from cache."""
        # Extract learner_id from brain_id
        learner_id = brain_id.split("_")[1] if "_" in brain_id else None
        if learner_id:
            return self._get_cached_brain(learner_id)
        return None

    def _cache_brain(self, brain: BrainInstance):
        """Cache brain in Redis."""
        cache_key = f"brain:{brain.learner_id}"
        brain_data = brain.model_dump(mode="json")

        self.redis_client.setex(
            cache_key, settings.BRAIN_CACHE_TTL, json.dumps(brain_data, default=str)
        )

    def get_brain_stats(self, learner_id: str) -> Optional[Dict[str, Any]]:
        """Get brain statistics for a learner."""
        brain = self._get_cached_brain(learner_id)
        if not brain:
            return None

        return {
            "brain_id": brain.brain_id,
            "learner_id": brain.learner_id,
            "status": brain.status.value,
            "created_at": brain.created_at,
            "last_active": brain.last_active,
            "last_synced": brain.last_synced,
            "total_interactions": brain.metrics.total_interactions,
            "success_rate": brain.metrics.hint_success_rate,
            "adaptations_made": brain.metrics.adaptations_made,
            "preferred_complexity": (brain.learning_profile.preferred_complexity),
        }

    # Autonomous Goal Setting Methods

    async def analyze_and_set_goals(
        self,
        learner_id: str,
        recent_sessions: List[Dict[str, Any]],
        iep_goals: Optional[List[Dict[str, Any]]] = None,
        assessment_data: Optional[Dict[str, Any]] = None,
        time_horizon: str = "2_weeks",
        max_goals: int = 3,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Autonomously analyze learner state and generate personalized goals

        This is the main entry point for autonomous goal setting.

        Args:
            learner_id: Learner ID
            recent_sessions: Last 10-20 learning sessions
            iep_goals: IEP goals and progress
            assessment_data: Baseline/periodic assessment results
            time_horizon: "1_week", "2_weeks", or "1_month"
            max_goals: Maximum goals to generate (2-4)
            db: Database session for persistence

        Returns:
            Dict with learner_state and generated goals
        """
        brain = self._get_cached_brain(learner_id)
        if not brain:
            raise ValueError(f"Brain not found for learner {learner_id}")

        # Step 1: Analyze comprehensive learner state
        learner_state = await self.goal_planner.analyze_learner_state(
            brain=brain,
            recent_sessions=recent_sessions,
            iep_goals=iep_goals,
            assessment_data=assessment_data,
        )

        # Step 2: Generate SMART learning goals
        learning_goals = await self.goal_planner.generate_learning_goals(
            brain=brain,
            learner_state=learner_state,
            time_horizon=time_horizon,
            max_goals=max_goals,
            db=db,
        )

        # Step 3: Create action plans for each goal
        action_plans = []
        for goal in learning_goals:
            plan = await self.goal_planner.create_action_plan(brain=brain, goal=goal, db=db)
            action_plans.append(plan)

        # Update brain's adaptation context
        brain.adaptation_context["last_goal_setting"] = datetime.utcnow()
        brain.adaptation_context["current_goals"] = len(learning_goals)
        brain.adaptation_context["goal_ids"] = [g.goal_id for g in learning_goals]
        self._cache_brain(brain)

        return {
            "learner_id": learner_id,
            "brain_id": brain.brain_id,
            "learner_state": learner_state.model_dump(),
            "learning_goals": [g.model_dump() for g in learning_goals],
            "action_plans": [p.model_dump() for p in action_plans],
            "generated_at": datetime.utcnow().isoformat(),
        }

    async def evaluate_goal_progress(
        self,
        learner_id: str,
        goal_id: str,
        recent_interactions: List[Dict[str, Any]],
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate progress on a specific learning goal

        Args:
            learner_id: Learner ID
            goal_id: Goal ID to evaluate
            recent_interactions: Recent sessions since goal was set
            db: Database session for updates

        Returns:
            Dict with progress evaluation and recommendations
        """
        brain = self._get_cached_brain(learner_id)
        if not brain:
            raise ValueError(f"Brain not found for learner {learner_id}")

        # Retrieve goal from database or cache
        goal = await self._get_goal(goal_id, db)
        if not goal:
            raise ValueError(f"Goal {goal_id} not found")

        # Evaluate progress
        evaluation = await self.goal_planner.evaluate_goal_progress(
            brain=brain, goal=goal, recent_interactions=recent_interactions, db=db
        )

        # Update brain metrics
        brain.metrics.total_interactions += len(recent_interactions)
        self._cache_brain(brain)

        return {
            "learner_id": learner_id,
            "brain_id": brain.brain_id,
            "goal_id": goal_id,
            "evaluation": evaluation.model_dump(),
            "evaluated_at": datetime.utcnow().isoformat(),
        }

    async def _get_goal(self, goal_id: str, db: Optional[Any]) -> Optional[LearningGoal]:
        """Retrieve goal from database"""
        if not db:
            return None

        from sqlalchemy import text

        result = db.execute(
            text(
                """
                SELECT * FROM brain_learning_goals 
                WHERE goal_id = :goal_id
            """
            ),
            {"goal_id": goal_id},
        ).fetchone()

        if not result:
            return None

        # Convert to LearningGoal object
        from app.core.goal_planner import Milestone

        milestones_data = json.loads(result.milestones) if result.milestones else []
        milestones = [Milestone(**m) for m in milestones_data]

        return LearningGoal(
            goal_id=result.goal_id,
            learner_id=result.learner_id,
            brain_id=result.brain_id,
            goal_type=result.goal_type,
            target_skill=result.target_skill,
            subject=result.subject,
            current_level=result.current_level,
            target_level=result.target_level,
            aligned_iep_goals=(
                json.loads(result.aligned_iep_goals) if result.aligned_iep_goals else []
            ),
            district_standards=(
                json.loads(result.district_standards) if result.district_standards else []
            ),
            estimated_sessions=result.estimated_sessions,
            estimated_weeks=result.estimated_weeks,
            milestones=milestones,
            strategies=(json.loads(result.strategies) if result.strategies else []),
            diagnosis_adaptations=(
                json.loads(result.diagnosis_adaptations) if result.diagnosis_adaptations else {}
            ),
            created_at=result.created_at,
            target_date=result.target_date,
            progress=result.progress,
            status=result.status,
            obstacles=(json.loads(result.obstacles) if result.obstacles else []),
            adaptations_made=[],
            confidence_score=result.confidence,
            reasoning=result.reasoning,
        )
