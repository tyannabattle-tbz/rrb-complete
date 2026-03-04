#!/bin/bash

# Setup mDNS/Bonjour service discovery for Mac Mini
# This script configures local network access via .local domain names

set -e

echo "=== QUMUS Ecosystem - mDNS/Bonjour Setup ==="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This script is designed for macOS. Detected OS: $OSTYPE"
    echo "For Linux, use Avahi instead."
    exit 1
fi

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Avahi (mDNS daemon for macOS)
echo "📦 Installing Avahi for mDNS support..."
brew install avahi 2>/dev/null || echo "✓ Avahi already installed"

# Create service directory if it doesn't exist
SERVICES_DIR="/etc/avahi/services"
if [ ! -d "$SERVICES_DIR" ]; then
    echo "📁 Creating Avahi services directory..."
    sudo mkdir -p "$SERVICES_DIR"
fi

# Create QUMUS Core mDNS service
echo "🔧 Configuring QUMUS Core (.local domain)..."
sudo tee "$SERVICES_DIR/qumus.service" > /dev/null <<'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">QUMUS Core - %h</name>
  <service>
    <type>_http._tcp</type>
    <port>3000</port>
    <txt-record>path=/</txt-record>
    <txt-record>description=QUMUS Orchestration Engine</txt-record>
  </service>
  <service>
    <type>_qumus._tcp</type>
    <port>3000</port>
    <txt-record>version=1.0</txt-record>
  </service>
</service-group>
EOF

# Create RRB Radio mDNS service
echo "🔧 Configuring RRB Radio (.local domain)..."
sudo tee "$SERVICES_DIR/rrb.service" > /dev/null <<'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">RRB Radio - %h</name>
  <service>
    <type>_http._tcp</type>
    <port>3001</port>
    <txt-record>path=/</txt-record>
    <txt-record>description=Rockin Rockin Boogie Radio Station</txt-record>
  </service>
  <service>
    <type>_rrb._tcp</type>
    <port>3001</port>
    <txt-record>version=1.0</txt-record>
  </service>
</service-group>
EOF

# Create HybridCast mDNS service
echo "🔧 Configuring HybridCast (.local domain)..."
sudo tee "$SERVICES_DIR/hybridcast.service" > /dev/null <<'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">HybridCast Emergency - %h</name>
  <service>
    <type>_http._tcp</type>
    <port>3002</port>
    <txt-record>path=/</txt-record>
    <txt-record>description=HybridCast Emergency Broadcast System</txt-record>
  </service>
  <service>
    <type>_hybridcast._tcp</type>
    <port>3002</port>
    <txt-record>version=1.0</txt-record>
  </service>
</service-group>
EOF

# Restart Avahi daemon
echo "🔄 Restarting Avahi daemon..."
sudo launchctl stop com.avahi.daemon 2>/dev/null || true
sleep 1
sudo launchctl start com.avahi.daemon 2>/dev/null || true

# Wait for daemon to start
sleep 2

# Test mDNS resolution
echo ""
echo "🧪 Testing mDNS resolution..."
echo ""

# Get the Mac Mini hostname
HOSTNAME=$(hostname -s)
echo "Mac Mini Hostname: $HOSTNAME"
echo ""

# Test QUMUS
echo -n "Testing QUMUS (qumus.local)... "
if ping -c 1 -W 1 qumus.local &> /dev/null; then
    echo "✅ OK"
else
    echo "⚠️  May take a moment to propagate"
fi

# Test RRB
echo -n "Testing RRB (rrb.local)... "
if ping -c 1 -W 1 rrb.local &> /dev/null; then
    echo "✅ OK"
else
    echo "⚠️  May take a moment to propagate"
fi

# Test HybridCast
echo -n "Testing HybridCast (hybridcast.local)... "
if ping -c 1 -W 1 hybridcast.local &> /dev/null; then
    echo "✅ OK"
else
    echo "⚠️  May take a moment to propagate"
fi

echo ""
echo "=== mDNS Configuration Complete ==="
echo ""
echo "📋 Access services via local network:"
echo ""
echo "QUMUS Core:"
echo "  http://qumus.local:3000"
echo "  http://qumus.local (via Nginx)"
echo ""
echo "RRB Radio:"
echo "  http://rrb.local:3001"
echo "  http://rrb.local (via Nginx)"
echo ""
echo "HybridCast:"
echo "  http://hybridcast.local:3002"
echo "  http://hybridcast.local (via Nginx)"
echo ""
echo "💡 Tip: Services are accessible from any device on your local network"
echo "   using the .local domain names above."
echo ""
echo "🔧 To verify Avahi is running:"
echo "   sudo launchctl list | grep avahi"
echo ""
echo "📝 To view Avahi logs:"
echo "   log stream --predicate 'eventMessage contains \"avahi\"' --level debug"
echo ""
