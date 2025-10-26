import sqlite3
import json
from datetime import datetime, timedelta

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

# Delete existing test licenses first
test_keys = ['DIST-2025-ELEM-5678', 'SCHL-2025-DEMO-1234', 'CLSS-2025-MATH-9999']
for key in test_keys:
    cursor.execute('DELETE FROM licenses WHERE license_key = ?', (key,))

# Insert test licenses
test_licenses = [
    {
        'license_key': 'DIST-2025-ELEM-5678',
        'license_type': 'district_bulk',
        'district_name': 'Springfield Elementary',
        'district_id': 'DIST001',
        'used_seats': 0,
        'expires_at': (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'active',
        'metadata': json.dumps({
            'total_seats': 50,
            'grade_levels': ['K', '1', '2', '3', '4', '5'],
            'subjects': ['reading', 'math', 'science']
        }),
        'created_by_role': 'admin'
    },
    {
        'license_key': 'SCHL-2025-DEMO-1234',
        'license_type': 'school_bulk',
        'district_name': 'Demo School',
        'district_id': 'SCHL001',
        'used_seats': 5,
        'expires_at': (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'active',
        'metadata': json.dumps({
            'total_seats': 25,
            'grade_levels': ['K', '1', '2'],
            'subjects': ['reading']
        }),
        'created_by_role': 'admin'
    },
    {
        'license_key': 'CLSS-2025-MATH-9999',
        'license_type': 'classroom',
        'district_name': 'Math Classroom',
        'district_id': 'CLSS001',
        'used_seats': 8,
        'expires_at': (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'active',
        'metadata': json.dumps({
            'total_seats': 10,
            'grade_levels': ['3', '4'],
            'subjects': ['math']
        }),
        'created_by_role': 'teacher'
    }
]

for lic in test_licenses:
    cursor.execute('''
        INSERT INTO licenses (license_key, license_type, district_name, district_id, used_seats, expires_at, status, metadata, created_by_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        lic['license_key'],
        lic['license_type'],
        lic['district_name'],
        lic['district_id'],
        lic['used_seats'],
        lic['expires_at'],
        lic['status'],
        lic['metadata'],
        lic['created_by_role']
    ))

conn.commit()
print(f'✅ Inserted {len(test_licenses)} test licenses')

# Verify
cursor.execute('SELECT license_key, license_type, district_name, used_seats, expires_at FROM licenses WHERE license_key LIKE "%-2025-%"')
print('\nTest Licenses:')
for row in cursor.fetchall():
    print(f"  - {row[0]}: Type={row[1]}, District={row[2]}, Used={row[3]}, Expires={row[4]}")

conn.close()
