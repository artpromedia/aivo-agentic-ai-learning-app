# District Curriculum Integration System - Complete Guide

## 🎯 Overview

The District Curriculum Integration System allows administrators to define and maintain curriculum standards that the AI agent uses for dynamic question generation. This ensures all assessment questions align with district-specific educational frameworks while tracking learner progress against specific standards.

## 📊 System Architecture

### Database Schema

#### 1. **districts** Table
Stores district-level information and curriculum preferences.

```sql
- id: Unique identifier
- name: District name
- state: State location
- type: public/private/charter/homeschool
- primary_framework: common_core/state_standards/custom/international
- settings_json: Assessment preferences and accommodations
```

#### 2. **curriculum_standards** Table
Comprehensive standards database aligned to national frameworks.

```sql
- id: Unique standard identifier
- district_id: Links to districts table
- standard_code: e.g., "CCSS.ELA-LITERACY.RF.K-5.3"
- standard_framework: common_core, ngss, state, etc.
- domain: reading, math, science, writing, sel, speech
- sub_domain: Specific skill area
- grade_band: K-5, 6-8, 9-12
- title: Short standard name
- description: Full standard description
- cognitive_level: remember/understand/apply/analyze/evaluate/create
- priority: essential/core/supplemental
```

#### 3. **schools** Table
School-level data within districts.

```sql
- id: School identifier
- district_id: Parent district
- name: School name
- school_type: elementary/middle/high/k12/special_ed
- custom_standards_json: School-specific modifications
```

#### 4. **baseline_item_standards** Table
Maps assessment items to curriculum standards.

```sql
- item_id: Assessment question ID
- standard_id: Curriculum standard ID
- alignment_strength: primary/secondary/tangential
- verified_by: Educator who verified alignment
```

#### 5. **learner_standard_coverage** Table
Tracks learner progress on each standard.

```sql
- learner_id: Student identifier
- standard_id: Standard being tracked
- times_assessed: Number of assessments
- total_items_attempted: Question count
- total_items_correct: Correct answer count
- accuracy_rate: Percentage correct
- theta_estimate: IRT ability estimate for this standard
- mastery_status: not_assessed/emerging/developing/proficient/advanced
```

## 🚀 Quick Start

### Step 1: Run Migration

```bash
cd services/api-gateway
python run_migration_037.py
```

**Expected Output:**
```
✅ Migration 037 completed successfully
📋 Tables created: 5
📚 Curriculum standards loaded: 21
📊 Standards by domain and grade band:
  - math     K-5  : 4 standards
  - reading  K-5  : 4 standards
  - science  K-5  : 3 standards
  ...
```

### Step 2: Verify Installation

```python
from sqlalchemy import text
from app.database import get_db

db = next(get_db())

# Check districts
result = db.execute(text("SELECT * FROM districts")).fetchall()
print(f"Districts: {len(result)}")

# Check standards
result = db.execute(text("SELECT COUNT(*) FROM curriculum_standards")).fetchone()
print(f"Standards: {result[0]}")
```

## 💡 Core Features

### 1. District Curriculum Retrieval

```python
from app.services.curriculum_service import CurriculumService

# Get all standards for a learner's district
curriculum = CurriculumService.get_district_curriculum(
    db=db,
    learner_id="learner-123"
)

# Returns:
{
    "districtId": "default-district",
    "gradeBand": "K-5",
    "standards": {
        "reading": [
            {
                "id": "ccss-rf-k5-phonics",
                "code": "CCSS.ELA-LITERACY.RF.K-5.3",
                "title": "Phonics and Word Recognition",
                "description": "Know and apply grade-level phonics...",
                "priority": "essential",
                "cognitiveLevel": "remember"
            }
        ],
        "math": [...],
        "science": [...]
    }
}
```

### 2. Domain-Specific Standards

```python
# Get standards for specific domain and sub-domain
standards = CurriculumService.get_standards_for_domain(
    db=db,
    district_id="default-district",
    domain="reading",
    grade_band="K-5",
    sub_domain="phonics"  # Optional
)

# Returns list of relevant standards
```

### 3. AI Question Generation with Standards

The `BaselineQuestionGenerator` now automatically:
- Retrieves relevant curriculum standards
- Includes standards in AI prompt
- Generates questions aligned to standards
- Maps generated questions to standards

```python
from app.services.baseline_question_generator import BaselineQuestionGenerator

question = BaselineQuestionGenerator.generate_question(
    db=db,
    learner_id="learner-123",
    domain="reading",
    sub_domain="comprehension",
    grade_band="K-5",
    target_difficulty=0.0,
    current_theta=0.0,
    session_id="session-456"
)

# Question is automatically mapped to relevant standards
```

