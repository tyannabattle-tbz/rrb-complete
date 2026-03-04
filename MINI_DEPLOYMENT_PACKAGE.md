# QUMUS Ecosystem - Mac Mini Deployment Package

**Version:** 1.0  
**Date:** March 4, 2026  
**Status:** Production Ready

---

## 📦 Package Contents

This deployment package contains everything needed to deploy the complete QUMUS ecosystem on Mac Mini with full RRB Radio integration, SSL/TLS security, VPN remote access, and automated monitoring.

### Core Components

1. **QUMUS Core** (Port 3000)
   - Autonomous orchestration engine
   - 90% autonomous control with 10% human override
   - 8 active decision policies
   - Real-time monitoring dashboard

2. **RRB Radio** (Port 3001)
   - Rockin' Rockin' Boogie radio station
   - 432 Hz healing frequency support
   - Custom station builder
   - Live listener analytics

3. **HybridCast** (Port 3002)
   - Emergency broadcast system
   - Offline-first PWA
   - Mesh networking support
   - Multi-channel broadcasting

4. **Supporting Services**
   - MySQL database with automated backups
   - Redis cache for performance
   - Nginx reverse proxy with HTTPS
   - WireGuard VPN for remote access
   - Monitoring & alerting dashboard

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Mac Mini (M1/M2/M3 or Intel)
- macOS 12+
- Docker Desktop installed
- Internet connection
- 50GB free disk space

### Deployment Steps

```bash
# 1. Clone the repository
git clone <repository-url> ~/qumus-ecosystem
cd ~/qumus-ecosystem

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 3. Create required directories
mkdir -p data/{qumus,rrb,hybridcast} logs/{qumus,rrb,hybridcast,nginx} backups

# 4. Start all services
docker-compose up -d

# 5. Verify services are running
docker-compose ps
curl http://localhost:3000/health
```

**That's it!** Your QUMUS ecosystem is now running.

---

## 🔐 Security Setup

### SSL/TLS Certificates

```bash
# Generate self-signed certificates (local development)
bash scripts/setup-ssl.sh

# Or use Let's Encrypt for production
bash scripts/setup-ssl.sh
# Select option 2 and enter your domain
```

### Local Network Access (mDNS/Bonjour)

```bash
# Setup local .local domain names
bash scripts/setup-mdns.sh

# Access services via:
# - https://qumus.local
# - https://rrb.local
# - https://hybridcast.local
```

### VPN Remote Access

```bash
# Setup WireGuard VPN for secure remote access
bash scripts/setup-wireguard.sh

# Share client config with remote users
cat qumus-client.conf
```

---

## 📊 Monitoring & Operations

### Real-Time Dashboard

Access the monitoring dashboard at:
```
https://qumus.local/monitoring
```

**Features:**
- Live CPU, memory, disk usage
- Service health status
- Network traffic monitoring
- Alert history
- System uptime tracking

### Automated Backups

Backups run automatically at **2:00 AM daily**:

```bash
# View backups
ls -lh backups/

# Manual backup
docker-compose exec backup-service /app/backup.sh

# Restore from backup
bash scripts/recovery.sh
```

### System Logs

```bash
# View service logs
docker-compose logs -f qumus-core
docker-compose logs -f rrb-radio
docker-compose logs -f hybridcast

# View Nginx logs
docker-compose logs -f nginx
```

---

## 🔄 RRB Radio & QUMUS Synchronization

The system automatically syncs RRB Radio with QUMUS Core every 30 minutes:

```bash
# Check sync status
curl https://qumus.local/api/sync/status

# Manual sync
curl -X POST https://qumus.local/api/sync/perform

# View sync metrics
curl https://qumus.local/api/sync/metrics
```

**Sync includes:**
- Station metadata synchronization
- QUMUS orchestration status updates
- Listener analytics aggregation
- Content type validation
- Frequency configuration sync

---

## 🎙️ RRB Radio Features

### Custom Station Builder

Create custom stations with:
- 10 content types (Talk, Music, News, Meditation, Healing, etc.)
- Custom icons and colors
- Public/private sharing
- Favorite management
- Real-time listener tracking

