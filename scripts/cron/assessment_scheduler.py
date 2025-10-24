#!/usr/bin/env python3
# pyright: reportMissingImports=false, reportMissingModuleSource=false
"""
Assessment Scheduler Cron Job.

Run daily to check and schedule assessments.

Add to crontab:
0 9 * * * /path/to/scripts/cron/assessment_scheduler.py >> \\
    /var/log/assessment_scheduler.log 2>&1
"""

import asyncio
import os
import sys

# Add parent directory to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "services", "api-gateway"))

# Module import after path modification
# pylint: disable=import-error,wrong-import-position
from app.services.assessment_scheduler import (  # noqa: E402  # type: ignore
    run_assessment_scheduler,
)


if __name__ == "__main__":
    asyncio.run(run_assessment_scheduler())
