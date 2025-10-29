# Question Quality Validation - Quick Reference

## 🚀 Quick Start

### Validate a Question
```python
from app.services.question_quality_validator import QuestionQualityValidator

is_valid, issues, metrics = QuestionQualityValidator.validate_question(question)
print(f"Score: {metrics['overallScore']}/100")
```

### Submit for Review (if score < 80)
```python
from app.services.question_quality_validator import QuestionReviewWorkflow

review_id = QuestionReviewWorkflow.submit_for_review(
    db=db, item_id="item-123", review_priority="high"
)
```

---

## 📊 Scoring Breakdown

| Score | Status | Action |
|-------|--------|--------|
| **≥80** | ✅ Approved | Use immediately |
| **60-79** | ⚠️ Review | Normal priority review |
| **40-59** | ⚠️ Review | High priority review |
| **<40** | ❌ Reject | Regenerate question |

### Score Components:
- **Clarity** (30%): Grammar, readability, vocabulary
- **Pedagogy** (30%): Learning objectives, distractors, cognitive level
- **Bias** (20%): Cultural sensitivity, stereotypes, assumptions
- **Accessibility** (20%): Reading level, visual supports, neurodiverse-friendly

---

## 🚨 Common Issues

### Clarity Issues:
- ❌ Stem too short (<10 chars) or too long (>300 chars)
- ❌ Double negatives detected
- ❌ Complex vocabulary for grade level
- ❌ Missing question mark or colon

### Bias Issues:
- ❌ Absolute language: "obviously", "clearly", "always", "never"
- ❌ Economic assumptions: "buy", "vacation", "expensive"
- ❌ Cultural assumptions: holiday references, family structure
- ❌ Gender bias: excessive use of gendered pronouns
- ❌ Stereotypes: gender/demographic stereotypes

### Pedagogical Issues:
- ❌ No standards alignment specified
- ❌ Cognitive level mismatch (recall vs. apply/analyze)
- ❌ Poor distractors (length varies significantly)
- ❌ "All/None of the above" options
- ❌ Hint reveals correct answer

### Accessibility Issues:
- ❌ No accessibility features specified
- ❌ Not marked as neurodiverse-friendly
- ❌ Multiple sentences in stem (confusing)
- ❌ K-5 question without visual supports

---

## 🔧 Validation Rules

### Structure Requirements:
```python
{
    "stem": "10-300 characters",
    "item_type": "single_choice | multi_select | yes_no | ...",
    "options": "2-6 options, each 2-150 characters",
    "estimated_difficulty": "-4.0 to 4.0",
    "estimated_discrimination": "0.5 to 3.0",
    "estimated_guessing": "0.0 to 0.5"
}
```

### Recommended Fields:
```python
{
    "cognitive_level": "remember | understand | apply | analyze | evaluate | create",
    "standards_alignment": ["CCSS.MATH.2.OA.A.1", ...],
    "hint_text": "Helpful hint without revealing answer",
    "grade_band": "K-5 | 6-8 | 9-12",
    "accessibility_features": {
        "reading_level": "grade-2",
        "visual_supports": true
    },
    "neurodiverse_friendly": true
}
```

---

## 📋 Database Tables

### Question Quality Metrics
```sql
SELECT item_id, overall_quality_score, needs_review
FROM question_quality_metrics
WHERE overall_quality_score < 80
ORDER BY overall_quality_score ASC;
```

### Pending Reviews
```sql
SELECT qrq.id, bi.stem, qrq.priority, qrq.submitted_at
FROM question_review_queue qrq
JOIN baseline_items bi ON qrq.item_id = bi.id
WHERE qrq.status = 'pending'
ORDER BY qrq.priority DESC, qrq.submitted_at ASC;
```

### Expert Reviewers
```sql
SELECT id, domains_json, reviews_completed, approval_rate
FROM expert_reviewers
WHERE active = 1
ORDER BY reviews_completed DESC;
```

---

## 🎯 Review Workflow

1. **Submit** → Question queued with priority
2. **Assign** → Reviewer assigned based on expertise
3. **Review** → Educator reviews and rates (1-10)
4. **Decide** → Approve or request revision
5. **Track** → Revision history recorded

### Get Pending Reviews:
```python
pending = QuestionReviewWorkflow.get_pending_reviews(
    db=db, domain="math", priority="high", limit=20
)
```

### Assign Reviewer:
```python
QuestionReviewWorkflow.assign_reviewer(
    db=db, review_id="review-xxx", reviewer_id="educator-001"
)
```

### Submit Review:
```python
QuestionReviewWorkflow.submit_review(
    db=db,
    review_id="review-xxx",
    reviewer_id="educator-001",
    approved=True,
    feedback="Clear and engaging question",
    quality_ratings={"clarity": 9, "pedagogy": 10, "bias": 10, "accessibility": 9}
)
```

---

## 🧪 Testing

Run validator tests:
```bash
cd services/api-gateway
python test_question_validator.py
```

Expected: 7/7 tests pass

---

## 📈 Monitoring Queries

### Quality Distribution:
```sql
SELECT 
    CASE 
        WHEN overall_quality_score >= 80 THEN 'Excellent (≥80)'
        WHEN overall_quality_score >= 60 THEN 'Good (60-79)'
        WHEN overall_quality_score >= 40 THEN 'Fair (40-59)'
        ELSE 'Poor (<40)'
    END as quality_tier,
    COUNT(*) as count
FROM question_quality_metrics
GROUP BY quality_tier
ORDER BY MIN(overall_quality_score) DESC;
```

### Review Backlog:
```sql
SELECT 
    priority,
    COUNT(*) as pending_count,
    AVG(julianday('now') - julianday(submitted_at)) as avg_wait_days
FROM question_review_queue
WHERE status = 'pending'
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        ELSE 4
    END;
```

### Reviewer Performance:
```sql
SELECT 
    er.user_id,
    er.reviews_completed,
    er.approval_rate,
    er.avg_review_time_minutes
FROM expert_reviewers er
WHERE er.active = 1
ORDER BY er.reviews_completed DESC
LIMIT 10;
```

---

## ✅ Status

- ✅ Validator: Complete (650 lines)
- ✅ Database: 6 tables + 13 indexes
- ✅ Tests: 7/7 passing
- ✅ Integration: Ready

**Next**: Create admin UI for review workflow

---

**Files**:
- `app/services/question_quality_validator.py`
- `app/migrations/038_question_review_schema.sql`
- `test_question_validator.py`
- Full docs: `QUESTION_QUALITY_VALIDATION_COMPLETE.md`
