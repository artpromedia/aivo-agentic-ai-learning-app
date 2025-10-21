# @aivo/types

Comprehensive TypeScript type definitions for the Aivo Learning platform. This package provides shared types across all applications in the monorepo.

## Overview

This package contains 1000+ lines of production-ready TypeScript interfaces, types, and enums covering the entire Aivo Learning platform data model.

## Installation

```bash
pnpm add @aivo/types
```

## Usage

```typescript
import {
  User,
  Parent,
  Teacher,
  Learner,
  IEP,
  Activity,
  Assessment,
  ApiResponse,
  ErrorCode
} from '@aivo/types';
```

## Type Modules

### 1. Common Types (`common.ts`)

Foundational utility types used across the platform:

- **DataPoint**: Time-series data tracking
- **Timestamps**: Standard createdAt/updatedAt fields
- **PaginationParams/PaginationMetadata**: Pagination support
- **Address**: Physical address structure
- **FileMetadata**: File upload tracking
- **DateRange**: Date range filtering
- **Result<T>**: Success/failure result type

```typescript
import { DataPoint, PaginationParams, Address } from '@aivo/types';
```

### 2. User Types (`user.ts`)

User management and authentication types:

- **User**: Base user interface
- **Parent**: Parent-specific fields and preferences
- **Teacher**: Teacher-specific fields and preferences
- **Administrator**: Admin roles and permissions
- **NotificationSettings**: User notification preferences
- **AuthCredentials/AuthToken/AuthResponse**: Authentication system
- **Session**: Session management

**Key Features:**
- 4 user roles: parent, teacher, administrator, learner
- 10 permission types for role-based access control
- Emergency contact management
- Notification preferences (8 types)
- Session tracking with device info

```typescript
import { User, Parent, Teacher, Permission } from '@aivo/types';

const teacher: Teacher = {
  id: '123',
  email: 'teacher@school.edu',
  role: 'teacher',
  schoolName: 'Lincoln Elementary',
  subjects: ['Math', 'Reading'],
  // ...
};
```

### 3. Learner Types (`learner.ts`)

Learner profiles, preferences, and progress tracking:

- **Learner**: Core learner profile
- **LearnerPreferences**: UI/UX customization (10 settings)
  - Learning styles (visual, auditory, kinesthetic)
  - Text size, color scheme, voice settings
  - Animation speed, read-aloud preferences
- **LearningProfile**: Cognitive profile and learning patterns
- **SupportNeeds**: 10 types of learning support
- **LearnerProgressSummary**: Comprehensive progress tracking
- **SubjectProgress**: Per-subject metrics with trending
- **Achievement**: Badge/reward system (17 achievement types)
- **LearnerSession**: Session tracking with emotional state
- **EmotionalState**: Real-time emotion tracking

```typescript
import { Learner, LearnerPreferences, Achievement } from '@aivo/types';

const preferences: LearnerPreferences = {
  learningStyle: ['visual', 'kinesthetic'],
  textSize: 'large',
  colorScheme: 'high-contrast',
  soundEffects: true,
  readAloud: true,
  // ...
};
```

### 4. IEP Types (`iep.ts`)

Individualized Education Program management:

- **IEP**: Complete IEP document (6 status types)
- **IEPGoal**: Goals across 8 domains (reading, math, speech, etc.)
- **GoalProgressReport**: Progress tracking with data points
- **Accommodation**: 4 categories of accommodations
- **Modification**: Curriculum modifications
- **Service**: 12 service types (speech therapy, OT, PT, etc.)
- **ServiceLog**: Session delivery tracking
- **IEPTeamMember**: 7 team member roles
- **MeetingNote**: Meeting documentation with action items
- **IEPDocument**: Document management
- **IEPTimelineEvent**: Full audit trail
- **IEPAnalytics**: Compliance and progress analytics

```typescript
import { IEP, IEPGoal, Service, IEPStatus } from '@aivo/types';

const iep: IEP = {
  id: '456',
  learnerId: '123',
  status: 'active',
  goals: [...],
  services: [...],
  team: [...],
  // ...
};
```

### 5. Activity Types (`activity.ts`)

Learning activity tracking and adaptive learning:

