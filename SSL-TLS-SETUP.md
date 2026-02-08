# SSL/TLS Configuration Guide for QUMUS

## Overview

This guide provides step-by-step instructions for securing your QUMUS deployment with SSL/TLS certificates using Let's Encrypt and Nginx.

## Prerequisites

- Domain name pointing to your server
- Ubuntu 20.04+ or similar Linux distribution
- Nginx installed (`sudo apt-get install nginx`)
- Certbot installed (`sudo apt-get install certbot python3-certbot-nginx`)
- QUMUS application running on port 3000

## Step 1: Install Required Tools

```bash
# Update package manager
sudo apt-get update

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot and Nginx plugin
sudo apt-get install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
nginx -v
```

## Step 2: Configure Nginx as Reverse Proxy

Create Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/qumus
```

Add the following configuration:

```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be created by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/qumus_access.log;
    error_log /var/log/nginx/qumus_error.log;

    # Proxy settings
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;

    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Main application proxy
    location / {
        proxy_pass http://localhost:3000;
    }

    # WebSocket endpoint
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Step 3: Enable Nginx Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/qumus /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 4: Obtain SSL Certificate

```bash
# Replace your-domain.com with your actual domain
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose to share email with EFF (optional)
```

## Step 5: Verify Certificate Installation

```bash
# Check certificate details
sudo certbot certificates

# Test SSL configuration
curl -I https://your-domain.com

# Verify with SSL Labs (optional)
# Visit: https://www.ssllabs.com/ssltest/
```

## Step 6: Setup Auto-Renewal

Let's Encrypt certificates expire after 90 days. Setup automatic renewal:

```bash
# Enable certbot timer
sudo systemctl enable certbot.timer

# Check timer status
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

## Step 7: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if using UFW)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Step 8: Environment Configuration

Update your QUMUS environment variables:

```bash
# .env.production
NODE_ENV=production
PORT=3000
WEBSOCKET_URL=wss://your-domain.com/ws
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
# ... other variables
```

## Step 9: Restart Services

```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart QUMUS application
pm2 restart qumus

# Verify services are running
sudo systemctl status nginx
pm2 status
```

## Troubleshooting

### Certificate Not Renewing

```bash
# Check renewal logs
sudo journalctl -u certbot.timer -n 50

# Manual renewal with verbose output
sudo certbot renew -v

# Force renewal
sudo certbot renew --force-renewal
```

### Nginx Not Starting

```bash
# Check configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check port conflicts
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### WebSocket Connection Issues

Verify WebSocket configuration in Nginx:

```nginx
location /ws {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400;
}
```

### Certificate Issues

```bash
# Verify certificate
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# Check certificate expiry
sudo certbot certificates

# Revoke certificate (if needed)
sudo certbot revoke --cert-path /etc/letsencrypt/live/your-domain.com/fullchain.pem
```

## Security Best Practices

1. **Keep Software Updated**
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

2. **Monitor Logs**
   ```bash
   sudo tail -f /var/log/nginx/qumus_access.log
   sudo tail -f /var/log/nginx/qumus_error.log
   ```

3. **Regular Backups**
   ```bash
   sudo tar -czf /backups/nginx-config-$(date +%Y%m%d).tar.gz /etc/nginx/
   sudo tar -czf /backups/letsencrypt-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
   ```

4. **Security Headers**
   - Strict-Transport-Security: Forces HTTPS
   - X-Content-Type-Options: Prevents MIME sniffing
   - X-Frame-Options: Prevents clickjacking
   - Content-Security-Policy: Controls resource loading

5. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
   
   location /api {
       limit_req zone=api_limit burst=20 nodelay;
       proxy_pass http://localhost:3000;
   }
   ```

## Testing SSL/TLS

### Using curl

```bash
# Test HTTPS connection
curl -I https://your-domain.com

# Test with verbose output
curl -v https://your-domain.com

# Test certificate chain
curl --cacert /etc/letsencrypt/live/your-domain.com/fullchain.pem https://your-domain.com
```

### Using openssl

```bash
# Connect to server
openssl s_client -connect your-domain.com:443

# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates
```

### Using online tools

- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Qualys SSL Labs](https://www.ssllabs.com/ssltest/analyze.html)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## Performance Optimization

### Enable HTTP/2

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### Enable GZIP Compression

```nginx
gzip on;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
gzip_min_length 1000;
gzip_comp_level 6;
```

### Enable Caching

```nginx
# Browser caching
add_header Cache-Control "public, max-age=3600";

# Proxy caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=qumus_cache:10m max_size=1g inactive=60m;
proxy_cache qumus_cache;
```

## Maintenance

### Certificate Renewal Check

```bash
# Check certificate expiry date
sudo certbot certificates

# Days until expiration
echo "Certificate expires in:" && \
  sudo openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates | grep notAfter
```

### Nginx Status

```bash
# Check active connections
sudo systemctl status nginx

# View Nginx processes
ps aux | grep nginx

# Check Nginx version
nginx -v
```

### Log Rotation

Logs are automatically rotated by Nginx. Check configuration:

```bash
cat /etc/logrotate.d/nginx
```

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [OWASP SSL/TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries
