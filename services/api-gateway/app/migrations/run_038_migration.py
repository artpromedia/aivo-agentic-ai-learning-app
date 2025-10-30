"""
Run migration 038: Question Review and Quality Assurance Schema
"""

import sqlite3
from pathlib import Path

# Connect to database
db_path = Path(__file__).parent.parent / "aivo.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Running Migration 038: Question Review and QA Schema...")

# Read and execute migration
migration_file = Path(__file__).parent / "038_question_review_schema.sql"
with open(migration_file, "r", encoding="utf-8") as f:
    sql = f.read()

# Execute migration
try:
    cursor.executescript(sql)
    conn.commit()
    print("✅ Migration 038 complete!")

    # Verify tables created
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name LIKE '%review%'
        ORDER BY name
    """)
    tables = cursor.fetchall()

    print(f"\nTables created:")
    for table in tables:
        print(f"  ✓ {table[0]}")

except Exception as e:
    print(f"❌ Migration failed: {e}")
    conn.rollback()
    raise
finally:
    conn.close()
