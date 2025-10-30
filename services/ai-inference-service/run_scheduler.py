"""
Background Task Scheduler for Agentic AI Brain

This module sets up APScheduler to run autonomous cycles and memory consolidation
for all active brains at configured intervals.

Usage:
    python run_scheduler.py

Configuration via environment variables or settings:
    - AGENTIC_CYCLE_INTERVAL_HOURS: How often to run autonomous cycles (default: 24)
    - AGENTIC_MEMORY_CONSOLIDATION_HOUR: What hour to consolidate memories (default: 2 AM)
"""

import asyncio
import logging
from datetime import datetime
from typing import List

from app.core.database import get_db
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.brain_manager import BrainManager

# Import your app modules
from app.core.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AgenticScheduler:
    """Manages scheduled tasks for agentic AI brain operations"""

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.brain_manager = BrainManager()

    async def get_active_brains(self) -> List[dict]:
        """
        Get list of all active brains that need autonomous cycles.

        Returns:
            List of brain dictionaries with brain_id and learner_id
        """
        async with get_db() as db:
            from sqlalchemy import text

            result = db.execute(
                text("""
                    SELECT 
                        b.brain_id,
                        b.learner_id,
                        b.status,
                        bip.autonomy_level
                    FROM brains b
                    LEFT JOIN brain_intervention_policies bip 
                        ON b.brain_id = bip.brain_id
                    WHERE 
                        b.status = 'active'
                        AND (
                            bip.autonomy_level IN ('GUIDED', 'PROACTIVE', 'AUTONOMOUS')
                            OR bip.autonomy_level IS NULL
                        )
                """)
            ).fetchall()

            return [
                {
                    "brain_id": row.brain_id,
                    "learner_id": row.learner_id,
                    "status": row.status,
                    "autonomy_level": row.autonomy_level or "GUIDED",
                }
                for row in result
            ]

    async def run_autonomous_cycle_for_brain(self, brain_id: str) -> dict:
        """
        Run autonomous cycle for a single brain.

        Args:
            brain_id: Brain instance ID

        Returns:
            Result summary
        """
        try:
            logger.info(f"🔄 Starting autonomous cycle for {brain_id}")

            async with get_db() as db:
                result = await self.brain_manager.run_autonomous_cycle(
                    brain_id=brain_id, trigger="scheduled", db=db
                )

            if result.get("status") == "failed":
                logger.error(f"❌ Cycle failed for {brain_id}: {result.get('error')}")
            else:
                logger.info(
                    f"✅ Cycle complete for {brain_id}: "
                    f"{result.get('goals_generated', 0)} goals, "
                    f"{result.get('reflections_stored', 0)} reflections"
                )

            return result

        except Exception as e:
            logger.error(f"❌ Error in cycle for {brain_id}: {str(e)}")
            return {"status": "failed", "error": str(e), "brain_id": brain_id}

    async def run_all_autonomous_cycles(self):
        """
        Run autonomous cycles for all active brains.

        This is the main scheduled task that runs every N hours.
        """
        if not settings.ENABLE_AGENTIC_MODE:
            logger.info("⏸️ Agentic mode disabled, skipping cycles")
            return

        logger.info("🚀 Starting autonomous cycles for all active brains")
        start_time = datetime.utcnow()

        try:
            # Get all active brains
            brains = await self.get_active_brains()
            logger.info(f"📊 Found {len(brains)} active brains")

            # Run cycles (can be parallelized with asyncio.gather for better performance)
            results = []
            for brain_data in brains:
                result = await self.run_autonomous_cycle_for_brain(brain_data["brain_id"])
                results.append(result)

                # Add delay between brains to avoid overwhelming the system
                await asyncio.sleep(2)

            # Summary
            successful = sum(1 for r in results if r.get("status") != "failed")
            failed = len(results) - successful
            total_goals = sum(r.get("goals_generated", 0) for r in results)
            total_reflections = sum(r.get("reflections_stored", 0) for r in results)

            duration = (datetime.utcnow() - start_time).total_seconds()

            logger.info(
                f"🎉 Autonomous cycles complete\n"
                f"   Brains processed: {len(results)}\n"
                f"   Successful: {successful}\n"
                f"   Failed: {failed}\n"
                f"   Goals generated: {total_goals}\n"
                f"   Reflections stored: {total_reflections}\n"
                f"   Duration: {duration:.2f}s"
            )

            # Store summary in database
            async with get_db() as db:
                await self._store_batch_summary(
                    db,
                    {
                        "total_brains": len(results),
                        "successful": successful,
                        "failed": failed,
                        "total_goals": total_goals,
                        "total_reflections": total_reflections,
                        "duration_seconds": duration,
                        "timestamp": start_time.isoformat(),
                    },
                )

        except Exception as e:
            logger.error(f"❌ Error in autonomous cycle batch: {str(e)}")

    async def _store_batch_summary(self, db, summary: dict):
        """Store batch execution summary in database"""
        try:
            from sqlalchemy import text

            db.execute(
                text("""
                    INSERT INTO system_audit_logs 
                        (event_type, details, created_at)
                    VALUES 
                        ('autonomous_cycle_batch', :summary, NOW())
                """),
                {"summary": str(summary)},
            )
            db.commit()
        except Exception as e:
            logger.error(f"Failed to store batch summary: {str(e)}")

    async def consolidate_memories(self):
        """
        Consolidate memories across all brains.

        This runs once per day (typically at 2 AM) to:
        - Remove low-importance old memories
        - Strengthen frequently-accessed memories
        - Update memory importance scores
        """
        if not settings.ENABLE_AGENTIC_MODE:
            return

        logger.info("🧠 Starting memory consolidation")

        try:
            async with get_db() as db:
                from sqlalchemy import text

                # Clean up old low-importance memories
                result = db.execute(text("SELECT cleanup_old_memories()")).fetchone()

                deleted_count = result[0] if result else 0

                logger.info(f"🗑️ Cleaned up {deleted_count} old memories")

                # Update importance scores based on access patterns
                db.execute(
                    text("""
                        UPDATE brain_memories
                        SET importance = LEAST(
                            importance + (access_count * 0.05),
                            1.0
                        )
                        WHERE access_count > 5
                    """)
                )

                db.commit()

                logger.info("✅ Memory consolidation complete")

        except Exception as e:
            logger.error(f"❌ Error in memory consolidation: {str(e)}")

    async def check_goal_deadlines(self):
        """
        Check for goals approaching deadlines and notify parents.

        Runs daily to:
        - Identify goals within 3 days of deadline
        - Check if progress is on track
        - Send notifications if needed
        """
        if not settings.ENABLE_AGENTIC_MODE:
            return

        logger.info("📅 Checking goal deadlines")

        try:
            async with get_db() as db:
                from sqlalchemy import text

                # Find goals approaching deadline
                result = db.execute(
                    text("""
                        SELECT 
                            goal_id,
                            brain_id,
                            learner_id,
                            target_skill,
                            progress,
                            target_date
                        FROM brain_learning_goals
                        WHERE 
                            status = 'active'
                            AND target_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
                            AND progress < 80
                        ORDER BY target_date ASC
                    """)
                ).fetchall()

                for row in result:
                    logger.info(
                        f"⚠️ Goal '{row.target_skill}' for brain {row.brain_id} "
                        f"approaching deadline with {row.progress}% progress"
                    )

                    # TODO: Send notification to parent
                    # await send_notification(row.learner_id, ...)

                logger.info(f"✅ Checked {len(result)} goals approaching deadline")

        except Exception as e:
            logger.error(f"❌ Error checking goal deadlines: {str(e)}")

    def start(self):
        """Start the scheduler with all configured jobs"""

        if not settings.ENABLE_AGENTIC_MODE:
            logger.warning("⏸️ Agentic mode disabled. Scheduler not starting.")
            return

        logger.info("🚀 Starting Agentic AI Scheduler")

        # Job 1: Run autonomous cycles every N hours
        self.scheduler.add_job(
            self.run_all_autonomous_cycles,
            trigger=IntervalTrigger(hours=settings.AGENTIC_CYCLE_INTERVAL_HOURS),
            id="autonomous_cycles",
            name="Run autonomous cycles for all brains",
            replace_existing=True,
            max_instances=1,  # Prevent overlapping runs
        )
        logger.info(
            f"✅ Scheduled autonomous cycles every {settings.AGENTIC_CYCLE_INTERVAL_HOURS} hours"
        )

        # Job 2: Memory consolidation (daily at configured hour)
        self.scheduler.add_job(
            self.consolidate_memories,
            trigger=CronTrigger(hour=settings.AGENTIC_MEMORY_CONSOLIDATION_HOUR, minute=0),
            id="memory_consolidation",
            name="Consolidate brain memories",
            replace_existing=True,
        )
        logger.info(
            f"✅ Scheduled memory consolidation daily at "
            f"{settings.AGENTIC_MEMORY_CONSOLIDATION_HOUR}:00"
        )

        # Job 3: Check goal deadlines (daily at 9 AM)
        self.scheduler.add_job(
            self.check_goal_deadlines,
            trigger=CronTrigger(hour=9, minute=0),
            id="goal_deadline_check",
            name="Check goal deadlines",
            replace_existing=True,
        )
        logger.info("✅ Scheduled goal deadline checks daily at 9:00 AM")

        # Start the scheduler
        self.scheduler.start()
        logger.info("✅ Scheduler started successfully")

        # Print job summary
        self.print_job_summary()

    def print_job_summary(self):
        """Print summary of all scheduled jobs"""
        logger.info("\n" + "=" * 60)
        logger.info("SCHEDULED JOBS SUMMARY")
        logger.info("=" * 60)

        jobs = self.scheduler.get_jobs()
        for job in jobs:
            logger.info(f"📋 {job.name}")
            logger.info(f"   ID: {job.id}")
            logger.info(f"   Next run: {job.next_run_time}")
            logger.info(f"   Trigger: {job.trigger}")
            logger.info("")

        logger.info("=" * 60 + "\n")

    def stop(self):
        """Stop the scheduler"""
        logger.info("⏹️ Stopping scheduler...")
        self.scheduler.shutdown()
        logger.info("✅ Scheduler stopped")


async def main():
    """Main entry point"""
    logger.info("🧠 AIVO Agentic AI Scheduler Starting...")

    scheduler = AgenticScheduler()

    try:
        # Start scheduler
        scheduler.start()

        # Keep running
        while True:
            await asyncio.sleep(60)  # Check every minute

    except KeyboardInterrupt:
        logger.info("\n🛑 Received shutdown signal")
        scheduler.stop()
    except Exception as e:
        logger.error(f"❌ Fatal error: {str(e)}")
        scheduler.stop()
        raise


if __name__ == "__main__":
    # Run the scheduler
    asyncio.run(main())
