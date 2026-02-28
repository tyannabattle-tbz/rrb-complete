#!/bin/bash

# Create complete RRB deployment package for Mac mini
set -e

echo "📦 Creating RRB Complete Ecosystem Deployment Package..."

# Create temp directory
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/rrb-ecosystem"
mkdir -p "$PACKAGE_DIR"

# Copy essential files
echo "Copying project files..."
cp -r server "$PACKAGE_DIR/"
cp -r client "$PACKAGE_DIR/"
cp -r drizzle "$PACKAGE_DIR/"
cp -r shared "$PACKAGE_DIR/"
cp -r storage "$PACKAGE_DIR/"
cp package.json "$PACKAGE_DIR/"
cp pnpm-lock.yaml "$PACKAGE_DIR/" 2>/dev/null || true
cp tsconfig.json "$PACKAGE_DIR/" 2>/dev/null || true
cp vite.config.ts "$PACKAGE_DIR/" 2>/dev/null || true
cp .gitignore "$PACKAGE_DIR/" 2>/dev/null || true

# Copy deployment scripts
echo "Copying deployment scripts..."
cp DEPLOY_MAC_MINI.sh "$PACKAGE_DIR/"
cp RRB_COMPLETE_ECOSYSTEM_GUIDE.md "$PACKAGE_DIR/"
cp RRB_BUILD_PLAN.md "$PACKAGE_DIR/" 2>/dev/null || true
cp BUILD_COMPLETE_ECOSYSTEM.sh "$PACKAGE_DIR/"

# Create README for deployment
cat > "$PACKAGE_DIR/README.md" << 'README_EOF'
# RRB Complete Ecosystem - Mac mini Deployment Package

## Quick Start (3 steps)

### 1. Extract this package
```bash
unzip rrb-ecosystem.zip
cd rrb-ecosystem
```

### 2. Run deployment script
```bash
chmod +x DEPLOY_MAC_MINI.sh
./DEPLOY_MAC_MINI.sh
```

### 3. Start the system
```bash
~/rrb-ecosystem/start-rrb.sh
```

Access at: **http://localhost:3000**

## What's Included

✅ Complete RRB ecosystem (all 9 phases)
✅ Qumus autonomous orchestration
✅ Offline-first architecture
✅ SQLite database
✅ Local LLM (Ollama)
✅ Radio station, healing frequencies, games, donations, merchandise
✅ Deployment automation
✅ Comprehensive documentation

## System Requirements

- Mac mini (M1/M2 or Intel)
- 8GB RAM minimum
- 10GB disk space
- macOS 11+
- Homebrew (will be installed if needed)

## Features

🎵 **Radio Station** - 24/7 broadcasting with Qumus scheduling
🧘 **Healing Frequencies** - 9 Solfeggio frequencies with binaural beats
🎲 **Solbones Game** - Sacred math dice game with AI
🚨 **Emergency Broadcast** - Offline emergency alerts
💝 **Donations** - Nonprofit giving platform
🛍️ **Merchandise** - Product shop with inventory
🧠 **Qumus** - 90% autonomous orchestration

## Offline Operation

✅ SQLite (no cloud database)
✅ Ollama (local LLM, no API keys)
✅ Local storage (no S3)
✅ Complete autonomy (no Manus)
✅ Full privacy (data stays local)

## Documentation

- `RRB_COMPLETE_ECOSYSTEM_GUIDE.md` - Full system guide
- `RRB_BUILD_PLAN.md` - Build details
- `DEPLOY_MAC_MINI.sh` - Deployment script

## Support

For issues:
1. Check logs: `tail -f ~/rrb-ecosystem/logs/rrb.log`
2. Review guide: `RRB_COMPLETE_ECOSYSTEM_GUIDE.md`
3. Restart: `~/rrb-ecosystem/start-rrb.sh`

---

**Built with ❤️ for RRB by Qumus**  
**Offline. Autonomous. Yours.**
README_EOF

# Create installation instructions
cat > "$PACKAGE_DIR/INSTALLATION.txt" << 'INSTALL_EOF'
╔════════════════════════════════════════════════════════════════╗
║     RRB COMPLETE ECOSYSTEM - MAC MINI DEPLOYMENT PACKAGE       ║
║                  Version 1.0 - February 2026                   ║
╚════════════════════════════════════════════════════════════════╝

QUICK START (3 COMMANDS):

1. Extract:
   unzip rrb-ecosystem.zip && cd rrb-ecosystem

2. Deploy:
   chmod +x DEPLOY_MAC_MINI.sh && ./DEPLOY_MAC_MINI.sh

