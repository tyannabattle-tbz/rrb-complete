# Manus Agent Web - Complete Mac Mini Deployment Guide

**Canryn Production and its Subsidiaries**

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Quick Installation](#quick-installation)
4. [Manual Installation](#manual-installation)
5. [Features & Access](#features--access)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Auto-Start Setup](#auto-start-setup)
9. [Monitoring & Logs](#monitoring--logs)
10. [Troubleshooting](#troubleshooting)
11. [Advanced Configuration](#advanced-configuration)

---

## Overview

The Manus Agent Web platform is a comprehensive ecosystem featuring:

### Core Dashboards
- **RRB Broadcast Monitoring**: Real-time broadcast analytics and viewer tracking
- **Content Recommendation Engine**: Personalized content suggestions with AI
- **Sweet Miracles Impact Dashboard**: Fundraising and beneficiary tracking

### Drone Infrastructure
- **Drone CI/CD Pipeline**: Automated testing and deployment
- **Drone Logistics Tracker**: Real-time fleet management and tracking
- **Drone Video Capture**: HybridCast integration for streaming

### Advanced Features
- **Military-Grade Map Arsenal**: Tactical mapping with real-time asset tracking
- **Qumus AI Orchestration**: Autonomous decision-making system
- **Full-Stack Integration**: All systems work together seamlessly

---

## System Requirements

### Hardware
- **Mac Mini**: M1/M2/M3 (Apple Silicon) or Intel Core i5+
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 50GB free space
- **Network**: Stable internet connection

### Software
- **macOS**: 12.0 or later
- **Homebrew**: Package manager
- **Node.js**: 22.13.0 (installed via Homebrew)
- **pnpm**: 10.4.1 (installed via npm)

---

## Quick Installation

### Automated Setup (Recommended)

```bash
# 1. Download or clone the project
cd ~/Downloads
git clone <repository-url> manus-agent-web
cd manus-agent-web

# 2. Make installation script executable
chmod +x install-mac-mini.sh

# 3. Run installation (development mode)
./install-mac-mini.sh

# OR for production
./install-mac-mini.sh --prod
```

The script will:
- ✅ Check and install Homebrew
- ✅ Install Node.js and pnpm
- ✅ Install all project dependencies
- ✅ Create environment configuration
- ✅ Set up database (production mode)
- ✅ Create launch scripts

---

## Manual Installation

### Step 1: Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js and pnpm

```bash
# Install Node.js
brew install node

# Install pnpm globally
npm install -g pnpm

# Verify installations
node --version  # Should be v22.13.0 or later
pnpm --version  # Should be v10.4.1 or later
```

### Step 3: Clone/Download Project

```bash
# Clone from GitHub
git clone <repository-url> manus-agent-web
cd manus-agent-web

# Or extract from zip
unzip manus-agent-web.zip
cd manus-agent-web
```

### Step 4: Install Dependencies

```bash
pnpm install
```

### Step 5: Configure Environment

```bash
# Create environment file
cp .env.example .env.local

# Edit with your settings
nano .env.local
```

**Required Environment Variables:**

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/manus_agent_web"

# Authentication
JWT_SECRET="your-secure-random-string-here"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Application
VITE_APP_ID="your-app-id"
VITE_APP_TITLE="Manus Agent Web"
VITE_APP_LOGO="https://example.com/logo.png"

# Stripe (if using payments)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Forge API
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-key"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Owner Information
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-open-id"

# Server
NODE_ENV="development"
PORT=3000
```

### Step 6: Setup Database

```bash
# For MySQL via Homebrew
brew install mysql
brew services start mysql

# Create database
mysql -u root -e "CREATE DATABASE manus_agent_web;"

# Run migrations
pnpm db:push
```

---

## Features & Access

### RRB Broadcast Monitoring Dashboard
**URL**: `http://localhost:3000/broadcast-monitoring`

Features:
- Live viewer count and metrics
- Stream quality monitoring
- Audience engagement analytics
- Geographic distribution
- Device type analytics
- Health status indicators

### Content Recommendation Engine
**URL**: `http://localhost:3000/recommendations`

Features:
- Personalized recommendations
- Trending content detection
- Category filtering
- Playlist generation
- Quality metrics
- Engagement tracking

### Sweet Miracles Impact Dashboard
**URL**: `http://localhost:3000/impact-dashboard`

Features:
- Funds raised tracking
- Beneficiary management
- Campaign progress
- Impact scoring
- Fundraising trends
- Story management

### Drone Logistics Tracker
**URL**: `http://localhost:3000/drone-logistics`

Features:
- Real-time GPS tracking
- Fleet management
- Route optimization
- Delivery status
- Military-grade encryption
- Performance metrics

### Drone Video Capture
**URL**: `http://localhost:3000/drone-video`

Features:
- HybridCast integration
- Adaptive bitrate streaming
- Network monitoring
- Quality adjustment
- Real-time encoding

### Military-Grade Map Arsenal
**URL**: `http://localhost:3000/map-arsenal`

Features:
- Tactical mapping (Leaflet)
- Asset positioning
- Route visualization
- Infrastructure mapping
- Threat tracking
- Full-screen mode
- Layer management
- Export (PDF, image)

---

## Configuration

### Database Setup Options

#### Option 1: MySQL via Homebrew (Recommended)

```bash
# Install and start MySQL
brew install mysql
brew services start mysql

# Create database
mysql -u root -e "CREATE DATABASE manus_agent_web;"

# Update .env.local
DATABASE_URL="mysql://root@localhost:3306/manus_agent_web"

# Run migrations
pnpm db:push
```

#### Option 2: Docker

```bash
# Install Docker Desktop
brew install docker

# Run MySQL container
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=manus_agent_web \
  -p 3306:3306 \
  mysql:8.0

# Update .env.local
DATABASE_URL="mysql://root:password@localhost:3306/manus_agent_web"

# Run migrations
pnpm db:push
```

### Stripe Configuration (Optional)

1. Get LIVE keys from Stripe Dashboard
2. Update `.env.local`:
   ```env
   STRIPE_SECRET_KEY="sk_live_..."
   VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
3. Test with card: `4242 4242 4242 4242`

### Drone CI/CD Configuration

Edit `.drone.yml` to customize:
- Build stages
- Testing parameters
- Deployment targets
- Security scanning rules

---

## Running the Application

### Development Mode

```bash
# Using launch script
./launch-dev.sh

# Or directly with pnpm
pnpm dev
```

Features:
- ✅ Hot reload on file changes
- ✅ Development tools enabled
- ✅ Detailed error messages
- ✅ Source maps for debugging

Access: `http://localhost:3000`

### Production Mode

```bash
# Build for production
pnpm build

# Start production server
./launch-prod.sh

# Or directly
NODE_ENV=production pnpm start
```

Features:
- ✅ Optimized bundle size
- ✅ Security hardening
- ✅ Performance optimizations
- ✅ Error logging

---

## Auto-Start Setup

### Using LaunchAgent

Create `~/Library/LaunchAgents/com.manus.agent.plist`:

```bash
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.manus.agent.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.manus.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/YOUR_USERNAME/manus-agent-web/launch-prod.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USERNAME/manus-agent-web/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USERNAME/manus-agent-web/logs/stderr.log</string>
</dict>
</plist>
EOF
```

Replace `YOUR_USERNAME` with your actual macOS username.

### Enable Auto-Start

```bash
# Load the service
launchctl load ~/Library/LaunchAgents/com.manus.agent.plist

# Verify it's loaded
launchctl list | grep manus

# Check status
launchctl list com.manus.agent
```

### Disable Auto-Start

```bash
launchctl unload ~/Library/LaunchAgents/com.manus.agent.plist
```

---

## Monitoring & Logs

### View Development Logs

```bash
# In terminal where server is running
./launch-dev.sh

# Or tail logs
tail -f logs/server.log
```

### View Production Logs

```bash
# Real-time logs
tail -f logs/server.log

# Last 100 lines
tail -100 logs/server.log

# Search for errors
grep ERROR logs/server.log
```

### System Monitoring

```bash
# Monitor Node.js process
top -p $(pgrep -f "pnpm start")

# Check port usage
lsof -i :3000

# Network connections
netstat -an | grep 3000
```

### Application Monitoring

Access built-in monitoring dashboards:
- **System Health**: `/monitoring`
- **Performance Metrics**: `/dashboard`
- **Error Logs**: Check `.manus-logs/` directory

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 ./launch-prod.sh
```

### Database Connection Error

```bash
# Check MySQL status
brew services list | grep mysql

# Restart MySQL
brew services restart mysql

# Verify connection
mysql -u root -h localhost
```

### Node Modules Issues

```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean build
rm -rf dist
pnpm build

# Check TypeScript
pnpm type-check

# Check for errors
pnpm lint
```

### Memory Issues

```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# Monitor memory usage
node --expose-gc
```

### Permissions Error

```bash
# Fix script permissions
chmod +x launch-dev.sh launch-prod.sh install-mac-mini.sh

# Fix directory permissions
sudo chown -R $(whoami) manus-agent-web/
```

---

## Advanced Configuration

### Reverse Proxy with nginx

```bash
# Install nginx
brew install nginx

# Create configuration
sudo nano /usr/local/etc/nginx/nginx.conf
```

Add to `http` block:

```nginx
upstream manus_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://manus_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start nginx:
```bash
brew services start nginx
```

### SSL/TLS with Let's Encrypt

```bash
# Install certbot
brew install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration with SSL
```

### Custom Domain Setup

1. Update DNS records to point to Mac Mini's IP
2. Configure nginx with your domain
3. Set up SSL certificate
4. Update `VITE_APP_URL` in `.env.local`

### Performance Tuning

```bash
# Enable compression
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# Use clustering (if available)
# See server configuration for multi-process setup
```

---

## Backup & Recovery

### Backup Database

```bash
# MySQL dump
mysqldump -u root manus_agent_web > backup.sql

# Compressed backup
mysqldump -u root manus_agent_web | gzip > backup.sql.gz
```

### Restore Database

```bash
# From SQL file
mysql -u root manus_agent_web < backup.sql

# From compressed file
gunzip < backup.sql.gz | mysql -u root manus_agent_web
```

### Backup Application

```bash
# Create backup
tar -czf manus-agent-web-backup.tar.gz manus-agent-web/

# Restore backup
tar -xzf manus-agent-web-backup.tar.gz
```

---

## Security Best Practices

1. **Never commit secrets**: Keep `.env.local` out of version control
2. **Use strong JWT secret**: Generate with `openssl rand -base64 32`
3. **Database security**: Use strong passwords, restrict access
4. **Firewall**: Configure Mac firewall to restrict port access
5. **Updates**: Keep Node.js and dependencies current
6. **HTTPS**: Use SSL/TLS in production
7. **Backups**: Regular automated backups
8. **Monitoring**: Check logs regularly for suspicious activity

---

## Support & Resources

- **Documentation**: See README.md
- **Issues**: Report on GitHub Issues
- **Support**: Contact Manus at https://help.manus.im
- **Community**: Join Canryn community forums

---

## Version Information

- **Application Version**: 1.0.0
- **Node.js**: 22.13.0
- **pnpm**: 10.4.1
- **Last Updated**: February 2026
- **Status**: Production Ready

---

**Canryn Production and its Subsidiaries**

*A Voice for the Voiceless - Sweet Miracles*
