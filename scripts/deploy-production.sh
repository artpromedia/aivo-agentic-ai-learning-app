#!/bin/bash

set -e

echo "🚀 AIVO Production Deployment"
echo "=============================="

# Load environment
ENV_FILE="${1:-.env.production}"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

echo "📋 Deployment Checklist:"
echo "  Environment: PRODUCTION"
echo "  Target: $PRODUCTION_SERVER"
echo "  Git Commit: $(git rev-parse --short HEAD)"
echo "  Branch: $(git branch --show-current)"
echo ""

# Confirmation
read -p "⚠️  Deploy to PRODUCTION? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Pre-deployment backup
echo "💾 Creating database backup..."
ssh "$PRODUCTION_SERVER" "docker-compose exec -T postgres pg_dump -U aivo_user aivo_db | gzip > /backups/aivo_db_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "💾 Creating curriculum database backup..."
ssh "$PRODUCTION_SERVER" "docker-compose exec -T curriculum-db pg_dump -U aivo_user aivo_curriculum | gzip > /backups/aivo_curriculum_$(date +%Y%m%d_%H%M%S).sql.gz"

# Pull latest code
echo "📥 Pulling latest code..."
ssh "$PRODUCTION_SERVER" "cd /app/aivo && git fetch && git checkout main && git pull origin main"

# Build images
echo "🏗️  Building Docker images..."
ssh "$PRODUCTION_SERVER" "cd /app/aivo && docker-compose -f docker-compose.yml -f docker-compose.prod.yml build"

# Run migrations
echo "📊 Running database migrations..."
ssh "$PRODUCTION_SERVER" "cd /app/aivo/services/ai-inference-service && docker-compose exec -T postgres psql -U aivo_user aivo_db -f migrations/008_assessment_system_complete.sql" || echo "Migration already applied or failed"

# Stop services gracefully
echo "🛑 Stopping services..."
ssh "$PRODUCTION_SERVER" "cd /app/aivo && docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --timeout 30"

# Deploy services
echo "🚢 Deploying services..."
ssh "$PRODUCTION_SERVER" "cd /app/aivo && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Running health checks..."
HEALTH_URL="https://api.aivo.app/health"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
    
    if [ "$HEALTH_STATUS" == "200" ]; then
        echo "✅ Health check passed!"
        break
    else
        echo "⏳ Waiting for services (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
        sleep 10
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ "$HEALTH_STATUS" == "200" ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Production is live!"
    echo "   - API: https://api.aivo.app"
    echo "   - Web: https://aivo.app"
    echo ""
    
    # Send notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"✅ AIVO deployed to production successfully!\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*Deployment Successful* :rocket:\\n*Commit:* \`$(git rev-parse --short HEAD)\`\\n*Deployed by:* $USER\\n*Time:* $(date)\"
                        }
                    }
                ]
            }"
    fi
else
    echo "❌ Health check failed (HTTP $HEALTH_STATUS)"
    echo "🔄 Rolling back..."
    
    # Rollback
    ssh "$PRODUCTION_SERVER" "cd /app/aivo && docker-compose -f docker-compose.yml -f docker-compose.prod.yml down"
    ssh "$PRODUCTION_SERVER" "cd /app/aivo && git checkout HEAD~1"
    ssh "$PRODUCTION_SERVER" "cd /app/aivo && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    
    echo "❌ Deployment failed and rolled back"
    
    # Send failure notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"text\": \"❌ AIVO production deployment failed and was rolled back\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*Deployment Failed* :x:\\n*Commit:* \`$(git rev-parse --short HEAD)\`\\n*Attempted by:* $USER\\n*Time:* $(date)\"
                        }
                    }
                ]
            }"
    fi
    
    exit 1
fi
