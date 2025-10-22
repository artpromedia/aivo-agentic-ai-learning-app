#!/bin/bash
# AIVO Base Brain Training Script
# Trains master AI model on curriculum data

set -e

echo "🧠 Training AIVO Base Brain..."
echo ""

# Check if curriculum database has data
echo "📊 Checking curriculum database..."
STANDARDS_COUNT=$(docker-compose exec -T curriculum-db psql -U aivo_user -d aivo_curriculum -t -c "SELECT COUNT(*) FROM educational_standards;" | tr -d ' ')

if [ "$STANDARDS_COUNT" -lt 1000 ]; then
  echo "❌ Not enough curriculum data ($STANDARDS_COUNT standards found)"
  echo "   Minimum required: 1000 standards"
  echo ""
  echo "   Run setup_curriculum.sh first:"
  echo "   ./scripts/setup_curriculum.sh"
  exit 1
fi

echo "✅ Found $STANDARDS_COUNT educational standards"
echo ""

# Check for API keys
if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠️  Warning: OPENAI_API_KEY not set"
  echo "   Training will use mock mode"
  echo ""
fi

# Confirm training
echo "Training Configuration:"
echo "  • Base Model: ${BASE_MODEL:-gpt-4-turbo}"
echo "  • Training Method: Fine-tuning"
echo "  • Standards Count: $STANDARDS_COUNT"
echo "  • Output: ./training_models/aivo-base-brain-v1"
echo ""

read -p "Start training? This may take several hours (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Training cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting base brain training..."
echo "   This will take several hours depending on data size"
echo ""

# Start training service
docker-compose up -d training-service

sleep 5

# Run training
docker-compose exec training-service python scripts/train.py

echo ""
echo "✅ Training complete!"
echo ""

# Show training results
echo "📊 Training Results:"
docker-compose exec -T curriculum-db psql -U aivo_user -d aivo_curriculum << EOF
SELECT 
  version,
  base_model,
  training_examples,
  validation_accuracy,
  status,
  created_at
FROM base_model_versions
ORDER BY created_at DESC
LIMIT 1;
EOF

echo ""
echo "🎉 Base brain is ready!"
echo "   Model location: ./training_models/aivo-base-brain-v1"
echo ""
echo "   Next steps:"
echo "   1. Review training metrics in the output above"
echo "   2. Test the model with validation examples"
echo "   3. Deploy to production when ready"
