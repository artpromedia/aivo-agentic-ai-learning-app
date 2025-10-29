# IRT Calibration and Performance Monitoring System

## Overview

The IRT Calibration system automatically recalibrates Item Response Theory parameters based on real learner response data, improving assessment accuracy over time.

## Key Features

### 1. **Automatic Recalibration**
- Bayesian updating: Combines AI estimates with actual performance
- Triggers at response milestones: 30, 60, 100, 200 responses
- Detects parameter drift and logs significant changes
- Uses empirical difficulty and discrimination estimation

### 2. **Performance Monitoring**
- Tracks accuracy rates, response times, discrimination indices
- Real-time metrics updates after each response
- Identifies problematic items (too easy, too hard, poor fit)
- Quality reporting for educators and administrators

### 3. **Quality Assurance**
- Flags items for revision or retirement
- Calculates fit statistics (χ², RMSE, point-biserial correlation)
- Generates comprehensive quality reports
- Expert review workflow integration

---

## API Endpoints

### Recalibrate Single Item

```http
POST /baseline/items/{item_id}/recalibrate
```

**Parameters:**
- `item_id` (path): Item to recalibrate
- `method` (query): `bayesian` or `mle` (default: `bayesian`)

**Response:**
```json
{
  "status": "calibrated",
  "itemId": "item-123",
  "responsesUsed": 45,
  "oldParameters": {
    "difficulty": 0.0,
    "discrimination": 1.5,
    "guessing": 0.25
  },
  "newParameters": {
    "difficulty": 0.342,
    "discrimination": 1.621,
    "guessing": 0.25
  },
  "drift": {
    "difficulty": 0.342,
    "discrimination": 0.121,
    "significant": false
  },
  "fitStatistics": {
    "chi_square": 12.5,
    "discrimination_index": 0.45,
    "rmse": 0.18,
    "mean_ability": 0.12,
    "accuracy_rate": 68.9
  },
  "calibratedAt": "2025-10-28T10:30:00Z"
}
```

**Error (Insufficient Data):**
```json
{
  "status": "insufficient_data",
  "responsesNeeded": 15,
  "message": "Need 15 more responses"
}
```

---

### Batch Recalibrate Items

```http
POST /baseline/items/batch-recalibrate
```

**Parameters:**
- `domain` (query, optional): Filter by domain (math, reading, etc.)
- `min_responses` (query): Minimum responses required (default: 30)
- `days_since_last_calibration` (query): Recalibrate if not calibrated in N days (default: 30)

**Response:**
```json
{
  "totalItemsEvaluated": 150,
  "itemsRecalibrated": 42,
  "itemsSkipped": 108,
  "significantDrifts": 7,
  "results": [
    {
      "itemId": "item-456",
      "domain": "math",
      "gradeBand": "6-8",
      "responseCount": 65,
      "drift": {
        "difficulty": 0.523,
        "discrimination": 0.089,
        "significant": true
      },
      "newParameters": {
        "difficulty": 0.823,
        "discrimination": 1.589,
        "guessing": 0.25
      }
    }
  ]
}
```

---

### Get Quality Report

```http
GET /baseline/quality-report
```

**Parameters:**
- `start_date` (query, optional): ISO date (default: 30 days ago)
- `end_date` (query, optional): ISO date (default: now)

**Response:**
```json
{
  "reportGenerated": "2025-10-28T10:30:00Z",
  "dateRange": {
    "start": "2025-09-28T10:30:00Z",
    "end": "2025-10-28T10:30:00Z"
  },
  "overview": {
    "totalAIGeneratedItems": 1250,
    "totalResponses": 45678,
    "itemsPendingReview": 12,
    "problematicItems": 23
  },
  "qualityDistribution": {
    "Excellent": 450,
    "Good": 620,
    "Fair": 130,
    "Needs Improvement": 50
  },
  "domainBreakdown": [
    {
      "domain": "math",
      "itemCount": 350,
      "avgQuality": 82.5,
      "avgAccuracy": 67.3
    },
    {
      "domain": "reading",
      "itemCount": 420,
      "avgQuality": 85.1,
      "avgAccuracy": 71.2
    }
  ],
  "problematicItems": [
    {
      "itemId": "item-789",
      "domain": "math",
      "gradeBand": "6-8",
      "stem": "Calculate the area of...",
      "issues": [
        "Too easy (>95% accuracy)",
        "Poor discrimination (r=0.12)"
      ],
      "severity": 5,
      "recommendedAction": "revise",
      "metrics": {
        "qualityScore": 55.0,
        "accuracyRate": 97.5,
        "timesUsed": 45,
        "fitStatistic": 8.2,
        "discriminationIndex": 0.12
      }
    }
  ],
  "recommendations": [
    "⚠️ 23 items (1.8%) need attention. Consider reviewing AI generation prompts.",
    "🔴 3 items should be retired immediately due to severe issues."
  ]
}
```

