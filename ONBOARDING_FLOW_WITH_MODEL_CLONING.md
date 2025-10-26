# 🚀 COMPLETE ONBOARDING FLOW WITH MODEL CLONING

## Updated Flow Sequence

### Step 1: Parent Enrollment
- **Where:** Parent Portal `/onboarding`
- **What:** Parent fills out child's information
  - Basic info (name, DOB, grade)
  - Learning profile (diagnoses, accommodations)
  - Accessibility preferences
  - IEP details (if applicable)
  - Parent consent
- **Outcome:** Learner record created in database
- **Next:** Redirect to Step 2

### Step 2: Baseline Assessment
- **Where:** Learner App `/onboarding/assessment`
- **What:** Child takes interactive baseline assessment
  - Math skills evaluation
  - Reading comprehension
  - Learning style detection
  - Adaptive difficulty
- **Data Collected:** 
  - Performance metrics
  - Response patterns
  - Time-on-task data
  - Preferred learning modalities
- **Outcome:** Assessment results stored
- **Next:** Redirect back to Parent Portal with `return_to=model_cloning`

### Step 3: Model Cloning (NEW!)
- **Where:** Parent Portal `/model-cloning?learner_id={id}`
- **What:** Transparent AI model personalization
  - **Stage 1 - Introduction:** Show what data will be used
    - Enrollment data (with PII indicators)
    - Assessment results summary
    - Privacy protections
  - **Stage 2 - Consent:** Parent reviews and consents
    - FERPA/COPPA compliant agreement
    - Consent version tracking
    - IP address + timestamp logging
  - **Stage 3 - Building:** Real-time 5-step build
    1. Copy base model
    2. Personalize with enrollment data
    3. Integrate assessment results
    4. Apply accessibility preferences
    5. Link diagnostic tools
  - **Stage 4 - Complete:** Success + Model Card
    - Model documentation
    - What happens next
    - Audit trail access
- **Outcome:** Personalized AI model created
- **Next:** Redirect to Parent Dashboard

### Step 4: Start Learning!
- **Where:** Learner App (main interface)
- **What:** Child uses personalized learning experience
- **Powered By:** Custom AI model from Step 3

---

## Technical Implementation

### Parent Portal Routes
```tsx
// apps/parent-portal/src/App.tsx
<Route path="/onboarding" element={<Onboarding />} />
<Route path="/model-cloning" element={<ModelCloning />} />
```

### Onboarding Completion Handler
```tsx
// apps/parent-portal/src/pages/onboarding/Onboarding.tsx
const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
window.location.href = learnerAppUrl;
```

### Learner App Assessment Completion
**TODO:** Update learner app to redirect back after assessment:
```tsx
// apps/learner-app/src/pages/onboarding/Assessment.tsx
const returnTo = searchParams.get('return_to');
if (returnTo === 'model_cloning') {
  const parentPortalUrl = `http://localhost:3001/model-cloning?learner_id=${learnerId}`;
  window.location.href = parentPortalUrl;
}
```

### Model Cloning Completion
```tsx
// apps/parent-portal/src/pages/ModelCloning.tsx
localStorage.setItem('current_model_id', modelId);
localStorage.setItem('model_cloning_complete', 'true');
navigate('/'); // Dashboard
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ENROLLMENT DATA                          │
│  • Student demographics                                     │
│  • Learning profile                                         │
│  • Accessibility needs                                      │
│  • IEP information                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  BASELINE ASSESSMENT                        │
│  • Performance metrics                                      │
│  • Learning patterns                                        │
│  • Skill levels                                             │
│  • Engagement indicators                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    MODEL CLONING                            │
│  Step 1: Copy base curriculum model                        │
│  Step 2: Personalize with enrollment data                  │
│  Step 3: Integrate assessment results ← KEY STEP           │
│  Step 4: Apply accessibility preferences                   │
│  Step 5: Link diagnostic tools                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              PERSONALIZED AI MODEL                          │
│  • Adapted to child's learning style                        │
│  • Calibrated to current skill level                        │
│  • Configured with accessibility features                   │
│  • Ready for adaptive learning                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Order?

### ❌ Wrong: Model Clone BEFORE Assessment
- No real learning data to personalize with
- Model would be generic baseline
- Defeats purpose of personalization

### ✅ Correct: Model Clone AFTER Assessment
- Assessment provides actual performance data
- Model personalized to real skill levels
- Incorporates learning patterns observed
- True adaptive personalization

---

## Files Modified

### ✅ Backend (Already Complete)
- `services/api-gateway/app/migrations/033_model_cloning.sql`
- `services/api-gateway/app/services/model_cloning_service.py`
- `services/api-gateway/app/routers/model_cloning.py`

### ✅ Parent Portal (Updated)
- `apps/parent-portal/src/pages/onboarding/Onboarding.tsx` - Redirects to assessment with return flag
- `apps/parent-portal/src/pages/ModelCloning.tsx` - Post-assessment cloning page
- `apps/parent-portal/src/App.tsx` - Added /model-cloning route
- `apps/parent-portal/src/components/ExplainableModelCloning.tsx` - Main workflow component

### ⏳ Learner App (TODO)
- `apps/learner-app/src/pages/onboarding/Assessment.tsx` - Need to add redirect after completion

---

## Testing the Flow

### 1. Start All Services
```powershell
# Terminal 1 - API Gateway
cd C:\Users\ofema\aivo-learning\services\api-gateway
python -m uvicorn app.main:app --reload --port 9000

# Terminal 2 - Parent Portal
cd C:\Users\ofema\aivo-learning
pnpm run dev --filter parent-portal

# Terminal 3 - Learner App
pnpm run dev --filter learner-app
```

### 2. Complete Onboarding
1. Go to http://localhost:3001/onboarding
2. Fill out child information
3. Complete all steps
4. Click "Complete Enrollment"

### 3. Take Baseline Assessment
- Automatically redirected to learner app
- Complete the assessment
- **Manual redirect needed for now** → Navigate to http://localhost:3001/model-cloning?learner_id={id}

### 4. Watch Model Cloning
- See transparent 5-step build
- Review Model Card
- Redirected to dashboard

---

## Next Steps

1. **Update Learner App** to redirect after assessment ⏳
2. **Test complete flow** end-to-end ⏳
3. **Add Model Card PDF export** (future)
4. **Add model correction interface** (future)
5. **Add model deletion workflow** (future)

---

## Status: ✅ Backend Complete | 🔄 Flow Integration In Progress
