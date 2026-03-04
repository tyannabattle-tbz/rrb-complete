#!/bin/bash

# QUMUS Ecosystem - Disaster Recovery Script
# Automates the recovery process from backups

set -e

BACKUP_DIR="${1:-.}/backups"
RECOVERY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="recovery_${RECOVERY_TIMESTAMP}.log"

echo "=== QUMUS Ecosystem - Disaster Recovery ===" | tee "$LOG_FILE"
echo "Timestamp: $RECOVERY_TIMESTAMP" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to handle errors
error_exit() {
    log "❌ ERROR: $1"
    exit 1
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    error_exit "Backup directory not found: $BACKUP_DIR"
fi

log "📁 Backup directory: $BACKUP_DIR"
log ""

# List available backups
log "📋 Available backups:"
ls -lh "$BACKUP_DIR" | grep -E "\.sql\.gz|\.tar\.gz" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Prompt user to select backup
echo "Enter the backup filename to restore (e.g., qumus_full_backup_20260304_020000.tar.gz):"
read -r BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    error_exit "Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
fi

log "📦 Selected backup: $BACKUP_FILE"
log ""

# Check if it's a combined backup or individual database backup
if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
    log "🔍 Extracting combined backup..."
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR"
    log "✅ Backup extracted to: $TEMP_DIR"
    echo "" | tee -a "$LOG_FILE"
    
    # Restore each database
    log "🔄 Restoring QUMUS database..."
    docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" qumus < "$TEMP_DIR"/qumus_*.sql.gz 2>/dev/null || \
    gunzip < "$TEMP_DIR"/qumus_*.sql.gz | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" qumus
    log "✅ QUMUS database restored"
    
    log "🔄 Restoring RRB database..."
    docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" rrb < "$TEMP_DIR"/rrb_*.sql.gz 2>/dev/null || \
    gunzip < "$TEMP_DIR"/rrb_*.sql.gz | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" rrb
    log "✅ RRB database restored"
    
    log "🔄 Restoring HybridCast database..."
    docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" hybridcast < "$TEMP_DIR"/hybridcast_*.sql.gz 2>/dev/null || \
    gunzip < "$TEMP_DIR"/hybridcast_*.sql.gz | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" hybridcast
    log "✅ HybridCast database restored"
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    log "🧹 Temporary files cleaned up"
    
elif [[ "$BACKUP_FILE" == qumus_*.sql.gz ]]; then
    log "🔄 Restoring QUMUS database..."
    gunzip < "$BACKUP_DIR/$BACKUP_FILE" | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" qumus
    log "✅ QUMUS database restored"
    
elif [[ "$BACKUP_FILE" == rrb_*.sql.gz ]]; then
    log "🔄 Restoring RRB database..."
    gunzip < "$BACKUP_DIR/$BACKUP_FILE" | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" rrb
    log "✅ RRB database restored"
    
elif [[ "$BACKUP_FILE" == hybridcast_*.sql.gz ]]; then
    log "🔄 Restoring HybridCast database..."
    gunzip < "$BACKUP_DIR/$BACKUP_FILE" | docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" hybridcast
    log "✅ HybridCast database restored"
    
else
    error_exit "Unknown backup file format: $BACKUP_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# Verify recovery
log "🧪 Verifying recovery..."
log ""

log "Checking QUMUS database..."
docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" qumus -e "SELECT COUNT(*) as 'Tables' FROM information_schema.tables WHERE table_schema='qumus';" | tee -a "$LOG_FILE"

log "Checking RRB database..."
docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" rrb -e "SELECT COUNT(*) as 'Tables' FROM information_schema.tables WHERE table_schema='rrb';" | tee -a "$LOG_FILE"

log "Checking HybridCast database..."
docker-compose exec -T mysql mysql -u root -p"${DB_PASSWORD}" hybridcast -e "SELECT COUNT(*) as 'Tables' FROM information_schema.tables WHERE table_schema='hybridcast';" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"

# Restart services to ensure consistency
log "🔄 Restarting services to ensure consistency..."
docker-compose restart qumus-core rrb-radio hybridcast
log "✅ Services restarted"

echo "" | tee -a "$LOG_FILE"

# Final verification
log "🧪 Final verification..."
log ""

log -n "QUMUS Core: "
if curl -s http://localhost:3000/health > /dev/null; then
    log "✅ Online"
else
    log "⚠️  Checking..."
fi

log -n "RRB Radio: "
if curl -s http://localhost:3001/health > /dev/null; then
    log "✅ Online"
else
    log "⚠️  Checking..."
fi

log -n "HybridCast: "
if curl -s http://localhost:3002/health > /dev/null; then
    log "✅ Online"
else
    log "⚠️  Checking..."
fi

echo "" | tee -a "$LOG_FILE"
log "=== Recovery Complete ===" 
log "Recovery log saved to: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"
