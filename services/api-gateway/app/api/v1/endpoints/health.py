"""
Health check endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
import redis
from app.core.config import settings

router = APIRouter()


@router.get("/db")
async def check_database(db: Session = Depends(get_db)):
    """Check database connection"""
    try:
        # Execute a simple query
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "service": "database",
            "message": "Database connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "database",
            "error": str(e)
        }


@router.get("/redis")
async def check_redis():
    """Check Redis connection"""
    try:
        r = redis.from_url(settings.REDIS_URL, decode_responses=True)
        r.ping()
        return {
            "status": "healthy",
            "service": "redis",
            "message": "Redis connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "redis",
            "error": str(e)
        }


@router.get("/services")
async def check_services():
    """Check all microservices"""
    import httpx
    
    services_status = {}
    
    # Check Auth Service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.AUTH_SERVICE_URL}/health", timeout=5.0)
            services_status["auth-service"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "code": response.status_code
            }
    except Exception as e:
        services_status["auth-service"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    # Check AI Service
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.AI_SERVICE_URL}/health", timeout=5.0)
            services_status["ai-service"] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "code": response.status_code
            }
    except Exception as e:
        services_status["ai-service"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    return {
        "status": "healthy",
        "services": services_status
    }
