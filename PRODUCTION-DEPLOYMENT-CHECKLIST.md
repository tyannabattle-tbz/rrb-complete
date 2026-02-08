# QUMUS Production Deployment Checklist

## Pre-Deployment Verification

### System Requirements
- [ ] Server has minimum 4 CPU cores
- [ ] Server has minimum 8GB RAM
- [ ] Server has minimum 50GB SSD storage
- [ ] Ubuntu 20.04+ or compatible Linux distribution
- [ ] Node.js 18+ installed and verified
- [ ] npm/pnpm 8+ installed and verified
- [ ] PostgreSQL 12+ installed and running
- [ ] Nginx installed and configured
- [ ] Certbot installed for SSL/TLS

### Domain & DNS
- [ ] Domain name registered and pointing to server IP
- [ ] DNS records propagated (verify with `nslookup`)
- [ ] Domain accessible from browser
- [ ] Subdomain configured (if needed)

### Database Setup
- [ ] PostgreSQL service running
- [ ] Database created and accessible
- [ ] Database user created with appropriate permissions
- [ ] DATABASE_URL environment variable configured
- [ ] Database migrations executed (`pnpm db:push`)
- [ ] Database backup scheduled

### Environment Configuration
- [ ] .env.production file created with all required variables
- [ ] JWT_SECRET configured and secure
- [ ] OAUTH_SERVER_URL configured
- [ ] OLLAMA_BASE_URL configured (if using Ollama)
- [ ] STRIPE_SECRET_KEY configured (if using Stripe)
- [ ] STRIPE_WEBHOOK_SECRET configured (if using Stripe)
- [ ] All secrets stored securely (not in git)
- [ ] Environment variables verified with `env | grep QUMUS`

### SSL/TLS Certificates
- [ ] Let's Encrypt certificate obtained
- [ ] Certificate files in `/etc/letsencrypt/live/`
- [ ] Nginx configured with SSL/TLS
- [ ] HTTPS working and accessible
- [ ] Certificate auto-renewal configured
- [ ] Firewall rules allow ports 80 and 443

### Application Build
- [ ] Dependencies installed (`pnpm install`)
- [ ] TypeScript compilation successful (`pnpm build`)
- [ ] No build errors or warnings
- [ ] Production build optimized
- [ ] Source maps disabled for security
- [ ] Environment variables injected correctly

### Ollama Integration (if enabled)
- [ ] Ollama service installed and running
- [ ] Models pulled (`ollama pull llama2 mistral`)
- [ ] Ollama accessible at OLLAMA_BASE_URL
- [ ] Health check passing (`curl http://localhost:11434/api/tags`)
- [ ] Model fallback configured
- [ ] Performance tested with expected load

### Stripe Integration (if enabled)
- [ ] Stripe account created and verified
- [ ] API keys obtained and configured
- [ ] Webhook endpoint configured
- [ ] Webhook secret stored securely
- [ ] Test payments processed successfully
- [ ] Production keys activated (not test keys)

### WebSocket Configuration
- [ ] WebSocket server configured
- [ ] WEBSOCKET_URL environment variable set
- [ ] Nginx configured for WebSocket proxying
- [ ] WebSocket connection tested in browser
- [ ] Heartbeat and reconnection logic verified

### Monitoring & Logging
- [ ] Application logging configured
- [ ] Log rotation configured
- [ ] Monitoring service installed (PM2, systemd, etc.)
- [ ] Health check endpoint configured
- [ ] Error tracking service configured (optional)
- [ ] Performance monitoring enabled

### Security Hardening
- [ ] Firewall configured with appropriate rules
- [ ] SSH hardened (key-based auth only)
- [ ] Fail2ban installed and configured (optional)
- [ ] Security headers configured in Nginx
- [ ] CORS configured appropriately
- [ ] Rate limiting configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Backup & Recovery
- [ ] Backup script created and tested
- [ ] Database backup schedule configured
- [ ] Backup storage location configured
- [ ] Backup encryption enabled
- [ ] Recovery procedure tested
- [ ] Backup retention policy defined

## Deployment Steps

### 1. Pre-Deployment
```bash
# [ ] Stop current application (if running)
pm2 stop qumus

# [ ] Create backup of current state
tar -czf /backups/qumus-pre-deployment-$(date +%Y%m%d-%H%M%S).tar.gz /home/ubuntu/manus-agent-web/

# [ ] Pull latest code
cd /home/ubuntu/manus-agent-web
git pull origin main
```

### 2. Dependencies & Build
```bash
# [ ] Install dependencies
pnpm install

# [ ] Run database migrations
pnpm db:push

# [ ] Build application
pnpm build

# [ ] Run tests
pnpm test
```

