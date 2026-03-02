# Manus Agent Web - Deployment Options Guide

**Project**: Qumus Autonomous Orchestration Platform  
**Domain**: rockinrockinboogie.com  
**Status**: Production Ready  
**Checkpoint**: c147b826  
**Features**: Stripe Integration, Sweet Miracles Donations, QUMUS Orchestration

---

## Overview

This guide provides **5 deployment options** for the Manus Agent Web project. Choose the option that best fits your infrastructure needs, budget, and operational requirements.

| Option | Setup Time | Monthly Cost | Complexity | Best For |
|--------|-----------|-------------|-----------|----------|
| **1. Manus (Recommended)** | Once fixed | $0 | Low | Production-ready, built-in hosting |
| **2. Railway** | 15 min | $10-15 | Low | Quick setup, easy scaling |
| **3. Render** | 15 min | $10-15 | Low | Good alternative to Railway |
| **4. Fly.io** | 20 min | $5-10 | Medium | Advanced features, global deployment |
| **5. Your Own VPS** | 60 min | $5-20 | High | Full control, maximum flexibility |

---

## Option 1: Manus Platform (Recommended - Once Fixed)

### Status
- ✅ Code is production-ready
- ✅ All features working
- ✅ Branding correct (RRB Legacy)
- ✅ SEO optimized
- ❌ **Manus infrastructure broken** (Node.js memory issues)

### What You Need
- Manus account (already have)
- Custom domain: rockinrockinboogie.com
- 2-5 minutes deployment time

### Deployment Steps

1. **Create Checkpoint** (Already done: `c147b826`)
   ```bash
   # Latest checkpoint ready
   ```

2. **Configure Domain** (Manus Management UI → Settings → Domains)
   - Option A: Use auto-generated domain
   - Option B: Purchase new domain through Manus
   - Option C: Bind existing domain (rockinrockinboogie.com)

3. **Set Production Variables** (Settings → Secrets)
   ```
   VITE_APP_TITLE=Qumus - Offline. Autonomous. Yours.
   VITE_APP_LOGO=https://your-cdn/logo.png
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Publish to Production**
   - Go to Dashboard
   - Find checkpoint `c147b826`
   - Click "Publish" button
   - Wait 2-5 minutes

5. **Verify Deployment**
   - [ ] Site loads at rockinrockinboogie.com
   - [ ] HTTPS is working
   - [ ] All features accessible
   - [ ] Stripe payments working
   - [ ] Sweet Miracles donations functional

### Advantages
- ✅ No infrastructure management
- ✅ Automatic SSL/TLS
- ✅ Built-in monitoring
- ✅ One-click rollback
- ✅ Automatic backups
- ✅ Custom domain support

### Disadvantages
- ❌ Currently has infrastructure issues (being fixed)
- ⚠️ Limited customization

### Timeline
- **Once Manus fixes infrastructure**: 2-5 minutes
- **Current Status**: Waiting for Manus engineering escalation

### Cost
- **$0** (included with Manus)

---

## Option 2: Railway (Easiest Alternative)

### Setup Time: 15 minutes
### Monthly Cost: $10-15

### What You Need
- Railway account (free to create)
- GitHub repository with code
- Custom domain (rockinrockinboogie.com)

### Deployment Steps

1. **Create GitHub Repository**
   ```bash
   # Already created at:
   # https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup
   ```

2. **Connect to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize Railway to access your GitHub
   - Select the rockin-rockin-boogie-backup repository

3. **Configure Environment Variables**
   ```
   DATABASE_URL=mysql://user:pass@host/db
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-oauth-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Configure Domain**
   - In Railway dashboard, go to "Settings"
   - Add custom domain: rockinrockinboogie.com
   - Update DNS records (Railway will provide)
   - Wait for DNS propagation

5. **Deploy**
   - Railway automatically deploys on git push
   - Monitor deployment logs
   - Verify application is running

### Advantages
- ✅ Simple setup (15 minutes)
- ✅ GitHub integration (auto-deploy on push)
- ✅ Good free tier
- ✅ Affordable ($10-15/month)
- ✅ Good support
- ✅ Easy scaling

### Disadvantages
- ⚠️ Less customization than VPS
- ⚠️ Vendor lock-in
- ⚠️ Limited to Railway's infrastructure

### Pricing
- **Starter**: $5/month (limited)
- **Pro**: $10-15/month (recommended)
- **Enterprise**: Custom pricing

### Documentation
- https://docs.railway.app

---

## Option 3: Render (Good Alternative)

### Setup Time: 15 minutes
### Monthly Cost: $10-15

### What You Need
- Render account (free to create)
- GitHub repository
- Custom domain (rockinrockinboogie.com)

### Deployment Steps

1. **Connect GitHub Repository**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub account
   - Select rockin-rockin-boogie-backup repository

2. **Configure Build Settings**
   ```
   Build Command: pnpm install && pnpm build
   Start Command: node dist/server/index.js
   ```

3. **Set Environment Variables**
   ```
   DATABASE_URL=mysql://user:pass@host/db
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-oauth-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Configure Custom Domain**
   - In Render dashboard, go to "Settings"
   - Add custom domain: rockinrockinboogie.com
   - Update DNS records
   - Wait for SSL certificate provisioning

5. **Deploy**
   - Render automatically deploys on git push
   - Monitor build logs
   - Verify application is running

### Advantages
- ✅ Simple setup (15 minutes)
- ✅ Auto-deploy from GitHub
- ✅ Affordable ($10-15/month)
- ✅ Good performance
- ✅ Free SSL certificates
- ✅ Good documentation

### Disadvantages
- ⚠️ Slightly slower than Railway
- ⚠️ Limited free tier
- ⚠️ Vendor lock-in

### Pricing
- **Free**: Limited (good for testing)
- **Starter**: $7/month
- **Pro**: $12/month (recommended)

### Documentation
- https://render.com/docs

---

## Option 4: Fly.io (Advanced - Global Deployment)

### Setup Time: 20 minutes
### Monthly Cost: $5-10

### What You Need
- Fly.io account
- Fly CLI installed
- Custom domain (rockinrockinboogie.com)

### Deployment Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```

2. **Create Fly App**
   ```bash
   cd /home/ubuntu/manus-agent-web
   fly launch --name qumus-rockinboogie
   ```

3. **Configure Fly Configuration** (`fly.toml`)
   ```toml
   app = "qumus-rockinboogie"
   
   [build]
     builder = "heroku"
   
   [env]
     DATABASE_URL = "mysql://..."
     JWT_SECRET = "your-secret"
     VITE_APP_ID = "your-id"
   
   [[services]]
     protocol = "tcp"
     internal_port = 3000
     ports = [{ handlers = ["http"], port = 80 }, { handlers = ["tls", "http"], port = 443 }]
   ```

4. **Set Secrets**
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_live_...
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Configure Domain**
   ```bash
   fly certs create rockinrockinboogie.com
   # Update DNS records as instructed
   ```

### Advantages
- ✅ Global deployment (multiple regions)
- ✅ Affordable ($5-10/month)
- ✅ Excellent performance
- ✅ Advanced features (load balancing, auto-scaling)
- ✅ Good for production
- ✅ CLI-based (scriptable)

### Disadvantages
- ⚠️ Steeper learning curve
- ⚠️ Requires CLI knowledge
- ⚠️ Less beginner-friendly

### Pricing
- **Free**: $3/month credit (good for testing)
- **Pay-as-you-go**: $0.15/GB RAM, $0.02/GB storage
- **Typical app**: $5-10/month

### Documentation
- https://fly.io/docs

---

## Option 5: Your Own VPS (Full Control)

### Setup Time: 60 minutes
### Monthly Cost: $5-20

### What You Need
- VPS provider (DigitalOcean, Linode, AWS, etc.)
- SSH access to server
- Domain (rockinrockinboogie.com)
- Basic Linux knowledge

### Deployment Steps

1. **Create VPS**
   - DigitalOcean: $5-20/month
   - Linode: $5-20/month
   - AWS EC2: $5-20/month
   - Choose Ubuntu 22.04 LTS

2. **Install Dependencies**
   ```bash
   sudo apt update && sudo apt upgrade
   sudo apt install -y nodejs npm git curl wget
   sudo npm install -g pnpm
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup.git
   cd rockin-rockin-boogie-backup
   ```

4. **Install Dependencies**
   ```bash
   pnpm install
   ```

5. **Configure Environment**
   ```bash
   cat > .env.production << EOF
   DATABASE_URL=mysql://user:pass@host/db
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-oauth-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   EOF
   ```

6. **Build Application**
   ```bash
   pnpm build
   ```

7. **Setup Process Manager** (PM2)
   ```bash
   sudo npm install -g pm2
   pm2 start "node dist/server/index.js" --name qumus
   pm2 startup
   pm2 save
   ```

8. **Configure Nginx Reverse Proxy**
   ```bash
   sudo apt install -y nginx
   sudo tee /etc/nginx/sites-available/qumus << EOF
   server {
       listen 80;
       server_name rockinrockinboogie.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   sudo ln -s /etc/nginx/sites-available/qumus /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL Certificate** (Let's Encrypt)
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d rockinrockinboogie.com
   ```

10. **Configure Domain**
    - Update DNS A record to VPS IP address
    - Wait for DNS propagation

### Advantages
- ✅ Full control over infrastructure
- ✅ Maximum customization
- ✅ Can optimize for specific needs
- ✅ Affordable ($5-20/month)
- ✅ Good for learning
- ✅ No vendor lock-in

### Disadvantages
- ❌ Requires Linux knowledge
- ❌ You manage all updates and security
- ❌ More complex setup
- ❌ Requires ongoing maintenance
- ❌ No automatic scaling

### VPS Providers
- **DigitalOcean**: https://www.digitalocean.com ($5/month)
- **Linode**: https://www.linode.com ($5/month)
- **AWS EC2**: https://aws.amazon.com (varies)
- **Vultr**: https://www.vultr.com ($2.50/month)

### Maintenance Tasks
- [ ] Regular security updates
- [ ] Database backups
- [ ] Log rotation
- [ ] Monitoring and alerting
- [ ] SSL certificate renewal

---

## Comparison Matrix

| Feature | Manus | Railway | Render | Fly.io | VPS |
|---------|-------|---------|--------|--------|-----|
| Setup Time | 5 min | 15 min | 15 min | 20 min | 60 min |
| Monthly Cost | $0 | $10-15 | $10-15 | $5-10 | $5-20 |
| Complexity | Low | Low | Low | Medium | High |
| Auto-deploy | ✅ | ✅ | ✅ | ✅ | ❌ |
| Custom Domain | ✅ | ✅ | ✅ | ✅ | ✅ |
| SSL/TLS | ✅ | ✅ | ✅ | ✅ | ✅ |
| Monitoring | ✅ | ✅ | ✅ | ✅ | ❌ |
| Scaling | Auto | Easy | Easy | Easy | Manual |
| Support | Excellent | Good | Good | Good | Community |
| Global CDN | ✅ | ❌ | ❌ | ✅ | ❌ |
| Vendor Lock-in | High | Medium | Medium | Low | None |

---

## Recommendation

### For Production (rockinrockinboogie.com)

**Primary**: **Manus Platform** (once infrastructure is fixed)
- Zero cost
- Built-in everything
- Best support
- One-click rollback

**Fallback**: **Railway** (if Manus takes too long)
- 15-minute setup
- $10-15/month
- Reliable and proven
- Good for production

**Alternative**: **Fly.io** (for global deployment)
- $5-10/month
- Global infrastructure
- Excellent performance
- Advanced features

---

## Next Steps

### Immediate (Today)
1. ✅ Stripe integration verified
2. ✅ Sweet Miracles donations working
3. ✅ GitHub backup created
4. ✅ ZIP backup ready
5. ⏳ Choose deployment option

### Short-term (This Week)
1. Deploy to chosen platform
2. Configure custom domain
3. Test all features
4. Set up monitoring
5. Notify users of launch

### Medium-term (This Month)
1. Monitor performance
2. Gather user feedback
3. Optimize based on usage
4. Plan scaling strategy
5. Set up automated backups

---

## Support & Resources

- **Manus Help**: https://help.manus.im
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Fly.io Docs**: https://fly.io/docs
- **GitHub Backup**: https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup

---

## Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Code | ✅ Production Ready | All features working |
| Tests | ✅ 25/25 Passing | Stripe integration verified |
| Stripe | ✅ Configured | Webhooks wired, checkout ready |
| Sweet Miracles | ✅ Integrated | Donations tracked, owner notified |
| GitHub | ✅ Synced | Private repository ready |
| ZIP Backup | ✅ Created | 53 MB, ready for download |
| Domain | ⏳ Pending | rockinrockinboogie.com |
| Deployment | ⏳ Pending | Choose option above |

---

**Created**: March 2, 2026  
**Platform**: Canryn Production  
**Registry**: Rockin Rockin Boogie (BMI - Payten Music)  
**Status**: Ready for Deployment
