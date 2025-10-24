import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date

from app.main import app
from app.core.database import Base, get_db
from app.core.redis import get_redis
from app.core.security import get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.models.learner import Learner
from app.models.sensory_profile import SensoryProfile
from app.models.homework import (
    HomeworkSession,
    HomeworkStep,
    HomeworkStatus
)
from app.models.iep import IEPGoal, IEPGoalStatus
from app.models.regulation import EmotionHistory, EmotionType

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ============================================================================
# Mock Redis Client
# ============================================================================
class MockRedis:
    """Mock Redis client for testing."""
    
    def __init__(self):
        self.store = {}
        self.expiry = {}
    
    def get(self, key: str):
        return self.store.get(key)
    
    def set(self, key: str, value: str, ex: int = None):
        self.store[key] = value
        if ex:
            self.expiry[key] = ex
        return True
    
    def setex(self, key: str, time: int, value: str):
        self.store[key] = value
        self.expiry[key] = time
        return True
    
    def delete(self, key: str):
        if key in self.store:
            del self.store[key]
        if key in self.expiry:
            del self.expiry[key]
        return True
    
    def exists(self, key: str):
        return key in self.store
    
    def incr(self, key: str, amount: int = 1):
        current = int(self.store.get(key, 0))
        self.store[key] = str(current + amount)
        return int(self.store[key])
    
    def ttl(self, key: str):
        return self.expiry.get(key, -1)


@pytest.fixture
def redis_client():
    """Mock Redis client."""
    return MockRedis()


