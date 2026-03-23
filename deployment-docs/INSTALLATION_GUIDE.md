# QUMUS Autonomous Ecosystem - Installation Guide

## System Requirements
- Node.js 22.13.0 or higher
- pnpm 9.0.0 or higher
- MySQL/TiDB database
- 4GB RAM minimum
- 10GB disk space

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-org/manus-agent-web.git
cd manus-agent-web
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment
Set required environment variables:
- DATABASE_URL: MySQL connection string
- JWT_SECRET: Session signing secret
- VITE_APP_ID: OAuth application ID
- OAUTH_SERVER_URL: OAuth backend URL
- STRIPE_SECRET_KEY: Stripe API key
- VITE_STRIPE_PUBLISHABLE_KEY: Stripe public key

### 4. Setup Database
```bash
pnpm db:push
```

### 5. Start Development Server
```bash
pnpm dev
```

### 6. Access Application
- Web: http://localhost:3000
- API: http://localhost:3000/api/trpc

## Production Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

## QUMUS Autonomous System Activation

### Enable All Policies
```bash
curl -X POST http://localhost:3000/api/qumus/activate-policies
```

### Verify System Health
```bash
curl http://localhost:3000/api/qumus/health
```

### Access Control Centers
- QUMUS Control: http://localhost:3000/qumus-control
- RRB Radio: http://localhost:3000/rrb-radio
- HybridCast: http://localhost:3000/hybridcast
- Analytics: http://localhost:3000/analytics
- Creator Marketplace: http://localhost:3000/creator-marketplace
- Listener Analytics: http://localhost:3000/listener-analytics
- API Documentation: http://localhost:3000/api-docs

## System Architecture

### Core Components
- **QUMUS Hub**: Central autonomous control system
- **Valanna AI Brain**: Strategic decision-making agent
- **Candy Guardian Spirit**: Protection and wellness agent
- **Seraph Strategic Intelligence**: Analysis and planning agent
- **Ty OS Interface**: Command and control interface
- **HybridCast Integration**: Resilient communication layer

### Subsystems (18 Total)
1. Stream Engine
2. Database Layer
3. Cache System
4. API Gateway
5. Authentication
6. Notifications
7. Webhooks
8. Analytics
9. Storage
10. Message Queue
11. Scheduler
12. Health Monitor
13. Auto-Upgrade
14. Learning Module
15. Blockchain Verification
16. Content Scheduler
17. Collaboration Engine
18. Marketplace

### Radio Channels (54 Total)
All channels support:
- Multi-host co-hosting (up to 8 hosts)
- Real-time audio mixing
- Live chat integration
- Listener analytics
- Content scheduling
- Automated recommendations

## Troubleshooting

### Build Errors
```bash
pnpm clean
pnpm install
pnpm build
```

### Database Connection Issues
```bash
# Verify DATABASE_URL format
# Test connection: mysql -u user -p -h host database_name
```

### QUMUS System Not Starting
```bash
# Check logs
tail -f .manus-logs/devserver.log

# Verify all subsystems
curl http://localhost:3000/api/qumus/health
```

## Support
For issues, contact: support@qumus.io
Documentation: https://docs.qumus.io
