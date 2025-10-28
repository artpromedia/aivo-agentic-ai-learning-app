"""
Redis client wrapper with connection pooling and error handling
"""
import redis
from redis import Redis
from typing import Optional
import json
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """
    Redis client wrapper with connection pooling and error handling.
    """
    
    def __init__(self):
        self.pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            decode_responses=True,
        )
        self._client: Optional[Redis] = None
    
    @property
    def client(self) -> Redis:
        """Lazy connection to Redis."""
        if self._client is None:
            self._client = Redis(connection_pool=self.pool)
        return self._client
    
    def get(self, key: str) -> Optional[str]:
        """Get value from Redis."""
        try:
            return self.client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None
    
    def get_json(self, key: str) -> Optional[dict]:
        """Get JSON value from Redis."""
        try:
            value = self.client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Redis GET JSON error for key {key}: {e}")
            return None
    
    def set(
        self,
        key: str,
        value: str,
        expire: Optional[int] = None
    ) -> bool:
        """Set value in Redis with optional expiration."""
        try:
            return self.client.set(key, value, ex=expire)
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False
    
    def set_json(
        self,
        key: str,
        value: dict,
        expire: Optional[int] = None
    ) -> bool:
        """Set JSON value in Redis with optional expiration."""
        try:
            json_value = json.dumps(value)
            return self.client.set(key, json_value, ex=expire)
        except Exception as e:
            logger.error(f"Redis SET JSON error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        try:
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"Redis EXISTS error for key {key}: {e}")
            return False
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment value in Redis."""
        try:
            return self.client.incr(key, amount)
        except Exception as e:
            logger.error(f"Redis INCR error for key {key}: {e}")
            return None
    
    def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key."""
        try:
            return bool(self.client.expire(key, seconds))
        except Exception as e:
            logger.error(f"Redis EXPIRE error for key {key}: {e}")
            return False
    
    def ping(self) -> bool:
        """Check if Redis is accessible."""
        try:
            return self.client.ping()
        except Exception as e:
            logger.error(f"Redis PING error: {e}")
            return False
    
    def close(self):
        """Close Redis connection."""
        if self._client:
            self._client.close()


# Global Redis client instance
redis_client = RedisClient()


# Convenience functions
def get_cache(key: str) -> Optional[dict]:
    """Get cached data."""
    return redis_client.get_json(key)


def set_cache(key: str, value: dict, ttl: int = 300) -> bool:
    """Set cached data with TTL."""
    return redis_client.set_json(key, value, expire=ttl)


def delete_cache(key: str) -> bool:
    """Delete cached data."""
    return redis_client.delete(key)
