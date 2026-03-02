#!/bin/bash
set -e

echo "📦 Creating RRB Complete Ecosystem Deployment Package..."

TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/rrb-ecosystem"
mkdir -p "$PACKAGE_DIR"

echo "Copying project files..."
cp -r server "$PACKAGE_DIR/" 2>/dev/null || true
cp -r client "$PACKAGE_DIR/" 2>/dev/null || true
cp -r drizzle "$PACKAGE_DIR/" 2>/dev/null || true
cp -r shared "$PACKAGE_DIR/" 2>/dev/null || true
cp package.json "$PACKAGE_DIR/" 2>/dev/null || true
cp pnpm-lock.yaml "$PACKAGE_DIR/" 2>/dev/null || true
cp tsconfig.json "$PACKAGE_DIR/" 2>/dev/null || true
cp vite.config.ts "$PACKAGE_DIR/" 2>/dev/null || true

echo "Copying deployment scripts..."
cp DEPLOY_MAC_MINI.sh "$PACKAGE_DIR/" 2>/dev/null || true
cp RRB_COMPLETE_ECOSYSTEM_GUIDE.md "$PACKAGE_DIR/" 2>/dev/null || true
cp RRB_BUILD_PLAN.md "$PACKAGE_DIR/" 2>/dev/null || true

cat > "$PACKAGE_DIR/README.md" << 'README_EOF'
# RRB Complete Ecosystem - Mac mini Deployment

## Quick Start

```bash
unzip rrb-ecosystem.zip
cd rrb-ecosystem
chmod +x DEPLOY_MAC_MINI.sh
./DEPLOY_MAC_MINI.sh
~/rrb-ecosystem/start-rrb.sh
```

Access: http://localhost:3000

## What's Included

✅ Complete RRB ecosystem (all 9 phases)
✅ Qumus autonomous orchestration (90% autonomous)
✅ Offline-first architecture (SQLite, Ollama)
✅ Radio station, healing frequencies, games, donations, merchandise
✅ Zero Manus dependency

## Features

📻 Radio Station - 24/7 broadcasting
🧘 Healing Frequencies - 9 Solfeggio frequencies
🎲 Solbones Game - Sacred math dice game
🚨 Emergency Broadcast - Offline alerts
💝 Donations - Nonprofit platform
🛍️ Merchandise - Product shop
🧠 Qumus - 90% autonomous control

Built with ❤️ for RRB by Qumus
README_EOF

mkdir -p "$PACKAGE_DIR/data" "$PACKAGE_DIR/uploads" "$PACKAGE_DIR/logs"
touch "$PACKAGE_DIR/data/.gitkeep" "$PACKAGE_DIR/uploads/.gitkeep" "$PACKAGE_DIR/logs/.gitkeep"

echo "Creating zip package..."
cd "$TEMP_DIR"
zip -r -q rrb-ecosystem.zip rrb-ecosystem/

OUTPUT_FILE="$HOME/rrb-ecosystem-complete.zip"
cp "$TEMP_DIR/rrb-ecosystem.zip" "$OUTPUT_FILE"
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Package created: $OUTPUT_FILE"
echo "📊 Size: $(du -h $OUTPUT_FILE | cut -f1)"
