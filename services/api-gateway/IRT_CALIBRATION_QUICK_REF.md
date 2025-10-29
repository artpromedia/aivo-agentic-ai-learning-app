# IRT Calibration Quick Reference

## 🚀 Quick Start

```python
from app.services.irt_calibration_service import (
    IRTCalibrationService,
    PerformanceMonitor
)

# Recalibrate single item
result = IRTCalibrationService.recalibrate_item(
    db=db,
    item_id="item-123",
    method="bayesian"  # or "mle"
)

# Update metrics after response
PerformanceMonitor.update_item_metrics(
    db=db,
    item_id="item-123",
    correct=True,
    response_time_ms=5000,
    theta_at_response=0.5
)
```

---

## 📊 Key Thresholds

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| **Accuracy** | 40-85% | 20-40% or 85-95% | <20% or >95% |
| **Discrimination (r)** | >0.30 | 0.20-0.30 | <0.20 |
| **Chi-Square (χ²)** | <20 | 20-30 | >30 |
| **RMSE** | <0.20 | 0.20-0.30 | >0.30 |
| **Quality Score** | ≥75 | 60-75 | <60 |

---

## 🔄 Automatic Recalibration

Triggers at response milestones:
- **30 responses:** First calibration (Bayesian)
- **60 responses:** Second calibration (Bayesian)
- **100 responses:** Third calibration (Bayesian/MLE)
- **200 responses:** Fourth calibration (MLE recommended)

---

## ⚠️ Problem Detection

### Severity Scoring
- **≥6:** Retire immediately
- **4-5:** Revise (expert review)
- **<4:** Monitor

### Issues & Severity

| Issue | Severity | Action |
|-------|----------|--------|
| Accuracy >95% | +2 | Too easy, retire/revise |
| Accuracy <20% | +2 | Too hard, revise |
| Discrimination <0.20 | +3 | Poor separation, revise distractors |
| χ² >30 | +2 | Poor fit, review quality |
| Quality <60 | +2 | Failed validation, expert review |
| User flags >5 | +3 | Immediate review |

---

## 📡 API Endpoints

### Recalibrate Item
```http
POST /baseline/items/{item_id}/recalibrate?method=bayesian
```

### Batch Recalibrate
```http
POST /baseline/items/batch-recalibrate?domain=math&min_responses=30
```

### Quality Report
```http
GET /baseline/quality-report?start_date=2025-09-28&end_date=2025-10-28
```

### Problematic Items
```http
GET /baseline/problematic-items?domain=math
```

### Review Queue
```http
GET /baseline/review-queue?priority=high&limit=20
```

---

## 🧮 Calibration Methods

### Bayesian (Default)
```
new_param = (0.3 × AI_estimate) + (0.7 × empirical_data)
```
- **Use when:** <100 responses
- **Pros:** Stable, respects AI estimates
- **Cons:** Slower convergence

### MLE (Maximum Likelihood)
```
Maximize: P(responses | θ, a, b, c)
```
- **Use when:** 100+ responses
- **Pros:** Optimal accuracy
- **Cons:** Unstable with small samples

---

## 📈 Monitoring Queries

### Items Needing Calibration
```sql
SELECT bi.id, bi.domain, COUNT(br.id) as responses,
       MAX(qrh.revised_at) as last_calibration
FROM baseline_items bi
JOIN baseline_responses br ON bi.id = br.item_id
LEFT JOIN question_revision_history qrh 
  ON bi.id = qrh.item_id AND qrh.revision_type = 'pilot_calibration'
WHERE bi.status = 'active' AND bi.created_by = 'ai-generated'
GROUP BY bi.id
HAVING COUNT(br.id) >= 30
  AND (last_calibration IS NULL 
       OR julianday('now') - julianday(last_calibration) > 30);
```

### Performance Metrics Summary
```sql
SELECT domain,
       COUNT(*) as items,
       AVG(accuracy_rate) as avg_accuracy,
       AVG(discrimination_accuracy) as avg_discrimination,
       AVG(overall_quality_score) as avg_quality
FROM baseline_items bi
JOIN question_quality_metrics qm ON bi.id = qm.item_id
WHERE bi.status = 'active'
GROUP BY domain;
```

### Parameter Drift Analysis
```sql
SELECT item_id, 
       difficulty_before, difficulty_after,
       discrimination_before, discrimination_after,
       ABS(difficulty_after - difficulty_before) as diff_drift,
       ABS(discrimination_after - discrimination_before) as disc_drift,
       revised_at
FROM question_revision_history
WHERE revision_type = 'pilot_calibration'
  AND (ABS(difficulty_after - difficulty_before) > 0.5
       OR ABS(discrimination_after - discrimination_before) > 0.3)
ORDER BY revised_at DESC
LIMIT 20;
```

---

## 🔧 Integration Code

