#!/usr/bin/env python3
"""
Assessment Scheduler Cron Job.

Run daily to check and schedule assessments.

Add to crontab:
0 9 * * * /path/to/scripts/cron/assessment_scheduler.py >> /var/log/assessment_scheduler.log 2>&1
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from services.api_gateway.app.services.assessment_scheduler import run_assessment_scheduler


if __name__ == "__main__":
    asyncio.run(run_assessment_scheduler())
