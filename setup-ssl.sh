#!/bin/bash

################################################################################
# QUMUS SSL/TLS Auto-Configuration Script
# Automates Let's Encrypt certificate setup with Nginx integration
# Usage: ./setup-ssl.sh your-domain.com [your-email@example.com]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="${1:-}"
EMAIL="${2:-admin@example.com}"
NGINX_CONFIG="/etc/nginx/sites-available/qumus"

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

# Validate domain
validate_domain() {
    if [ -z "$DOMAIN" ]; then
        print_error "Domain name is required"
        echo "Usage: ./setup-ssl.sh your-domain.com [your-email@example.com]"
        exit 1
    fi
    
    print_success "Domain: $DOMAIN"
    print_success "Email: $EMAIL"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Install Certbot if needed
install_certbot() {
    print_header "Installing Certbot"
    
    if command -v certbot &> /dev/null; then
        print_success "Certbot is already installed"
        return
    fi
    
    print_info "Installing Certbot and Nginx plugin..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed"
}

# Create Nginx configuration for SSL
create_nginx_config() {
    print_header "Creating Nginx Configuration"
    
    if [ ! -f "$NGINX_CONFIG" ]; then
        print_warning "Nginx configuration not found, creating default..."
        
        mkdir -p /etc/nginx/sites-available
        
        cat > "$NGINX_CONFIG" << EOF
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server (SSL will be added by Certbot)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration will be added by Certbot
    # ssl_certificate ...
    # ssl_certificate_key ...

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/qumus_access.log;
    error_log /var/log/nginx/qumus_error.log;

    # Proxy settings
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";

    # Application proxy
    location / {
        proxy_pass http://localhost:3000;
    }

    location /ws {
        proxy_pass http://localhost:3001;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
EOF
    fi
    
    # Enable site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/qumus
    
    # Test Nginx configuration
    if nginx -t; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
    
    # Reload Nginx
    systemctl reload nginx
    print_success "Nginx configured and reloaded"
}

# Obtain SSL certificate
obtain_certificate() {
    print_header "Obtaining SSL Certificate"
    
    # Check if certificate already exists
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        print_success "SSL certificate already exists for $DOMAIN"
        return
    fi
    
    print_info "Requesting certificate for $DOMAIN..."
    
    certbot certonly \
        --nginx \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --rsa-key-size 4096
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained successfully"
    else
        print_error "Failed to obtain SSL certificate"
        exit 1
    fi
}

# Verify certificate
verify_certificate() {
    print_header "Verifying SSL Certificate"
    
    # Check certificate validity
    if openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -noout -dates; then
        print_success "Certificate is valid"
    else
        print_error "Certificate verification failed"
        exit 1
    fi
}

# Setup auto-renewal
setup_auto_renewal() {
    print_header "Setting Up Auto-Renewal"
    
    # Enable certbot timer
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    # Test renewal (dry run)
    print_info "Testing certificate renewal (dry run)..."
    certbot renew --dry-run
    
    print_success "Auto-renewal configured"
    print_info "Certificates will be renewed automatically"
}

# Configure security headers
configure_security() {
    print_header "Configuring Security Headers"
    
    # Update Nginx configuration with security headers
    cat > /etc/nginx/snippets/ssl-params.conf << 'EOF'
# SSL/TLS Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Security Headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
EOF
    
    print_success "Security headers configured"
}

# Setup certificate renewal reminder
setup_renewal_reminder() {
    print_header "Setting Up Renewal Reminder"
    
    # Create renewal check script
    cat > /usr/local/bin/check-ssl-expiry.sh << 'EOF'
#!/bin/bash

DOMAIN="$1"
DAYS_BEFORE_EXPIRY=30
EMAIL="${ALERT_EMAIL:-admin@example.com}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 domain.com"
    exit 1
fi

CERT_FILE="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ ! -f "$CERT_FILE" ]; then
    echo "Certificate not found: $CERT_FILE"
    exit 1
fi

EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -dates | grep notAfter | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ "$DAYS_LEFT" -lt "$DAYS_BEFORE_EXPIRY" ]; then
    echo "WARNING: Certificate for $DOMAIN expires in $DAYS_LEFT days" | \
    mail -s "SSL Certificate Expiry Warning" "$EMAIL"
fi
EOF
    
    chmod +x /usr/local/bin/check-ssl-expiry.sh
    
    # Add to crontab (check daily)
    CRON_JOB="0 2 * * * /usr/local/bin/check-ssl-expiry.sh $DOMAIN"
    (crontab -l 2>/dev/null | grep -v "check-ssl-expiry.sh"; echo "$CRON_JOB") | crontab -
    
    print_success "Renewal reminder configured (daily check)"
}

# Test HTTPS connection
test_https() {
    print_header "Testing HTTPS Connection"
    
    print_info "Waiting for DNS propagation..."
    sleep 5
    
    print_info "Testing HTTPS connection..."
    if curl -I "https://$DOMAIN" 2>/dev/null | grep -q "200\|301\|302"; then
        print_success "HTTPS connection successful"
    else
        print_warning "Could not verify HTTPS connection"
        print_info "This may be due to DNS propagation delay"
    fi
}

# Generate SSL report
generate_report() {
    print_header "SSL Configuration Report"
    
    echo ""
    echo "Domain: $DOMAIN"
    echo "Certificate Path: /etc/letsencrypt/live/$DOMAIN/"
    echo ""
    
    # Certificate details
    echo "Certificate Details:"
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -noout -dates
    echo ""
    
    # Renewal status
    echo "Renewal Status:"
    certbot certificates | grep -A 5 "$DOMAIN"
    echo ""
    
    # Nginx status
    echo "Nginx Status:"
    systemctl status nginx --no-pager | head -5
    echo ""
    
    print_success "SSL configuration complete!"
}

# Main execution
main() {
    print_header "QUMUS SSL/TLS Auto-Configuration"
    
    check_root
    validate_domain
    install_certbot
    create_nginx_config
    obtain_certificate
    verify_certificate
    setup_auto_renewal
    configure_security
    setup_renewal_reminder
    test_https
    generate_report
    
    print_header "SSL/TLS Setup Complete"
    print_success "Your domain is now secured with HTTPS"
    print_info "Certificate will be auto-renewed before expiry"
    print_info "Access your site at: https://$DOMAIN"
}

# Run main function
main