@pytest.fixture(scope="function")
def db():
    """Create test database and tables."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db, redis_client):
    """Create test client with database and Redis override."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    def override_get_redis():
        return redis_client

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def parent_user(db):
    """Create parent user (Mr. Ofem)."""
    user = User(
        email="parent@ofem.family",
        hashed_password=get_password_hash("SecurePassword123!"),
        full_name="Emmanuel Ofem",
        role=UserRole.PARENT,
        is_active=True,
        is_verified=True,
        preferences={
            "theme": "light",
            "notifications_enabled": True
        }
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def teacher_user(db):
    """Create teacher user."""
    user = User(
        email="teacher@school.edu",
        hashed_password=get_password_hash("TeacherPass123!"),
        full_name="Ms. Sarah Johnson",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def jayden_learner(db, parent_user):
    """
    Create Jayden Ofem - 6th grader.
    - Diagnosed with ADHD
    - Reading at 4th grade level
    - Needs sensory accommodations
    """
    learner = Learner(
        user_id=parent_user.id,
        first_name="Jayden",
        last_name="Ofem",
        date_of_birth=date(2013, 3, 15),  # 11 years old
        grade_level=6,
        current_reading_level="4th grade",
        current_math_level="5th grade",
        learning_themes=["MS"],  # Middle School theme
        diagnoses=["ADHD", "Dyslexia"],
        accommodations={
            "extended_time": True,
            "time_multiplier": 1.5,
            "read_aloud": True,
            "reduced_distractions": True,
            "break_reminders": True,
            "calculator": True
        },
        has_iep=True,
        settings={
            "max_game_breaks": 3,
            "break_minutes": 5,
            "allow_manual_breaks": True,
            "focus_mode": True
        }
    )
    db.add(learner)
    db.commit()
    db.refresh(learner)
    return learner


@pytest.fixture
def jason_learner(db, parent_user):
    """
    Create Jason Ofem - 9th grader.
    - Diagnosed with ASD (Autism Spectrum Disorder)
    - Reading at grade level
    - Needs executive function support
    """
    learner = Learner(
        user_id=parent_user.id,
        first_name="Jason",
        last_name="Ofem",
        date_of_birth=date(2010, 7, 22),  # 15 years old
        grade_level=9,
        current_reading_level="9th grade",
        current_math_level="10th grade",  # Advanced in math
        learning_themes=["HS"],  # High School theme
        diagnoses=["ASD", "Anxiety"],
        accommodations={
            "extended_time": True,
            "time_multiplier": 2.0,
            "sensory_breaks": True,
            "visual_schedules": True,
            "task_breakdown": True
        },
        has_iep=True,
        settings={
            "max_game_breaks": 2,
            "break_minutes": 10,
            "allow_manual_breaks": False,
            "focus_mode": True,
            "one_thing_at_a_time": True
        }
    )
    db.add(learner)
    db.commit()
    db.refresh(learner)
    return learner


@pytest.fixture
def jayden_sensory_profile(db, parent_user):
    """Jayden's sensory profile - ADHD focused."""
    profile = SensoryProfile(
        user_id=parent_user.id,
        name="Jayden's ADHD Focus Mode",
        preset_id="adhd-focus",
        visual={
            "reduce_animations": True,
            "reduce_motion": True,
            "high_contrast": True,
            "dark_mode": False,
            "reduced_clutter": True,
            "font_size": "large",
            "font_family": "dyslexic",
            "line_spacing": "extra-wide",
            "color_scheme": "warm",
            "flashing_content": "remove"
        },
        auditory={
            "mute_all_sounds": False,
            "sound_volume": 50,
            "no_background_music": True,
            "no_sound_effects": False,
            "text_to_speech_enabled": True,
            "text_to_speech_speed": 0.9,
            "text_to_speech_voice": "female",
            "audio_descriptions": False
        },
        motor={
            "larger_click_targets": True,
            "no_double_click": False,
            "no_drag_and_drop": False,
            "increase_spacing": True,
            "sticky_keys": False,
            "keyboard_only": False,
            "touch_accommodations": False,
            "hover_delay": 200
        },
        cognitive={
            "one_thing_at_a_time": True,
            "no_popups": True,
            "no_autoplay": True,
            "simplify_instructions": True,
            "show_progress_indicator": True,
            "limit_choices": 3,
            "extended_time": True,
            "time_multiplier": 1.5,
            "break_reminders": True,
            "break_frequency": 20
        },
        environment={
            "full_screen_mode": True,
            "minimize_distractions": True,
            "hide_chat": False,
            "hide_notifications": True,
            "white_noise": False
        }
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@pytest.fixture
def jason_sensory_profile(db, parent_user):
    """Jason's sensory profile - ASD low sensory."""
    profile = SensoryProfile(
        user_id=parent_user.id,
        name="Jason's Low Sensory Mode",
        preset_id="asd-low-sensory",
        visual={
            "reduce_animations": True,
            "reduce_motion": True,
            "high_contrast": False,
            "dark_mode": True,
            "reduced_clutter": True,
            "font_size": "medium",
            "font_family": "standard",
            "line_spacing": "wide",
            "color_scheme": "cool",
            "flashing_content": "remove"
        },
        auditory={
            "mute_all_sounds": True,
            "sound_volume": 0,
            "no_background_music": True,
            "no_sound_effects": True,
            "text_to_speech_enabled": False,
            "text_to_speech_speed": 1.0,
            "text_to_speech_voice": "male",
            "audio_descriptions": False
        },
        motor={
            "larger_click_targets": True,
            "no_double_click": True,
            "no_drag_and_drop": True,
            "increase_spacing": True,
            "sticky_keys": False,
            "keyboard_only": True,
            "touch_accommodations": True,
            "hover_delay": 500
        },
        cognitive={
            "one_thing_at_a_time": True,
            "no_popups": True,
            "no_autoplay": True,
            "simplify_instructions": False,
            "show_progress_indicator": True,
            "limit_choices": 0,
            "extended_time": True,
            "time_multiplier": 2.0,
            "break_reminders": True,
            "break_frequency": 30
        },
        environment={
            "full_screen_mode": True,
            "minimize_distractions": True,
            "hide_chat": True,
            "hide_notifications": True,
            "white_noise": False
        },
        triggers={
            "avoid_colors": ["#ff0000", "#ff6600"],
            "avoid_patterns": True,
            "avoid_flashing": True,
            "content_warnings": ["loud-noises", "sudden-changes"]
        }
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@pytest.fixture
def jayden_iep_goals(db, jayden_learner):
    """Jayden's IEP goals."""
    goals = [
        IEPGoal(
            learner_id=jayden_learner.id,
            goal_name="Read grade-level text with 80% comprehension",
            goal_description="Jayden will read 6th grade level texts and answer comprehension questions with 80% accuracy",
            category="reading",
            current_level="4th grade level",
            target_level="6th grade level",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=45,
            status=IEPGoalStatus.ON_TRACK,
            accommodations=["read_aloud", "extended_time", "graphic_organizers"]
        ),
        IEPGoal(
            learner_id=jayden_learner.id,
            goal_name="Complete multi-step math problems independently",
            goal_description="Jayden will solve 2-3 step math word problems with 75% accuracy without prompting",
            category="math",
            current_level="Requires verbal prompts",
            target_level="Independent with 75% accuracy",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=60,
            status=IEPGoalStatus.ON_TRACK,
            accommodations=["calculator", "step-by-step_breakdown", "visual_aids"]
        ),
        IEPGoal(
            learner_id=jayden_learner.id,
            goal_name="Sustain attention for 20 minutes",
            goal_description="Jayden will remain on-task during independent work for 20 minutes with no more than 2 redirections",
            category="social",
            current_level="10 minutes with 5+ redirections",
            target_level="20 minutes with <2 redirections",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=30,
            status=IEPGoalStatus.NEEDS_ATTENTION,
            accommodations=["break_reminders", "fidget_tools", "movement_breaks"]
        )
    ]

    for goal in goals:
        db.add(goal)

    db.commit()
    return goals


@pytest.fixture
def jason_iep_goals(db, jason_learner):
    """Jason's IEP goals."""
    goals = [
        IEPGoal(
            learner_id=jason_learner.id,
            goal_name="Initiate conversations with peers",
            goal_description="Jason will initiate appropriate conversations with peers at least 3 times per day",
            category="social",
            current_level="Rarely initiates; responds when approached",
            target_level="Initiates 3+ times daily",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=25,
            status=IEPGoalStatus.NEEDS_ATTENTION,
            accommodations=["social_scripts", "peer_buddy", "structured_activities"]
        ),
        IEPGoal(
            learner_id=jason_learner.id,
            goal_name="Manage transitions between activities",
            goal_description="Jason will transition between activities within 5 minutes with visual schedule support",
            category="social",
            current_level="Requires 10+ minutes and adult support",
            target_level="5 minutes with visual schedule only",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=70,
            status=IEPGoalStatus.ON_TRACK,
            accommodations=["visual_schedule", "transition_warnings", "first_then_board"]
        ),
        IEPGoal(
            learner_id=jason_learner.id,
            goal_name="Advanced algebra problem solving",
            goal_description="Jason will solve algebraic equations at 10th grade level with 90% accuracy",
            category="math",
            current_level="9th grade level at 85% accuracy",
            target_level="10th grade level at 90% accuracy",
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=85,
            status=IEPGoalStatus.EXCEEDING,
            accommodations=["extended_time", "quiet_workspace"]
        )
    ]

    for goal in goals:
        db.add(goal)

    db.commit()
    return goals


@pytest.fixture
def jayden_homework_session(db, jayden_learner):
    """Active homework session for Jayden."""
    session = HomeworkSession(
        learner_id=jayden_learner.id,
        title="6th Grade Math - Fractions Word Problems",
        status=HomeworkStatus.IN_PROGRESS,
        input_method="photo",
        original_text="Sarah has 3/4 of a pizza. She gives 1/3 of what she has to her brother. How much pizza does Sarah have left?",
        detected_subject="Math",
        detected_grade="6th grade",
        target_level="5th grade",  # Adjusted down for Jayden
        difficulty_adjustment="simplified",
        problem_statement="Sarah has 3/4 of a pizza. She gives 1/3 of what she has to her brother. How much pizza does Sarah have left?",
        key_questions=[
            "What fraction does Sarah start with?",
            "What operation do we use when someone gives away part of something?",
            "How do we multiply fractions?"
        ],
        current_step=HomeworkStep.PLAN,
        completed_steps=["understand"],
        settings={
            "read_aloud": True,
            "parent_assist_mode": False,
            "show_hints": True,
            "allow_calculator": True,
            "timer_enabled": True
        },
        hints_given=1,
        explanations_provided=[
            {
                "step": "understand",
                "text": "When someone gives away 1/3 of what they have, we multiply fractions.",
                "timestamp": "2025-10-22T10:30:00Z"
            }
        ],
        scaffolding_level="high"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@pytest.fixture
def jason_homework_session(db, jason_learner):
    """Active homework session for Jason."""
    session = HomeworkSession(
        learner_id=jason_learner.id,
        title="Algebra - Quadratic Equations",
        status=HomeworkStatus.IN_PROGRESS,
        input_method="text",
        original_text="Solve for x: x² + 5x + 6 = 0",
        detected_subject="Math",
        detected_grade="9th grade",
        target_level="9th grade",
        difficulty_adjustment="none",
        problem_statement="Solve for x: x² + 5x + 6 = 0",
        key_questions=[
            "What method can we use to solve this quadratic equation?",
            "Can this be factored?",
            "What are the solutions?"
        ],
        current_step=HomeworkStep.SOLVE,
        completed_steps=["understand", "plan"],
        settings={
            "read_aloud": False,
            "parent_assist_mode": False,
            "show_hints": True,
            "allow_calculator": True,
            "timer_enabled": False
        },
        hints_given=0,
        explanations_provided=[],
        scaffolding_level="moderate"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@pytest.fixture
def jayden_emotion_history(db, jayden_learner):
    """Recent emotion check-ins for Jayden."""
    emotions = [
        EmotionHistory(
            learner_id=jayden_learner.id,
            emotion=EmotionType.FRUSTRATED,
            level=4,
            trigger="Math homework is hard",
            context="homework_start",
            created_at=datetime(2025, 10, 22, 10, 0, 0)
        ),
        EmotionHistory(
            learner_id=jayden_learner.id,
            emotion=EmotionType.CALM,
            level=2,
            trigger="Took a 5 minute break and did breathing exercise",
            context="regulation_activity_end",
            created_at=datetime(2025, 10, 22, 10, 15, 0)
        ),
        EmotionHistory(
            learner_id=jayden_learner.id,
            emotion=EmotionType.HAPPY,
            level=4,
            trigger="Understood the problem with hint",
            context="homework_progress",
            created_at=datetime(2025, 10, 22, 10, 30, 0)
        )
    ]

    for emotion in emotions:
        db.add(emotion)

    db.commit()
    return emotions


@pytest.fixture
def auth_headers(parent_user):
    """Generate authentication headers."""
    token = create_access_token(subject=parent_user.id)
    return {"Authorization": f"Bearer {token}"}


# Mock External Services
class MockOpenAI:
    """Mock OpenAI API for testing."""
    
    def __init__(self):
        self.completion_response = {
            "choices": [
                {
                    "message": {
                        "content": "Here's a helpful hint: Try breaking down the problem into smaller steps."
                    }
                }
            ]
        }
    
    async def create_completion(self, **kwargs):
        """Mock completion generation."""
        return self.completion_response


class MockEmailService:
    """Mock email service for testing."""
    
    def __init__(self):
        self.sent_emails = []
    
    async def send_email(self, to: str, subject: str, body: str):
        """Mock email sending."""
        self.sent_emails.append({
            "to": to,
            "subject": subject,
            "body": body
        })
        return True


@pytest.fixture
def mock_openai():
    """Mock OpenAI client."""
    return MockOpenAI()


@pytest.fixture
def mock_email():
    """Mock email service."""
    return MockEmailService()
