"""Migrate baseline_items to include speech domain."""
import sqlite3
import sys

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

try:
    print("📝 Step 1: Backing up existing data...")
    cursor.execute("SELECT * FROM baseline_items")
    items = cursor.fetchall()
    
    cursor.execute("PRAGMA table_info(baseline_items)")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"   Found {len(items)} items with {len(columns)} columns")
    
    print("📝 Step 2: Renaming old table...")
    cursor.execute("""
        ALTER TABLE baseline_items RENAME TO baseline_items_backup
    """)
    
    print("📝 Step 3: Creating new table with speech domain...")
    cursor.execute("""
        CREATE TABLE baseline_items (
          id TEXT PRIMARY KEY,
          item_type TEXT NOT NULL CHECK (item_type IN (
            'yes_no', 'multi_select', 'single_choice',
            'ordering', 'fill_blank', 'read_aloud', 'constructed_response'
          )),
          domain TEXT NOT NULL CHECK (domain IN (
            'reading', 'math', 'science', 'writing', 'sel', 'speech'
          )),
          sub_domain TEXT NOT NULL,
          grade_band TEXT NOT NULL CHECK (
            grade_band IN ('K-5', '6-8', '9-12')
          ),
          stem TEXT NOT NULL,
          stimulus TEXT,
          stimulus_type TEXT CHECK (
            stimulus_type IN ('text', 'image', 'audio', 'video')
          ),
          stimulus_url TEXT,
          options_json TEXT,
          correct_answer_json TEXT,
          points REAL NOT NULL DEFAULT 1.0,
          partial_credit INTEGER DEFAULT 0,
          difficulty REAL NOT NULL,
          discrimination REAL NOT NULL,
          guessing REAL DEFAULT 0.0,
          cognitive_level TEXT CHECK (cognitive_level IN (
            'remember', 'understand', 'apply', 
            'analyze', 'evaluate', 'create'
          )),
          estimated_time_seconds INTEGER,
          read_aloud_enabled INTEGER DEFAULT 1,
          allow_calculator INTEGER DEFAULT 0,
          allow_formula_sheet INTEGER DEFAULT 0,
          exposure_count INTEGER DEFAULT 0,
          last_used_at TIMESTAMP,
          version INTEGER DEFAULT 1,
          tags_json TEXT,
          status TEXT DEFAULT 'active' CHECK (
            status IN ('active', 'pilot', 'retired')
          ),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT,
          CHECK (discrimination > 0 AND discrimination <= 3),
          CHECK (difficulty >= -4 AND difficulty <= 4),
          CHECK (guessing >= 0 AND guessing <= 0.5)
        )
    """)
    
    print("📝 Step 4: Copying data to new table...")
    col_list = ', '.join(columns)
    placeholders = ', '.join(['?' for _ in columns])
    cursor.executemany(
        f"INSERT INTO baseline_items ({col_list}) VALUES ({placeholders})",
        items
    )
    
    print("📝 Step 5: Recreating indexes...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_baseline_items_domain_grade
        ON baseline_items(domain, grade_band, difficulty)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_baseline_items_subdomain
        ON baseline_items(sub_domain)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_baseline_items_exposure
        ON baseline_items(exposure_count, last_used_at)
    """)
    
    print("📝 Step 6: Verifying migration...")
    cursor.execute("SELECT COUNT(*) FROM baseline_items")
    new_count = cursor.fetchone()[0]
    
    if new_count == len(items):
        print(f"   ✅ All {new_count} items migrated successfully!")
        
        print("📝 Step 7: Dropping backup table...")
        cursor.execute("DROP TABLE baseline_items_backup")
        
        conn.commit()
        print("✅ Migration complete! Speech domain is now supported.")
    else:
        raise Exception(
            f"Count mismatch: {len(items)} original vs {new_count} migrated"
        )
        
except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
    
    # Restore from backup if it exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='baseline_items_backup'
    """)
    if cursor.fetchone():
        print("📝 Restoring from backup...")
        cursor.execute("DROP TABLE IF EXISTS baseline_items")
        cursor.execute("""
            ALTER TABLE baseline_items_backup RENAME TO baseline_items
        """)
        conn.commit()
        print("✅ Restored from backup")
    
    sys.exit(1)
finally:
    conn.close()
