"""Analytics service for generating learner reports and metrics."""
import logging
from typing import Dict, Any, List
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session

from app.models.analytics import DailyMetrics
from app.models.progress import ProgressRecord
from app.models.iep import IEPGoal
from app.models.homework import HomeworkSession
from app.models.regulation import EmotionHistory

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics calculations and report generation."""

    def __init__(self, db: Session):
        """Initialize analytics service."""
        self.db = db

    async def get_learner_analytics(
        self,
        learner_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics for a learner.
        
        Args:
            learner_id: Learner UUID
            start_date: Start of period
            end_date: End of period
            
        Returns:
            Dict with engagement, progress, IEP, subjects, focus,
            homework, accommodations, and recommendations
        """
        # Get daily metrics
        daily_metrics = self.db.query(DailyMetrics).filter(
            DailyMetrics.learner_id == learner_id,
            DailyMetrics.date >= start_date,
            DailyMetrics.date <= end_date
        ).all()

        # Calculate engagement metrics
        engagement = self._calculate_engagement(
            daily_metrics,
            start_date,
            end_date
        )

        # Calculate progress metrics
        progress = await self._calculate_progress(
            learner_id,
            start_date,
            end_date
        )

        # Get IEP goal progress
        iep_goals = await self._get_iep_progress(learner_id)

        # Get subject metrics
        subjects = await self._get_subject_metrics(
            learner_id,
            start_date,
            end_date
        )

        # Calculate focus metrics
        focus = self._calculate_focus(daily_metrics)

        # Get homework metrics
        homework = await self._get_homework_metrics(
            learner_id,
            start_date,
            end_date
        )

        # Get accommodation metrics
        accommodations = await self._get_accommodation_metrics(
            learner_id,
            start_date,
            end_date
        )

        # Generate recommendations
        recommendations = self._generate_recommendations(
            engagement,
            progress,
            iep_goals,
            focus
        )

        return {
            "learner_id": learner_id,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "engagement": engagement,
            "progress": progress,
            "iep_goals": iep_goals,
            "subjects": subjects,
            "focus": focus,
            "homework": homework,
            "accommodations": accommodations,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }

    def _calculate_engagement(
        self,
        daily_metrics: List[DailyMetrics],
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Calculate engagement metrics from daily data."""
        if not daily_metrics:
            return {
                "total_sessions": 0,
                "total_minutes": 0,
                "average_session_duration": 0.0,
                "activities_completed": 0,
                "activities_started": 0,
                "completion_rate": 0.0,
                "consecutive_days": 0,
                "last_activity_date": None
            }

        total_sessions = sum(dm.total_sessions for dm in daily_metrics)
        total_minutes = sum(dm.total_minutes for dm in daily_metrics)
        total_activities = sum(dm.activities_completed for dm in daily_metrics)

        # Calculate streak
        streak = 0
        current_date = end_date

        while current_date >= start_date:
            day_metric = next(
                (dm for dm in daily_metrics if dm.date == current_date),
                None
            )

            if day_metric and day_metric.total_sessions > 0:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

        # Last active date
        active_dates = [
            dm.date for dm in daily_metrics if dm.total_sessions > 0
        ]
        last_active = (
            max(active_dates) if active_dates  # type: ignore[type-var]
            else None
        )

        last_activity_str = None
        if last_active:
            combined = datetime.combine(
                last_active,  # type: ignore[arg-type]
                datetime.min.time()
            )
            last_activity_str = combined.isoformat()

        return {
            "total_sessions": total_sessions,
            "total_minutes": total_minutes,
            "average_session_duration": (
                total_minutes / total_sessions if total_sessions > 0 else 0.0
            ),
            "activities_completed": total_activities,
            "activities_started": total_activities,  # Simplified
            "completion_rate": 100.0,  # Simplified
            "consecutive_days": streak,
            "last_activity_date": last_activity_str
        }

    async def _calculate_progress(
        self,
        learner_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Calculate progress metrics."""
        progress_records = self.db.query(ProgressRecord).filter(
            ProgressRecord.learner_id == learner_id,
            ProgressRecord.created_at >= datetime.combine(
                start_date,
                datetime.min.time()
            ),
            ProgressRecord.created_at <= datetime.combine(
                end_date,
                datetime.max.time()
            )
        ).all()

        if not progress_records:
            return {
                "average_score": 0.0,
                "score_trend": "stable",
                "mastery_level": "beginner",
                "skills_mastered": 0,
                "skills_in_progress": 0,
                "recent_achievements": []
            }

        # Calculate average score
        scores = [pr.score for pr in progress_records if pr.score is not None]
        avg_score = sum(scores) / len(scores) if scores else 0.0

        # Calculate trend
        if len(scores) >= 2:
            recent_avg = sum(scores[-5:]) / len(scores[-5:])
            older_avg = sum(scores[:5]) / min(5, len(scores[:5]))

            if recent_avg > older_avg + 5:
                trend = "improving"
            elif recent_avg < older_avg - 5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Determine mastery level
        if avg_score >= 90:
            mastery = "advanced"
        elif avg_score >= 75:
            mastery = "proficient"
        elif avg_score >= 60:
            mastery = "developing"
        else:
            mastery = "beginner"

        return {
            "average_score": round(avg_score, 1),
            "score_trend": trend,
            "mastery_level": mastery,
            "skills_mastered": len([s for s in scores if s >= 85]),
            "skills_in_progress": len([s for s in scores if 60 <= s < 85]),
            "recent_achievements": []
        }

    async def _get_iep_progress(
        self,
        learner_id: str
    ) -> List[Dict[str, Any]]:
        """Get IEP goal progress."""
        goals = self.db.query(IEPGoal).filter(
            IEPGoal.learner_id == learner_id,
            IEPGoal.target_date >= date.today()
        ).all()

        return [
            {
                "goal_id": goal.id,
                "goal_name": goal.goal_name,
                "category": goal.category,
                "current_progress": goal.progress_percentage,
                "target_progress": 100,
                "on_track": goal.status in ["on-track", "exceeding"],
                "data_points_count": len(goal.data_points),
                "last_update": (
                    max(dp.created_at for dp in goal.data_points).isoformat()
                    if goal.data_points else None
                )
            }
            for goal in goals
        ]

    async def _get_subject_metrics(
        self,
        learner_id: str,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """Get subject-specific metrics."""
        progress_records = self.db.query(ProgressRecord).filter(
            ProgressRecord.learner_id == learner_id,
            ProgressRecord.created_at >= datetime.combine(
                start_date,
                datetime.min.time()
            ),
            ProgressRecord.created_at <= datetime.combine(
                end_date,
                datetime.max.time()
            )
        ).all()

        # Group by subject
        subjects: Dict[str, Dict[str, Any]] = {}

        for record in progress_records:
            subject_name = str(record.subject) if record.subject else "Other"

            if subject_name not in subjects:
                subjects[subject_name] = {
                    "subject": subject_name,
                    "activities_completed": 0,
                    "total_score": 0,
                    "scored_activities": 0,
                    "time_spent_minutes": 0,
                    "recent_topics": []
                }

            subjects[subject_name]["activities_completed"] += 1

            if record.score is not None:
                subjects[subject_name]["total_score"] += record.score
                subjects[subject_name]["scored_activities"] += 1

            if record.time_spent_seconds:
                time_mins = record.time_spent_seconds // 60
                subjects[subject_name]["time_spent_minutes"] += time_mins

        # Format results
        result = []

        for subject_data in subjects.values():
            avg_score = (
                subject_data["total_score"] / subject_data["scored_activities"]
                if subject_data["scored_activities"] > 0
                else 0.0
            )

            # Determine mastery level
            if avg_score >= 90:
                mastery = "advanced"
            elif avg_score >= 75:
                mastery = "proficient"
            elif avg_score >= 60:
                mastery = "developing"
            else:
                mastery = "beginner"

            result.append({
                "subject": subject_data["subject"],
                "activities_completed": subject_data["activities_completed"],
                "average_score": round(avg_score, 1),
                "time_spent_minutes": subject_data["time_spent_minutes"],
                "mastery_level": mastery,
                "strengths": [],
                "areas_for_growth": [],
                "recent_topics": []
            })

        return result

    def _calculate_focus(
        self,
        daily_metrics: List[DailyMetrics]
    ) -> Dict[str, Any]:
        """Calculate focus and attention metrics."""
        if not daily_metrics:
            return {
                "distraction_events": 0,
                "average_focus_score": 0.0,
                "game_breaks_used": 0,
                "focus_time_minutes": 0,
                "break_time_minutes": 0,
                "optimal_session_length": 20
            }

        total_distractions = sum(dm.distraction_events for dm in daily_metrics)
        total_game_breaks = sum(dm.game_breaks_used for dm in daily_metrics)
        total_minutes = sum(dm.total_minutes for dm in daily_metrics)

        # Calculate focus score (higher is better, based on distraction rate)
        distraction_rate = total_distractions / len(daily_metrics)
        focus_score = 10.0 - distraction_rate
        avg_focus_score = (
            max(0.0, focus_score)  # type: ignore[type-var]
        )

        return {
            "distraction_events": total_distractions,
            "average_focus_score": round(avg_focus_score, 1),
            "game_breaks_used": total_game_breaks,
            "focus_time_minutes": total_minutes,
            "break_time_minutes": 0,  # Simplified
            "optimal_session_length": 20
        }

    async def _get_homework_metrics(
        self,
        learner_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Get homework helper metrics."""
        sessions = self.db.query(HomeworkSession).filter(
            HomeworkSession.learner_id == learner_id,
            HomeworkSession.created_at >= datetime.combine(
                start_date,
                datetime.min.time()
            ),
            HomeworkSession.created_at <= datetime.combine(
                end_date,
                datetime.max.time()
            )
        ).all()

        if not sessions:
            return {
                "total_sessions": 0,
                "completed_sessions": 0,
                "completion_rate": 0.0,
                "average_session_duration": 0,
                "hints_requested": 0,
                "explanations_requested": 0,
                "photos_uploaded": 0,
                "handwriting_submissions": 0,
                "most_common_subjects": []
            }

        completed = [s for s in sessions if s.status == "completed"]
        total_duration = sum(
            s.duration_seconds for s in sessions if s.duration_seconds
        )
        avg_duration = (
            total_duration // len(sessions) if sessions else 0
        ) // 60

        # Count interaction types
        hints = sum(s.hints_used or 0 for s in sessions)
        explanations = sum(s.explanations_used or 0 for s in sessions)
        photos = sum(
            1 for s in sessions
            if s.input_type == "photo" or s.image_url
        )
        handwriting = sum(
            1 for s in sessions if s.input_type == "handwriting"
        )

        return {
            "total_sessions": len(sessions),
            "completed_sessions": len(completed),
            "completion_rate": (
                len(completed) / len(sessions) * 100 if sessions else 0.0
            ),
            "average_session_duration": avg_duration,
            "hints_requested": hints,
            "explanations_requested": explanations,
            "photos_uploaded": photos,
            "handwriting_submissions": handwriting,
            "most_common_subjects": []
        }

    async def _get_accommodation_metrics(
        self,
        learner_id: str,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Get accommodation usage metrics."""
        # Get emotion history
        emotions = self.db.query(EmotionHistory).filter(
            EmotionHistory.learner_id == learner_id,
            EmotionHistory.created_at >= datetime.combine(
                start_date,
                datetime.min.time()
            ),
            EmotionHistory.created_at <= datetime.combine(
                end_date,
                datetime.max.time()
            )
        ).all()

        emotion_levels = [e.level for e in emotions if e.level is not None]
        avg_emotion = (
            sum(emotion_levels) / len(emotion_levels)
            if emotion_levels else 3.0
        )

        # Get daily metrics for regulation activities
        daily_metrics = self.db.query(DailyMetrics).filter(
            DailyMetrics.learner_id == learner_id,
            DailyMetrics.date >= start_date,
            DailyMetrics.date <= end_date
        ).all()

        total_check_ins = sum(dm.emotion_check_ins for dm in daily_metrics)

        return {
            "total_accommodations_active": 0,  # Simplified
            "most_used_accommodations": [],
            "sensory_profile_changes": 0,
            "regulation_activities_completed": 0,
            "emotion_check_ins": total_check_ins,
            "average_emotion_level": round(avg_emotion, 1),
            "accommodation_effectiveness": None
        }

    def _generate_recommendations(
        self,
        engagement: Dict[str, Any],
        progress: Dict[str, Any],
        iep_goals: List[Dict[str, Any]],
        focus: Dict[str, Any]
    ) -> List[str]:
        """Generate personalized recommendations."""
        recommendations = []

        # Engagement recommendations
        if engagement["consecutive_days"] == 0:
            recommendations.append(
                "Try to establish a daily learning routine for consistency"
            )
        elif engagement["consecutive_days"] >= 7:
            recommendations.append(
                "Great job maintaining a 7+ day streak! Keep it up!"
            )

        # Progress recommendations
        if progress["score_trend"] == "declining":
            recommendations.append(
                "Scores trending down - consider adjusting difficulty level"
            )
        elif progress["score_trend"] == "improving":
            recommendations.append(
                "Excellent progress! Consider increasing challenge level"
            )

        # IEP recommendations
        needs_attention = [g for g in iep_goals if not g["on_track"]]
        if needs_attention:
            recommendations.append(
                f"{len(needs_attention)} IEP goal(s) need attention"
            )

        # Focus recommendations
        if focus["distraction_events"] > 10:
            recommendations.append(
                "High distraction rate - try shorter sessions with more breaks"
            )

        return recommendations

    async def generate_export(
        self,
        learner_id: str,
        start_date: date,
        end_date: date,
        export_format: str,
        sections: List[str]
    ) -> str:
        """
        Generate analytics export file.
        
        Args:
            learner_id: Learner UUID
            start_date: Start of period
            end_date: End of period
            export_format: Export format (pdf, csv, json)
            sections: Sections to include
            
        Returns:
            URL to download the exported file
        """
        # In production, this would generate actual PDF/CSV/JSON
        # For now, return a placeholder URL
        _ = sections  # Placeholder for future use

        filename = (
            f"analytics_{learner_id}_{start_date}_"
            f"{end_date}.{export_format}"
        )
        export_url = f"/exports/{filename}"

        logger.info(
            "Generated %s export for learner %s",
            export_format,
            learner_id
        )

        return export_url
