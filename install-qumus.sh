#!/bin/bash

################################################################################
# QUMUS Installation & Execution Script
# 
# This script automates the installation, configuration, and deployment of QUMUS
# (Quantum Unified Multi-System Orchestration System) with all integrated subsystems:
# - Rockin Rockin Boogie (RRB) for broadcast management
# - HybridCast for streaming and distribution
# - Ollama for open-source LLM inference
# - Autonomous agent orchestration with government-grade security
#
# Usage: ./install-qumus.sh [OPTIONS]
# Options:
#   --dev          Install in development mode
#   --prod         Install in production mode
#   --customize    Run customization wizard
#   --help         Show this help message
################################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
QUMUS_HOME="${QUMUS_HOME:-.}"
QUMUS_ENV="${QUMUS_ENV:-development}"
QUMUS_PORT="${QUMUS_PORT:-3000}"
OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://localhost:11434}"
DATABASE_URL="${DATABASE_URL:-}"
NODE_ENV="${NODE_ENV:-development}"

# Helper functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js $(node -v) found"
    
    # Check npm/pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm not found, installing..."
        npm install -g pnpm
    fi
    print_success "pnpm $(pnpm -v) found"
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git $(git -v | awk '{print $3}') found"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    cd "$QUMUS_HOME"
    
    print_info "Installing Node.js dependencies..."
    pnpm install
    print_success "Dependencies installed"
}

# Configure environment
configure_environment() {
    print_header "Configuring Environment"
    
    # Create .env file if it doesn't exist
    if [ ! -f "$QUMUS_HOME/.env" ]; then
        print_info "Creating .env file..."
        cat > "$QUMUS_HOME/.env" << EOF
# QUMUS Environment Configuration
NODE_ENV=$NODE_ENV
QUMUS_ENV=$QUMUS_ENV
QUMUS_PORT=$QUMUS_PORT

# Database Configuration
DATABASE_URL=$DATABASE_URL

# Ollama Configuration (for local LLM inference)
OLLAMA_BASE_URL=$OLLAMA_BASE_URL

# OAuth Configuration
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Security Configuration
JWT_SECRET=$(openssl rand -hex 32)

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key_here
VITE_FRONTEND_FORGE_API_KEY=your_frontend_api_key_here

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=your_stripe_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Analytics Configuration
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id_here
EOF
        print_success ".env file created"
        print_warning "Please update .env file with your actual configuration values"
    else
        print_info ".env file already exists"
    fi
}

# Build application
build_application() {
    print_header "Building Application"
    
    cd "$QUMUS_HOME"
    
    print_info "Building QUMUS..."
    pnpm build
    print_success "Build completed"
}

# Setup database
setup_database() {
    print_header "Setting Up Database"
    
    cd "$QUMUS_HOME"
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set, skipping database setup"
        return
    fi
    
    print_info "Running database migrations..."
    pnpm db:push
    print_success "Database setup completed"
}

# Start development server
start_dev_server() {
    print_header "Starting Development Server"
    
    cd "$QUMUS_HOME"
    
    print_info "Starting QUMUS on port $QUMUS_PORT..."
    pnpm dev
}

# Start production server
start_prod_server() {
    print_header "Starting Production Server"
    
    cd "$QUMUS_HOME"
    
    print_info "Starting QUMUS in production mode on port $QUMUS_PORT..."
    NODE_ENV=production pnpm start
}

# Run customization wizard
run_customization_wizard() {
    print_header "QUMUS Customization Wizard"
    
    echo ""
    echo "This wizard will help you customize your QUMUS instance."
    echo ""
    
    # Application name
    read -p "Enter your QUMUS instance name (default: QUMUS): " APP_NAME
    APP_NAME="${APP_NAME:-QUMUS}"
    
    # Port configuration
    read -p "Enter port number (default: 3000): " PORT
    PORT="${PORT:-3000}"
    
    # Ollama configuration
    read -p "Enter Ollama base URL (default: http://localhost:11434): " OLLAMA_URL
    OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
    
    # LLM model selection
    echo ""
    echo "Select default LLM model:"
    echo "1) llama2 (default)"
    echo "2) mistral"
    echo "3) neural-chat"
    echo "4) other (specify)"
    read -p "Enter choice (1-4): " MODEL_CHOICE
    
    case $MODEL_CHOICE in
        1) LLM_MODEL="llama2" ;;
        2) LLM_MODEL="mistral" ;;
        3) LLM_MODEL="neural-chat" ;;
        4) read -p "Enter model name: " LLM_MODEL ;;
        *) LLM_MODEL="llama2" ;;
    esac
    
    # Broadcast configuration
    echo ""
    read -p "Enable Rockin Rockin Boogie (RRB)? (y/n, default: y): " ENABLE_RRB
    ENABLE_RRB="${ENABLE_RRB:-y}"
    
    read -p "Enable HybridCast streaming? (y/n, default: y): " ENABLE_HYBRIDCAST
    ENABLE_HYBRIDCAST="${ENABLE_HYBRIDCAST:-y}"
    
    # Save customization
    cat > "$QUMUS_HOME/.qumus-config.json" << EOF
{
  "appName": "$APP_NAME",
  "port": $PORT,
  "ollama": {
    "baseUrl": "$OLLAMA_URL",
    "defaultModel": "$LLM_MODEL"
  },
  "features": {
    "rockinBoogie": $([ "$ENABLE_RRB" = "y" ] && echo "true" || echo "false"),
    "hybridcast": $([ "$ENABLE_HYBRIDCAST" = "y" ] && echo "true" || echo "false"),
    "autonomousAgents": true,
    "governmentSecurity": true
  },
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    print_success "Customization saved to .qumus-config.json"
    print_info "Your QUMUS instance is configured and ready to deploy!"
}

# Display help
show_help() {
    cat << EOF
QUMUS Installation & Execution Script

Usage: ./install-qumus.sh [OPTIONS]

OPTIONS:
    --dev           Install and run in development mode
    --prod          Install and run in production mode
    --customize     Run customization wizard
    --help          Show this help message

EXAMPLES:
    # Install and run in development mode
    ./install-qumus.sh --dev
    
    # Run customization wizard
    ./install-qumus.sh --customize
    
    # Install and run in production mode
    ./install-qumus.sh --prod

ENVIRONMENT VARIABLES:
    QUMUS_HOME      Home directory for QUMUS (default: current directory)
    QUMUS_PORT      Port to run QUMUS on (default: 3000)
    OLLAMA_BASE_URL Base URL for Ollama server (default: http://localhost:11434)
    DATABASE_URL    Database connection string
    NODE_ENV        Node environment (development/production)

For more information, visit: https://github.com/qumus/qumus

EOF
}

# Main execution
main() {
    print_header "QUMUS Installation & Execution"
    print_info "Quantum Unified Multi-System Orchestration System"
    echo ""
    
    # Parse arguments
    case "${1:-}" in
        --dev)
            check_prerequisites
            install_dependencies
            configure_environment
            build_application
            setup_database
            start_dev_server
            ;;
        --prod)
            check_prerequisites
            install_dependencies
            configure_environment
            build_application
            setup_database
            start_prod_server
            ;;
        --customize)
            run_customization_wizard
            ;;
        --help)
            show_help
            ;;
        *)
            print_error "Unknown option: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
