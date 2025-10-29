"""
Background Jobs for Baseline Assessment
Scheduled tasks for maintenance, calibration, and monitoring
"""

import json
import logging
import os
import threading
import time
from datetime import datetime, timedelta
from typing import Optional

import schedule
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.services.irt_calibration_service import (
    IRTCalibrationService,
    PerformanceMonitor,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Database connection for background jobs
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aivo.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class BackgroundJobManager:
    """
    Manages scheduled background jobs for assessment system
    """

    def __init__(self):
        self.running = False
        self.thread = None

    def start(self):
        """Start background job scheduler"""
        if self.running:
            logger.warning("Background jobs already running")
            return

        logger.info("🚀 Starting background job scheduler...")
        self.running = True

        # Schedule jobs
        self._schedule_jobs()

        # Run scheduler in separate thread
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()

        logger.info("✅ Background jobs started successfully")

    def stop(self):
        """Stop background job scheduler"""
        logger.info("🛑 Stopping background jobs...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("✅ Background jobs stopped")

    def _schedule_jobs(self):
        """Configure all scheduled jobs"""

        # Daily calibration at 2 AM UTC
        schedule.every().day.at("02:00").do(self._daily_calibration_job)

        # Weekly quality report on Mondays at 6 AM UTC
        schedule.every().monday.at("06:00").do(self._weekly_quality_report)

        # Hourly metrics update
        schedule.every().hour.do(self._update_metrics_job)

        # Check for problematic items every 6 hours
        schedule.every(6).hours.do(self._check_problematic_items_job)

        # Clean up old pending reviews (not assigned after 7 days)
        schedule.every().day.at("03:00").do(self._cleanup_stale_reviews_job)

        logger.info("📅 Scheduled jobs configured:")
        logger.info("  - Daily calibration: 02:00 UTC")
        logger.info("  - Weekly quality report: Monday 06:00 UTC")
        logger.info("  - Hourly metrics update")
        logger.info("  - Problematic items check: Every 6 hours")
        logger.info("  - Cleanup stale reviews: 03:00 UTC daily")

    def _run_scheduler(self):
        """Run the job scheduler loop"""
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def _daily_calibration_job(self):
        """Daily batch recalibration of items with sufficient data"""
        logger.info("🔄 Starting daily calibration job...")
        db = SessionLocal()

        try:
            result = IRTCalibrationService.batch_recalibrate_items(
                db=db, min_responses=30, days_since_last_calibration=7
            )

            logger.info(
                f"✅ Calibration complete: "
                f"{result['itemsRecalibrated']} items recalibrated, "
                f"{result['significantDrifts']} with significant drift"
            )

            # Alert if many significant drifts
            if result["significantDrifts"] > 10:
                logger.warning(
                    f"⚠️ HIGH DRIFT ALERT: "
                    f"{result['significantDrifts']} items had "
                    f"significant parameter drift"
                )
                self._send_alert(
                    "High IRT Parameter Drift",
                    f"{result['significantDrifts']} items showed "
                    f"significant drift in IRT parameters. "
                    "This may indicate issues with AI generation "
                    "or item quality.",
                )

        except Exception as e:
            logger.error(f"❌ Daily calibration failed: {e}")
            self._send_alert("Calibration Job Failed", str(e))
        finally:
            db.close()

    def _weekly_quality_report(self):
        """Generate and distribute weekly quality report"""
        logger.info("📊 Generating weekly quality report...")
        db = SessionLocal()

        try:
            # Generate report for past 7 days
            start_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
            end_date = datetime.utcnow().isoformat()

            report = PerformanceMonitor.generate_quality_report(
                db=db, start_date=start_date, end_date=end_date
            )

            # Log summary
            logger.info("📈 Weekly Report Summary:")
            logger.info(f"  - Total items: {report['overview']['totalAIGeneratedItems']}")
            logger.info(f"  - Total responses: {report['overview']['totalResponses']}")
            logger.info(f"  - Problematic items: {report['overview']['problematicItems']}")
            logger.info(f"  - Pending reviews: {report['overview']['itemsPendingReview']}")

            # Save report to file
            report_file = (
                f"quality_reports/weekly_report_{datetime.utcnow().strftime('%Y%m%d')}.json"
            )
            os.makedirs("quality_reports", exist_ok=True)

            with open(report_file, "w") as f:
                json.dump(report, f, indent=2)

            logger.info(f"✅ Report saved to {report_file}")

            # Send alerts for critical issues
            if report["overview"]["problematicItems"] > 20:
                self._send_alert(
                    "High Number of Problematic Items",
                    f"{report['overview']['problematicItems']} items need attention",
                )

        except Exception as e:
            logger.error(f"❌ Quality report generation failed: {e}")
            self._send_alert("Quality Report Failed", str(e))
        finally:
            db.close()

    def _update_metrics_job(self):
        """Update aggregate metrics hourly"""
        logger.info("📊 Updating metrics...")
        db = SessionLocal()

        try:
            # Update domain-level statistics
            db.execute(
                text("""
                UPDATE baseline_sessions
                SET updated_at = CURRENT_TIMESTAMP
                WHERE status = 'in_progress'
                  AND updated_at < datetime('now', '-1 hour')
            """)
            )
            db.commit()

            logger.info("✅ Metrics updated")

        except Exception as e:
            logger.error(f"❌ Metrics update failed: {e}")
        finally:
            db.close()

    def _check_problematic_items_job(self):
        """Check for items that need immediate attention"""
        logger.info("🔍 Checking for problematic items...")
        db = SessionLocal()

        try:
            problematic = IRTCalibrationService.identify_problematic_items(db)

            # Items requiring immediate retirement
            critical_items = [item for item in problematic if item["recommendedAction"] == "retire"]

            if critical_items:
                logger.warning(
                    f"🔴 CRITICAL: {len(critical_items)} items need immediate retirement"
                )

                # Auto-retire items with severe issues
                for item in critical_items[:5]:  # Limit to 5 per run
                    item_id = item["itemId"]
                    db.execute(
                        text("""
                        UPDATE baseline_items
                           SET status = 'retired',
                               updated_at = CURRENT_TIMESTAMP
                           WHERE id = :id
                    """),
                        {"id": item_id},
                    )
                    logger.info(f"  Retired item: {item_id} (Severity: {item['severity']})")

                db.commit()

                self._send_alert(
                    "Items Auto-Retired",
                    f"{len(critical_items[:5])} items automatically "
                    "retired due to severe quality issues",
                )

            # Items needing revision
            needs_revision = [item for item in problematic if item["recommendedAction"] == "revise"]
            if len(needs_revision) > 10:
                logger.warning(f"⚠️ {len(needs_revision)} items need revision")

        except Exception as e:
            logger.error(f"❌ Problematic items check failed: {e}")
        finally:
            db.close()

    def _cleanup_stale_reviews_job(self):
        """Clean up reviews that haven't been assigned"""
        logger.info("🧹 Cleaning up stale reviews...")
        db = SessionLocal()

        try:
            cutoff_date = (datetime.utcnow() - timedelta(days=7)).isoformat()

            result = db.execute(
                text("""
                UPDATE question_review_queue
                   SET status = 'cancelled'
                   WHERE status = 'pending'
                     AND submitted_at < :cutoff
            """),
                {"cutoff": cutoff_date},
            )

            rows_affected = result.rowcount
            db.commit()

            if rows_affected > 0:
                logger.info(f"✅ Cancelled {rows_affected} stale review requests")

        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
        finally:
            db.close()

    def _send_alert(self, subject: str, message: str):
        """
        Send alert notification
        In production, integrate with email, Slack, or PagerDuty
        """
        logger.warning(f"🚨 ALERT: {subject}")
        logger.warning(f"   {message}")

        # TODO: Integrate with notification service
        # Examples:
        # - Send email to administrators
        # - Post to Slack channel
        # - Create PagerDuty incident
        # - Log to monitoring system (Datadog, New Relic, etc.)


# Global instance
job_manager = BackgroundJobManager()


def start_background_jobs():
    """Start the background job manager"""
    job_manager.start()


def stop_background_jobs():
    """Stop the background job manager"""
    job_manager.stop()
