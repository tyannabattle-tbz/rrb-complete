#!/bin/bash

# ============================================================================
# Manus Agent Web - Mac Mini Installation Script
# ============================================================================
# This script automates the complete installation and setup of the Manus
# Agent Web platform on Mac Mini, including all dependencies, databases,
# and services required for production operation.
#
# Usage: ./install-mac-mini.sh [--prod] [--skip-deps]
# ============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="manus-agent-web"
NODE_VERSION="22.13.0"
PNPM_VERSION="10.4.1"
PROD_MODE=false
SKIP_DEPS=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --prod)
      PROD_MODE=true
      shift
      ;;
    --skip-deps)
      SKIP_DEPS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Functions
print_header() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} $1"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

check_command() {
  if ! command -v $1 &> /dev/null; then
    return 1
  fi
  return 0
}

# Main installation
main() {
  print_header "Manus Agent Web - Mac Mini Installation"
  
  echo "Installation Mode: $([ "$PROD_MODE" = true ] && echo "PRODUCTION" || echo "DEVELOPMENT")"
  echo "Project Directory: $SCRIPT_DIR"
  echo ""
  
  # Step 1: Check system requirements
  print_header "Step 1: Checking System Requirements"
  
  if ! check_command "brew"; then
    print_error "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  else
    print_step "Homebrew is installed"
  fi
  
  # Step 2: Install Node.js and pnpm
  if [ "$SKIP_DEPS" = false ]; then
    print_header "Step 2: Installing Node.js and pnpm"
    
    if ! check_command "node"; then
      print_warning "Node.js not found. Installing via Homebrew..."
      brew install node
    else
      INSTALLED_NODE=$(node -v)
      print_step "Node.js is installed: $INSTALLED_NODE"
    fi
    
    if ! check_command "pnpm"; then
      print_warning "pnpm not found. Installing..."
      npm install -g pnpm
    else
      INSTALLED_PNPM=$(pnpm -v)
      print_step "pnpm is installed: $INSTALLED_PNPM"
    fi
  else
    print_step "Skipping dependency installation (--skip-deps)"
  fi
  
  # Step 3: Install project dependencies
  print_header "Step 3: Installing Project Dependencies"
  
  cd "$SCRIPT_DIR"
  
  if [ -f "package.json" ]; then
    print_step "Installing npm packages with pnpm..."
    pnpm install
    print_step "Dependencies installed successfully"
  else
    print_error "package.json not found in $SCRIPT_DIR"
    exit 1
  fi
  
  # Step 4: Setup environment variables
  print_header "Step 4: Setting Up Environment Variables"
  
  if [ ! -f ".env.local" ]; then
    print_warning "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/manus_agent_web"

# Authentication
JWT_SECRET="your-jwt-secret-key-change-this"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Application Configuration
VITE_APP_ID="your-app-id"
VITE_APP_TITLE="Manus Agent Web"
VITE_APP_LOGO="https://example.com/logo.png"

# Stripe Configuration (if using payments)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Built-in Forge API
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Owner Information
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-open-id"

# Server Configuration
NODE_ENV="development"
PORT=3000
EOF
    print_step ".env.local created. Please update with your configuration."
  else
    print_step ".env.local already exists"
  fi
  
  # Step 5: Setup database
  print_header "Step 5: Database Setup"
  
  if [ "$PROD_MODE" = true ]; then
    print_warning "Production mode: Ensure MySQL is running and accessible"
    print_step "Running database migrations..."
    pnpm db:push
  else
    print_step "Development mode: Database setup can be done later"
  fi
  
  # Step 6: Build project
  print_header "Step 6: Building Project"
  
  if [ "$PROD_MODE" = true ]; then
    print_step "Building for production..."
    pnpm build
    print_step "Production build completed"
  else
    print_step "Skipping build for development mode"
  fi
  
  # Step 7: Create launch scripts
  print_header "Step 7: Creating Launch Scripts"
  
  # Development launch script
  cat > launch-dev.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Manus Agent Web (Development Mode)..."
pnpm dev
EOF
  chmod +x launch-dev.sh
  print_step "Created launch-dev.sh"
  
  # Production launch script
  cat > launch-prod.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Manus Agent Web (Production Mode)..."
export NODE_ENV=production
pnpm start
EOF
  chmod +x launch-prod.sh
  print_step "Created launch-prod.sh"
  
  # Step 8: Create systemd service (optional for auto-start)
  if [ "$PROD_MODE" = true ]; then
    print_header "Step 8: Setting Up Auto-Start Service"
    
    print_warning "To enable auto-start on Mac Mini, you can use LaunchAgent"
    print_step "Create ~/Library/LaunchAgents/com.manus.agent.plist"
    
    cat > ~/Library/LaunchAgents/com.manus.agent.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.manus.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$SCRIPT_DIR/launch-prod.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/logs/stderr.log</string>
</dict>
</plist>
EOF
    
    mkdir -p "$SCRIPT_DIR/logs"
    print_step "LaunchAgent plist created"
    print_step "To enable auto-start: launchctl load ~/Library/LaunchAgents/com.manus.agent.plist"
  fi
  
  # Final summary
  print_header "Installation Complete!"
  
  echo -e "${GREEN}✓ Installation successful!${NC}\n"
  echo "Next steps:"
  echo ""
  echo "1. Update .env.local with your configuration:"
  echo "   nano .env.local"
  echo ""
  echo "2. Start the development server:"
  echo "   ./launch-dev.sh"
  echo ""
  echo "3. Or for production:"
  echo "   ./launch-prod.sh"
  echo ""
  echo "4. Access the application at:"
  echo "   http://localhost:3000"
  echo ""
  
  if [ "$PROD_MODE" = true ]; then
    echo "Production Configuration:"
    echo "- Database migrations applied"
    echo "- Production build completed"
    echo "- Auto-start service configured"
    echo ""
  fi
  
  echo "For more information, see MAC_MINI_DEPLOYMENT_GUIDE.md"
  echo ""
}

# Run main function
main "$@"
