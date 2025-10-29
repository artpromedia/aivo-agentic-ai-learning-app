"""
IRT Calibration Service
Recalibrates question parameters based on production data
"""

import json
import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sqlalchemy import text
from sqlalchemy.orm import Session


class IRTCalibrationService:
    """
    Service for recalibrating IRT parameters based on real response data
    """

    # Minimum responses before recalibration
    MIN_RESPONSES_FOR_CALIBRATION = 30

    # Thresholds for parameter drift detection
    DIFFICULTY_DRIFT_THRESHOLD = 0.5  # Logits
    DISCRIMINATION_DRIFT_THRESHOLD = 0.3

    @staticmethod
    def recalibrate_item(db: Session, item_id: str, method: str = "bayesian") -> Dict[str, Any]:
        """
        Recalibrate IRT parameters for a single item

        Args:
            db: Database session
            item_id: Item to recalibrate
            method: 'bayesian' or 'mle' (Maximum Likelihood Estimation)

        Returns:
            Dict with old and new parameters, and calibration statistics
        """

        # Get current parameters
        item = db.execute(
            text("""
                SELECT difficulty, discrimination, guessing, domain, grade_band
                FROM baseline_items
                WHERE id = :item_id
            """),
            {"item_id": item_id},
        ).fetchone()

        if not item:
            raise ValueError(f"Item not found: {item_id}")

        old_difficulty, old_discrimination, old_guessing, domain, grade_band = item

        # Get response data
        responses = db.execute(
            text("""
                SELECT 
                    br.correct,
                    br.theta_at_response,
                    br.score,
                    br.max_score
                FROM baseline_responses br
                WHERE br.item_id = :item_id
                  AND br.theta_at_response IS NOT NULL
                ORDER BY br.timestamp DESC
                LIMIT 200
            """),
            {"item_id": item_id},
        ).fetchall()

        if len(responses) < IRTCalibrationService.MIN_RESPONSES_FOR_CALIBRATION:
            return {
                "status": "insufficient_data",
                "responsesNeeded": IRTCalibrationService.MIN_RESPONSES_FOR_CALIBRATION
                - len(responses),
                "message": f"Need {IRTCalibrationService.MIN_RESPONSES_FOR_CALIBRATION - len(responses)} more responses",
            }

        # Extract data
        correct_responses = [1 if r[0] else 0 for r in responses]
        theta_estimates = [r[1] for r in responses]

        # Calibrate using selected method
        if method == "bayesian":
            new_difficulty, new_discrimination, new_guessing = (
                IRTCalibrationService._bayesian_calibration(
                    correct=correct_responses,
                    theta=theta_estimates,
                    prior_difficulty=old_difficulty,
                    prior_discrimination=old_discrimination,
                    prior_guessing=old_guessing,
                )
            )
        else:  # MLE
            new_difficulty, new_discrimination, new_guessing = (
                IRTCalibrationService._mle_calibration(
                    correct=correct_responses,
                    theta=theta_estimates,
                    initial_difficulty=old_difficulty,
                    initial_discrimination=old_discrimination,
                )
            )

        # Calculate fit statistics
        fit_stats = IRTCalibrationService._calculate_fit_statistics(
            correct=correct_responses,
            theta=theta_estimates,
            difficulty=new_difficulty,
            discrimination=new_discrimination,
            guessing=new_guessing,
        )

        # Detect significant drift
        difficulty_drift = abs(new_difficulty - old_difficulty)
        discrimination_drift = abs(new_discrimination - old_discrimination)

        significant_drift = (
            difficulty_drift > IRTCalibrationService.DIFFICULTY_DRIFT_THRESHOLD
            or discrimination_drift > IRTCalibrationService.DISCRIMINATION_DRIFT_THRESHOLD
        )

        # Update item parameters
        db.execute(
            text("""
                UPDATE baseline_items
                SET difficulty = :new_difficulty,
                    discrimination = :new_discrimination,
                    guessing = :new_guessing,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :item_id
            """),
            {
                "item_id": item_id,
                "new_difficulty": new_difficulty,
                "new_discrimination": new_discrimination,
                "new_guessing": new_guessing,
            },
        )

        # Update quality metrics
        db.execute(
            text("""
                UPDATE question_quality_metrics
                SET irt_fit_statistic = :fit_stat,
                    discrimination_accuracy = :disc_accuracy,
                    updated_at = CURRENT_TIMESTAMP
                WHERE item_id = :item_id
            """),
            {
                "item_id": item_id,
                "fit_stat": fit_stats["chi_square"],
                "disc_accuracy": fit_stats["discrimination_index"],
            },
        )

        # Log calibration
        db.execute(
            text("""
                INSERT INTO question_revision_history (
                    item_id, version, revision_type, revised_by, revision_reason,
                    difficulty_before, difficulty_after,
                    discrimination_before, discrimination_after
                ) VALUES (
                    :item_id, 
                    (SELECT COALESCE(MAX(version), 0) + 1 FROM question_revision_history WHERE item_id = :item_id),
                    'pilot_calibration', 'irt-calibration-service',
                    :reason,
                    :old_diff, :new_diff,
                    :old_disc, :new_disc
                )
            """),
            {
                "item_id": item_id,
                "reason": f"Automatic recalibration based on {len(responses)} responses. {'Significant drift detected.' if significant_drift else 'Minor adjustment.'}",
                "old_diff": old_difficulty,
                "new_diff": new_difficulty,
                "old_disc": old_discrimination,
                "new_disc": new_discrimination,
            },
        )

        db.commit()

        return {
            "status": "calibrated",
            "itemId": item_id,
            "responsesUsed": len(responses),
            "oldParameters": {
                "difficulty": round(old_difficulty, 3),
                "discrimination": round(old_discrimination, 3),
                "guessing": round(old_guessing, 3),
            },
            "newParameters": {
                "difficulty": round(new_difficulty, 3),
                "discrimination": round(new_discrimination, 3),
                "guessing": round(new_guessing, 3),
            },
            "drift": {
                "difficulty": round(difficulty_drift, 3),
                "discrimination": round(discrimination_drift, 3),
                "significant": significant_drift,
            },
            "fitStatistics": fit_stats,
            "calibratedAt": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def _bayesian_calibration(
        correct: List[int],
        theta: List[float],
        prior_difficulty: float,
        prior_discrimination: float,
        prior_guessing: float,
        prior_weight: float = 0.3,
    ) -> Tuple[float, float, float]:
        """
        Bayesian calibration using prior estimates and observed data
        Combines AI estimate with actual performance using weighted average
        """

        # Use empirical estimates
        empirical_difficulty = IRTCalibrationService._estimate_difficulty_empirical(correct, theta)
        empirical_discrimination = IRTCalibrationService._estimate_discrimination_empirical(
            correct, theta
        )

        # Bayesian update: weighted average of prior and empirical
        new_difficulty = (prior_weight * prior_difficulty) + (
            (1 - prior_weight) * empirical_difficulty
        )
        new_discrimination = (prior_weight * prior_discrimination) + (
            (1 - prior_weight) * empirical_discrimination
        )

        # Keep guessing parameter stable (or slightly adjust based on low-ability performance)
        low_ability_correct = [correct[i] for i, t in enumerate(theta) if t < -1.5]
        if len(low_ability_correct) >= 5:
            empirical_guessing = sum(low_ability_correct) / len(low_ability_correct)
            new_guessing = (0.7 * prior_guessing) + (0.3 * empirical_guessing)
        else:
            new_guessing = prior_guessing

        # Constrain to valid ranges
        new_difficulty = max(-4.0, min(4.0, new_difficulty))
        new_discrimination = max(0.5, min(2.5, new_discrimination))
        new_guessing = max(0.0, min(0.5, new_guessing))

        return new_difficulty, new_discrimination, new_guessing

    @staticmethod
    def _estimate_difficulty_empirical(correct: List[int], theta: List[float]) -> float:
        """
        Estimate difficulty as the theta level where 50% get it correct
        Simple empirical method
        """
        if not correct or not theta:
            return 0.0

        # Sort by theta
        sorted_data = sorted(zip(theta, correct), key=lambda x: x[0])

        # Find theta where proportion correct crosses 0.5
        cumulative_correct = 0
        for i, (t, c) in enumerate(sorted_data):
            cumulative_correct += c
            prop_correct = cumulative_correct / (i + 1)
            if prop_correct >= 0.5:
                return t

        # If everyone gets it wrong, it's very hard
        if sum(correct) == 0:
            return 2.0
        # If everyone gets it right, it's very easy
        elif sum(correct) == len(correct):
            return -2.0

        # Default: mean theta of correct responses
        correct_thetas = [theta[i] for i, c in enumerate(correct) if c == 1]
        return sum(correct_thetas) / len(correct_thetas) if correct_thetas else 0.0

    @staticmethod
    def _estimate_discrimination_empirical(correct: List[int], theta: List[float]) -> float:
        """
        Estimate discrimination based on how well it separates high/low ability
        Point-biserial correlation
        """
        if len(correct) < 10:
            return 1.5  # Default

        # Calculate point-biserial correlation
        mean_theta = sum(theta) / len(theta)
        std_theta = math.sqrt(sum((t - mean_theta) ** 2 for t in theta) / len(theta))

        if std_theta == 0:
            return 1.5

        correct_mean_theta = sum(theta[i] for i, c in enumerate(correct) if c == 1) / max(
            sum(correct), 1
        )
        incorrect_mean_theta = sum(theta[i] for i, c in enumerate(correct) if c == 0) / max(
            len(correct) - sum(correct), 1
        )

        prop_correct = sum(correct) / len(correct)
        prop_incorrect = 1 - prop_correct

        if prop_correct == 0 or prop_incorrect == 0:
            return 1.5

        # Point-biserial correlation
        rpb = ((correct_mean_theta - mean_theta) / std_theta) * math.sqrt(
            prop_correct * prop_incorrect
        )

        # Convert correlation to discrimination parameter (rough approximation)
        # Higher correlation = better discrimination
        discrimination = 0.5 + (abs(rpb) * 2.0)

        return max(0.5, min(2.5, discrimination))

    @staticmethod
    def _mle_calibration(
        correct: List[int],
        theta: List[float],
        initial_difficulty: float,
        initial_discrimination: float,
    ) -> Tuple[float, float, float]:
        """
        Maximum Likelihood Estimation using Newton-Raphson
        More accurate but computationally intensive
        """
        # Simplified MLE - in production, use dedicated IRT library like pyirt or mirt
        # For now, fall back to empirical method
        return IRTCalibrationService._bayesian_calibration(
            correct, theta, initial_difficulty, initial_discrimination, 0.25, prior_weight=0.1
        )

    @staticmethod
    def _calculate_fit_statistics(
        correct: List[int],
        theta: List[float],
        difficulty: float,
        discrimination: float,
        guessing: float,
    ) -> Dict[str, float]:
        """
        Calculate goodness-of-fit statistics
        """
        n = len(correct)

        # Calculate expected probabilities
        expected_probs = [
            IRTCalibrationService._calculate_probability(t, discrimination, difficulty, guessing)
            for t in theta
        ]

        # Chi-square statistic
        chi_square = sum(
            ((correct[i] - expected_probs[i]) ** 2) / max(expected_probs[i], 0.01) for i in range(n)
        )

        # Discrimination index (point-biserial)
        mean_theta = sum(theta) / n
        std_theta = math.sqrt(sum((t - mean_theta) ** 2 for t in theta) / n)

        correct_mean = sum(theta[i] for i, c in enumerate(correct) if c == 1) / max(sum(correct), 1)
        prop_correct = sum(correct) / n

        if std_theta > 0 and prop_correct > 0 and prop_correct < 1:
            discrimination_index = ((correct_mean - mean_theta) / std_theta) * math.sqrt(
                prop_correct * (1 - prop_correct)
            )
        else:
            discrimination_index = 0.0

        # RMSE
        rmse = math.sqrt(sum((correct[i] - expected_probs[i]) ** 2 for i in range(n)) / n)

        return {
            "chi_square": round(chi_square, 3),
            "discrimination_index": round(discrimination_index, 3),
            "rmse": round(rmse, 3),
            "mean_ability": round(mean_theta, 3),
            "accuracy_rate": round(prop_correct * 100, 1),
        }

    @staticmethod
    def _calculate_probability(theta: float, a: float, b: float, c: float) -> float:
        """3PL IRT probability"""
        return c + (1 - c) / (1 + math.exp(-a * (theta - b)))

    @staticmethod
    def batch_recalibrate_items(
        db: Session,
        domain: Optional[str] = None,
        min_responses: int = 30,
        days_since_last_calibration: int = 30,
    ) -> Dict[str, Any]:
        """
        Batch recalibrate all items meeting criteria
        """
        query = """
            SELECT DISTINCT bi.id, bi.domain, bi.grade_band,
                   COUNT(br.id) as response_count,
                   MAX(qrh.revised_at) as last_calibration
            FROM baseline_items bi
            JOIN baseline_responses br ON bi.id = br.item_id
            LEFT JOIN question_revision_history qrh 
                ON bi.id = qrh.item_id AND qrh.revision_type = 'pilot_calibration'
            WHERE bi.status = 'active'
              AND bi.created_by = 'ai-generated'
        """

        params = {}

        if domain:
            query += " AND bi.domain = :domain"
            params["domain"] = domain

        query += """
            GROUP BY bi.id, bi.domain, bi.grade_band
            HAVING COUNT(br.id) >= :min_responses
        """
        params["min_responses"] = min_responses

        items = db.execute(text(query), params).fetchall()

        results = {
            "totalItemsEvaluated": len(items),
            "itemsRecalibrated": 0,
            "itemsSkipped": 0,
            "significantDrifts": 0,
            "results": [],
        }

        for item_id, item_domain, grade_band, response_count, last_calibration in items:
            # Check if needs recalibration
            if last_calibration:
                last_cal_date = datetime.fromisoformat(last_calibration.replace("Z", "+00:00"))
                days_since = (datetime.utcnow() - last_cal_date).days
                if days_since < days_since_last_calibration:
                    results["itemsSkipped"] += 1
                    continue

            # Recalibrate
            try:
                cal_result = IRTCalibrationService.recalibrate_item(db, item_id, method="bayesian")

                if cal_result.get("status") == "calibrated":
                    results["itemsRecalibrated"] += 1
                    if cal_result.get("drift", {}).get("significant"):
                        results["significantDrifts"] += 1

                    results["results"].append(
                        {
                            "itemId": item_id,
                            "domain": item_domain,
                            "gradeBand": grade_band,
                            "responseCount": response_count,
                            "drift": cal_result.get("drift"),
                            "newParameters": cal_result.get("newParameters"),
                        }
                    )
                else:
                    results["itemsSkipped"] += 1

            except Exception as e:
                print(f"⚠️ Error recalibrating {item_id}: {e}")
                results["itemsSkipped"] += 1

        return results

    @staticmethod
    def identify_problematic_items(
        db: Session, domain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Identify items that need revision or retirement
        """
        query = """
            SELECT 
                bi.id, bi.domain, bi.grade_band, bi.stem,
                qm.overall_quality_score,
                qm.accuracy_rate,
                qm.times_used,
                qm.irt_fit_statistic,
                qm.discrimination_accuracy,
                qm.flagged_by_count
            FROM baseline_items bi
            LEFT JOIN question_quality_metrics qm ON bi.id = qm.item_id
            WHERE bi.status = 'active'
              AND qm.times_used >= 20
        """

        params = {}

        if domain:
            query += " AND bi.domain = :domain"
            params["domain"] = domain

        items = db.execute(text(query), params).fetchall()

        problematic = []

        for item in items:
            (
                item_id,
                domain,
                grade_band,
                stem,
                quality_score,
                accuracy,
                times_used,
                fit_stat,
                disc_accuracy,
                flagged_count,
            ) = item

            issues = []
            severity = 0

            # Check accuracy rate
            if accuracy is not None:
                if accuracy > 95:
                    issues.append("Too easy (>95% accuracy)")
                    severity += 2
                elif accuracy < 20:
                    issues.append("Too difficult (<20% accuracy)")
                    severity += 2

            # Check discrimination
            if disc_accuracy is not None and disc_accuracy < 0.2:
                issues.append(f"Poor discrimination (r={disc_accuracy:.2f})")
                severity += 3

            # Check fit statistic
            if fit_stat is not None and fit_stat > 30:
                issues.append(f"Poor IRT fit (χ²={fit_stat:.1f})")
                severity += 2

            # Check quality score
            if quality_score is not None and quality_score < 60:
                issues.append(f"Low quality score ({quality_score:.0f}/100)")
                severity += 2

            # Check flags
            if flagged_count and flagged_count > 5:
                issues.append(f"Flagged by {flagged_count} users")
                severity += 3

            if issues:
                action = "retire" if severity >= 6 else "revise" if severity >= 4 else "monitor"

                problematic.append(
                    {
                        "itemId": item_id,
                        "domain": domain,
                        "gradeBand": grade_band,
                        "stem": stem[:100] + "..." if len(stem) > 100 else stem,
                        "issues": issues,
                        "severity": severity,
                        "recommendedAction": action,
                        "metrics": {
                            "qualityScore": quality_score,
                            "accuracyRate": accuracy,
                            "timesUsed": times_used,
                            "fitStatistic": fit_stat,
                            "discriminationIndex": disc_accuracy,
                        },
                    }
                )

        # Sort by severity
        problematic.sort(key=lambda x: x["severity"], reverse=True)

        return problematic


class PerformanceMonitor:
    """
    Monitors question performance metrics in real-time
    """

    @staticmethod
    def update_item_metrics(
        db: Session, item_id: str, correct: bool, response_time_ms: int, theta_at_response: float
    ):
        """
        Update performance metrics after each response
        """
        # Get or create metrics record
        existing = db.execute(
            text(
                "SELECT id, times_used, times_correct, avg_response_time_ms FROM question_quality_metrics WHERE item_id = :id"
            ),
            {"id": item_id},
        ).fetchone()

        if existing:
            metrics_id, times_used, times_correct, avg_time = existing
            new_times_used = times_used + 1
            new_times_correct = times_correct + (1 if correct else 0)
            new_accuracy = (new_times_correct / new_times_used) * 100
            new_avg_time = ((avg_time * times_used) + response_time_ms) / new_times_used

            db.execute(
                text("""
                    UPDATE question_quality_metrics
                    SET times_used = :times_used,
                        times_correct = :times_correct,
                        accuracy_rate = :accuracy,
                        avg_response_time_ms = :avg_time,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :metrics_id
                """),
                {
                    "metrics_id": metrics_id,
                    "times_used": new_times_used,
                    "times_correct": new_times_correct,
                    "accuracy": new_accuracy,
                    "avg_time": int(new_avg_time),
                },
            )
        else:
            # Create new metrics record
            db.execute(
                text("""
                    INSERT INTO question_quality_metrics (
                        item_id, times_used, times_correct, accuracy_rate, avg_response_time_ms
                    ) VALUES (
                        :item_id, 1, :correct, :accuracy, :response_time
                    )
                """),
                {
                    "item_id": item_id,
                    "correct": 1 if correct else 0,
                    "accuracy": 100.0 if correct else 0.0,
                    "response_time": response_time_ms,
                },
            )

        db.commit()

        # Check if item needs recalibration
        PerformanceMonitor._check_calibration_trigger(db, item_id)

    @staticmethod
    def _check_calibration_trigger(db: Session, item_id: str):
        """
        Check if item has enough responses for recalibration
        """
        metrics = db.execute(
            text("SELECT times_used FROM question_quality_metrics WHERE item_id = :id"),
            {"id": item_id},
        ).fetchone()

        if metrics and metrics[0] in [30, 60, 100, 200]:  # Trigger at specific milestones
            print(f"🔄 Item {item_id} reached {metrics[0]} responses - triggering recalibration")
            try:
                IRTCalibrationService.recalibrate_item(db, item_id, method="bayesian")
            except Exception as e:
                print(f"⚠️ Auto-recalibration failed: {e}")

    @staticmethod
    def generate_quality_report(
        db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive quality report
        """
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        if not end_date:
            end_date = datetime.utcnow().isoformat()

        # Overall statistics
        total_items = db.execute(
            text(
                "SELECT COUNT(*) FROM baseline_items WHERE status = 'active' AND created_by = 'ai-generated'"
            )
        ).fetchone()[0]

        total_responses = db.execute(
            text("""
                SELECT COUNT(*) FROM baseline_responses br
                JOIN baseline_items bi ON br.item_id = bi.id
                WHERE bi.created_by = 'ai-generated'
                  AND br.timestamp BETWEEN :start AND :end
            """),
            {"start": start_date, "end": end_date},
        ).fetchone()[0]

        # Quality distribution
        quality_dist = db.execute(
            text("""
                SELECT 
                    CASE 
                        WHEN overall_quality_score >= 90 THEN 'Excellent'
                        WHEN overall_quality_score >= 75 THEN 'Good'
                        WHEN overall_quality_score >= 60 THEN 'Fair'
                        ELSE 'Needs Improvement'
                    END as quality_tier,
                    COUNT(*) as count
                FROM question_quality_metrics
                GROUP BY quality_tier
            """)
        ).fetchall()

        # Problematic items
        problematic = IRTCalibrationService.identify_problematic_items(db)

        # Items pending review
        pending_review = db.execute(
            text("SELECT COUNT(*) FROM question_review_queue WHERE status = 'pending'")
        ).fetchone()[0]

        # Domain breakdown
        domain_stats = db.execute(
            text("""
                SELECT 
                    bi.domain,
                    COUNT(DISTINCT bi.id) as item_count,
                    AVG(qm.overall_quality_score) as avg_quality,
                    AVG(qm.accuracy_rate) as avg_accuracy
                FROM baseline_items bi
                LEFT JOIN question_quality_metrics qm ON bi.id = qm.item_id
                WHERE bi.status = 'active' AND bi.created_by = 'ai-generated'
                GROUP BY bi.domain
            """)
        ).fetchall()

        report = {
            "reportGenerated": datetime.utcnow().isoformat(),
            "dateRange": {"start": start_date, "end": end_date},
            "overview": {
                "totalAIGeneratedItems": total_items,
                "totalResponses": total_responses,
                "itemsPendingReview": pending_review,
                "problematicItems": len(problematic),
            },
            "qualityDistribution": {tier: count for tier, count in quality_dist},
            "domainBreakdown": [
                {
                    "domain": domain,
                    "itemCount": item_count,
                    "avgQuality": round(avg_quality, 1) if avg_quality else None,
                    "avgAccuracy": round(avg_accuracy, 1) if avg_accuracy else None,
                }
                for domain, item_count, avg_quality, avg_accuracy in domain_stats
            ],
            "problematicItems": problematic[:10],  # Top 10
            "recommendations": PerformanceMonitor._generate_recommendations(
                total_items, problematic, pending_review
            ),
        }

        return report

    @staticmethod
    def _generate_recommendations(
        total_items: int, problematic: List[Dict], pending_review: int
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []

        if len(problematic) > total_items * 0.15:
            recommendations.append(
                f"⚠️ {len(problematic)} items ({len(problematic) / total_items * 100:.0f}%) need attention. Consider reviewing AI generation prompts."
            )

        retire_count = sum(1 for item in problematic if item["recommendedAction"] == "retire")
        if retire_count > 0:
            recommendations.append(
                f"🔴 {retire_count} items should be retired immediately due to severe issues."
            )

        if pending_review > 20:
            recommendations.append(
                f"📝 {pending_review} items awaiting expert review. Consider assigning more reviewers."
            )

        if not recommendations:
            recommendations.append(
                "✅ All systems operating normally. Quality metrics are within acceptable ranges."
            )

        return recommendations
