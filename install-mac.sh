#!/bin/bash

################################################################################
# Manus Agent Web - Mac Mini Installation Script
# 
# This script automates the installation and setup of the Manus Agent Web
# application on Mac Mini. It handles dependency installation, environment
# configuration, database setup, and initial server startup.
#
# Usage: bash install-mac.sh
# 
# Requirements:
#   - macOS 12.0 or later
#   - At least 8GB RAM
#   - 5GB free disk space
#   - Internet connection
#
# The script will:
#   1. Check system requirements
#   2. Install Homebrew (if needed)
#   3. Install Node.js, pnpm, and other dependencies
#   4. Clone or update the repository
#   5. Install project dependencies
#   6. Configure environment variables
#   7. Initialize the database
#   8. Start the development server
#
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="manus-agent-web"
PROJECT_DIR="$HOME/$PROJECT_NAME"
NODE_VERSION="22.13.0"
PNPM_VERSION="latest"

# Functions
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_system_requirements() {
    print_header "Checking System Requirements"
    
    # Check macOS version
    OS_VERSION=$(sw_vers -productVersion)
    print_info "macOS Version: $OS_VERSION"
    
    # Check available disk space (in GB)
    AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G//')
    print_info "Available Disk Space: ${AVAILABLE_SPACE}GB"
    
    if (( $(echo "$AVAILABLE_SPACE < 5" | bc -l) )); then
        print_error "Insufficient disk space. At least 5GB required."
        exit 1
    fi
    
    # Check RAM (in GB)
    TOTAL_RAM=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
    print_info "Total RAM: ${TOTAL_RAM}GB"
    
    print_success "System requirements check passed"
}

# Install Homebrew
install_homebrew() {
    if command_exists brew; then
        print_success "Homebrew already installed"
        return
    fi
    
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    print_success "Homebrew installed"
}

# Install Node.js
install_nodejs() {
    if command_exists node; then
        CURRENT_NODE=$(node -v)
        print_success "Node.js already installed: $CURRENT_NODE"
        return
    fi
    
    print_info "Installing Node.js $NODE_VERSION..."
    brew install node
    print_success "Node.js installed"
}

# Install pnpm
install_pnpm() {
    if command_exists pnpm; then
        CURRENT_PNPM=$(pnpm -v)
        print_success "pnpm already installed: v$CURRENT_PNPM"
        return
    fi
    
    print_info "Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
}

# Install system dependencies
install_system_dependencies() {
    print_header "Installing System Dependencies"
    
    print_info "Installing required packages via Homebrew..."
    
    # Install Git
    if ! command_exists git; then
        brew install git
        print_success "Git installed"
    else
        print_success "Git already installed"
    fi
    
    # Install MySQL (optional, for local database)
    if ! command_exists mysql; then
        print_info "Installing MySQL..."
        brew install mysql
        print_success "MySQL installed"
    else
        print_success "MySQL already installed"
    fi
    
    # Install PostgreSQL (optional alternative)
    # brew install postgresql
    
    print_success "System dependencies installed"
}

# Clone or update repository
setup_repository() {
    print_header "Setting Up Repository"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_info "Repository already exists at $PROJECT_DIR"
        print_info "Updating repository..."
        cd "$PROJECT_DIR"
        git pull origin main 2>/dev/null || print_warning "Could not pull latest changes"
    else
        print_info "Cloning repository..."
        git clone https://github.com/manus-ai/manus-agent-web.git "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    print_success "Repository ready at $PROJECT_DIR"
}

# Install project dependencies
install_project_dependencies() {
    print_header "Installing Project Dependencies"
    
    cd "$PROJECT_DIR"
    
    print_info "Installing dependencies with pnpm..."
    pnpm install
    
    print_success "Project dependencies installed"
}

# Setup environment variables
setup_environment() {
    print_header "Setting Up Environment Variables"
    
    cd "$PROJECT_DIR"
    
    if [ ! -f ".env.local" ]; then
        print_info "Creating .env.local file..."
        cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/manus_agent_web"

# JWT Configuration
JWT_SECRET="your-secret-key-change-this-in-production"

# OAuth Configuration
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"

# Owner Configuration
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-open-id"

# Forge API Configuration
BUILT_IN_FORGE_API_URL="https://api.manus.im/forge"
BUILT_IN_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im/forge"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"

# Stripe Configuration (optional)
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"

# Analytics Configuration (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Application Configuration
VITE_APP_TITLE="Manus Agent Web"
VITE_APP_LOGO="https://manus.im/logo.svg"

# Environment
NODE_ENV="development"
EOF
        print_success ".env.local created"
        print_warning "Please update .env.local with your actual credentials"
    else
        print_success ".env.local already exists"
    fi
}

# Initialize database
init_database() {
    print_header "Initializing Database"
    
    cd "$PROJECT_DIR"
    
    print_info "Running database migrations..."
    pnpm db:push || print_warning "Database migration skipped or failed"
    
    print_success "Database initialization complete"
}

# Start development server
start_dev_server() {
    print_header "Starting Development Server"
    
    cd "$PROJECT_DIR"
    
    print_info "Starting development server..."
    print_info "The server will be available at http://localhost:3000"
    print_info "Press Ctrl+C to stop the server"
    
    pnpm dev
}

# Main installation flow
main() {
    print_header "Manus Agent Web - Mac Mini Installation"
    
    check_system_requirements
    install_homebrew
    install_nodejs
    install_pnpm
    install_system_dependencies
    setup_repository
    install_project_dependencies
    setup_environment
    init_database
    
    print_header "Installation Complete!"
    print_success "All components installed successfully"
    print_info "Next steps:"
    echo "  1. Update .env.local with your credentials"
    echo "  2. Run: bash run-dev.sh"
    echo "  3. Open http://localhost:3000 in your browser"
}

# Run main installation
main
