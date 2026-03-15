# QUMUS Mac Mini Integration Guide

## Overview

This guide configures your Mac mini as the local QUMUS node — syncing with the cloud ecosystem, running autonomous tasks, and serving as the production broadcast origin.

---

## Prerequisites

- **macOS 14+** (Sonoma or later)
- **Node.js 22+** (`brew install node`)
- **pnpm** (`npm install -g pnpm`)
- **Git** (`xcode-select --install`)

---

## Step 1: Clone & Install

```bash
# Clone the ecosystem
git clone https://github.com/YOUR_REPO/manus-agent-web.git ~/qumus-ecosystem
cd ~/qumus-ecosystem

# Install dependencies
pnpm install
```

---

## Step 2: Environment Configuration

Create `.env` in the project root with your production credentials:

```bash
# Copy from Settings → Secrets in the Manus dashboard
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
BUILT_IN_FORGE_API_KEY=your_forge_key
BUILT_IN_FORGE_API_URL=your_forge_url
STRIPE_SECRET_KEY=your_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## Step 3: Verify Database Connection

```bash
# Push any pending schema changes
pnpm db:push

# Verify connection
node -e "const mysql = require('mysql2/promise'); (async () => { const c = await mysql.createConnection(process.env.DATABASE_URL); const [r] = await c.execute('SELECT COUNT(*) as c FROM radio_channels'); console.log('Channels:', r[0].c); await c.end(); })()"
```

Expected output: `Channels: 54`

---

## Step 4: Run Ecosystem Sync

```bash
# Full ecosystem sync — validates all 21 subsystems
pnpm sync:all
```

This checks:
- Database connectivity (197 tables)
- Radio channel health (54 streams)
- QUMUS decision engine (20 policies)
- Stripe payment processing
- Conference Hub (6 platforms)
- HybridCast emergency broadcast
- Sweet Miracles donations
- Global Broadcast State

---

## Step 5: Start the Local Server

```bash
# Development mode
pnpm dev

# Production build
pnpm build && pnpm start
```

The server runs on `http://localhost:3000` by default.

---

## Step 6: Configure as macOS Launch Agent (Auto-Start)

Create `~/Library/LaunchAgents/com.canryn.qumus.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.canryn.qumus</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/YOUR_USER/qumus-ecosystem/node_modules/.bin/tsx</string>
        <string>server/_core/index.ts</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/YOUR_USER/qumus-ecosystem</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USER/qumus-ecosystem/logs/qumus.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USER/qumus-ecosystem/logs/qumus-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
```

Load it:
```bash
mkdir -p ~/qumus-ecosystem/logs
launchctl load ~/Library/LaunchAgents/com.canryn.qumus.plist
```

---

## Step 7: QUMUS Agent Capabilities

Once running, QUMUS on your Mac mini can:

| Capability | Endpoint | Description |
|---|---|---|
| **Execute Commands** | `qumusAgent.executeTask` | Run autonomous tasks (content creation, scheduling, analysis) |
| **Create Content** | `qumusAgent.createContent` | Generate blog posts, social media, press releases via LLM |
| **Sync Ecosystem** | `qumusAgent.syncMacMini` | Push/pull data between Mac mini and cloud |
| **Chat Interface** | `qumusAgent.chat` | Natural language interaction with QUMUS brain |
| **Monitor Health** | `ecosystemSync.runFullSync` | Validate all 21 subsystems |
| **Manage Radio** | `globalBroadcast.getState` | Monitor all 54 radio channels |
| **Process Decisions** | `qumusCommand.executeCommand` | Autonomous decision-making with 90% autonomy |

---

## Step 8: Scheduled Tasks

Add cron jobs for autonomous operation:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * cd ~/qumus-ecosystem && node scripts/sync-all.mjs >> logs/sync.log 2>&1

# Stream health check every 15 minutes
*/15 * * * * cd ~/qumus-ecosystem && curl -s http://localhost:3000/api/trpc/globalBroadcast.syncChannels -X POST -H "Content-Type: application/json" >> logs/streams.log 2>&1
```

---

## Step 9: OBS / Broadcast Setup (Optional)

If broadcasting from the Mac mini:

1. Install OBS Studio: `brew install --cask obs`
2. Configure RTMP output to your Restream or Jitsi endpoint
3. The Live Stream page at `/live` will automatically detect and display the broadcast

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `pnpm sync:all` fails | Check DATABASE_URL in .env, ensure MySQL is accessible |
| Server won't start | Run `pnpm install` again, check Node.js version (22+) |
| Streams not playing | Run sync from `/ecosystem-sync` dashboard |
| QUMUS decisions not logging | Verify `qumus_decisions` table exists: `pnpm db:push` |

---

## Support

- **Ecosystem Sync Dashboard:** `https://your-domain/ecosystem-sync`
- **QUMUS Command Console:** `https://your-domain/commands`
- **System Health:** `https://your-domain/health`

---

*Canryn Production — QUMUS Autonomous AI — v3.2.0*
