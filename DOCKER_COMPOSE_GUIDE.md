# Docker Compose Quick Reference

Complete documentation for AIVO Learning Platform's Docker setup.

## Quick Start

### Development Mode (with hot reload)
```bash
# Start all services with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the Makefile
make dev
```

### Production Mode
```bash
# Build and start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use the Makefile
make prod-build
make prod-up
```

## Services Overview

### Backend Services

**API Gateway** (FastAPI - Port 8000)
- Main API server
- Handles all HTTP requests
- Serves OpenAPI docs at `/docs`

**Auth Service** (FastAPI - Port 8001)
- Authentication and authorization
- JWT token management
- User session handling

**AI Inference Service** (FastAPI - Port 8002)
- AI model serving
- Homework assistance
- Content analysis

### Frontend Applications (Vite + React)

| Application | Port | URL | Purpose |
|-------------|------|-----|---------|
| Marketing Site | 3000 | http://localhost:3000 | Public website |
| Parent Portal | 3001 | http://localhost:3001 | Parent dashboard |
| Teacher Portal | 3002 | http://localhost:3002 | Teacher tools |
| Learner App | 3003 | http://localhost:3003 | Student interface |
| Admin Portal | 5007 | http://localhost:5007 | Admin dashboard |

### Infrastructure

**PostgreSQL** (Port 5432)
- Primary database
- Persistent data storage
- Alembic migrations

**Redis** (Port 6379)
- Session cache
- Task queue
- Real-time data

**Nginx** (Ports 80, 443)
- Reverse proxy
- SSL termination
- Load balancing
- Production only

## Common Commands

### Using Make (Recommended)

```bash
make help          # Show all available commands
make build         # Build all images
make up            # Start services
make dev           # Start in development mode
make down          # Stop services
make logs          # View all logs
make logs-api      # View API logs
make logs-learner  # View learner app logs
make test          # Run backend tests
make migrate       # Run database migrations
make seed          # Seed test data
make clean         # Remove all containers/volumes
```

### Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes too
docker-compose down -v
```

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_PASSWORD=<secure-password>

# Redis
REDIS_PASSWORD=<secure-password>

# Security
JWT_SECRET=<64-char-random-string>

# API URLs
VITE_API_URL=http://localhost:8000
```

### Generate Secure Secrets

```bash
# JWT Secret (64 characters)
openssl rand -hex 32

# Passwords
openssl rand -base64 32
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd aivo-learning

# Copy environment file
cp .env.example .env

# Edit .env with your secrets
nano .env

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Start Development
```bash
# Start with hot reload
make dev

# Services will be available:
# - API: http://localhost:8000/docs
# - Web: http://localhost:3000
# - Parent: http://localhost:3001
# - Teacher: http://localhost:3002
# - Learner: http://localhost:3003
# - Admin: http://localhost:5007
```

### 3. Database Migrations
```bash
# Create new migration
docker-compose exec api-gateway alembic revision --autogenerate -m "add new table"

# Run migrations
docker-compose exec api-gateway alembic upgrade head

# Or use Make
make migrate
```

### 4. Seed Data
```bash
# Load test data
docker-compose exec api-gateway python -m app.seeds.load_data

# Or use Make
make seed
```

### 5. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f learner-app

# Or use Make
make logs
make logs-api
make logs-learner
```

## Container Management

### Shell Access

```bash
# API Gateway
docker-compose exec api-gateway /bin/bash

# PostgreSQL
docker-compose exec postgres psql -U aivo_user -d aivo_db

# Or use Make
make shell-api
make shell-db
```

### Database Operations

```bash
# Backup database
make backup-db
# Or
docker-compose exec postgres pg_dump -U aivo_user aivo_db > backup.sql

# Restore database
make restore-db
# Or
docker-compose exec -T postgres psql -U aivo_user -d aivo_db < backup.sql
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Container Won't Start
```bash
# View container logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Rebuild container
docker-compose build --no-cache <service-name>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Build Errors
```bash
# Clear node_modules and rebuild
docker-compose down
docker-compose build --no-cache web

# Check pnpm-lock.yaml is present
ls apps/web/pnpm-lock.yaml
```

## Production Deployment

### 1. Environment Setup
```bash
# Copy and configure production env
cp .env.example .env.production

# Set production values
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
```

### 2. SSL Certificates
```bash
# Place SSL certificates in infra/docker/nginx/ssl/
infra/docker/nginx/ssl/
├── cert.pem
└── key.pem
```

### 3. Build and Deploy
```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start with nginx reverse proxy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use Make
make prod-build
make prod-up
```

### 4. Health Checks
```bash
# Check service health
curl http://localhost:8000/health

# View running containers
docker-compose ps

# Check resource usage
docker stats
```

## Performance Optimization

### Resource Limits
Edit `docker-compose.prod.yml` to adjust:
- CPU limits
- Memory limits
- Service replicas

### Volume Management
```bash
# View volumes
docker volume ls

# Prune unused volumes
docker volume prune

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### Image Optimization
```bash
# Remove unused images
docker image prune -a

# View image sizes
docker images

# Multi-stage builds already implemented in Dockerfiles
```

## Networking

### Service Discovery
Services can communicate using service names:
- `http://api-gateway:8000`
- `http://postgres:5432`
- `http://redis:6379`

### External Access
Services exposed to host:
- API Gateway: `localhost:8000`
- Frontend apps: `localhost:3000-3003, 5007`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Monitoring

### Container Logs
```bash
# Follow all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f api-gateway learner-app

# Last 100 lines
docker-compose logs --tail=100
```

### Resource Usage
```bash
# Live stats
docker stats

# Container info
docker inspect <container-name>
```

## Security

### Best Practices
1. **Never commit .env files**
2. **Use strong passwords** (32+ characters)
3. **Rotate JWT secrets** regularly
4. **Enable SSL** in production
5. **Limit exposed ports** in production
6. **Use secrets management** for sensitive data

### Network Security
```bash
# Services isolated in aivo-network
# Only necessary ports exposed to host
# Nginx acts as reverse proxy in production
```

## Backup Strategy

### Automated Backups
```bash
# Add to crontab
0 2 * * * cd /path/to/aivo-learning && docker-compose exec -T postgres pg_dump -U aivo_user aivo_db | gzip > backups/$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Manual Backup
```bash
# Database
make backup-db

# Volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/volumes_$(date +%Y%m%d).tar.gz /data
```

## Cleanup

### Stop and Remove Everything
```bash
# Stop services
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove everything including images
make clean
```

### Selective Cleanup
```bash
# Stop specific service
docker-compose stop learner-app

# Remove specific container
docker-compose rm learner-app

# Rebuild specific service
docker-compose build learner-app
```

---

**See docker-compose.yml for full service configuration.**
