"""Add speech therapy items to baseline assessment database."""

import sqlite3
import os
import sys

def add_speech_items():
    """Add speech therapy sample items to the database."""
    db_path = os.path.join(os.path.dirname(__file__), 'aivo.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if speech items already exist
        cursor.execute("SELECT COUNT(*) FROM baseline_items WHERE domain = 'speech'")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"✅ Speech items already exist ({existing_count} items). Skipping insertion.")
            return
        
        # Speech therapy sample items  
        # Using single_choice type for speech items for now
        speech_items = [
            # K-5 Speech Items (articulation focus)
            ("K-5", "speech", "articulation", "single_choice",
             "Say the word 'sun' clearly.",
             '{"targetSounds": ["/s/"]}',
             -1.5, 1.5, 0.25),

            ("K-5", "speech", "articulation", "single_choice",
             "Say these words: 'cat', 'dog', 'fish'.",
             '{"targetSounds": ["/k/", "/d/", "/f/"]}',
             -1.0, 1.4, 0.25),

            ("K-5", "speech", "articulation", "single_choice",
             "Say the word 'rabbit' three times.",
             '{"targetSounds": ["/r/"], "repetitions": 3}',
             -0.5, 1.3, 0.25),

            # K-5 Language Items
            ("K-5", "speech", "language_expression", "single_choice",
             "Tell me what you see in this picture.",
             '{"visualSupport": true}',
             -0.8, 1.4, 0.25),

            ("K-5", "speech", "language_comprehension", "single_choice",
             "Point to the picture that shows 'under the table'.",
             '["cat on table", "cat under table", "cat beside table"]',
             -1.0, 1.5, 0.25),

            # 6-8 Speech Items (complex articulation and fluency)
            ("6-8", "speech", "fluency_stuttering", "single_choice",
             "Read smoothly: 'The quick brown fox jumps.'",
             '{"targetFluency": "smooth", "sentenceLength": 7}',
             0.3, 1.5, 0.25),

            ("6-8", "speech", "voice", "single_choice",
             "Say 'hello' in a loud voice, then a quiet voice.",
             '{"targetParameter": "loudness"}',
             0.0, 1.4, 0.25),

            ("6-8", "speech", "pragmatics", "single_choice",
             "Greet me and ask how my day was.",
             '{"socialFunction": "greeting", "expectedTurns": 2}',
             0.5, 1.6, 0.25),

            # 9-12 Speech Items (advanced language and articulation)
            ("9-12", "speech", "language_expression", "single_choice",
             "Explain the water cycle in your own words.",
             '{"topicComplexity": "academic"}',
             1.0, 1.7, 0.25),

            ("9-12", "speech", "articulation", "single_choice",
             "Tongue twister: 'She sells seashells by the seashore.'",
             '{"targetSounds": ["/s/", "/sh/"]}',
             1.2, 1.6, 0.25),

            ("9-12", "speech", "pragmatics", "single_choice",
             "Convince me students should have more free time.",
             '{"socialFunction": "persuasion"}',
             1.5, 1.7, 0.25),
        ]

        # Insert speech items
        cursor.executemany("""
            INSERT INTO baseline_items (
                grade_band, domain, sub_domain, item_type,
                stem, tags_json, difficulty, discrimination, guessing
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, speech_items)
        
        conn.commit()
        
        # Verify insertion
        cursor.execute("SELECT COUNT(*) FROM baseline_items WHERE domain = 'speech'")
        speech_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM baseline_items")
        total_count = cursor.fetchone()[0]
        
        print(f"✅ Successfully added {speech_count} speech therapy items!")
        print(f"📊 Total items in database: {total_count}")
        
        # Show speech items by grade band
        print("\n📋 Speech Items by Grade Band:")
        cursor.execute("""
            SELECT grade_band, sub_domain, COUNT(*) as count
            FROM baseline_items
            WHERE domain = 'speech'
            GROUP BY grade_band, sub_domain
            ORDER BY grade_band, sub_domain
        """)
        
        for row in cursor.fetchall():
            grade_band, sub_domain, count = row
            print(f"  {grade_band} - {sub_domain}: {count} item(s)")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error adding speech items: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    add_speech_items()
