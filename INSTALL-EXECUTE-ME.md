# RRB QUMUS Ecosystem v3.1.0 — Install & Execute

**A Canryn Production and its subsidiaries**
**QUMUS Autonomous Orchestration Engine v11.0**

---

## What Is This?

This is the complete **Rockin' Rockin' Boogie (RRB) QUMUS Autonomous Ecosystem** — a production-ready platform with 184 pages, 170 tRPC routers, 150 database tables, and 100+ test files. It runs as a unified web application powered by the QUMUS brain operating at 90% autonomy with 10% human override.

---

## Quick Start (5 Minutes)

### Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 22.x | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| MySQL or TiDB | 8.0+ | `mysql --version` |

If you do not have pnpm installed:

```bash
npm install -g pnpm
```

### Step 1: Extract and Install

```bash
# Extract the archive
unzip rrb-qumus-ecosystem-v3.1.0.zip -d rrb-ecosystem
cd rrb-ecosystem

# Install all dependencies (this takes 1-3 minutes)
pnpm install
```

### Step 2: Configure Environment

```bash
# Copy the environment template
cp .env.example .env
```

Open `.env` in your editor and fill in the required values:

```env
# REQUIRED — Database connection
DATABASE_URL=mysql://user:password@host:port/database_name

# REQUIRED — Session security (generate a random 64-char string)
JWT_SECRET=your-random-64-character-secret-key-here

# OPTIONAL — Stripe payments (skip if not using payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OPTIONAL — S3 storage (skip if using local storage for dev)
S3_ACCESS_KEY_ID=your-s3-key
S3_SECRET_ACCESS_KEY=your-s3-secret
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1

# OPTIONAL — OAuth (skip if not using Manus auth)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
```

To generate a secure JWT_SECRET:

```bash
openssl rand -hex 32
```

### Step 3: Create Database Tables

```bash
# Push all 150 tables to your database
pnpm db:push
```

If this hangs, use the manual approach:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Step 4: Start the Application

```bash
# Development mode (with hot reload)
pnpm dev

# OR Production mode
pnpm build && pnpm start
```

Visit **http://localhost:3000** in your browser.

---

## What You Should See

After starting, you will see the RRB landing page with:

- A spinning vinyl record in the upper-left corner
- "Rockin' Rockin' Boogie" hero section
- Navigation to all 5 platforms (RRB, HybridCast, Sweet Miracles, Solbones, Canryn)
- Bottom navigation bar (Home, Dashboard, Chat, Search, Settings)
- Accessibility gear icon in the bottom-right corner
- Global audio player at the bottom

---

## Production Deployment

### Option A: PM2 (Recommended for VPS / Mac Mini)

```bash
# Build the application
pnpm build

# Start with PM2 process manager
npm install -g pm2
pm2 start ecosystem.config.cjs

# Enable auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Option B: Nginx Reverse Proxy + SSL

```bash
# Install Nginx
sudo apt install nginx

# Create site config
sudo nano /etc/nginx/sites-available/your-domain
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Add SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option C: Manus Hosting

If you built this on Manus, click the **Publish** button in the Management UI. Your site deploys automatically with SSL, CDN, and auto-scaling.

---

## Run Tests

```bash
# Run all tests
npx vitest run

# Run a specific test file
npx vitest run server/royaltyTracker.test.ts

# Run tests in watch mode
npx vitest
```

---

## Customize for Your Brand

See **CUSTOMIZE.md** for the complete white-label deployment guide. It covers:

1. Brand identity replacement (title, logo, hero, credits)
2. Theme and color palette customization
3. Module enable/disable (each module is self-contained)
4. QUMUS brain configuration (policies, bots, autonomy levels)
5. Database customization
6. Payment setup
7. Voice and accessibility configuration
8. Production deployment options

---

## File Structure

```
├── client/                  # Frontend (React 19 + Tailwind 4)
│   ├── src/pages/           # 184 page components
│   ├── src/components/      # 280+ reusable components
│   ├── src/lib/             # tRPC client, voice service
│   └── index.html           # Entry point
├── server/                  # Backend (Express 4 + tRPC 11)
│   ├── routers/             # 170 tRPC routers
│   ├── services/            # 74 service classes
│   ├── _core/               # Framework (do not edit)
│   └── qumus-complete-engine.ts  # QUMUS v11.0
├── drizzle/schema.ts        # 150 database tables
├── ecosystem.config.cjs     # PM2 config
├── INSTALL.md               # Full production guide
├── CUSTOMIZE.md             # White-label guide
├── README.md                # Platform documentation
└── package.json             # Dependencies
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `pnpm install` fails | Ensure Node.js 22+ and pnpm 9+. Try `pnpm install --no-frozen-lockfile` |
| `db:push` hangs | Use `npx drizzle-kit generate && npx drizzle-kit migrate` instead |
| Port 3000 in use | Set `PORT=3001` in `.env` or kill the process: `lsof -ti:3000 \| xargs kill` |
| Stripe webhook fails | Verify `STRIPE_WEBHOOK_SECRET` matches your Stripe dashboard |
| Voice commands not working | Requires HTTPS in production. Works on localhost in development |
| Login redirect loop | Ensure OAuth env vars are set. Dashboard read-only views work without login |
| Audio won't play on iOS | Tap the play button — iOS requires user gesture for audio playback |

---

## Support

- **Full documentation**: See `README.md`
- **Production deployment**: See `INSTALL.md`
- **White-label customization**: See `CUSTOMIZE.md`
- **Canryn Production**: All outputs credited to Canryn Production and its subsidiaries
- **Sweet Miracles Foundation**: "A Voice for the Voiceless" — 501(c)(3) / 508(c)

---

*Built with QUMUS Autonomous Orchestration Engine v11.0*
*A Canryn Production and its subsidiaries*
