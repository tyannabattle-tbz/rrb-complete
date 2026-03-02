# Mac Mini Setup Guide - Sweet Miracles NPO Platform

This guide provides step-by-step instructions for setting up the Sweet Miracles NPO autonomous fundraising platform on your Mac Mini (Intel Core i5, 4GB RAM, 500GB SSD).

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Mac Setup](#initial-mac-setup)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Installation](#project-installation)
5. [Remote Access Configuration](#remote-access-configuration)
6. [Master Dashboard Access](#master-dashboard-access)
7. [Deployment Options](#deployment-options)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

**Mac Mini Specifications:**
- **Processor**: Intel Core i5 (4th Gen)
- **RAM**: 4GB
- **Storage**: 500GB SSD
- **OS**: macOS 10.14 or later (recommended: macOS 12+)

**Software Requirements:**
- Node.js 22.13.0 or later
- npm or pnpm package manager
- Git for version control
- Stripe CLI (for payment testing)

---

## Initial Mac Setup

### Step 1: Update macOS

```bash
# Check current macOS version
sw_vers

# Update to latest macOS version
# Go to Apple Menu → System Settings → General → Software Update
```

### Step 2: Install Xcode Command Line Tools

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

### Step 3: Install Homebrew (Package Manager)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (if needed)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile

# Verify installation
brew --version
```

### Step 4: Install Node.js and npm

```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version  # Should be 22.13.0 or later
npm --version

# Install pnpm (faster package manager)
npm install -g pnpm

# Verify pnpm
pnpm --version
```

### Step 5: Install Git

```bash
# Install Git
brew install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify installation
git --version
```

---

## Development Environment Setup

### Step 1: Create Development Directory

```bash
# Create a projects directory
mkdir -p ~/Projects
cd ~/Projects

# Clone the Sweet Miracles repository
git clone https://github.com/your-org/sweet-miracles-platform.git
cd sweet-miracles-platform
```

### Step 2: Install Project Dependencies

```bash
# Install all dependencies
pnpm install

# This will install:
# - Frontend dependencies (React, Tailwind, etc.)
# - Backend dependencies (Express, tRPC, Drizzle, etc.)
# - Development tools (TypeScript, Vitest, etc.)
```

### Step 3: Set Up Environment Variables

```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Required environment variables:
# DATABASE_URL=mysql://user:password@localhost:3306/sweet_miracles
# JWT_SECRET=your-jwt-secret-key
# VITE_APP_ID=your-manus-app-id
# STRIPE_SECRET_KEY=sk_live_...
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Step 4: Set Up Database

```bash
# Create database
createdb sweet_miracles

# Run migrations
pnpm db:push

# Seed initial data (optional)
pnpm db:seed
```

---

## Project Installation

### Step 1: Start Development Server

```bash
# From the project root directory
cd ~/Projects/sweet-miracles-platform

# Start the development server
pnpm dev

# Server will start at http://localhost:3000
# Open in browser: http://localhost:3000
```

### Step 2: Verify Installation

```bash
# In another terminal, test the API
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

### Step 3: Access Master Dashboard

```bash
# Open browser and navigate to:
http://localhost:3000

# Login with your credentials
# You should see the Master Dashboard with:
# - QUMUS Autonomous Orchestration Engine
# - Chat interface
# - Analytics dashboard
# - File upload capabilities
```

---

## Remote Access Configuration

### Option 1: Local Network Access (Recommended for Mac Mini)

**Make your Mac Mini accessible from other devices on the same network:**

```bash
# Find your Mac's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output: inet 192.168.1.100

# Access from other devices:
# http://192.168.1.100:3000
```

### Option 2: Expose to Internet (Using ngrok)

```bash
# Install ngrok
brew install ngrok

# Create ngrok account at https://ngrok.com

# Authenticate ngrok
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Expose your local server
ngrok http 3000

# You'll get a public URL like: https://xxxx-xx-xxx-xx-xx.ngrok.io
```

### Option 3: Manus Built-in Deployment

```bash
# Your project is already deployed at:
# https://3000-iicnzs2r1pdjnx0fhvo1v-1b0a60d8.us2.manus.computer

# You can access it from any device with internet
# No additional setup needed!
```

---

## Master Dashboard Access

### Dashboard Features

The Master Dashboard provides unified control of all platforms:

**1. QUMUS Autonomous Orchestration Engine**
- Real-time agent status monitoring
- Decision policy management
- Service integration oversight
- Autonomous operation control

**2. Chat Interface**
- Direct communication with QUMUS
- File upload support (documents, images, audio)
- Session management
- Real-time streaming responses

**3. Analytics Dashboard**
- Performance metrics
- Usage statistics
- Cost tracking
- Operational insights

**4. File Upload System**
- Document uploads (PDF, Word, Excel)
- Image uploads (JPEG, PNG, WebP)
- Audio uploads (MP3, WAV, OGG)
- File processing (transcription, OCR, analysis)

### Accessing Dashboard from Mac Mini

```bash
# Local access
http://localhost:3000

# Network access (from another device)
http://192.168.1.100:3000

# Remote access (from anywhere)
https://3000-iicnzs2r1pdjnx0fhvo1v-1b0a60d8.us2.manus.computer
```

---

## Deployment Options

### Option 1: Keep Running on Mac Mini (Always-On)

```bash
# Install PM2 for process management
pnpm add -g pm2

# Start application with PM2
pm2 start "pnpm dev" --name "sweet-miracles"

# View logs
pm2 logs sweet-miracles

# Restart on Mac boot
pm2 startup
pm2 save
```

### Option 2: Deploy to Production (Recommended)

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use Manus built-in deployment
# Click "Publish" button in Manus Management UI
```

### Option 3: Docker Containerization

```bash
# Build Docker image
docker build -t sweet-miracles .

# Run container
docker run -p 3000:3000 sweet-miracles

# Or use Docker Compose
docker-compose up
```

---

## Stripe Integration on Mac

### Step 1: Install Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Verify installation
stripe --version

# Login to Stripe
stripe login

# Follow the authentication flow
```

### Step 2: Test Payments Locally

```bash
# Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# You'll get a webhook signing secret
# Add to .env: STRIPE_WEBHOOK_SECRET=whsec_...

# In another terminal, test payment
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1St9hSRzKOILZyAN...",
    "email": "donor@example.com"
  }'
```

### Step 3: Test with Test Card

```bash
# Use Stripe test card in checkout
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)

# This will create a test payment without charging
```

---

## File Upload Feature (QUMUS)

### Supported File Types

**Documents (50MB max):**
- PDF
- Word (.docx)
- Excel (.xlsx)
- Text files
- PowerPoint

**Images (10MB max):**
- JPEG
- PNG
- GIF
- WebP
- SVG

**Audio (100MB max):**
- MP3
- WAV
- OGG
- WebM
- M4A

### Upload via Chat

```javascript
// Example: Upload a file via QUMUS chat
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Convert to base64
const reader = new FileReader();
reader.onload = async (e) => {
  const base64Data = e.target.result.split(',')[1];
  
  // Upload via tRPC
  const result = await trpc.qumusFileUpload.uploadFile.mutate({
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    base64Data,
    description: "My file description"
  });
  
  console.log("Upload successful:", result);
};
reader.readAsDataURL(file);
```

---

## Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Issue: Node Modules Corrupted

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### Issue: Database Connection Failed

```bash
# Check database is running
mysql -u root -p

# Verify DATABASE_URL in .env
# Format: mysql://user:password@localhost:3306/database_name

# Create database if missing
createdb sweet_miracles
```

### Issue: Out of Memory (4GB RAM)

```bash
# Increase Node.js memory limit
export NODE_OPTIONS=--max-old-space-size=2048

# Or modify package.json scripts
"dev": "NODE_OPTIONS=--max-old-space-size=2048 vite"
```

### Issue: TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo

# Rebuild
pnpm tsc --noEmit
```

### Issue: Stripe Webhook Not Receiving Events

```bash
# Verify webhook URL in Stripe Dashboard
# Should be: https://your-domain/api/stripe/webhook

# Check webhook logs
stripe logs tail

# Restart Stripe listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Performance Optimization for Mac Mini

### Memory Management

```bash
# Monitor memory usage
top -l 1 | grep PhysMem

# Limit Node.js memory
export NODE_OPTIONS=--max-old-space-size=1024
```

### Database Optimization

```bash
# Add indexes for frequently queried fields
pnpm db:migrate

# Optimize queries
# Check slow query log
```

### Frontend Optimization

```bash
# Build optimized bundle
pnpm build

# Analyze bundle size
pnpm build --analyze
```

---

## Backup and Maintenance

### Daily Backup

```bash
# Backup database
mysqldump -u root -p sweet_miracles > ~/backups/sweet_miracles_$(date +%Y%m%d).sql

# Backup project files
tar -czf ~/backups/sweet_miracles_$(date +%Y%m%d).tar.gz ~/Projects/sweet-miracles-platform
```

### Weekly Maintenance

```bash
# Update dependencies
pnpm update

# Run tests
pnpm test

# Check for security vulnerabilities
pnpm audit
```

### Monthly Tasks

```bash
# Review logs
tail -f ~/.pm2/logs/sweet-miracles-out.log

# Optimize database
mysql -u root -p sweet_miracles < optimize.sql

# Update macOS and system packages
softwareupdate -a -i
brew update && brew upgrade
```

---

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm tsc              # TypeScript check

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open database UI

# Deployment
pnpm start            # Start production server
pm2 start "pnpm dev"  # Start with PM2

# Stripe
stripe login          # Authenticate
stripe listen         # Listen for webhooks
stripe logs tail      # View webhook logs

# Maintenance
pnpm update           # Update dependencies
pnpm audit            # Security audit
pnpm clean            # Clean cache
```

---

## Support and Resources

- **Manus Documentation**: https://docs.manus.im
- **Stripe Documentation**: https://stripe.com/docs
- **Node.js Documentation**: https://nodejs.org/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## Next Steps

1. ✅ Set up Mac Mini with development environment
2. ✅ Install and configure project
3. ✅ Access Master Dashboard
4. ✅ Test file upload feature
5. ✅ Configure Stripe payments
6. ✅ Deploy to production

**You're ready to manage Sweet Miracles NPO platform from your Mac Mini!** 🚀
