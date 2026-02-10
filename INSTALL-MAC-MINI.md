# RRB QUMUS Platform — Mac Mini Install & Execute Guide

## Prerequisites

Before running the install, ensure your Mac Mini has:

- **macOS 12+** (Monterey or later)
- **Node.js 20+** — Install via [Homebrew](https://brew.sh) or [nodejs.org](https://nodejs.org)
- **pnpm** — Package manager

---

## Quick Install (One Command)

Open Terminal and run:

```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js and pnpm
brew install node
npm install -g pnpm

# 3. Clone or extract the project
cd ~/Desktop
# If you have the ZIP:
unzip manus-agent-web-v9.zip -d rrb-qumus-platform
cd rrb-qumus-platform

# If cloning from GitHub:
# git clone https://github.com/YOUR-ORG/rrb-qumus-platform.git
# cd rrb-qumus-platform

# 4. Install dependencies
pnpm install

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your production values:
# nano .env

# 6. Push database schema
pnpm db:push

# 7. Start the development server
pnpm dev
```

The app will be available at **http://localhost:3000**

---

## One-Liner Install Script

Copy and paste this entire block into Terminal:

```bash
brew install node && npm install -g pnpm && cd ~/Desktop && unzip manus-agent-web-v9.zip -d rrb-qumus-platform && cd rrb-qumus-platform && pnpm install && pnpm db:push && pnpm dev
```

---

## Production Build & Run

For running in production mode on the Mac Mini:

```bash
# Build for production
pnpm build

# Start production server
NODE_ENV=production node dist/server/index.js
```

---

## Run as Background Service (launchd)

To keep the platform running 24/7 on your Mac Mini:

```bash
# Create the launch agent
cat > ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.canryn.rrb-qumus</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>dist/server/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/YOUR_USERNAME/Desktop/rrb-qumus-platform</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USERNAME/Library/Logs/rrb-qumus.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USERNAME/Library/Logs/rrb-qumus-error.log</string>
</dict>
</plist>
EOF

# Replace YOUR_USERNAME with your actual username
sed -i '' "s/YOUR_USERNAME/$(whoami)/g" ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist

# Load and start the service
launchctl load ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist

# Check status
launchctl list | grep rrb-qumus
```

### Service Commands

```bash
# Stop the service
launchctl unload ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist

# Restart the service
launchctl unload ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist
launchctl load ~/Library/LaunchAgents/com.canryn.rrb-qumus.plist

# View logs
tail -f ~/Library/Logs/rrb-qumus.log
tail -f ~/Library/Logs/rrb-qumus-error.log
```

---

## Environment Variables

Create a `.env` file with these values (get from your Manus dashboard Settings > Secrets):

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_app_id
STRIPE_SECRET_KEY=your_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## Accessing the Platform

| Feature | URL |
|---------|-----|
| Home / RRB Landing | http://localhost:3000/rrb |
| QUMUS Dashboard | http://localhost:3000/qumus |
| Solbones Game | http://localhost:3000/solbones |
| Solbones Online | http://localhost:3000/solbones-online |
| Tournament Brackets | http://localhost:3000/solbones-tournament |
| Sweet Miracles | http://localhost:3000/sweet-miracles |
| HybridCast | http://localhost:3000/hybridcast |
| Radio | http://localhost:3000/radio |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `command not found: pnpm` | Run `npm install -g pnpm` |
| `command not found: node` | Run `brew install node` |
| Port 3000 in use | Kill existing: `lsof -ti:3000 \| xargs kill -9` |
| Database connection error | Check DATABASE_URL in .env |
| Build fails | Run `pnpm install` again, then `pnpm build` |

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| macOS | 12 (Monterey) | 14+ (Sonoma) |
| RAM | 4 GB | 8 GB+ |
| Storage | 500 MB | 2 GB+ |
| Node.js | 20.x | 22.x |

---

*Canryn Production — Rockin' Rockin' Boogie — Powered by QUMUS*