### 3. Configuration
```bash
# [ ] Verify environment variables
env | grep -E "OLLAMA|STRIPE|DATABASE|JWT|OAUTH"

# [ ] Check Ollama service
curl http://localhost:11434/api/tags

# [ ] Verify database connection
pnpm db:check
```

### 4. Deployment
```bash
# [ ] Start application with PM2
pm2 start "pnpm start:production" --name qumus

# [ ] Verify application started
pm2 status

# [ ] Check application logs
pm2 logs qumus --lines 50

# [ ] Test application health
curl http://localhost:3000/api/health
```

### 5. Verification
```bash
# [ ] Test HTTPS access
curl -I https://your-domain.com

# [ ] Test API endpoints
curl https://your-domain.com/api/health

# [ ] Test WebSocket connection
# Use browser console: ws = new WebSocket('wss://your-domain.com/ws')

# [ ] Test database connection
# Verify data loads in UI

# [ ] Test Ollama integration
# Test chat functionality in QUMUS Chat

# [ ] Test Stripe integration (if enabled)
# Process test payment
```

### 6. Post-Deployment
```bash
# [ ] Monitor application logs
pm2 logs qumus

# [ ] Check system resources
top
free -h
df -h

# [ ] Verify backup is working
ls -lh /backups/

# [ ] Send deployment notification
# Email team about successful deployment
```

## Post-Deployment Monitoring

### Daily Checks
- [ ] Application running without errors
- [ ] No excessive memory usage
- [ ] Database responding normally
- [ ] Backup completed successfully
- [ ] Error logs reviewed and addressed

### Weekly Checks
- [ ] SSL certificate status verified
- [ ] Nginx logs reviewed for errors
- [ ] Database performance monitored
- [ ] Backup integrity verified
- [ ] Security updates available

### Monthly Checks
- [ ] Full system health assessment
- [ ] Performance metrics reviewed
- [ ] Capacity planning assessment
- [ ] Security audit performed
- [ ] Disaster recovery test

## Rollback Procedure

If deployment fails or issues arise:

```bash
# [ ] Stop current application
pm2 stop qumus

# [ ] Restore from backup
tar -xzf /backups/qumus-pre-deployment-*.tar.gz

# [ ] Restore database (if needed)
psql $DATABASE_URL < /backups/database-*.sql

# [ ] Reinstall dependencies
pnpm install

# [ ] Restart application
pm2 start qumus

# [ ] Verify rollback successful
pm2 logs qumus
```

## Incident Response

### Application Crash
1. [ ] Check logs: `pm2 logs qumus`
2. [ ] Verify environment variables
3. [ ] Check database connection
4. [ ] Restart application: `pm2 restart qumus`
5. [ ] If issue persists, rollback to previous version

### High Memory Usage
1. [ ] Check running processes: `top`
2. [ ] Review application logs for memory leaks
3. [ ] Increase server resources if needed
4. [ ] Restart application: `pm2 restart qumus`

### Database Connection Issues
1. [ ] Verify PostgreSQL is running
2. [ ] Check DATABASE_URL configuration
3. [ ] Test connection: `psql $DATABASE_URL`
4. [ ] Check database logs
5. [ ] Restart database service if needed

### SSL Certificate Issues
1. [ ] Check certificate status: `sudo certbot certificates`
2. [ ] Verify certificate files exist
3. [ ] Check Nginx configuration
4. [ ] Restart Nginx: `sudo systemctl restart nginx`
5. [ ] Test HTTPS: `curl -I https://your-domain.com`

## Success Criteria

Deployment is considered successful when:

- ✅ Application running without errors
- ✅ All endpoints responding correctly
- ✅ Database queries executing successfully
- ✅ WebSocket connections established
- ✅ SSL/TLS certificate valid
- ✅ Ollama service responding (if enabled)
- ✅ Stripe webhooks receiving events (if enabled)
- ✅ Logs show normal operation
- ✅ Performance metrics within acceptable range
- ✅ No security alerts or warnings

## Post-Deployment Documentation

- [ ] Update deployment log with date and time
- [ ] Document any issues encountered and resolutions
- [ ] Update runbooks with any new procedures
- [ ] Notify stakeholders of successful deployment
- [ ] Schedule next maintenance window
- [ ] Archive deployment artifacts

## Emergency Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Primary Admin | [Name] | [Email] | [Phone] |
| Backup Admin | [Name] | [Email] | [Phone] |
| Database Admin | [Name] | [Email] | [Phone] |
| Security Lead | [Name] | [Email] | [Phone] |

## Additional Resources

- Installation Guide: `INSTALLATION-GUIDE.md`
- User Guide: `USER-GUIDE.md`
- Deployment Guide: `DEPLOYMENT-CONFIG.md`
- Backup Guide: `BACKUP-RECOVERY-GUIDE.md`
- SSL/TLS Setup: `SSL-TLS-SETUP.md`

---

**Checklist Version**: 1.0.0
**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Notes**: _______________________________________________
