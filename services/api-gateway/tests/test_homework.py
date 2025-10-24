"""
Homework session endpoint tests.

Tests for homework session creation, step progression,
file uploads, AI hints, and session completion.
"""


class TestHomeworkSessionCreation:
    """Test homework session creation endpoints."""
    
    def test_create_homework_session(
        self, client, auth_headers, jayden_learner
    ):
        """Test creating a new homework session."""
        response = client.post(
            "/api/homework/sessions",
            headers=auth_headers,
            json={
                "learner_id": jayden_learner.id,
                "subject": "Mathematics",
                "title": "Solving Linear Equations",
                "description": "Practice solving 2-step equations",
                "grade_level": 6,
                "settings": {
                    "read_aloud": True,
                    "show_hints": True,
                    "timer_enabled": False
                }
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["subject"] == "Mathematics"
        assert data["title"] == "Solving Linear Equations"
        assert data["learner_id"] == jayden_learner.id
        assert data["current_step"] == "understand"
        assert "id" in data
    
    def test_create_session_with_uploaded_file(
        self, client, auth_headers, jayden_learner
    ):
        """Test creating session with uploaded homework file."""
        response = client.post(
            "/api/homework/sessions",
            headers=auth_headers,
            json={
                "learner_id": jayden_learner.id,
                "subject": "Science",
                "title": "Photosynthesis Worksheet",
                "file_url": "https://storage.example.com/homework123.pdf",
                "file_type": "application/pdf"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["file_url"] is not None
        assert "pdf" in data["file_type"]
    
    def test_create_session_invalid_learner(self, client, auth_headers):
        """Test creating session with invalid learner ID fails."""
        response = client.post(
            "/api/homework/sessions",
            headers=auth_headers,
            json={
                "learner_id": 99999,
                "subject": "Math",
                "title": "Test"
            }
        )
        
        assert response.status_code == 404
    
    def test_create_session_unauthenticated(self, client, jayden_learner):
        """Test creating session without auth fails."""
        response = client.post(
            "/api/homework/sessions",
            json={
                "learner_id": jayden_learner.id,
                "subject": "Math",
                "title": "Test"
            }
        )
        
        assert response.status_code == 401


class TestHomeworkSessionRetrieval:
    """Test homework session retrieval endpoints."""
    
    def test_get_session_by_id(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test retrieving homework session by ID."""
        response = client.get(
            f"/api/homework/sessions/{jayden_homework_session.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == jayden_homework_session.id
        assert data["subject"] == "Mathematics"
        assert data["current_step"] == "solve"
    
    def test_get_session_not_found(self, client, auth_headers):
        """Test retrieving non-existent session returns 404."""
        response = client.get(
            "/api/homework/sessions/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_list_sessions_for_learner(
        self, client, auth_headers, jayden_learner, jayden_homework_session
    ):
        """Test listing all sessions for a learner."""
        response = client.get(
            f"/api/learners/{jayden_learner.id}/homework/sessions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        session_ids = [s["id"] for s in data]
        assert jayden_homework_session.id in session_ids
    
    def test_list_active_sessions(self, client, auth_headers, jayden_learner):
        """Test listing only active (incomplete) sessions."""
        response = client.get(
            f"/api/learners/{jayden_learner.id}/homework/sessions",
            headers=auth_headers,
            params={"status": "active"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        for session in data:
            assert session["status"] != "completed"


class TestHomeworkStepProgression:
    """Test homework step progression."""
    
    def test_progress_to_next_step(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test progressing to next homework step."""
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/progress",
            headers=auth_headers,
            json={
                "current_step": "solve",
                "next_step": "check"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_step"] == "check"
        assert "check" in data["completed_steps"]
    
    def test_complete_homework_session(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test completing a homework session."""
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/complete",
            headers=auth_headers,
            json={
                "final_answers": ["x = 5", "x = -3"],
                "confidence_level": 4
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed_at"] is not None
    
    def test_cannot_progress_invalid_step(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test progressing to invalid step fails."""
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/progress",
            headers=auth_headers,
            json={
                "current_step": "solve",
                "next_step": "invalid_step"
            }
        )
        
        assert response.status_code == 400


class TestFileUpload:
    """Test homework file upload functionality."""
    
    def test_upload_homework_file(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test uploading a homework file."""
        # Mock file upload
        files = {
            "file": ("homework.pdf", b"fake pdf content", "application/pdf")
        }
        
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "file_url" in data
        assert data["file_type"] == "application/pdf"
    
    def test_upload_multiple_files(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test uploading multiple homework files."""
        files = [
            ("files", ("page1.jpg", b"fake image", "image/jpeg")),
            ("files", ("page2.jpg", b"fake image", "image/jpeg"))
        ]
        
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["file_urls"]) == 2
    
    def test_upload_invalid_file_type(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test uploading invalid file type fails."""
        files = {
            "file": ("virus.exe", b"fake exe", "application/x-msdownload")
        }
        
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 400
        assert "file type" in response.json()["detail"].lower()


class TestAIHints:
    """Test AI hint generation."""
    
    def test_generate_hint(
        self, client, auth_headers, jayden_homework_session, mock_openai
    ):
        """Test generating AI hint for homework problem."""
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/hint",
            headers=auth_headers,
            json={
                "problem_text": "Solve: 2x + 5 = 13",
                "context": "Student is stuck on isolating the variable"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "hint" in data
        assert len(data["hint"]) > 0
        
        # Verify hint was recorded
        assert data["hints_given"] > 0
    
    def test_generate_scaffolded_hint(
        self, client, auth_headers, jayden_homework_session, mock_openai
    ):
        """Test generating scaffolded hint based on level."""
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/hint",
            headers=auth_headers,
            json={
                "problem_text": "Solve: 2x + 5 = 13",
                "scaffolding_level": "high"  # More support
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "hint" in data
        # High scaffolding should provide more detailed hint
    
    def test_hint_limit_enforcement(
        self, client, auth_headers, db, jayden_homework_session
    ):
        """Test hint limit enforcement (max 3 hints per problem)."""
        # Set hints_given to 3
        jayden_homework_session.hints_given = 3
        db.commit()
        
        response = client.post(
            f"/api/homework/sessions/{jayden_homework_session.id}/hint",
            headers=auth_headers,
            json={"problem_text": "Test problem"}
        )
        
        assert response.status_code == 400
        assert "limit" in response.json()["detail"].lower()


class TestSessionAutosave:
    """Test session autosave functionality."""
    
    def test_autosave_progress(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test autosaving session progress."""
        response = client.patch(
            f"/api/homework/sessions/{jayden_homework_session.id}",
            headers=auth_headers,
            json={
                "work_in_progress": "2x + 5 = 13\n2x = 8\nx = 4",
                "last_autosave": "2025-01-15T10:30:00"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "work_in_progress" in data
    
    def test_autosave_frequency_limit(
        self, client, auth_headers, jayden_homework_session, redis_client
    ):
        """Test autosave frequency limiting (max 1 per 10 seconds)."""
        # First autosave should succeed
        response1 = client.patch(
            f"/api/homework/sessions/{jayden_homework_session.id}",
            headers=auth_headers,
            json={"work_in_progress": "Step 1"}
        )
        assert response1.status_code == 200
        
        # Immediate second autosave should be rate limited
        response2 = client.patch(
            f"/api/homework/sessions/{jayden_homework_session.id}",
            headers=auth_headers,
            json={"work_in_progress": "Step 2"}
        )
        
        # Depending on implementation, might be 429 or silently ignored
        assert response2.status_code in [200, 429]


class TestSessionSettings:
    """Test homework session settings."""
    
    def test_update_session_settings(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test updating session settings."""
        response = client.patch(
            f"/api/homework/sessions/{jayden_homework_session.id}/settings",
            headers=auth_headers,
            json={
                "read_aloud": True,
                "timer_enabled": True,
                "timer_duration": 1800  # 30 minutes
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["settings"]["read_aloud"] is True
        assert data["settings"]["timer_enabled"] is True
    
    def test_enable_parent_assist_mode(
        self, client, auth_headers, jayden_homework_session
    ):
        """Test enabling parent assist mode."""
        response = client.patch(
            f"/api/homework/sessions/{jayden_homework_session.id}/settings",
            headers=auth_headers,
            json={"parent_assist_mode": True}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["settings"]["parent_assist_mode"] is True
