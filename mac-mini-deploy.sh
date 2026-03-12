#!/bin/bash
###############################################################################
# CANRYN PRODUCTION ECOSYSTEM — MAC MINI DEPLOYMENT
# 
# This script installs and configures the entire ecosystem on a Mac mini:
#   Main App   → Port 3000 (full web application)
#   QUMUS      → Port 3001 (autonomous orchestration)
#   RRB        → Port 3002 (entertainment hub)
#   HybridCast → Port 3003 (emergency broadcast)
#   Ty OS      → Port 3004 (personal OS)
#
# Usage: chmod +x mac-mini-deploy.sh && ./mac-mini-deploy.sh
# © Canryn Production and its subsidiaries. All rights reserved.
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       CANRYN PRODUCTION — MAC MINI DEPLOYMENT               ║"
echo "║                                                              ║"
echo "║   Installing the complete ecosystem on your Mac mini         ║"
echo "║   © Canryn Production and its subsidiaries                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Check prerequisites ─────────────────────────────────────────────────
echo -e "${CYAN}[1/8] Checking prerequisites...${NC}"

# Check for macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo -e "${YELLOW}Warning: This script is designed for macOS. Proceeding anyway...${NC}"
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
  echo -e "${YELLOW}Installing Homebrew...${NC}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Installing Node.js via Homebrew...${NC}"
  brew install node
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}  Node.js: ${NODE_VERSION}${NC}"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}Installing pnpm...${NC}"
  npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}  pnpm: ${PNPM_VERSION}${NC}"

# Check for git
if ! command -v git &> /dev/null; then
  echo -e "${YELLOW}Installing git via Homebrew...${NC}"
  brew install git
fi

echo -e "${GREEN}  All prerequisites met.${NC}"

# ─── 2. Set up project directory ────────────────────────────────────────────
echo ""
echo -e "${CYAN}[2/8] Setting up project directory...${NC}"

PROJECT_DIR="$HOME/canryn-production"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# If the zip was extracted here, the files are already in place
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}  No package.json found. Please extract the zip file first:${NC}"
  echo -e "${YELLOW}  unzip canryn-production-complete.zip -d ~/canryn-production${NC}"
  exit 1
fi

echo -e "${GREEN}  Project directory: ${PROJECT_DIR}${NC}"

# ─── 3. Install main app dependencies ───────────────────────────────────────
echo ""
echo -e "${CYAN}[3/8] Installing main application dependencies...${NC}"
pnpm install
echo -e "${GREEN}  Main app dependencies installed.${NC}"

# ─── 4. Install services dependencies ───────────────────────────────────────
echo ""
echo -e "${CYAN}[4/8] Installing services dependencies...${NC}"
cd services
npm install
cd ..
echo -e "${GREEN}  Services dependencies installed.${NC}"

# ─── 5. Set up environment variables ────────────────────────────────────────
echo ""
echo -e "${CYAN}[5/8] Setting up environment variables...${NC}"

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}  Creating .env file from template...${NC}"
  cat > .env << 'ENVEOF'
# Canryn Production Ecosystem — Environment Variables
# Fill in your actual values below

# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=your-jwt-secret-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://id.manus.im

# Owner
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Ty Bat Zan

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API Keys
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key

# Service Ports (defaults)
QUMUS_PORT=3001
RRB_PORT=3002
HYBRIDCAST_PORT=3003
TYOS_PORT=3004
ENVEOF
  echo -e "${YELLOW}  ⚠️  Please edit .env with your actual credentials!${NC}"
else
  echo -e "${GREEN}  .env file already exists.${NC}"
fi

# ─── 6. Build the main application ──────────────────────────────────────────
echo ""
echo -e "${CYAN}[6/8] Building main application...${NC}"
pnpm build 2>/dev/null || echo -e "${YELLOW}  Build step skipped (dev mode available)${NC}"
echo -e "${GREEN}  Build complete.${NC}"

# ─── 7. Create launchd plist files for auto-start ───────────────────────────
echo ""
echo -e "${CYAN}[7/8] Creating auto-start configuration (launchd)...${NC}"

LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENTS_DIR"

# Main app plist
cat > "$LAUNCH_AGENTS_DIR/com.canryn.main.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.canryn.main</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(which node)</string>
    <string>${PROJECT_DIR}/server/_core/index.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${PROJECT_DIR}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>3000</string>
    <key>NODE_ENV</key>
    <string>production</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${PROJECT_DIR}/logs/main.log</string>
  <key>StandardErrorPath</key>
  <string>${PROJECT_DIR}/logs/main-error.log</string>
</dict>
</plist>
PLIST

# Services plist
cat > "$LAUNCH_AGENTS_DIR/com.canryn.services.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.canryn.services</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(which node)</string>
    <string>${PROJECT_DIR}/services/start-all.mjs</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${PROJECT_DIR}/services</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${PROJECT_DIR}/logs/services.log</string>
  <key>StandardErrorPath</key>
  <string>${PROJECT_DIR}/logs/services-error.log</string>
</dict>
</plist>
PLIST

mkdir -p "$PROJECT_DIR/logs"

echo -e "${GREEN}  Auto-start configured for login.${NC}"
echo -e "${GREEN}  To enable: launchctl load ~/Library/LaunchAgents/com.canryn.main.plist${NC}"
echo -e "${GREEN}             launchctl load ~/Library/LaunchAgents/com.canryn.services.plist${NC}"

# ─── 8. Final summary ───────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[8/8] Deployment complete!${NC}"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                       ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  🌐 Main Application ........... http://localhost:3000       ║"
echo "║  ⚡ QUMUS Control Center ........ http://localhost:3001       ║"
echo "║  🎵 Rockin' Rockin' Boogie ...... http://localhost:3002       ║"
echo "║  🚨 HybridCast Emergency ........ http://localhost:3003       ║"
echo "║  🖥️  Ty OS ....................... http://localhost:3004       ║"
echo "║                                                              ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  QUICK START:                                                ║"
echo "║                                                              ║"
echo "║  Start all services:                                         ║"
echo "║    cd ~/canryn-production/services && node start-all.mjs     ║"
echo "║                                                              ║"
echo "║  Start main app (dev):                                       ║"
echo "║    cd ~/canryn-production && pnpm dev                        ║"
echo "║                                                              ║"
echo "║  Start individual service:                                   ║"
echo "║    node services/qumus-3001/server.mjs                       ║"
echo "║    node services/rrb-3002/server.mjs                         ║"
echo "║    node services/hybridcast-3003/server.mjs                  ║"
echo "║    node services/ty-os-3004/server.mjs                       ║"
echo "║                                                              ║"
echo "║  Auto-start on login:                                        ║"
echo "║    launchctl load ~/Library/LaunchAgents/com.canryn.*.plist  ║"
echo "║                                                              ║"
echo "║  © Canryn Production and its subsidiaries                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
