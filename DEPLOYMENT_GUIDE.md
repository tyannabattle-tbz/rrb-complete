# Production Deployment Guide - Manus Agent Platform

## Overview
This guide outlines the three immediate steps to deploy the Manus Agent platform to a live production environment. The platform is currently running on Manus hosting and is ready for production deployment.

---

## STEP 1: Pre-Deployment Configuration & Environment Setup

### 1.1 Production Environment Variables
Ensure all production secrets are configured in the Manus Management UI:

**Required Secrets:**
```
BUILT_IN_FORGE_API_KEY         # Manus API key for backend services
BUILT_IN_FORGE_API_URL         # Manus API endpoint
JWT_SECRET                      # Session signing key (generate new for production)
OAUTH_SERVER_URL               # Manus OAuth server
VITE_APP_ID                    # OAuth application ID
VITE_OAUTH_PORTAL_URL          # OAuth portal URL
DATABASE_URL                   # Production database connection string
```

**Optional Secrets (for advanced features):**
```
SENDGRID_API_KEY              # Email service (if using SendGrid)
MAILGUN_API_KEY               # Email service (if using Mailgun)
STRIPE_SECRET_KEY             # Payment processing (if enabled)
WEBHOOK_SIGNING_SECRET        # For webhook HMAC signatures
```

### 1.2 Database Configuration
- **Current**: MySQL/TiDB database configured
- **Action Required**: 
  - Verify production database has automated backups enabled
  - Configure read replicas for high availability
  - Set up connection pooling (recommended: 20-50 connections)
  - Enable SSL/TLS for database connections
  - Run final migration: `pnpm db:push` in production environment

### 1.3 Security Hardening
- [ ] Enable HTTPS/TLS with valid SSL certificate
- [ ] Configure security headers:
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000
  ```
- [ ] Set up rate limiting (recommended: 100 requests/minute per IP)
- [ ] Configure CORS for production domain only
- [ ] Enable request logging and monitoring
- [ ] Set up DDoS protection (Cloudflare, AWS Shield, etc.)

### 1.4 Monitoring & Observability
- [ ] Configure application performance monitoring (APM)
- [ ] Set up error tracking (Sentry, DataDog, New Relic)
- [ ] Enable structured logging (JSON format)
- [ ] Configure uptime monitoring and alerting
- [ ] Set up database query performance monitoring

**Estimated Time**: 2-4 hours

---

## STEP 2: Deployment & Infrastructure Setup

### 2.1 Manus Platform Deployment
The Manus platform provides built-in hosting. To deploy:

1. **Create Checkpoint** (Already done: `7f29ddd2`)
   - Latest checkpoint contains all production-ready code
   - All 282 tests passing
   - Zero TypeScript errors

2. **Configure Custom Domain** (in Manus Management UI)
   - Navigate to Settings → Domains
   - Either:
     - Use auto-generated domain: `your-app.manus.space`
     - Purchase new domain through Manus
     - Bind existing custom domain
   - Configure DNS records as instructed

3. **Enable Production Features**
   - Set `VITE_APP_TITLE` to production name
   - Configure `VITE_APP_LOGO` with production logo URL
   - Set environment to `production` mode

4. **Click Publish Button** (in Management UI Header)
   - Requires checkpoint to be created ✓
   - Triggers automated build and deployment
   - Deploys to Manus CDN globally
   - Automatic SSL certificate provisioning

### 2.2 Infrastructure Checklist
- [ ] Production database is running and accessible
- [ ] All environment variables are set correctly
- [ ] Backup systems are configured and tested
- [ ] CDN is configured for static assets
- [ ] Load balancing is enabled (if needed)
- [ ] Auto-scaling is configured (if needed)

### 2.3 Pre-Deployment Testing
Run final validation before publishing:

```bash
# Run full test suite
pnpm test

# Type check
pnpm tsc --noEmit

# Build check
pnpm build

# Database migration check
pnpm db:push
```

**Estimated Time**: 1-2 hours

---

## STEP 3: Post-Deployment Verification & Monitoring

### 3.1 Immediate Post-Deployment Checks (First 30 minutes)
- [ ] Verify production URL is accessible
- [ ] Check SSL certificate is valid
- [ ] Confirm OAuth login works end-to-end
- [ ] Verify database connectivity
- [ ] Test core workflows (create session, execute agent, etc.)
- [ ] Check error logging is working
- [ ] Verify email notifications are sending (if configured)

### 3.2 Smoke Tests
Run these critical user flows:

```
1. User Authentication
   - Sign up with OAuth
   - Sign in with existing account
   - Sign out and verify session cleanup

