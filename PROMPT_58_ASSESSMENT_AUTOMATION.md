# PROMPT 58: Automated 90-Day Assessment & Model Refinement System

## Overview
Implement an automated assessment system that triggers baseline assessments at first enrollment and every 90 days thereafter to track learner progress and refine their personalized AI model.

## Current State Analysis

### What Already Exists ✅
1. **Frontend Components** (apps/learner-app/src/pages/):
   - `BaselineAssessment.tsx`: 5-question assessment with visual/multiple-choice options
   - `ModelCloning.tsx`: Animated AI brain cloning visualization (0-100%)
   - `AssessmentResults.tsx`: Results display page
   - Navigation flow: Assessment → Cloning → Results

2. **Backend Services**:
   - District-aware brain cloning service (PROMPT 57 Part D)
   - Curriculum service with training data (PROMPT 57 Part A)
   - Training service with multi-provider support (PROMPT 57 Part B)

3. **Database Schema**:
   - Learner profiles with district associations
   - Brain instances and versions
   - Training metadata

### What's Missing ❌
1. **Assessment Scheduling System**: No automatic triggering at enrollment or 90-day intervals
2. **Assessment Data Persistence**: Assessment responses not saved to database
3. **Progress Tracking**: No comparison between assessments over time
4. **Model Update Logic**: No automatic model refinement based on new assessment data
5. **Notification System**: No alerts when assessment is due
6. **Assessment History**: No timeline view of past assessments

---

## Part A: Database Schema & Models

### 1. Create Assessment Tables

**File**: `services/ai-inference-service/migrations/008_assessment_system.sql`

```sql
-- Assessment schedules and completion tracking
CREATE TABLE assessment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'baseline',
    scheduled_date TIMESTAMP NOT NULL,
    completed_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, skipped, overdue
    is_first_assessment BOOLEAN DEFAULT false,
    days_since_last INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_learner_scheduled_date UNIQUE(learner_id, scheduled_date)
);

-- Assessment responses and answers
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    answer_type VARCHAR(50), -- emoji, multiple_choice, scale, text
    response_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_schedule_question UNIQUE(schedule_id, question_number)
);

-- Assessment results and insights
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id UUID REFERENCES brain_instances(id),
    
    -- Overall scores
    overall_score DECIMAL(5,2),
    confidence_level VARCHAR(20), -- low, medium, high
    learning_style VARCHAR(50), -- visual, auditory, kinesthetic, mixed
    
    -- Detailed metrics
    reading_confidence INTEGER CHECK (reading_confidence BETWEEN 1 AND 4),
    math_confidence INTEGER CHECK (math_confidence BETWEEN 1 AND 5),
    preferred_environment VARCHAR(50), -- alone, pairs, group, teacher
    engagement_factors JSONB, -- fun elements selected
    work_preference VARCHAR(50), -- independent, collaborative
    
    -- Progress tracking (compared to previous assessment)
    previous_assessment_id UUID REFERENCES assessment_results(id),
    progress_percentage DECIMAL(5,2),
    improvement_areas JSONB,
    strengths JSONB,
    recommendations JSONB,
    
    -- Model update tracking
    triggered_model_update BOOLEAN DEFAULT false,
    model_updated_at TIMESTAMP,
    model_version_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment notifications
CREATE TABLE assessment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- due_soon, overdue, completed, results_ready
    sent_to VARCHAR(20) NOT NULL, -- learner, parent, teacher
    recipient_id UUID NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    message TEXT,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_schedules_learner_status ON assessment_schedules(learner_id, status);
CREATE INDEX idx_schedules_district_date ON assessment_schedules(district_id, scheduled_date);
CREATE INDEX idx_schedules_overdue ON assessment_schedules(scheduled_date, status) WHERE status = 'pending';
CREATE INDEX idx_responses_schedule ON assessment_responses(schedule_id);
CREATE INDEX idx_results_learner ON assessment_results(learner_id, created_at DESC);
CREATE INDEX idx_results_progress ON assessment_results(previous_assessment_id) WHERE previous_assessment_id IS NOT NULL;
CREATE INDEX idx_notifications_recipient ON assessment_notifications(recipient_id, sent_to, read_at);

-- Function to auto-schedule next assessment
CREATE OR REPLACE FUNCTION schedule_next_assessment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.completed_date IS NOT NULL THEN
        INSERT INTO assessment_schedules (
            learner_id,
            district_id,
            assessment_type,
            scheduled_date,
            status,
            is_first_assessment,
            days_since_last
        )
        VALUES (
            NEW.learner_id,
            NEW.district_id,
            'baseline',
            NEW.completed_date + INTERVAL '90 days',
            'pending',
            false,
            90
        )
        ON CONFLICT (learner_id, scheduled_date) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_assessment_completed
    AFTER UPDATE OF status ON assessment_schedules
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION schedule_next_assessment();

-- Function to mark overdue assessments
CREATE OR REPLACE FUNCTION mark_overdue_assessments()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE assessment_schedules
    SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'pending'
    AND scheduled_date < CURRENT_TIMESTAMP - INTERVAL '7 days'
    RETURNING id INTO updated_count;
    
    RETURN COALESCE(updated_count, 0);
END;
$$ LANGUAGE plpgsql;
```