### Update Metrics After Response
```python
# In baseline_assessment_service.py, after saving response

from app.services.irt_calibration_service import PerformanceMonitor

time_spent_ms = int((time_submitted - time_started).total_seconds() * 1000)

PerformanceMonitor.update_item_metrics(
    db=db,
    item_id=item_id,
    correct=correct,
    response_time_ms=time_spent_ms,
    theta_at_response=current_theta
)
```

### Scheduled Batch Recalibration
```python
# Weekly cron job or task scheduler

from app.services.irt_calibration_service import IRTCalibrationService

domains = ["math", "reading", "writing", "science", "sel", "speech"]

for domain in domains:
    result = IRTCalibrationService.batch_recalibrate_items(
        db=db,
        domain=domain,
        min_responses=30,
        days_since_last_calibration=7  # Weekly
    )
    
    print(f"{domain}: {result['itemsRecalibrated']} recalibrated, "
          f"{result['significantDrifts']} significant drifts")
```

### Generate Daily Report
```python
# Daily report for administrators

from app.services.irt_calibration_service import PerformanceMonitor
from datetime import datetime, timedelta

start = (datetime.utcnow() - timedelta(days=1)).isoformat()
end = datetime.utcnow().isoformat()

report = PerformanceMonitor.generate_quality_report(
    db=db,
    start_date=start,
    end_date=end
)

# Send to admin dashboard or email
notify_admins(report)
```

---

## 🐛 Debugging

### Check Item Status
```python
from sqlalchemy import text

item = db.execute(
    text("""
        SELECT bi.*, qm.*
        FROM baseline_items bi
        LEFT JOIN question_quality_metrics qm ON bi.id = qm.item_id
        WHERE bi.id = :id
    """),
    {"id": "item-123"}
).fetchone()

print(f"Difficulty: {item.difficulty}")
print(f"Times used: {item.times_used}")
print(f"Accuracy: {item.accuracy_rate}%")
```

### Check Calibration History
```python
history = db.execute(
    text("""
        SELECT version, revised_at, revision_reason,
               difficulty_before, difficulty_after,
               discrimination_before, discrimination_after
        FROM question_revision_history
        WHERE item_id = :id AND revision_type = 'pilot_calibration'
        ORDER BY version DESC
    """),
    {"id": "item-123"}
).fetchall()

for h in history:
    print(f"Version {h.version} ({h.revised_at}):")
    print(f"  Difficulty: {h.difficulty_before} → {h.difficulty_after}")
    print(f"  Reason: {h.revision_reason}")
```

### Test Calibration
```python
# Dry run without committing
try:
    result = IRTCalibrationService.recalibrate_item(
        db=db,
        item_id="item-123",
        method="bayesian"
    )
    print(f"Would update to: {result['newParameters']}")
    db.rollback()  # Don't save
except Exception as e:
    print(f"Calibration would fail: {e}")
```

---

## 📋 Checklist for New Items

- [ ] Item added to `baseline_items` with AI-estimated parameters
- [ ] Quality validation passed (score ≥60)
- [ ] Marked `status = 'active'`
- [ ] `created_by = 'ai-generated'` set
- [ ] Awaiting 30 responses for first calibration
- [ ] Performance monitoring enabled (automatic)

---

## 🚨 Common Issues

### "Insufficient data" Error
**Cause:** Item has <30 responses  
**Solution:** Wait for more responses or lower threshold

### Large Parameter Drift
**Cause:** AI estimate inaccurate or population changed  
**Solution:** Normal for early calibration; review if drift persists after 100+ responses

### No Metrics Updating
**Cause:** Performance monitoring not integrated  
**Solution:** Add `PerformanceMonitor.update_item_metrics()` to response handler

### Calibration Not Triggering
**Cause:** Response counts not at milestone (30, 60, 100, 200)  
**Solution:** Manual trigger with `/items/{item_id}/recalibrate` or wait for next milestone

---

## 📚 Resources

- **Full Guide:** [IRT_CALIBRATION_GUIDE.md](./IRT_CALIBRATION_GUIDE.md)
- **Question Quality:** [QUESTION_QUALITY_QUICK_REF.md](./QUESTION_QUALITY_QUICK_REF.md)
- **IRT Theory:** [IRT_QUICK_REFERENCE.md](./IRT_QUICK_REFERENCE.md)
- **Tests:** [test_irt_calibration.py](./test_irt_calibration.py)

---

## 💡 Pro Tips

1. **Trust Bayesian:** It's designed to be stable; don't manually tweak parameters unless drift persists
2. **Weekly batch:** Schedule batch recalibration every 7 days for items with 30+ responses
3. **Monitor severity:** Items with severity ≥6 need immediate attention
4. **Review drift:** Significant drift (>0.5 difficulty) may indicate item ambiguity
5. **Quality first:** Don't recalibrate items with quality score <60 until reviewed
