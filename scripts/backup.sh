#!/bin/bash

# Backup script for QUMUS ecosystem databases
# Runs on schedule and maintains backup retention

set -e

BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-mysql}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup process..."

# Backup QUMUS database
echo "[$(date)] Backing up QUMUS database..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" qumus | gzip > "$BACKUP_DIR/qumus_$TIMESTAMP.sql.gz"
echo "[$(date)] QUMUS backup completed: qumus_$TIMESTAMP.sql.gz"

# Backup RRB database
echo "[$(date)] Backing up RRB database..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" rrb | gzip > "$BACKUP_DIR/rrb_$TIMESTAMP.sql.gz"
echo "[$(date)] RRB backup completed: rrb_$TIMESTAMP.sql.gz"

# Backup HybridCast database
echo "[$(date)] Backing up HybridCast database..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" hybridcast | gzip > "$BACKUP_DIR/hybridcast_$TIMESTAMP.sql.gz"
echo "[$(date)] HybridCast backup completed: hybridcast_$TIMESTAMP.sql.gz"

# Create combined backup
echo "[$(date)] Creating combined backup..."
tar -czf "$BACKUP_DIR/qumus_full_backup_$TIMESTAMP.tar.gz" \
  "$BACKUP_DIR/qumus_$TIMESTAMP.sql.gz" \
  "$BACKUP_DIR/rrb_$TIMESTAMP.sql.gz" \
  "$BACKUP_DIR/hybridcast_$TIMESTAMP.sql.gz"
echo "[$(date)] Combined backup created: qumus_full_backup_$TIMESTAMP.tar.gz"

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
echo "[$(date)] Cleanup completed"

# Log backup statistics
echo "[$(date)] Backup statistics:"
du -sh "$BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -10

echo "[$(date)] Backup process completed successfully"