### 2. Create SQLAlchemy Models

**File**: `services/ai-inference-service/app/models/assessment.py`

```python
from datetime import datetime
from typing import Optional, Dict, List
from sqlalchemy import (
    Column, String, Integer, DateTime, ForeignKey, Boolean, 
    Numeric, Text, JSON, CheckConstraint, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base


class AssessmentSchedule(Base):
    """Tracks when assessments are scheduled and completed"""
    __tablename__ = "assessment_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    assessment_type = Column(String(50), nullable=False, default="baseline")
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime)
    status = Column(String(20), nullable=False, default="pending")  # pending, completed, skipped, overdue
    is_first_assessment = Column(Boolean, default=False)
    days_since_last = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    responses = relationship("AssessmentResponse", back_populates="schedule", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="schedule", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("AssessmentNotification", back_populates="schedule", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('learner_id', 'scheduled_date', name='unique_learner_scheduled_date'),
    )


class AssessmentResponse(Base):
    """Individual question responses within an assessment"""
    __tablename__ = "assessment_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    answer_value = Column(Text, nullable=False)
    answer_type = Column(String(50))  # emoji, multiple_choice, scale, text
    response_time_seconds = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="responses")

    __table_args__ = (
        UniqueConstraint('schedule_id', 'question_number', name='unique_schedule_question'),
    )


class AssessmentResult(Base):
    """Aggregated results and insights from a completed assessment"""
    __tablename__ = "assessment_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    brain_instance_id = Column(UUID(as_uuid=True), ForeignKey("brain_instances.id"))

    # Overall scores
    overall_score = Column(Numeric(5, 2))
    confidence_level = Column(String(20))  # low, medium, high
    learning_style = Column(String(50))  # visual, auditory, kinesthetic, mixed

    # Detailed metrics
    reading_confidence = Column(Integer)
    math_confidence = Column(Integer)
    preferred_environment = Column(String(50))
    engagement_factors = Column(JSONB)
    work_preference = Column(String(50))

    # Progress tracking
    previous_assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessment_results.id"))
    progress_percentage = Column(Numeric(5, 2))
    improvement_areas = Column(JSONB)
    strengths = Column(JSONB)
    recommendations = Column(JSONB)

    # Model update tracking
    triggered_model_update = Column(Boolean, default=False)
    model_updated_at = Column(DateTime)
    model_version_id = Column(UUID(as_uuid=True))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="results")
    previous_assessment = relationship("AssessmentResult", remote_side=[id], foreign_keys=[previous_assessment_id])

    __table_args__ = (
        CheckConstraint('reading_confidence BETWEEN 1 AND 4', name='check_reading_confidence'),
        CheckConstraint('math_confidence BETWEEN 1 AND 5', name='check_math_confidence'),
    )


class AssessmentNotification(Base):
    """Notifications for assessment events"""
    __tablename__ = "assessment_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("assessment_schedules.id", ondelete="CASCADE"), nullable=False)
    notification_type = Column(String(50), nullable=False)  # due_soon, overdue, completed, results_ready
    sent_to = Column(String(20), nullable=False)  # learner, parent, teacher
    recipient_id = Column(UUID(as_uuid=True), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)
    message = Column(Text)
    metadata = Column(JSONB)

    # Relationships
    schedule = relationship("AssessmentSchedule", back_populates="notifications")
```

---

## Part B: Backend Services & API

### 1. Assessment Service

**File**: `services/ai-inference-service/app/services/assessment_service.py`

```python
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import logging

from app.models.assessment import (
    AssessmentSchedule, AssessmentResponse, 
    AssessmentResult, AssessmentNotification
)
from app.models.learner import Learner
from app.services.brain_cloning_service import BrainCloningService

logger = logging.getLogger(__name__)


class AssessmentService:
    """Service for managing automated assessments and model refinement"""

    def __init__(self, db: Session):
        self.db = db
        self.cloning_service = BrainCloningService(db)

    def create_first_assessment(
        self,
        learner_id: str,
        district_id: str
    ) -> AssessmentSchedule:
        """
        Create first assessment schedule for a new learner at enrollment
        
        Args:
            learner_id: UUID of the learner
            district_id: UUID of the district
            
        Returns:
            AssessmentSchedule: Created schedule
        """
        schedule = AssessmentSchedule(
            learner_id=learner_id,
            district_id=district_id,
            assessment_type="baseline",
            scheduled_date=datetime.utcnow(),  # Immediate
            status="pending",
            is_first_assessment=True,
            days_since_last=0
        )
        
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        
        logger.info(f"Created first assessment for learner {learner_id}")
        
        # Send notification to learner
        self._create_notification(
            schedule=schedule,
            notification_type="due_soon",
            sent_to="learner",
            recipient_id=learner_id,
            message="Welcome! Let's start with a quick assessment to personalize your learning experience."
        )
        
        return schedule

    def submit_assessment_responses(
        self,
        schedule_id: str,
        learner_id: str,
        responses: List[Dict[str, Any]]
    ) -> AssessmentResult:
        """
        Save assessment responses and generate results
        
        Args:
            schedule_id: UUID of the schedule
            learner_id: UUID of the learner
            responses: List of response dicts with question_number, question_text, answer_value, etc.
            
        Returns:
            AssessmentResult: Generated results with insights
        """
        schedule = self.db.query(AssessmentSchedule).filter(
            AssessmentSchedule.id == schedule_id
        ).first()
        
        if not schedule:
            raise ValueError(f"Assessment schedule {schedule_id} not found")
        
        # Save individual responses
        for resp_data in responses:
            response = AssessmentResponse(
                schedule_id=schedule_id,
                learner_id=learner_id,
                question_number=resp_data.get("question_number"),
                question_text=resp_data.get("question_text"),
                answer_value=resp_data.get("answer_value"),
                answer_type=resp_data.get("answer_type"),
                response_time_seconds=resp_data.get("response_time_seconds")
            )
            self.db.add(response)
        
        # Mark schedule as completed
        schedule.status = "completed"
        schedule.completed_date = datetime.utcnow()
        
        # Generate results
        result = self._analyze_responses(schedule, responses)
        
        self.db.commit()
        self.db.refresh(result)
        
        logger.info(f"Saved assessment responses for schedule {schedule_id}")
        
        # Trigger model update if needed
        if schedule.is_first_assessment or self._should_update_model(result):
            self._trigger_model_update(result)
        
        return result

    def _analyze_responses(
        self,
        schedule: AssessmentSchedule,
        responses: List[Dict[str, Any]]
    ) -> AssessmentResult:
        """Analyze responses and create result record"""
        
        # Extract answers (matching BaselineAssessment.tsx questions)
        response_map = {r["question_number"]: r["answer_value"] for r in responses}
        
        # Question 1: Reading feelings (emoji: 😊😐😕😢)
        reading_emoji = response_map.get(1, "😐")
        reading_confidence = self._emoji_to_confidence(reading_emoji)
        
        # Question 2: Learning style (multiple choice)
        learning_style = response_map.get(2, "mixed")
        
        # Question 3: Math confidence (scale 1-5)
        math_confidence = int(response_map.get(3, 3))
        
        # Question 4: Engagement factors (emoji: 🎮📚🎨🎵)
        engagement_emoji = response_map.get(4, "📚")
        engagement_factors = self._parse_engagement_factors(engagement_emoji)
        
        # Question 5: Work preference (emoji: 👤👥👨‍🏫🏠)
        work_emoji = response_map.get(5, "👤")
        work_preference = self._emoji_to_work_preference(work_emoji)
        preferred_environment = self._emoji_to_environment(work_emoji)
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(
            reading_confidence, math_confidence, len(engagement_factors)
        )
        
        # Determine confidence level
        confidence_level = self._determine_confidence_level(overall_score)
        
        # Find previous assessment for progress tracking
        previous_result = self.db.query(AssessmentResult).filter(
            and_(
                AssessmentResult.learner_id == schedule.learner_id,
                AssessmentResult.created_at < datetime.utcnow()
            )
        ).order_by(AssessmentResult.created_at.desc()).first()
        
        # Calculate progress if previous exists
        progress_percentage = None
        improvement_areas = []
        strengths = []
        
        if previous_result:
            progress_percentage = self._calculate_progress(previous_result, overall_score)
            improvement_areas = self._identify_improvements(previous_result, {
                "reading": reading_confidence,
                "math": math_confidence
            })
            strengths = self._identify_strengths({
                "reading": reading_confidence,
                "math": math_confidence,
                "engagement": len(engagement_factors)
            })
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            learning_style, engagement_factors, work_preference,
            reading_confidence, math_confidence
        )
        
        # Create result
        result = AssessmentResult(
            schedule_id=schedule.id,
            learner_id=schedule.learner_id,
            overall_score=overall_score,
            confidence_level=confidence_level,
            learning_style=learning_style,
            reading_confidence=reading_confidence,
            math_confidence=math_confidence,
            preferred_environment=preferred_environment,
            engagement_factors=engagement_factors,
            work_preference=work_preference,
            previous_assessment_id=previous_result.id if previous_result else None,
            progress_percentage=progress_percentage,
            improvement_areas=improvement_areas,
            strengths=strengths,
            recommendations=recommendations
        )
        
        self.db.add(result)
        
        return result

    def _should_update_model(self, result: AssessmentResult) -> bool:
        """Determine if model should be updated based on progress"""
        
        # Always update on first assessment
        if result.previous_assessment_id is None:
            return True
        
        # Update if significant progress (>15%) or decline (<-10%)
        if result.progress_percentage:
            if abs(result.progress_percentage) > 15:
                return True
        
        # Update if new strengths or improvement areas identified
        if result.improvement_areas and len(result.improvement_areas) > 2:
            return True
        
        return False

    def _trigger_model_update(self, result: AssessmentResult):
        """Trigger brain model update based on assessment results"""
        
        try:
            learner = self.db.query(Learner).filter(
                Learner.id == result.learner_id
            ).first()
            
            if not learner:
                logger.error(f"Learner {result.learner_id} not found for model update")
                return
            
            # Clone or update brain with new assessment data
            brain_instance = self.cloning_service.clone_brain_for_learner(
                learner_id=str(learner.id),
                district_id=str(learner.district_id),
                grade_level=learner.grade_level,
                assessment_data={
                    "learning_style": result.learning_style,
                    "confidence_level": result.confidence_level,
                    "strengths": result.strengths,
                    "improvement_areas": result.improvement_areas,
                    "engagement_factors": result.engagement_factors,
                    "work_preference": result.work_preference
                }
            )
            
            # Update result with model info
            result.triggered_model_update = True
            result.model_updated_at = datetime.utcnow()
            result.brain_instance_id = brain_instance.id
            result.model_version_id = brain_instance.id  # Or use version tracking
            
            self.db.commit()
            
            logger.info(f"Model updated for learner {result.learner_id}")
            
            # Notify learner and parent
            self._create_notification(
                schedule=result.schedule,
                notification_type="results_ready",
                sent_to="learner",
                recipient_id=result.learner_id,
                message="Your AI learning brain has been personalized! 🎉"
            )
            
        except Exception as e:
            logger.error(f"Failed to update model for learner {result.learner_id}: {e}")
            self.db.rollback()

    def get_pending_assessments(
        self,
        learner_id: Optional[str] = None,
        district_id: Optional[str] = None
    ) -> List[AssessmentSchedule]:
        """Get all pending assessments, optionally filtered"""
        
        query = self.db.query(AssessmentSchedule).filter(
            AssessmentSchedule.status == "pending"
        )
        
        if learner_id:
            query = query.filter(AssessmentSchedule.learner_id == learner_id)
        
        if district_id:
            query = query.filter(AssessmentSchedule.district_id == district_id)
        
        return query.order_by(AssessmentSchedule.scheduled_date).all()

    def mark_overdue_assessments(self) -> int:
        """Mark assessments overdue if not completed within 7 days"""
        
        overdue_date = datetime.utcnow() - timedelta(days=7)
        
        count = self.db.query(AssessmentSchedule).filter(
            and_(
                AssessmentSchedule.status == "pending",
                AssessmentSchedule.scheduled_date < overdue_date
            )
        ).update({"status": "overdue", "updated_at": datetime.utcnow()})
        
        self.db.commit()
        
        logger.info(f"Marked {count} assessments as overdue")
        return count

    def _create_notification(
        self,
        schedule: AssessmentSchedule,
        notification_type: str,
        sent_to: str,
        recipient_id: str,
        message: str
    ):
        """Create a notification for assessment events"""
        
        notification = AssessmentNotification(
            learner_id=schedule.learner_id,
            schedule_id=schedule.id,
            notification_type=notification_type,
            sent_to=sent_to,
            recipient_id=recipient_id,
            message=message
        )
        
        self.db.add(notification)

    # Helper methods for response analysis
    def _emoji_to_confidence(self, emoji: str) -> int:
        """Convert emoji to confidence level (1-4)"""
        emoji_map = {"😊": 4, "😐": 3, "😕": 2, "😢": 1}
        return emoji_map.get(emoji, 3)

    def _emoji_to_work_preference(self, emoji: str) -> str:
        """Convert emoji to work preference"""
        emoji_map = {
            "👤": "independent",
            "👥": "pairs",
            "👨‍🏫": "teacher_led",
            "🏠": "flexible"
        }
        return emoji_map.get(emoji, "flexible")

    def _emoji_to_environment(self, emoji: str) -> str:
        """Convert emoji to preferred environment"""
        emoji_map = {
            "👤": "alone",
            "👥": "pairs",
            "👨‍🏫": "teacher",
            "🏠": "home"
        }
        return emoji_map.get(emoji, "alone")

    def _parse_engagement_factors(self, emoji: str) -> Dict[str, bool]:
        """Parse engagement factor emoji to structured data"""
        factors = {
            "🎮": "games",
            "📚": "reading",
            "🎨": "art",
            "🎵": "music"
        }
        return {factors.get(emoji, "reading"): True}

    def _calculate_overall_score(
        self, reading: int, math: int, engagement: int
    ) -> float:
        """Calculate overall assessment score (0-100)"""
        # Weighted average: reading (30%), math (30%), engagement (40%)
        reading_score = (reading / 4) * 30
        math_score = (math / 5) * 30
        engagement_score = min(engagement * 10, 40)
        return round(reading_score + math_score + engagement_score, 2)

    def _determine_confidence_level(self, score: float) -> str:
        """Determine confidence level from overall score"""
        if score >= 75:
            return "high"
        elif score >= 50:
            return "medium"
        else:
            return "low"

    def _calculate_progress(
        self, previous: AssessmentResult, current_score: float
    ) -> float:
        """Calculate progress percentage vs previous assessment"""
        if not previous.overall_score:
            return 0.0
        
        diff = current_score - float(previous.overall_score)
        progress = (diff / float(previous.overall_score)) * 100
        return round(progress, 2)

    def _identify_improvements(
        self, previous: AssessmentResult, current: Dict[str, int]
    ) -> List[str]:
        """Identify areas of improvement"""
        improvements = []
        
        if current["reading"] > previous.reading_confidence:
            improvements.append("reading_confidence")
        
        if current["math"] > previous.math_confidence:
            improvements.append("math_confidence")
        
        return improvements

    def _identify_strengths(self, scores: Dict[str, int]) -> List[str]:
        """Identify learner strengths"""
        strengths = []
        
        if scores["reading"] >= 3:
            strengths.append("reading")
        
        if scores["math"] >= 4:
            strengths.append("mathematics")
        
        if scores["engagement"] >= 3:
            strengths.append("engagement")
        
        return strengths

    def _generate_recommendations(
        self,
        learning_style: str,
        engagement: Dict,
        work_pref: str,
        reading: int,
        math: int
    ) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Style-based recommendations
        if learning_style == "visual":
            recommendations.append("Use visual aids and diagrams")
        elif learning_style == "auditory":
            recommendations.append("Include audio lessons and discussions")
        elif learning_style == "kinesthetic":
            recommendations.append("Incorporate hands-on activities")
        
        # Confidence-based recommendations
        if reading < 3:
            recommendations.append("Focus on building reading confidence with age-appropriate materials")
        
        if math < 3:
            recommendations.append("Provide extra math support and practice")
        
        # Engagement-based
        if "games" in engagement:
            recommendations.append("Gamify learning experiences")
        
        # Work preference
        if work_pref == "independent":
            recommendations.append("Provide self-paced learning options")
        elif work_pref == "pairs":
            recommendations.append("Enable peer collaboration opportunities")
        
        return recommendations
```

