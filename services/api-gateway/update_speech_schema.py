"""Update baseline_items schema to include speech domain."""

import sqlite3
import os
import sys


def update_schema():
    """Update baseline_items table to allow speech domain."""
    db_path = os.path.join(os.path.dirname(__file__), 'aivo.db')

    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # SQLite doesn't support ALTER TABLE to modify constraints
        # We need to recreate the table with updated constraints
        print("📝 Creating temporary table with updated schema...")

        # Get all existing data
        cursor.execute("SELECT * FROM baseline_items")
        existing_items = cursor.fetchall()
        print(f"   Found {len(existing_items)} existing items")

        # Drop old table
        cursor.execute("DROP TABLE IF EXISTS baseline_items_old")
        cursor.execute(
            "ALTER TABLE baseline_items RENAME TO baseline_items_old"
        )

        # Create new table with updated CHECK constraint
        cursor.execute("""
            CREATE TABLE baseline_items (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
                item_type TEXT NOT NULL CHECK (
                    item_type IN (
                        'multiple_choice', 'multiple_select',
                        'fill_blank', 'short_answer',
                        'read_aloud', 'matching'
                    )
                ),
                domain TEXT NOT NULL CHECK (
                    domain IN (
                        'reading', 'math', 'science',
                        'writing', 'sel', 'speech'
                    )
                ),
                sub_domain TEXT NOT NULL,
                grade_band TEXT NOT NULL CHECK (
                    grade_band IN ('K-5', '6-8', '9-12')
                ),
                stem TEXT NOT NULL,
                stimulus TEXT,
                stimulus_type TEXT,
                stimulus_url TEXT,
                options_json TEXT,
                correct_answer_json TEXT,
                points REAL NOT NULL DEFAULT 1.0,
                partial_credit INTEGER DEFAULT 0,
                difficulty REAL NOT NULL,
                discrimination REAL NOT NULL,
                guessing REAL DEFAULT 0.0,
                cognitive_level TEXT,
                estimated_time_seconds INTEGER,
                read_aloud_enabled INTEGER DEFAULT 1,
                allow_calculator INTEGER DEFAULT 0,
                allow_formula_sheet INTEGER DEFAULT 0,
                exposure_count INTEGER DEFAULT 0,
                last_used_at TIMESTAMP,
                version INTEGER DEFAULT 1,
                tags_json TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT
            )
        """)

        # Create indexes
        cursor.execute("""
            CREATE INDEX idx_baseline_items_domain_grade
            ON baseline_items(domain, grade_band, difficulty)
        """)
        cursor.execute("""
            CREATE INDEX idx_baseline_items_subdomain
            ON baseline_items(sub_domain)
        """)
        cursor.execute("""
            CREATE INDEX idx_baseline_items_exposure
            ON baseline_items(exposure_count, last_used_at)
        """)

        # Copy data back
        print("📝 Copying existing items to new table...")
        cursor.execute("""
            INSERT INTO baseline_items
            SELECT * FROM baseline_items_old
        """)

        # Drop old table
        cursor.execute("DROP TABLE baseline_items_old")

        # Update baseline_sessions table
        print("📝 Updating baseline_sessions schema...")
        cursor.execute("SELECT * FROM baseline_sessions")
        existing_sessions = cursor.fetchall()
        print(f"   Found {len(existing_sessions)} existing sessions")

        cursor.execute("DROP TABLE IF EXISTS baseline_sessions_old")
        cursor.execute("""
            ALTER TABLE baseline_sessions RENAME TO baseline_sessions_old
        """)

        cursor.execute("""
            CREATE TABLE baseline_sessions (
                id TEXT PRIMARY KEY,
                learner_id TEXT NOT NULL,
                grade_band TEXT NOT NULL CHECK (
                    grade_band IN ('K-5', '6-8', '9-12')
                ),
                status TEXT NOT NULL DEFAULT 'active' CHECK (
                    status IN ('active', 'paused', 'completed')
                ),
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP,
                current_domain TEXT CHECK (
                    current_domain IN (
                        'reading', 'math', 'science',
                        'writing', 'sel', 'speech'
                    )
                ),
                current_item_index INTEGER DEFAULT 0,
                total_items_completed INTEGER DEFAULT 0,
                total_items_planned INTEGER,
                audio_recording_enabled INTEGER DEFAULT 1,
                text_to_speech_enabled INTEGER DEFAULT 1,
                ability_estimates_json TEXT,
                standard_errors_json TEXT,
                engagement_score REAL DEFAULT 0.75,
                avg_response_time_seconds REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            INSERT INTO baseline_sessions
            SELECT * FROM baseline_sessions_old
        """)
        cursor.execute("DROP TABLE baseline_sessions_old")

        conn.commit()

        # Verify
        cursor.execute("""
            SELECT sql FROM sqlite_master
            WHERE type='table' AND name='baseline_items'
        """)
        schema = cursor.fetchone()[0]
        if "'speech'" in schema or '"speech"' in schema:
            print("✅ Schema updated successfully!")
            print("✅ 'speech' domain is now allowed in baseline_items")
            print("✅ baseline_sessions also updated")
        else:
            print("⚠️  Schema updated but speech domain not found in CHECK")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error updating schema: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    update_schema()
