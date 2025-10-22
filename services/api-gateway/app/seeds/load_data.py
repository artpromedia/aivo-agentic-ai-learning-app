"""
Seed database with realistic test data for Jayden and Jason Ofem.

Usage:
    python -m app.seeds.load_data
"""

import logging
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.learner import Learner
from app.models.sensory_profile import SensoryProfile
from app.models.homework import (
    HomeworkSession,
    HomeworkStatus,
    HomeworkStep
)
from app.models.iep import IEPGoal, IEPDataPoint, IEPGoalStatus
from app.models.regulation import (
    EmotionHistory,
    EmotionType
)
from app.models.progress import ProgressRecord
from app.models.analytics import DailyMetrics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_database():
    """Main seeding function."""
    logger.info("🌱 Starting database seeding...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Create parent user
        parent = create_parent_user(db)

        # Create teacher
        create_teacher_user(db)

        # Create learners
        jayden = create_jayden(db, parent)
        jason = create_jason(db, parent)

        # Create sensory profiles
        create_sensory_profiles(db, parent, jayden, jason)

        # Create IEP goals
        create_iep_goals(db, jayden, jason)

        # Create homework sessions
        create_homework_sessions(db, jayden, jason)

        # Create emotion history
        create_emotion_history(db, jayden, jason)

        # Create progress records
        create_progress_records(db, jayden, jason)

        # Create analytics
        create_analytics(db, jayden, jason)

        db.commit()

        logger.info("✅ Database seeding completed successfully!")
        logger.info("   - Parent: parent@ofem.family / Password123!")
        logger.info("   - Teacher: teacher@school.edu / Teacher123!")
        logger.info("   - Learners: Jayden (6th), Jason (9th)")

    except Exception as e:
        logger.error(f"❌ Seeding failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_parent_user(db: Session) -> User:
    """Create parent user for Ofem family."""
    logger.info("Creating parent user...")

    user = User(
        email="parent@ofem.family",
        hashed_password=get_password_hash("Password123!"),
        full_name="Emmanuel Ofem",
        role=UserRole.PARENT,
        is_active=True,
        is_verified=True,
        preferences={
            "theme": "light",
            "notifications_enabled": True,
            "email_digest": "daily"
        }
    )

    db.add(user)
    db.flush()

    logger.info(f"   ✓ Created parent: {user.email}")
    return user


def create_teacher_user(db: Session) -> User:
    """Create teacher user."""
    logger.info("Creating teacher user...")

    user = User(
        email="teacher@school.edu",
        hashed_password=get_password_hash("Teacher123!"),
        full_name="Ms. Sarah Johnson",
        role=UserRole.TEACHER,
        is_active=True,
        is_verified=True
    )

    db.add(user)
    db.flush()

    logger.info(f"   ✓ Created teacher: {user.email}")
    return user


def create_jayden(db: Session, parent: User) -> Learner:
    """Create Jayden Ofem - 6th grader with ADHD and Dyslexia."""
    logger.info("Creating Jayden Ofem...")

    jayden = Learner(
        user_id=parent.id,
        first_name="Jayden",
        last_name="Ofem",
        date_of_birth=date(2013, 3, 15),
        grade_level=6,
        current_reading_level="4th grade",
        current_math_level="5th grade",
        learning_themes=["MS"],
        diagnoses=["ADHD", "Dyslexia"],
        accommodations={
            "extended_time": True,
            "time_multiplier": 1.5,
            "read_aloud": True,
            "text_to_speech": True,
            "reduced_distractions": True,
            "break_reminders": True,
            "calculator": True,
            "graphic_organizers": True,
            "dyslexic_font": True
        },
        has_iep=True,
        settings={
            "max_game_breaks": 3,
            "break_minutes": 5,
            "allow_manual_breaks": True,
            "focus_mode": True,
            "background_music": False
        }
    )

    db.add(jayden)
    db.flush()

    logger.info("   ✓ Created Jayden: 6th grade, ADHD + Dyslexia")
    return jayden


def create_jason(db: Session, parent: User) -> Learner:
    """Create Jason Ofem - 9th grader with ASD and Anxiety."""
    logger.info("Creating Jason Ofem...")

    jason = Learner(
        user_id=parent.id,
        first_name="Jason",
        last_name="Ofem",
        date_of_birth=date(2010, 7, 22),
        grade_level=9,
        current_reading_level="9th grade",
        current_math_level="10th grade",
        learning_themes=["HS"],
        diagnoses=["ASD", "Anxiety"],
        accommodations={
            "extended_time": True,
            "time_multiplier": 2.0,
            "sensory_breaks": True,
            "visual_schedules": True,
            "task_breakdown": True,
            "quiet_workspace": True,
            "transition_warnings": True,
            "no_group_work": True
        },
        has_iep=True,
        settings={
            "max_game_breaks": 2,
            "break_minutes": 10,
            "allow_manual_breaks": False,
            "focus_mode": True,
            "one_thing_at_a_time": True,
            "mute_all_sounds": True
        }
    )

    db.add(jason)
    db.flush()

    logger.info("   ✓ Created Jason: 9th grade, ASD + Anxiety")
    return jason


def create_sensory_profiles(
    db: Session,
    parent: User,
    jayden: Learner,
    jason: Learner
):
    """Create sensory profiles for both learners."""
    logger.info("Creating sensory profiles...")

    # Jayden's ADHD focus profile
    jayden_profile = SensoryProfile(
        user_id=parent.id,
        name="Jayden's Focus Mode",
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

    # Jason's low sensory profile
    jason_profile = SensoryProfile(
        user_id=parent.id,
        name="Jason's Calm Space",
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

    # Link to learners
    jayden.sensory_profile_id = jayden_profile.id
    jason.sensory_profile_id = jason_profile.id

    db.add(jayden_profile)
    db.add(jason_profile)
    db.flush()

    logger.info("   ✓ Created sensory profiles for both learners")


def create_iep_goals(db: Session, jayden: Learner, jason: Learner):
    """Create IEP goals with progress data."""
    logger.info("Creating IEP goals...")

    # Jayden's goals
    jayden_goals = [
        {
            "goal_name": "Read grade-level text with 80% comprehension",
            "goal_description": (
                "Jayden will read 6th grade level texts and answer "
                "comprehension questions with 80% accuracy"
            ),
            "category": "reading",
            "current_level": "4th grade level",
            "target_level": "6th grade level",
            "progress": 45,
            "status": IEPGoalStatus.ON_TRACK
        },
        {
            "goal_name": "Complete multi-step math problems independently",
            "goal_description": (
                "Jayden will solve 2-3 step math word problems with "
                "75% accuracy without prompting"
            ),
            "category": "math",
            "current_level": "Requires verbal prompts",
            "target_level": "Independent with 75% accuracy",
            "progress": 60,
            "status": IEPGoalStatus.ON_TRACK
        },
        {
            "goal_name": "Sustain attention for 20 minutes",
            "goal_description": (
                "Jayden will remain on-task during independent work for "
                "20 minutes with no more than 2 redirections"
            ),
            "category": "social",
            "current_level": "10 minutes with 5+ redirections",
            "target_level": "20 minutes with <2 redirections",
            "progress": 30,
            "status": IEPGoalStatus.NEEDS_ATTENTION
        }
    ]

    # Jason's goals
    jason_goals = [
        {
            "goal_name": "Initiate conversations with peers",
            "goal_description": (
                "Jason will initiate appropriate conversations with "
                "peers at least 3 times per day"
            ),
            "category": "social",
            "current_level": "Rarely initiates; responds when approached",
            "target_level": "Initiates 3+ times daily",
            "progress": 25,
            "status": IEPGoalStatus.NEEDS_ATTENTION
        },
        {
            "goal_name": "Manage transitions between activities",
            "goal_description": (
                "Jason will transition between activities within 5 "
                "minutes with visual schedule support"
            ),
            "category": "social",
            "current_level": "Requires 10+ minutes and adult support",
            "target_level": "5 minutes with visual schedule only",
            "progress": 70,
            "status": IEPGoalStatus.ON_TRACK
        },
        {
            "goal_name": "Advanced algebra problem solving",
            "goal_description": (
                "Jason will solve algebraic equations at 10th grade "
                "level with 90% accuracy"
            ),
            "category": "math",
            "current_level": "9th grade level at 85% accuracy",
            "target_level": "10th grade level at 90% accuracy",
            "progress": 85,
            "status": IEPGoalStatus.EXCEEDING
        }
    ]

    # Create Jayden's goals
    for goal_data in jayden_goals:
        goal = IEPGoal(
            learner_id=jayden.id,
            goal_name=goal_data["goal_name"],
            goal_description=goal_data["goal_description"],
            category=goal_data["category"],
            current_level=goal_data["current_level"],
            target_level=goal_data["target_level"],
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=goal_data["progress"],
            status=goal_data["status"],
            accommodations=[
                "read_aloud",
                "extended_time",
                "break_reminders"
            ]
        )
        db.add(goal)
        db.flush()

        # Add data points
        create_iep_data_points(db, goal, goal_data["progress"])

    # Create Jason's goals
    for goal_data in jason_goals:
        goal = IEPGoal(
            learner_id=jason.id,
            goal_name=goal_data["goal_name"],
            goal_description=goal_data["goal_description"],
            category=goal_data["category"],
            current_level=goal_data["current_level"],
            target_level=goal_data["target_level"],
            start_date=date(2024, 9, 1),
            target_date=date(2025, 6, 15),
            progress_percentage=goal_data["progress"],
            status=goal_data["status"],
            accommodations=[
                "visual_schedule",
                "sensory_breaks",
                "extended_time"
            ]
        )
        db.add(goal)
        db.flush()

        # Add data points
        create_iep_data_points(db, goal, goal_data["progress"])

    logger.info(f"   ✓ Created {len(jayden_goals)} goals for Jayden")
    logger.info(f"   ✓ Created {len(jason_goals)} goals for Jason")


def create_iep_data_points(
    db: Session,
    goal: IEPGoal,
    target_progress: int
):
    """Create realistic data points showing progress."""
    # Create 10 data points over 2 months
    start_date = date(2024, 9, 1)

    for i in range(10):
        # Progress increases gradually
        value = min(int(target_progress * (i / 9)), 100)

        point = IEPDataPoint(
            goal_id=goal.id,
            value=value,
            notes=f"Weekly progress check {i+1}",
            recorded_by="teacher",
            created_at=datetime.combine(
                start_date + timedelta(weeks=i),
                datetime.min.time()
            )
        )
        db.add(point)


def create_homework_sessions(
    db: Session,
    jayden: Learner,
    jason: Learner
):
    """Create homework sessions."""
    logger.info("Creating homework sessions...")

    # Jayden's math homework
    jayden_hw = HomeworkSession(
        learner_id=jayden.id,
        title="6th Grade Math - Fractions Word Problems",
        status=HomeworkStatus.IN_PROGRESS,
        input_method="photo",
        original_text=(
            "Sarah has 3/4 of a pizza. She gives 1/3 of what she has "
            "to her brother. How much pizza does Sarah have left?"
        ),
        detected_subject="Math",
        detected_grade="6th grade",
        target_level="5th grade",
        difficulty_adjustment="simplified",
        problem_statement=(
            "Sarah has 3/4 of a pizza. She gives 1/3 of what she has "
            "to her brother. How much pizza does Sarah have left?"
        ),
        key_questions=[
            "What fraction does Sarah start with?",
            "What does 'gives 1/3 of what she has' mean?",
            "How do we multiply fractions?"
        ],
        current_step=HomeworkStep.PLAN,
        completed_steps=["understand"],
        settings={
            "read_aloud": True,
            "show_hints": True,
            "allow_calculator": True
        },
        hints_given=1,
        scaffolding_level="high"
    )

    # Jason's algebra homework
    jason_hw = HomeworkSession(
        learner_id=jason.id,
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
            "What methods can solve quadratic equations?",
            "Can this be factored?",
            "What are the solutions?"
        ],
        current_step=HomeworkStep.SOLVE,
        completed_steps=["understand", "plan"],
        settings={
            "read_aloud": False,
            "show_hints": True,
            "allow_calculator": True
        },
        hints_given=0,
        scaffolding_level="moderate"
    )

    db.add(jayden_hw)
    db.add(jason_hw)
    db.flush()

    logger.info("   ✓ Created homework sessions")


def create_emotion_history(
    db: Session,
    jayden: Learner,
    jason: Learner
):
    """Create emotion check-in history."""
    logger.info("Creating emotion history...")

    # Jayden's emotions (ADHD pattern - more variability)
    jayden_emotions = [
        (
            EmotionType.FRUSTRATED,
            4,
            "Math homework is hard",
            datetime(2025, 10, 22, 10, 0)
        ),
        (
            EmotionType.CALM,
            2,
            None,
            datetime(2025, 10, 22, 10, 15)
        ),
        (
            EmotionType.HAPPY,
            4,
            "Understood the problem!",
            datetime(2025, 10, 22, 10, 30)
        ),
        (
            EmotionType.ANXIOUS,
            3,
            "Running out of time",
            datetime(2025, 10, 22, 11, 0)
        )
    ]

    # Jason's emotions (ASD pattern - more stable, lower intensity)
    jason_emotions = [
        (
            EmotionType.CALM,
            3,
            None,
            datetime(2025, 10, 22, 9, 0)
        ),
        (
            EmotionType.ANXIOUS,
            4,
            "New assignment format",
            datetime(2025, 10, 22, 10, 0)
        ),
        (
            EmotionType.CALM,
            2,
            "Used visual schedule",
            datetime(2025, 10, 22, 10, 30)
        ),
        (
            EmotionType.HAPPY,
            3,
            "Finished problem",
            datetime(2025, 10, 22, 11, 0)
        )
    ]

    for emotion, level, trigger, timestamp in jayden_emotions:
        entry = EmotionHistory(
            learner_id=jayden.id,
            emotion=emotion,
            level=level,
            trigger=trigger,
            created_at=timestamp
        )
        db.add(entry)

    for emotion, level, trigger, timestamp in jason_emotions:
        entry = EmotionHistory(
            learner_id=jason.id,
            emotion=emotion,
            level=level,
            trigger=trigger,
            created_at=timestamp
        )
        db.add(entry)

    logger.info("   ✓ Created emotion history")


def create_progress_records(
    db: Session,
    jayden: Learner,
    jason: Learner
):
    """Create progress tracking records."""
    logger.info("Creating progress records...")

    # Jayden's activities (last 30 days)
    for i in range(20):
        record = ProgressRecord(
            learner_id=jayden.id,
            activity_type="activity",
            activity_id=f"activity_{i}",
            activity_name=f"Math Practice #{i+1}",
            subject="Math",
            grade_level="6th grade",
            score=60 + (i * 1.5),  # Improving over time
            time_spent_seconds=900 + (i * 30),
            completed=True,
            accommodations_used=["read_aloud", "extended_time"],
            created_at=datetime.utcnow() - timedelta(days=30-i)
        )
        db.add(record)

    # Jason's activities
    for i in range(15):
        record = ProgressRecord(
            learner_id=jason.id,
            activity_type="activity",
            activity_id=f"activity_{i}",
            activity_name=f"Algebra Problem Set #{i+1}",
            subject="Math",
            grade_level="9th grade",
            score=85 + (i * 0.5),  # Already high, slight improvement
            time_spent_seconds=1200,
            completed=True,
            accommodations_used=["extended_time", "quiet_workspace"],
            created_at=datetime.utcnow() - timedelta(days=30-i)
        )
        db.add(record)

    logger.info("   ✓ Created progress records")


def create_analytics(db: Session, jayden: Learner, jason: Learner):
    """Create daily analytics."""
    logger.info("Creating analytics...")

    # Last 30 days for Jayden
    for i in range(30):
        daily = DailyMetrics(
            learner_id=jayden.id,
            date=date.today() - timedelta(days=30-i),
            total_sessions=2 if i % 2 == 0 else 1,
            total_minutes=30 + (i * 2),
            activities_completed=1 if i % 2 == 0 else 0,
            average_score=60 + i,
            distraction_events=5 - (i // 10),  # Improving
            game_breaks_used=2,
            emotion_check_ins=3,
            average_emotion_level=3.5
        )
        db.add(daily)

    # Last 30 days for Jason
    for i in range(30):
        daily = DailyMetrics(
            learner_id=jason.id,
            date=date.today() - timedelta(days=30-i),
            total_sessions=1 if i % 3 == 0 else 0,
            total_minutes=45,
            activities_completed=1 if i % 3 == 0 else 0,
            average_score=85 + (i * 0.3),
            distraction_events=1,
            game_breaks_used=1,
            emotion_check_ins=2,
            average_emotion_level=2.5
        )
        db.add(daily)

    logger.info("   ✓ Created analytics")


if __name__ == "__main__":
    seed_database()
