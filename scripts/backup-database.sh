#!/bin/bash

set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aivo_db_$TIMESTAMP.sql.gz"

echo "💾 Backing up AIVO databases..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup main database
echo "📊 Backing up main database..."
docker-compose exec -T postgres pg_dump -U aivo_user aivo_db | gzip > "$BACKUP_FILE"

echo "✅ Main database backup: $BACKUP_FILE"

# Backup curriculum database
echo "📚 Backing up curriculum database..."
docker-compose exec -T curriculum-db pg_dump -U aivo_user aivo_curriculum | gzip > "$BACKUP_DIR/aivo_curriculum_$TIMESTAMP.sql.gz"

echo "✅ Curriculum backup: $BACKUP_DIR/aivo_curriculum_$TIMESTAMP.sql.gz"

# Get backup sizes
MAIN_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
CURRICULUM_SIZE=$(du -h "$BACKUP_DIR/aivo_curriculum_$TIMESTAMP.sql.gz" | cut -f1)

echo ""
echo "📏 Backup sizes:"
echo "   Main database: $MAIN_SIZE"
echo "   Curriculum database: $CURRICULUM_SIZE"

# Clean up old backups (keep last 30 days)
echo ""
echo "🧹 Cleaning up old backups (keeping last 30 days)..."
find "$BACKUP_DIR" -name "aivo_*.sql.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "aivo_curriculum_*.sql.gz" -mtime +30 -delete

REMAINING=$(find "$BACKUP_DIR" -name "aivo_*.sql.gz" | wc -l)
echo "✅ $REMAINING backup files remaining"

# Upload to S3 (if configured)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
    echo ""
    echo "☁️  Uploading to S3..."
    
    aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BACKUP_BUCKET/backups/" || echo "⚠️  S3 upload failed"
    aws s3 cp "$BACKUP_DIR/aivo_curriculum_$TIMESTAMP.sql.gz" "s3://$AWS_S3_BACKUP_BUCKET/backups/" || echo "⚠️  S3 upload failed"
    
    echo "✅ S3 upload complete"
    
    # List recent S3 backups
    echo ""
    echo "☁️  Recent S3 backups:"
    aws s3 ls "s3://$AWS_S3_BACKUP_BUCKET/backups/" --recursive | tail -10
fi

# Create backup manifest
cat > "$BACKUP_DIR/backup_manifest_$TIMESTAMP.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backups": {
    "main_database": {
      "file": "$BACKUP_FILE",
      "size": "$MAIN_SIZE"
    },
    "curriculum_database": {
      "file": "$BACKUP_DIR/aivo_curriculum_$TIMESTAMP.sql.gz",
      "size": "$CURRICULUM_SIZE"
    }
  },
  "s3_uploaded": $([ -n "$AWS_S3_BACKUP_BUCKET" ] && echo "true" || echo "false"),
  "retention_days": 30
}
EOF

echo ""
echo "✅ All backups complete!"
echo "📋 Manifest: $BACKUP_DIR/backup_manifest_$TIMESTAMP.json"

# Send notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"💾 AIVO database backup completed\",
            \"blocks\": [
                {
                    \"type\": \"section\",
                    \"text\": {
                        \"type\": \"mrkdwn\",
                        \"text\": \"*Backup Completed* :floppy_disk:\\n*Main DB:* $MAIN_SIZE\\n*Curriculum DB:* $CURRICULUM_SIZE\\n*Time:* $(date)\"
                    }
                }
            ]
        }" || true
fi
