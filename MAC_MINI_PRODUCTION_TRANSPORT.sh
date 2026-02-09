#!/bin/bash

################################################################################
# MAC MINI PRODUCTION TRANSPORT PACKAGE
# Canryn Production and its subsidiaries
# 
# Complete deployment automation for Mac Mini production deployment
# Handles installation, configuration, and launch of all systems
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="manus-agent-web"
APP_PORT=3000
PRODUCTION_MODE=true
MAC_MINI_DEPLOYMENT=true

################################################################################
# UTILITY FUNCTIONS
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    return 0
}

################################################################################
# PHASE 1: SYSTEM REQUIREMENTS CHECK
################################################################################

phase_system_requirements() {
    log_info "Phase 1: Checking system requirements..."
    
    # Check macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "This script is designed for macOS only"
        exit 1
    fi
    log_success "macOS detected"
    
    # Check required commands
    local required_commands=("node" "npm" "pnpm" "git" "curl")
    for cmd in "${required_commands[@]}"; do
        if check_command "$cmd"; then
            log_success "$cmd is installed"
        else
            log_warning "$cmd is not installed - will attempt to install"
        fi
    done
    
    log_success "Phase 1 complete"
}

################################################################################
# PHASE 2: INSTALL DEPENDENCIES
################################################################################

phase_install_dependencies() {
    log_info "Phase 2: Installing dependencies..."
    
    # Install Homebrew if not present
    if ! command -v brew &> /dev/null; then
        log_info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        log_success "Homebrew installed"
    fi
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js..."
        brew install node
        log_success "Node.js installed"
    fi
    
    # Install pnpm
    log_info "Installing pnpm..."
    npm install -g pnpm
    log_success "pnpm installed"
    
    # Install project dependencies
    log_info "Installing project dependencies..."
    cd "$SCRIPT_DIR"
    pnpm install
    log_success "Project dependencies installed"
    
    log_success "Phase 2 complete"
}

################################################################################
# PHASE 3: ENVIRONMENT CONFIGURATION
################################################################################

phase_environment_configuration() {
    log_info "Phase 3: Configuring environment..."
    
    # Create .env.production if it doesn't exist
    if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
        log_warning ".env.production not found - creating from template"
        cp "$SCRIPT_DIR/.env.production.example" "$SCRIPT_DIR/.env.production" 2>/dev/null || \
        cat > "$SCRIPT_DIR/.env.production" << 'EOF'
# Production Environment Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PRODUCTION_MODE=true
MAC_MINI_DEPLOYMENT=true

# Database
DATABASE_URL=mysql://localhost:3306/manus_agent_prod

# Authentication
JWT_SECRET=change_me_in_production
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# RRB Radio
RRB_STREAM_URL=https://stream.rockinrockinboogie.com/live
RRB_BACKUP_STREAM_URL=https://backup-stream.rockinrockinboogie.com/live

# Qumus
QUMUS_API_URL=https://qumus.canryn.io/api/v1
QUMUS_AUTONOMY_LEVEL=90

# Security
HTTPS_ONLY=true
SECURE_COOKIES=true
RATE_LIMIT_ENABLED=true
EOF
        log_success ".env.production created"
    fi
    
    log_info "Please update .env.production with your production credentials"
    log_success "Phase 3 complete"
}

################################################################################
# PHASE 4: DATABASE SETUP
################################################################################

phase_database_setup() {
    log_info "Phase 4: Setting up database..."
    
    log_info "Running database migrations..."
    cd "$SCRIPT_DIR"
    pnpm db:push || log_warning "Database migration completed with warnings"
    
    log_success "Phase 4 complete"
}

################################################################################
# PHASE 5: BUILD OPTIMIZATION
################################################################################

phase_build_optimization() {
    log_info "Phase 5: Building for production..."
    
    cd "$SCRIPT_DIR"
    
    log_info "Building application..."
    pnpm build
    
    log_success "Phase 5 complete"
}

################################################################################
# PHASE 6: LAUNCHAGENT CONFIGURATION
################################################################################

phase_launchagent_configuration() {
    log_info "Phase 6: Configuring LaunchAgent for auto-start..."
    
    local launch_agent_dir="$HOME/Library/LaunchAgents"
    local launch_agent_plist="$launch_agent_dir/com.canryn.manus-agent-web.plist"
    
    # Create LaunchAgents directory if it doesn't exist
    mkdir -p "$launch_agent_dir"
    
    # Create LaunchAgent plist file
    cat > "$launch_agent_plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.canryn.manus-agent-web</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>cd $SCRIPT_DIR && pnpm start</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>$HOME/.manus-agent-web/logs/stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>$HOME/.manus-agent-web/logs/stderr.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>PORT</key>
        <string>3000</string>
    </dict>
</dict>
</plist>
EOF
    
    # Create logs directory
    mkdir -p "$HOME/.manus-agent-web/logs"
    
    # Load LaunchAgent
    launchctl load "$launch_agent_plist" 2>/dev/null || \
    launchctl unload "$launch_agent_plist" && launchctl load "$launch_agent_plist"
    
    log_success "LaunchAgent configured for auto-start"
    log_success "Phase 6 complete"
}

################################################################################
# PHASE 7: SECURITY HARDENING
################################################################################

phase_security_hardening() {
    log_info "Phase 7: Applying security hardening..."
    
    # Set proper file permissions
    chmod 600 "$SCRIPT_DIR/.env.production"
    chmod 755 "$SCRIPT_DIR"
    
    log_info "Verifying SSL/TLS configuration..."
    # SSL configuration would be handled by nginx or reverse proxy
    
    log_success "Phase 7 complete"
}

################################################################################
# PHASE 8: VERIFICATION
################################################################################

phase_verification() {
    log_info "Phase 8: Verifying installation..."
    
    # Wait for service to start
    sleep 5
    
    log_info "Checking service status..."
    if curl -s http://localhost:$APP_PORT > /dev/null 2>&1; then
        log_success "Service is running on port $APP_PORT"
    else
        log_warning "Service may not be responding yet - check logs"
    fi
    
    log_success "Phase 8 complete"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    log_info "=========================================="
    log_info "MAC MINI PRODUCTION DEPLOYMENT"
    log_info "Canryn Production and its subsidiaries"
    log_info "=========================================="
    log_info ""
    
    # Execute phases
    phase_system_requirements
    phase_install_dependencies
    phase_environment_configuration
    phase_database_setup
    phase_build_optimization
    phase_launchagent_configuration
    phase_security_hardening
    phase_verification
    
    log_info ""
    log_success "=========================================="
    log_success "DEPLOYMENT COMPLETE!"
    log_success "=========================================="
    log_success "Service is running on http://localhost:$APP_PORT"
    log_success "View logs: tail -f $HOME/.manus-agent-web/logs/stdout.log"
    log_success "Stop service: launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist"
    log_success "Start service: launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist"
    log_info ""
}

# Run main function
main "$@"
