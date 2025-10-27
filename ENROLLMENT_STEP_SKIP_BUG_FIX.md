# Enrollment Wizard Step Skipping Bug Fix ✅

## Problem
When enrolling a child through the parent portal:
1. ❌ Step 2 (Basic Information) was being **skipped**
2. ❌ User went directly from Role Selection to Learning Profile
3. ❌ Form submission failed with "required fields missing" error
4. ❌ Clicking "Back" would then show the Basic Information form (that was skipped)

## Root Cause

### The Bug
In `handleRoleSelection()`, when a parent selected their role:
```typescript
// BEFORE (BUGGY):
const handleRoleSelection = (role: 'parent' | 'teacher') => {
  setEnrollmentRole(role);
  setLearnerData({ ...learnerData, enrollmentRole: role });
  setCurrentStep(1); // ❌ WRONG! Sets step to 1
};
```

### Why This Caused the Issue

**Step Array Construction:**
```typescript
if (enrollmentRole === null) {
  return [RoleSelectionStep]; // Role selection screen
}

if (enrollmentRole === 'teacher') {
  baseSteps.push(LicenseStep); // Teachers get license step at index 0
}

// Then add remaining steps for everyone
baseSteps.push(
  BasicInfoStep,      // Parents: index 0, Teachers: index 1
  LearningProfileStep, // Parents: index 1, Teachers: index 2
  AccessibilityStep,   // Parents: index 2, Teachers: index 3
  IEPStep,            // Parents: index 3, Teachers: index 4
  ConsentStep         // Parents: index 4, Teachers: index 5
);
```

**For Parents:**
1. After selecting "Parent" role, steps array becomes:
   ```
   [BasicInfoStep, LearningProfileStep, AccessibilityStep, IEPStep, ConsentStep]
     ↑ index 0      ↑ index 1
   ```
2. BUT `setCurrentStep(1)` was being called
3. So it jumped to index 1 (LearningProfileStep) → **BasicInfoStep was skipped!**

**For Teachers:**
1. After selecting "Teacher" role, steps array becomes:
   ```
   [LicenseStep, BasicInfoStep, LearningProfileStep, ...]
     ↑ index 0    ↑ index 1
   ```
2. `setCurrentStep(1)` would skip LicenseStep
3. But the JSX has special handling: `enrollmentRole === 'teacher' && currentStep === 0`
4. This condition would be FALSE (since currentStep = 1), so license step wouldn't show

## Solution

### Fix 1: Set currentStep to 0
```typescript
// AFTER (FIXED):
const handleRoleSelection = (role: 'parent' | 'teacher') => {
  setEnrollmentRole(role);
  setLearnerData({ ...learnerData, enrollmentRole: role });
  
  // For parents: start at step 0 (Basic Info)
  // For teachers: start at step 0 (License validation)
  setCurrentStep(0); // ✅ CORRECT! Start at index 0
};
```

### Fix 2: Update License Handler
```typescript
// BEFORE (HARDCODED):
const handleLicenseData = (data) => {
  // ...
  setCurrentStep(2); // ❌ Hardcoded assumption
};

// AFTER (DYNAMIC):
const handleLicenseData = (data) => {
  // ...
  // Move to next step (Basic Info, which is now step 1 for teachers)
  setCurrentStep(currentStep + 1); // ✅ Increment properly
};
```

## Correct Flow After Fix

### For Parents:

```
Step -1: Role Selection Screen
  │
  └─> Select "Parent"
      │
      └─> setEnrollmentRole('parent')
          setCurrentStep(0)
          │
          ↓
Step 0: Basic Information ✅
  [firstName, lastName, DOB, grade]
  │
  └─> Click "Continue"
      │
      └─> setCurrentStep(1)
          │
          ↓
Step 1: Learning Profile
  [diagnoses, accommodations, etc.]
  │
  └─> Continue or Skip
      │
      ↓
Step 2: Accessibility
  │
  ↓
Step 3: IEP Information
  │
  ↓
Step 4: Consent & Confirm
  │
  └─> Click "Complete Enrollment"
      │
      └─> ✅ All required fields present!
```

### For Teachers:

```
Step -1: Role Selection Screen
  │
  └─> Select "Teacher"
      │
      └─> setEnrollmentRole('teacher')
          setCurrentStep(0)
          │
          ↓
Step 0: License Validation ✅
  [licenseKey, studentName]
  │
  └─> Click "Validate"
      │
      └─> setCurrentStep(currentStep + 1) // = 1
          │
          ↓
Step 1: Basic Information ✅
  [pre-filled from license]
  │
  └─> Continue
      │
      ↓
[Same steps as parents...]
```

## Files Modified

**File**: `apps/parent-portal/src/components/Enrollment/EnrollmentWizard.tsx`

**Changes**:
1. Line ~112: Changed `setCurrentStep(1)` to `setCurrentStep(0)` in `handleRoleSelection`
2. Line ~122: Changed `setCurrentStep(2)` to `setCurrentStep(currentStep + 1)` in `handleLicenseData`

## Testing Steps

### Test 1: Parent Flow - Basic Information Not Skipped
1. Go to parent portal onboarding
2. Select "I'm a Parent"
3. **✅ VERIFY**: Next screen shows "Basic Information" (firstName, lastName, DOB, grade)
4. Try to click "Continue" without filling anything
5. **✅ VERIFY**: Validation errors appear
6. Fill in all required fields
7. Click "Continue"
8. **✅ VERIFY**: Moves to "Learning Profile" step
9. Continue through all steps
10. Click "Complete Enrollment"
11. **✅ VERIFY**: No missing field errors!
12. **✅ VERIFY**: Successfully redirects to learner app

### Test 2: Back Button Works Correctly
1. Start onboarding as parent
2. Fill Basic Information and click "Continue"
3. On Learning Profile, click "Back"
4. **✅ VERIFY**: Shows Basic Information with data preserved
5. **✅ VERIFY**: Can edit and continue again

### Test 3: Teacher Flow - License Step Not Skipped
1. Go to onboarding
2. Select "I'm a Teacher"
3. **✅ VERIFY**: Next screen shows "District License" validation
4. Enter license key and student name
5. Click "Validate"
6. **✅ VERIFY**: Moves to "Basic Information" (pre-filled with name from license)
7. **✅ VERIFY**: No steps are skipped
8. Continue through all steps
9. **✅ VERIFY**: Successful enrollment

### Test 4: Progress Bar Accuracy
1. Start onboarding as parent
2. **✅ VERIFY**: Progress bar shows "Step 1 of 5" on Basic Information
3. Continue to next step
4. **✅ VERIFY**: Progress bar shows "Step 2 of 5"
5. **✅ VERIFY**: Progress percentage increases correctly

## Why Back Button Made Form Appear

**Before the fix:**
1. Select "Parent" → currentStep = 1 (skips BasicInfo at index 0)
2. You see Learning Profile (index 1)
3. Click "Back" → currentStep = 0
4. Now BasicInfo (index 0) appears → "Why wasn't this shown before?" 🤔

**After the fix:**
1. Select "Parent" → currentStep = 0
2. You see BasicInfo (index 0) ✅
3. Fill form and continue → currentStep = 1
4. You see Learning Profile (index 1) ✅
5. Click "Back" → currentStep = 0
6. BasicInfo appears again (expected behavior) ✅

## Additional Notes

### Step Indexing After Role Selection

| Role | Steps Array | currentStep | First Visible Step |
|------|------------|-------------|-------------------|
| null | [RoleSelection] | N/A | Role Selection |
| parent | [BasicInfo, LearningProfile, ...] | 0 | BasicInfo ✅ |
| teacher | [License, BasicInfo, LearningProfile, ...] | 0 | License ✅ |

### Special JSX Rendering Logic

The wizard has 3 rendering conditions in the JSX:
```tsx
{enrollmentRole === null ? (
  <RoleSelectionStep />
) : enrollmentRole === 'teacher' && currentStep === 0 ? (
  <TeacherLicenseStep />
) : (
  <StepComponent /> // Regular step from array
)}
```

This means:
- Role selection is rendered when `enrollmentRole === null`
- Teacher license is rendered when `teacher` role + `currentStep === 0`
- All other steps use the component from steps array at `steps[currentStep]`

## Status: ✅ FIXED

The enrollment wizard now:
- ✅ Shows Basic Information step for parents (not skipped)
- ✅ Shows License step for teachers (not skipped)
- ✅ Has correct step indexing
- ✅ Validates required fields correctly
- ✅ Back button works as expected
- ✅ Progress bar shows accurate step numbers

---

**Date Fixed**: October 26, 2025  
**Impact**: Critical - Was blocking all parent enrollments  
**Priority**: P0 - Core onboarding flow
