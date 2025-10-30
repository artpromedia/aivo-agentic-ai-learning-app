# District Curriculum Integration - Quick Reference

## 🎯 One-Minute Overview

The District Curriculum Integration System maps AI-generated assessment questions to specific curriculum standards (Common Core, NGSS, state standards) and tracks learner mastery of each standard.

## 🚀 Quick Commands

### Setup
```bash
cd services/api-gateway
python run_migration_037.py
```

### Python Quick Start
```python
from app.services.curriculum_service import CurriculumService

# Get standards for learner
curriculum = CurriculumService.get_district_curriculum(db, learner_id)

# Track progress
CurriculumService.track_standard_coverage(
    db, learner_id, item_id, correct=True, theta=0.5, se=0.3
)

# Get progress report
report = CurriculumService.get_learner_progress_report(db, learner_id)
```

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `districts` | District configuration |
| `curriculum_standards` | Standard definitions |
| `schools` | School information |
| `baseline_item_standards` | Item-standard mappings |
| `learner_standard_coverage` | Progress tracking |

## 🔑 Key Functions

### CurriculumService

```python
# Get standards
get_district_curriculum(db, learner_id)
get_standards_for_domain(db, district_id, domain, grade_band, sub_domain?)

# Track progress
track_standard_coverage(db, learner_id, item_id, correct, theta, se)

# Reports
get_learner_progress_report(db, learner_id, domain?)
get_unassessed_standards(db, learner_id, domain, grade_band, limit)

# Admin
map_item_to_standards(db, item_id, standard_codes, alignment_strength, verified_by?)
```

## 📝 Common Queries

### View All Standards
```sql
SELECT standard_code, title, domain, grade_band, priority
FROM curriculum_standards
WHERE district_id = 'default-district'
ORDER BY domain, grade_band;
```

### Learner Coverage
```sql
SELECT 
    cs.domain,
    COUNT(DISTINCT lsc.standard_id) as assessed,
    COUNT(DISTINCT cs.id) as total
FROM curriculum_standards cs
LEFT JOIN learner_standard_coverage lsc 
    ON cs.id = lsc.standard_id AND lsc.learner_id = :learner_id
GROUP BY cs.domain;
```

### Mastery Status
```sql
SELECT 
    cs.standard_code,
    cs.title,
    lsc.mastery_status,
    lsc.accuracy_rate,
    lsc.times_assessed
FROM learner_standard_coverage lsc
JOIN curriculum_standards cs ON lsc.standard_id = cs.id
WHERE lsc.learner_id = :learner_id
ORDER BY cs.domain, cs.priority DESC;
```

## 🎨 Default Standards Included

### Reading (K-5)
- Phonics and Word Recognition
- Key Details
- Main Idea and Theme
- Making Inferences

### Math (K-5)
- Counting and Cardinality
- Operations and Algebraic Thinking
- Number and Operations in Base Ten
- Geometry

### Science (K-5) 
- Matter and Its Interactions
- From Molecules to Organisms
- Earth's Systems

## 🔄 Integration Flow

```
1. Learner starts assessment
   ↓
2. BaselineQuestionGenerator.generate_question()
   ├→ Retrieves district curriculum
   ├→ Gets relevant standards
   └→ Generates AI question aligned to standards
   ↓
3. Learner answers question
   ↓
4. CurriculumService.track_standard_coverage()
   ├→ Updates times_assessed
   ├→ Calculates accuracy_rate
   ├→ Determines mastery_status
   └→ Updates theta_estimate
   ↓
5. Progress report available
   └→ CurriculumService.get_learner_progress_report()
```

## 📈 Progress Report Structure

```json
{
  "learnerId": "learner-123",
  "generatedAt": "2025-10-29T...",
  "domains": {
    "reading": {
      "standards": [...],
      "coveragePercentage": 75.0,
      "masteryPercentage": 50.0,
      "assessedCount": 3,
      "totalStandards": 4
    }
  }
}
```

## 🎯 Mastery Levels

| Status | Criteria |
|--------|----------|
| `not_assessed` | No assessments yet |
| `emerging` | < 70% accuracy or < 2 attempts |
| `developing` | 70-84% accuracy, 2+ attempts |
| `proficient` | ≥ 85% accuracy, 2+ attempts |
| `advanced` | Manual upgrade |

## 🛠️ Admin Tasks

### Add Custom Standard
```python
db.execute(text("""
    INSERT INTO curriculum_standards (
        district_id, standard_code, standard_framework, domain,
        sub_domain, grade_band, title, description,
        cognitive_level, priority
    ) VALUES (:values...)
"""))
```

### Map Existing Item
```python
CurriculumService.map_item_to_standards(
    db=db,
    item_id="item-123",
    standard_codes=["CCSS.ELA-LITERACY.RL.K-5.1"],
    alignment_strength="primary"
)
```

## 🔍 Troubleshooting

**Problem**: No standards returned
```python
# Solution: Check district exists
db.execute(text("SELECT * FROM districts")).fetchall()
# If empty, re-run migration
```

**Problem**: Coverage not updating
```python
# Solution: Verify item has standard mappings
db.execute(text("""
    SELECT * FROM baseline_item_standards 
    WHERE item_id = :id
"""), {"id": item_id}).fetchall()
```

## 📚 Files

| File | Purpose |
|------|---------|
| `037_district_curriculum_schema.sql` | Migration SQL |
| `curriculum_service.py` | Core service logic |
| `baseline_question_generator.py` | AI integration |
| `run_migration_037.py` | Migration runner |

## 🎓 Next Steps

1. ✅ Run migration
2. ✅ Verify standards loaded
3. 🔄 Integrate into baseline assessment flow
4. 📊 Build progress dashboard
5. 📄 Generate IEP reports

---

**Quick Help**: See [DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md](./DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md) for full documentation
