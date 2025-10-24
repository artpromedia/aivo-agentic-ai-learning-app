"""
Authentication endpoint tests.

Tests for user registration, login, logout, password reset,
and rate limiting functionality.
"""

import pytest
from datetime import datetime, timedelta
from app.models.user import UserRole


class TestRegistration:
    """Test user registration endpoints."""
    
    def test_register_parent_success(self, client):
        """Test successful parent registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newparent@example.com",
                "password": "SecurePass123!",
                "full_name": "Jane Doe",
                "role": "parent"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newparent@example.com"
        assert data["full_name"] == "Jane Doe"
        assert data["role"] == "parent"
        assert "id" in data
        assert "password" not in data  # Password should not be returned
    
    def test_register_teacher_with_license(self, client):
        """Test successful teacher registration with license."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newteacher@school.edu",
                "password": "TeacherPass123!",
                "full_name": "Mr. John Smith",
                "role": "teacher",
                "teaching_license": "EDU-12345-2025"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "teacher"
        assert data["teaching_license"] == "EDU-12345-2025"
    
    def test_register_duplicate_email(self, client, parent_user):
        """Test registration with existing email fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": parent_user.email,
                "password": "AnyPassword123!",
                "full_name": "Duplicate User",
                "role": "parent"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_weak_password(self, client):
        """Test registration with weak password fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "weak",
                "full_name": "Test User",
                "role": "parent"
            }
        )
        
        assert response.status_code == 422
        # Password validation should fail
    
    def test_register_teacher_without_license(self, client):
        """Test teacher registration without license fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "teacher@school.edu",
                "password": "TeacherPass123!",
                "full_name": "Mr. Smith",
                "role": "teacher"
                # Missing teaching_license
            }
        )
        
        assert response.status_code == 400
        assert "license" in response.json()["detail"].lower()
    
    def test_register_invalid_role(self, client):
        """Test registration with invalid role fails."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "full_name": "Test User",
                "role": "superadmin"  # Invalid role
            }
        )
        
        assert response.status_code == 422


class TestLogin:
    """Test login endpoint."""
    
    def test_login_success(self, client, parent_user):
        """Test successful login."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": parent_user.email,
                "password": "password123"  # From fixture
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == parent_user.email
    
    def test_login_wrong_password(self, client, parent_user):
        """Test login with wrong password fails."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": parent_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user fails."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_inactive_user(self, client, db):
        """Test login with inactive user fails."""
        from app.models.user import User
        from app.core.security import get_password_hash
        
        # Create inactive user
        inactive_user = User(
            email="inactive@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Inactive User",
            role=UserRole.PARENT,
            is_active=False
        )
        db.add(inactive_user)
        db.commit()
        
        response = client.post(
            "/api/auth/login",
            json={
                "email": "inactive@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 403
        assert "inactive" in response.json()["detail"].lower()


class TestLogout:
    """Test logout endpoint."""
    
    def test_logout_success(self, client, auth_headers):
        """Test successful logout."""
        response = client.post(
            "/api/auth/logout",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"
    
    def test_logout_without_auth(self, client):
        """Test logout without authentication fails."""
        response = client.post("/api/auth/logout")
        
        assert response.status_code == 401


class TestGetCurrentUser:
    """Test get current user endpoint."""
    
    def test_get_current_user_success(self, client, auth_headers, parent_user):
        """Test getting current authenticated user."""
        response = client.get(
            "/api/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == parent_user.email
        assert data["full_name"] == parent_user.full_name
        assert data["role"] == parent_user.role
        assert "password" not in data
    
    def test_get_current_user_unauthenticated(self, client):
        """Test getting current user without auth fails."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401


class TestPasswordReset:
    """Test password reset flow."""
    
    def test_forgot_password_success(self, client, parent_user, mock_email):
        """Test forgot password request."""
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": parent_user.email}
        )
        
        assert response.status_code == 200
        assert "email sent" in response.json()["message"].lower()
        
        # Verify email was sent
        assert len(mock_email.sent_emails) == 1
        assert mock_email.sent_emails[0]["to"] == parent_user.email
        assert "reset" in mock_email.sent_emails[0]["subject"].lower()
    
    def test_forgot_password_nonexistent_user(self, client, mock_email):
        """Test forgot password for non-existent user."""
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": "nonexistent@example.com"}
        )
        
        # Should return success to prevent user enumeration
        assert response.status_code == 200
        
        # But no email should be sent
        assert len(mock_email.sent_emails) == 0
    
    def test_reset_password_with_valid_token(self, client, db, parent_user):
        """Test password reset with valid token."""
        from app.core.security import create_password_reset_token
        
        token = create_password_reset_token(parent_user.email)
        
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token,
                "new_password": "NewSecurePass123!"
            }
        )
        
        assert response.status_code == 200
        assert "password reset" in response.json()["message"].lower()
        
        # Verify can login with new password
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": parent_user.email,
                "password": "NewSecurePass123!"
            }
        )
        assert login_response.status_code == 200
    
    def test_reset_password_with_expired_token(self, client):
        """Test password reset with expired token fails."""
        # Create expired token (simulate by using invalid token)
        expired_token = "expired.token.here"
        
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": expired_token,
                "new_password": "NewPassword123!"
            }
        )
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower() or \
               "expired" in response.json()["detail"].lower()


class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_login_rate_limit(self, client, parent_user, redis_client):
        """Test login rate limiting (5 attempts per 15 minutes)."""
        # Make 5 failed login attempts
        for i in range(5):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": parent_user.email,
                    "password": "wrongpassword"
                }
            )
            # First 5 should fail with 401
            assert response.status_code == 401
        
        # 6th attempt should be rate limited
        response = client.post(
            "/api/auth/login",
            json={
                "email": parent_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 429
        assert "too many" in response.json()["detail"].lower()
    
    def test_registration_rate_limit(self, client, redis_client):
        """Test registration rate limiting (3 attempts per hour)."""
        # Make 3 registration attempts
        for i in range(3):
            response = client.post(
                "/api/auth/register",
                json={
                    "email": f"user{i}@example.com",
                    "password": "SecurePass123!",
                    "full_name": f"User {i}",
                    "role": "parent"
                }
            )
            # Should succeed
            assert response.status_code == 201
        
        # 4th attempt should be rate limited
        response = client.post(
            "/api/auth/register",
            json={
                "email": "user4@example.com",
                "password": "SecurePass123!",
                "full_name": "User 4",
                "role": "parent"
            }
        )
        
        assert response.status_code == 429
        assert "too many" in response.json()["detail"].lower()
    
    def test_rate_limit_reset(self, client, redis_client):
        """Test rate limit counter can be reset."""
        # Simulate rate limit hit
        redis_client.set("rate_limit:login:test@example.com", "5", ex=900)
        
        # Verify rate limit exists
        assert redis_client.exists("rate_limit:login:test@example.com")
        
        # Reset rate limit (admin function)
        redis_client.delete("rate_limit:login:test@example.com")
        
        # Verify rate limit cleared
        assert not redis_client.exists("rate_limit:login:test@example.com")
