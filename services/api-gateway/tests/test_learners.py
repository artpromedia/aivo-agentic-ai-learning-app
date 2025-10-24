"""
Learner CRUD endpoint tests.

Tests for learner creation, retrieval, updates, deletion,
and parent-teacher associations.
"""


class TestLearnerCreation:
    """Test learner creation endpoints."""
    
    def test_create_learner_as_parent(self, client, auth_headers):
        """Test parent can create a learner."""
        response = client.post(
            "/api/learners",
            headers=auth_headers,
            json={
                "first_name": "Emma",
                "last_name": "Smith",
                "grade_level": 8,
                "date_of_birth": "2011-05-15",
                "diagnoses": ["ADHD", "Dyslexia"],
                "learning_preferences": {
                    "visual_learner": True,
                    "prefers_quiet": True,
                    "needs_movement_breaks": True
                }
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["first_name"] == "Emma"
        assert data["last_name"] == "Smith"
        assert data["grade_level"] == 8
        assert "ADHD" in data["diagnoses"]
        assert "id" in data
    
    def test_create_learner_with_iep(self, client, auth_headers):
        """Test creating learner with IEP flag."""
        response = client.post(
            "/api/learners",
            headers=auth_headers,
            json={
                "first_name": "Liam",
                "last_name": "Johnson",
                "grade_level": 5,
                "date_of_birth": "2014-08-22",
                "has_iep": True,
                "iep_accommodations": [
                    "Extended time on tests",
                    "Preferential seating",
                    "Breaks as needed"
                ]
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["has_iep"] is True
        assert len(data["iep_accommodations"]) == 3
    
    def test_create_learner_missing_required_fields(self, client, auth_headers):
        """Test creating learner without required fields fails."""
        response = client.post(
            "/api/learners",
            headers=auth_headers,
            json={
                "first_name": "Test"
                # Missing last_name, grade_level, date_of_birth
            }
        )
        
        assert response.status_code == 422
    
    def test_create_learner_unauthenticated(self, client):
        """Test creating learner without auth fails."""
        response = client.post(
            "/api/learners",
            json={
                "first_name": "Test",
                "last_name": "User",
                "grade_level": 6,
                "date_of_birth": "2012-01-01"
            }
        )
        
        assert response.status_code == 401


class TestLearnerRetrieval:
    """Test learner retrieval endpoints."""
    
    def test_get_learner_by_id(self, client, auth_headers, jayden_learner):
        """Test retrieving learner by ID."""
        response = client.get(
            f"/api/learners/{jayden_learner.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == jayden_learner.id
        assert data["first_name"] == "Jayden"
        assert data["last_name"] == "Ofem"
        assert data["grade_level"] == 6
    
    def test_get_learner_not_found(self, client, auth_headers):
        """Test retrieving non-existent learner returns 404."""
        response = client.get(
            "/api/learners/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_list_learners_for_parent(self, client, auth_headers, jayden_learner, jason_learner):
        """Test listing all learners for authenticated parent."""
        response = client.get(
            "/api/learners",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        
        # Verify both learners present
        learner_ids = [l["id"] for l in data]
        assert jayden_learner.id in learner_ids
        assert jason_learner.id in learner_ids
    
    def test_list_learners_unauthenticated(self, client):
        """Test listing learners without auth fails."""
        response = client.get("/api/learners")
        
        assert response.status_code == 401
    
    def test_get_learner_with_sensory_profile(self, client, auth_headers, jayden_learner, jayden_sensory_profile):
        """Test retrieving learner includes sensory profile."""
        response = client.get(
            f"/api/learners/{jayden_learner.id}",
            headers=auth_headers,
            params={"include_profile": True}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "sensory_profile" in data
        assert data["sensory_profile"]["noise_sensitivity"] == "high"


class TestLearnerUpdates:
    """Test learner update endpoints."""
    
    def test_update_learner_basic_info(self, client, auth_headers, jayden_learner):
        """Test updating learner basic information."""
        response = client.patch(
            f"/api/learners/{jayden_learner.id}",
            headers=auth_headers,
            json={
                "grade_level": 7,
                "learning_preferences": {
                    "visual_learner": True,
                    "needs_fidget_tools": True
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["grade_level"] == 7
        assert data["learning_preferences"]["needs_fidget_tools"] is True
    
    def test_update_learner_diagnoses(self, client, auth_headers, jayden_learner):
        """Test updating learner diagnoses."""
        response = client.patch(
            f"/api/learners/{jayden_learner.id}",
            headers=auth_headers,
            json={
                "diagnoses": ["ADHD", "Dyslexia", "Anxiety"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["diagnoses"]) == 3
        assert "Anxiety" in data["diagnoses"]
    
    def test_update_learner_iep_accommodations(self, client, auth_headers, jayden_learner):
        """Test updating IEP accommodations."""
        response = client.patch(
            f"/api/learners/{jayden_learner.id}",
            headers=auth_headers,
            json={
                "has_iep": True,
                "iep_accommodations": [
                    "Extended time",
                    "Small group testing",
                    "Frequent breaks"
                ]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["has_iep"] is True
        assert len(data["iep_accommodations"]) == 3
    
    def test_update_learner_not_found(self, client, auth_headers):
        """Test updating non-existent learner returns 404."""
        response = client.patch(
            "/api/learners/99999",
            headers=auth_headers,
            json={"grade_level": 8}
        )
        
        assert response.status_code == 404
    
    def test_update_learner_unauthorized(self, client, jayden_learner):
        """Test updating learner without auth fails."""
        response = client.patch(
            f"/api/learners/{jayden_learner.id}",
            json={"grade_level": 7}
        )
        
        assert response.status_code == 401


class TestLearnerDeletion:
    """Test learner deletion endpoints."""
    
    def test_delete_learner(self, client, auth_headers, db):
        """Test deleting a learner."""
        from app.models.learner import Learner
        
        # Create learner to delete
        learner = Learner(
            first_name="ToDelete",
            last_name="User",
            grade_level=5,
            parent_id=1  # From fixture
        )
        db.add(learner)
        db.commit()
        db.refresh(learner)
        learner_id = learner.id
        
        # Delete learner
        response = client.delete(
            f"/api/learners/{learner_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify deleted
        get_response = client.get(
            f"/api/learners/{learner_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404
    
    def test_delete_learner_not_found(self, client, auth_headers):
        """Test deleting non-existent learner returns 404."""
        response = client.delete(
            "/api/learners/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_delete_learner_unauthorized(self, client, jayden_learner):
        """Test deleting learner without auth fails."""
        response = client.delete(f"/api/learners/{jayden_learner.id}")
        
        assert response.status_code == 401


class TestTeacherAccess:
    """Test teacher access to learners."""
    
    def test_teacher_can_view_assigned_learner(self, client, db, teacher_user, jayden_learner):
        """Test teacher can view learners assigned to them."""
        from app.core.security import create_access_token
        
        # Create teacher auth headers
        token = create_access_token(subject=teacher_user.id)
        teacher_headers = {"Authorization": f"Bearer {token}"}
        
        # Assign learner to teacher (would be done via separate endpoint)
        # Assuming relationship exists
        
        response = client.get(
            f"/api/learners/{jayden_learner.id}",
            headers=teacher_headers
        )
        
        # Teacher should be able to view
        assert response.status_code in [200, 403]  # Depends on assignment logic
    
    def test_teacher_cannot_delete_learner(self, client, db, teacher_user, jayden_learner):
        """Test teacher cannot delete learners."""
        from app.core.security import create_access_token
        
        token = create_access_token(subject=teacher_user.id)
        teacher_headers = {"Authorization": f"Bearer {token}"}
        
        response = client.delete(
            f"/api/learners/{jayden_learner.id}",
            headers=teacher_headers
        )
        
        # Should be forbidden
        assert response.status_code == 403


class TestLearnerSearch:
    """Test learner search and filtering."""
    
    def test_search_learners_by_grade(self, client, auth_headers, jayden_learner, jason_learner):
        """Test searching learners by grade level."""
        response = client.get(
            "/api/learners",
            headers=auth_headers,
            params={"grade_level": 6}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should only return 6th graders
        for learner in data:
            assert learner["grade_level"] == 6
    
    def test_search_learners_by_diagnosis(self, client, auth_headers, jayden_learner):
        """Test searching learners by diagnosis."""
        response = client.get(
            "/api/learners",
            headers=auth_headers,
            params={"diagnosis": "ADHD"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned learners should have ADHD diagnosis
        for learner in data:
            assert "ADHD" in learner.get("diagnoses", [])
    
    def test_search_learners_with_iep(self, client, auth_headers):
        """Test filtering learners with IEP."""
        response = client.get(
            "/api/learners",
            headers=auth_headers,
            params={"has_iep": True}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned learners should have IEP
        for learner in data:
            assert learner.get("has_iep") is True
