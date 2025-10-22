#!/bin/bash

set -e

echo "🚀 Setting up AIVO Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your secrets!"
    echo "   - DATABASE_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo "   - JWT_SECRET (generate with: openssl rand -hex 32)"
fi

# Generate secrets if needed
echo "🔐 Generating secrets..."
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Update .env with generated secrets (only if still default)
sed -i.bak "s/CHANGE_ME_TO_RANDOM_64_CHAR_STRING/$JWT_SECRET/g" .env
sed -i.bak "s/CHANGE_ME_TO_SECURE_PASSWORD/$DB_PASSWORD/g" .env

echo "✅ Secrets generated!"

# Build images
echo "🏗️  Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T api-gateway alembic upgrade head

# Seed data (optional)
read -p "Do you want to seed test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T api-gateway python -m app.seeds.load_data
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Services available at:"
echo "   - API Gateway:    http://localhost:8000"
echo "   - API Docs:       http://localhost:8000/docs"
echo "   - Marketing:      http://localhost:3000"
echo "   - Parent Portal:  http://localhost:3001"
echo "   - Teacher Portal: http://localhost:3002"
echo "   - Learner App:    http://localhost:3003"
echo "   - Admin Portal:   http://localhost:5007"
echo ""
echo "📖 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
