#!/bin/bash

# RRB Complete Ecosystem - Mac mini Deployment Script
# Offline-first, fully autonomous, Qumus-orchestrated
# One-command deployment for Mac mini

set -e

echo "🎵 RRB Complete Ecosystem - Mac mini Deployment"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="rrb-ecosystem"
PROJECT_DIR="$HOME/$PROJECT_NAME"
PORT=3000
DB_PATH="$PROJECT_DIR/data/rrb.db"

echo -e "${BLUE}Step 1: Checking system requirements...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    # Install Node.js via Homebrew
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node
fi

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Installing for local LLM support..."
    brew install ollama
    echo "Starting Ollama service..."
    ollama serve &
    sleep 5
    echo "Pulling Mistral model (this may take a few minutes)..."
    ollama pull mistral
fi

echo -e "${GREEN}✅ System requirements OK${NC}"
echo ""

# Clone or setup project
echo -e "${BLUE}Step 2: Setting up project...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git clone https://github.com/tyannabattle-tbz/rrb-complete.git .
else
    cd "$PROJECT_DIR"
    git pull origin main
fi

echo -e "${GREEN}✅ Project setup complete${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
pnpm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup database
echo -e "${BLUE}Step 4: Setting up offline-first database...${NC}"
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/uploads"

# Create SQLite database
pnpm db:push

echo -e "${GREEN}✅ Database ready (SQLite at $DB_PATH)${NC}"
echo ""

# Configure environment
echo -e "${BLUE}Step 5: Configuring offline environment...${NC}"
cat > "$PROJECT_DIR/.env.local" << EOF
# Offline-First Configuration
NODE_ENV=production
PORT=$PORT

# Database (SQLite - offline)
DATABASE_URL=file:$DB_PATH

# Local LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral

# Local Storage
STORAGE_TYPE=local
STORAGE_PATH=$PROJECT_DIR/uploads

# Email (SMTP - optional, can be configured later)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# Payments (Simulation mode)
STRIPE_MODE=simulation

# Offline mode
OFFLINE_MODE=true
QUMUS_AUTONOMOUS=true
QUMUS_CONTROL_LEVEL=90
EOF

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Build project
echo -e "${BLUE}Step 6: Building project...${NC}"
pnpm build

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Create startup script
echo -e "${BLUE}Step 7: Creating startup script...${NC}"
cat > "$PROJECT_DIR/start-rrb.sh" << 'STARTUP_EOF'
#!/bin/bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "🎵 Starting RRB Complete Ecosystem..."
echo "======================================"
echo ""

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama service..."
    ollama serve &
    sleep 3
fi

# Start the application
echo "Starting RRB application on http://localhost:3000"
echo ""
echo "Available systems:"
echo "  📻 Radio Station: trpc.rrb.radio"
echo "  🧘 Healing Frequencies: trpc.rrb.healing"
echo "  🎲 Solbones Game: trpc.rrb.solbones"
echo "  🚨 Emergency Broadcast: trpc.rrb.emergency"
echo "  💝 Donations: trpc.rrb.donations"
echo "  🛍️  Merchandise: trpc.rrb.shop"
echo "  🧠 Qumus Orchestration: trpc.qumusFullStack"
echo ""
echo "Press Ctrl+C to stop"
echo ""

pnpm start
STARTUP_EOF

chmod +x "$PROJECT_DIR/start-rrb.sh"

echo -e "${GREEN}✅ Startup script created${NC}"
echo ""

# Create launchd plist for auto-start (optional)
echo -e "${BLUE}Step 8: Setting up auto-start (optional)...${NC}"
PLIST_PATH="$HOME/Library/LaunchAgents/com.rrb.ecosystem.plist"

cat > "$PLIST_PATH" << PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.rrb.ecosystem</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/start-rrb.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/rrb.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/rrb-error.log</string>
</dict>
</plist>
PLIST_EOF

mkdir -p "$PROJECT_DIR/logs"

echo -e "${GREEN}✅ Auto-start configured${NC}"
echo ""

# Final summary
echo -e "${GREEN}=================================================="
echo "✅ RRB Complete Ecosystem Ready for Mac mini!"
echo "==================================================${NC}"
echo ""
echo "📍 Project Location: $PROJECT_DIR"
echo "📍 Database: $DB_PATH"
echo "📍 Port: $PORT"
echo ""
echo "🚀 To start the system:"
echo "   $PROJECT_DIR/start-rrb.sh"
echo ""
echo "📱 Access the system:"
echo "   http://localhost:$PORT"
echo ""
echo "🔧 Offline Capabilities:"
echo "   ✅ Local SQLite database (no cloud needed)"
echo "   ✅ Ollama LLM (local AI, no API keys)"
echo "   ✅ Local file storage (no S3 needed)"
echo "   ✅ Qumus 90% autonomous control"
echo "   ✅ Complete RRB ecosystem"
echo ""
echo "💾 Backup your data:"
echo "   cp -r $PROJECT_DIR/data $PROJECT_DIR/data.backup"
echo ""
echo "🎵 All systems operational!"
echo ""