---

### Get Problematic Items

```http
GET /baseline/problematic-items
```

**Parameters:**
- `domain` (query, optional): Filter by domain

**Response:**
```json
{
  "problematicItems": [
    {
      "itemId": "item-123",
      "domain": "math",
      "gradeBand": "K-5",
      "stem": "What is 2 + 2?",
      "issues": [
        "Too easy (>95% accuracy)",
        "Poor discrimination (r=0.08)"
      ],
      "severity": 5,
      "recommendedAction": "retire",
      "metrics": {
        "qualityScore": 45.0,
        "accuracyRate": 98.5,
        "timesUsed": 120,
        "fitStatistic": 15.3,
        "discriminationIndex": 0.08
      }
    }
  ],
  "total": 23
}
```

**Severity Levels:**
- **≥6**: Retire immediately (severe issues)
- **4-5**: Revise (moderate issues)
- **<4**: Monitor (minor issues)

**Recommended Actions:**
- `retire`: Remove from item pool
- `revise`: Submit for expert review and revision
- `monitor`: Continue tracking but no immediate action

---

### Get Review Queue

```http
GET /baseline/review-queue
```

**Parameters:**
- `domain` (query, optional): Filter by domain
- `priority` (query, optional): `high`, `normal`, `low`
- `limit` (query): Max results (default: 20)

**Response:**
```json
{
  "pendingReviews": [
    {
      "reviewId": "rev-456",
      "itemId": "item-789",
      "domain": "reading",
      "gradeBand": "6-8",
      "status": "pending",
      "priority": "high",
      "submittedAt": "2025-10-27T14:20:00Z",
      "automatedValidationResults": {
        "overallScore": 65,
        "clarityScore": 70,
        "biasScore": 80,
        "pedagogyScore": 60,
        "accessibilityScore": 50
      }
    }
  ],
  "total": 12
}
```

---

### Submit Expert Review

```http
POST /baseline/review/{review_id}/submit
```

**Request Body:**
```json
{
  "reviewer_id": "educator-123",
  "approved": false,
  "feedback": "Distractors are too obvious. Option C reveals the answer.",
  "quality_ratings": {
    "clarity": 80,
    "bias": 90,
    "pedagogy": 40,
    "accessibility": 70
  },
  "suggested_revisions": {
    "stem": "Improved stem text...",
    "options": [
      {"id": "A", "text": "Revised option A"},
      {"id": "B", "text": "Revised option B"},
      {"id": "C", "text": "Revised option C", "correct": true},
      {"id": "D", "text": "Revised option D"}
    ]
  }
}
```

**Response:**
```json
{
  "message": "Review submitted successfully",
  "reviewId": "rev-456"
}
```

---

## Calibration Methods

### Bayesian Calibration (Recommended)

Uses weighted average of AI estimate (prior) and empirical data:

```
new_difficulty = (0.3 × prior_difficulty) + (0.7 × empirical_difficulty)
new_discrimination = (0.3 × prior_discrimination) + (0.7 × empirical_discrimination)
```

**Advantages:**
- Stable: Doesn't overreact to small samples
- Utilizes AI expertise: Respects initial estimates
- Converges: As data accumulates, empirical evidence dominates

**When to use:** Default choice for all items

---

### Maximum Likelihood Estimation (MLE)

Uses Newton-Raphson to find parameters maximizing likelihood:

```
P(correct | θ) = c + (1 - c) / (1 + exp(-a(θ - b)))
```

**Advantages:**
- Accurate: Optimal estimates with large samples
- Standard: Classical IRT approach

**Disadvantages:**
- Unstable: Small samples can cause wild swings
- Computationally intensive

**When to use:** Items with 100+ responses for maximum accuracy

---

## Automatic Triggers

Performance monitoring automatically triggers recalibration at these milestones:

| Responses | Action |
|-----------|--------|
| 30 | First recalibration (Bayesian) |
| 60 | Second recalibration (Bayesian) |
| 100 | Third recalibration (can use MLE) |
| 200 | Fourth recalibration (MLE recommended) |

---

## Fit Statistics Explained

### Chi-Square (χ²)
- Measures how well model predictions match actual responses
- **Good fit:** χ² < 20
- **Poor fit:** χ² > 30
- **Interpretation:** Lower is better

### Discrimination Index (Point-Biserial r)
- Correlation between item score and ability estimate
- **Good:** r > 0.30
- **Acceptable:** r = 0.20 - 0.30
- **Poor:** r < 0.20
- **Interpretation:** Higher means item separates high/low ability better

### RMSE (Root Mean Square Error)
- Average prediction error
- **Good:** RMSE < 0.20
- **Acceptable:** RMSE = 0.20 - 0.30
- **Poor:** RMSE > 0.30
- **Interpretation:** Lower is better

---

