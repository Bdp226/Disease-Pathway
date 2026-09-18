import json
import logging
import redis
from typing import Any, Optional
import os

class CacheManager:
    """
    FAANG-grade Cache Manager that attempts to connect to Redis for distributed caching.
    If Redis is unavailable (e.g., running locally without Docker), it gracefully falls back 
    to an in-memory dictionary cache to prevent application crashes.
    """
    def __init__(self):
        self.use_redis = False
        self.memory_cache = {}
        redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
        
        try:
            self.redis_client = redis.Redis.from_url(redis_url, socket_timeout=1, socket_connect_timeout=1)
            # Ping to verify connection
            self.redis_client.ping()
            self.use_redis = True
            logging.info(f"Connected to Redis at {redis_url} for distributed caching.")
        except (redis.ConnectionError, redis.TimeoutError):
            logging.warning("Redis is not available. Falling back to in-memory caching.")
            self.redis_client = None

    def get(self, key: str) -> Optional[Any]:
        if self.use_redis:
            try:
                val = self.redis_client.get(key)
                if val:
                    return json.loads(val)
                return None
            except Exception as e:
                logging.error(f"Redis GET error: {e}")
                return None
        else:
            return self.memory_cache.get(key)

    def set(self, key: str, value: Any, expire_seconds: int = 3600):
        if self.use_redis:
            try:
                self.redis_client.setex(key, expire_seconds, json.dumps(value))
            except Exception as e:
                logging.error(f"Redis SET error: {e}")
        else:
            self.memory_cache[key] = value

    def clear(self, pattern: str = "*"):
        if self.use_redis:
            try:
                keys = self.redis_client.keys(pattern)
                if keys:
                    self.redis_client.delete(*keys)
            except Exception as e:
                logging.error(f"Redis CLEAR error: {e}")
        else:
            self.memory_cache.clear()

# Global singleton
cache = CacheManager()
