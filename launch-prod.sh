#!/bin/bash

# ============================================================================
# Manus Agent Web - Production Launch Script
# ============================================================================
# Launches the Manus Agent Web platform in production mode with optimizations
# and security hardening enabled.
#
# Usage: ./launch-prod.sh
# ============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="Manus Agent Web"
LOG_DIR="$SCRIPT_DIR/logs"
PID_FILE="$LOG_DIR/server.pid"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC} ${PROJECT_NAME} - Production Server"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Create logs directory
mkdir -p "$LOG_DIR"

# Check if dependencies are installed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  cd "$SCRIPT_DIR"
  pnpm install
fi

# Check for .env.local
if [ ! -f "$SCRIPT_DIR/.env.local" ]; then
  echo -e "${RED}Error: .env.local not found${NC}"
  echo "Please create .env.local with required production variables"
  exit 1
fi

# Check if server is already running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo -e "${YELLOW}Server already running with PID $OLD_PID${NC}"
    echo "To stop: kill $OLD_PID"
    exit 1
  fi
fi

# Function to handle shutdown
cleanup() {
  echo -e "\n${YELLOW}Shutting down server...${NC}"
  if [ -f "$PID_FILE" ]; then
    rm "$PID_FILE"
  fi
  exit 0
}

trap cleanup SIGINT SIGTERM

# Build production assets if not already built
if [ ! -d "$SCRIPT_DIR/dist" ]; then
  echo -e "${GREEN}Building production assets...${NC}"
  cd "$SCRIPT_DIR"
  pnpm build
fi

# Run database migrations
echo -e "${GREEN}Checking database migrations...${NC}"
cd "$SCRIPT_DIR"
pnpm db:push || echo -e "${YELLOW}Database migration skipped${NC}"

# Start production server
cd "$SCRIPT_DIR"

echo -e "${GREEN}Starting production server...${NC}"
echo -e "${GREEN}Access the application at: http://localhost:3000${NC}"
echo -e "${GREEN}Logs: $LOG_DIR/server.log${NC}\n"

export NODE_ENV=production
export PORT=${PORT:-3000}

# Start server and capture PID
pnpm start > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo -e "${GREEN}Server started with PID: $SERVER_PID${NC}"

# Wait for server process
wait $SERVER_PID
