#!/usr/bin/env python
"""
Manual training script for AIVO Base Brain.

Run this script to train a new model version.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.training.curriculum_trainer import main

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    print("=" * 60)
    print("AIVO Base Brain Training")
    print("=" * 60)
    print()
    
    asyncio.run(main())
