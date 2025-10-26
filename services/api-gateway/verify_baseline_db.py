"""
Verify baseline assessment database schema
"""
import sqlite3

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

# Get tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'baseline%' ORDER BY name")
tables = cursor.fetchall()

print('\n📊 Baseline Assessment Tables:')
for t in tables:
    print(f'  ✓ {t[0]}')

# Count items
cursor.execute('SELECT COUNT(*) FROM baseline_items')
count = cursor.fetchone()[0]
print(f'\n📝 Sample Items: {count} items loaded')

# Items by domain
cursor.execute('SELECT domain, COUNT(*) as cnt FROM baseline_items GROUP BY domain')
domains = cursor.fetchall()
print('\nItems by Domain:')
for d in domains:
    print(f'  • {d[0]}: {d[1]} items')

# Items by grade band
cursor.execute('SELECT grade_band, COUNT(*) as cnt FROM baseline_items GROUP BY grade_band')
bands = cursor.fetchall()
print('\nItems by Grade Band:')
for b in bands:
    print(f'  • {b[0]}: {b[1]} items')

conn.close()
print('\n✅ Database verification complete!')
