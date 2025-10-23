#!/bin/bash
# Automated rollback script for catastrophic failures

set -e

ENVIRONMENT="${1:-production}"
HEALTH_ENDPOINT="https://api.aivo.app/health"

echo "🔍 Monitoring health for auto-rollback..."

# Check health 3 times with 10 second intervals
FAILURES=0
for i in {1..3}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" || echo "000")
    
    if [ "$STATUS" != "200" ]; then
        FAILURES=$((FAILURES + 1))
        echo "⚠️  Health check $i/3 failed (HTTP $STATUS)"
    else
        echo "✅ Health check $i/3 passed"
    fi
    
    if [ $i -lt 3 ]; then
        sleep 10
    fi
done

# If 3 failures, trigger automatic rollback
if [ $FAILURES -eq 3 ]; then
    echo "🚨 3 consecutive failures detected - triggering automatic rollback!"
    
    # Trigger GitHub Actions rollback workflow
    gh workflow run rollback.yml \
        -f environment="$ENVIRONMENT" \
        -f reason="Automatic rollback triggered by health check failures"
    
    echo "✅ Rollback workflow triggered"
else
    echo "✅ System healthy - no rollback needed"
fi
