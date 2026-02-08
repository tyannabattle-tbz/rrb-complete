# QUMUS Installation & Setup Guide

## System Requirements

### Minimum Requirements
- **OS**: Linux (Ubuntu 20.04+), macOS 10.15+, Windows 10+
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Node.js**: 18.0+
- **npm/pnpm**: 8.0+

### Recommended Requirements
- **OS**: Linux (Ubuntu 22.04+)
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 100GB+ SSD
- **Node.js**: 20.0+
- **npm/pnpm**: 9.0+

## Prerequisites

### 1. Install Node.js
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### 2. Install pnpm
```bash
npm install -g pnpm
pnpm --version
```

### 3. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start service
sudo systemctl start postgresql
```

### 4. Install Ollama (Optional but Recommended)
```bash
# Download from https://ollama.ai
# Or install via package manager

# Start Ollama
ollama serve

# In another terminal, pull models
ollama pull llama2
ollama pull mistral
```

## Installation Steps

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/qumus.git
cd qumus
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Configure Environment
```bash
# Copy example environment file
cp .env.example .env.production

# Edit with your configuration
nano .env.production
```

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/qumus

# Authentication
JWT_SECRET=your-jwt-secret-key-here
OAUTH_SERVER_URL=https://oauth.example.com

# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434

# WebSocket
WEBSOCKET_URL=wss://your-domain.com/ws

# Application
NODE_ENV=production
PORT=3000
```

### Step 4: Initialize Database
```bash
# Run migrations
pnpm db:push

# Seed initial data (optional)
pnpm db:seed
```

### Step 5: Build Application
```bash
pnpm build
```

### Step 6: Start Application
```bash
# Development
pnpm dev

# Production
pnpm start:production

# With PM2 (recommended for production)
pm2 start "pnpm start:production" --name qumus
pm2 save
pm2 startup
```

## Verification

### Check Installation
```bash
# Test API endpoint
curl http://localhost:3000/api/health

# Check database connection
pnpm db:check

# Verify Ollama (if installed)
curl http://localhost:11434/api/tags
```

### Access Application
1. Open browser
2. Navigate to http://localhost:3000
3. Login with default credentials
4. Verify all systems operational

## Post-Installation Setup

### 1. Create Admin User
```bash
pnpm cli:create-admin --email admin@example.com --password secure-password
```

### 2. Configure HybridCast
```bash
# In QUMUS dashboard
1. Navigate to Settings → HybridCast
2. Enter API credentials
3. Test connection
4. Save configuration
```

### 3. Setup Webhooks
```bash
# Configure webhook endpoints
1. Settings → Webhooks
2. Add webhook URL: https://your-domain.com/api/webhooks
3. Set webhook secret
4. Enable webhook events
```

### 4. Initialize Automation Rules
```bash
pnpm cli:init-automation-rules
```

### 5. Configure Email (Optional)
```bash
# In .env.production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
```

## Docker Installation (Alternative)

### Using Docker Compose
```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: qumus
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

  qumus:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/qumus
      OLLAMA_BASE_URL: http://ollama:11434
    depends_on:
      - postgres
      - ollama
    volumes:
      - ./logs:/app/logs

volumes:
  postgres_data:
  ollama_data:
EOF

# Start services
docker-compose up -d
```

## Kubernetes Deployment (Advanced)

### Create Kubernetes Manifests
```yaml
# qumus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qumus
spec:
  replicas: 3
  selector:
    matchLabels:
      app: qumus
  template:
    metadata:
      labels:
        app: qumus
    spec:
      containers:
      - name: qumus
        image: qumus:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: qumus-secrets
              key: database-url
        - name: OLLAMA_BASE_URL
          value: "http://ollama:11434"
```

### Deploy to Kubernetes
```bash
kubectl apply -f qumus-deployment.yaml
kubectl apply -f qumus-service.yaml
kubectl apply -f qumus-ingress.yaml
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/qumus
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## Monitoring & Maintenance

### Setup Monitoring
```bash
# Install PM2 Plus
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# Configure monitoring
pm2 web
```

### Regular Maintenance
```bash
# Update dependencies
pnpm update

# Run security audit
pnpm audit

# Clean cache
pnpm store prune

# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Troubleshooting Installation

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d qumus -c "SELECT 1"
```

### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Permission Denied Errors
```bash
# Fix directory permissions
sudo chown -R $USER:$USER /home/ubuntu/manus-agent-web
chmod -R 755 /home/ubuntu/manus-agent-web
```

## Next Steps

1. **Review User Guide**: Read USER-GUIDE.md for feature overview
2. **Configure Settings**: Customize application settings
3. **Create Content**: Start creating broadcasts
4. **Setup Automation**: Configure automation rules
5. **Monitor System**: Use Real-Time Metrics Dashboard

## Support

- **Documentation**: https://docs.qumus.example.com
- **Issues**: https://github.com/your-org/qumus/issues
- **Email**: support@qumus.example.com

---

**Installation Guide Version**: 1.0.0
**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries
