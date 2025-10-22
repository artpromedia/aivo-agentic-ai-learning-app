# Schema Validation Quick Reference

## 📚 Pydantic Schemas - Aivo Learning API

### 🎯 Homework Helper Schemas

```python
# Enums
HomeworkStatus: NOT_STARTED, IN_PROGRESS, COMPLETED, NEEDS_HELP
HomeworkStep: UNDERSTAND, PLAN, SOLVE, VERIFY, COMPLETE
HomeworkInputMethod: TEXT, PHOTO, HANDWRITING, VOICE

# File Upload Validation
HomeworkFileUpload:
  - max_size: 10MB
  - allowed_content_types: image/jpeg, image/png, application/pdf, msword, docx

# Request/Response
HomeworkSessionCreate:
  - learner_id: UUID (36 chars)
  - title: str (1-500 chars)
  - input_method: HomeworkInputMethod
  - original_text: Optional (required if input_method=TEXT)

HintRequest / HintResponse
ExplanationRequest / ExplanationResponse
```

### 🎨 Sensory Profile Schemas

```python
# Settings Classes

VisualSettings:
  - reduce_animations, reduce_motion, high_contrast, dark_mode
  - font_size: small|medium|large|extra-large
  - font_family: standard|dyslexic|comic-sans|open-dyslexic
  - line_spacing: normal|wide|extra-wide
  - color_scheme: default|warm|cool|grayscale|high-contrast

AuditorySettings:
  - sound_volume: 0-100
  - text_to_speech_speed: 0.5-2.0
  - text_to_speech_voice: male|female|child

MotorSettings:
  - larger_click_targets, hover_delay (0-2000ms)
  - keyboard_only_mode, sticky_keys, voice_control

CognitiveSettings:
  - time_multiplier: 1.0-3.0
  - break_frequency: 5-120 minutes
  - limit_choices: 2-6

EnvironmentSettings:
  - full_screen_mode, minimize_distractions
  - white_noise

TriggerSettings:
  - avoid_colors: List[str]
  - content_warnings: List[str]
```

### 😊 Regulation & Emotion Schemas

```python
# Enums
EmotionType: calm, happy, sad, angry, frustrated, anxious, tired, excited
ActivityType: breathing, movement, sensory, grounding, visualization

# Schemas
EmotionState:
  - emotion: EmotionType
  - level: 1-5
  - trigger: Optional[str]

RegulationActivity:
  - name: str
  - activity_type: ActivityType
  - duration_minutes: int
  - difficulty: easy|medium|hard
  - instructions: List[str]

RegulationSessionCreate:
  - learner_id: UUID
  - emotion_before: EmotionState
  - selected_activity_id: Optional[str]

RegulationSessionComplete:
  - session_id: UUID
  - emotion_after: EmotionState
  - activity_completed: bool
  - notes: Optional[str]

EmotionCheckIn:
  - learner_id: UUID
  - emotion: EmotionType
  - level: 1-5
  - context: activity_start|activity_end|check_in
  - trigger: Optional[str]

ActivityRecommendation:
  - activity: RegulationActivity
  - reason: str
  - priority: int (1-10)
```

### 📊 IEP Goal Schemas

```python
# Enum
IEPGoalStatus: on-track, needs-attention, exceeding, not-started

# Schemas
IEPGoalCreate:
  - learner_id: UUID
  - goal_name: str (1-500 chars)
  - category: reading|math|social|motor|communication
  - current_level: str
  - target_level: str
  - start_date: date
  - target_date: date
  - accommodations: Optional[List[str]]

IEPGoalUpdate:
  - progress_percentage: 0-100
  - status: IEPGoalStatus

IEPDataPointCreate:
  - goal_id: UUID
  - value: 0-100
  - notes: Optional[str]
  - recorded_by: str
```

### 📈 Analytics Schemas

