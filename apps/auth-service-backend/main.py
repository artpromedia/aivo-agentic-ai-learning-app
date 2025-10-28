"""Auth Service main application"""
from fastapi import FastAPI

app = FastAPI(
    title="AIVO Auth Service",
    description="Authentication Service for AIVO AI Platform",
    version="0.1.0"
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AIVO Auth Service", "status": "running"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api/health")
async def api_health():
    """API health check endpoint"""
    return {"status": "healthy", "service": "auth-service"}
