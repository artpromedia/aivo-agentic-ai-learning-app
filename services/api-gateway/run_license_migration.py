import sqlite3

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

# Check if licenses table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='licenses'")
licenses_exists = cursor.fetchone() is not None

if not licenses_exists:
    print("Creating licenses table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        license_key TEXT UNIQUE NOT NULL,
        license_type TEXT DEFAULT 'individual',
        used_seats INTEGER DEFAULT 0,
        district_name TEXT,
        district_id TEXT,
        created_by_role TEXT DEFAULT 'parent',
        expires_at TIMESTAMP,
        status TEXT DEFAULT 'active',
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    print("✅ Licenses table created")
else:
    print("ℹ️ Licenses table already exists")

# Now run the full migration
print("\nRunning teacher licensing migration...")
with open('app/migrations/035_teacher_licensing.sql', 'r') as f:
    script = f.read()

try:
    cursor.executescript(script)
    conn.commit()
    print("\n✅ Teacher licensing migration completed successfully!")
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()

conn.close()