- **Activity**: Core activity interface (15 properties)
- **ActivitySubject**: 11 subjects
- **ActivityType**: 30+ activity types (reading, math, speech, etc.)
- **ActivityResponse**: Question-level response tracking
- **QuestionType**: 9 question types
- **ActivityMetadata**: Adaptive learning data
- **ActivityTemplate**: Teacher-created activities
- **ActivityAssignment**: Assignment tracking
- **ActivityAnalytics**: Performance analytics
- **AdaptiveRecommendation**: AI-driven recommendations
- **LearningPath**: Structured learning sequences

```typescript
import { Activity, ActivityType, ActivityAnalytics } from '@aivo/types';

const activity: Activity = {
  id: '789',
  learnerId: '123',
  subject: 'math',
  type: 'addition',
  difficulty: 2.5,
  accuracy: 85,
  engagementScore: 90,
  // ...
};
```

### 6. Assessment Types (`assessment.ts`)

Comprehensive assessment and progress monitoring:

- **BaselineAssessment**: Initial student assessment
- **SubjectAssessment**: Per-subject evaluation
- **SkillAssessment**: Granular skill tracking
- **ProgressAssessment**: Ongoing progress monitoring (6 periods)
- **SkillProgress**: Skill growth tracking with trends
- **Intervention**: RTI (Response to Intervention) support (10 types, 3 tiers)
- **ProgressMonitoringData**: Data collection system
- **DiagnosticAssessment**: Formal standardized assessments
- **FormativeAssessment**: In-lesson checks
- **SummativeAssessment**: End-of-unit evaluations
- **AssessmentSchedule**: Assessment scheduling
- **AssessmentAnalytics**: Predictive analytics

```typescript
import { BaselineAssessment, Intervention, SkillProgress } from '@aivo/types';

const assessment: BaselineAssessment = {
  id: '101',
  learnerId: '123',
  assessmentType: 'initial-baseline',
  subjects: [...],
  overallRecommendations: [...],
  // ...
};
```

### 7. Communication Types (`communication.ts`)

Messaging, notifications, calendar, and billing:

- **Message/Conversation**: Parent-teacher messaging
- **Notification**: System notifications (18 notification types)
- **CalendarEvent**: Scheduling and calendar management
- **RecurrenceRule**: Recurring event support
- **Subscription**: Subscription and billing
- **PaymentMethod**: Payment management
- **School/District**: Organization management

```typescript
import { Message, Notification, CalendarEvent, Subscription } from '@aivo/types';

const message: Message = {
  id: '202',
  subject: 'IEP Meeting Reminder',
  priority: 'high',
  learnerId: '123',
  // ...
};
```

### 8. System Types (`system.ts`)

AI models, content, analytics, and reporting:

- **AIModel**: Personalized AI model for each learner
- **ModelParameters**: Adaptive learning parameters
- **ModelAdaptation**: Model adjustment tracking
- **LearningContent**: Educational content library
- **AccessibilityFeatures**: 8 accessibility features
- **AnalyticsDashboard**: Comprehensive dashboards
- **ChartData**: Data visualization support
- **Report**: Report generation system (7 report types)
- **SystemConfig**: System configuration
- **AuditLog**: Full audit logging

```typescript
import { AIModel, ModelParameters, LearningContent } from '@aivo/types';

const model: AIModel = {
  id: '303',
  learnerId: '123',
  status: 'active',
  accuracy: 92,
  parameters: {
    difficultyAdjustment: 0.2,
    paceModifier: 1.1,
    // ...
  },
  // ...
};
```

### 9. API Types (`api.ts`)

Request/response interfaces for all API endpoints:

- **ApiResponse<T>**: Generic API response wrapper
- **PaginatedResponse<T>**: Paginated list responses
- **Request Interfaces**: 40+ request interfaces covering:
  - User management (create, update, auth)
  - Learner operations (CRUD, progress)
  - IEP management (goals, meetings, documents)
  - Activity operations (assign, submit, complete)
  - Assessment tracking (baseline, progress, diagnostic)
  - Messaging and notifications
  - Calendar and scheduling
  - Reports and analytics
  - Content management
  - AI model configuration

