#!/bin/bash

# Mac Mini Setup Script for Sweet Miracles NPO Platform
# This script automates the setup process on a fresh Mac Mini

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only"
    exit 1
fi

# Step 1: Check macOS version
print_header "Step 1: Checking macOS Version"
MACOS_VERSION=$(sw_vers -productVersion)
print_success "macOS version: $MACOS_VERSION"

# Step 2: Install Xcode Command Line Tools
print_header "Step 2: Installing Xcode Command Line Tools"
if ! command -v xcode-select &> /dev/null; then
    print_info "Installing Xcode Command Line Tools..."
    xcode-select --install
    print_success "Xcode Command Line Tools installed"
else
    print_success "Xcode Command Line Tools already installed"
fi

# Step 3: Install Homebrew
print_header "Step 3: Installing Homebrew"
if ! command -v brew &> /dev/null; then
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    source ~/.zprofile
    
    print_success "Homebrew installed"
else
    print_success "Homebrew already installed"
    brew update
fi

# Step 4: Install Node.js
print_header "Step 4: Installing Node.js"
if ! command -v node &> /dev/null; then
    print_info "Installing Node.js..."
    brew install node
    print_success "Node.js installed"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js already installed: $NODE_VERSION"
fi

# Step 5: Install pnpm
print_header "Step 5: Installing pnpm"
if ! command -v pnpm &> /dev/null; then
    print_info "Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
else
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm already installed: $PNPM_VERSION"
fi

# Step 6: Install Git
print_header "Step 6: Installing Git"
if ! command -v git &> /dev/null; then
    print_info "Installing Git..."
    brew install git
    print_success "Git installed"
else
    GIT_VERSION=$(git --version)
    print_success "Git already installed: $GIT_VERSION"
fi

# Step 7: Configure Git (if not already configured)
print_header "Step 7: Configuring Git"
GIT_USER=$(git config --global user.name)
if [ -z "$GIT_USER" ]; then
    read -p "Enter your Git user name: " GIT_NAME
    read -p "Enter your Git email: " GIT_EMAIL
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_EMAIL"
    print_success "Git configured"
else
    print_success "Git already configured for: $GIT_USER"
fi

# Step 8: Create Projects Directory
print_header "Step 8: Setting Up Project Directory"
PROJECTS_DIR="$HOME/Projects"
if [ ! -d "$PROJECTS_DIR" ]; then
    mkdir -p "$PROJECTS_DIR"
    print_success "Created $PROJECTS_DIR"
else
    print_success "Projects directory already exists"
fi

# Step 9: Install Project Dependencies
print_header "Step 9: Installing Project Dependencies"
if [ -f "package.json" ]; then
    print_info "Installing dependencies with pnpm..."
    pnpm install
    print_success "Dependencies installed"
else
    print_error "package.json not found. Please run this script from project root"
    exit 1
fi

# Step 10: Set Up Environment Variables
print_header "Step 10: Setting Up Environment Variables"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
        print_info "Please edit .env with your configuration"
    else
        print_error ".env.example not found"
    fi
else
    print_success ".env already exists"
fi

# Step 11: Install Optional Tools
print_header "Step 11: Installing Optional Tools"

# Stripe CLI
if ! command -v stripe &> /dev/null; then
    read -p "Install Stripe CLI? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        brew install stripe/stripe-cli/stripe
        print_success "Stripe CLI installed"
    fi
else
    print_success "Stripe CLI already installed"
fi

# PM2 (Process Manager)
if ! npm list -g pm2 &> /dev/null; then
    read -p "Install PM2 for process management? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g pm2
        print_success "PM2 installed"
    fi
else
    print_success "PM2 already installed"
fi

# Step 12: Database Setup (Optional)
print_header "Step 12: Database Setup"
read -p "Set up database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v mysql &> /dev/null; then
        print_info "Running database migrations..."
        pnpm db:push
        print_success "Database setup complete"
    else
        print_info "MySQL not found. Installing..."
        brew install mysql
        print_info "Starting MySQL..."
        brew services start mysql
        pnpm db:push
        print_success "Database setup complete"
    fi
fi

# Step 13: Build Project
print_header "Step 13: Building Project"
read -p "Build project for production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Building..."
    pnpm build
    print_success "Build complete"
fi

# Final Summary
print_header "Setup Complete! 🎉"
echo ""
echo "Your Mac Mini is ready for Sweet Miracles NPO Platform"
echo ""
echo "Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Start development server: pnpm dev"
echo "3. Open browser: http://localhost:3000"
echo "4. Access Master Dashboard"
echo ""
echo "For more information, see MAC_MINI_SETUP_GUIDE.md"
echo ""
print_success "Happy coding!"
