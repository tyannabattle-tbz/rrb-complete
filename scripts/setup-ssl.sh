#!/bin/bash

# SSL/TLS Certificate Setup for QUMUS Ecosystem
# Generates self-signed certificates for local development
# or configures Let's Encrypt for production

set -e

SSL_DIR="./nginx/ssl"
CERT_VALIDITY_DAYS=365
HOSTNAME=$(hostname -s)

echo "=== QUMUS Ecosystem - SSL/TLS Setup ==="
echo ""

# Create SSL directory
mkdir -p "$SSL_DIR"

# Function to generate self-signed certificate
generate_self_signed() {
    local domain=$1
    local cert_file="$SSL_DIR/${domain}.crt"
    local key_file="$SSL_DIR/${domain}.key"
    
    echo "🔐 Generating self-signed certificate for $domain..."
    
    openssl req -x509 -newkey rsa:4096 -keyout "$key_file" -out "$cert_file" \
        -days $CERT_VALIDITY_DAYS -nodes \
        -subj "/C=US/ST=State/L=City/O=QUMUS/CN=$domain"
    
    echo "✅ Certificate generated: $cert_file"
    echo "✅ Private key generated: $key_file"
    echo ""
}

# Function to generate Let's Encrypt certificate
generate_letsencrypt() {
    local domain=$1
    
    echo "🔐 Setting up Let's Encrypt certificate for $domain..."
    
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install certbot
        else
            sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
        fi
    fi
    
    # Generate certificate
    sudo certbot certonly --standalone -d "$domain" --non-interactive --agree-tos -m admin@$domain
    
    # Copy to SSL directory
    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem "$SSL_DIR/${domain}.crt"
    sudo cp /etc/letsencrypt/live/$domain/privkey.pem "$SSL_DIR/${domain}.key"
    sudo chown $(whoami):$(whoami) "$SSL_DIR/${domain}.crt" "$SSL_DIR/${domain}.key"
    
    echo "✅ Let's Encrypt certificate installed"
    echo ""
}

# Prompt user for certificate type
echo "Choose certificate type:"
echo "1) Self-signed (for local development/testing)"
echo "2) Let's Encrypt (for production with valid domain)"
read -p "Enter choice (1 or 2): " cert_choice

if [ "$cert_choice" == "2" ]; then
    read -p "Enter your domain name (e.g., qumus.example.com): " domain_name
    generate_letsencrypt "$domain_name"
else
    # Generate self-signed certificates for all services
    generate_self_signed "qumus.local"
    generate_self_signed "rrb.local"
    generate_self_signed "hybridcast.local"
    generate_self_signed "localhost"
fi

# Create Nginx HTTPS configuration
echo "📝 Creating Nginx HTTPS configuration..."

cat > "$SSL_DIR/nginx-https.conf" <<'EOF'
# HTTPS Server Configuration for QUMUS Ecosystem

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name qumus.local rrb.local hybridcast.local localhost;
    return 301 https://$server_name$request_uri;
}

# QUMUS Core - HTTPS
server {
    listen 443 ssl http2;
    server_name qumus.local;
    
    ssl_certificate /etc/nginx/ssl/qumus.local.crt;
    ssl_certificate_key /etc/nginx/ssl/qumus.local.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://qumus-core:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}

# RRB Radio - HTTPS
server {
    listen 443 ssl http2;
    server_name rrb.local;
    
    ssl_certificate /etc/nginx/ssl/rrb.local.crt;
    ssl_certificate_key /etc/nginx/ssl/rrb.local.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://rrb-radio:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}

# HybridCast - HTTPS
server {
    listen 443 ssl http2;
    server_name hybridcast.local;
    
    ssl_certificate /etc/nginx/ssl/hybridcast.local.crt;
    ssl_certificate_key /etc/nginx/ssl/hybridcast.local.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://hybridcast:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
EOF

echo "✅ HTTPS configuration created: $SSL_DIR/nginx-https.conf"
echo ""

# Create certificate renewal script
cat > "$SSL_DIR/renew-certificates.sh" <<'EOF'
#!/bin/bash
# Automatic certificate renewal script

echo "Renewing Let's Encrypt certificates..."
sudo certbot renew --quiet

echo "Reloading Nginx..."
docker-compose exec nginx nginx -s reload

echo "Certificate renewal complete"
EOF

chmod +x "$SSL_DIR/renew-certificates.sh"

echo "✅ Certificate renewal script created"
echo ""

# Display summary
echo "=== SSL/TLS Setup Complete ==="
echo ""
echo "📋 Certificate Information:"
ls -lh "$SSL_DIR"/*.crt "$SSL_DIR"/*.key 2>/dev/null || echo "No certificates found yet"
echo ""

echo "🔧 Next Steps:"
echo "1. Update docker-compose.yml to expose port 443"
echo "2. Update Nginx configuration to use HTTPS"
echo "3. Add certificate renewal to crontab (for Let's Encrypt)"
echo ""

echo "📝 To use HTTPS configuration:"
echo "   Include $SSL_DIR/nginx-https.conf in your Nginx config"
echo ""

echo "🔐 To verify certificate:"
echo "   openssl x509 -in $SSL_DIR/qumus.local.crt -text -noout"
echo ""
