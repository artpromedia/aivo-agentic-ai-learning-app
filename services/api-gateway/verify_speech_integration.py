"""Comprehensive verification of speech therapy integration."""
import sqlite3
import json

conn = sqlite3.connect('aivo.db')
cursor = conn.cursor()

print("=" * 70)
print("SPEECH THERAPY INTEGRATION - COMPREHENSIVE VERIFICATION")
print("=" * 70)

# 1. Check baseline_items schema
print("\n1️⃣  BASELINE_ITEMS SCHEMA")
print("-" * 70)
cursor.execute("""
    SELECT sql FROM sqlite_master 
    WHERE type='table' AND name='baseline_items'
""")
schema = cursor.fetchone()[0]
if "'speech'" in schema or '"speech"' in schema:
    print("✅ Speech domain in CHECK constraint")
else:
    print("❌ Speech domain NOT in CHECK constraint")

# 2. Check baseline_sessions schema
print("\n2️⃣  BASELINE_SESSIONS SCHEMA")
print("-" * 70)
cursor.execute("""
    SELECT sql FROM sqlite_master 
    WHERE type='table' AND name='baseline_sessions'
""")
schema = cursor.fetchone()[0]
if "'speech'" in schema or '"speech"' in schema:
    print("✅ Speech domain in CHECK constraint")
else:
    print("❌ Speech domain NOT in CHECK constraint")

# 3. Count items by domain
print("\n3️⃣  ITEMS BY DOMAIN")
print("-" * 70)
cursor.execute("""
    SELECT domain, COUNT(*) as count
    FROM baseline_items
    GROUP BY domain
    ORDER BY domain
""")
total = 0
for domain, count in cursor.fetchall():
    icon = "🗣️" if domain == "speech" else "📚"
    print(f"{icon} {domain:10s}: {count:2d} items")
    total += count
print(f"{'':13s}{'─' * 15}")
print(f"   TOTAL:      {total:2d} items")

# 4. Speech items by grade band
print("\n4️⃣  SPEECH ITEMS BY GRADE BAND")
print("-" * 70)
cursor.execute("""
    SELECT grade_band, sub_domain, COUNT(*) as count
    FROM baseline_items
    WHERE domain = 'speech'
    GROUP BY grade_band, sub_domain
    ORDER BY grade_band, sub_domain
""")
for grade_band, sub_domain, count in cursor.fetchall():
    print(f"  {grade_band:5s} - {sub_domain:25s}: {count} item(s)")

# 5. Speech items detail
print("\n5️⃣  SPEECH ITEMS DETAIL")
print("-" * 70)
cursor.execute("""
    SELECT grade_band, sub_domain, stem, difficulty, discrimination
    FROM baseline_items
    WHERE domain = 'speech'
    ORDER BY grade_band, difficulty
""")
for grade, sub, stem, diff, disc in cursor.fetchall():
    stem_short = stem[:50] + "..." if len(stem) > 50 else stem
    print(f"\n  [{grade}] {sub}")
    print(f"    {stem_short}")
    print(f"    Difficulty: {diff:+.1f}, Discrimination: {disc:.1f}")

# 6. IRT parameter ranges
print("\n6️⃣  IRT PARAMETER VALIDATION (Speech)")
print("-" * 70)
cursor.execute("""
    SELECT 
        MIN(difficulty) as min_diff,
        MAX(difficulty) as max_diff,
        AVG(difficulty) as avg_diff,
        MIN(discrimination) as min_disc,
        MAX(discrimination) as max_disc,
        AVG(discrimination) as avg_disc,
        MIN(guessing) as min_guess,
        MAX(guessing) as max_guess,
        AVG(guessing) as avg_guess
    FROM baseline_items
    WHERE domain = 'speech'
""")
row = cursor.fetchone()
print(f"  Difficulty:")
print(f"    Range: {row[0]:+.2f} to {row[1]:+.2f} (Valid: -4 to +4)")
print(f"    Average: {row[2]:+.2f}")
print(f"  Discrimination:")
print(f"    Range: {row[3]:.2f} to {row[4]:.2f} (Valid: 0 to 3)")
print(f"    Average: {row[5]:.2f}")
print(f"  Guessing:")
print(f"    Range: {row[6]:.2f} to {row[7]:.2f} (Valid: 0 to 0.5)")
print(f"    Average: {row[8]:.2f}")

# Validation
valid = True
if row[0] < -4 or row[1] > 4:
    print("  ⚠️  Difficulty out of range!")
    valid = False
if row[3] <= 0 or row[4] > 3:
    print("  ⚠️  Discrimination out of range!")
    valid = False
if row[6] < 0 or row[7] > 0.5:
    print("  ⚠️  Guessing out of range!")
    valid = False
if valid:
    print("  ✅ All IRT parameters within valid ranges")

# 7. Grade band coverage
print("\n7️⃣  GRADE BAND COVERAGE")
print("-" * 70)
cursor.execute("""
    SELECT 
        grade_band,
        COUNT(*) as total,
        SUM(CASE WHEN domain='speech' THEN 1 ELSE 0 END) as speech_count
    FROM baseline_items
    GROUP BY grade_band
    ORDER BY grade_band
""")
for grade, total, speech in cursor.fetchall():
    pct = (speech / total * 100) if total > 0 else 0
    print(f"  {grade}: {speech}/{total} items ({pct:.0f}% speech)")

# 8. Expected vs Actual
print("\n8️⃣  INTEGRATION STATUS")
print("-" * 70)
expected = {
    'items_total': 23,
    'speech_items': 11,
    'domains': 5,  # reading, math, science, SEL, speech (writing TBD)
    'speech_subdomains': 6,  # Using 6 of 8 available sub-domains
}

cursor.execute("SELECT COUNT(*) FROM baseline_items")
actual_total = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM baseline_items WHERE domain='speech'")
actual_speech = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(DISTINCT domain) FROM baseline_items")
actual_domains = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(DISTINCT sub_domain) 
    FROM baseline_items 
    WHERE domain='speech'
""")
actual_speech_subdomains = cursor.fetchone()[0]

checks = [
    ("Total Items", expected['items_total'], actual_total),
    ("Speech Items", expected['speech_items'], actual_speech),
    ("Total Domains", expected['domains'], actual_domains),
    ("Speech Sub-domains", expected['speech_subdomains'], actual_speech_subdomains),
]

all_passed = True
for name, exp, act in checks:
    status = "✅" if exp == act else "❌"
    print(f"  {status} {name:20s}: {act:2d} / {exp:2d} expected")
    if exp != act:
        all_passed = False

print("\n" + "=" * 70)
if all_passed:
    print("🎉 SPEECH THERAPY INTEGRATION: ✅ COMPLETE")
    print("All checks passed! Ready for Part 4 (Audio Processing).")
else:
    print("⚠️  SPEECH THERAPY INTEGRATION: INCOMPLETE")
    print("Some checks failed. Please review above.")
print("=" * 70)

conn.close()