```python
# Date Range
DateRangeFilter:
  - start_date: date
  - end_date: date
  - learner_id: UUID

# Metrics

EngagementMetrics:
  - total_sessions: int (>=0)
  - total_minutes: int (>=0)
  - average_session_duration: float (>=0)
  - completion_rate: 0-100%
  - consecutive_days: int (>=0)

ProgressMetrics:
  - average_score: 0-100
  - score_trend: improving|stable|declining
  - mastery_level: beginner|developing|proficient|advanced
  - skills_mastered: int (>=0)

SubjectMetrics:
  - subject: str
  - activities_completed: int (>=0)
  - average_score: 0-100
  - time_spent_minutes: int (>=0)
  - mastery_level: beginner|developing|proficient|advanced
  - strengths: List[str]
  - areas_for_growth: List[str]

FocusMetrics:
  - distraction_events: int (>=0)
  - average_focus_score: 0-10
  - game_breaks_used: int (>=0)
  - optimal_session_length: 5-120 minutes

HomeworkMetrics:
  - total_sessions: int (>=0)
  - completion_rate: 0-100%
  - hints_requested: int (>=0)
  - explanations_requested: int (>=0)
  - photos_uploaded: int (>=0)

AccommodationMetrics:
  - total_accommodations_active: int (>=0)
  - regulation_activities_completed: int (>=0)
  - emotion_check_ins: int (>=0)
  - average_emotion_level: 1-5
  - accommodation_effectiveness: 0-100% (Optional)

# Comprehensive Analytics
LearnerAnalytics:
  - learner_id: UUID
  - date_range: DateRangeFilter
  - engagement: EngagementMetrics
  - progress: ProgressMetrics
  - iep_goals: List[IEPGoalProgress]
  - subjects: List[SubjectMetrics]
  - focus: FocusMetrics
  - homework: Optional[HomeworkMetrics]
  - accommodations: AccommodationMetrics
  - recommendations: List[str]
  - generated_at: datetime

# Export
ExportFormat: PDF, CSV, JSON

AnalyticsExportRequest:
  - learner_id: UUID
  - start_date: date
  - end_date: date
  - format: ExportFormat
  - include_charts: bool
  - include_recommendations: bool
  - sections: Optional[List[str]]
```

---

## 🔧 Validation Rules

### Field Constraints

```python
# Integer ranges
Field(ge=0, le=100)  # 0 to 100
Field(ge=1, le=5)    # 1 to 5

# Float ranges
Field(ge=0.5, le=2.0)  # 0.5 to 2.0

# String length
Field(min_length=1, max_length=500)
Field(min_length=36, max_length=36)  # UUID

# Pattern matching (regex)
Field(pattern=r'^(option1|option2|option3)$')
Field(pattern=r'^[0-9A-Fa-f]{6}$')  # Hex color
```

### Custom Validators

```python
# Class method validator
@validator('field_name')
@classmethod
def validate_field(cls, v):
    if not some_condition:
        raise ValueError('Error message')
    return v

# Validator with values access
@validator('field_name')
@classmethod
def validate_field(cls, v, values):
    other_field = values.get('other_field')
    if not some_condition:
        raise ValueError('Error message')
    return v
```

### Pydantic v2 Config

```python
class MySchema(BaseModel):
    """Schema description."""
    # fields...
    
    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode=True)
```

---

## 📝 Common Patterns

### Optional Fields
```python
field_name: Optional[str] = None
field_list: Optional[List[str]] = None
```

### Required Fields
```python
field_name: str = Field(..., min_length=1)
field_id: str = Field(..., min_length=36, max_length=36)
```

### Enums
```python
from enum import Enum

class MyEnum(str, Enum):
    OPTION_ONE = "option-one"
    OPTION_TWO = "option-two"
```

### Nested Models
```python
class InnerModel(BaseModel):
    field1: str
    field2: int

class OuterModel(BaseModel):
    inner: InnerModel
    inner_list: List[InnerModel] = []
```

---

## 🧪 Testing Validation

### Valid Examples

```python
# Homework File Upload
{
    "file_name": "homework.pdf",
    "content_type": "application/pdf",
    "size": 5242880  # 5MB - OK
}

# Emotion State
{
    "emotion": "frustrated",
    "level": 4,  # 1-5 scale - OK
    "trigger": "difficult math problem"
}

# IEP Goal
{
    "learner_id": "123e4567-e89b-12d3-a456-426614174000",
    "goal_name": "Improve reading comprehension",
    "category": "reading",
    "progress_percentage": 75  # 0-100 - OK
}
```

### Invalid Examples

```python
# ❌ File too large
{
    "size": 15728640  # 15MB - exceeds 10MB limit
}

# ❌ Emotion level out of range
{
    "emotion": "frustrated",
    "level": 7  # Exceeds max 5
}

# ❌ Invalid category
{
    "category": "science"  # Not in allowed list
}
```

---

## 📚 Import Reference

```python
# Always import from app.schemas
from app.schemas import (
    # Homework
    HomeworkStatus,
    HomeworkStep,
    HomeworkInputMethod,
    HomeworkSessionCreate,
    HomeworkSessionResponse,
    HintRequest,
    HintResponse,
    
    # Sensory
    VisualSettings,
    AuditorySettings,
    MotorSettings,
    CognitiveSettings,
    SensoryProfileCreate,
    
    # Regulation
    EmotionType,
    ActivityType,
    EmotionState,
    RegulationSessionCreate,
    EmotionCheckIn,
    
    # IEP
    IEPGoalStatus,
    IEPGoalCreate,
    IEPDataPointCreate,
    
    # Analytics
    DateRangeFilter,
    EngagementMetrics,
    LearnerAnalytics,
    ExportFormat,
)
```

---

*Last Updated: 2025-01-XX*  
*API Version: v1*