### 4. Standard Coverage Tracking

```python
# Track which standards were assessed
CurriculumService.track_standard_coverage(
    db=db,
    learner_id="learner-123",
    item_id="item-789",
    correct=True,
    theta_estimate=0.5,
    standard_error=0.3
)

# Automatically updates:
# - Times assessed
# - Accuracy rate
# - Mastery status
# - Theta estimate for standard
```

### 5. Progress Reports

```python
# Generate comprehensive progress report
report = CurriculumService.get_learner_progress_report(
    db=db,
    learner_id="learner-123",
    domain="reading"  # Optional: specific domain
)

# Returns:
{
    "learnerId": "learner-123",
    "generatedAt": "2025-10-29T02:54:45Z",
    "domains": {
        "reading": {
            "standards": [
                {
                    "code": "CCSS.ELA-LITERACY.RL.K-5.1",
                    "title": "Key Details",
                    "masteryStatus": "proficient",
                    "accuracy": 87.5,
                    "timesAssessed": 8,
                    "lastAssessed": "2025-10-28T14:32:11Z",
                    "thetaEstimate": 0.65
                }
            ],
            "coveragePercentage": 75.0,
            "masteryPercentage": 50.0,
            "assessedCount": 3,
            "totalStandards": 4
        }
    }
}
```

### 6. Find Unassessed Standards

```python
# Get priority standards that need assessment
unassessed = CurriculumService.get_unassessed_standards(
    db=db,
    learner_id="learner-123",
    domain="math",
    grade_band="K-5",
    limit=5
)

# Returns list of high-priority standards with < 2 assessments
```

## 📝 Use Cases

### Use Case 1: IEP Progress Reporting

```python
# Generate report for IEP meeting
report = CurriculumService.get_learner_progress_report(
    db=db,
    learner_id="learner-123"
)

# Show coverage across all domains
for domain, data in report["domains"].items():
    print(f"{domain}: {data['coveragePercentage']}% covered, "
          f"{data['masteryPercentage']}% mastered")
```

### Use Case 2: Adaptive Assessment Planning

```python
# Find what to assess next
unassessed = CurriculumService.get_unassessed_standards(
    db=db,
    learner_id="learner-123",
    domain="reading",
    grade_band="K-5"
)

# Generate questions for these standards
for standard in unassessed:
    question = BaselineQuestionGenerator.generate_question(
        db=db,
        learner_id="learner-123",
        domain=standard["domain"],
        sub_domain=standard["subDomain"],
        ...
    )
```

### Use Case 3: District-Wide Analytics

```sql
-- Standards with lowest mastery across district
SELECT 
    cs.standard_code,
    cs.title,
    AVG(lsc.accuracy_rate) as avg_accuracy,
    COUNT(DISTINCT lsc.learner_id) as learner_count
FROM curriculum_standards cs
JOIN learner_standard_coverage lsc ON cs.id = lsc.standard_id
WHERE lsc.mastery_status IN ('emerging', 'developing')
GROUP BY cs.id
ORDER BY avg_accuracy ASC
LIMIT 10;
```

## 🔧 Administration Tasks

### Adding Custom Standards

```python
from sqlalchemy import text

# Insert custom district standard
db.execute(text("""
    INSERT INTO curriculum_standards (
        district_id, standard_code, standard_framework, domain, sub_domain,
        grade_band, title, description, cognitive_level, priority
    ) VALUES (
        'my-district-id',
        'MY.CUSTOM.STANDARD.1',
        'custom',
        'reading',
        'comprehension',
        'K-5',
        'Custom Comprehension Skill',
        'Students will demonstrate custom skill...',
        'apply',
        'core'
    )
"""))
db.commit()
```

### Mapping Existing Items to Standards

```python
# Map existing assessment items to standards
CurriculumService.map_item_to_standards(
    db=db,
    item_id="existing-item-123",
    standard_codes=["CCSS.ELA-LITERACY.RL.K-5.1", "CCSS.ELA-LITERACY.RL.K-5.2"],
    alignment_strength="primary",
    verified_by="admin@district.edu"
)
```

## 📊 Sample Queries

### Coverage by Domain

```sql
SELECT 
    cs.domain,
    COUNT(DISTINCT cs.id) as total_standards,
    COUNT(DISTINCT lsc.standard_id) as assessed_standards,
    ROUND(COUNT(DISTINCT lsc.standard_id) * 100.0 / COUNT(DISTINCT cs.id), 1) 
        as coverage_pct
FROM curriculum_standards cs
LEFT JOIN learner_standard_coverage lsc ON cs.id = lsc.standard_id
WHERE cs.grade_band = 'K-5'
GROUP BY cs.domain;
```

### Mastery Status Distribution

```sql
SELECT 
    cs.domain,
    lsc.mastery_status,
    COUNT(*) as learner_count
FROM learner_standard_coverage lsc
JOIN curriculum_standards cs ON lsc.standard_id = cs.id
GROUP BY cs.domain, lsc.mastery_status
ORDER BY cs.domain, lsc.mastery_status;
```

### Standards Needing More Assessment

```sql
SELECT 
    cs.standard_code,
    cs.title,
    COUNT(DISTINCT lsc.learner_id) as learners_assessed,
    AVG(lsc.times_assessed) as avg_times_assessed
FROM curriculum_standards cs
LEFT JOIN learner_standard_coverage lsc ON cs.id = lsc.standard_id
WHERE cs.priority = 'essential'
  AND cs.grade_band = 'K-5'
GROUP BY cs.id
HAVING avg_times_assessed < 3 OR avg_times_assessed IS NULL
ORDER BY cs.domain, cs.priority;
```

## 🎓 Integration Points

### 1. Baseline Assessment Service

The `BaselineQuestionGenerator` is already integrated:

```python
# In baseline_assessment_service.py
from app.services.baseline_question_generator import BaselineQuestionGenerator

# AI generation automatically uses curriculum standards
question = BaselineQuestionGenerator.generate_question(
    db=db,
    learner_id=learner_id,
    domain=domain,
    sub_domain=sub_domain,
    grade_band=grade_band,
    target_difficulty=difficulty,
    current_theta=theta,
    session_id=session_id
)

# After response submission, track coverage
from app.services.curriculum_service import CurriculumService

CurriculumService.track_standard_coverage(
    db=db,
    learner_id=learner_id,
    item_id=item_id,
    correct=is_correct,
    theta_estimate=new_theta,
    standard_error=standard_error
)
```

### 2. Parent Portal Reports

```python
# GET /api/learners/{learner_id}/progress
@router.get("/learners/{learner_id}/progress")
async def get_learner_progress(learner_id: str, db: Session = Depends(get_db)):
    report = CurriculumService.get_learner_progress_report(
        db=db,
        learner_id=learner_id
    )
    return report
```

### 3. Teacher Portal Standards View

```python
# GET /api/curriculum/standards
@router.get("/curriculum/standards")
async def get_standards(
    domain: str,
    grade_band: str,
    district_id: str = "default-district",
    db: Session = Depends(get_db)
):
    standards = CurriculumService.get_standards_for_domain(
        db=db,
        district_id=district_id,
        domain=domain,
        grade_band=grade_band
    )
    return standards
```

## 🔒 Security Considerations

1. **District Data Isolation**: Each district's standards are isolated
2. **Verified Alignments**: Track who verified item-standard mappings
3. **Audit Trail**: All coverage updates are timestamped
4. **Access Control**: Implement role-based access for standard management

## 📈 Success Metrics

Track these KPIs:

- **Standards Coverage**: % of standards assessed per learner
- **Mastery Distribution**: Breakdown by mastery level
- **Assessment Frequency**: Times each standard is assessed
- **Accuracy Trends**: Improvement over time per standard
- **AI Alignment Quality**: % of AI-generated questions properly aligned

## 🐛 Troubleshooting

### No Standards Found

```python
# Check if default district exists
result = db.execute(text(
    "SELECT COUNT(*) FROM districts WHERE id = 'default-district'"
)).fetchone()

if result[0] == 0:
    # Re-run migration
    python run_migration_037.py
```

### Standards Not Mapping

```python
# Verify standard_code exists
standard = db.execute(text("""
    SELECT id FROM curriculum_standards 
    WHERE standard_code = :code
"""), {"code": "CCSS.ELA-LITERACY.RL.K-5.1"}).fetchone()

if not standard:
    print("Standard code not in database")
```

## 🚀 Next Steps

1. **Add More Standards**: Expand coverage for 6-8 and 9-12 grade bands
2. **State Standards**: Import state-specific frameworks
3. **Custom Domains**: Add SEL, speech therapy, life skills standards
4. **Analytics Dashboard**: Build visualization for coverage metrics
5. **Export Reports**: Generate PDF/CSV reports for IEP meetings

## 📚 Related Documentation

- [AI_BASELINE_ASSESSMENT_GUIDE.md](./AI_BASELINE_ASSESSMENT_GUIDE.md) - AI question generation
- [BASELINE_ASSESSMENT_QUICK_REF.md](./BASELINE_ASSESSMENT_QUICK_REF.md) - Quick reference
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints

---

**Status**: ✅ Complete and Ready for Production
**Version**: 1.0.0
**Last Updated**: 2025-10-29