2. Agent Operations
   - Create new agent session
   - Send message to agent
   - Verify response is received
   - Check session persistence

3. Webhook Integration
   - Trigger webhook event
   - Verify webhook delivery
   - Check retry logic on failure

4. Admin Dashboard
   - Access admin panel
   - Verify system metrics display
   - Check audit logs are recording
```

### 3.3 Performance Monitoring
- [ ] Monitor response times (target: <500ms p95)
- [ ] Track error rates (target: <0.5%)
- [ ] Monitor database query performance
- [ ] Check memory usage (target: <80% utilization)
- [ ] Monitor API rate limiting
- [ ] Track concurrent user sessions

### 3.4 Security Verification
- [ ] Verify HTTPS is enforced
- [ ] Check security headers are present
- [ ] Test rate limiting is active
- [ ] Verify CORS is properly configured
- [ ] Check authentication tokens are secure
- [ ] Verify sensitive data is not logged

### 3.5 Rollback Plan
If critical issues occur:

1. **Immediate Rollback**
   - Use Manus Management UI → Dashboard
   - Click "Rollback" on previous checkpoint
   - Specify version to rollback to
   - System will revert within 2-5 minutes

2. **Database Rollback** (if needed)
   - Restore from automated backup
   - Run migration scripts to sync schema
   - Verify data integrity

3. **Communication**
   - Notify users of incident
   - Provide status updates
   - Post-incident review

### 3.6 Ongoing Monitoring
Set up continuous monitoring:

```
Critical Alerts (Immediate notification):
- Application error rate > 5%
- Response time p95 > 2000ms
- Database connection failures
- Authentication failures > 10%
- Webhook delivery failures > 20%

Warning Alerts (Daily digest):
- Response time p95 > 1000ms
- Error rate > 1%
- Memory usage > 75%
- Database query time > 1000ms
```

**Estimated Time**: 1-3 hours

---

## Deployment Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-Deployment Config | 2-4 hours | ⏳ Ready to start |
| Deployment & Setup | 1-2 hours | ⏳ Ready to start |
| Post-Deployment Verification | 1-3 hours | ⏳ Ready to start |
| **Total** | **4-9 hours** | **Ready for production** |

---

## Critical Success Factors

1. **Environment Variables**: All secrets must be correctly configured
2. **Database**: Production database must be accessible and migrated
3. **SSL Certificate**: Valid HTTPS certificate must be installed
4. **Monitoring**: Alerting must be configured before going live
5. **Backups**: Automated backups must be tested and working
6. **Team Readiness**: Support team must be trained on monitoring and rollback

---

## Support & Troubleshooting

### Common Issues

**Issue**: Database connection fails after deployment
- **Solution**: Verify DATABASE_URL is correct, check firewall rules, verify SSL settings

**Issue**: OAuth login not working
- **Solution**: Verify VITE_APP_ID and OAUTH_SERVER_URL are correct, check redirect URLs

**Issue**: High error rates immediately after deployment
- **Solution**: Check logs for specific errors, verify all environment variables, rollback if needed

**Issue**: Performance degradation
- **Solution**: Check database query performance, verify rate limiting isn't too aggressive, scale resources if needed

### Getting Help
- Check application logs in Manus Management UI → Logs
- Review error tracking dashboard (Sentry, DataDog, etc.)
- Contact Manus support at https://help.manus.im

---

## Post-Deployment Checklist

- [ ] Production URL is live and accessible
- [ ] SSL certificate is valid
- [ ] All environment variables are configured
- [ ] Database is connected and migrated
- [ ] Monitoring and alerting are active
- [ ] Backups are configured and tested
- [ ] Team is trained on operations
- [ ] Rollback procedure is documented
- [ ] Incident response plan is in place
- [ ] User communication is prepared

---

## Next Steps After Deployment

1. **Monitor for 24 hours**: Watch for any issues or anomalies
2. **Gather User Feedback**: Collect feedback from early users
3. **Optimize Performance**: Use monitoring data to identify optimization opportunities
4. **Plan Phase 2 Features**: Begin planning next feature releases
5. **Scale Infrastructure**: Adjust resources based on actual usage patterns

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-30  
**Status**: Ready for Production Deployment
