"""
Rate Limiting Service using Redis
Implements sliding window algorithm for rate limiting
"""
from datetime import timedelta
from fastapi import HTTPException, status
from redis import Redis
import logging

logger = logging.getLogger(__name__)


async def check_rate_limit(
    redis: Redis,
    key: str,
    max_attempts: int = 5,
    window: int = 3600  # seconds
) -> None:
    """
    Check if rate limit has been exceeded.
    
    Args:
        redis: Redis client instance
        key: Rate limit key (e.g., "login:user@example.com")
        max_attempts: Maximum number of attempts allowed
        window: Time window in seconds
        
    Raises:
        HTTPException: If rate limit is exceeded
        
    Example:
        await check_rate_limit(redis, f"login:{email}", max_attempts=5, window=900)
    """
    try:
        # Get current attempt count
        current = redis.get(key)
        
        if current is None:
            # First attempt - set counter with expiration
            redis.setex(key, window, 1)
            return
        
        current_count = int(current)
        
        if current_count >= max_attempts:
            # Rate limit exceeded
            ttl = redis.ttl(key)
            minutes = ttl // 60
            seconds = ttl % 60
            
            if minutes > 0:
                time_msg = f"{minutes} minute(s) and {seconds} second(s)"
            else:
                time_msg = f"{seconds} second(s)"
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many attempts. Please try again in {time_msg}.",
                headers={"Retry-After": str(ttl)}
            )
        
        # Increment counter
        redis.incr(key)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Rate limit check failed for key {key}: {e}")
        # Fail open - allow request if Redis is down
        # In production, you might want to fail closed instead
        pass


def reset_rate_limit(redis: Redis, key: str) -> None:
    """
    Reset rate limit counter for a given key.
    Useful after successful authentication.
    
    Args:
        redis: Redis client instance
        key: Rate limit key to reset
        
    Example:
        reset_rate_limit(redis, f"login:{email}")
    """
    try:
        redis.delete(key)
        logger.info(f"Reset rate limit for key: {key}")
    except Exception as e:
        logger.error(f"Failed to reset rate limit for key {key}: {e}")


def get_rate_limit_status(redis: Redis, key: str) -> dict:
    """
    Get current rate limit status for a key.
    
    Args:
        redis: Redis client instance
        key: Rate limit key
        
    Returns:
        dict: Contains 'attempts', 'ttl', and 'limit_reached'
    """
    try:
        current = redis.get(key)
        ttl = redis.ttl(key)
        
        if current is None:
            return {
                "attempts": 0,
                "ttl": 0,
                "limit_reached": False
            }
        
        return {
            "attempts": int(current),
            "ttl": ttl if ttl > 0 else 0,
            "limit_reached": False  # Would need max_attempts to determine this
        }
    except Exception as e:
        logger.error(f"Failed to get rate limit status for key {key}: {e}")
        return {
            "attempts": 0,
            "ttl": 0,
            "limit_reached": False
        }


def increment_rate_limit(redis: Redis, key: str, window: int = 3600) -> int:
    """
    Manually increment rate limit counter.
    
    Args:
        redis: Redis client instance
        key: Rate limit key
        window: Time window in seconds
        
    Returns:
        int: New count value
    """
    try:
        current = redis.get(key)
        
        if current is None:
            redis.setex(key, window, 1)
            return 1
        
        new_count = redis.incr(key)
        return int(new_count)
    except Exception as e:
        logger.error(f"Failed to increment rate limit for key {key}: {e}")
        return 0


async def check_ip_rate_limit(
    redis: Redis,
    ip_address: str,
    max_requests: int = 100,
    window: int = 60  # 1 minute
) -> None:
    """
    Check rate limit based on IP address.
    
    Args:
        redis: Redis client instance
        ip_address: Client IP address
        max_requests: Maximum requests allowed
        window: Time window in seconds
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    key = f"ip_rate_limit:{ip_address}"
    await check_rate_limit(redis, key, max_requests, window)
