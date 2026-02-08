#!/bin/bash

################################################################################
# QUMUS Production Deployment Script
# Automates deployment to production server with comprehensive verification
# Usage: ./deploy-production.sh [--domain your-domain.com] [--skip-ssl] [--skip-monitoring]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-}"
SKIP_SSL="${2:-}"
SKIP_MONITORING="${3:-}"
APP_NAME="qumus"
APP_PORT=3000
WEBSOCKET_PORT=3001
BACKUP_DIR="/backups/qumus"
LOG_DIR="/var/log/qumus"

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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
    print_success "Running as root"
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION installed"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        exit 1
    fi
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm $PNPM_VERSION installed"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed"
        exit 1
    fi
    print_success "PostgreSQL installed"
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx is not installed"
        exit 1
    fi
    print_success "Nginx installed"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not installed, installing globally..."
        npm install -g pm2
    fi
    print_success "PM2 installed"
}

# Create backup before deployment
create_backup() {
    print_header "Creating Pre-Deployment Backup"
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/qumus-pre-deployment-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    print_info "Creating backup: $BACKUP_FILE"
    tar --exclude='node_modules' --exclude='.git' --exclude='dist' \
        --exclude='build' --exclude='.next' --exclude='*.log' \
        -czf "$BACKUP_FILE" /home/ubuntu/manus-agent-web/
    
    print_success "Backup created: $BACKUP_FILE"
}

# Verify environment configuration
verify_environment() {
    print_header "Verifying Environment Configuration"
    
    if [ ! -f "/home/ubuntu/manus-agent-web/.env.production" ]; then
        print_error ".env.production file not found"
        exit 1
    fi
    
    # Check required environment variables
    source /home/ubuntu/manus-agent-web/.env.production
    
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "OAUTH_SERVER_URL")
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Missing required environment variable: $var"
            exit 1
        fi
    done
    
    print_success "All required environment variables configured"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    cd /home/ubuntu/manus-agent-web
    
    print_info "Running pnpm install..."
    pnpm install --frozen-lockfile
    
    print_success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    cd /home/ubuntu/manus-agent-web
    
    print_info "Pushing database schema..."
    pnpm db:push
    
    print_success "Database migrations completed"
}

# Build application
build_application() {
    print_header "Building Application"
    
    cd /home/ubuntu/manus-agent-web
    
    print_info "Building for production..."
    pnpm build
    
    print_success "Application built successfully"
}

# Setup logging
setup_logging() {
    print_header "Setting Up Logging"
    
    mkdir -p "$LOG_DIR"
    chown -R ubuntu:ubuntu "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    # Create logrotate configuration
    cat > /etc/logrotate.d/qumus << 'EOF'
/var/log/qumus/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reload qumus > /dev/null 2>&1 || true
    endscript
}
EOF
    
    print_success "Logging configured"
}

# Start application with PM2
start_application() {
    print_header "Starting Application"
    
    cd /home/ubuntu/manus-agent-web
    
    # Stop existing process if running
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # Start with PM2
    print_info "Starting $APP_NAME with PM2..."
    pm2 start "pnpm start:production" --name "$APP_NAME" \
        --env NODE_ENV=production \
        --log "$LOG_DIR/$APP_NAME.log" \
        --error "$LOG_DIR/$APP_NAME-error.log"
    
    # Save PM2 configuration
    pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
    
    print_success "Application started with PM2"
}

# Verify application is running
verify_application() {
    print_header "Verifying Application"
    
    print_info "Waiting for application to start..."
    sleep 5
    
    # Check if application is responding
    if curl -s http://localhost:$APP_PORT/api/health > /dev/null; then
        print_success "Application is responding on port $APP_PORT"
    else
        print_error "Application is not responding"
        pm2 logs "$APP_NAME"
        exit 1
    fi
}

# Configure Nginx (if domain provided)
configure_nginx() {
    if [ -z "$DOMAIN" ]; then
        print_warning "No domain provided, skipping Nginx configuration"
        return
    fi
    
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/qumus << EOF
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

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL certificates (will be created by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

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

    # Main application
    location / {
        proxy_pass http://localhost:$APP_PORT;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:$WEBSOCKET_PORT;
    }

    # API
    location /api {
        proxy_pass http://localhost:$APP_PORT;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/qumus /etc/nginx/sites-enabled/qumus
    
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

# Setup SSL/TLS (if domain provided and not skipped)
setup_ssl() {
    if [ -z "$DOMAIN" ] || [ "$SKIP_SSL" = "--skip-ssl" ]; then
        print_warning "Skipping SSL/TLS setup"
        return
    fi
    
    print_header "Setting Up SSL/TLS with Let's Encrypt"
    
    # Check if certificate already exists
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        print_success "SSL certificate already exists for $DOMAIN"
        return
    fi
    
    # Obtain certificate
    print_info "Obtaining SSL certificate for $DOMAIN..."
    certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained successfully"
    else
        print_error "Failed to obtain SSL certificate"
        exit 1
    fi
    
    # Setup auto-renewal
    systemctl enable certbot.timer
    systemctl start certbot.timer
    print_success "SSL auto-renewal configured"
}

# Setup monitoring (if not skipped)
setup_monitoring() {
    if [ "$SKIP_MONITORING" = "--skip-monitoring" ]; then
        print_warning "Skipping monitoring setup"
        return
    fi
    
    print_header "Setting Up Monitoring and Alerting"
    
    # Setup PM2 web dashboard
    print_info "Configuring PM2 web dashboard..."
    pm2 web
    print_success "PM2 web dashboard available at http://localhost:9615"
    
    # Create monitoring script
    cat > /usr/local/bin/qumus-monitor.sh << 'EOF'
#!/bin/bash

# QUMUS Monitoring Script
# Checks system health and sends alerts

APP_NAME="qumus"
APP_PORT=3000
EMAIL_TO="${ALERT_EMAIL:-admin@example.com}"

# Check if application is running
if ! pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    echo "ALERT: $APP_NAME is not running" | mail -s "QUMUS Alert" "$EMAIL_TO"
    pm2 start "$APP_NAME"
fi

# Check if application is responding
if ! curl -s http://localhost:$APP_PORT/api/health > /dev/null; then
    echo "ALERT: $APP_NAME is not responding" | mail -s "QUMUS Alert" "$EMAIL_TO"
    pm2 restart "$APP_NAME"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "ALERT: Disk usage is at ${DISK_USAGE}%" | mail -s "QUMUS Alert" "$EMAIL_TO"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "ALERT: Memory usage is at ${MEMORY_USAGE}%" | mail -s "QUMUS Alert" "$EMAIL_TO"
fi
EOF
    
    chmod +x /usr/local/bin/qumus-monitor.sh
    
    # Create cron job for monitoring
    CRON_JOB="*/5 * * * * /usr/local/bin/qumus-monitor.sh"
    (crontab -u ubuntu -l 2>/dev/null | grep -v "qumus-monitor.sh"; echo "$CRON_JOB") | crontab -u ubuntu -
    
    print_success "Monitoring configured with 5-minute health checks"
}

# Setup firewall
setup_firewall() {
    print_header "Configuring Firewall"
    
    if ! command -v ufw &> /dev/null; then
        print_warning "UFW not installed, skipping firewall setup"
        return
    fi
    
    # Allow SSH
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    print_success "Firewall configured"
}

# Final verification
final_verification() {
    print_header "Final Verification"
    
    # Check application status
    if pm2 describe "$APP_NAME" | grep -q "online"; then
        print_success "Application is running"
    else
        print_error "Application is not running"
        exit 1
    fi
    
    # Check database connection
    if curl -s http://localhost:$APP_PORT/api/health | grep -q "ok"; then
        print_success "Database connection verified"
    else
        print_warning "Could not verify database connection"
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_warning "Nginx is not running"
    fi
    
    print_header "Deployment Complete!"
    print_success "QUMUS is ready for production"
    
    if [ -n "$DOMAIN" ]; then
        print_info "Access your application at: https://$DOMAIN"
    else
        print_info "Access your application at: http://localhost:$APP_PORT"
    fi
    
    print_info "PM2 Dashboard: http://localhost:9615"
    print_info "View logs: pm2 logs $APP_NAME"
}

# Main execution
main() {
    print_header "QUMUS Production Deployment"
    print_info "Domain: ${DOMAIN:-Not configured}"
    print_info "Skip SSL: ${SKIP_SSL:-false}"
    print_info "Skip Monitoring: ${SKIP_MONITORING:-false}"
    
    check_root
    check_requirements
    create_backup
    verify_environment
    install_dependencies
    run_migrations
    build_application
    setup_logging
    start_application
    verify_application
    configure_nginx
    setup_ssl
    setup_monitoring
    setup_firewall
    final_verification
}

# Run main function
main
