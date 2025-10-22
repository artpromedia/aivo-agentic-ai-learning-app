import pytest


@pytest.mark.unit
def test_create_homework_session(client, auth_headers, jayden_learner):
    """Test creating a homework session for Jayden."""
    response = client.post(
        "/api/v1/homework/sessions",
        json={
            "learner_id": jayden_learner.id,
            "title": "Test Math Homework",
            "input_method": "text",
            "original_text": "What is 2 + 2?"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()

    assert data["success"] is True
    assert data["data"]["title"] == "Test Math Homework"
    assert data["data"]["learner_id"] == jayden_learner.id
    assert data["data"]["current_step"] == "understand"


@pytest.mark.unit
def test_jayden_accommodations_applied(jayden_learner):
    """Verify Jayden's accommodations are properly configured."""
    assert jayden_learner.accommodations["read_aloud"] is True
    assert jayden_learner.accommodations["extended_time"] is True
    assert jayden_learner.accommodations["time_multiplier"] == 1.5
    assert "ADHD" in jayden_learner.diagnoses


@pytest.mark.unit
def test_jason_profile_settings(jason_learner):
    """Verify Jason's profile is configured for ASD."""
    assert jason_learner.settings["one_thing_at_a_time"] is True
    assert jason_learner.accommodations["time_multiplier"] == 2.0
    assert "ASD" in jason_learner.diagnoses


@pytest.mark.unit
def test_jayden_sensory_profile(jayden_sensory_profile):
    """Test Jayden's ADHD focus sensory profile."""
    assert jayden_sensory_profile.preset_id == "adhd-focus"

    # Visual settings
    assert jayden_sensory_profile.visual["font_family"] == "dyslexic"
    assert jayden_sensory_profile.visual["reduce_animations"] is True

    # Cognitive settings
    assert jayden_sensory_profile.cognitive["one_thing_at_a_time"] is True
    assert jayden_sensory_profile.cognitive["time_multiplier"] == 1.5
    assert jayden_sensory_profile.cognitive["break_frequency"] == 20


@pytest.mark.unit
def test_jason_sensory_profile(jason_sensory_profile):
    """Test Jason's ASD low sensory profile."""
    assert jason_sensory_profile.preset_id == "asd-low-sensory"

    # Auditory settings (muted for Jason)
    assert jason_sensory_profile.auditory["mute_all_sounds"] is True
    assert jason_sensory_profile.auditory["sound_volume"] == 0

    # Motor settings
    assert jason_sensory_profile.motor["keyboard_only"] is True

    # Triggers
    assert "#ff0000" in jason_sensory_profile.triggers["avoid_colors"]


@pytest.mark.unit
def test_jayden_iep_goals_count(jayden_iep_goals):
    """Test Jayden has 3 IEP goals."""
    assert len(jayden_iep_goals) == 3


@pytest.mark.unit
def test_jason_iep_goals_count(jason_iep_goals):
    """Test Jason has 3 IEP goals."""
    assert len(jason_iep_goals) == 3


@pytest.mark.unit
def test_jayden_reading_goal(jayden_iep_goals):
    """Test Jayden's reading comprehension goal."""
    reading_goal = next(
        g for g in jayden_iep_goals if g.category == "reading"
    )

    assert reading_goal.current_level == "4th grade level"
    assert reading_goal.target_level == "6th grade level"
    assert reading_goal.progress_percentage == 45
    assert "read_aloud" in reading_goal.accommodations


@pytest.mark.unit
def test_jason_social_goals(jason_iep_goals):
    """Test Jason has two social goals."""
    social_goals = [
        g for g in jason_iep_goals if g.category == "social"
    ]

    assert len(social_goals) == 2

    # Check transitions goal is on track
    transitions_goal = next(
        g for g in social_goals
        if "transition" in g.goal_name.lower()
    )
    assert transitions_goal.progress_percentage == 70


@pytest.mark.unit
def test_jayden_homework_session_active(jayden_homework_session):
    """Test Jayden's homework session is in progress."""
    assert jayden_homework_session.status == "in_progress"
    assert jayden_homework_session.current_step == "plan"
    assert "understand" in jayden_homework_session.completed_steps
    assert jayden_homework_session.settings["read_aloud"] is True


@pytest.mark.unit
def test_jason_homework_session_advanced(jason_homework_session):
    """Test Jason's homework is at advanced level."""
    assert jason_homework_session.detected_grade == "9th grade"
    assert jason_homework_session.target_level == "9th grade"
    assert jason_homework_session.difficulty_adjustment == "none"
    assert jason_homework_session.current_step == "solve"


@pytest.mark.unit
def test_emotion_history_patterns(jayden_emotion_history):
    """Test Jayden's emotion history shows regulation."""
    assert len(jayden_emotion_history) == 3

    # First emotion is frustrated
    assert jayden_emotion_history[0].emotion == "frustrated"
    assert jayden_emotion_history[0].level == 4

    # Second emotion is calm (regulated)
    assert jayden_emotion_history[1].emotion == "calm"
    assert jayden_emotion_history[1].level == 2

    # Third emotion is happy (success)
    assert jayden_emotion_history[2].emotion == "happy"


@pytest.mark.unit
def test_parent_user_role(parent_user):
    """Test parent user has correct role."""
    assert parent_user.role == "parent"
    assert parent_user.is_active is True
    assert parent_user.is_verified is True
    assert parent_user.email == "parent@ofem.family"


@pytest.mark.unit
def test_teacher_user_role(teacher_user):
    """Test teacher user has correct role."""
    assert teacher_user.role == "teacher"
    assert teacher_user.full_name == "Ms. Sarah Johnson"


@pytest.mark.unit
def test_auth_headers_include_bearer(auth_headers):
    """Test auth headers have Bearer token."""
    assert "Authorization" in auth_headers
    assert auth_headers["Authorization"].startswith("Bearer ")
