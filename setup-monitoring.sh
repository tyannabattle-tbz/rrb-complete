#!/bin/bash

################################################################################
# QUMUS Monitoring and Alerting Setup Script
# Configures PM2 monitoring, log rotation, error tracking, and email alerts
# Usage: ./setup-monitoring.sh [--email your-email@example.com] [--slack webhook-url]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ALERT_EMAIL="${1:-admin@example.com}"
SLACK_WEBHOOK="${2:-}"
APP_NAME="qumus"
APP_PORT=3000
LOG_DIR="/var/log/qumus"
MONITOR_INTERVAL=300  # 5 minutes

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
}

# Setup PM2 monitoring
setup_pm2_monitoring() {
    print_header "Setting Up PM2 Monitoring"
    
    # Install PM2 modules
    print_info "Installing PM2 monitoring modules..."
    pm2 install pm2-auto-pull
    pm2 install pm2-logrotate
    
    # Configure PM2 logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 14
    pm2 set pm2-logrotate:compress true
    
    # Start PM2 web dashboard
    print_info "Starting PM2 web dashboard..."
    pm2 web
    
    # Save PM2 configuration
    pm2 save
    pm2 startup systemd -u ubuntu --hp /home/ubuntu
    
    print_success "PM2 monitoring configured"
    print_info "PM2 Dashboard available at: http://localhost:9615"
}

# Setup log rotation
setup_log_rotation() {
    print_header "Setting Up Log Rotation"
    
    # Create log directory
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
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
    
    # Test logrotate configuration
    logrotate -d /etc/logrotate.d/qumus
    
    print_success "Log rotation configured"
}

# Setup health check monitoring
setup_health_monitoring() {
    print_header "Setting Up Health Check Monitoring"
    
    # Create health check script
    cat > /usr/local/bin/qumus-health-check.sh << 'EOF'
#!/bin/bash

APP_NAME="qumus"
APP_PORT=3000
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
LOG_FILE="/var/log/qumus/health-check.log"

# Function to send email alert
send_email_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    echo "[$(date)] Email alert sent: $subject" >> "$LOG_FILE"
}

# Function to send Slack alert
send_slack_alert() {
    local message="$1"
    
    if [ -z "$SLACK_WEBHOOK" ]; then
        return
    fi
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"QUMUS Alert: $message\"}" \
        "$SLACK_WEBHOOK" 2>/dev/null
    
    echo "[$(date)] Slack alert sent: $message" >> "$LOG_FILE"
}

# Check if application is running
check_app_status() {
    if ! pm2 describe "$APP_NAME" > /dev/null 2>&1; then
        send_email_alert "QUMUS Alert: Application Not Running" \
            "The $APP_NAME application is not running. Attempting to restart..."
        send_slack_alert "Application is not running. Restarting..."
        pm2 start "$APP_NAME"
        return 1
    fi
}

# Check if application is responding
check_app_response() {
    if ! curl -s http://localhost:$APP_PORT/api/health > /dev/null 2>&1; then
        send_email_alert "QUMUS Alert: Application Not Responding" \
            "The $APP_NAME application is not responding on port $APP_PORT. Attempting to restart..."
        send_slack_alert "Application is not responding. Restarting..."
        pm2 restart "$APP_NAME"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        send_email_alert "QUMUS Alert: High Disk Usage" \
            "Disk usage is at ${DISK_USAGE}%. Please clean up old logs and backups."
        send_slack_alert "High disk usage: ${DISK_USAGE}%"
        return 1
    fi
}

# Check memory usage
check_memory_usage() {
    MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        send_email_alert "QUMUS Alert: High Memory Usage" \
            "Memory usage is at ${MEMORY_USAGE}%. Consider increasing server resources."
        send_slack_alert "High memory usage: ${MEMORY_USAGE}%"
        return 1
    fi
}

# Check CPU usage
check_cpu_usage() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')
    
    if [ "$CPU_USAGE" -gt 90 ]; then
        send_email_alert "QUMUS Alert: High CPU Usage" \
            "CPU usage is at ${CPU_USAGE}%. Check for resource-intensive processes."
        send_slack_alert "High CPU usage: ${CPU_USAGE}%"
        return 1
    fi
}

