# Quick Reference: @aivo/types

## Import Patterns

```typescript
// Core entities
import { User, Parent, Teacher, Learner, IEP, Activity, Assessment } from '@aivo/types';

// API types
import { ApiResponse, PaginatedResponse, CreateLearnerRequest } from '@aivo/types';

// Error handling
import { ErrorCode, AppError, ErrorMessages, ErrorStatusCodes } from '@aivo/types';

// Common utilities
import { DataPoint, PaginationParams, Address } from '@aivo/types';
```

## Type Categories

### 1. User & Auth
- `User`, `Parent`, `Teacher`, `Administrator`
- `AuthCredentials`, `AuthToken`, `AuthResponse`, `Session`
- `Permission` (10 values), `UserRole` (4 values)
- `NotificationSettings`

### 2. Learner
- `Learner`, `LearnerPreferences`, `LearningProfile`, `SupportNeeds`
- `LearnerProgressSummary`, `SubjectProgress`
- `Achievement`, `AchievementType` (17 types)
- `LearnerSession`, `EmotionalState`

### 3. IEP
- `IEP`, `IEPStatus` (6 statuses)
- `IEPGoal` (8 domains), `GoalProgressReport`
- `Accommodation`, `Modification`
- `Service`, `ServiceType` (12 types), `ServiceLog`
- `IEPTeamMember`, `MeetingNote`, `IEPDocument`

### 4. Activity
- `Activity`, `ActivitySubject` (11 subjects), `ActivityType` (30+ types)
- `ActivityResponse`, `QuestionType` (9 types)
- `ActivityMetadata`, `ActivityTemplate`
- `ActivityAnalytics`, `AdaptiveRecommendation`, `LearningPath`

### 5. Assessment
- `BaselineAssessment`, `SubjectAssessment`, `SkillAssessment`
- `ProgressAssessment`, `SkillProgress`
- `Intervention`, `InterventionType` (10 types)
- `DiagnosticAssessment`, `FormativeAssessment`, `SummativeAssessment`
- `AssessmentAnalytics`

### 6. Communication
- `Message`, `Conversation`, `Attachment`
- `Notification`, `NotificationType` (18 types)
- `CalendarEvent`, `CalendarEventType` (7 types)
- `Subscription`, `PaymentMethod`, `BillingTransaction`
- `School`, `District`

### 7. System
- `AIModel`, `ModelParameters`, `ModelAdaptation`
- `LearningContent`, `AccessibilityFeatures`
- `AnalyticsDashboard`, `ChartData`, `Insight`
- `Report`, `ReportType` (7 types)
- `SystemConfig`, `AuditLog`

### 8. API
- `ApiResponse<T>`, `PaginatedResponse<T>`
- `CreateUserRequest`, `UpdateUserRequest`
- `CreateLearnerRequest`, `UpdateLearnerRequest`
- `CreateIEPRequest`, `UpdateIEPGoalProgressRequest`
- `AssignActivityRequest`, `CompleteActivityRequest`
- ... 40+ request interfaces

### 9. Errors
- `ErrorCode` (70+ codes)
- `AppError`, `ValidationError`, `AuthenticationError`
- `NotFoundError`, `ConflictError`, `RateLimitError`
- `ErrorStatusCodes`, `ErrorMessages`

### 10. Common
- `DataPoint`, `Timestamps`, `Address`
- `PaginationParams`, `PaginationMetadata`
- `DateRange`, `FileMetadata`
- `Result<T>`, `Nullable<T>`, `Optional<T>`

## Common Patterns

### API Call with Error Handling
```typescript
import { ApiResponse, ErrorCode, Learner } from '@aivo/types';

async function getLearner(id: string): Promise<Learner> {
  const response: ApiResponse<Learner> = await api.get(`/learners/${id}`);
  
  if (!response.success) {
    switch (response.error?.code) {
      case 'LEARNER_NOT_FOUND':
        throw new Error('Learner not found');
      case 'AUTHZ_ACCESS_DENIED':
        throw new Error('Access denied');
      default:
        throw new Error('Unknown error');
    }
  }
  
  return response.data!;
}
```

### Pagination
```typescript
import { PaginatedResponse, PaginationParams, Learner } from '@aivo/types';

const params: PaginationParams = {
  page: 1,
  limit: 20,
  sortBy: 'firstName',
  sortOrder: 'asc'
};

const response: PaginatedResponse<Learner> = await api.getLearners(params);

console.log(`Page ${response.pagination.page} of ${response.pagination.totalPages}`);
console.log(`Total: ${response.pagination.total} learners`);
response.data.forEach(learner => console.log(learner.firstName));
```

### Type Guards
```typescript
import { User, Teacher, Parent } from '@aivo/types';

function isTeacher(user: User): user is Teacher {
  return user.role === 'teacher';
}

function isParent(user: User): user is Parent {
  return user.role === 'parent';
}

// Usage
if (isTeacher(user)) {
  console.log(user.subjects); // TypeScript knows this is a Teacher
}
```

### Progress Tracking
```typescript
import { SubjectProgress } from '@aivo/types';

const progress: SubjectProgress = {
  subject: 'reading',
  currentLevel: 3.2,
  completedLessons: 15,
  totalLessons: 25,
  mastery: 'developing',
  trending: 'up',
  lastPracticedAt: new Date()
};

if (progress.trending === 'up') {
  console.log('Great progress! 🎉');
}
```

### Creating Activities
```typescript
import { CreateActivityRequest, ActivitySubject, ActivityType } from '@aivo/types';

const request: CreateActivityRequest = {
  learnerId: 'learner-123',
  subject: 'math' as ActivitySubject,
  type: 'addition' as ActivityType,
  difficulty: 2.5,
  duration: 600, // 10 minutes
  iepGoalsAddressed: ['goal-1', 'goal-2']
};
```

### IEP Goal Updates
```typescript
import { UpdateIEPGoalProgressRequest, DataPoint } from '@aivo/types';

const update: UpdateIEPGoalProgressRequest = {
  goalId: 'goal-123',
  progressPercentage: 75,
  observations: 'Student showing consistent improvement',
  dataPoints: [
    { date: new Date(), value: 85, notes: 'Assessment score' }
  ],
  nextSteps: 'Continue current strategies'
};
```

## Error Code Ranges

- **1000-1099**: Authentication errors
- **1100-1199**: Authorization errors
- **1200-1299**: Validation errors
- **1300-1399**: Resource errors
- **1400-1499**: User errors
- **1500-1599**: Learner errors
- **1600-1699**: IEP errors
- **1700-1799**: Activity errors
- **1800-1899**: Assessment errors
- **1900-1999**: Content errors
- **2000-2099**: AI Model errors
- **2100-2199**: Subscription errors
- **2200-2299**: Payment errors
- **2300-2399**: Rate limit errors
- **5000-5099**: Server errors

## Type Statistics

- **Files**: 10 modules
- **Interfaces**: 150+
- **Type Unions**: 30+
- **Error Codes**: 70+
- **Lines**: 2,000+

## Resources

- Full documentation: `packages/types/README.md`
- Implementation details: `TYPES_IMPLEMENTATION_COMPLETE.md`
- Source code: `packages/types/src/`
