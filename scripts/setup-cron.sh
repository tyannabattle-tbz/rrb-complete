#!/bin/bash

# Setup cron jobs for automated backups

BACKUP_SCHEDULE="${BACKUP_SCHEDULE:-0 2 * * *}"  # Default: 2 AM daily
CRON_FILE="/etc/crontabs/root"

echo "Setting up cron job with schedule: $BACKUP_SCHEDULE"

# Create cron job
echo "$BACKUP_SCHEDULE /app/backup.sh >> /var/log/backup.log 2>&1" | crontab -

# Start cron daemon
crond -f -l 2
