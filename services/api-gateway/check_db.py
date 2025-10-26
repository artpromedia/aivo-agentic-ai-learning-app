import sqlite3

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

# List all tables
print("=== TABLES ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
for table in tables:
    print(f"  - {table}")

# Check if learner_models table exists
if 'learner_models' in tables:
    print("\n=== LEARNER MODELS ===")
    cursor.execute("SELECT COUNT(*) FROM learner_models")
    count = cursor.fetchone()[0]
    print(f"  Count: {count}")
    
    if count > 0:
        cursor.execute("SELECT id, learner_id, status FROM learner_models LIMIT 3")
        for row in cursor.fetchall():
            print(f"  {row[0]} | Learner: {row[1]} | Status: {row[2]}")

# Check for any table with learner data
for table in ['learners', 'students', 'users']:
    if table in tables:
        print(f"\n=== {table.upper()} ===")
        cursor.execute(f"SELECT * FROM {table} LIMIT 3")
        rows = cursor.fetchall()
        if rows:
            print(f"  Found {len(rows)} records")
            for row in rows:
                print(f"  {row}")
        else:
            print("  Empty")

conn.close()
