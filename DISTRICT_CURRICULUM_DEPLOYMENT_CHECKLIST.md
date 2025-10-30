# District Curriculum Integration - Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Database Migration
- [x] Migration file created: `037_district_curriculum_schema.sql`
- [x] Migration runner created: `run_migration_037.py`
- [x] Migration tested successfully
- [x] 5 tables created
- [x] 21 default standards loaded
- [x] Indexes created for performance

**Verify:**
```bash
cd services/api-gateway
python run_migration_037.py
```

### 2. Service Layer
- [x] `curriculum_service.py` created with 7 core methods
- [x] All methods tested and working
- [x] Error handling implemented
- [x] Type hints added

**Verify:**
```bash
python test_curriculum_integration.py
```

### 3. AI Integration
- [x] `baseline_question_generator.py` updated
- [x] CurriculumService imported
- [x] generate_question() enhanced
- [x] _build_generation_prompt() updated
- [x] Automatic standard mapping implemented

**Verify:**
```python
# Check imports
from app.services.baseline_question_generator import BaselineQuestionGenerator
from app.services.curriculum_service import CurriculumService
# Should have no import errors
```

### 4. API Endpoints
- [x] `curriculum.py` router created
- [x] 5 RESTful endpoints defined
- [x] Request validation implemented
- [x] Error handling added

**Register in main.py:**
```python
from app.routers import curriculum

app.include_router(curriculum.router)
```

### 5. Documentation
- [x] Comprehensive guide created
- [x] Quick reference created
- [x] Implementation summary created
- [x] API examples provided
- [x] SQL query examples included

## 🚀 Deployment Steps

### Step 1: Database Setup
```bash
cd services/api-gateway
python run_migration_037.py
```

**Expected Output:**
```
✅ Migration 037 completed successfully
📋 Tables created: 5
📚 Curriculum standards loaded: 21
```

### Step 2: Register API Router
**File:** `services/api-gateway/app/main.py`

Add import:
```python
from app.routers import baseline_assessment, curriculum  # Add curriculum
```

Register router:
```python
app.include_router(curriculum.router)
```

### Step 3: Environment Variables
Ensure these are set:
```bash
DATABASE_URL=sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db
ANTHROPIC_API_KEY=sk-ant-your-key-here  # For AI generation
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-secret-key
```

### Step 4: Start API Server
```bash
cd services/api-gateway
$env:DATABASE_URL="sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"
$env:REDIS_URL="redis://localhost:6379/0"
$env:JWT_SECRET="aivo-dev-secret-key"
python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload
```

### Step 5: Test API Endpoints

**Test 1: Get Standards**
```bash
curl http://localhost:9000/api/curriculum/standards?domain=reading&grade_band=K-5
```

**Test 2: Get Learner Curriculum**
```bash
curl http://localhost:9000/api/curriculum/learners/{learner_id}/curriculum
```

**Test 3: Get Progress Report**
```bash
curl http://localhost:9000/api/curriculum/learners/{learner_id}/progress
```

**Test 4: Map Item to Standards**
```bash
curl -X POST http://localhost:9000/api/curriculum/items/{item_id}/standards \
  -H "Content-Type: application/json" \
  -d '{
    "standard_codes": ["CCSS.ELA-LITERACY.RL.K-5.1"],
    "alignment_strength": "primary"
  }'
```

## 📊 Post-Deployment Verification

### 1. Database Integrity
```sql
-- Check table existence
SELECT name FROM sqlite_master WHERE type='table' 
AND name IN ('districts', 'curriculum_standards', 'schools', 
             'baseline_item_standards', 'learner_standard_coverage');

-- Verify standards count
SELECT domain, grade_band, COUNT(*) as count
FROM curriculum_standards
GROUP BY domain, grade_band;

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index';
```

### 2. Service Integration
```python
from app.services.curriculum_service import CurriculumService
from app.services.baseline_question_generator import BaselineQuestionGenerator

# Test curriculum retrieval
curriculum = CurriculumService.get_district_curriculum(db, "test-learner")
assert "standards" in curriculum
assert len(curriculum["standards"]) > 0

# Test AI generation (requires Anthropic API key)
question = BaselineQuestionGenerator.generate_question(
    db=db,
    learner_id="test-learner",
    domain="reading",
    sub_domain="comprehension",
    grade_band="K-5",
    target_difficulty=0.0,
    current_theta=0.0,
    session_id="test-session"
)
assert "id" in question
```

### 3. API Health Check
```bash
# Check server is running
curl http://localhost:9000/health

# Check curriculum endpoints
curl http://localhost:9000/api/curriculum/standards?domain=reading&grade_band=K-5
```

## 🎯 Integration Points

### 1. Baseline Assessment Flow
**File:** `baseline_assessment_service.py`

When submitting a response, add standard tracking:
```python
from app.services.curriculum_service import CurriculumService

# After calculating new theta
CurriculumService.track_standard_coverage(
    db=db,
    learner_id=learner_id,
    item_id=item_id,
    correct=is_correct,
    theta_estimate=new_theta,
    standard_error=standard_error
)
```

### 2. Parent Portal
Add progress report endpoint:
```python
@router.get("/learners/{learner_id}/standards-progress")
async def get_standards_progress(learner_id: str):
    report = CurriculumService.get_learner_progress_report(
        db=db,
        learner_id=learner_id
    )
    return report
```

