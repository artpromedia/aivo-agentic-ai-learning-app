"""Migrate baseline_sessions to include speech domain."""
import sqlite3
import sys

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

try:
    print("📝 Step 1: Backing up existing sessions...")
    cursor.execute("SELECT * FROM baseline_sessions")
    sessions = cursor.fetchall()
    
    cursor.execute("PRAGMA table_info(baseline_sessions)")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"   Found {len(sessions)} sessions with {len(columns)} columns")
    
    print("📝 Step 2: Renaming old table...")
    cursor.execute("""
        ALTER TABLE baseline_sessions RENAME TO baseline_sessions_backup
    """)
    
    print("📝 Step 3: Creating new table with speech domain...")
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
    
    print("📝 Step 4: Copying data to new table...")
    if sessions:
        col_list = ', '.join(columns)
        placeholders = ', '.join(['?' for _ in columns])
        cursor.executemany(
            f"INSERT INTO baseline_sessions ({col_list}) " +
            f"VALUES ({placeholders})",
            sessions
        )
    
    print("📝 Step 5: Verifying migration...")
    cursor.execute("SELECT COUNT(*) FROM baseline_sessions")
    new_count = cursor.fetchone()[0]
    
    if new_count == len(sessions):
        print(f"   ✅ All {new_count} sessions migrated successfully!")
        
        print("📝 Step 6: Dropping backup table...")
        cursor.execute("DROP TABLE baseline_sessions_backup")
        
        conn.commit()
        print("✅ Migration complete! Sessions table supports speech domain.")
    else:
        raise Exception(
            f"Count mismatch: {len(sessions)} original " +
            f"vs {new_count} migrated"
        )
        
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
    
    # Restore from backup if it exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='baseline_sessions_backup'
    """)
    if cursor.fetchone():
        print("📝 Restoring from backup...")
        cursor.execute("DROP TABLE IF EXISTS baseline_sessions")
        cursor.execute("""
            ALTER TABLE baseline_sessions_backup 
            RENAME TO baseline_sessions
        """)
        conn.commit()
        print("✅ Restored from backup")
    
    sys.exit(1)
finally:
    conn.close()
