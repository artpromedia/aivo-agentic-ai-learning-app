# IEP Management & Analytics API - Quick Reference

## IEP Management Endpoints

### Base URL: `/api/v1/iep`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/goals` | Create new IEP goal | ✅ Parent/Teacher/Admin |
| GET | `/learners/{id}/goals` | List all goals for learner | ✅ |
| GET | `/goals/{id}` | Get specific goal details | ✅ |
| PATCH | `/goals/{id}` | Update goal | ✅ |
| DELETE | `/goals/{id}` | Delete goal | ✅ Teacher/Admin only |
| POST | `/goals/{id}/data-points` | Add progress data point | ✅ |
| POST | `/learners/{id}/upload-document` | Upload IEP document | ✅ |
| GET | `/goals/{id}/analytics` | Get goal analytics | ✅ |

## Analytics Endpoints

### Base URL: `/api/v1/analytics`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/learners/{id}` | Comprehensive analytics | ✅ Parent only |
| GET | `/learners/{id}/engagement` | Engagement metrics | ✅ Parent only |
| GET | `/learners/{id}/iep-progress` | IEP progress summary | ✅ Parent only |
| GET | `/learners/{id}/subjects` | Subject performance | ✅ Parent only |
| POST | `/learners/{id}/export` | Export analytics | ✅ Parent only |
| GET | `/learners/{id}/daily-summary` | Daily summary | ✅ Parent only |

## Example Requests

### Create IEP Goal
```bash
POST /api/v1/iep/goals
{
  "learner_id": "uuid",
  "goal_name": "Read 100 sight words independently",
  "goal_description": "Student will recognize and read 100 high-frequency sight words without assistance",
  "category": "reading",
  "current_level": "Recognizes 25 sight words",
  "target_level": "Recognizes 100 sight words",
  "start_date": "2025-09-01",
  "target_date": "2026-06-01",
  "accommodations": ["extra_time", "visual_supports", "read_aloud"]
}
```

### Add Progress Data Point
```bash
POST /api/v1/iep/goals/{goal_id}/data-points
{
  "value": 45,
  "notes": "Monthly assessment shows student now recognizes 45 sight words",
  "recorded_by": "teacher_id"
}
```

### Get Learner Analytics
```bash
GET /api/v1/analytics/learners/{learner_id}?start_date=2025-09-21&end_date=2025-10-21
```

### Get IEP Progress Summary
```bash
GET /api/v1/analytics/learners/{learner_id}/iep-progress
```

### Export Analytics
```bash
POST /api/v1/analytics/learners/{learner_id}/export
{
  "date_range": {
    "learner_id": "uuid",
    "start_date": "2025-09-01",
    "end_date": "2025-10-21"
  },
  "format": "pdf",
  "include_charts": true,
  "include_recommendations": true,
  "include_sections": ["engagement", "progress", "iep_goals", "subjects"]
}
```

## IEP Goal Categories

- `reading` - Reading comprehension and literacy
- `math` - Mathematical concepts and problem-solving
- `social` - Social skills and interactions
- `motor` - Fine and gross motor skills
- `communication` - Verbal and non-verbal communication

## IEP Goal Status

- `not-started` - Goal created but no progress yet
- `on-track` - Progress is meeting timeline (40-100%)
- `needs-attention` - Behind schedule or low progress (<40%)
- `exceeding` - Ahead of schedule (>100%)

## Analytics Metrics

### Engagement Metrics
- Total sessions count
- Total minutes spent
- Average session duration
- Active days count
- Current streak (consecutive days)
- Last activity date
- Activity rate percentage

### Progress Metrics
- Average score across activities
- Score trend (improving/stable/declining)
- Mastery level (beginner/developing/proficient/advanced)
- Skills mastered count
- Skills in progress count
- Recent achievements

### IEP Goal Progress
- Active goals list
- Progress percentages
- On-track status
- Days remaining until target
- Data points count

### Subject Metrics
- Activities completed per subject
- Average scores per subject
- Time spent per subject
- Recent activities (top 5)

### Focus Metrics
- Distraction events count
- Focus score (0-10)
- Game breaks used
- Focus time vs break time
- Optimal session length

### Homework Metrics
- Total and completed sessions
- Completion rate
- Average session duration
- Hints requested
- Explanations requested
- Photos uploaded
- Handwriting submissions

### Accommodation Metrics
- Active accommodations count
- Most used accommodations
- Sensory profile changes
- Regulation activities completed
- Emotion check-ins count
- Average emotion level

## Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Goal Analytics Response

