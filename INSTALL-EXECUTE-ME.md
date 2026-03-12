# 🚀 Qumus Autonomous Orchestration Platform - Installation & Deployment Guide

**Project**: Manus Agent Web (Qumus)  
**Domain**: rockinrockinboogie.com  
**Status**: Production Ready  
**Version**: c147b826  
**Registry**: Rockin Rockin Boogie (BMI - Payten Music)  
**Platform**: Canryn Production

---

## 📋 Quick Start (Choose One)

### Option A: Deploy to Manus (Recommended - Once Fixed)
```bash
# Status: Waiting for Manus infrastructure fix
# Timeline: 2-5 minutes once fixed
# Cost: $0
# See: RRB-DEPLOYMENT-OPTIONS.md → Option 1
```

### Option B: Deploy to Railway (15 minutes)
```bash
# 1. Go to https://railway.app
# 2. Connect GitHub repository
# 3. Add environment variables
# 4. Deploy
# Cost: $10-15/month
# See: RRB-DEPLOYMENT-OPTIONS.md → Option 2
```

### Option C: Deploy to Render (15 minutes)
```bash
# 1. Go to https://render.com
# 2. Connect GitHub repository
# 3. Add environment variables
# 4. Deploy
# Cost: $10-15/month
# See: RRB-DEPLOYMENT-OPTIONS.md → Option 3
```

### Option D: Deploy to Fly.io (20 minutes)
```bash
# 1. Install Fly CLI: curl -L https://fly.io/install.sh | sh
# 2. Run: fly launch
# 3. Configure environment
# 4. Deploy: fly deploy
# Cost: $5-10/month
# See: RRB-DEPLOYMENT-OPTIONS.md → Option 4
```

### Option E: Deploy to Your VPS (60 minutes)
```bash
# 1. Provision VPS (DigitalOcean, Linode, AWS)
# 2. Install dependencies
# 3. Clone repository
# 4. Configure environment
# 5. Build and run
# Cost: $5-20/month
# See: RRB-DEPLOYMENT-OPTIONS.md → Option 5
```

---

## 📦 What's Included

### Project Files
- ✅ Complete source code (all 282 tests passing)
- ✅ Database schema with Drizzle ORM
- ✅ Stripe payment integration (webhooks + checkout)
- ✅ Sweet Miracles donation system
- ✅ QUMUS autonomous orchestration engine
- ✅ HybridCast emergency broadcast system
- ✅ Rockin Rockin Boogie radio station
- ✅ Solbones sacred math dice game
- ✅ Healing frequencies meditation hub

### Documentation
- ✅ `RRB-DEPLOYMENT-OPTIONS.md` - 5 deployment options
- ✅ `IP_DOCUMENTATION.md` - IP configuration guide
- ✅ `INSTALL-EXECUTE-ME.md` - This file
- ✅ `README.md` - Project overview
- ✅ Deployment guides from RRB ecosystem

### Backup & Recovery
- ✅ `manus-agent-web-backup.zip` - Complete project backup
- ✅ GitHub repository: https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup
- ✅ All source code backed up and versioned

---

## 🔧 Local Development Setup

### Prerequisites
```bash
# Node.js 22.13.0+
node --version

# pnpm package manager
npm install -g pnpm

# Git
git --version
```

### Installation
```bash
# 1. Extract backup or clone repository
cd manus-agent-web
# OR
git clone https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup.git
cd rockin-rockin-boogie-backup

# 2. Install dependencies
pnpm install

# 3. Configure environment
# Use Manus Management UI → Settings → Secrets
# Or create .env.local with required variables

# 4. Setup database
pnpm db:push

# 5. Run development server
pnpm dev

# 6. Open in browser
# http://localhost:3000
```

### Environment Variables Required
```
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-secret-key-32-chars-min
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
# Expected: 282/282 passing ✓
```

### Run Specific Test Suite
```bash
pnpm test server/stripe.test.ts
pnpm test server/auth.logout.test.ts
```

### Type Checking
```bash
pnpm tsc --noEmit
# Expected: 0 errors
```

---

## 🏗️ Build for Production

### Create Production Build
```bash
pnpm build
# Output: dist/
```

