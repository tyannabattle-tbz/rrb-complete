#!/bin/bash

# WireGuard VPN Setup for QUMUS Ecosystem
# Enables secure remote access to Mac Mini deployment

set -e

echo "=== QUMUS Ecosystem - WireGuard VPN Setup ==="
echo ""

# Check OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - Installing WireGuard..."
    
    # Install WireGuard via Homebrew
    if ! command -v wireguard-go &> /dev/null; then
        brew install wireguard-tools
    fi
    
    # Create WireGuard config directory
    mkdir -p /usr/local/etc/wireguard
    
    WG_CONFIG="/usr/local/etc/wireguard"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected - Installing WireGuard..."
    
    # Install WireGuard
    sudo apt-get update
    sudo apt-get install -y wireguard wireguard-tools
    
    WG_CONFIG="/etc/wireguard"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo "📁 WireGuard config directory: $WG_CONFIG"
echo ""

# Generate server keys
echo "🔐 Generating WireGuard server keys..."
SERVER_PRIVATE_KEY=$(wg genkey)
SERVER_PUBLIC_KEY=$(echo $SERVER_PRIVATE_KEY | wg pubkey)

echo "✅ Server keys generated"
echo ""

# Generate client keys
echo "🔐 Generating WireGuard client keys..."
CLIENT_PRIVATE_KEY=$(wg genkey)
CLIENT_PUBLIC_KEY=$(echo $CLIENT_PRIVATE_KEY | wg pubkey)

echo "✅ Client keys generated"
echo ""

# Create server configuration
echo "📝 Creating server configuration..."

SERVER_CONFIG="$WG_CONFIG/wg0.conf"

cat > "$SERVER_CONFIG" <<EOF
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = $SERVER_PRIVATE_KEY
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Client configuration
[Peer]
PublicKey = $CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
EOF

if [[ "$OSTYPE" == "darwin"* ]]; then
    chmod 600 "$SERVER_CONFIG"
else
    sudo chmod 600 "$SERVER_CONFIG"
fi

echo "✅ Server configuration created: $SERVER_CONFIG"
echo ""

# Create client configuration
echo "📝 Creating client configuration..."

CLIENT_CONFIG="qumus-client.conf"

cat > "$CLIENT_CONFIG" <<EOF
[Interface]
Address = 10.0.0.2/24
PrivateKey = $CLIENT_PRIVATE_KEY
DNS = 8.8.8.8, 8.8.4.4

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = qumus.local:51820
AllowedIPs = 10.0.0.0/24, 192.168.0.0/16
PersistentKeepalive = 25
EOF

echo "✅ Client configuration created: $CLIENT_CONFIG"
echo ""

# Create Docker WireGuard service
echo "📝 Creating Docker WireGuard service..."

cat > "docker-wireguard-service.yml" <<'EOF'
version: '3.8'

services:
  wireguard:
    image: linuxserver/wireguard:latest
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
      - SERVERURL=qumus.local
      - SERVERPORT=51820
      - PEERS=1
      - PEERDNS=8.8.8.8
      - INTERNAL_SUBNET=10.0.0.0
      - ALLOWEDIPS=0.0.0.0/0
    volumes:
      - ./wireguard:/config
      - /lib/modules:/lib/modules
    ports:
      - "51820:51820/udp"
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
    networks:
      - qumus-network

networks:
  qumus-network:
    external: true
EOF

echo "✅ Docker WireGuard service created"
echo ""

# Create connection guide
echo "📝 Creating connection guide..."

cat > "WIREGUARD_SETUP.md" <<EOF
# WireGuard VPN Setup Guide

## Server Information

**Server Address:** qumus.local:51820
**Server Public Key:** $SERVER_PUBLIC_KEY
**Server Network:** 10.0.0.0/24

## Client Configuration

### macOS

1. Install WireGuard from App Store or via Homebrew:
   \`\`\`bash
   brew install wireguard-tools
   \`\`\`

2. Import the client configuration:
   \`\`\`bash
   sudo wg-quick up ./qumus-client.conf
   \`\`\`

3. Connect to the VPN:
   - Open WireGuard app
   - Import \`qumus-client.conf\`
   - Click "Activate"

### Linux

1. Install WireGuard:
   \`\`\`bash
   sudo apt-get install wireguard wireguard-tools
   \`\`\`

2. Copy client config:
   \`\`\`bash
   sudo cp qumus-client.conf /etc/wireguard/
   \`\`\`

3. Activate VPN:
   \`\`\`bash
   sudo wg-quick up qumus-client
   \`\`\`

### Windows

1. Download WireGuard from https://www.wireguard.com/install/

2. Import the client configuration file

3. Click "Activate"

## Verification

Once connected, verify the connection:

\`\`\`bash
# Check WireGuard status
wg show

# Test connectivity
ping 10.0.0.1

# Access services via VPN
curl https://qumus.local:3000
curl https://rrb.local:3001
curl https://hybridcast.local:3002
\`\`\`

## Troubleshooting

### Connection refused
- Ensure WireGuard service is running: \`sudo systemctl status wg-quick@wg0\`
- Check firewall allows port 51820 UDP

### DNS not resolving
- Verify DNS settings in client config
- Test with: \`nslookup qumus.local\`

### Slow connection
- Check network latency: \`ping -c 5 10.0.0.1\`
- Verify bandwidth: \`iperf3 -c 10.0.0.1\`

## Security Best Practices

1. **Rotate keys regularly** - Generate new keys every 90 days
2. **Use strong DNS** - Consider using Cloudflare (1.1.1.1) or Quad9 (9.9.9.9)
3. **Enable firewall** - Restrict VPN access to specific IPs
4. **Monitor connections** - Check \`wg show\` regularly
5. **Backup configs** - Keep secure backups of all configuration files

## Advanced Configuration

### Multiple Clients

To add more clients, generate new key pairs and add to server config:

\`\`\`
[Peer]
PublicKey = <new_client_public_key>
AllowedIPs = 10.0.0.3/32
\`\`\`

### Bandwidth Limiting

Add to Docker WireGuard service:

\`\`\`yaml
environment:
  - BANDWIDTH_LIMIT=100m
\`\`\`

### Custom DNS

Modify client config:

\`\`\`
[Interface]
DNS = 1.1.1.1, 8.8.8.8
\`\`\`

EOF

echo "✅ Connection guide created: WIREGUARD_SETUP.md"
echo ""

# Display summary
echo "=== WireGuard Setup Complete ==="
echo ""
echo "📋 Configuration Files:"
echo "  Server: $SERVER_CONFIG"
echo "  Client: $CLIENT_CONFIG"
echo "  Docker: docker-wireguard-service.yml"
echo ""
echo "🔐 Key Information:"
echo "  Server Public Key: $SERVER_PUBLIC_KEY"
echo "  Client Public Key: $CLIENT_PUBLIC_KEY"
echo ""
echo "📝 Next Steps:"
echo "1. Review the client configuration: cat $CLIENT_CONFIG"
echo "2. Share client config with remote users securely"
echo "3. Start WireGuard service: sudo wg-quick up $SERVER_CONFIG"
echo "4. Monitor connections: wg show"
echo ""
echo "💡 For Docker deployment:"
echo "1. Add docker-wireguard-service.yml to docker-compose.yml"
echo "2. Update docker-compose.yml with wireguard service"
echo "3. Restart Docker: docker-compose up -d wireguard"
echo ""