### Content Calendar

Schedule posts across platforms:
- Drag-and-drop calendar interface
- Bulk scheduling with intervals
- A/B testing framework
- Optimal posting time suggestions

### Analytics Dashboard

Real-time engagement metrics:
- Twitter, YouTube, Facebook, Instagram integration
- Platform comparison charts
- Engagement trend analysis
- Anomaly detection alerts

---

## 🌐 Network Configuration

### Local Network

| Service | URL | Port |
|---------|-----|------|
| QUMUS Core | https://qumus.local | 3000 |
| RRB Radio | https://rrb.local | 3001 |
| HybridCast | https://hybridcast.local | 3002 |
| Health Check | https://health.local | 8080 |

### Remote Access

Via WireGuard VPN:
- VPN Server: qumus.local:51820
- VPN Network: 10.0.0.0/24
- Client IP: 10.0.0.2

---

## 📋 Operational Checklist

### Daily

- [ ] Check monitoring dashboard for alerts
- [ ] Verify all services are online
- [ ] Review system logs for errors
- [ ] Monitor backup completion

### Weekly

- [ ] Test backup restoration
- [ ] Review analytics reports
- [ ] Check disk usage trends
- [ ] Update security patches

### Monthly

- [ ] Rotate SSL certificates
- [ ] Review access logs
- [ ] Update Docker images
- [ ] Audit user permissions
- [ ] Performance optimization review

---

## 🛠️ Troubleshooting

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

# Change ports in docker-compose.yml
nano docker-compose.yml
```

### mDNS Not Working

```bash
# Verify Avahi is running
sudo launchctl list | grep avahi

# Restart Avahi
sudo launchctl stop com.avahi.daemon
sudo launchctl start com.avahi.daemon

# Test mDNS
ping qumus.local
```

---

## 📞 Support Resources

### Documentation

- `MAC_MINI_DEPLOYMENT.md` - Detailed deployment guide
- `WIREGUARD_SETUP.md` - VPN configuration guide
- `docker-compose.yml` - Service configuration
- `scripts/` - Automation scripts

### Logs

```bash
# Collect all logs for support
docker-compose logs > support.log
tail -f logs/**/*.log
```

### Health Check

```bash
# Quick health verification
curl http://localhost/health
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

---

## 🔄 Updating the System

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Verify services
docker-compose ps
curl http://localhost/health
```

---

## 📊 Performance Tuning

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
```

### Database Optimization

```bash
docker-compose exec mysql mysql -u root -p$DB_PASSWORD
OPTIMIZE TABLE qumus.*;
OPTIMIZE TABLE rrb.*;
OPTIMIZE TABLE hybridcast.*;
```

---

## 🔒 Security Best Practices

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

---

## 📈 Scaling Considerations

### Horizontal Scaling

For multiple Mac Minis:
1. Deploy each service on separate Mac Mini
2. Use shared MySQL database
3. Configure load balancer (Nginx)
4. Sync via RRB-QUMUS service

### Vertical Scaling

For single Mac Mini:
1. Increase Docker resource limits
2. Optimize database queries
3. Enable caching (Redis)
4. Monitor system metrics

---

## 🎯 Next Steps

1. **Deploy to Mac Mini** - Follow Quick Start section
2. **Configure SSL/TLS** - Run `scripts/setup-ssl.sh`
3. **Setup VPN** - Run `scripts/setup-wireguard.sh`
4. **Configure mDNS** - Run `scripts/setup-mdns.sh`
5. **Monitor system** - Access monitoring dashboard
6. **Test backups** - Run recovery procedure
7. **Train team** - Document procedures
8. **Go live** - Enable production monitoring

---

## 📞 Contact & Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review documentation in `scripts/`
3. Test connectivity: `curl http://localhost:3000/health`
4. Contact support with logs: `docker-compose logs > support.log`

---

**Ready to deploy?** Start with the Quick Start section above!

---

**Version:** 1.0  
**Last Updated:** March 4, 2026  
**Maintained By:** QUMUS Development Team  
**Status:** ✅ Production Ready
