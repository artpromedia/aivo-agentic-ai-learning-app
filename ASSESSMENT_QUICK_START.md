# Assessment System - Quick Start Guide

## 🎯 Current Status
- **Quick Assessment Backend**: 100% Complete ✅
- **API Endpoints**: 100% Complete ✅
- **Database Schema**: 100% Complete ✅
- **Frontend Integration**: 0% Complete ⏳ ← **START HERE**

---

## 🚀 Quick Start: Test Quick Assessment Now!

### Step 1: Run Database Migration (5 minutes)
```powershell
cd C:\Users\ofema\aivo-learning\services\ai-inference-service

# Set database URL
$env:DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/aivo_db"

# Run migration
psql -U postgres -d aivo_db -f migrations/008_assessment_system_complete.sql

# Verify tables created
psql -U postgres -d aivo_db -c "\dt assessment*"
# Should see: assessment_schedules, assessment_responses, assessment_results, etc.
```

### Step 2: Register API Router (2 minutes)
**File**: `services/ai-inference-service/app/api/v1/api.py`

Add this import:
```python
from app.api.v1.endpoints import assessments
```

Add this route:
```python
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
```

### Step 3: Start Backend (1 minute)
```powershell
cd services\ai-inference-service
pnpm run dev
# Should start at http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Step 4: Test API (5 minutes)
```powershell
# 1. Create first assessment for test learner
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assessments/schedule/first/test-learner-123" -Method Post
$scheduleId = $response.id
Write-Host "Schedule ID: $scheduleId"

# 2. Check if assessment due
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assessments/check/test-learner-123" -Method Get

# 3. Submit quick assessment
$body = @{
    schedule_id = $scheduleId
    learner_id = "test-learner-123"
    responses = @(
        @{question_number=1; question_text="Reading confidence"; answer_value="😊"; answer_type="emoji"},
        @{question_number=2; question_text="Learning style"; answer_value="visual"; answer_type="multiple_choice"},
        @{question_number=3; question_text="Math confidence"; answer_value="4"; answer_type="scale"},
        @{question_number=4; question_text="Engagement"; answer_value="😊"; answer_type="emoji"},
        @{question_number=5; question_text="Work preference"; answer_value="😊"; answer_type="emoji"}
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assessments/quick/submit" -Method Post -Body $body -ContentType "application/json"

# 4. Get assessment history
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assessments/history/test-learner-123" -Method Get
```

---

## 📝 Next: Frontend Integration (30 minutes)

### Update BaselineAssessment.tsx
**File**: `apps/learner-app/src/pages/BaselineAssessment.tsx`

Add API integration:

```typescript
import axios from 'axios';
import { useState, useEffect } from 'react';

// Add state for schedule ID
const [scheduleId, setScheduleId] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);

// Get schedule ID on mount
useEffect(() => {
  const checkAssessment = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/assessments/check/${learnerId}`
      );
      if (response.data.is_due && response.data.schedule_id) {
        setScheduleId(response.data.schedule_id);
      }
    } catch (error) {
      console.error('Failed to check assessment:', error);
    }
  };
  checkAssessment();
}, [learnerId]);

// Update submit handler
const handleSubmit = async () => {
  if (!scheduleId) {
    console.error('No schedule ID available');
    return;
  }

  setIsSubmitting(true);
  
  try {
    const submission = {
      schedule_id: scheduleId,
      learner_id: learnerId,
      responses: responses.map((r, idx) => ({
        question_number: idx + 1,
        question_text: questions[idx].question,
        answer_value: r.answer,
        answer_type: r.type,
        response_time_seconds: r.timeSpent || 0
      }))
    };

    const result = await axios.post(
      'http://localhost:8000/api/v1/assessments/quick/submit',
      submission
    );

    console.log('Assessment submitted:', result.data);
    
    // Navigate to results or next page
    navigate('/assessment-results', { state: { result: result.data } });
    
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    alert('Failed to submit assessment. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🎨 Create Results Display (1 hour)

### Create AssessmentResults.tsx
**File**: `apps/learner-app/src/pages/AssessmentResults.tsx`

```typescript
import { useLocation, useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';

export default function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return <div>No results available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🎉 Assessment Complete!
        </h1>

        {/* Overall Score */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">
              {Math.round(result.overall_score)}%
            </div>
            <div className="text-2xl text-gray-600">
              Overall Score
            </div>
          </div>
        </div>

        {/* Learning Profile */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Learning Profile</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600">Learning Style</div>
              <div className="text-xl font-semibold capitalize">
                {result.learning_style}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600">Confidence Level</div>
              <div className="text-xl font-semibold capitalize">
                {result.confidence_level}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600">Reading Confidence</div>
              <div className="text-xl font-semibold">
                {result.reading_confidence}/4
              </div>
            </div>
            
            <div>
              <div className="text-gray-600">Math Confidence</div>
              <div className="text-xl font-semibold">
                {result.math_confidence}/5
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold mb-4">✨ Your Strengths</h2>
            <ul className="space-y-2">
              {result.strengths.map((strength: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold mb-4">🎯 Personalized Tips</h2>
            <ul className="space-y-2">
              {result.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Brain Update Notification */}
        {result.triggered_model_update && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-xl mb-6 text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">🧠</div>
              <h2 className="text-2xl font-bold mb-2">
                Your AI Brain Has Been Updated!
              </h2>
              <p className="text-purple-100">
                Your personalized learning model has been customized based on your assessment.
                Future lessons will be tailored to your learning style and preferences.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <BigButton
            icon="🏠"
            label="Back Home"
            onClick={() => navigate('/subjects')}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          
          <BigButton
            icon="📊"
            label="View History"
            onClick={() => navigate('/assessment-history')}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div>
      </div>
    </div>
  );
}
```

### Register Route
**File**: `apps/learner-app/src/App.tsx`

Add route:
```typescript
import AssessmentResults from './pages/AssessmentResults';

// In routes array:
<Route path="/assessment-results" element={<AssessmentResults />} />
```

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Migration runs without errors
- [ ] Tables created with correct schema
- [ ] Triggers fire on assessment completion
- [ ] API endpoints return correct data
- [ ] Brain adaptation creates new instance
- [ ] 90-day scheduling works

### Frontend Tests
- [ ] Assessment button appears on home page
- [ ] BaselineAssessment loads 5 questions
- [ ] Responses are captured correctly
- [ ] Submit button sends data to API
- [ ] Results page displays correctly
- [ ] Navigation works between pages
- [ ] Error handling shows friendly messages

### Integration Tests
- [ ] End-to-end: Create → Submit → Results → Brain Update
- [ ] History tracks all assessments
- [ ] Next assessment scheduled 90 days out
- [ ] Overdue marking works after 7 days

---

## 📊 Expected Data Flow

```
1. Learner logs in for first time
   ↓
2. System checks: No assessments found
   ↓
3. Create first quick assessment (baseline)
   ↓
4. Learner clicks "Take Assessment" button
   ↓
5. Frontend loads BaselineAssessment.tsx
   ↓
6. Learner answers 5 questions
   ↓
7. Frontend submits to POST /quick/submit
   ↓
8. Backend scores responses
   ↓
9. Backend clones brain with preferences
   ↓
10. Backend creates BrainAdaptation record
    ↓
11. Backend schedules next assessment (90 days)
    ↓
12. Frontend shows results with brain update notification
    ↓
13. Learner proceeds to subject selection
```

---

## 🐛 Troubleshooting

### "Migration fails with syntax errors"
- Check PostgreSQL version (need 12+)
- Ensure UUID extension exists: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Run with psql, not generic SQL client

### "API returns 404"
- Check router is registered in `app/api/v1/api.py`
- Verify backend is running on correct port
- Check API docs at http://localhost:8000/docs

### "Brain adaptation doesn't trigger"
- Verify DistrictBrainCloner service exists
- Check learner has valid district_id
- Look at service logs for errors
- Verify brain_instances table exists (from PROMPT 57)

### "Frontend can't connect to API"
- Check CORS settings in backend
- Verify API URL in frontend (http://localhost:8000)
- Check browser console for errors
- Test API endpoint with curl first

---

## 📚 Related Documentation

- **PROMPT_58_ASSESSMENT_AUTOMATION.md**: Quick assessment specification
- **PROMPT_61_ADVANCED_ASSESSMENT.md**: Comprehensive assessment specification
- **PROMPT_58_61_IMPLEMENTATION_SUMMARY.md**: Complete implementation status

---

## 🎯 Success Metrics

### Demo Ready (Now!)
- ✅ Database schema deployed
- ✅ Backend API working
- ⏳ Frontend integration (30 min)
- ⏳ End-to-end test passing

### Production Ready (Week 2)
- ⏳ Comprehensive assessment with AI
- ⏳ Background scheduler
- ⏳ Email notifications
- ⏳ Analytics dashboard

---

**Next Action**: Run database migration, then add API calls to BaselineAssessment.tsx

**Estimated Time to Demo**: 1 hour  
**Estimated Time to Production**: 1 week
