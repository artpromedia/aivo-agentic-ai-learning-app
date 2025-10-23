"""FastAPI application for AI Inference Service."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import adapt, brain, generate
from app.core.config import settings


# Create FastAPI app
@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print(f"Starting {settings.PROJECT_NAME} {settings.VERSION}")
    yield
    # Shutdown
    print("Shutting down AI Inference Service")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate.router, prefix=f"{settings.API_V1_STR}/generate")
app.include_router(brain.router, prefix=f"{settings.API_V1_STR}/brain")
app.include_router(adapt.router, prefix=f"{settings.API_V1_STR}/adapt")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }
