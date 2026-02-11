# RRB QUMUS Ecosystem — Complete Production Installation Guide

**Canryn Production and its subsidiaries** | v3.1.0 | Feb 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Development)](#quick-start-development)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Production Deployment](#production-deployment)
6. [Mac Mini Server Setup](#mac-mini-server-setup)
7. [Nginx Reverse Proxy with SSL](#nginx-reverse-proxy-with-ssl)
8. [Process Management (PM2)](#process-management-pm2)
9. [Systemd Service (Alternative to PM2)](#systemd-service-alternative-to-pm2)
10. [Firewall Configuration](#firewall-configuration)
11. [Monitoring & Health Checks](#monitoring--health-checks)
12. [Backup & Recovery](#backup--recovery)
13. [Cross-Device Access](#cross-device-access)
14. [Stripe Production Setup](#stripe-production-setup)
15. [RSS Feed Directory Submission](#rss-feed-directory-submission)
16. [Commands Reference](#commands-reference)
17. [Project Structure](#project-structure)
18. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Minimum Version | Install Command (macOS) | Install Command (Ubuntu) |
|-------------|----------------|------------------------|-------------------------|
| Node.js | 22.x | `brew install node@22` | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| pnpm | 9.x | `npm install -g pnpm` | `npm install -g pnpm` |
| MySQL/TiDB | 8.0+ | `brew install mysql` | `sudo apt-get install mysql-server` |
| Nginx | 1.24+ | `brew install nginx` | `sudo apt-get install nginx` |
| PM2 | 5.x | `npm install -g pm2` | `npm install -g pm2` |

Verify all prerequisites:

```bash
node --version    # Should show v22.x.x
pnpm --version    # Should show 9.x.x
mysql --version   # Should show 8.0+
nginx -v          # Should show 1.24+
pm2 --version     # Should show 5.x.x
```

---

## Quick Start (Development)

```bash
# 1. Extract the project
unzip rrb-qumus-ecosystem-v3.0.0.zip -d rrb-ecosystem
cd rrb-ecosystem

# 2. Install all dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
nano .env  # Fill in all required values (see Environment Variables section)

# 4. Push database schema (creates all 145 tables)
pnpm db:push

# 5. Start development server with hot reload
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the project root. All variables are injected at runtime.

### Required Variables

```env
# ─── Database ───────────────────────────────────────────────
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# ─── Authentication ─────────────────────────────────────────
JWT_SECRET=your-secret-key-minimum-32-characters-long-random-string
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://id.manus.im

# ─── Owner Identity ────────────────────────────────────────
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Ty Bat Zan

# ─── Stripe Payments ───────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_or_sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_...

# ─── AI/LLM Services ───────────────────────────────────────
BUILT_IN_FORGE_API_URL=https://your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://your-frontend-forge-url
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
```

### Optional Variables

```env
# ─── Push Notifications ────────────────────────────────────
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# ─── LiveCallIn External Platforms ──────────────────────────
VITE_SKYPE_URL=https://join.skype.com/your-room
VITE_ZOOM_URL=https://zoom.us/j/your-meeting-id
VITE_MEET_URL=https://meet.google.com/your-room-code
VITE_DISCORD_URL=https://discord.gg/your-invite

# ─── Analytics ──────────────────────────────────────────────
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### Generate a Secure JWT Secret

```bash
openssl rand -hex 32
```

---

## Database Setup

```bash
# Push all 145 tables to the database
pnpm db:push

# For non-interactive mode:
npx drizzle-kit generate
npx drizzle-kit migrate

# Verify tables were created
mysql -u user -p -h host database -e "SHOW TABLES;" | wc -l

# Open Drizzle Studio for visual database management
npx drizzle-kit studio
```

### Promote a User to Admin

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Production Deployment

### Build for Production

```bash
# Clean build
rm -rf dist client/dist

# Build frontend (Vite) and backend (TypeScript)
pnpm build

# Verify build output
ls -la dist/        # Backend compiled files
ls -la client/dist/ # Frontend static assets
```

### Start Production Server

```bash
# Start with production environment
NODE_ENV=production pnpm start

# Or with explicit port
PORT=3000 NODE_ENV=production pnpm start
```

---

## Mac Mini Server Setup

Complete setup for running the ecosystem on a Mac Mini as a dedicated server.

### Step 1: Initial Setup

```bash
# Update macOS and install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install all prerequisites
brew install node@22 nginx
npm install -g pnpm pm2

# Create project directory
mkdir -p ~/Production
cd ~/Production

# Extract the ecosystem
unzip rrb-qumus-ecosystem-v3.0.0.zip -d rrb-ecosystem
cd rrb-ecosystem
```

### Step 2: Install and Configure

```bash
# Install dependencies
pnpm install

# Create and configure environment file
cp .env.example .env
nano .env  # Fill in all required values

# Push database schema
pnpm db:push

# Build for production
pnpm build

# Test that it starts correctly
NODE_ENV=production pnpm start
# Press Ctrl+C after confirming it works
```

### Step 3: Set Up PM2 for Auto-Restart

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Set PM2 to start on boot (macOS)
pm2 startup
# Follow the printed command (copy/paste the sudo line)

# Verify it's running
pm2 status
pm2 logs rrb-ecosystem --lines 20
```

### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /opt/homebrew/etc/nginx/servers/rrb-ecosystem.conf
```

Paste the Nginx configuration from the [Nginx section](#nginx-reverse-proxy-with-ssl) below.

```bash
# Test and reload Nginx
sudo nginx -t
sudo brew services restart nginx
```

### Step 5: Find Your Mac Mini's IP

```bash
ipconfig getifaddr en0
# Example output: 192.168.1.100
```

Access from any device on the network: `http://192.168.1.100`

---

## Nginx Reverse Proxy with SSL

### Without SSL (Local Network Only)

```nginx
# /etc/nginx/sites-available/rrb-ecosystem (Ubuntu)
# /opt/homebrew/etc/nginx/servers/rrb-ecosystem.conf (macOS)

server {
    listen 80;
    server_name your-domain.com localhost;

    # Increase upload size for audio/video files
    client_max_body_size 100M;

    # Proxy all traffic to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # WebSocket support for real-time features
        proxy_read_timeout 86400;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### With SSL (Production Domain)

```bash
# Install Certbot for free SSL certificates
# Ubuntu:
sudo apt-get install certbot python3-certbot-nginx
# macOS:
brew install certbot

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (runs twice daily)
sudo certbot renew --dry-run
```

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}
```

Enable the site (Ubuntu):

```bash
sudo ln -s /etc/nginx/sites-available/rrb-ecosystem /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Process Management (PM2)

### PM2 Ecosystem Config

The project includes `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'rrb-ecosystem',
    script: 'pnpm',
    args: 'start',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### PM2 Commands

```bash
pm2 start ecosystem.config.cjs   # Start the ecosystem
pm2 status                       # View status
pm2 logs rrb-ecosystem           # View logs (real-time)
pm2 logs rrb-ecosystem --lines 100  # View last 100 lines
pm2 restart rrb-ecosystem        # Restart after code changes
pm2 reload rrb-ecosystem         # Zero-downtime restart
pm2 stop rrb-ecosystem           # Stop the server
pm2 delete rrb-ecosystem         # Remove from PM2
pm2 monit                        # Real-time CPU/Memory monitor
pm2 save                         # Persist process list across reboots
pm2 startup                      # Auto-start on boot (run printed sudo command)
pm2 update                       # Update PM2 itself
```

---

## Systemd Service (Alternative to PM2)

For Ubuntu/Linux servers:

```bash
sudo nano /etc/systemd/system/rrb-ecosystem.service
```

```ini
[Unit]
Description=RRB QUMUS Ecosystem - Canryn Production
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Production/rrb-ecosystem
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rrb-ecosystem
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/home/ubuntu/Production/rrb-ecosystem/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable rrb-ecosystem
sudo systemctl start rrb-ecosystem
sudo systemctl status rrb-ecosystem
sudo journalctl -u rrb-ecosystem -f   # View logs
```

---

## Firewall Configuration

### Ubuntu (UFW)

```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH (don't lock yourself out)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct Node.js access (Nginx handles traffic)
sudo ufw status verbose
```

### macOS

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /opt/homebrew/bin/nginx
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /opt/homebrew/bin/nginx
```

---

## Monitoring & Health Checks

### Built-in QUMUS Monitoring

Navigate to `/qumus-monitoring` for real-time tabs: Policies, Services, HybridCast, Metrics.

### Simple Health Check Script

Create `healthcheck.sh`:

```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$RESPONSE" != "200" ]; then
    echo "$(date): Health check FAILED (HTTP $RESPONSE)" >> /var/log/rrb-health.log
    pm2 restart rrb-ecosystem
    echo "$(date): Server restarted" >> /var/log/rrb-health.log
else
    echo "$(date): Health check OK" >> /var/log/rrb-health.log
fi
```

```bash
chmod +x healthcheck.sh
# Run every 5 minutes via cron
crontab -e
# Add: */5 * * * * /home/ubuntu/Production/rrb-ecosystem/healthcheck.sh
```

---

## Backup & Recovery

### Database Backup

```bash
# Manual backup
mysqldump -u user -p -h host database > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
mysqldump -u user -p -h host database | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
mysql -u user -p -h host database < backup_20260211_120000.sql
```

### Automated Daily Backup

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u user -p'password' -h host database > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
echo "$(date): Backup completed" >> /var/log/rrb-backup.log
```

```bash
chmod +x backup.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/Production/rrb-ecosystem/backup.sh
```

### Code Backup

```bash
tar -czf rrb-code-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules --exclude=dist --exclude=client/dist \
  -C /home/ubuntu/Production rrb-ecosystem
```

---

## Cross-Device Access

All data is stored server-side in the database and S3 cloud storage. Login on any device for the same state.

| Data Type | Storage | Sync Method |
|-----------|---------|-------------|
| User preferences, playlists | Database (TiDB) | Instant via API |
| Audio files, documents, images | S3 CDN | Direct URL access |
| Commercial scripts, schedules | Database | Instant via API |
| QUMUS decisions, audit logs | Database | Instant via API |
| Session authentication | JWT cookie | OAuth via Manus |
| Podcast markers, segments, notes | Database + S3 manifest | Instant via API |

### Access from iPhone/iPad/Other Devices

1. Open Safari or Chrome
2. Navigate to `http://your-mac-mini-ip:3000` (local) or `https://your-domain.com` (public)
3. Log in with your Manus account
4. All data, uploads, settings, and state are immediately available

### Add to Home Screen (PWA)

- **iOS Safari**: Share → Add to Home Screen
- **Android Chrome**: Menu → Add to Home Screen

---

## Stripe Production Setup

### Test Mode (Sandbox)

1. Navigate to Settings → Payment on the deployed site
2. Claim your Stripe sandbox
3. Generate a test promo code
4. Test with card: `4242 4242 4242 4242`, any future expiry, any CVC

### Go Live

1. Complete Stripe KYC verification at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Enter live keys in Settings → Payment
3. Webhook at `/api/stripe/webhook` is already configured for production
4. Test with 99% discount promo code (minimum $0.50 USD)

---

## RSS Feed Directory Submission

After deployment, submit your RSS feeds to directories:

| Feed | URL | Submit To |
|------|-----|-----------|
| Podcast | `https://your-domain.com/api/rss/podcast` | [Apple Podcasts Connect](https://podcastsconnect.apple.com), [Spotify for Podcasters](https://podcasters.spotify.com) |
| News | `https://your-domain.com/api/rss/news` | [Feedly](https://feedly.com), [Google News Publisher Center](https://publishercenter.google.com) |
| Radio | `https://your-domain.com/api/rss/radio` | [TuneIn](https://tunein.com/broadcasters), [Radio.net](https://www.radio.net) |
| OPML (All) | `https://your-domain.com/api/rss/opml` | Any RSS reader (import all feeds at once) |

User-friendly subscription page at `/rss` with copy-to-clipboard URLs and directory submission buttons.

---

## Commands Reference

### Development

```bash
pnpm dev              # Start dev server with hot reload (port 3000)
pnpm dev:server       # Start only backend
pnpm dev:client       # Start only frontend (Vite)
```

### Database

```bash
pnpm db:push          # Push schema changes (generate + migrate)
npx drizzle-kit generate   # Generate migration files only
npx drizzle-kit migrate    # Run pending migrations
npx drizzle-kit studio     # Open visual database GUI
```

### Testing

```bash
pnpm test                              # Run all 92 test files
npx vitest run server/media-flow.test.ts   # Run specific test
npx vitest                             # Watch mode
npx vitest run --coverage              # With coverage report
```

### Production

```bash
pnpm build            # Build frontend + backend for production
pnpm start            # Start production server
pnpm build && pnpm start  # Build and start in one command
```

### PM2

```bash
pm2 start ecosystem.config.cjs   # Start with PM2
pm2 status                       # Check status
pm2 logs rrb-ecosystem           # View logs
pm2 restart rrb-ecosystem        # Restart
pm2 reload rrb-ecosystem         # Zero-downtime restart
pm2 monit                        # Real-time monitoring
pm2 save                         # Persist process list
pm2 startup                      # Auto-start on boot
```

---

## Project Structure

```
rrb-ecosystem/
├── client/                     # Frontend (React 19 + Tailwind 4 + shadcn/ui)
│   ├── src/
│   │   ├── pages/              # 184 page components
│   │   ├── components/         # 276 reusable components
│   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   └── rrb/            # RRB-specific components
│   │   ├── contexts/           # Auth, Audio, Theme contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # tRPC client, utilities
│   │   └── App.tsx             # Routes & layout (182 routes)
│   └── index.html              # Entry point with RSS auto-discovery tags
├── server/                     # Backend (Express 4 + tRPC 11)
│   ├── routers/                # 170 tRPC routers
│   ├── routerChunks/           # Router chunks (TS compiler optimization)
│   ├── services/               # 74 service classes
│   ├── webhooks/               # Stripe webhook handler
│   ├── _core/                  # Framework plumbing (do not edit)
│   ├── db.ts                   # Database query helpers
│   ├── routers.ts              # Main router assembly
│   ├── storage.ts              # S3 helpers (storagePut/storageGet)
│   └── rss-feeds.ts            # RSS feed endpoints
├── drizzle/                    # Database (Drizzle ORM)
│   └── schema.ts               # 150 tables
├── shared/                     # Shared types and constants
├── ecosystem.config.cjs        # PM2 configuration
├── INSTALL.md                  # This file
└── package.json                # Dependencies and scripts
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection fails | Ensure `DATABASE_URL` includes `?ssl={"rejectUnauthorized":true}` for TiDB |
| Stripe webhook returns 400 | Verify `/api/stripe/webhook` is registered with `express.raw()` BEFORE `express.json()` |
| Audio won't play on mobile | iOS requires user interaction before playback. Platform includes auto-unlock on first touch. |
| Files not persisting | All uploads must use S3 (`storagePut`). Local filesystem is ephemeral. |
| `pnpm db:push` hangs | Use `npx drizzle-kit generate && npx drizzle-kit migrate` instead |
| PM2 won't auto-start | Run `pm2 startup`, copy the printed sudo command, then `pm2 save` |
| Nginx 502 Bad Gateway | Check Node.js is running: `pm2 status`. Verify port matches Nginx config. |
| WebSocket disconnects | Add `proxy_read_timeout 86400;` to Nginx location block |
| High memory usage | Set `max_memory_restart: '1G'` in PM2 config. Monitor with `pm2 monit`. |
| Voice commands not working | Ensure HTTPS is enabled (required for Web Speech API). Check browser compatibility. |
| Accessibility panel not showing | Clear localStorage and reload. Panel is fixed bottom-right on all pages. |

---

**Produced by Canryn Production and its subsidiaries**
Supporting the Sweet Miracles Foundation — a 501(c)(3) / 508(c) nonprofit.
"A Voice for the Voiceless." All content is for historical preservation and educational purposes.
