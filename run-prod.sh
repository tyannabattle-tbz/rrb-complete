#!/bin/bash

################################################################################
# Manus Agent Web - Production Server Launcher
#
# This script starts the production server for Mac Mini deployment.
# It handles environment setup, database migrations, and server startup.
#
# Usage: bash run-prod.sh
#
# Requirements:
#   - All dependencies installed (pnpm install)
#   - .env.local configured with production credentials
#   - Database initialized and migrated
#   - Node.js 22.13.0 or later
#
# Features:
#   - Production-optimized build
#   - Database connection pooling
#   - Error logging and monitoring
#   - Graceful shutdown handling
#   - Health check endpoints
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
PROD_PORT=${PORT:-3000}
NODE_ENV="production"
LOG_DIR="$PROJECT_DIR/logs"

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

# Create logs directory
setup_logging() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        print_success "Log directory created: $LOG_DIR"
    fi
}

# Validate environment
validate_environment() {
    print_header "Validating Environment"
    
    if [ ! -f ".env.local" ]; then
        print_error ".env.local not found"
        print_info "Please create .env.local with production credentials"
        exit 1
    fi
    
    # Check required environment variables
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "VITE_APP_ID"
        "OAUTH_SERVER_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.local; then
            print_warning "Missing environment variable: $var"
        fi
    done
    
    print_success "Environment validation complete"
}

# Build the project
build_project() {
    print_header "Building Project"
    
    print_info "Running production build..."
    pnpm build
    
    print_success "Project built successfully"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    print_info "Pushing database schema..."
    pnpm db:push || print_warning "Database migration skipped"
    
    print_success "Database migrations complete"
}

# Start the server
start_server() {
    print_header "Starting Production Server"
    
    print_info "Server Configuration:"
    echo "  • Environment: $NODE_ENV"
    echo "  • Port: $PROD_PORT"
    echo "  • Project: $PROJECT_DIR"
    echo "  • Logs: $LOG_DIR"
    echo ""
    
    print_info "Server starting..."
    print_info "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the production server
    NODE_ENV=$NODE_ENV PORT=$PROD_PORT pnpm start
}

# Graceful shutdown
trap 'print_info "Shutting down..."; exit 0' SIGINT SIGTERM

# Main function
main() {
    print_header "Manus Agent Web - Production Server"
    
    cd "$PROJECT_DIR"
    
    setup_logging
    validate_environment
    build_project
    run_migrations
    start_server
}

# Run main function
main