### Start Production Server
```bash
node dist/server/index.js
# Server running on http://localhost:3000
```

### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start "node dist/server/index.js" --name qumus

# View logs
pm2 logs qumus

# Restart on reboot
pm2 startup
pm2 save
```

---

## 🌐 Domain Configuration

### For rockinrockinboogie.com

#### DNS Records (Update with your registrar)
```
Type: A
Name: @
Value: [Your server IP or CDN IP]
TTL: 3600

Type: CNAME
Name: www
Value: rockinrockinboogie.com
TTL: 3600
```

#### SSL/TLS Certificate
- **Manus**: Auto-provisioned
- **Railway/Render**: Auto-provisioned
- **Fly.io**: Auto-provisioned
- **VPS**: Use Let's Encrypt (free)

```bash
# For VPS with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d rockinrockinboogie.com
```

---

## 📊 Monitoring & Operations

### Health Check Endpoints
```bash
# Application health
curl https://rockinrockinboogie.com/api/health

# QUMUS status
curl https://rockinrockinboogie.com/api/qumus/status

# Database connection
curl https://rockinrockinboogie.com/api/db/health
```

### Logs
```bash
# Development
tail -f .manus-logs/devserver.log

# Production (varies by platform)
# Railway: https://railway.app/dashboard
# Render: https://render.com/dashboard
# Fly.io: fly logs
# VPS: journalctl -u qumus -f
```

### Monitoring Tools
- **Sentry**: Error tracking (recommended)
- **DataDog**: APM and monitoring
- **New Relic**: Performance monitoring
- **Uptime Robot**: Uptime monitoring

---

## 🔐 Security Checklist

- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled (100 req/min)
- [ ] CORS configured for production domain only
- [ ] Database SSL/TLS enabled
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] Regular backups configured

---

## 💳 Stripe Integration

### Test Mode (Development)
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

### Live Mode (Production)
1. Complete Stripe KYC verification
2. Obtain live API keys
3. Update environment variables via Manus Management UI:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Configure webhook endpoint: `https://rockinrockinboogie.com/api/stripe/webhook`
5. Test with 99% discount promo code

---

## 🎁 Sweet Miracles Donations

### Features
- ✅ Stripe payment processing
- ✅ Automatic donation recording
- ✅ Broadcast hours tracking ($50 = 1 hour)
- ✅ Owner notifications
- ✅ Subscription support
- ✅ Refund handling
- ✅ Multi-currency support (USD, EUR, GBP)

### Testing Donations
```bash
# 1. Go to https://rockinrockinboogie.com/donate
# 2. Enter donation amount
# 3. Click "Donate Now"
# 4. Use test card: 4242 4242 4242 4242
# 5. Verify donation recorded in database
# 6. Check owner notification sent
```

---

## 🚨 Troubleshooting

### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 22.13.0+

# Check port availability
lsof -i :3000

# Check environment variables
echo $DATABASE_URL
echo $JWT_SECRET

# Check database connection
pnpm db:push
```

### Database Connection Error
```bash
# Verify DATABASE_URL format
# mysql://user:password@host:3306/database

# Test connection
mysql -u user -p -h host database

# Check firewall rules
sudo ufw status
```

### Stripe Webhook Not Working
```bash
# Verify webhook endpoint is accessible
curl -X POST https://rockinrockinboogie.com/api/stripe/webhook

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET

# View webhook logs
# https://dashboard.stripe.com/webhooks
```

### High Memory Usage
```bash
# Check Node.js memory
ps aux | grep node

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" node dist/server/index.js

# Monitor memory
watch -n 1 'ps aux | grep node'
```

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_donation_date ON donations(createdAt);
CREATE INDEX idx_payment_status ON payments(status);
```

### Caching Strategy
```bash
# Enable Redis caching
REDIS_URL=redis://localhost:6379
```

### CDN Configuration
- Use CloudFlare for static assets
- Configure cache headers
- Enable gzip compression

---

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Daily database backup
0 2 * * * mysqldump -u user -p database > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 zip -r /backups/full-$(date +\%Y\%m\%d).zip /home/ubuntu/manus-agent-web
```

### Manual Backup
```bash
# Database backup
mysqldump -u user -p database > backup.sql

