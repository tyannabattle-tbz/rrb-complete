# Production Deployment Guide

**Canryn Production and its subsidiaries**

Complete guide for deploying the Manus Agent Web Interface to Mac Mini production environment.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Mac Mini Transport & Installation](#mac-mini-transport--installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Operations](#operations)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## System Requirements

### Hardware
- **Mac Mini** (2018 or newer recommended)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB free space minimum
- **Network**: Stable internet connection

### Software
- **macOS**: 10.15 (Catalina) or newer
- **Node.js**: 18.0.0 or newer
- **pnpm**: 8.0.0 or newer
- **Git**: 2.30.0 or newer

### Network Requirements
- Port 3000 (application)
- Port 443 (HTTPS)
- Port 80 (HTTP redirect)
- Outbound access to:
  - `api.manus.im` (OAuth)
  - `rockinrockinboogie.com` (RRB Radio)
  - `qumus.canryn.io` (Qumus orchestration)
  - `hybridcast.canryn.io` (Emergency broadcast)

---

## Pre-Deployment Checklist

Before deploying to Mac Mini, ensure:

- [ ] Production environment variables configured
- [ ] Database credentials verified
- [ ] Stream URLs configured (RRB Radio)
- [ ] SSL/TLS certificates prepared
- [ ] Backup systems tested
- [ ] Disaster recovery plan documented
- [ ] All team members notified
- [ ] Rollback procedure tested
- [ ] Monitoring and alerting configured
- [ ] Logging infrastructure ready

---

## Mac Mini Transport & Installation

### Step 1: Prepare Transport Package

```bash
# On development machine
cd /path/to/manus-agent-web

# Create transport archive
tar -czf manus-agent-web-production.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.env \
  .

# Transfer to Mac Mini
scp manus-agent-web-production.tar.gz user@mac-mini:/tmp/
```

### Step 2: Extract on Mac Mini

```bash
# SSH into Mac Mini
ssh user@mac-mini

# Extract archive
cd ~
tar -xzf /tmp/manus-agent-web-production.tar.gz
cd manus-agent-web
```

### Step 3: Run Production Deployment Script

```bash
# Make script executable
chmod +x MAC_MINI_PRODUCTION_TRANSPORT.sh

# Run deployment (this will handle all installation and configuration)
./MAC_MINI_PRODUCTION_TRANSPORT.sh
```

The script will automatically:
1. Check system requirements
2. Install dependencies (Homebrew, Node.js, pnpm)
3. Configure environment variables
4. Set up database
5. Build for production
6. Configure LaunchAgent for auto-start
7. Apply security hardening
8. Verify installation

---

## Configuration

### Environment Variables

Update `.env.production` with your production credentials:

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=your_jwt_secret_key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# RRB Radio Streaming
RRB_STREAM_URL=https://stream.rockinrockinboogie.com/live
RRB_BACKUP_STREAM_URL=https://backup-stream.rockinrockinboogie.com/live
RRB_RADIO_API=https://api.rockinrockinboogie.com/v1

# Qumus Orchestration
QUMUS_API_URL=https://qumus.canryn.io/api/v1
QUMUS_AUTONOMY_LEVEL=90

# Security
HTTPS_ONLY=true
SECURE_COOKIES=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=1000
```

### SSL/TLS Configuration

If using nginx reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Deployment

### Automatic Deployment (Recommended)

The deployment script handles everything automatically:

```bash
./MAC_MINI_PRODUCTION_TRANSPORT.sh
```

### Manual Deployment

If you prefer manual control:

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.production.example .env.production
# Edit .env.production with your credentials

# Run database migrations
pnpm db:push

# Build for production
pnpm build

# Start service
pnpm start
```

### Verify Deployment

```bash
# Check if service is running
curl http://localhost:3000

# View logs
tail -f ~/.manus-agent-web/logs/stdout.log

# Check LaunchAgent status
launchctl list | grep manus-agent-web
```

---

## Verification

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database connection
curl http://localhost:3000/api/health/database

# RRB Radio streaming
curl http://localhost:3000/api/health/rrb

# Qumus orchestration
curl http://localhost:3000/api/health/qumus
```

### System Status

```bash
# Check process
ps aux | grep "node"

# Check port
lsof -i :3000

# Check disk space
df -h

# Check memory
vm_stat
```

### Service Logs

```bash
# Standard output
tail -f ~/.manus-agent-web/logs/stdout.log

# Error log
tail -f ~/.manus-agent-web/logs/stderr.log

# System log
log stream --predicate 'process == "node"'
```

---

## Operations

### Start Service

```bash
# Automatic (via LaunchAgent)
# Service starts automatically on Mac Mini boot

# Manual start
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

### Stop Service

```bash
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

### Restart Service

```bash
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

### View Real-time Logs

```bash
# Follow stdout
tail -f ~/.manus-agent-web/logs/stdout.log

# Follow stderr
tail -f ~/.manus-agent-web/logs/stderr.log

# Search logs
grep "ERROR" ~/.manus-agent-web/logs/stdout.log
```

### Database Backup

```bash
# Automatic backups (configured in .env.production)
# Manual backup
mysqldump -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Update Application

```bash
# Pull latest code
cd ~/manus-agent-web
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm db:push

# Rebuild
pnpm build

# Restart service
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
tail -f ~/.manus-agent-web/logs/stderr.log

# Verify Node.js installation
node --version

# Check port availability
lsof -i :3000

# Verify environment variables
cat ~/.manus-agent-web/.env.production
```

### Database Connection Issues

```bash
# Test database connection
mysql -h host -u user -p database

# Check DATABASE_URL
echo $DATABASE_URL

# Verify credentials in .env.production
```

### RRB Radio Streaming Issues

```bash
# Test stream URL
curl -I https://stream.rockinrockinboogie.com/live

# Check RRB API
curl https://api.rockinrockinboogie.com/v1/health

# View streaming logs
grep "RRB" ~/.manus-agent-web/logs/stdout.log
```

### Qumus Orchestration Issues

```bash
# Test Qumus API
curl https://qumus.canryn.io/api/v1/health

# Check Qumus integration
grep "QUMUS" ~/.manus-agent-web/logs/stdout.log

# Verify autonomy level
curl http://localhost:3000/api/qumus/status
```

### High Memory Usage

```bash
# Check memory usage
ps aux | grep node

# Restart service
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
sleep 2
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist

# Monitor memory
watch -n 1 'ps aux | grep node'
```

---

## Rollback Procedures

### Rollback to Previous Version

```bash
# Stop service
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist

# Restore from backup
cd ~/manus-agent-web
git checkout previous_version_hash

# Reinstall dependencies
pnpm install

# Run migrations (if needed)
pnpm db:push

# Rebuild
pnpm build

# Start service
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

### Restore Database Backup

```bash
# Stop service
launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist

# Restore database
mysql -u user -p database < backup_file.sql

# Start service
launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
```

### Emergency Shutdown

```bash
# Force stop service
pkill -9 node

# Verify stopped
ps aux | grep node

# Manual cleanup
rm -f ~/.manus-agent-web/pid.lock
```

---

## Support & Monitoring

### Monitoring Dashboard

Access the Qumus Monitoring Dashboard at:
```
http://localhost:3000/qumus-monitoring
```

### Real-time Metrics

- Listener count (RRB Radio)
- Stream quality metrics
- Autonomous decision history
- System health status
- Error rates and logs

### Alert Configuration

Configure alerts in `.env.production`:
```
ALERT_EMAIL=ops@canryn.io
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
```

---

## Production Checklist

After deployment, verify:

- [ ] Service is running and auto-starts on reboot
- [ ] All health checks passing
- [ ] Database backups running
- [ ] Logs being collected
- [ ] Monitoring alerts configured
- [ ] RRB Radio streaming
- [ ] Qumus orchestration active
- [ ] HybridCast emergency override ready
- [ ] Listener analytics dashboard operational
- [ ] All webhooks responding

---

## Canryn Production Crediting

This deployment is credited to **Canryn Production and its subsidiaries**.

**Mission**: "A Voice for the Voiceless"

**Systems Deployed**:
- RRB Radio Station (rockinrockinboogie.com)
- Qumus Autonomous Orchestration Engine
- HybridCast Emergency Broadcast System
- Sweet Miracles Fundraising Platform
- Listener Analytics Dashboard
- Content Scheduling System
- Webhook Infrastructure

**Autonomy**: 90% Qumus autonomous operation with 10% human oversight

---

For additional support, contact: ops@canryn.io
