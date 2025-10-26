"""Get schema of baseline_items."""
import sqlite3

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT sql FROM sqlite_master 
    WHERE type='table' AND name='baseline_items'
""")

schema = cursor.fetchone()[0]
print(schema)

conn.close()
