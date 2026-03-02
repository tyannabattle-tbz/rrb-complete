#!/bin/bash

################################################################################
# Manus Agent Web - Environment Configuration Script
#
# This script helps configure environment variables for Mac Mini deployment.
# It guides you through setting up all required credentials and configuration.
#
# Usage: bash setup-env.sh
#
# This script will prompt for:
#   - Database connection details
#   - OAuth credentials
#   - API keys and secrets
#   - Stripe payment credentials (optional)
#   - Analytics configuration (optional)
#
################################################################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Prompt for input with default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local input
    
    if [ -z "$default" ]; then
        read -p "$(echo -e ${BLUE}$prompt${NC}): " input
    else
        read -p "$(echo -e ${BLUE}$prompt${NC}) [${default}]: " input
        input="${input:-$default}"
    fi
    
    echo "$input"
}

# Main configuration function
main() {
    print_header "Manus Agent Web - Environment Configuration"
    
    local env_file=".env.local"
    local temp_file=".env.local.tmp"
    
    # Check if .env.local already exists
    if [ -f "$env_file" ]; then
        print_warning ".env.local already exists"
        read -p "Do you want to reconfigure? (y/n) [n]: " reconfigure
        if [ "$reconfigure" != "y" ]; then
            print_info "Using existing .env.local"
            exit 0
        fi
    fi
    
    print_header "Database Configuration"
    
    local db_type=$(prompt_input "Database type (mysql/postgresql)" "mysql")
    local db_host=$(prompt_input "Database host" "localhost")
    local db_port=$(prompt_input "Database port" "3306")
    local db_user=$(prompt_input "Database user" "root")
    local db_password=$(prompt_input "Database password" "")
    local db_name=$(prompt_input "Database name" "manus_agent_web")
    
    local database_url="${db_type}://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
    
    print_header "JWT Configuration"
    
    local jwt_secret=$(prompt_input "JWT Secret (leave blank to generate)" "")
    if [ -z "$jwt_secret" ]; then
        jwt_secret=$(openssl rand -base64 32)
        print_success "Generated JWT Secret: $jwt_secret"
    fi
    
    print_header "OAuth Configuration"
    
    local app_id=$(prompt_input "Manus App ID" "")
    local app_name=$(prompt_input "Application Name" "Manus Agent Web")
    local owner_name=$(prompt_input "Owner Name" "")
    local owner_id=$(prompt_input "Owner Open ID" "")
    
    print_header "API Configuration"
    
    local forge_url=$(prompt_input "Forge API URL" "https://api.manus.im/forge")
    local forge_key=$(prompt_input "Forge API Key" "")
    local frontend_forge_key=$(prompt_input "Frontend Forge API Key" "")
    
    print_header "Optional: Stripe Configuration"
    
    read -p "Configure Stripe? (y/n) [n]: " setup_stripe
    local stripe_secret=""
    local stripe_public=""
    local stripe_webhook=""
    
    if [ "$setup_stripe" = "y" ]; then
        stripe_secret=$(prompt_input "Stripe Secret Key" "")
        stripe_public=$(prompt_input "Stripe Publishable Key" "")
        stripe_webhook=$(prompt_input "Stripe Webhook Secret" "")
    fi
    
    print_header "Optional: Analytics Configuration"
    
    read -p "Configure Analytics? (y/n) [n]: " setup_analytics
    local analytics_url=""
    local analytics_id=""
    
    if [ "$setup_analytics" = "y" ]; then
        analytics_url=$(prompt_input "Analytics Endpoint" "https://analytics.manus.im")
        analytics_id=$(prompt_input "Analytics Website ID" "")
    fi
    
    # Create .env.local file
    print_header "Creating .env.local"
    
    cat > "$temp_file" << EOF
# Database Configuration
DATABASE_URL="${database_url}"

# JWT Configuration
JWT_SECRET="${jwt_secret}"

# OAuth Configuration
VITE_APP_ID="${app_id}"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# Owner Configuration
OWNER_NAME="${owner_name}"
OWNER_OPEN_ID="${owner_id}"

# Forge API Configuration
BUILT_IN_FORGE_API_URL="${forge_url}"
BUILT_IN_FORGE_API_KEY="${forge_key}"
VITE_FRONTEND_FORGE_API_URL="${forge_url}"
VITE_FRONTEND_FORGE_API_KEY="${frontend_forge_key}"

# Stripe Configuration
STRIPE_SECRET_KEY="${stripe_secret}"
STRIPE_WEBHOOK_SECRET="${stripe_webhook}"
VITE_STRIPE_PUBLISHABLE_KEY="${stripe_public}"

# Analytics Configuration
VITE_ANALYTICS_ENDPOINT="${analytics_url}"
VITE_ANALYTICS_WEBSITE_ID="${analytics_id}"

# Application Configuration
VITE_APP_TITLE="${app_name}"
VITE_APP_LOGO="https://manus.im/logo.svg"

# Environment
NODE_ENV="development"
EOF
    
    mv "$temp_file" "$env_file"
    print_success ".env.local created successfully"
    
    print_header "Configuration Complete"
    
    print_info "Next steps:"
    echo "  1. Review .env.local for accuracy"
    echo "  2. Run: bash run-dev.sh"
    echo "  3. Open http://localhost:3000 in your browser"
    echo ""
    print_warning "Keep .env.local secure and never commit it to version control"
}

# Run main function
main
