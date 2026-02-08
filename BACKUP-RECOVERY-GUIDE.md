# QUMUS Backup & Recovery Guide

## Complete System Backup

### Automated Backup Script
```bash
#!/bin/bash
# backup-qumus.sh - Complete QUMUS backup

BACKUP_DIR="/backups/qumus"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="qumus-backup-${TIMESTAMP}"

# Create backup directory
mkdir -p ${BACKUP_DIR}/${BACKUP_NAME}

# Backup source code
cp -r /home/ubuntu/manus-agent-web ${BACKUP_DIR}/${BACKUP_NAME}/source-code

# Backup database
pg_dump $DATABASE_URL > ${BACKUP_DIR}/${BACKUP_NAME}/database.sql

# Backup configuration
cp /home/ubuntu/manus-agent-web/.env.production ${BACKUP_DIR}/${BACKUP_NAME}/.env.backup

# Backup logs
cp -r /home/ubuntu/manus-agent-web/.manus-logs ${BACKUP_DIR}/${BACKUP_NAME}/logs

# Create compressed archive
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}/
rm -rf ${BACKUP_NAME}

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
```

### Backup Schedule
- **Daily**: Automated database backups
- **Weekly**: Full system backups
- **Monthly**: Archive to cold storage

## Recovery Procedures

### Quick Recovery (Last Checkpoint)
```bash
# Use the latest checkpoint from Manus
manus-webdev rollback-checkpoint <version_id>
```

### Full System Recovery

1. **Restore from Backup Archive**
   ```bash
   cd /backups/qumus
   tar -xzf qumus-backup-YYYYMMDD_HHMMSS.tar.gz
   ```

2. **Restore Source Code**
   ```bash
   cp -r qumus-backup-*/source-code /home/ubuntu/manus-agent-web
   cd /home/ubuntu/manus-agent-web
   pnpm install
   ```

3. **Restore Database**
   ```bash
   psql $DATABASE_URL < qumus-backup-*/database.sql
   ```

4. **Restore Configuration**
   ```bash
   cp qumus-backup-*/.env.backup /home/ubuntu/manus-agent-web/.env.production
   ```

5. **Verify Installation**
   ```bash
   pnpm build
   pnpm start:production
   ```

## Disaster Recovery Plan

### Data Loss Scenario
1. Restore latest database backup
2. Restore source code from version control
3. Rebuild application
4. Verify all systems operational
5. Run automated tests

### Server Failure Scenario
1. Deploy to new server
2. Restore all backups
3. Reconfigure environment variables
4. Restart all services
5. Verify connectivity and functionality

### Security Breach Scenario
1. Immediately isolate affected systems
2. Rotate all credentials and secrets
3. Restore from clean backup
4. Audit all access logs
5. Implement security patches
6. Resume normal operations

## Backup Contents

Each backup includes:
- **source-code/**: Complete application source code
- **database.sql**: Full database dump
- **.env.backup**: Configuration file (sanitized)
- **logs/**: Application and system logs
- **MANIFEST.md**: Backup contents and metadata

## Recovery Time Objectives (RTO)

- **Quick Recovery**: < 5 minutes
- **Full Recovery**: < 30 minutes
- **Disaster Recovery**: < 2 hours

## Backup Verification

### Verify Backup Integrity
```bash
# Check backup file
tar -tzf qumus-backup-*.tar.gz | head -20

# Verify database dump
pg_restore --list qumus-backup-*/database.sql | head -20

# Validate source code
cd qumus-backup-*/source-code
npm audit
pnpm build --dry-run
```

## Backup Storage

### Primary Storage
- Location: `/backups/qumus/`
- Retention: 30 days
- Frequency: Daily

### Secondary Storage (Cold Archive)
- Location: Cloud storage (AWS S3, Google Cloud Storage)
- Retention: 1 year
- Frequency: Monthly

### Encryption
- All backups encrypted with AES-256
- Encryption keys stored separately
- Key rotation: Every 90 days

## Automated Backup Monitoring

### Backup Health Checks
```bash
# Check latest backup age
find /backups/qumus -name "*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1

# Verify backup size
du -sh /backups/qumus/qumus-backup-*.tar.gz

# Test restore procedure
./test-restore.sh
```

## Backup Retention Policy

| Backup Type | Retention | Location |
|------------|-----------|----------|
| Daily | 7 days | Local |
| Weekly | 4 weeks | Local |
| Monthly | 12 months | Cloud |
| Yearly | 7 years | Archive |

## Emergency Recovery Contacts

- **Primary Administrator**: [Your Contact]
- **Backup Administrator**: [Backup Contact]
- **Cloud Provider Support**: [Support Contact]

## Testing & Validation

### Monthly Recovery Test
```bash
# Schedule monthly test of recovery procedure
0 2 1 * * /home/ubuntu/manus-agent-web/test-recovery.sh
```

### Test Checklist
- [ ] Backup file integrity verified
- [ ] Database restore successful
- [ ] Application starts without errors
- [ ] All services operational
- [ ] Data consistency verified
- [ ] Performance acceptable

---

**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries
**Version**: 1.0.0