### 3. Teacher Portal
Add standards view:
```python
@router.get("/curriculum/standards")
async def get_curriculum_standards(
    domain: str,
    grade_band: str,
    district_id: str = "default-district"
):
    standards = CurriculumService.get_standards_for_domain(
        db=db,
        district_id=district_id,
        domain=domain,
        grade_band=grade_band
    )
    return standards
```

## 📈 Monitoring & Analytics

### Key Metrics to Track

**1. Standards Coverage**
```sql
SELECT 
    l.id as learner_id,
    COUNT(DISTINCT lsc.standard_id) as standards_assessed,
    AVG(lsc.accuracy_rate) as avg_accuracy
FROM learners l
LEFT JOIN learner_standard_coverage lsc ON l.id = lsc.learner_id
GROUP BY l.id;
```

**2. Mastery Distribution**
```sql
SELECT 
    mastery_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM learner_standard_coverage), 1) as percentage
FROM learner_standard_coverage
GROUP BY mastery_status;
```

**3. Most/Least Assessed Standards**
```sql
-- Most assessed
SELECT 
    cs.standard_code,
    cs.title,
    COUNT(DISTINCT lsc.learner_id) as learner_count,
    AVG(lsc.accuracy_rate) as avg_accuracy
FROM curriculum_standards cs
JOIN learner_standard_coverage lsc ON cs.id = lsc.standard_id
GROUP BY cs.id
ORDER BY learner_count DESC
LIMIT 10;
```

**4. AI Alignment Quality**
```sql
-- Check AI-generated item mappings
SELECT 
    COUNT(*) as total_ai_items,
    COUNT(DISTINCT item_id) as unique_items,
    AVG(COUNT(*) OVER (PARTITION BY item_id)) as avg_standards_per_item
FROM baseline_item_standards
WHERE verified_by = 'ai-generated';
```

## 🔧 Troubleshooting

### Issue 1: Migration Fails
**Symptom:** Error running migration script
**Solution:**
```bash
# Check database file exists
ls aivo.db

# Check for syntax errors
python -m py_compile run_migration_037.py

# Try manual execution
python
>>> import sqlite3
>>> conn = sqlite3.connect('aivo.db')
>>> with open('app/migrations/037_district_curriculum_schema.sql', 'r', encoding='utf-8') as f:
...     conn.executescript(f.read())
```

### Issue 2: No Standards Returned
**Symptom:** Empty results from get_standards_for_domain
**Solution:**
```sql
-- Verify default district exists
SELECT * FROM districts WHERE id = 'default-district';

-- Check standards count
SELECT COUNT(*) FROM curriculum_standards;

-- Re-run migration if needed
python run_migration_037.py
```

### Issue 3: AI Integration Not Working
**Symptom:** Import errors or generate_question fails
**Solution:**
```bash
# Install Anthropic SDK
pip install anthropic

# Set API key
$env:ANTHROPIC_API_KEY="sk-ant-your-key"

# Test import
python -c "from app.services.baseline_question_generator import BaselineQuestionGenerator"
```

### Issue 4: Coverage Not Updating
**Symptom:** track_standard_coverage doesn't update records
**Solution:**
```python
# Verify item has standard mappings
from sqlalchemy import text
mappings = db.execute(text("""
    SELECT * FROM baseline_item_standards WHERE item_id = :id
"""), {"id": item_id}).fetchall()

if not mappings:
    # Map item to standards first
    CurriculumService.map_item_to_standards(...)
```

## ✅ Final Checklist

- [ ] Migration executed successfully
- [ ] All 5 tables created
- [ ] 21+ standards loaded
- [ ] CurriculumService imports without errors
- [ ] BaselineQuestionGenerator updated
- [ ] API router registered in main.py
- [ ] Environment variables configured
- [ ] API server starts without errors
- [ ] Test endpoints respond correctly
- [ ] Documentation reviewed
- [ ] Monitoring queries tested
- [ ] Integration points identified
- [ ] Team trained on new features

## 📚 Documentation Links

- [DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md](./DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md) - Complete guide
- [DISTRICT_CURRICULUM_QUICK_REF.md](./DISTRICT_CURRICULUM_QUICK_REF.md) - Quick reference
- [DISTRICT_CURRICULUM_IMPLEMENTATION_SUMMARY.md](./DISTRICT_CURRICULUM_IMPLEMENTATION_SUMMARY.md) - Technical summary

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ All 5 curriculum tables exist in database
2. ✅ At least 21 standards are loaded
3. ✅ API endpoints return valid responses
4. ✅ AI question generation includes curriculum standards
5. ✅ Coverage tracking updates correctly
6. ✅ Progress reports generate without errors
7. ✅ No critical errors in logs
8. ✅ Performance meets SLA (< 2s for reports)

## 🚀 Next Steps After Deployment

1. **Add More Standards**: Import full Common Core and state standards
2. **Build UI**: Create admin interface for standard management
3. **Analytics Dashboard**: Visualize coverage and mastery metrics
4. **IEP Reports**: Generate PDF reports for meetings
5. **API Documentation**: Add OpenAPI/Swagger docs
6. **Performance Optimization**: Add caching for frequently accessed data

---

**Deployment Date**: _________________
**Deployed By**: _________________
**Verified By**: _________________
**Status**: [ ] Success [ ] Issues Found

**Notes:**
