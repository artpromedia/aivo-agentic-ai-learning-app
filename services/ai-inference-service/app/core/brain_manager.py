"""Brain instance management with federated learning and agentic AI."""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

import redis

from app.core.config import settings
from app.core.goal_planner import GoalPlanner, LearnerState, LearningGoal
from app.models.brain_instance import BrainInstance, BrainStatus, LearningProfile

# Conditional imports for agentic components (only if enabled)
if settings.ENABLE_AGENTIC_MODE:
    from app.core.brain_memory import BrainMemory
    from app.core.realtime_proactive_agent import ProactiveAgent
    from app.core.reasoning_engine_v2 import ReasoningEngine
    from app.core.tool_executor import ToolExecutor

logger = logging.getLogger(__name__)


class BrainManager:
    """Manages brain instance lifecycle, cloning, adaptation, and agentic capabilities."""

    def __init__(self):
        """Initialize brain manager with Redis connection and optional agentic components."""
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.base_model_name = settings.BASE_MODEL_NAME
        self.base_model_version = settings.BASE_MODEL_VERSION
        self.goal_planner = GoalPlanner()  # Always initialized for goal setting

        # Initialize agentic components if enabled
        if settings.ENABLE_AGENTIC_MODE:
            self.reasoning_engine = ReasoningEngine()
            self.tool_executor = ToolExecutor()
            self.brain_memory = BrainMemory()
            self.proactive_agent = ProactiveAgent()
            logger.info("🧠 Agentic mode ENABLED - Full autonomous capabilities active")
        else:
            self.reasoning_engine = None
            self.tool_executor = None
            self.brain_memory = None
            self.proactive_agent = None
            logger.info("📝 Agentic mode DISABLED - Using standard brain management")

    async def get_or_create_brain(
        self, learner_id: str, learning_profile: LearningProfile, db: Optional[Any] = None
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
            brain = self._create_generic_brain(learner_id, learning_profile)
            # Initialize agentic features for new brain
            if settings.ENABLE_AGENTIC_MODE:
                await self._initialize_agentic_brain(brain, db)
            return brain

        # Clone a new brain
        brain = self._clone_brain(learner_id, learning_profile)
        brain.status = BrainStatus.ACTIVE
        self._cache_brain(brain)

        # Initialize agentic features for new brain
        if settings.ENABLE_AGENTIC_MODE:
            await self._initialize_agentic_brain(brain, db)

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

    # ============================================================================
    # AGENTIC AI INTEGRATION METHODS
    # ============================================================================

    async def run_autonomous_cycle(
        self,
        brain_id: str,
        trigger: str = "scheduled",
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Main agentic loop - runs periodically or on-demand.

        This is the core autonomous operation that happens regularly
        (every 24 hours) or can be triggered manually.

        Steps:
        1. Get brain instance
        2. Collect recent session data (last 7 days)
        3. Reflect on recent sessions (ReasoningEngine)
        4. Store reflection in memory (BrainMemory)
        5. Analyze learner state (GoalPlanner)
        6. Check if goals need updating
        7. Generate/update goals if needed
        8. Evaluate progress on active goals
        9. Check for proactive intervention needs
        10. Log all autonomous actions

        Args:
            brain_id: Brain instance ID
            trigger: Reason for cycle ("scheduled", "manual", "milestone")
            db: Database session for persistence

        Returns:
            Summary of actions taken

        Example:
            >>> result = await manager.run_autonomous_cycle(
            ...     "brain_123",
            ...     trigger="scheduled"
            ... )
            >>> print(f"Goals updated: {result['goals_generated']}")
        """
        if not settings.ENABLE_AGENTIC_MODE:
            return {"status": "disabled", "message": "Agentic mode not enabled"}

        logger.info(f"🔄 Starting autonomous cycle for {brain_id} (trigger: {trigger})")
        actions_taken = {
            "brain_id": brain_id,
            "trigger": trigger,
            "timestamp": datetime.utcnow().isoformat(),
            "goals_generated": 0,
            "reflections_stored": 0,
            "patterns_extracted": 0,
            "interventions_suggested": 0,
            "memory_updated": False,
            "actions": [],
        }

        try:
            # Step 1: Get brain instance
            brain = self._get_brain_by_id(brain_id)
            if not brain:
                raise ValueError(f"Brain {brain_id} not found")

            # Step 2: Collect recent session data (last 7 days)
            recent_sessions = await self._fetch_recent_sessions(brain_id, days=7, db=db)
            actions_taken["sessions_analyzed"] = len(recent_sessions)

            # Step 3: Reflect on recent sessions
            if recent_sessions and self.reasoning_engine:
                reflection = await self.reasoning_engine.reflect_on_session(
                    brain_id=brain_id,
                    session_data={
                        "sessions": recent_sessions,
                        "learner_profile": brain.learning_profile.model_dump(),
                    },
                    db=db,
                )
                actions_taken["reflections_stored"] = 1
                actions_taken["actions"].append(
                    {"type": "reflection", "summary": reflection.get("summary", "")}
                )

                # Step 4: Store reflection in memory
                if self.brain_memory:
                    await self.brain_memory.store_episode(
                        brain_id=brain_id,
                        episode={
                            "event_type": "autonomous_reflection",
                            "context": {"trigger": trigger, "sessions_count": len(recent_sessions)},
                            "outcome": "reflected",
                            "lessons_learned": reflection.get("insights", []),
                        },
                        db=db,
                    )
                    actions_taken["memory_updated"] = True

            # Step 5: Analyze learner state
            learner_state = await self.goal_planner.analyze_learner_state(
                brain=brain,
                recent_sessions=recent_sessions,
                iep_goals=await self._fetch_iep_goals(brain.learner_id, db),
                assessment_data=await self._fetch_assessments(brain.learner_id, db),
            )

            # Step 6 & 7: Check if goals need updating and generate if needed
            active_goals = await self._fetch_active_goals(brain_id, db)
            should_update_goals = self._should_update_goals(active_goals, learner_state)

            if should_update_goals:
                new_goals = await self.goal_planner.generate_learning_goals(
                    brain=brain,
                    learner_state=learner_state,
                    time_horizon=settings.AGENTIC_GOAL_TIME_HORIZON,
                    max_goals=settings.AGENTIC_MAX_GOALS_PER_BRAIN,
                    db=db,
                )
                actions_taken["goals_generated"] = len(new_goals)
                actions_taken["actions"].append(
                    {
                        "type": "goal_generation",
                        "count": len(new_goals),
                        "goals": [g.target_skill for g in new_goals],
                    }
                )

            # Step 8: Evaluate progress on active goals
            for goal in active_goals:
                evaluation = await self.goal_planner.evaluate_goal_progress(
                    brain=brain, goal=goal, recent_interactions=recent_sessions, db=db
                )
                if evaluation.get("needs_adjustment"):
                    actions_taken["actions"].append(
                        {
                            "type": "goal_adjustment",
                            "goal_id": goal.goal_id,
                            "reason": evaluation.get("reason", ""),
                        }
                    )

            # Step 9: Extract patterns from memory
            if self.brain_memory and recent_sessions:
                patterns = await self.brain_memory.extract_patterns(
                    brain_id=brain_id,
                    episodes=await self.brain_memory.get_recent_episodes(brain_id, limit=20, db=db),
                    db=db,
                )
                actions_taken["patterns_extracted"] = len(patterns)

            # Step 10: Log completion
            logger.info(
                f"✅ Autonomous cycle complete for {brain_id}: "
                f"{actions_taken['goals_generated']} goals, "
                f"{actions_taken['reflections_stored']} reflections"
            )

            # Update brain's last cycle timestamp
            brain.adaptation_context["last_autonomous_cycle"] = datetime.utcnow()
            self._cache_brain(brain)

            return actions_taken

        except Exception as e:
            logger.error(f"❌ Autonomous cycle failed for {brain_id}: {str(e)}")
            actions_taken["error"] = str(e)
            actions_taken["status"] = "failed"
            return actions_taken

    async def make_decision(
        self,
        brain_id: str,
        decision_type: str,
        context: Dict[str, Any],
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Unified decision-making interface using reasoning engine.

        This method provides a single entry point for all autonomous
        decisions the brain makes. Uses ReAct reasoning pattern.

        Decision types:
        - "intervention": Should I help? How?
        - "difficulty": Should I adjust difficulty?
        - "goal_adjustment": Should I modify goals?
        - "tool_use": Should I use a tool?

        Args:
            brain_id: Brain instance ID
            decision_type: Type of decision to make
            context: Situation context (varies by type)
            db: Database session

        Returns:
            Decision with reasoning trace

        Example:
            >>> decision = await manager.make_decision(
            ...     "brain_123",
            ...     "intervention",
            ...     {"errors": 3, "frustration": "medium"}
            ... )
            >>> print(decision["final_decision"]["action"])
        """
        if not settings.ENABLE_AGENTIC_MODE or not self.reasoning_engine:
            return {
                "status": "disabled",
                "decision": "no_action",
                "reason": "Agentic mode not enabled",
            }

        logger.info(f"🤔 Making decision: {decision_type} for {brain_id}")

        # Add brain context
        brain = self._get_brain_by_id(brain_id)
        if brain:
            context["learner_profile"] = brain.learning_profile.model_dump()

        # Recall relevant memories to inform decision
        if self.brain_memory:
            relevant_memories = await self.brain_memory.recall_relevant_memories(
                brain_id=brain_id, query=f"{decision_type}: {str(context)[:100]}", limit=5, db=db
            )
            context["relevant_memories"] = [m.model_dump() for m in relevant_memories]

        # Make decision using reasoning engine
        if decision_type == "intervention":
            decision = await self.reasoning_engine.reason_about_intervention(
                brain_id=brain_id, situation=context, db=db
            )
        else:
            # Generic reasoning for other decision types
            decision = await self.reasoning_engine.reason(
                brain_id=brain_id,
                task=f"decide_{decision_type}",
                context=context,
                max_steps=5,
                db=db,
            )

        # Store decision in memory for future reference
        if self.brain_memory:
            await self.brain_memory.store_episode(
                brain_id=brain_id,
                episode={
                    "event_type": f"decision_{decision_type}",
                    "context": context,
                    "outcome": decision.get("final_decision", {}).get("action", "unknown"),
                    "lessons_learned": [decision.get("reasoning", "")],
                },
                db=db,
            )

        return decision

    async def on_session_start(
        self,
        brain_id: str,
        session_id: str,
        context: Dict[str, Any],
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Hook called when learner starts a new session.

        Initializes proactive monitoring if enabled.

        Args:
            brain_id: Brain instance ID
            session_id: Session ID
            context: Session context (subject, difficulty, etc.)
            db: Database session

        Returns:
            Monitoring status
        """
        logger.info(f"▶️ Session starting: {session_id} for {brain_id}")

        if not settings.ENABLE_AGENTIC_MODE or not self.proactive_agent:
            return {"monitoring": False, "reason": "Agentic mode not enabled"}

        # Start proactive monitoring
        if settings.AGENTIC_PROACTIVE_MONITORING:
            policy = await self._get_intervention_policy(brain_id, db)
            monitoring_status = await self.proactive_agent.start_monitoring(
                brain_id=brain_id, session_id=session_id, policy=policy, db=db
            )
            return monitoring_status

        return {"monitoring": False}

    async def on_session_end(
        self,
        brain_id: str,
        session_id: str,
        session_data: Dict[str, Any],
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Hook called when learner ends a session.

        Triggers reflection and memory storage.

        Args:
            brain_id: Brain instance ID
            session_id: Session ID
            session_data: Complete session data
            db: Database session

        Returns:
            Post-session actions taken
        """
        logger.info(f"⏹️ Session ending: {session_id} for {brain_id}")

        actions = {
            "session_id": session_id,
            "reflected": False,
            "memory_stored": False,
            "monitoring_stopped": False,
        }

        if not settings.ENABLE_AGENTIC_MODE:
            return actions

        try:
            # Stop monitoring
            if self.proactive_agent:
                await self.proactive_agent.stop_monitoring(brain_id, session_id, db)
                actions["monitoring_stopped"] = True

            # Reflect on session
            if self.reasoning_engine and session_data.get("completed"):
                reflection = await self.reasoning_engine.reflect_on_session(
                    brain_id=brain_id, session_data=session_data, db=db
                )
                actions["reflected"] = True
                actions["insights"] = reflection.get("insights", [])

            # Store important episodes
            if self.brain_memory:
                # Determine if session is important enough to remember
                importance = self._calculate_session_importance(session_data)
                if importance > 0.5:  # Threshold for storage
                    await self.brain_memory.store_episode(
                        brain_id=brain_id,
                        episode={
                            "event_type": "session_completed",
                            "context": session_data,
                            "outcome": "completed",
                            "importance": importance,
                            "lessons_learned": actions.get("insights", []),
                        },
                        db=db,
                    )
                    actions["memory_stored"] = True

        except Exception as e:
            logger.error(f"Error in session end hook: {str(e)}")
            actions["error"] = str(e)

        return actions

    async def on_hint_given(
        self,
        brain_id: str,
        hint_data: Dict[str, Any],
        db: Optional[Any] = None,
    ) -> None:
        """
        Hook called when a hint is given to learner.

        Records effectiveness for learning.

        Args:
            brain_id: Brain instance ID
            hint_data: Hint and context
            db: Database session
        """
        if not settings.ENABLE_AGENTIC_MODE or not self.brain_memory:
            return

        # Store hint event for pattern learning
        await self.brain_memory.store_episode(
            brain_id=brain_id,
            episode={
                "event_type": "hint_provided",
                "context": hint_data,
                "outcome": "pending",  # Will be updated when we see result
                "lessons_learned": [],
            },
            db=db,
        )

    async def on_error(
        self,
        brain_id: str,
        error_data: Dict[str, Any],
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Hook called when learner makes an error.

        Checks if intervention needed.

        Args:
            brain_id: Brain instance ID
            error_data: Error and context
            db: Database session

        Returns:
            Intervention decision if applicable
        """
        if not settings.ENABLE_AGENTIC_MODE:
            return {"intervention": False}

        # Check if pattern indicates intervention needed
        if self.proactive_agent:
            should_intervene = await self.proactive_agent.detect_triggers(
                brain_id=brain_id, current_state=error_data, db=db
            )

            if should_intervene:
                decision = await self.make_decision(
                    brain_id=brain_id, decision_type="intervention", context=error_data, db=db
                )
                return {"intervention": True, "decision": decision}

        return {"intervention": False}

    # ============================================================================
    # HELPER METHODS FOR AGENTIC OPERATIONS
    # ============================================================================

    async def _initialize_agentic_brain(
        self,
        brain: BrainInstance,
        db: Optional[Any] = None,
    ) -> None:
        """Initialize agentic capabilities for new brain."""
        if not settings.ENABLE_AGENTIC_MODE:
            return

        logger.info(f"🎯 Initializing agentic features for {brain.brain_id}")

        try:
            # 1. Analyze initial state
            learner_state = await self.goal_planner.analyze_learner_state(
                brain=brain,
                recent_sessions=[],  # No history yet
                iep_goals=await self._fetch_iep_goals(brain.learner_id, db),
                assessment_data=await self._fetch_assessments(brain.learner_id, db),
            )

            # 2. Generate initial goals (2 baseline goals)
            initial_goals = await self.goal_planner.generate_learning_goals(
                brain=brain, learner_state=learner_state, time_horizon="2_weeks", max_goals=2, db=db
            )

            # 3. Initialize memory system
            if self.brain_memory:
                await self.brain_memory.initialize_brain(brain.brain_id, db)

            # 4. Set initial intervention policy
            if self.tool_executor:
                await self.tool_executor.initialize_policy(brain.brain_id, db)

            # Update brain context
            brain.adaptation_context["agentic_initialized"] = True
            brain.adaptation_context["initial_goals_count"] = len(initial_goals)
            self._cache_brain(brain)

            logger.info(f"✅ Agentic brain ready with {len(initial_goals)} initial goals")

        except Exception as e:
            logger.error(f"Failed to initialize agentic brain: {str(e)}")
            raise

    def _calculate_session_importance(self, session_data: Dict[str, Any]) -> float:
        """
        Calculate how important a session is for memory storage.

        Factors:
        - Breakthrough moments (high importance)
        - Significant struggles (medium importance)
        - Routine completion (low importance)
        """
        importance = 0.0

        # High success rate = potential breakthrough
        if session_data.get("success_rate", 0) > 0.9:
            importance += 0.4

        # High error rate = struggle to learn from
        if session_data.get("error_rate", 0) > 0.5:
            importance += 0.3

        # Long session = engagement
        if session_data.get("duration_minutes", 0) > 30:
            importance += 0.2

        # Hint effectiveness data valuable
        if session_data.get("hints_used", 0) > 0:
            importance += 0.1

        return min(importance, 1.0)

    def _should_update_goals(self, active_goals: List[LearningGoal], learner_state: Any) -> bool:
        """Determine if goals need updating."""
        # No active goals = definitely need some
        if not active_goals:
            return True

        # Too few goals
        if len(active_goals) < 2:
            return True

        # Check if goals are stale (older than time horizon)
        oldest_goal = min(active_goals, key=lambda g: g.created_at)
        age_days = (datetime.utcnow() - oldest_goal.created_at).days
        if age_days > 14:  # 2 weeks
            return True

        # Check if learner state has changed significantly
        # (This would need more sophisticated logic in production)

        return False

    async def _fetch_recent_sessions(
        self, brain_id: str, days: int = 7, db: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """Fetch recent session data."""
        if not db:
            return []

        from datetime import timedelta

        from sqlalchemy import text

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # This is a placeholder - adjust to your actual schema
        result = db.execute(
            text("""
                SELECT * FROM learning_sessions
                WHERE brain_id = :brain_id
                AND created_at > :cutoff_date
                ORDER BY created_at DESC
            """),
            {"brain_id": brain_id, "cutoff_date": cutoff_date},
        ).fetchall()

        return [dict(row) for row in result]

    async def _fetch_active_goals(
        self, brain_id: str, db: Optional[Any] = None
    ) -> List[LearningGoal]:
        """Fetch active goals for brain."""
        if not db:
            return []

        from sqlalchemy import text

        result = db.execute(
            text("""
                SELECT * FROM brain_learning_goals
                WHERE brain_id = :brain_id
                AND status = 'active'
                ORDER BY created_at DESC
            """),
            {"brain_id": brain_id},
        ).fetchall()

        # Convert to LearningGoal objects (simplified)
        goals = []
        for row in result:
            goal = await self._get_goal(row.goal_id, db)
            if goal:
                goals.append(goal)

        return goals

    async def _fetch_iep_goals(
        self, learner_id: str, db: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """Fetch IEP goals for learner."""
        # Placeholder - implement based on your IEP data structure
        return []

    async def _fetch_assessments(self, learner_id: str, db: Optional[Any] = None) -> Dict[str, Any]:
        """Fetch assessment data for learner."""
        # Placeholder - implement based on your assessment structure
        return {}

    async def _get_intervention_policy(
        self, brain_id: str, db: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Get intervention policy for brain."""
        # Default policy
        return {
            "autonomy_level": settings.AGENTIC_AUTONOMY_LEVEL,
            "max_interventions_per_session": 5,
            "min_interval_minutes": 3.0,
            "enabled_triggers": [
                "frustration",
                "disengagement",
                "success_momentum",
                "fatigue",
                "stuck",
                "breakthrough",
            ],
        }
