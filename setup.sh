#!/bin/bash
# ============================================================
# Rockin' Rockin' Boogie — RRB Platform Setup Script
# Canryn Production | QUMUS Autonomous Orchestration
# ============================================================
set -e

echo "============================================================"
echo "  Rockin' Rockin' Boogie — Platform Setup"
echo "  Canryn Production | Powered by QUMUS"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "[ERROR] Node.js 18+ required. Found: $(node -v)"
    exit 1
fi
echo "[OK] Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[INFO] Installing pnpm..."
    npm install -g pnpm
fi
echo "[OK] pnpm $(pnpm -v)"

# Install dependencies
echo ""
echo "[STEP 1/3] Installing dependencies..."
pnpm install
echo "[OK] Dependencies installed"

# Environment setup
echo ""
echo "[STEP 2/3] Environment configuration..."
if [ ! -f .env ]; then
    echo "[INFO] Creating .env from template..."
    cat > .env << 'ENVEOF'
# ============================================================
# RRB Platform Environment Variables
# ============================================================
# Database (MySQL/TiDB - required)
DATABASE_URL=mysql://user:password@localhost:3306/rrb_platform

# Authentication
JWT_SECRET=your-jwt-secret-change-this-to-random-string

# Stripe (for Merchandise Shop)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# App Config
VITE_APP_TITLE=Rockin Rockin Boogie
VITE_APP_ID=rrb-platform

# Owner Info
OWNER_NAME=Canryn Production
OWNER_OPEN_ID=

# OAuth (Manus platform - leave blank for standalone)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Built-in API (Manus platform - leave blank for standalone)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=
VITE_FRONTEND_FORGE_API_KEY=

# Push Notifications (generate with web-push)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VITE_VAPID_PUBLIC_KEY=
ENVEOF
    echo "[OK] .env created — edit it with your database and API credentials"
else
    echo "[OK] .env already exists"
fi

# Database setup
echo ""
echo "[STEP 3/3] Database migration..."
echo "[INFO] Make sure your DATABASE_URL in .env points to a running MySQL/TiDB instance"
read -p "Run database migrations now? (y/n): " RUN_DB
if [ "$RUN_DB" = "y" ] || [ "$RUN_DB" = "Y" ]; then
    pnpm db:push
    echo "[OK] Database migrations applied"
else
    echo "[SKIP] Run 'pnpm db:push' when your database is ready"
fi

echo ""
echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "  To start the development server:"
echo "    pnpm dev"
echo ""
echo "  To build for production:"
echo "    pnpm build"
echo ""
echo "  To start production server:"
echo "    pnpm start"
echo ""
echo "  The platform will be available at:"
echo "    http://localhost:3000"
echo ""
echo "  QUMUS Autonomy Level: 90%"
echo "  Channels: 7 | Schedule Slots: 62 | 24/7 Coverage"
echo "============================================================"