# Check database connection
check_database() {
    if ! curl -s http://localhost:$APP_PORT/api/health | grep -q "database"; then
        send_email_alert "QUMUS Alert: Database Connection Failed" \
            "Unable to connect to the database. Check PostgreSQL service."
        send_slack_alert "Database connection failed"
        return 1
    fi
}

# Check Nginx status
check_nginx() {
    if ! systemctl is-active --quiet nginx; then
        send_email_alert "QUMUS Alert: Nginx Not Running" \
            "Nginx service is not running. Attempting to restart..."
        send_slack_alert "Nginx is not running. Restarting..."
        systemctl start nginx
        return 1
    fi
}

# Main health check
main() {
    echo "[$(date)] Running health check..." >> "$LOG_FILE"
    
    check_app_status
    check_app_response
    check_disk_space
    check_memory_usage
    check_cpu_usage
    check_database
    check_nginx
    
    echo "[$(date)] Health check completed" >> "$LOG_FILE"
}

main
EOF
    
    chmod +x /usr/local/bin/qumus-health-check.sh
    
    # Add to crontab (run every 5 minutes)
    CRON_JOB="*/5 * * * * ALERT_EMAIL=$ALERT_EMAIL SLACK_WEBHOOK=$SLACK_WEBHOOK /usr/local/bin/qumus-health-check.sh"
    (crontab -u ubuntu -l 2>/dev/null | grep -v "qumus-health-check.sh"; echo "$CRON_JOB") | crontab -u ubuntu -
    
    print_success "Health check monitoring configured (every 5 minutes)"
}

# Setup performance monitoring
setup_performance_monitoring() {
    print_header "Setting Up Performance Monitoring"
    
    # Create performance monitoring script
    cat > /usr/local/bin/qumus-performance-monitor.sh << 'EOF'
#!/bin/bash

APP_NAME="qumus"
LOG_FILE="/var/log/qumus/performance.log"
METRICS_FILE="/var/log/qumus/metrics.json"

# Collect performance metrics
collect_metrics() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')
    local memory_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    local uptime=$(pm2 describe "$APP_NAME" | grep "uptime" | awk '{print $NF}')
    
    # Log metrics
    echo "[$(date)] CPU: ${cpu_usage}% | Memory: ${memory_usage}% | Disk: ${disk_usage}% | Uptime: $uptime" >> "$LOG_FILE"
    
    # Save metrics as JSON
    cat > "$METRICS_FILE" << METRICS
{
    "timestamp": "$timestamp",
    "cpu_usage": $cpu_usage,
    "memory_usage": $memory_usage,
    "disk_usage": $disk_usage,
    "uptime": "$uptime"
}
METRICS
}

collect_metrics
EOF
    
    chmod +x /usr/local/bin/qumus-performance-monitor.sh
    
    # Add to crontab (run every minute)
    CRON_JOB="* * * * * /usr/local/bin/qumus-performance-monitor.sh"
    (crontab -u ubuntu -l 2>/dev/null | grep -v "qumus-performance-monitor.sh"; echo "$CRON_JOB") | crontab -u ubuntu -
    
    print_success "Performance monitoring configured (every minute)"
}

