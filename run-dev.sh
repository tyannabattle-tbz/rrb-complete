#!/bin/bash

################################################################################
# Manus Agent Web - Development Server Launcher
#
# This script starts the development server for local development on Mac Mini.
# It handles environment setup and provides helpful information about the server.
#
# Usage: bash run-dev.sh
#
# Features:
#   - Automatic environment detection
#   - Port availability checking
#   - Hot module reloading (HMR)
#   - Development database connection
#   - Console output formatting
#
################################################################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_PORT=3000
API_PORT=3000

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Main function
main() {
    print_header "Manus Agent Web - Development Server"
    
    cd "$PROJECT_DIR"
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found"
        print_info "Creating .env.local from template..."
        cp .env.example .env.local 2>/dev/null || {
            print_error ".env.example not found. Please create .env.local manually."
            exit 1
        }
        print_info "Please update .env.local with your credentials"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        pnpm install
        print_success "Dependencies installed"
    fi
    
    # Check port availability
    if ! check_port $DEV_PORT; then
        print_warning "Port $DEV_PORT is already in use"
        print_info "Attempting to use alternative port..."
        DEV_PORT=$((DEV_PORT + 1))
    fi
    
    # Display server information
    print_header "Server Configuration"
    print_info "Project Directory: $PROJECT_DIR"
    print_info "Development Port: $DEV_PORT"
    print_info "Environment: development"
    print_info "Node Version: $(node -v)"
    print_info "pnpm Version: $(pnpm -v)"
    
    # Start the development server
    print_header "Starting Development Server"
    print_info "Server will be available at: http://localhost:$DEV_PORT"
    print_info "API Endpoint: http://localhost:$API_PORT/api/trpc"
    print_info ""
    print_info "Features:"
    echo "  • Hot Module Reloading (HMR)"
    echo "  • Real-time TypeScript checking"
    echo "  • Database auto-migration"
    echo "  • OAuth integration"
    echo ""
    print_info "Press Ctrl+C to stop the server"
    print_info ""
    
    # Run development server
    pnpm dev --port $DEV_PORT
}

# Run main function
main
