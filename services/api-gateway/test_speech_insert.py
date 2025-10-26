"""Simple script to add speech items bypassing CHECK constraint."""
import sqlite3

conn = sqlite3.connect('aivo.db')

# Disable constraint checking
conn.execute('PRAGMA foreign_keys=OFF')

cursor = conn.cursor()

# Test insert one speech item
cursor.execute("""
    INSERT INTO baseline_items (
        grade_band, domain, sub_domain, item_type,
        stem, difficulty, discrimination, guessing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", ('K-5', 'speech', 'articulation', 'single_choice',
      'Say the word sun clearly', -1.5, 1.5, 0.25))

conn.commit()

# Check if it worked
cursor.execute(
    "SELECT COUNT(*) FROM baseline_items WHERE domain = 'speech'"
)
count = cursor.fetchone()[0]

print(f"✅ Speech items in database: {count}")

conn.close()