3. Start:
   ~/rrb-ecosystem/start-rrb.sh

Then visit: http://localhost:3000

═══════════════════════════════════════════════════════════════════

WHAT YOU GET:

✅ Complete RRB Radio Station
✅ Healing Frequencies (9 Solfeggio)
✅ Solbones Dice Game
✅ Emergency Broadcast System
✅ Donations Platform
✅ Merchandise Shop
✅ Qumus Autonomous Orchestration (90% autonomous)
✅ 100% Offline Operation
✅ Zero Manus Dependency

═══════════════════════════════════════════════════════════════════

SYSTEM REQUIREMENTS:

- Mac mini (M1/M2 or Intel)
- 8GB RAM
- 10GB disk space
- macOS 11+

═══════════════════════════════════════════════════════════════════

FEATURES:

📻 Radio: 3 channels, 24/7 scheduling, listener tracking
🧘 Healing: 9 frequencies, binaural beats, meditation sessions
🎲 Games: Solbones 4+3+2 dice, AI opponents, scoring
🚨 Emergency: Offline alerts, multi-channel broadcast
💝 Donations: Impact tracking, nonprofit metrics
🛍️ Shop: Products, inventory, orders
🧠 Qumus: Autonomous decisions, policy evaluation, LLM integration

═══════════════════════════════════════════════════════════════════

OFFLINE CAPABILITIES:

✅ SQLite database (no cloud)
✅ Ollama local LLM (no API keys)
✅ Local file storage
✅ Complete autonomy
✅ Full privacy

═══════════════════════════════════════════════════════════════════

DEPLOYMENT DETAILS:

The DEPLOY_MAC_MINI.sh script will:

1. Check system requirements
2. Install Node.js (if needed)
3. Install pnpm (if needed)
4. Install Ollama (if needed)
5. Clone/setup project
6. Install dependencies
7. Setup SQLite database
8. Configure environment
9. Build project
10. Create startup scripts
11. Setup auto-start (optional)

Total time: 15-30 minutes (depending on internet speed)

═══════════════════════════════════════════════════════════════════

AFTER DEPLOYMENT:

Location: ~/rrb-ecosystem

Start system:
  ~/rrb-ecosystem/start-rrb.sh

Access:
  http://localhost:3000

View logs:
  tail -f ~/rrb-ecosystem/logs/rrb.log

Backup data:
  cp -r ~/rrb-ecosystem/data ~/rrb-ecosystem/data.backup

═══════════════════════════════════════════════════════════════════

DOCUMENTATION:

- README.md - Quick overview
- RRB_COMPLETE_ECOSYSTEM_GUIDE.md - Full documentation
- RRB_BUILD_PLAN.md - Build details
- DEPLOY_MAC_MINI.sh - Deployment script

═══════════════════════════════════════════════════════════════════

SUPPORT:

For issues:
1. Read: RRB_COMPLETE_ECOSYSTEM_GUIDE.md
2. Check: ~/rrb-ecosystem/logs/rrb.log
3. Restart: ~/rrb-ecosystem/start-rrb.sh

═══════════════════════════════════════════════════════════════════

Built with ❤️ for RRB by Qumus
Offline. Autonomous. Yours.
INSTALL_EOF

# Create data directories
mkdir -p "$PACKAGE_DIR/data"
mkdir -p "$PACKAGE_DIR/uploads"
mkdir -p "$PACKAGE_DIR/logs"

# Create .gitkeep files to preserve directories
touch "$PACKAGE_DIR/data/.gitkeep"
touch "$PACKAGE_DIR/uploads/.gitkeep"
touch "$PACKAGE_DIR/logs/.gitkeep"

# Create zip file
echo "Creating zip package..."
cd "$TEMP_DIR"
zip -r -q rrb-ecosystem.zip rrb-ecosystem/

# Copy to home directory
OUTPUT_FILE="$HOME/rrb-ecosystem-complete.zip"
cp "$TEMP_DIR/rrb-ecosystem.zip" "$OUTPUT_FILE"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Deployment package created!"
echo ""
echo "📦 Location: $OUTPUT_FILE"
echo "📊 Size: $(du -h $OUTPUT_FILE | cut -f1)"
echo ""
echo "🚀 To deploy:"
echo "   1. Download: $OUTPUT_FILE"
echo "   2. Extract: unzip rrb-ecosystem-complete.zip"
echo "   3. Deploy: cd rrb-ecosystem && ./DEPLOY_MAC_MINI.sh"
echo "   4. Start: ~/rrb-ecosystem/start-rrb.sh"
echo ""
