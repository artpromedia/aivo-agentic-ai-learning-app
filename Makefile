.PHONY: help build up down restart logs clean test migrate seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

dev: ## Start in development mode with hot reload
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View API gateway logs
	docker-compose logs -f api-gateway

logs-learner: ## View learner app logs
	docker-compose logs -f learner-app

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --remove-orphans
	docker system prune -af

test: ## Run backend tests
	docker-compose exec api-gateway pytest

test-frontend: ## Run frontend tests
	docker-compose exec learner-app pnpm test

migrate: ## Run database migrations
	docker-compose exec api-gateway alembic upgrade head

migrate-create: ## Create new migration
	@read -p "Enter migration message: " msg; \
	docker-compose exec api-gateway alembic revision --autogenerate -m "$$msg"

seed: ## Seed database with test data
	docker-compose exec api-gateway python -m app.seeds.load_data

shell-api: ## Open shell in API container
	docker-compose exec api-gateway /bin/bash

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U aivo_user -d aivo_db

backup-db: ## Backup database
	docker-compose exec postgres pg_dump -U aivo_user aivo_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database from backup
	@read -p "Enter backup file path: " file; \
	docker-compose exec -T postgres psql -U aivo_user -d aivo_db < $$file

prod-build: ## Build for production
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-up: ## Start in production mode
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

install: ## Initial setup
	@echo "Setting up AIVO platform..."
	cp .env.example .env
	@echo "Please edit .env file with your secrets"
	@echo "Then run: make build && make up"
