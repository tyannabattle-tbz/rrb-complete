# QUMUS Complete Deployment Automation Guide

## Overview

This guide provides step-by-step instructions for deploying QUMUS to production using three automated scripts that handle deployment, SSL/TLS configuration, and monitoring setup.

## Quick Start (3 Commands)

```bash
# 1. Deploy to production
sudo ./deploy-production.sh --domain your-domain.com

# 2. Setup SSL/TLS
sudo ./setup-ssl.sh your-domain.com your-email@example.com

# 3. Setup monitoring
sudo ./setup-monitoring.sh your-email@example.com
```

## Deployment Scripts

### 1. deploy-production.sh

**Purpose**: Automates complete production deployment with all system checks and configurations.

**Features**:
- System requirements verification
- Pre-deployment backup creation
- Dependency installation
- Database migrations
- Application build and startup
- Nginx configuration
- SSL/TLS integration
- Firewall setup
- Comprehensive logging

**Usage**:
```bash
sudo ./deploy-production.sh [--domain your-domain.com] [--skip-ssl] [--skip-monitoring]
```

**Parameters**:
- `--domain your-domain.com` - Configure domain for HTTPS (optional)
- `--skip-ssl` - Skip SSL/TLS setup (optional)
- `--skip-monitoring` - Skip monitoring setup (optional)

**What It Does**:

1. **Pre-Deployment Checks**
   - Verifies Node.js, pnpm, PostgreSQL, Nginx, PM2
   - Creates backup of current state
   - Verifies environment configuration

2. **Installation & Build**
   - Installs dependencies with `pnpm install`
   - Runs database migrations
   - Builds application for production

3. **Service Setup**
   - Configures logging and log rotation
   - Starts application with PM2
   - Configures Nginx reverse proxy
   - Sets up firewall rules

4. **Verification**
   - Tests application health
   - Verifies database connection
   - Confirms Nginx is running

**Example**:
```bash
sudo ./deploy-production.sh --domain qumus.example.com
```

### 2. setup-ssl.sh

**Purpose**: Automates SSL/TLS certificate setup with Let's Encrypt and Nginx integration.

**Features**:
- Certbot installation
- Nginx configuration for SSL
- Let's Encrypt certificate acquisition
- Certificate validation
- Auto-renewal configuration
- Security headers setup
- Certificate expiry monitoring

**Usage**:
```bash
sudo ./setup-ssl.sh your-domain.com [your-email@example.com]
```

**Parameters**:
- `your-domain.com` - Domain name (required)
- `your-email@example.com` - Email for Let's Encrypt (optional, defaults to admin@example.com)

**What It Does**:

1. **Certificate Setup**
   - Installs Certbot if needed
   - Creates Nginx configuration
   - Obtains Let's Encrypt certificate
   - Validates certificate

2. **Auto-Renewal**
   - Enables certbot.timer
   - Configures automatic renewal
   - Tests renewal process

3. **Security**
   - Configures security headers
   - Sets up HSTS
   - Implements CSP headers

4. **Monitoring**
   - Creates certificate expiry checker
   - Sets up daily renewal reminders
   - Generates SSL configuration report

**Example**:
```bash
sudo ./setup-ssl.sh qumus.example.com admin@qumus.example.com
```

### 3. setup-monitoring.sh

**Purpose**: Configures comprehensive monitoring, alerting, and log management.

**Features**:
- PM2 monitoring dashboard
- Health check monitoring (every 5 minutes)
- Performance monitoring (every minute)
- Log analysis and daily reports
- Email and Slack alerts
- Log rotation
- Monitoring dashboard CLI tool

**Usage**:
```bash
sudo ./setup-monitoring.sh [--email your-email@example.com] [--slack webhook-url]
```

**Parameters**:
- `--email your-email@example.com` - Email for alerts (optional)
- `--slack webhook-url` - Slack webhook for alerts (optional)

**What It Does**:

1. **PM2 Monitoring**
   - Installs PM2 modules
   - Starts web dashboard (http://localhost:9615)
   - Configures log rotation

2. **Health Checks**
   - Monitors application status
   - Checks API responsiveness
   - Monitors disk, memory, CPU usage
   - Verifies database connection
   - Checks Nginx status

3. **Performance Monitoring**
   - Collects CPU metrics
   - Tracks memory usage
   - Monitors disk space
   - Records uptime

4. **Alerting**
   - Sends email alerts
   - Sends Slack notifications
   - Auto-restarts failed services
   - Generates daily reports

**Example**:
```bash
sudo ./setup-monitoring.sh admin@qumus.example.com https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Complete Deployment Workflow

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install basic tools
sudo apt-get install -y curl wget git build-essential

# Install Node.js (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
sudo apt-get install -y nginx

# Install PM2
npm install -g pm2
```

### Step 2: Extract and Prepare QUMUS

```bash
# Extract backup archive
tar -xzf qumus-complete-backup-*.tar.gz
cd manus-agent-web

# Configure environment
cp .env.example .env.production
nano .env.production  # Edit with your configuration
```

### Step 3: Run Deployment Script

```bash
# Make scripts executable
chmod +x deploy-production.sh setup-ssl.sh setup-monitoring.sh

# Run main deployment
sudo ./deploy-production.sh --domain your-domain.com
```

### Step 4: Configure SSL/TLS

```bash
# Setup SSL certificates
sudo ./setup-ssl.sh your-domain.com your-email@example.com
```

### Step 5: Setup Monitoring

```bash
# Configure monitoring and alerting
sudo ./setup-monitoring.sh your-email@example.com https://your-slack-webhook-url
```

### Step 6: Verify Deployment

```bash
# Check application status
pm2 status

# View logs
pm2 logs qumus

# Test HTTPS
curl -I https://your-domain.com

# Access PM2 Dashboard
# Visit: http://your-server-ip:9615

# Monitor system
qumus-dashboard
```

## Configuration Files

### Environment Variables (.env.production)

```bash
# Application
NODE_ENV=production
PORT=3000
WEBSOCKET_URL=wss://your-domain.com/ws

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/qumus

# Authentication
JWT_SECRET=your-secure-jwt-secret
OAUTH_SERVER_URL=https://oauth.example.com

# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Nginx Configuration

The scripts automatically create Nginx configuration at `/etc/nginx/sites-available/qumus` with:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- WebSocket support
- Security headers
- Reverse proxy setup

### PM2 Configuration

The scripts configure PM2 with:
- Application auto-restart
- Log rotation
- System startup integration
- Web dashboard

## Monitoring and Alerts

### Health Checks (Every 5 Minutes)

Monitors:
- Application running status
- API responsiveness
- Disk space usage
- Memory usage
- CPU usage
- Database connection
- Nginx status

### Performance Metrics (Every Minute)

Tracks:
- CPU usage percentage
- Memory usage percentage
- Disk usage percentage
- Application uptime

### Daily Reports (2 AM)

Includes:
- Error count
- Warning count
- Failed requests
- Top errors
- Performance summary

### Alert Channels

**Email Alerts**:
- Application failures
- High resource usage
- Database connection issues
- Disk space warnings

**Slack Alerts** (if configured):
- Real-time notifications
- Same alerts as email
- Formatted for Slack

## Useful Commands

### Application Management

```bash
# View application status
pm2 status

# View logs
pm2 logs qumus

# Restart application
pm2 restart qumus

# Stop application
pm2 stop qumus

# Start application
pm2 start qumus

# View PM2 Dashboard
pm2 web
# Visit: http://localhost:9615
```

### Monitoring

```bash
# View monitoring dashboard
qumus-dashboard

# View health check logs
tail -f /var/log/qumus/health-check.log

# View performance metrics
tail -f /var/log/qumus/performance.log

# View daily report
cat /var/log/qumus/daily-report.txt
```

### SSL/TLS

```bash
# Check certificate status
sudo certbot certificates

# View certificate details
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates

# Test certificate renewal
sudo certbot renew --dry-run

# Manually renew certificate
sudo certbot renew
```

### System

```bash
# View system resources
top

# Check disk space
df -h

# Check memory usage
free -h

# View Nginx status
sudo systemctl status nginx

# View PostgreSQL status
sudo systemctl status postgresql

# View application logs
sudo tail -f /var/log/qumus/qumus.log
```

## Troubleshooting

### Application Not Starting

```bash
# Check logs
pm2 logs qumus

# Verify environment variables
cat /home/ubuntu/manus-agent-web/.env.production

# Check database connection
psql $DATABASE_URL

# Restart application
pm2 restart qumus
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Verify certificate file
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -text

# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### High Resource Usage

```bash
# Check top processes
top

# View application memory usage
pm2 monit

# Check disk usage
du -sh /var/log/qumus/*

# Clean old logs
sudo logrotate -f /etc/logrotate.d/qumus
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d qumus -c "SELECT 1"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql.log
```

## Backup and Recovery

### Create Backup

```bash
# Backup is created automatically before deployment
# Manual backup:
tar -czf /backups/qumus-manual-$(date +%Y%m%d-%H%M%S).tar.gz /home/ubuntu/manus-agent-web/
```

### Restore from Backup

```bash
# Stop application
pm2 stop qumus

# Extract backup
tar -xzf /backups/qumus-*.tar.gz

# Reinstall dependencies
cd manus-agent-web
pnpm install

# Restart application
pm2 start qumus
```

## Security Best Practices

1. **Keep Software Updated**
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

2. **Monitor Logs Regularly**
   ```bash
   tail -f /var/log/qumus/*.log
   tail -f /var/log/nginx/*.log
   ```

3. **Backup Regularly**
   - Automated daily backups configured
   - Test restore procedure monthly

4. **Rotate Credentials**
   - Change JWT_SECRET quarterly
   - Rotate database passwords
   - Update API keys

5. **Enable Firewall**
   - Scripts configure UFW automatically
   - Only allow necessary ports

## Performance Optimization

### Database Optimization

```bash
# Enable connection pooling
# Configure in .env.production:
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
```

### Nginx Optimization

```bash
# Enable gzip compression
# Enable caching
# Already configured by scripts
```

### Application Optimization

```bash
# Enable production mode
NODE_ENV=production

# Use PM2 clustering (optional)
pm2 start "pnpm start:production" -i max
```

## Support and Documentation

- **Main Documentation**: README.md
- **User Guide**: USER-GUIDE.md
- **Installation**: INSTALLATION-GUIDE.md
- **Deployment**: DEPLOYMENT-CONFIG.md
- **Backup**: BACKUP-RECOVERY-GUIDE.md
- **SSL/TLS**: SSL-TLS-SETUP.md
- **Customization**: QUMUS-CUSTOMIZATION-TEMPLATE.md

## Next Steps

1. **Test in Staging** - Deploy to staging environment first
2. **Monitor Closely** - Watch logs and metrics after deployment
3. **Optimize Performance** - Adjust settings based on metrics
4. **Plan Scaling** - Consider load balancing for high traffic
5. **Disaster Recovery** - Test backup and recovery procedures

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries
