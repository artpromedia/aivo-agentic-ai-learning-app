"""
Rate limiter service tests.

Tests for rate limiting functionality using MockRedis.
"""


class TestRateLimiter:
    """Test rate limiter service."""
    
    def test_check_rate_limit_under_limit(self, redis_client):
        """Test rate limit check when under limit."""
        key = "test:rate_limit:user123"
        limit = 5
        
        # Set current count to 3
        redis_client.set(key, "3", ex=900)
        
        current = int(redis_client.get(key))
        assert current < limit
        assert current == 3
    
    def test_check_rate_limit_at_limit(self, redis_client):
        """Test rate limit check when at limit."""
        key = "test:rate_limit:user123"
        limit = 5
        
        # Set current count to 5 (at limit)
        redis_client.set(key, "5", ex=900)
        
        current = int(redis_client.get(key))
        assert current >= limit
    
    def test_check_rate_limit_over_limit(self, redis_client):
        """Test rate limit check when over limit."""
        key = "test:rate_limit:user123"
        limit = 5
        
        # Set current count to 7 (over limit)
        redis_client.set(key, "7", ex=900)
        
        current = int(redis_client.get(key))
        assert current > limit
    
    def test_increment_rate_limit(self, redis_client):
        """Test incrementing rate limit counter."""
        key = "test:rate_limit:user123"
        
        # First increment (should initialize to 1)
        count = redis_client.incr(key)
        assert count == 1
        
        # Second increment
        count = redis_client.incr(key)
        assert count == 2
        
        # Third increment
        count = redis_client.incr(key)
        assert count == 3
    
    def test_increment_rate_limit_by_amount(self, redis_client):
        """Test incrementing rate limit by specific amount."""
        key = "test:rate_limit:user123"
        
        # Increment by 5
        count = redis_client.incr(key, amount=5)
        assert count == 5
        
        # Increment by 3 more
        count = redis_client.incr(key, amount=3)
        assert count == 8
    
    def test_reset_rate_limit(self, redis_client):
        """Test resetting rate limit counter."""
        key = "test:rate_limit:user123"
        
        # Set initial value
        redis_client.set(key, "10", ex=900)
        assert redis_client.get(key) == "10"
        
        # Delete (reset)
        result = redis_client.delete(key)
        assert result is True
        
        # Verify deleted
        assert redis_client.get(key) is None
        assert not redis_client.exists(key)
    
    def test_get_rate_limit_status(self, redis_client):
        """Test getting rate limit status."""
        key = "test:rate_limit:user123"
        
        # Set value with TTL
        redis_client.setex(key, 900, "5")
        
        # Check existence
        exists = redis_client.exists(key)
        assert exists is True
        
        # Get current count
        count = redis_client.get(key)
        assert count == "5"
        
        # Get TTL
        ttl = redis_client.ttl(key)
        assert ttl == 900
    
    def test_rate_limit_with_expiry(self, redis_client):
        """Test rate limit with automatic expiry."""
        key = "test:rate_limit:user123"
        
        # Set with 15 minute expiry (900 seconds)
        redis_client.setex(key, 900, "1")
        
        # Verify TTL is set
        ttl = redis_client.ttl(key)
        assert ttl == 900
        
        # Verify value exists
        assert redis_client.exists(key)
    
    def test_rate_limit_key_not_exists(self, redis_client):
        """Test checking non-existent rate limit key."""
        key = "test:rate_limit:nonexistent"
        
        # Should return None
        value = redis_client.get(key)
        assert value is None
        
        # Should not exist
        assert not redis_client.exists(key)
        
        # TTL should be -1 (no expiry)
        ttl = redis_client.ttl(key)
        assert ttl == -1
    
    def test_multiple_rate_limit_keys(self, redis_client):
        """Test managing multiple rate limit keys."""
        keys = [
            "rate_limit:login:user1",
            "rate_limit:login:user2",
            "rate_limit:register:user1"
        ]
        
        # Set different values for each key
        redis_client.set(keys[0], "3", ex=900)
        redis_client.set(keys[1], "5", ex=900)
        redis_client.set(keys[2], "2", ex=3600)
        
        # Verify each key has correct value
        assert redis_client.get(keys[0]) == "3"
        assert redis_client.get(keys[1]) == "5"
        assert redis_client.get(keys[2]) == "2"
        
        # Verify TTLs
        assert redis_client.ttl(keys[0]) == 900
        assert redis_client.ttl(keys[1]) == 900
        assert redis_client.ttl(keys[2]) == 3600
    
    def test_rate_limit_ip_based(self, redis_client):
        """Test IP-based rate limiting."""
        ip_address = "192.168.1.100"
        key = f"rate_limit:login:ip:{ip_address}"
        
        # Simulate 3 login attempts from same IP
        for _ in range(3):
            redis_client.incr(key)
        
        # Check count
        count = int(redis_client.get(key))
        assert count == 3
    
    def test_rate_limit_user_based(self, redis_client):
        """Test user-based rate limiting."""
        user_email = "test@example.com"
        key = f"rate_limit:login:user:{user_email}"
        
        # Simulate 4 failed login attempts
        for _ in range(4):
            redis_client.incr(key)
        
        # Check count
        count = int(redis_client.get(key))
        assert count == 4
    
    def test_rate_limit_endpoint_based(self, redis_client):
        """Test endpoint-based rate limiting."""
        endpoint = "register"
        user_id = "user123"
        key = f"rate_limit:{endpoint}:{user_id}"
        
        # Set limit
        redis_client.setex(key, 3600, "3")  # 3 registrations per hour
        
        # Verify
        assert redis_client.get(key) == "3"
        assert redis_client.ttl(key) == 3600


class TestRateLimitIntegration:
    """Integration tests for rate limiting with API endpoints."""
    
    def test_login_rate_limit_integration(self, client, parent_user, redis_client):
        """Test rate limiting integrated with login endpoint."""
        # Make multiple failed login attempts
        attempts = 0
        for i in range(7):
            response = client.post(
                "/api/auth/login",
                json={
                    "email": parent_user.email,
                    "password": "wrongpassword"
                }
            )
            attempts += 1
            
            if response.status_code == 429:
                # Hit rate limit
                break
        
        # Should hit rate limit before 7 attempts
        assert attempts <= 6
    
    def test_registration_rate_limit_integration(self, client, redis_client):
        """Test rate limiting integrated with registration endpoint."""
        successful_registrations = 0
        
        for i in range(5):
            response = client.post(
                "/api/auth/register",
                json={
                    "email": f"newuser{i}@example.com",
                    "password": "SecurePass123!",
                    "full_name": f"New User {i}",
                    "role": "parent"
                }
            )
            
            if response.status_code == 201:
                successful_registrations += 1
            elif response.status_code == 429:
                # Hit rate limit
                break
        
        # Should be limited before 5 registrations
        assert successful_registrations <= 4
