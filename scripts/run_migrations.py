"""
Database Migration Runner
Handles Alembic migrations with error handling and validation

Usage:
    python scripts/run_migrations.py upgrade
    python scripts/run_migrations.py downgrade --revision -1
    python scripts/run_migrations.py current
    python scripts/run_migrations.py history
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
project_root = Path(__file__).parent.parent
api_gateway_path = project_root / "services" / "api-gateway"
sys.path.insert(0, str(api_gateway_path))

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_database_url():
    """Get database URL from environment or use default."""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        logger.warning("DATABASE_URL not set, using default development database")
        database_url = "postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db"
    
    return database_url


def test_database_connection(database_url: str) -> bool:
    """Test database connection before running migrations."""
    try:
        logger.info("Testing database connection...")
        engine = create_engine(database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        logger.info("✅ Database connection successful")
        engine.dispose()
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.error("Please check your DATABASE_URL environment variable")
        return False


def get_alembic_config(database_url: str) -> Config:
    """Configure Alembic with database URL."""
    alembic_ini_path = api_gateway_path / "alembic.ini"
    
    if not alembic_ini_path.exists():
        logger.error(f"❌ alembic.ini not found at {alembic_ini_path}")
        sys.exit(1)
    
    alembic_cfg = Config(str(alembic_ini_path))
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    
    return alembic_cfg


def run_migrations(command_name: str = "upgrade", revision: str = "head", dry_run: bool = False):
    """
    Run Alembic migrations.
    
    Args:
        command_name: upgrade, downgrade, current, or history
        revision: Target revision (default: head)
        dry_run: If True, only show what would happen
    """
    database_url = get_database_url()
    
    if dry_run:
        logger.info("🔍 DRY RUN MODE - No changes will be made")
    
    if not test_database_connection(database_url):
        logger.error("Cannot run migrations - database connection failed")
        sys.exit(1)
    
    alembic_cfg = get_alembic_config(database_url)
    
    try:
        if command_name == "upgrade":
            logger.info(f"{'[DRY RUN] ' if dry_run else ''}Running migrations to {revision}...")
            if not dry_run:
                command.upgrade(alembic_cfg, revision)
                logger.info("✅ Migrations completed successfully")
            else:
                command.upgrade(alembic_cfg, revision, sql=True)
                
        elif command_name == "downgrade":
            logger.info(f"{'[DRY RUN] ' if dry_run else ''}Downgrading to {revision}...")
            if not dry_run:
                command.downgrade(alembic_cfg, revision)
                logger.info("✅ Downgrade completed successfully")
            else:
                command.downgrade(alembic_cfg, revision, sql=True)
                
        elif command_name == "current":
            logger.info("📍 Current migration version:")
            command.current(alembic_cfg, verbose=True)
            
        elif command_name == "history":
            logger.info("📜 Migration history:")
            command.history(alembic_cfg, verbose=True)
            
        elif command_name == "heads":
            logger.info("🔝 Head revisions:")
            command.heads(alembic_cfg, verbose=True)
            
        elif command_name == "show":
            logger.info(f"📄 Showing revision {revision}:")
            command.show(alembic_cfg, revision)
            
        else:
            logger.error(f"❌ Unknown command: {command_name}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        logger.error("Run with --dry-run to see what SQL would be executed")
        sys.exit(1)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Run database migrations for Aivo AI Learning Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Upgrade to latest
  python scripts/run_migrations.py upgrade
  
  # Downgrade one revision
  python scripts/run_migrations.py downgrade --revision -1
  
  # Show current version
  python scripts/run_migrations.py current
  
  # Dry run (see SQL without executing)
  python scripts/run_migrations.py upgrade --dry-run
        """
    )
    
    parser.add_argument(
        "command",
        choices=["upgrade", "downgrade", "current", "history", "heads", "show"],
        help="Migration command to run"
    )
    
    parser.add_argument(
        "--revision",
        default="head",
        help="Target revision (default: head). Use -1 for one step back, +1 for one step forward"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show SQL that would be executed without making changes"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("🗄️  Aivo AI Learning Platform - Database Migration Runner")
    logger.info("=" * 60)
    
    run_migrations(args.command, args.revision, args.dry_run)
    
    logger.info("=" * 60)
    logger.info("✅ Migration runner completed")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