```json
{
  "goal_id": "uuid",
  "progress_percentage": 45,
  "status": "on-track",
  "trend": "improving",
  "velocity_per_week": 2.5,
  "projected_completion_date": "2026-05-15",
  "days_until_target": 237,
  "data_points_count": 3,
  "recommendations": [
    "Great progress! Continue current strategies",
    "Consider adding 2 more data points this month"
  ]
}
```

## Export Formats

- **PDF** - Formatted report for printing/sharing
- **CSV** - Raw data for spreadsheet analysis
- **JSON** - Complete structured data export

## Access Control

### Parents
- Can create/view/update goals for their learners
- Can add data points
- Can upload IEP documents
- Can view all analytics for their learners

### Teachers
- Full access to assigned learners
- Can delete goals
- Can perform all operations

### Admins
- Full access to all learners
- Complete CRUD operations

## Query Parameters

### Analytics Endpoints
- `start_date` (optional) - Start of date range (defaults to 30 days ago)
- `end_date` (optional) - End of date range (defaults to today)
- `days` (optional) - Number of days to look back (defaults to 30)
- `summary_date` (required for daily-summary) - Specific date

### IEP List Endpoint
- `category` (optional) - Filter by category
- `status` (optional) - Filter by status

## Error Codes

- `404` - Resource not found or access denied
- `403` - Forbidden (insufficient permissions)
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `204` - No content (successful deletion)

## File Upload Specifications

### IEP Documents
- **Formats:** PDF, DOC, DOCX
- **Max Size:** 5MB
- **Validation:** Automatic file type and size checking
- **Storage:** Organized by learner ID in folders

## Recommendations Engine

The system generates personalized recommendations based on:
- Engagement patterns (streak, activity rate)
- Progress trends (improving/declining)
- IEP goal status (needs-attention)
- Focus metrics (distraction rate)

Example recommendations:
- "Try to establish a daily learning routine for consistency"
- "Great job maintaining a 7+ day streak! Keep it up!"
- "Excellent progress! Consider increasing challenge level"
- "2 IEP goal(s) need attention"
- "High distraction rate - try shorter sessions with more breaks"

## Best Practices

### For Data Collection
1. Add data points regularly (weekly or bi-weekly)
2. Include detailed notes for context
3. Use consistent measurement methods
4. Record observations immediately

### For Goal Setting
1. Use SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Break large goals into smaller milestones
3. Align with learner's IEP document
4. Review and adjust quarterly

### For Analytics Review
1. Check weekly engagement patterns
2. Monitor IEP goal progress monthly
3. Review subject performance regularly
4. Use trend data for instructional decisions

### For Exports
1. Generate reports before IEP meetings
2. Use PDF for sharing with team
3. Use CSV for detailed analysis
4. Include all relevant sections

## Integration Examples

### Daily Parent Notification
```javascript
// Check today's activity
const summary = await fetch(
  `/analytics/learners/${learnerId}/daily-summary?summary_date=${today}`
);

if (summary.data.active) {
  sendNotification(
    `${learner.name} completed ${summary.data.activities_completed} activities today!`
  );
}
```

### Weekly Progress Email
```javascript
// Get 7-day analytics
const analytics = await fetch(
  `/analytics/learners/${learnerId}?days=7`
);

generateEmailReport({
  engagement: analytics.data.engagement,
  progress: analytics.data.progress,
  recommendations: analytics.data.recommendations
});
```

### IEP Meeting Dashboard
```javascript
// Load all IEP data
const goals = await fetch(`/iep/learners/${learnerId}/goals`);
const progress = await fetch(`/analytics/learners/${learnerId}/iep-progress`);

// Show goal-by-goal analytics
for (const goal of goals.data) {
  const analytics = await fetch(`/iep/goals/${goal.id}/analytics`);
  displayGoalCard(goal, analytics);
}
```

## Testing Endpoints

Use Swagger UI at `/docs` or:

```bash
# Get auth token first
TOKEN="your_jwt_token"

# Test IEP goal creation
curl -X POST "http://localhost:8000/api/v1/iep/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "uuid",
    "goal_name": "Test Goal",
    "category": "reading",
    "current_level": "Level 1",
    "target_level": "Level 2",
    "start_date": "2025-10-01",
    "target_date": "2026-01-01"
  }'

# Test analytics
curl -X GET "http://localhost:8000/api/v1/analytics/learners/uuid" \
  -H "Authorization: Bearer $TOKEN"
```

## Support & Documentation

- **Full Documentation:** `IEP_ANALYTICS_API_COMPLETE.md`
- **API Docs:** `/docs` (Swagger UI)
- **Repository:** artpromedia/aivo-agentic-ai-learning-app

---

**Quick Reference Complete! 📊**
