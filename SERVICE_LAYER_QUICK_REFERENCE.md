# Service Layer Quick Reference 🚀

Quick reference for using Aivo Learning business logic services.

## Service Initialization

```python
from sqlalchemy.orm import Session
from app.services.file_service import FileService
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.services.homework_service import HomeworkService
from app.services.analytics_service import AnalyticsService

# In endpoint dependencies
def get_homework_service(db: Session = Depends(get_db)):
    return HomeworkService(db)

def get_analytics_service(db: Session = Depends(get_db)):
    return AnalyticsService(db)

# Standalone services (no DB needed)
file_service = FileService()
ocr_service = OCRService()
ai_service = AIService()
```

## FileService

### Validate Files
```python
# Homework files (10MB, images/PDF/DOC)
result = file_service.validate_homework_file(file)
if not result["valid"]:
    raise HTTPException(400, result["error"])

# IEP documents (5MB, PDF/DOC/DOCX only)
result = file_service.validate_iep_document(file)
```

### Upload Files
```python
# Upload to S3 or local storage (configured via settings.USE_S3)
file_url = await file_service.upload_file(
    file,
    subfolder="homework/learner123/session456"
)
# Returns: "https://bucket.s3.amazonaws.com/homework/learner123/session456/uuid.pdf"
# Or: "http://localhost:8000/uploads/homework/learner123/session456/uuid.pdf"
```

### Delete Files
```python
await file_service.delete_file(file_url)
```

### Get File Info
```python
info = await file_service.get_file_info(file_url)
# Returns: {"exists": True, "size": 1024, "modified": datetime}
```

## OCRService

### Process Files
```python
# Async background processing (doesn't block)
await ocr_service.process_file_async(
    file_id=str(homework_file.id),
    file_url=homework_file.file_url
)

# Later, check HomeworkFile.ocr_status:
# "pending" -> "processing" -> "completed" or "failed"
# Text in HomeworkFile.extracted_text
# Confidence in HomeworkFile.ocr_confidence
```

### Process PDFs Directly
```python
result = ocr_service.process_pdf("/path/to/file.pdf")
# Returns: {"text": "...", "confidence": 95.0}
```

### Configure OCR Engine
```python
# In settings
OCR_ENGINE = "tesseract"  # Free, local
# OCR_ENGINE = "google_vision"  # High accuracy, cloud
# OCR_ENGINE = "textract"  # Advanced features, cloud
```

## AIService

### Generate Hints
```python
hint = await ai_service.generate_hint(
    session=homework_session,
    learner=learner,
    student_question="How do I start?"  # Optional
)
# Returns adaptive hint based on:
# - Current step (UNDERSTAND, PLAN, SOLVE, CHECK)
# - Hints already given
# - Reading level
# - IEP accommodations
# - Problem context
```

### Generate Explanations
```python
explanation = await ai_service.generate_explanation(
    session=homework_session,
    learner=learner,
    concept="quadratic equations"
)
# Returns detailed explanation with:
# - Clear language
# - Visual references
# - Learning resources
# - Step-by-step breakdown
```

### Analyze Content
```python
analysis = await ai_service.analyze_homework_content(
    "Solve for x: 2x + 5 = 13"
)
# Returns: {
#     "subject": "Math",
#     "grade_level": "6th Grade",
#     "key_concepts": ["linear equations", "algebra"],
#     "difficulty": "Medium"
# }
```

### Fallback Behavior
If AI inference service unavailable, returns simple step-specific hints:
- UNDERSTAND: "Start by reading the problem carefully..."
- PLAN: "Think about similar problems you've solved..."
- SOLVE: "Take it one step at a time..."
- CHECK: "Read your answer. Does it make sense?"

## HomeworkService

### Create Session
```python
session = await homework_service.create_session(
    session_data=HomeworkSessionCreate(
        title="Math homework",
        input_method="text",
        original_text="Solve for x: 2x + 5 = 13"
    ),
    learner=learner
)
# Automatically:
# - Analyzes content with AI
# - Sets IEP-based settings (read_aloud, etc.)
# - Determines scaffolding level (high/moderate/low)
# - Sets detected_subject, detected_grade
```

### Progress Through Steps
```python
# Update current step
await homework_service.update_session_step(
    session,
    HomeworkStep.PLAN
)

# Add completed step
await homework_service.add_completed_step(
    session,
    step_name="Understood Problem",
    description="Identified variables: x is unknown, equation given"
)

# Increment hints counter
await homework_service.increment_hints(session)

# Record accommodation usage
await homework_service.record_accommodation_usage(
    session,
    "text_to_speech"
)

# Mark complete
await homework_service.complete_session(session)
```

