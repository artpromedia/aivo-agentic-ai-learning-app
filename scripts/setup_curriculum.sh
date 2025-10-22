#!/bin/bash
# AIVO Curriculum Database Setup Script
# Sets up curriculum database with educational standards and districts

set -e

echo "🎓 Setting up AIVO Curriculum Database..."
echo ""

# Start curriculum database
echo "📦 Starting curriculum database..."
docker-compose up -d curriculum-db

# Wait for database to be ready
echo "⏳ Waiting for curriculum database to be ready..."
sleep 15

# Check if database is healthy
if ! docker-compose ps curriculum-db | grep -q "healthy"; then
    echo "❌ Curriculum database failed to start. Check logs:"
    docker-compose logs curriculum-db
    exit 1
fi

echo "✅ Curriculum database is ready"
echo ""

# Run database migrations
echo "📊 Running curriculum database migrations..."
docker-compose exec -T curriculum-db psql -U aivo_user -d aivo_curriculum -f /docker-entrypoint-initdb.d/curriculum.sql

echo "✅ Database schema created"
echo ""

# Start curriculum service
echo "🚀 Starting curriculum service..."
docker-compose up -d curriculum-service

sleep 10

# Import US standards
echo "📚 Importing US educational standards..."
echo "  → Common Core Math..."
docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
  --import common_core_math

echo "  → Common Core ELA..."
docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
  --import common_core_ela

echo "  → NGSS Science..."
docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
  --import ngss

echo "  → All 50 US states..."
docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
  --import us_states_all

echo "✅ US standards imported"
echo ""

# Import school districts
echo "🏫 Importing US school districts..."
docker-compose run --rm curriculum-service python -m app.ingestion.district_importer \
  --import nces_districts

echo "✅ US districts imported"
echo ""

# Import international curricula (optional)
read -p "Import international curricula? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🌍 Importing international curricula..."
    
    echo "  → UK National Curriculum..."
    docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
      --import uk_national_curriculum
    
    echo "  → IB (PYP, MYP, DP)..."
    docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
      --import ib_all
    
    echo "  → Australian Curriculum..."
    docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
      --import australian_curriculum
    
    echo "  → India CBSE/ICSE..."
    docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
      --import india_cbse_icse
    
    echo "  → China National Standards..."
    docker-compose run --rm curriculum-service python -m app.ingestion.standards_importer \
      --import china_national
    
    echo "✅ International curricula imported"
fi

echo ""
echo "✅ Curriculum setup complete!"
echo ""

# Show statistics
echo "📊 Curriculum Database Statistics:"
docker-compose exec -T curriculum-db psql -U aivo_user -d aivo_curriculum << EOF
SELECT 
  'Educational Standards' as type, COUNT(*) as count 
FROM educational_standards
UNION ALL
SELECT 
  'School Districts' as type, COUNT(*) as count 
FROM school_districts
UNION ALL
SELECT 
  'District Standards' as type, COUNT(*) as count 
FROM district_standards
UNION ALL
SELECT 
  'Curriculum Content' as type, COUNT(*) as count 
FROM curriculum_content;
EOF

echo ""
echo "🎉 Ready for base brain training!"
echo "   Next: Run ./scripts/train_base_brain.sh"