### 2. API Endpoints

**File**: `services/ai-inference-service/app/api/v1/endpoints/assessments.py`

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api import deps
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    AssessmentScheduleResponse,
    AssessmentSubmission,
    AssessmentResultResponse,
    AssessmentHistoryResponse
)

router = APIRouter()


@router.post("/schedules", response_model=AssessmentScheduleResponse)
def create_first_assessment(
    learner_id: str,
    district_id: str,
    db: Session = Depends(deps.get_db)
):
    """Create first assessment for a new learner"""
    service = AssessmentService(db)
    schedule = service.create_first_assessment(learner_id, district_id)
    return schedule


@router.get("/schedules/learner/{learner_id}", response_model=List[AssessmentScheduleResponse])
def get_learner_schedules(
    learner_id: str,
    status: Optional[str] = None,
    db: Session = Depends(deps.get_db)
):
    """Get all assessment schedules for a learner"""
    service = AssessmentService(db)
    schedules = service.get_pending_assessments(learner_id=learner_id)
    
    if status:
        schedules = [s for s in schedules if s.status == status]
    
    return schedules


@router.post("/submit", response_model=AssessmentResultResponse)
def submit_assessment(
    submission: AssessmentSubmission,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """Submit assessment responses and trigger model update"""
    service = AssessmentService(db)
    
    try:
        result = service.submit_assessment_responses(
            schedule_id=submission.schedule_id,
            learner_id=submission.learner_id,
            responses=submission.responses
        )
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process assessment: {str(e)}")


@router.get("/results/learner/{learner_id}", response_model=List[AssessmentResultResponse])
def get_learner_results(
    learner_id: str,
    limit: int = 10,
    db: Session = Depends(deps.get_db)
):
    """Get assessment results history for a learner"""
    from app.models.assessment import AssessmentResult
    
    results = db.query(AssessmentResult).filter(
        AssessmentResult.learner_id == learner_id
    ).order_by(AssessmentResult.created_at.desc()).limit(limit).all()
    
    return results


@router.get("/history/learner/{learner_id}", response_model=AssessmentHistoryResponse)
def get_assessment_history(
    learner_id: str,
    db: Session = Depends(deps.get_db)
):
    """Get complete assessment history with progress tracking"""
    from app.models.assessment import AssessmentResult, AssessmentSchedule
    
    results = db.query(AssessmentResult).filter(
        AssessmentResult.learner_id == learner_id
    ).order_by(AssessmentResult.created_at.asc()).all()
    
    schedules = db.query(AssessmentSchedule).filter(
        AssessmentSchedule.learner_id == learner_id
    ).order_by(AssessmentSchedule.scheduled_date.desc()).all()
    
    return {
        "learner_id": learner_id,
        "total_assessments": len(results),
        "results": results,
        "upcoming_schedules": [s for s in schedules if s.status == "pending"],
        "completion_rate": len([s for s in schedules if s.status == "completed"]) / len(schedules) if schedules else 0
    }


@router.post("/mark-overdue")
def mark_overdue(
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """Mark overdue assessments (should be called by scheduler)"""
    service = AssessmentService(db)
    count = service.mark_overdue_assessments()
    return {"marked_overdue": count}
```

### 3. Pydantic Schemas

**File**: `services/ai-inference-service/app/schemas/assessment.py`

```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class AssessmentResponseItem(BaseModel):
    question_number: int
    question_text: str
    answer_value: str
    answer_type: str
    response_time_seconds: Optional[int] = None


class AssessmentSubmission(BaseModel):
    schedule_id: str
    learner_id: str
    responses: List[AssessmentResponseItem]


class AssessmentScheduleResponse(BaseModel):
    id: str
    learner_id: str
    district_id: str
    assessment_type: str
    scheduled_date: datetime
    completed_date: Optional[datetime]
    status: str
    is_first_assessment: bool
    days_since_last: int
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentResultResponse(BaseModel):
    id: str
    learner_id: str
    overall_score: float
    confidence_level: str
    learning_style: str
    reading_confidence: int
    math_confidence: int
    preferred_environment: str
    engagement_factors: Dict[str, Any]
    work_preference: str
    progress_percentage: Optional[float]
    improvement_areas: List[str]
    strengths: List[str]
    recommendations: List[str]
    triggered_model_update: bool
    model_updated_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentHistoryResponse(BaseModel):
    learner_id: str
    total_assessments: int
    results: List[AssessmentResultResponse]
    upcoming_schedules: List[AssessmentScheduleResponse]
    completion_rate: float
```

---

## Part C: Frontend Integration

### 1. Update BaselineAssessment to Save Responses

**File**: `apps/learner-app/src/pages/BaselineAssessment.tsx`

Add API integration to save responses:

```typescript
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function BaselineAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get('schedule_id');
  
  const [responses, setResponses] = useState<any[]>([]);
  const [startTime, setStartTime] = useState(Date.now());

  const handleAnswer = async (answer: string) => {
    const response = {
      question_number: currentQuestionIndex + 1,
      question_text: questions[currentQuestionIndex].question,
      answer_value: answer,
      answer_type: questions[currentQuestionIndex].type,
      response_time_seconds: Math.floor((Date.now() - startTime) / 1000)
    };
    
    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowEncouragement(true);
      setStartTime(Date.now());
    } else {
      // Submit all responses
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/assessments/submit`, {
          schedule_id: scheduleId,
          learner_id: user.id,
          responses: updatedResponses
        });
        
        navigate(`/cloning?schedule_id=${scheduleId}`);
      } catch (error) {
        console.error('Failed to submit assessment:', error);
        // Still navigate but log error
        navigate(`/cloning?schedule_id=${scheduleId}`);
      }
    }
  };
  
  // ... rest of component
}
```

### 2. Assessment Dashboard Component

**File**: `apps/learner-app/src/pages/AssessmentDashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@aivo/ui';
import axios from 'axios';
import { BigButton } from '../components/BigButton';
import { PageWrapper } from '../components/PageWrapper';

interface AssessmentSchedule {
  id: string;
  scheduled_date: string;
  status: string;
  is_first_assessment: boolean;
  days_since_last: number;
}

interface AssessmentHistory {
  learner_id: string;
  total_assessments: number;
  results: any[];
  upcoming_schedules: AssessmentSchedule[];
  completion_rate: number;
}

export function AssessmentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeConfig } = useTheme();
  const [history, setHistory] = useState<AssessmentHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/assessments/history/learner/${user.id}`
      );
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load assessment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (scheduleId: string) => {
    navigate(`/assessment?schedule_id=${scheduleId}`);
  };

  if (loading) {
    return <PageWrapper><div>Loading...</div></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: themeConfig.colors.text }}>
          Your Learning Journey 🎯
        </h1>

        {/* Pending Assessments */}
        {history?.upcoming_schedules && history.upcoming_schedules.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
              Ready for Your Next Assessment!
            </h2>
            {history.upcoming_schedules.map(schedule => (
              <div
                key={schedule.id}
                className="bg-white rounded-2xl p-6 shadow-lg mb-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">
                      {schedule.is_first_assessment 
                        ? '🎉 Welcome Assessment' 
                        : `📊 Progress Check (${schedule.days_since_last} days)`
                      }
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.is_first_assessment
                        ? "Let's personalize your learning experience!"
                        : "Time to see how much you've grown!"}
                    </p>
                  </div>
                  <BigButton
                    onClick={() => startAssessment(schedule.id)}
                    variant="primary"
                    size="lg"
                  >
                    Start Now
                  </BigButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assessment History */}
        {history && history.total_assessments > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
              Your Progress History
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
                    {history.total_assessments}
                  </p>
                  <p className="text-sm text-gray-600">Assessments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: themeConfig.colors.success }}>
                    {Math.round(history.completion_rate * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Completion</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: themeConfig.colors.warning }}>
                    {history.results[history.results.length - 1]?.overall_score || 0}
                  </p>
                  <p className="text-sm text-gray-600">Latest Score</p>
                </div>
              </div>

              <div className="space-y-4">
                {history.results.map((result, idx) => (
                  <div
                    key={result.id}
                    className="border-l-4 pl-4 py-2"
                    style={{ borderColor: themeConfig.colors.primary }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold">Assessment #{history.results.length - idx}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{result.overall_score}</p>
                        {result.progress_percentage && (
                          <p className={`text-sm ${result.progress_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.progress_percentage > 0 ? '↑' : '↓'} {Math.abs(result.progress_percentage)}%
                          </p>
                        )}
                      </div>
                    </div>
                    {result.strengths && result.strengths.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Strengths:</p>
                        <div className="flex gap-2 mt-1">
                          {result.strengths.map((strength: string) => (
                            <span
                              key={strength}
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: `${themeConfig.colors.success}20`,
                                color: themeConfig.colors.success
                              }}
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* First Time Message */}
        {history && history.total_assessments === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🎯</p>
            <p className="text-xl font-bold mb-2">Ready to Begin?</p>
            <p className="text-gray-600">
              Complete your first assessment to personalize your learning experience!
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
```

### 3. Update SubjectSelection Navigation

Already added the assessment button in previous fix ✅

### 4. Add Route for Assessment Dashboard

**File**: `apps/learner-app/src/App.tsx`

Add after line 175:

```typescript
<Route path="/assessment-dashboard" element={<ProtectedRoute allowedRoles={['learner']}><AssessmentDashboard /></ProtectedRoute>} />
```

---

## Part D: Automated Scheduling & Background Jobs

### 1. Scheduler Service

**File**: `services/ai-inference-service/app/services/scheduler.py`

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
import logging

from app.db.session import SessionLocal
from app.services.assessment_service import AssessmentService

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


def check_overdue_assessments():
    """Run daily to mark overdue assessments"""
    db = SessionLocal()
    try:
        service = AssessmentService(db)
        count = service.mark_overdue_assessments()
        logger.info(f"Checked overdue assessments: {count} marked")
    except Exception as e:
        logger.error(f"Error checking overdue assessments: {e}")
    finally:
        db.close()


def send_assessment_reminders():
    """Send reminders for upcoming assessments"""
    db = SessionLocal()
    try:
        # TODO: Implement reminder logic
        logger.info("Sent assessment reminders")
    except Exception as e:
        logger.error(f"Error sending reminders: {e}")
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler"""
    
    # Check for overdue assessments daily at 9 AM
    scheduler.add_job(
        check_overdue_assessments,
        trigger=CronTrigger(hour=9, minute=0),
        id="check_overdue",
        name="Check overdue assessments",
        replace_existing=True
    )
    
    # Send reminders daily at 8 AM
    scheduler.add_job(
        send_assessment_reminders,
        trigger=CronTrigger(hour=8, minute=0),
        id="send_reminders",
        name="Send assessment reminders",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Assessment scheduler started")


def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("Assessment scheduler stopped")
```

### 2. Add to Main App

**File**: `services/ai-inference-service/app/main.py`

```python
from app.services.scheduler import start_scheduler, stop_scheduler

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    start_scheduler()
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    stop_scheduler()
    logger.info("Application shutdown complete")
```

---

## Part E: Testing & Documentation

### 1. Test Assessment Flow

**File**: `e2e/assessment-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Assessment Flow', () => {
  test('complete first assessment and see results', async ({ page }) => {
    // Login as learner
    await page.goto('http://localhost:3003/#/login');
    await page.fill('input[name="email"]', 'learner@demo.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to subjects (after PIN entry)
    await page.goto('http://localhost:3003/#/subjects');
    
    // Click Take Assessment button
    await page.click('[data-testid="nav-assessment"]');
    
    // Answer Question 1 (reading feelings)
    await page.click('button:has-text("😊")');
    await page.waitForTimeout(2000);
    
    // Answer Question 2 (learning style)
    await page.click('button:has-text("Visual learner")');
    await page.waitForTimeout(2000);
    
    // Answer Question 3 (math confidence)
    await page.click('button:has-text("4")');
    await page.waitForTimeout(2000);
    
    // Answer Question 4 (engagement)
    await page.click('button:has-text("🎮")');
    await page.waitForTimeout(2000);
    
    // Answer Question 5 (work preference)
    await page.click('button:has-text("👥")');
    
    // Should navigate to cloning page
    await page.waitForURL('**/cloning**');
    expect(await page.locator('text=Starting your AI brain').isVisible()).toBeTruthy();
    
    // Wait for cloning to complete (10 seconds)
    await page.waitForTimeout(11000);
    
    // Should navigate to results
    await page.waitForURL('**/assessment-results**');
    expect(await page.locator('text=Assessment Complete').isVisible()).toBeTruthy();
  });
  
  test('view assessment dashboard', async ({ page }) => {
    await page.goto('http://localhost:3003/#/assessment-dashboard');
    
    // Should show history
    expect(await page.locator('text=Your Learning Journey').isVisible()).toBeTruthy();
  });
});
```

### 2. Documentation

**File**: `ASSESSMENT_AUTOMATION_GUIDE.md`

```markdown
# Assessment Automation System

## Overview
Automated 90-day assessment system that personalizes and refines learner AI models.

## How It Works

### First Enrollment
1. Learner creates account
2. System automatically creates first assessment schedule (immediate)
3. Learner sees "Take Assessment" button on subject selection page
4. After completion:
   - Responses saved to database
   - Initial AI brain cloned with assessment data
   - Next assessment scheduled for 90 days later

### 90-Day Cycle
1. Every 90 days, system schedules new assessment
2. Learner receives notification (in-app, email optional)
3. Assessment available on dashboard
4. After completion:
   - Progress calculated vs previous assessment
   - If significant change (>15%), model is updated
   - Next assessment scheduled

### Overdue Handling
- After 7 days past due date, marked as "overdue"
- Reminder notifications sent
- Assessment remains available until completed

## API Endpoints

### Create First Assessment
```
POST /api/v1/assessments/schedules
{
  "learner_id": "uuid",
  "district_id": "uuid"
}
```

### Submit Assessment
```
POST /api/v1/assessments/submit
{
  "schedule_id": "uuid",
  "learner_id": "uuid",
  "responses": [
    {
      "question_number": 1,
      "question_text": "How do you feel about reading?",
      "answer_value": "😊",
      "answer_type": "emoji",
      "response_time_seconds": 5
    }
  ]
}
```

### Get Assessment History
```
GET /api/v1/assessments/history/learner/{learner_id}
```

## Database Tables

- `assessment_schedules`: When assessments are due
- `assessment_responses`: Individual question answers
- `assessment_results`: Aggregated results and insights
- `assessment_notifications`: Alert system

## Model Update Logic

### Triggers Model Update If:
- First assessment (always)
- Progress > 15% improvement
- Progress < -10% decline
- 3+ new improvement areas identified

### Update Process:
1. Call `BrainCloningService.clone_brain_for_learner()`
2. Pass assessment data as metadata
3. Store new brain_instance_id in result
4. Send notification to learner

## Scheduler Jobs

### Daily at 9 AM
- Mark overdue assessments
- Update status in database

### Daily at 8 AM
- Send reminder notifications
- Check upcoming assessments (within 3 days)

## Frontend Flow

1. **SubjectSelection**: "Take Assessment" button
2. **BaselineAssessment**: 5 questions with visual interface
3. **ModelCloning**: Animated progress (10 seconds)
4. **AssessmentResults**: Display scores and recommendations
5. **AssessmentDashboard**: Full history and upcoming

## Testing

Run E2E tests:
```bash
pnpm test:e2e -- assessment-flow.spec.ts
```

## Monitoring

Check logs for:
- `"Created first assessment"` - New learner enrolled
- `"Saved assessment responses"` - Assessment completed
- `"Model updated for learner"` - Brain refined
- `"Marked X assessments as overdue"` - Scheduler ran
```

---

## Implementation Checklist

### Backend
- [ ] Create migration `008_assessment_system.sql`
- [ ] Create models in `app/models/assessment.py`
- [ ] Create `AssessmentService` in `app/services/assessment_service.py`
- [ ] Create API endpoints in `app/api/v1/endpoints/assessments.py`
- [ ] Create Pydantic schemas in `app/schemas/assessment.py`
- [ ] Create scheduler in `app/services/scheduler.py`
- [ ] Update `main.py` with scheduler startup/shutdown
- [ ] Add `apscheduler` to `requirements.txt`
- [ ] Run migration and test database

### Frontend
- [ ] Update `BaselineAssessment.tsx` to save responses to API
- [ ] Create `AssessmentDashboard.tsx` component
- [ ] Add route for `/assessment-dashboard` in App.tsx
- [ ] Update `SubjectSelection.tsx` (already done ✅)
- [ ] Add `schedule_id` query param handling
- [ ] Test complete flow: Login → Assessment → Cloning → Results

### Integration
- [ ] Hook up enrollment flow to create first assessment
- [ ] Test 90-day scheduling (can mock with 1-minute intervals)
- [ ] Test model update trigger
- [ ] Verify progress calculation
- [ ] Test overdue marking

### E2E Testing
- [ ] Create `assessment-flow.spec.ts`
- [ ] Test first assessment flow
- [ ] Test dashboard view
- [ ] Test repeated assessments
- [ ] Test progress tracking

### Documentation
- [ ] Create `ASSESSMENT_AUTOMATION_GUIDE.md`
- [ ] Update README with assessment info
- [ ] Document API endpoints in OpenAPI/Swagger
- [ ] Add inline code comments

---

## Success Criteria

✅ Learner creates account → First assessment scheduled immediately  
✅ Assessment completed → Responses saved, brain cloned, next scheduled  
✅ 90 days later → New assessment available  
✅ Progress calculated correctly vs previous assessment  
✅ Model updated when significant change detected  
✅ Assessment history visible in dashboard  
✅ Overdue assessments marked after 7 days  
✅ All E2E tests passing  

---

## Notes

- Assessment questions match existing `BaselineAssessment.tsx` (5 questions)
- Uses existing `BrainCloningService` from PROMPT 57
- Scheduler uses APScheduler (add to requirements.txt)
- First assessment is immediate, subsequent are 90-day intervals
- Model update is automatic but can be triggered manually
- Frontend already has assessment flow, just needs API integration
- Database trigger auto-schedules next assessment on completion
