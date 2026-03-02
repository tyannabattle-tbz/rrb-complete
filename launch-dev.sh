#!/bin/bash

# ============================================================================
# Manus Agent Web - Development Launch Script
# ============================================================================
# Launches the Manus Agent Web platform in development mode with hot reload
# and development tools enabled.
#
# Usage: ./launch-dev.sh
# ============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="Manus Agent Web"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC} ${PROJECT_NAME} - Development Server"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if dependencies are installed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo -e "${GREEN}Installing dependencies...${NC}"
  cd "$SCRIPT_DIR"
  pnpm install
fi

# Check for .env.local
if [ ! -f "$SCRIPT_DIR/.env.local" ]; then
  echo -e "${GREEN}Warning: .env.local not found. Creating template...${NC}"
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.local" 2>/dev/null || echo "Please create .env.local with required variables"
fi

# Start development server
cd "$SCRIPT_DIR"

echo -e "${GREEN}Starting development server...${NC}"
echo -e "${GREEN}Access the application at: http://localhost:3000${NC}\n"

export NODE_ENV=development
pnpm dev
