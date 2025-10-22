"""
Main FastAPI application for Curriculum Service.

Part of PROMPT 57: Base Brain Training & Curriculum Integration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AIVO Curriculum Service",
    description="Educational Standards & Brain Training Data Management",
    version=settings.SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "AIVO Curriculum Service",
        "version": settings.SERVICE_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# Include API routers (will be added in Part B)
# from app.api.v1 import standards, districts, curriculum, training
# app.include_router(standards.router, prefix=f"{settings.API_V1_PREFIX}/standards")
# app.include_router(districts.router, prefix=f"{settings.API_V1_PREFIX}/districts")
# app.include_router(curriculum.router, prefix=f"{settings.API_V1_PREFIX}/curriculum")
# app.include_router(training.router, prefix=f"{settings.API_V1_PREFIX}/training")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
