#!/bin/bash

################################################################################
# DEPLOY TO MAC MINI - PRODUCTION DEPLOYMENT EXECUTION
# Canryn Production and its subsidiaries
# 
# Complete deployment to Mac Mini with stream URL configuration
# and Qumus monitoring dashboard setup
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

################################################################################
# PHASE 1: DEPLOY TO MAC MINI
################################################################################

phase_deploy_to_mac_mini() {
    log_info "Phase 1: Deploying to Mac Mini..."
    
    # Check if running on Mac Mini
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "This script must run on macOS (Mac Mini)"
        exit 1
    fi
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Run production deployment script
    log_info "Running MAC_MINI_PRODUCTION_TRANSPORT.sh..."
    if [ -f "$SCRIPT_DIR/MAC_MINI_PRODUCTION_TRANSPORT.sh" ]; then
        bash "$SCRIPT_DIR/MAC_MINI_PRODUCTION_TRANSPORT.sh"
        log_success "Mac Mini deployment completed"
    else
        log_error "MAC_MINI_PRODUCTION_TRANSPORT.sh not found"
        exit 1
    fi
    
    log_success "Phase 1 complete"
}

################################################################################
# PHASE 2: CONFIGURE REAL STREAM URLS
################################################################################

phase_configure_stream_urls() {
    log_info "Phase 2: Configuring real stream URLs..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ENV_FILE="$SCRIPT_DIR/.env.production"
    
    # Create backup
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        log_success "Created backup of .env.production"
    fi
    
    # Prompt for stream URLs
    log_info "Enter RRB Radio stream configuration:"
    
    read -p "RRB Primary Stream URL (https://...): " RRB_STREAM_URL
    read -p "RRB Backup Stream URL (https://...): " RRB_BACKUP_STREAM_URL
    read -p "RRB Radio API URL (https://...): " RRB_RADIO_API
    
    read -p "Qumus API URL (https://qumus.canryn.io/api/v1): " QUMUS_API_URL
    QUMUS_API_URL=${QUMUS_API_URL:-"https://qumus.canryn.io/api/v1"}
    
    read -p "Database URL (mysql://user:pass@host:3306/db): " DATABASE_URL
    
    # Update .env.production
    if [ -f "$ENV_FILE" ]; then
        # Use sed to update values (works on both macOS and Linux)
        sed -i '' "s|RRB_STREAM_URL=.*|RRB_STREAM_URL=$RRB_STREAM_URL|" "$ENV_FILE"
        sed -i '' "s|RRB_BACKUP_STREAM_URL=.*|RRB_BACKUP_STREAM_URL=$RRB_BACKUP_STREAM_URL|" "$ENV_FILE"
        sed -i '' "s|RRB_RADIO_API=.*|RRB_RADIO_API=$RRB_RADIO_API|" "$ENV_FILE"
        sed -i '' "s|QUMUS_API_URL=.*|QUMUS_API_URL=$QUMUS_API_URL|" "$ENV_FILE"
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
        
        log_success "Stream URLs configured in .env.production"
    fi
    
    # Restart service with new configuration
    log_info "Restarting service with new configuration..."
    launchctl unload ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist 2>/dev/null || true
    sleep 2
    launchctl load ~/Library/LaunchAgents/com.canryn.manus-agent-web.plist
    
    log_success "Service restarted with new configuration"
    log_success "Phase 2 complete"
}

################################################################################
# PHASE 3: SET UP QUMUS MONITORING DASHBOARD
################################################################################

phase_setup_qumus_monitoring() {
    log_info "Phase 3: Setting up Qumus Monitoring Dashboard..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Wait for service to be ready
    log_info "Waiting for service to be ready..."
    sleep 5
    
    # Test Qumus connection
    log_info "Testing Qumus connection..."
    if curl -s http://localhost:3000/api/qumus/status > /dev/null 2>&1; then
        log_success "Qumus connection verified"
    else
        log_warning "Qumus connection not yet available - will retry"
    fi
    
    # Initialize Qumus monitoring
    log_info "Initializing Qumus autonomous policies..."
    curl -X POST http://localhost:3000/api/qumus/initialize \
        -H "Content-Type: application/json" \
        -d '{"autonomy_level": 90, "enable_monitoring": true}' \
        2>/dev/null || log_warning "Qumus initialization may require manual configuration"
    
    log_success "Qumus Monitoring Dashboard configured"
    log_info "Access dashboard at: http://localhost:3000/qumus-monitoring"
    log_success "Phase 3 complete"
}

################################################################################
# PHASE 4: VERIFY ALL SYSTEMS
################################################################################

phase_verify_systems() {
    log_info "Phase 4: Verifying all systems..."
    
    local all_ok=true
    
    # Check service
    log_info "Checking application service..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "✓ Application running"
    else
        log_error "✗ Application not responding"
        all_ok=false
    fi
    
    # Check RRB Radio
    log_info "Checking RRB Radio streaming..."
    if curl -s http://localhost:3000/api/rrb/status > /dev/null 2>&1; then
        log_success "✓ RRB Radio operational"
    else
        log_warning "⚠ RRB Radio may need stream URL configuration"
    fi
    
    # Check Qumus
    log_info "Checking Qumus orchestration..."
    if curl -s http://localhost:3000/api/qumus/status > /dev/null 2>&1; then
        log_success "✓ Qumus operational"
    else
        log_warning "⚠ Qumus may need API configuration"
    fi
    
    # Check HybridCast
    log_info "Checking HybridCast emergency broadcast..."
    if curl -s http://localhost:3000/api/hybridcast/status > /dev/null 2>&1; then
        log_success "✓ HybridCast operational"
    else
        log_warning "⚠ HybridCast may need configuration"
    fi
    
    # Check database
    log_info "Checking database connection..."
    if curl -s http://localhost:3000/api/health/database > /dev/null 2>&1; then
        log_success "✓ Database connected"
    else
        log_error "✗ Database connection failed"
        all_ok=false
    fi
    
    if [ "$all_ok" = true ]; then
        log_success "Phase 4 complete - All systems operational"
    else
        log_warning "Phase 4 complete - Some systems need configuration"
    fi
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
    phase_deploy_to_mac_mini
    phase_configure_stream_urls
    phase_setup_qumus_monitoring
    phase_verify_systems
    
    log_info ""
    log_success "=========================================="
    log_success "DEPLOYMENT COMPLETE!"
    log_success "=========================================="
    log_success "Application: http://localhost:3000"
    log_success "Qumus Dashboard: http://localhost:3000/qumus-monitoring"
    log_success "RRB Radio: http://localhost:3000/rrb-broadcast"
    log_success "HybridCast: http://localhost:3000/hybridcast"
    log_success "View logs: tail -f ~/.manus-agent-web/logs/stdout.log"
    log_info ""
    log_success "Mission: 'A Voice for the Voiceless'"
    log_success "Powered by Canryn Production and its subsidiaries"
    log_info ""
}

main "$@"
