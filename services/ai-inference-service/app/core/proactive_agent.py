"""
Proactive Agent - Daily Goal Monitoring & Autonomous Interventions
Runs on a schedule to check learner progress and take autonomous actions
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.brain_manager import BrainManager
from app.core.goal_planner import LearningGoal, ProgressEvaluation
from app.core.reasoning_engine import ReasoningEngine

# Configure logging with emoji indicators
logger = logging.getLogger(__name__)


class ProactiveAgent:
    """
    Autonomous agent that proactively monitors learner progress
    and takes interventions without waiting for explicit requests.

    Key capabilities:
    - Daily goal progress checks
    - Automatic difficulty adjustments
    - Autonomous hint generation
    - Engagement monitoring
    - Parent/teacher notifications
    - Goal plan modifications
    """

    def __init__(self):
        self.brain_manager = BrainManager()
        self.reasoning_engine = ReasoningEngine()
        logger.info("🤖 ProactiveAgent initialized")

    async def run_daily_monitoring_cycle(self, db: Session) -> Dict[str, Any]:
        """
        Main entry point: Run daily monitoring for all active learners

        This should be called by a scheduler (e.g., cron job, celery beat)
        once per day to check all learners with active goals.

        Args:
            db: Database session

        Returns:
            Summary of monitoring cycle results
        """
        logger.info("🔄 Starting daily monitoring cycle...")
        cycle_start = datetime.utcnow()

        # Get all learners with active goals
        active_learners = await self._get_learners_with_active_goals(db)
        logger.info(f"📊 Found {len(active_learners)} learners with active goals")

        results = {
            "cycle_start": cycle_start.isoformat(),
            "learners_monitored": 0,
            "goals_evaluated": 0,
            "interventions_taken": 0,
            "notifications_sent": 0,
            "errors": [],
        }

        # Process each learner
        for learner_data in active_learners:
            try:
                learner_result = await self._monitor_learner(
                    learner_id=learner_data["learner_id"],
                    brain_id=learner_data["brain_id"],
                    db=db,
                )

                results["learners_monitored"] += 1
                results["goals_evaluated"] += learner_result["goals_evaluated"]
                results["interventions_taken"] += learner_result["interventions_taken"]
                results["notifications_sent"] += learner_result["notifications_sent"]

            except Exception as e:
                logger.error(f"❌ Error monitoring learner {learner_data['learner_id']}: {e}")
                results["errors"].append(
                    {
                        "learner_id": learner_data["learner_id"],
                        "error": str(e),
                    }
                )

        cycle_end = datetime.utcnow()
        results["cycle_end"] = cycle_end.isoformat()
        results["duration_seconds"] = (cycle_end - cycle_start).total_seconds()

        # Log summary
        logger.info(
            f"✅ Daily cycle complete: {results['learners_monitored']} learners, "
            f"{results['goals_evaluated']} goals, "
            f"{results['interventions_taken']} interventions"
        )

        # Store cycle results
        await self._store_cycle_results(db, results)

        return results

    async def _monitor_learner(self, learner_id: str, brain_id: str, db: Session) -> Dict[str, Any]:
        """
        Monitor a single learner's progress and take actions

        Args:
            learner_id: Learner ID
            brain_id: Brain ID
            db: Database session

        Returns:
            Summary of monitoring results for this learner
        """
        logger.info(f"🔍 Monitoring learner {learner_id}...")

        result = {
            "learner_id": learner_id,
            "goals_evaluated": 0,
            "interventions_taken": 0,
            "notifications_sent": 0,
        }

        # Get learner's active goals
        active_goals = await self._get_active_goals(learner_id, db)

        # Get recent interactions (last 7 days)
        recent_interactions = await self._get_recent_interactions(learner_id, days=7, db=db)

        # Evaluate each goal
        for goal_data in active_goals:
            try:
                goal = self._dict_to_learning_goal(goal_data)

                # Evaluate progress
                evaluation = await self.brain_manager.evaluate_goal_progress(
                    learner_id=learner_id,
                    goal_id=goal.goal_id,
                    recent_interactions=recent_interactions,
                    db=db,
                )

                result["goals_evaluated"] += 1

                # Take autonomous actions based on evaluation
                interventions = await self._decide_and_act(
                    learner_id=learner_id,
                    brain_id=brain_id,
                    goal=goal,
                    evaluation=evaluation["evaluation"],
                    recent_interactions=recent_interactions,
                    db=db,
                )

                result["interventions_taken"] += len(interventions)

                # Send notifications if needed
                notifications = await self._send_notifications(
                    learner_id=learner_id,
                    goal=goal,
                    evaluation=evaluation["evaluation"],
                    interventions=interventions,
                    db=db,
                )

                result["notifications_sent"] += len(notifications)

            except Exception as e:
                logger.error(f"❌ Error evaluating goal {goal_data.get('goal_id')}: {e}")

        return result

    async def _decide_and_act(
        self,
        learner_id: str,
        brain_id: str,
        goal: LearningGoal,
        evaluation: Dict[str, Any],
        recent_interactions: List[Dict[str, Any]],
        db: Session,
    ) -> List[Dict[str, Any]]:
        """
        Use ReasoningEngine to decide what actions to take, then execute them

        Args:
            learner_id: Learner ID
            brain_id: Brain ID
            goal: Learning goal being evaluated
            evaluation: Progress evaluation results
            recent_interactions: Recent session data
            db: Database session

        Returns:
            List of interventions taken
        """
        interventions = []

        # Build context for reasoning
        situation = {
            "goal": {
                "target_skill": goal.target_skill,
                "progress": evaluation["progress_score"],
                "on_track": evaluation["on_track"],
                "obstacles": evaluation["obstacles_detected"],
            },
            "recent_performance": {
                "sessions": len(recent_interactions),
                "trend": evaluation["performance_trends"]["trend"],
            },
        }

        # Use reasoning engine to decide
        question = f"What interventions should I take for learner {learner_id} on goal '{goal.target_skill}'?"

        reasoning_result = await self.reasoning_engine.reason_and_decide(
            question=question,
            context=situation,
            available_actions=[
                "adjust_difficulty",
                "modify_goal",
                "provide_encouragement",
                "suggest_break",
                "notify_teacher",
                "create_remedial_plan",
            ],
        )

        logger.info(f"🧠 Reasoning complete: {reasoning_result.get('final_answer', 'No action')}")

        # Execute recommended actions
        for action in reasoning_result.get("recommended_actions", []):
            intervention = await self._execute_intervention(
                learner_id=learner_id,
                brain_id=brain_id,
                goal=goal,
                action_type=action,
                reasoning=reasoning_result.get("reasoning_trace", ""),
                db=db,
            )
            interventions.append(intervention)

        return interventions

    async def _execute_intervention(
        self,
        learner_id: str,
        brain_id: str,
        goal: LearningGoal,
        action_type: str,
        reasoning: str,
        db: Session,
    ) -> Dict[str, Any]:
        """
        Execute a specific intervention action

        Args:
            learner_id: Learner ID
            brain_id: Brain ID
            goal: Learning goal
            action_type: Type of intervention
            reasoning: Reasoning for the action
            db: Database session

        Returns:
            Intervention record
        """
        logger.info(f"🎯 Executing intervention: {action_type} for {learner_id}")

        intervention = {
            "intervention_id": f"int_{datetime.utcnow().timestamp()}",
            "learner_id": learner_id,
            "brain_id": brain_id,
            "goal_id": goal.goal_id,
            "action_type": action_type,
            "reasoning": reasoning,
            "executed_at": datetime.utcnow().isoformat(),
            "result": None,
        }

        try:
            if action_type == "adjust_difficulty":
                result = await self._adjust_difficulty(learner_id, goal, db)
                intervention["result"] = result

            elif action_type == "modify_goal":
                result = await self._modify_goal(goal, db)
                intervention["result"] = result

            elif action_type == "provide_encouragement":
                result = await self._generate_encouragement(learner_id, goal, db)
                intervention["result"] = result

            elif action_type == "suggest_break":
                result = await self._suggest_break(learner_id, db)
                intervention["result"] = result

            elif action_type == "notify_teacher":
                result = await self._notify_teacher(learner_id, goal, db)
                intervention["result"] = result

            elif action_type == "create_remedial_plan":
                result = await self._create_remedial_plan(learner_id, goal, db)
                intervention["result"] = result

            # Store intervention in database
            await self._store_intervention(db, intervention)

            logger.info(f"✅ Intervention {action_type} completed")

        except Exception as e:
            logger.error(f"❌ Intervention {action_type} failed: {e}")
            intervention["result"] = {"status": "failed", "error": str(e)}

        return intervention

    # Intervention implementations

    async def _adjust_difficulty(
        self, learner_id: str, goal: LearningGoal, db: Session
    ) -> Dict[str, Any]:
        """Adjust difficulty level for upcoming sessions"""
        # Update goal's strategies to include difficulty adjustment
        adjustment = {
            "action": "difficulty_adjusted",
            "new_level": "easier" if goal.progress < 50 else "harder",
            "timestamp": datetime.utcnow().isoformat(),
        }

        db.execute(
            text(
                """
                UPDATE brain_learning_goals
                SET diagnosis_adaptations = json_set(
                    diagnosis_adaptations, 
                    '$.difficulty_adjustment', 
                    :adjustment
                )
                WHERE goal_id = :goal_id
            """
            ),
            {"goal_id": goal.goal_id, "adjustment": json.dumps(adjustment)},
        )
        db.commit()

        return adjustment

    async def _modify_goal(self, goal: LearningGoal, db: Session) -> Dict[str, Any]:
        """Modify goal parameters (e.g., extend timeline)"""
        # Extend target date by 1 week
        current_target = datetime.fromisoformat(goal.target_date)
        new_target = current_target + timedelta(weeks=1)

        db.execute(
            text(
                """
                UPDATE brain_learning_goals
                SET target_date = :new_target,
                    status = 'adjusted'
                WHERE goal_id = :goal_id
            """
            ),
            {"goal_id": goal.goal_id, "new_target": new_target.isoformat()},
        )
        db.commit()

        return {
            "action": "goal_extended",
            "old_target": goal.target_date,
            "new_target": new_target.isoformat(),
        }

    async def _generate_encouragement(
        self, learner_id: str, goal: LearningGoal, db: Session
    ) -> Dict[str, Any]:
        """Generate personalized encouragement message"""
        message = f"Great effort on {goal.target_skill}! Keep going!"

        # Store in messages/notifications table (simplified)
        return {
            "action": "encouragement_sent",
            "message": message,
            "learner_id": learner_id,
        }

    async def _suggest_break(self, learner_id: str, db: Session) -> Dict[str, Any]:
        """Suggest learner take a break"""
        return {
            "action": "break_suggested",
            "learner_id": learner_id,
            "message": "Time for a break! You've been working hard.",
        }

    async def _notify_teacher(
        self, learner_id: str, goal: LearningGoal, db: Session
    ) -> Dict[str, Any]:
        """Notify teacher about learner needing attention"""
        notification = {
            "type": "teacher_alert",
            "learner_id": learner_id,
            "goal": goal.target_skill,
            "message": f"Learner needs additional support on {goal.target_skill}",
        }

        # In production, send to notification service
        logger.info(f"📧 Teacher notification: {notification['message']}")

        return notification

    async def _create_remedial_plan(
        self, learner_id: str, goal: LearningGoal, db: Session
    ) -> Dict[str, Any]:
        """Create a remedial learning plan"""
        # Create simplified version of current goal
        remedial_goal = {
            "original_goal": goal.goal_id,
            "target_skill": f"Foundation for {goal.target_skill}",
            "target_level": goal.current_level + 0.5,  # Half step up
            "strategies": ["Review fundamentals", "Practice basics"],
        }

        return {
            "action": "remedial_plan_created",
            "plan": remedial_goal,
        }

    async def _send_notifications(
        self,
        learner_id: str,
        goal: LearningGoal,
        evaluation: Dict[str, Any],
        interventions: List[Dict[str, Any]],
        db: Session,
    ) -> List[Dict[str, Any]]:
        """Send notifications to parents/teachers if needed"""
        notifications = []

        # Notify if learner is significantly behind
        if not evaluation["on_track"] and evaluation["progress_score"] < 40:
            notifications.append(
                {
                    "type": "parent_alert",
                    "learner_id": learner_id,
                    "message": f"Learner needs help with {goal.target_skill}",
                }
            )

        # Notify if learner excelling
        if evaluation["progress_score"] > 90:
            notifications.append(
                {
                    "type": "parent_praise",
                    "learner_id": learner_id,
                    "message": f"Excellent progress on {goal.target_skill}!",
                }
            )

        # Log notifications (in production, send to notification service)
        for notification in notifications:
            logger.info(f"📧 Notification: {notification['message']}")

        return notifications

    # Database helper methods

    async def _get_learners_with_active_goals(self, db: Session) -> List[Dict[str, Any]]:
        """Get all learners with active learning goals"""
        result = db.execute(
            text(
                """
                SELECT DISTINCT learner_id, brain_id
                FROM brain_learning_goals
                WHERE status = 'active'
                AND target_date >= :today
            """
            ),
            {"today": datetime.utcnow().isoformat()},
        ).fetchall()

        return [{"learner_id": r[0], "brain_id": r[1]} for r in result]

    async def _get_active_goals(self, learner_id: str, db: Session) -> List[Dict[str, Any]]:
        """Get active goals for a learner"""
        result = db.execute(
            text(
                """
                SELECT *
                FROM brain_learning_goals
                WHERE learner_id = :learner_id
                AND status = 'active'
            """
            ),
            {"learner_id": learner_id},
        ).fetchall()

        return [dict(row._mapping) for row in result]

    async def _get_recent_interactions(
        self, learner_id: str, days: int, db: Session
    ) -> List[Dict[str, Any]]:
        """Get recent interactions for a learner"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # This assumes a homework_sessions or similar table exists
        result = db.execute(
            text(
                """
                SELECT *
                FROM homework_sessions
                WHERE learner_id = :learner_id
                AND created_at >= :cutoff
                ORDER BY created_at DESC
            """
            ),
            {"learner_id": learner_id, "cutoff": cutoff_date.isoformat()},
        ).fetchall()

        return [dict(row._mapping) for row in result]

    def _dict_to_learning_goal(self, goal_data: Dict[str, Any]) -> LearningGoal:
        """Convert database dict to LearningGoal object"""
        from app.core.goal_planner import Milestone

        milestones_data = json.loads(goal_data["milestones"]) if goal_data["milestones"] else []
        milestones = [Milestone(**m) for m in milestones_data]

        return LearningGoal(
            goal_id=goal_data["goal_id"],
            learner_id=goal_data["learner_id"],
            brain_id=goal_data["brain_id"],
            goal_type=goal_data["goal_type"],
            target_skill=goal_data["target_skill"],
            subject=goal_data["subject"],
            current_level=goal_data["current_level"],
            target_level=goal_data["target_level"],
            aligned_iep_goals=(
                json.loads(goal_data["aligned_iep_goals"]) if goal_data["aligned_iep_goals"] else []
            ),
            district_standards=(
                json.loads(goal_data["district_standards"])
                if goal_data["district_standards"]
                else []
            ),
            estimated_sessions=goal_data["estimated_sessions"],
            estimated_weeks=goal_data["estimated_weeks"],
            milestones=milestones,
            strategies=(json.loads(goal_data["strategies"]) if goal_data["strategies"] else []),
            diagnosis_adaptations=(
                json.loads(goal_data["diagnosis_adaptations"])
                if goal_data["diagnosis_adaptations"]
                else {}
            ),
            created_at=goal_data["created_at"],
            target_date=goal_data["target_date"],
            progress=goal_data["progress"],
            status=goal_data["status"],
            obstacles=(json.loads(goal_data["obstacles"]) if goal_data["obstacles"] else []),
            adaptations_made=[],
            confidence_score=goal_data["confidence"],
            reasoning=goal_data["reasoning"],
        )

    async def _store_intervention(self, db: Session, intervention: Dict[str, Any]) -> None:
        """Store intervention in database"""
        db.execute(
            text(
                """
                INSERT INTO brain_interventions (
                    intervention_id, learner_id, brain_id, goal_id,
                    action_type, reasoning, result, executed_at
                ) VALUES (
                    :intervention_id, :learner_id, :brain_id, :goal_id,
                    :action_type, :reasoning, :result, :executed_at
                )
            """
            ),
            {
                "intervention_id": intervention["intervention_id"],
                "learner_id": intervention["learner_id"],
                "brain_id": intervention["brain_id"],
                "goal_id": intervention["goal_id"],
                "action_type": intervention["action_type"],
                "reasoning": intervention["reasoning"],
                "result": json.dumps(intervention["result"]),
                "executed_at": intervention["executed_at"],
            },
        )
        db.commit()

    async def _store_cycle_results(self, db: Session, results: Dict[str, Any]) -> None:
        """Store monitoring cycle results"""
        db.execute(
            text(
                """
                INSERT INTO brain_autonomous_cycles (
                    cycle_id, cycle_type, started_at, completed_at,
                    learners_processed, goals_evaluated, interventions_taken,
                    duration_seconds, results
                ) VALUES (
                    :cycle_id, :cycle_type, :started_at, :completed_at,
                    :learners_processed, :goals_evaluated, :interventions_taken,
                    :duration_seconds, :results
                )
            """
            ),
            {
                "cycle_id": f"cycle_{datetime.utcnow().timestamp()}",
                "cycle_type": "daily_monitoring",
                "started_at": results["cycle_start"],
                "completed_at": results["cycle_end"],
                "learners_processed": results["learners_monitored"],
                "goals_evaluated": results["goals_evaluated"],
                "interventions_taken": results["interventions_taken"],
                "duration_seconds": results["duration_seconds"],
                "results": json.dumps(results),
            },
        )
        db.commit()


# Standalone function for scheduler integration
async def run_daily_monitoring(db: Session) -> Dict[str, Any]:
    """
    Convenience function for scheduler (celery, cron, etc.)

    Usage with Celery:
        @celery.task
        def daily_monitoring():
            from app.core.proactive_agent import run_daily_monitoring
            from app.database import get_db
            db = next(get_db())
            result = asyncio.run(run_daily_monitoring(db))
            return result
    """
    agent = ProactiveAgent()
    return await agent.run_daily_monitoring_cycle(db)
