# QUMUS Ecosystem - Mac Mini Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the complete QUMUS ecosystem (QUMUS Core, RRB Radio, HybridCast) on a Mac Mini with Docker containerization, local network access via mDNS/Bonjour, and automated backup/recovery.

## System Requirements

- **Mac Mini** (M1/M2/M3 or Intel)
- **macOS 12+**
- **Docker Desktop for Mac** (latest version)
- **Internet Connection**
- **Minimum 8GB RAM** (16GB recommended)
- **50GB free disk space**

## Pre-Deployment Setup

### 1. Install Docker Desktop for Mac

```bash
# Download from https://www.docker.com/products/docker-desktop
# Or use Homebrew
brew install docker
brew install docker-compose
```

### 2. Clone the Repository

```bash
git clone <repository-url> ~/qumus-ecosystem
cd ~/qumus-ecosystem
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

### 4. Create Required Directories

```bash
# Create data and log directories
mkdir -p data/{qumus,rrb,hybridcast}
mkdir -p logs/{qumus,rrb,hybridcast,nginx}
mkdir -p backups
mkdir -p audio
mkdir -p nginx/ssl

# Set proper permissions
chmod -R 755 data logs backups audio
```

## Deployment Steps

### Step 1: Build Docker Images

```bash
# Build all Docker images
docker-compose build

# Or build specific services
docker-compose build qumus-core
docker-compose build rrb-radio
docker-compose build hybridcast
```

### Step 2: Start the Ecosystem

```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 3: Verify Services are Running

```bash
# Check QUMUS Core (Port 3000)
curl http://localhost:3000/health

# Check RRB Radio (Port 3001)
curl http://localhost:3001/health

# Check HybridCast (Port 3002)
curl http://localhost:3002/health

# Check Nginx reverse proxy
curl http://localhost/health
```

### Step 4: Configure Local Network Access (mDNS/Bonjour)

#### Option A: Using Avahi (Linux/Docker)
Already configured in Docker containers via service names.

#### Option B: Manual mDNS Setup on Mac Mini

```bash
# Install Avahi for macOS
brew install avahi

# Create mDNS service files
sudo nano /etc/avahi/services/qumus.service
```

Add the following content:

```xml
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">QUMUS Core</name>
  <service>
    <type>_http._tcp</type>
    <port>3000</port>
    <txt-record>path=/</txt-record>
  </service>
</service-group>
```

Repeat for RRB and HybridCast:

```bash
sudo nano /etc/avahi/services/rrb.service
sudo nano /etc/avahi/services/hybridcast.service
```

Restart Avahi:

```bash
sudo launchctl stop com.avahi.daemon
sudo launchctl start com.avahi.daemon
```

### Step 5: Access Services via Local Network

Once mDNS is configured, access services from any device on your network:

```bash
# QUMUS Core
http://qumus.local:3000
http://qumus.local  # via Nginx

# RRB Radio
http://rrb.local:3001
http://rrb.local  # via Nginx

# HybridCast
http://hybridcast.local:3002
http://hybridcast.local  # via Nginx

# Health Check
http://health.local
```

## Backup and Recovery

### Automated Daily Backups

Backups run automatically at **2:00 AM daily** (configurable).

```bash
# View backup schedule
docker-compose logs backup-service

# View backups
ls -lh backups/

# Manual backup
docker-compose exec backup-service /app/backup.sh
```

### Recovery Procedure

```bash
# List available backups
ls -lh backups/

# Restore from backup
docker-compose exec mysql mysql -u root -p$DB_PASSWORD < backups/qumus_YYYYMMDD_HHMMSS.sql.gz

# Or restore all databases from combined backup
cd backups
tar -xzf qumus_full_backup_YYYYMMDD_HHMMSS.tar.gz
docker-compose exec mysql mysql -u root -p$DB_PASSWORD qumus < qumus_YYYYMMDD_HHMMSS.sql
docker-compose exec mysql mysql -u root -p$DB_PASSWORD rrb < rrb_YYYYMMDD_HHMMSS.sql
docker-compose exec mysql mysql -u root -p$DB_PASSWORD hybridcast < hybridcast_YYYYMMDD_HHMMSS.sql
```

## Monitoring and Maintenance

### Check Service Status

```bash
# View all running containers
docker-compose ps

# View service logs
docker-compose logs -f qumus-core
docker-compose logs -f rrb-radio
docker-compose logs -f hybridcast

# View Nginx logs
docker-compose logs -f nginx
```

### Resource Usage

```bash
# Check Docker resource usage
docker stats

# Check disk usage
du -sh data/ logs/ backups/
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart qumus-core

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
docker ps

# View detailed logs
docker-compose logs --tail=50

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Access MySQL directly
docker-compose exec mysql mysql -u root -p$DB_PASSWORD

# Check database exists
docker-compose exec mysql mysql -u root -p$DB_PASSWORD -e "SHOW DATABASES;"
```

### Port Conflicts

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Change ports in docker-compose.yml if needed
nano docker-compose.yml
```

### mDNS Not Working

```bash
# Verify Avahi is running
sudo launchctl list | grep avahi

# Restart Avahi
sudo launchctl stop com.avahi.daemon
sudo launchctl start com.avahi.daemon

# Test mDNS resolution
ping qumus.local
ping rrb.local
ping hybridcast.local
```

## Production Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] Database password is strong and secure
- [ ] SSL certificates configured in `nginx/ssl/`
- [ ] Backup retention policy set appropriately
- [ ] Backup location is on separate drive if possible
- [ ] Firewall rules configured for external access
- [ ] Regular backup testing performed
- [ ] Monitoring and alerting configured
- [ ] Documentation updated for your environment
- [ ] Team trained on deployment and recovery procedures

## Updating the Ecosystem

```bash
# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose build --no-cache
docker-compose up -d

# Verify services are healthy
docker-compose ps
curl http://localhost/health
```

## Scaling and Performance

### Increase Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  qumus-core:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### Database Optimization

```bash
# Connect to MySQL
docker-compose exec mysql mysql -u root -p$DB_PASSWORD

# Run optimization
OPTIMIZE TABLE qumus.*;
OPTIMIZE TABLE rrb.*;
OPTIMIZE TABLE hybridcast.*;
```

## Support and Documentation

For additional help:

1. Check service logs: `docker-compose logs -f`
2. Review configuration: `cat docker-compose.yml`
3. Test connectivity: `curl http://localhost:3000/health`
4. Contact support with logs: `docker-compose logs > support.log`

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Enable SSL/TLS** for production
3. **Configure firewall** to restrict access
4. **Use strong database passwords**
5. **Enable backup encryption**
6. **Regular security updates** for Docker images
7. **Monitor logs** for suspicious activity
8. **Implement rate limiting** via Nginx
9. **Use VPN** for remote access
10. **Regular backup testing** and recovery drills

## Next Steps

1. Deploy to Mac Mini following the steps above
2. Test all services and local network access
3. Configure SSL certificates for production
4. Set up monitoring and alerting
5. Train team on operations and recovery
6. Schedule regular backup testing
7. Document any customizations made

---

**Version:** 1.0  
**Last Updated:** 2026-03-04  
**Maintained By:** QUMUS Development Team