## Problem Detection Criteria

### Too Easy
- **Criterion:** Accuracy > 95%
- **Severity:** +2
- **Issue:** Doesn't discriminate, wasted assessment time
- **Action:** Increase difficulty or retire

### Too Difficult
- **Criterion:** Accuracy < 20%
- **Severity:** +2
- **Issue:** Frustrating, possibly flawed
- **Action:** Decrease difficulty or review for errors

### Poor Discrimination
- **Criterion:** Discrimination index < 0.20
- **Severity:** +3
- **Issue:** Doesn't separate high/low ability
- **Action:** Revise distractors, check clarity

### Poor IRT Fit
- **Criterion:** χ² > 30
- **Severity:** +2
- **Issue:** Model doesn't match data
- **Action:** Review item quality, check for external factors

### Low Quality Score
- **Criterion:** Overall quality < 60/100
- **Severity:** +2
- **Issue:** Failed automated validation
- **Action:** Submit for expert review

### User Flags
- **Criterion:** Flagged by 5+ users
- **Severity:** +3
- **Issue:** Learners/educators identified problems
- **Action:** Immediate review required

---

## Database Integration

### Tables Used

**baseline_items:**
- Stores IRT parameters (difficulty, discrimination, guessing)
- Updated during recalibration

**baseline_responses:**
- Source data for recalibration
- Provides theta, correctness, response time

**question_quality_metrics:**
- Tracks performance metrics
- Updated after each response
- Stores fit statistics

**question_revision_history:**
- Logs all calibration events
- Tracks parameter changes over time
- Audit trail for quality control

---

## Usage Examples

### Monitor and Recalibrate Math Items

```python
from app.services.irt_calibration_service import IRTCalibrationService

# Recalibrate all math items with 30+ responses
result = IRTCalibrationService.batch_recalibrate_items(
    db=db,
    domain="math",
    min_responses=30,
    days_since_last_calibration=30
)

print(f"Recalibrated {result['itemsRecalibrated']} items")
print(f"Significant drifts detected: {result['significantDrifts']}")
```

### Generate Weekly Quality Report

```python
from app.services.irt_calibration_service import PerformanceMonitor
from datetime import datetime, timedelta

# Last 7 days
start = (datetime.utcnow() - timedelta(days=7)).isoformat()
end = datetime.utcnow().isoformat()

report = PerformanceMonitor.generate_quality_report(
    db=db,
    start_date=start,
    end_date=end
)

# Email to administrators
send_email(
    to="admin@aivo.com",
    subject="Weekly Assessment Quality Report",
    body=format_report(report)
)
```

### Identify Items for Retirement

```python
from app.services.irt_calibration_service import IRTCalibrationService

problematic = IRTCalibrationService.identify_problematic_items(
    db=db,
    domain=None  # All domains
)

to_retire = [
    item for item in problematic
    if item['recommendedAction'] == 'retire'
]

for item in to_retire:
    print(f"Retire {item['itemId']}: {item['issues']}")
    
    # Mark as inactive
    db.execute(
        text("UPDATE baseline_items SET status = 'retired' WHERE id = :id"),
        {"id": item['itemId']}
    )
```

---

## Best Practices

1. **Recalibrate regularly:** Weekly batch recalibration for active items
2. **Monitor drift:** Review items with significant drift (>0.5 difficulty, >0.3 discrimination)
3. **Review problematic items:** Monthly review of items with severity ≥4
4. **Trust the process:** Bayesian method is stable; don't manually override unless necessary
5. **Track history:** Use revision history to understand parameter evolution
6. **Expert validation:** Items with quality score <60 should get human review

---

## Performance Optimization

- Recalibration uses last 200 responses (most recent data)
- Batch operations process items in parallel
- Quality reports cache results for 1 hour
- Automatic triggers use response count milestones (not time-based polling)

---

## Troubleshooting

### "Insufficient data" error
- Item needs 30+ responses before first calibration
- Check `responsesNeeded` field for count
- Wait for more learner responses

### Large drift detected
- Review item for ambiguity or external changes
- Check if learner population changed
- Consider if AI estimate was inaccurate initially
- Significant drift is normal during early calibration

### Poor fit statistics
- High χ²: Model doesn't match data, review item quality
- Low discrimination index: Revise distractors or check clarity
- High RMSE: Large prediction errors, consider revision

### No items in problematic list
- Ensure items have quality metrics recorded
- Check `times_used >= 20` threshold
- Verify items are marked `status = 'active'`

---

## Related Documentation

- [Baseline Assessment API](./BASELINE_ASSESSMENT_API.md)
- [Question Quality Validation](./QUESTION_QUALITY_QUICK_REF.md)
- [IRT Theory Reference](./IRT_QUICK_REFERENCE.md)
- [Admin Dashboard Integration](./ADMIN_DASHBOARD_INTEGRATION.md)
