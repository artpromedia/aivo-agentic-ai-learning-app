# AIVO API Gateway Backend

FastAPI-based API Gateway for the AIVO AI Learning Platform. Provides RESTful endpoints for learner profiles, assessments, homework, IEP tracking, analytics, and AI-powered features.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Caching**: Redis for session management and caching
- **AI Services**: Multi-provider AI support (OpenAI, Anthropic, Google)
- **File Processing**: OCR, file uploads, and document processing
- **Analytics**: Comprehensive learner analytics and progress tracking
- **Health Monitoring**: Built-in health checks and observability

## Project Structure

```
apps/api-gateway-backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/      # API route handlers
│   │       └── auth.py         # Authentication logic
│   ├── core/
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database setup
│   │   ├── redis.py           # Redis client
│   │   └── security.py        # Security utilities
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   ├── utils/                 # Utility functions
│   └── main.py               # Application entry point
├── alembic/                   # Database migrations
├── tests/                     # Test suites
├── .env                       # Environment config (from container)
├── .env.local                 # Local development config template
├── requirements.txt           # Python dependencies
└── venv/                      # Virtual environment (created locally)
```

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (running in Docker: `aivo-postgres` on port 5432)
- Redis 7+ (running in Docker: `aivo-redis` on port 6379)

## Quick Start

### 1. Activate Virtual Environment

```powershell
cd apps\api-gateway-backend
.\venv\Scripts\Activate.ps1
```

### 2. Configure Environment

The `.env` file from the container is already present. For local customization:

```powershell
# Copy the local template if needed
cp .env.local .env

# Edit .env to customize settings
```

**Key environment variables:**
- `DATABASE_URL`: PostgreSQL connection (default: `postgresql+psycopg2://aivo_user:aivo_dev_password@localhost:5432/aivo_db`)
- `REDIS_URL`: Redis connection (default: `redis://localhost:6379/0`)
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `CORS_ORIGINS`: Allowed frontend origins

### 3. Run Database Migrations

```powershell
# Apply migrations
alembic upgrade head

# (Optional) Create a new migration
alembic revision --autogenerate -m "description"
```

### 4. Start the Server

**Development mode (with auto-reload):**
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Or using Python directly:**
```powershell
python -m app.main
```

**Production mode:**
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Access the API

- **API Base**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## API Endpoints

### Core
- `GET /` - Root endpoint with API info
- `GET /health` - Health check

### V1 Endpoints (`/api/v1`)
- `/auth` - Authentication & user management
- `/assessments` - Baseline assessments
- `/learners` - Learner profiles
- `/homework` - Homework management
- `/iep` - IEP tracking
- `/progress` - Progress monitoring
- `/analytics` - Analytics & reporting
- `/sensory` - Sensory profiles
- `/regulation` - Regulation strategies
- `/brain` - AI brain/curricula
- `/users` - User management

## Testing

```powershell
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_homework.py

# Run integration tests
pytest tests/integration/
```

## Development

### Code Quality

```powershell
# Lint with pylint
pylint app

# Type checking with mypy
mypy app

# Format code (if configured)
black app
isort app
```

### Database Management

```powershell
# Create a new migration
alembic revision --autogenerate -m "add new table"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

### Seed Data

```powershell
# Load seed data (if available)
python -m app.seeds.load_data
```

## Docker Integration

This backend is currently running in Docker as `aivo-api-gateway`. The local setup allows you to:
- Develop and test changes locally
- Use the same PostgreSQL and Redis instances as the container
- Hot-reload code changes without rebuilding Docker images

**Container info:**
- Container name: `aivo-api-gateway`
- Port: 8000
- Health check: Configured and passing

## Troubleshooting

### Connection Errors

**PostgreSQL not accessible:**
```powershell
# Verify Docker container is running
docker ps -f name=aivo-postgres

# Check connection
docker exec aivo-postgres pg_isready -U aivo_user
```

**Redis not accessible:**
```powershell
# Verify Redis container
docker ps -f name=aivo-redis

# Test connection
docker exec aivo-redis redis-cli ping
```

### Port Conflicts

If port 8000 is in use, stop the Docker container or use a different port:
```powershell
uvicorn app.main:app --port 8001
```

### Migration Issues

```powershell
# Reset database (CAUTION: deletes all data)
alembic downgrade base
alembic upgrade head
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment name | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `CORS_ORIGINS` | Allowed CORS origins | `[...]` |
| `MAX_UPLOAD_SIZE` | Max file upload size (bytes) | `10485760` |
| `UPLOAD_DIR` | Upload directory | `./uploads` |

## Production Deployment

1. Set `ENVIRONMENT=production`
2. Set `DEBUG=false`
3. Generate a secure `JWT_SECRET` (32+ chars)
4. Configure production DATABASE_URL and REDIS_URL
5. Use a process manager (systemd, supervisor, or Docker)
6. Enable HTTPS
7. Configure proper CORS_ORIGINS
8. Set up monitoring and logging

## Support

For issues or questions:
- Check existing documentation in `apps/api-gateway-backend/`
- Review API docs at http://localhost:8000/docs
- Consult the main project README at repo root