# Full project backup
zip -r manus-agent-web-backup.zip manus-agent-web
```

### Recovery Procedure
```bash
# Restore database
mysql -u user -p database < backup.sql

# Restore project
unzip manus-agent-web-backup.zip
cd manus-agent-web
pnpm install
pnpm build
```

---

## 📞 Support & Resources

- **Manus Help**: https://help.manus.im
- **GitHub Repository**: https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup
- **Stripe Documentation**: https://stripe.com/docs
- **Node.js Documentation**: https://nodejs.org/docs
- **Deployment Guides**: See `RRB-DEPLOYMENT-OPTIONS.md`

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (282/282)
- [ ] TypeScript errors: 0
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Stripe keys obtained
- [ ] Domain purchased/configured
- [ ] SSL certificate ready
- [ ] Backups created

### Deployment
- [ ] Choose deployment platform
- [ ] Configure environment
- [ ] Deploy application
- [ ] Configure domain/DNS
- [ ] Verify HTTPS working
- [ ] Test all features

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Performance verified
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Users notified
- [ ] Support ready

---

## 🖥️ Multi-Port Service Architecture (Mac mini)

### Port Assignments

| Port | Service | Description | URL |
|------|---------|-------------|-----|
| 3000 | Main Application | Full web app with all features | http://localhost:3000 |
| 3001 | QUMUS Control Center | Autonomous orchestration engine, 14 policies | http://localhost:3001 |
| 3002 | Rockin' Rockin' Boogie | Entertainment hub, 54 channels, AI DJs | http://localhost:3002 |
| 3003 | HybridCast Emergency | Emergency broadcast PWA, 116 feature tabs | http://localhost:3003 |
| 3004 | Ty OS | Personal operating system for Ty Bat Zan | http://localhost:3004 |

### Quick Start — All Services

```bash
# Extract and enter project
unzip canryn-production-complete.zip -d ~/canryn-production
cd ~/canryn-production

# Run the Mac mini deployment script
chmod +x mac-mini-deploy.sh
./mac-mini-deploy.sh

# Start all 4 micro-services (ports 3001-3004)
cd services && node start-all.mjs

# In a new terminal, start main app (port 3000)
cd ~/canryn-production && pnpm dev
```

### Start Individual Services

```bash
node services/qumus-3001/server.mjs      # QUMUS on :3001
node services/rrb-3002/server.mjs        # RRB on :3002
node services/hybridcast-3003/server.mjs # HybridCast on :3003
node services/ty-os-3004/server.mjs      # Ty OS on :3004
```

### Auto-Start on Mac mini Login

```bash
# Enable auto-start
launchctl load ~/Library/LaunchAgents/com.canryn.main.plist
launchctl load ~/Library/LaunchAgents/com.canryn.services.plist

# Disable auto-start
launchctl unload ~/Library/LaunchAgents/com.canryn.main.plist
launchctl unload ~/Library/LaunchAgents/com.canryn.services.plist
```

### Service Health Checks

```bash
curl http://localhost:3001/api/health  # QUMUS
curl http://localhost:3002/api/health  # RRB
curl http://localhost:3003/api/health  # HybridCast
curl http://localhost:3004/api/health  # Ty OS
curl http://localhost:3004/api/tyos/ecosystem-health  # All services
```

---

## 🎯 Next Steps

1. **Deploy to Mac mini** (run `mac-mini-deploy.sh`)
2. **Configure Environment** (set all required variables in `.env`)
3. **Start All Services** (`node services/start-all.mjs`)
4. **Configure Domain** (update DNS records)
5. **Test Features** (verify all systems working)
6. **Monitor & Optimize** (track performance via Ty OS dashboard)
7. **Notify Users** (announce launch)

---

## 📄 License & Credits

**Created by**: Canryn Production and its subsidiaries  
**Registry**: Rockin Rockin Boogie (BMI - Payten Music)  
**Platform**: Manus AI  
**Status**: Production Ready  
**Date**: March 2, 2026

---

**Ready to deploy? Choose an option from `RRB-DEPLOYMENT-OPTIONS.md` and follow the instructions!**