```typescript
import { ApiResponse, CreateLearnerRequest, UpdateIEPGoalProgressRequest } from '@aivo/types';

// Type-safe API calls
const response: ApiResponse<Learner> = await api.createLearner({
  firstName: 'Alex',
  lastName: 'Smith',
  dateOfBirth: '2015-03-15',
  grade: '3rd',
  parentIds: ['parent-123'],
  // ...
});
```

### 10. Error Types (`error.ts`)

Comprehensive error handling system:

- **ErrorCode**: 70+ error codes categorized by domain
  - Authentication (1000-1099)
  - Authorization (1100-1199)
  - Validation (1200-1299)
  - Resources (1300-1399)
  - Domain-specific (1400-2299)
  - Server errors (5000-5099)
- **AppError**: Base error interface
- **Specialized Errors**: ValidationError, AuthenticationError, NotFoundError, etc.
- **ErrorStatusCodes**: HTTP status code mapping
- **ErrorMessages**: User-friendly error messages

```typescript
import { ErrorCode, AppError, ValidationError } from '@aivo/types';

throw {
  code: 'LEARNER_NOT_FOUND',
  message: 'Learner not found',
  statusCode: 404,
  // ...
} as AppError;
```

## Type Categories

### Entity Types
Core business entities:
- User, Parent, Teacher, Administrator
- Learner, LearningProfile
- IEP, IEPGoal, Service
- Activity, Assessment
- Message, Notification
- School, District

### Data Transfer Objects (DTOs)
Request/response interfaces for API communication:
- Create/Update requests
- Query parameters
- Response wrappers
- Pagination interfaces

### Configuration Types
System configuration:
- Settings and preferences
- Feature flags
- AI model parameters
- Accessibility options

### Analytics Types
Data visualization and reporting:
- Chart data structures
- Dashboard metrics
- Progress tracking
- Predictive analytics

## Type Safety Features

### Generic Types
```typescript
ApiResponse<T>
PaginatedResponse<T>
Optional<T>
Nullable<T>
DeepPartial<T>
Result<T>
```

### Union Types
```typescript
UserRole = 'parent' | 'teacher' | 'administrator' | 'learner'
IEPStatus = 'draft' | 'active' | 'review-due' | 'under-review' | 'expired' | 'archived'
ActivitySubject = 'reading' | 'math' | 'speech' | ...
```

### Enum-like Types
```typescript
Permission (10 values)
ErrorCode (70+ values)
NotificationType (18 types)
ActivityType (30+ types)
AchievementType (17 types)
```

## Best Practices

### Import Strategy
```typescript
// Import only what you need
import { User, Learner, IEP } from '@aivo/types';

// Or import entire modules
import * as Types from '@aivo/types';
```

### Type Guards
```typescript
import { UserRole, User, Teacher } from '@aivo/types';

function isTeacher(user: User): user is Teacher {
  return user.role === 'teacher';
}
```

### Partial Updates
```typescript
import { UpdateLearnerRequest, Learner } from '@aivo/types';

// All fields optional for updates
const update: UpdateLearnerRequest = {
  firstName: 'NewName'
  // Only update what changed
};
```

### Error Handling
```typescript
import { ApiResponse, ErrorCode } from '@aivo/types';

const response: ApiResponse<Learner> = await api.getLearner(id);

if (!response.success) {
  switch (response.error?.code) {
    case 'LEARNER_NOT_FOUND':
      // Handle not found
      break;
    case 'AUTHZ_ACCESS_DENIED':
      // Handle access denied
      break;
  }
}
```

## Type Statistics

- **Total Lines**: 2,000+
- **Total Interfaces**: 150+
- **Total Type Unions**: 30+
- **Error Codes**: 70+
- **API Endpoints**: 40+
- **Files**: 10 modules

## Dependencies

This package has no external dependencies - pure TypeScript types only.

## Contributing

When adding new types:
1. Choose the appropriate module (or create a new one)
2. Export from `index.ts`
3. Add documentation to this README
4. Ensure no naming conflicts
5. Use common types from `common.ts` where applicable

## Version

Current version: 1.0.0

## License

Proprietary - Aivo Learning Platform
