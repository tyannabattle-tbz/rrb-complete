# Production Deployment Guide

## Pre-Deployment Checklist

### Environment Configuration
- [x] TypeScript compilation: 0 errors
- [x] All dependencies installed
- [x] Database migrations applied
- [x] Redis connection configured
- [x] Environment variables validated

### Security Configuration
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS policies
- [ ] Set up rate limiting (100 req/min per IP)
- [ ] Enable CSRF protection
- [ ] Configure security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up API key rotation schedule

### Monitoring & Logging
- [ ] Configure application logging (Winston/Pino)
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring (New Relic/DataDog)
- [ ] Set up health check endpoints
- [ ] Configure alerting rules

### Database & Backup
- [ ] Enable automated daily backups
- [ ] Configure backup retention (30 days)
- [ ] Test backup restoration process
- [ ] Set up database replication
- [ ] Configure connection pooling (min: 5, max: 20)

### Infrastructure
- [ ] Configure load balancer
- [ ] Set up auto-scaling policies
- [ ] Configure CDN for static assets
- [ ] Set up DDoS protection
- [ ] Configure WAF rules

## Deployment Steps

### 1. Pre-Deployment Testing
```bash
# Run full test suite
pnpm test

# Run TypeScript check
npx tsc --noEmit

# Build production bundle
pnpm build
```

### 2. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export LOG_LEVEL=info
export ENABLE_MONITORING=true
export ENABLE_RATE_LIMITING=true
```

### 3. Database Migration
```bash
# Run migrations
pnpm db:push

# Verify database schema
pnpm db:verify
```

### 4. Application Deployment
```bash
# Start application with PM2
pm2 start server.js --name "manus-agent-web"

# Monitor application
pm2 monit
```

### 5. Post-Deployment Verification
```bash
# Check health endpoint
curl https://your-domain.com/health

# Verify all routes are accessible
curl https://your-domain.com/api/trpc/system.ping

# Test QUMUS integration
curl https://your-domain.com/api/trpc/podcastPlayback.play
```

## Production Environment Variables

```env
# Core
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=mysql://user:password@host:3306/db

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=<generate-strong-secret>
OAUTH_SERVER_URL=https://api.manus.im

# Security
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_MONITORING=true
SENTRY_DSN=<your-sentry-dsn>
```

## Monitoring & Alerting

### Key Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rate (5xx, 4xx)
- Database connection pool usage
- Redis memory usage
- CPU and memory utilization
- Active user count
- QUMUS decision processing time

### Alert Thresholds
- Error rate > 1% → Critical
- Latency p99 > 1000ms → Warning
- Database connections > 18/20 → Warning
- Redis memory > 80% → Warning
- CPU > 80% → Warning

## Rollback Procedure

If deployment fails or causes issues:

```bash
# Rollback to previous version
git revert <commit-hash>

# Restart application
pm2 restart manus-agent-web

# Verify rollback
curl https://your-domain.com/health
```

## Performance Optimization

### Caching Strategy
- Static assets: 1 year (with content hash)
- API responses: 5 minutes (configurable per endpoint)
- Database queries: 10 minutes

### Database Optimization
- Enable query caching
- Create indexes on frequently queried fields
- Monitor slow query log
- Regular ANALYZE and OPTIMIZE

### Application Optimization
- Enable gzip compression (threshold: 1KB)
- Implement response caching
- Use connection pooling
- Implement batch operations for bulk inserts

## Disaster Recovery

### Backup Strategy
- Daily automated backups
- 30-day retention period
- Test restoration monthly
- Store backups in multiple regions

### RTO/RPO Targets
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 1 hour

## Security Hardening

### SSL/TLS Configuration
- Use TLS 1.2 or higher
- Enable HSTS (Strict-Transport-Security)
- Use strong cipher suites

### API Security
- Implement rate limiting
- Enable CORS with specific origins
- Validate all inputs
- Use parameterized queries

### Authentication
- Enforce strong passwords
- Implement 2FA for admin accounts
- Rotate API keys regularly
- Monitor failed login attempts

## Compliance & Audit

### Logging Requirements
- All user actions logged
- All API calls logged
- All errors logged with stack traces
- Audit trail for compliance

### Data Protection
- Encrypt sensitive data at rest
- Encrypt data in transit (TLS)
- Implement data retention policies
- Regular security audits

## Support & Escalation

### On-Call Procedures
- 24/7 monitoring enabled
- Automated alerts to on-call team
- Escalation path: L1 → L2 → L3
- Incident response SLA: 15 minutes

### Contact Information
- On-Call: [contact-info]
- Escalation: [escalation-contact]
- Emergency: [emergency-contact]