### Upload Files
```python
# First, validate and upload with FileService
file_url = await file_service.upload_file(file, subfolder="...")

# Then create database record and trigger OCR
homework_file = await homework_service.upload_homework_file(
    session=session,
    file_url=file_url,
    file_type=file.content_type,
    original_filename=file.filename
)
# OCR processing starts automatically in background
```

### Get Session with Files
```python
session = await homework_service.get_session_with_files(session_id)
for file in session.files:
    print(file.extracted_text)  # OCR results
```

## AnalyticsService

### Get Learner Analytics
```python
analytics = await analytics_service.get_learner_analytics(
    learner_id="uuid",
    start_date=date(2024, 1, 1),
    end_date=date(2024, 1, 31)
)
# Returns comprehensive dict with:
# - engagement (time, sessions, completion_rate)
# - progress (skills_mastered, levels_completed)
# - iep_goals (progress per goal)
# - subjects (performance per subject)
# - focus (regulation metrics)
# - homework (completion stats)
# - accommodations (usage tracking)
# - recommendations (personalized suggestions)
```

### Generate Export
```python
# CSV export
csv_data = await analytics_service.generate_export(
    learner_id="uuid",
    start_date=date(2024, 1, 1),
    end_date=date(2024, 1, 31),
    format="csv"
)

# JSON export
json_data = await analytics_service.generate_export(
    learner_id="uuid",
    start_date=date(2024, 1, 1),
    end_date=date(2024, 1, 31),
    format="json"
)
```

## Common Patterns

### Complete Homework Flow

```python
# 1. Create session
session = await homework_service.create_session(session_data, learner)

# 2. Upload file if needed
if file:
    file_url = await file_service.upload_file(file, "homework/...")
    homework_file = await homework_service.upload_homework_file(
        session, file_url, file.content_type, file.filename
    )
    # OCR processes in background

# 3. Student works through steps
await homework_service.update_session_step(session, HomeworkStep.UNDERSTAND)

# 4. Student requests hint
hint = await ai_service.generate_hint(session, learner)
await homework_service.increment_hints(session)

# 5. Student completes step
await homework_service.add_completed_step(
    session, "Understood", "Identified the problem variables"
)

# 6. Repeat for PLAN, SOLVE, CHECK steps

# 7. Mark complete
await homework_service.complete_session(session)
```

### IEP-Aware Settings

```python
# HomeworkService automatically reads learner.iep_accommodations
# and sets session.settings:

# If learner has "read_aloud" or "text_to_speech" accommodation:
session.settings["read_aloud"] = True

# If learner has "extended_time":
session.settings["extended_time"] = True

# If learner has "reduced_distractions":
session.settings["reduced_distractions"] = True

# If learner has "calculator_allowed":
session.settings["allow_calculator"] = True

# Scaffolding level based on support keywords:
# "significant_support" -> "high"
# "minimal_support" -> "low"
# Default -> "moderate"
```

### Error Handling

```python
try:
    hint = await ai_service.generate_hint(session, learner)
except Exception as e:
    logger.error(f"AI hint generation failed: {e}")
    # AIService automatically falls back to simple hints
    # No additional error handling needed
```

### File Validation

```python
# Always validate before uploading
validation = file_service.validate_homework_file(file)
if not validation["valid"]:
    raise HTTPException(
        status_code=400,
        detail=validation["error"]
    )

# Then upload
file_url = await file_service.upload_file(file, "homework/...")
```

## Configuration

### Required Settings

```python
# File storage (settings.py)
USE_S3: bool = True  # or False for local
UPLOAD_DIR: str = "/var/uploads"
MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
IEP_UPLOAD_MAX_SIZE: int = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS: list = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
IEP_ALLOWED_FORMATS: list = ["pdf", "doc", "docx"]

# S3 (if USE_S3=True)
AWS_ACCESS_KEY_ID: str
AWS_SECRET_ACCESS_KEY: str
AWS_REGION: str = "us-east-1"
S3_BUCKET_NAME: str = "aivo-learning-uploads"

# OCR
OCR_ENGINE: str = "tesseract"  # or "google_vision", "textract"

# AI
AI_INFERENCE_URL: str = "http://localhost:8000"
AI_MODEL_NAME: str = "aivo-educational-model-v1"
AI_TEMPERATURE: float = 0.7
AI_MAX_TOKENS: int = 500
```

## Troubleshooting

### OCR Not Working
1. Check `HomeworkFile.ocr_status` - should be "processing" or "completed"
2. Verify OCR engine configured: `settings.OCR_ENGINE`
3. For Tesseract: Ensure `tesseract` command available
4. For Google Vision: Check `GOOGLE_APPLICATION_CREDENTIALS`
5. For Textract: Check AWS credentials

### AI Hints Failing
1. Check `settings.AI_INFERENCE_URL` is accessible
2. Verify inference service is running
3. Check logs for timeout errors
4. Fallback hints will be used automatically

### File Upload Failing
1. Check file size: homework <10MB, IEP <5MB
2. Check file type: `settings.ALLOWED_EXTENSIONS`
3. For S3: Verify AWS credentials and bucket name
4. For local: Ensure `settings.UPLOAD_DIR` writable

### Type Errors (Development)
SQLAlchemy Column assignments may show type errors in IDE but work at runtime:
```python
session.current_step = step  # type: ignore[assignment]
```
This is expected and safe.

## Performance Tips

### Caching
- File metadata: Cache by `file_url` for 1 hour
- AI hints: Cache by `(session_id, step, hints_given)` for 5 minutes
- Learning resources: Static, cache indefinitely
- OCR results: Stored in database, no need to reprocess

### Async Usage
- Always `await` service methods
- OCR processing is background task (non-blocking)
- AI inference has 30-second timeout
- File uploads are async

### Scaling
- OCR: Move to Celery workers for heavy load
- AI inference: Horizontal scaling of inference service
- File storage: S3 auto-scales
- Database: Use connection pooling

## Testing

### Unit Test Example
```python
@pytest.mark.asyncio
async def test_create_homework_session():
    service = HomeworkService(db)
    learner = create_test_learner()
    
    session_data = HomeworkSessionCreate(
        title="Test",
        input_method="text",
        original_text="2 + 2 = ?"
    )
    
    session = await service.create_session(session_data, learner)
    
    assert session.learner_id == learner.id
    assert session.current_step == HomeworkStep.UNDERSTAND
    assert session.settings["show_hints"] is True
```

### Integration Test Example
```python
@pytest.mark.asyncio
async def test_full_homework_flow():
    # Create session
    session = await homework_service.create_session(data, learner)
    
    # Generate hint
    hint = await ai_service.generate_hint(session, learner)
    assert len(hint) > 0
    
    # Track hint
    await homework_service.increment_hints(session)
    assert session.hints_given == 1
    
    # Complete
    await homework_service.complete_session(session)
    assert session.status == HomeworkStatus.COMPLETED
```

## API Integration Example

```python
from fastapi import APIRouter, Depends, UploadFile
from app.services.homework_service import HomeworkService

router = APIRouter()

@router.post("/homework/sessions")
async def create_session(
    data: HomeworkSessionCreate,
    learner: Learner = Depends(get_current_learner),
    service: HomeworkService = Depends(get_homework_service)
):
    session = await service.create_session(data, learner)
    return session

@router.post("/homework/sessions/{session_id}/hints")
async def get_hint(
    session_id: int,
    question: Optional[str] = None,
    learner: Learner = Depends(get_current_learner),
    service: HomeworkService = Depends(get_homework_service),
    ai_service: AIService = Depends(get_ai_service)
):
    session = await service.get_session_with_files(session_id)
    hint = await ai_service.generate_hint(session, learner, question)
    await service.increment_hints(session)
    return {"hint": hint}

@router.post("/homework/sessions/{session_id}/files")
async def upload_file(
    session_id: int,
    file: UploadFile,
    service: HomeworkService = Depends(get_homework_service),
    file_service: FileService = Depends(get_file_service)
):
    # Validate
    validation = file_service.validate_homework_file(file)
    if not validation["valid"]:
        raise HTTPException(400, validation["error"])
    
    # Upload
    file_url = await file_service.upload_file(file, f"homework/{session_id}")
    
    # Create record and trigger OCR
    session = await service.get_session_with_files(session_id)
    homework_file = await service.upload_homework_file(
        session, file_url, file.content_type, file.filename
    )
    
    return homework_file
```

---

**See SERVICE_LAYER_COMPLETE.md for detailed documentation.**