# Setup log analysis
setup_log_analysis() {
    print_header "Setting Up Log Analysis"
    
    # Create log analysis script
    cat > /usr/local/bin/qumus-analyze-logs.sh << 'EOF'
#!/bin/bash

LOG_DIR="/var/log/qumus"
REPORT_FILE="$LOG_DIR/daily-report.txt"
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"

# Generate daily report
generate_report() {
    local date=$(date +"%Y-%m-%d")
    
    cat > "$REPORT_FILE" << REPORT
QUMUS Daily Report - $date
================================

Error Count:
$(grep -c "ERROR" "$LOG_DIR"/*.log 2>/dev/null || echo "0")

Warning Count:
$(grep -c "WARN" "$LOG_DIR"/*.log 2>/dev/null || echo "0")

Failed Requests:
$(grep -c "500\|502\|503\|504" "$LOG_DIR"/*.log 2>/dev/null || echo "0")

Top Errors:
$(grep "ERROR" "$LOG_DIR"/*.log 2>/dev/null | cut -d: -f3 | sort | uniq -c | sort -rn | head -5)

Performance Summary:
$(tail -20 "$LOG_DIR/performance.log" 2>/dev/null || echo "No data available")

REPORT
    
    # Send report via email
    mail -s "QUMUS Daily Report - $date" "$ALERT_EMAIL" < "$REPORT_FILE"
}

generate_report
EOF
    
    chmod +x /usr/local/bin/qumus-analyze-logs.sh
    
    # Add to crontab (run daily at 2 AM)
    CRON_JOB="0 2 * * * ALERT_EMAIL=$ALERT_EMAIL /usr/local/bin/qumus-analyze-logs.sh"
    (crontab -u ubuntu -l 2>/dev/null | grep -v "qumus-analyze-logs.sh"; echo "$CRON_JOB") | crontab -u ubuntu -
    
    print_success "Log analysis configured (daily report at 2 AM)"
}

# Setup monitoring dashboard
setup_monitoring_dashboard() {
    print_header "Setting Up Monitoring Dashboard"
    
    # Create simple monitoring dashboard script
    cat > /usr/local/bin/qumus-dashboard.sh << 'EOF'
#!/bin/bash

APP_NAME="qumus"

clear
echo "================================"
echo "QUMUS Monitoring Dashboard"
echo "================================"
echo ""

# Application Status
echo "Application Status:"
pm2 status "$APP_NAME" | tail -1
echo ""

# System Resources
echo "System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')%"
echo "Memory Usage: $(free | grep Mem | awk '{print int($3/$2 * 100)}')%"
echo "Disk Usage: $(df / | awk 'NR==2 {print $5}')"
echo ""

# Recent Logs
echo "Recent Errors (last 5):"
tail -5 /var/log/qumus/error.log 2>/dev/null || echo "No errors"
echo ""

# Performance Metrics
echo "Performance Metrics:"
tail -1 /var/log/qumus/performance.log 2>/dev/null || echo "No data available"
echo ""

echo "================================"
echo "For more details, visit:"
echo "PM2 Dashboard: http://localhost:9615"
echo "================================"
EOF
    
    chmod +x /usr/local/bin/qumus-dashboard.sh
    
    print_success "Monitoring dashboard created"
    print_info "Run: qumus-dashboard"
}

# Generate monitoring report
generate_monitoring_report() {
    print_header "Monitoring Configuration Report"
    
    echo ""
    echo "Monitoring Components:"
    echo "✓ PM2 Monitoring (Dashboard: http://localhost:9615)"
    echo "✓ Health Check Monitoring (every 5 minutes)"
    echo "✓ Performance Monitoring (every minute)"
    echo "✓ Log Analysis (daily report at 2 AM)"
    echo "✓ Log Rotation (14-day retention)"
    echo ""
    
    echo "Alert Channels:"
    echo "✓ Email: $ALERT_EMAIL"
    if [ -n "$SLACK_WEBHOOK" ]; then
        echo "✓ Slack: Configured"
    else
        echo "⚠ Slack: Not configured"
    fi
    echo ""
    
    echo "Log Locations:"
    echo "  Application: /var/log/qumus/qumus.log"
    echo "  Errors: /var/log/qumus/qumus-error.log"
    echo "  Health Check: /var/log/qumus/health-check.log"
    echo "  Performance: /var/log/qumus/performance.log"
    echo ""
    
    echo "Useful Commands:"
    echo "  View logs: pm2 logs $APP_NAME"
    echo "  View dashboard: qumus-dashboard"
    echo "  PM2 web: http://localhost:9615"
    echo ""
}

# Main execution
main() {
    print_header "QUMUS Monitoring and Alerting Setup"
    
    check_root
    setup_pm2_monitoring
    setup_log_rotation
    setup_health_monitoring
    setup_performance_monitoring
    setup_log_analysis
    setup_monitoring_dashboard
    generate_monitoring_report
    
    print_header "Monitoring Setup Complete"
    print_success "Your QUMUS system is now fully monitored"
    print_info "Email alerts will be sent to: $ALERT_EMAIL"
}

# Run main function
main
