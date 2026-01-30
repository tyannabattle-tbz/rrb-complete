# Production Deployment Checklist & Runbook

## STEP 1: PRE-DEPLOYMENT (2-4 hours)

### 1A: Environment Configuration
- [ ] Access Manus Management UI (Settings → Secrets)
- [ ] Verify all required environment variables are set:
  - [ ] `BUILT_IN_FORGE_API_KEY` - Manus API key
  - [ ] `BUILT_IN_FORGE_API_URL` - Manus API endpoint
  - [ ] `JWT_SECRET` - Generate new production secret (min 32 chars)
  - [ ] `DATABASE_URL` - Production database connection
  - [ ] `OAUTH_SERVER_URL` - OAuth server URL
  - [ ] `VITE_APP_ID` - OAuth app ID
  - [ ] `VITE_OAUTH_PORTAL_URL` - OAuth portal URL

### 1B: Database Preparation
- [ ] Verify production database is running
- [ ] Test database connection from application server
- [ ] Run migrations: `pnpm db:push`
- [ ] Verify all 29 tables are created
- [ ] Configure automated daily backups
- [ ] Test backup restoration process
- [ ] Enable SSL/TLS for database connections
- [ ] Configure connection pooling (20-50 connections)

### 1C: Security Configuration
- [ ] Generate new SSL/TLS certificate (if using custom domain)
- [ ] Configure HTTPS redirect (HTTP → HTTPS)
- [ ] Set security headers in server configuration
- [ ] Enable CORS for production domain only
- [ ] Configure rate limiting (100 req/min per IP)
- [ ] Set up DDoS protection
- [ ] Review and harden authentication settings

### 1D: Monitoring Setup
- [ ] Configure application monitoring (APM)
- [ ] Set up error tracking (Sentry/DataDog)
- [ ] Enable structured JSON logging
- [ ] Configure uptime monitoring
- [ ] Set up alerting for critical metrics
- [ ] Create monitoring dashboard
- [ ] Test alert notifications

### 1E: Final Validation
```bash
# Run in production-like environment
pnpm test                    # All 282 tests must pass
pnpm tsc --noEmit           # Zero TypeScript errors
pnpm build                  # Build succeeds
pnpm db:push                # Migrations complete
```

**Sign-off**: _____________________ Date: _______

---

## STEP 2: DEPLOYMENT (1-2 hours)

### 2A: Pre-Deployment Backup
- [ ] Create database backup
- [ ] Verify backup is restorable
- [ ] Document backup location and recovery procedure

### 2B: Domain Configuration (Manus Management UI)
- [ ] Navigate to Settings → Domains
- [ ] Choose one of three options:
  - [ ] Use auto-generated domain (your-app.manus.space)
  - [ ] Purchase new domain through Manus
  - [ ] Bind existing custom domain
- [ ] Configure DNS records as instructed
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify domain resolves correctly

### 2C: Production Settings
- [ ] Set `VITE_APP_TITLE` to production name
- [ ] Upload production logo to `VITE_APP_LOGO`
- [ ] Verify all environment variables one final time
- [ ] Confirm database is accessible
- [ ] Test OAuth configuration

### 2D: Publish to Production
1. Navigate to Manus Management UI Dashboard
2. Locate latest checkpoint (version: `7f29ddd2`)
3. Click "Publish" button
4. Confirm production deployment
5. Wait for deployment to complete (typically 2-5 minutes)
6. Verify deployment succeeded in Dashboard

### 2E: Immediate Post-Deployment
- [ ] Verify production URL is accessible
- [ ] Check SSL certificate is valid
- [ ] Verify HTTPS is enforced
- [ ] Check application logs for errors
- [ ] Verify database connection is active

**Deployment Time**: _____________ Completed by: ________________

---

## STEP 3: POST-DEPLOYMENT VERIFICATION (1-3 hours)

### 3A: Smoke Tests (First 30 minutes)
```
AUTHENTICATION
- [ ] Sign up with OAuth (Google/GitHub)
- [ ] Verify email confirmation (if enabled)
- [ ] Sign in with credentials
- [ ] Verify session is created
- [ ] Sign out and verify session cleanup
- [ ] Verify redirect to login page

CORE FUNCTIONALITY
- [ ] Create new agent session
- [ ] Send message to agent
- [ ] Receive agent response
- [ ] Verify response is correct
- [ ] Check message history is saved
- [ ] Test session persistence (refresh page)

ADMIN FEATURES
- [ ] Access admin dashboard
- [ ] View system metrics
- [ ] Check audit logs
- [ ] Verify user management works
- [ ] Test webhook marketplace
- [ ] Verify fine-tuning pipeline loads

INTEGRATIONS
- [ ] Test email notifications (if configured)
- [ ] Verify webhook delivery
- [ ] Check API rate limiting
- [ ] Test file upload/download
- [ ] Verify search functionality
```

### 3B: Performance Baseline
- [ ] Measure response times (target: <500ms p95)
- [ ] Check error rates (target: <0.5%)
- [ ] Monitor database query times
- [ ] Check memory usage (target: <80%)
- [ ] Verify CPU usage is normal
- [ ] Test concurrent user handling

### 3C: Security Verification
- [ ] Verify HTTPS is enforced
- [ ] Check security headers are present
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
  - [ ] Strict-Transport-Security
  - [ ] X-XSS-Protection
- [ ] Test rate limiting is active
- [ ] Verify CORS is correctly configured
- [ ] Check authentication tokens are secure
- [ ] Verify sensitive data is not logged

### 3D: Data Integrity
- [ ] Verify database has all expected data
- [ ] Check data migrations completed successfully
- [ ] Verify no data corruption occurred
- [ ] Test backup and restore process
- [ ] Verify audit logs are recording

### 3E: Monitoring Verification
- [ ] Verify monitoring is collecting data
- [ ] Check alerts are firing correctly
- [ ] Verify error tracking is working
- [ ] Test alert notifications
- [ ] Verify logs are being collected

### 3F: User Communication
- [ ] Send deployment notification to users
- [ ] Provide production URL
- [ ] List any new features
- [ ] Provide support contact information
- [ ] Gather initial feedback

**Sign-off**: _____________________ Date: _______ Time: _______

---

## ROLLBACK PROCEDURE (If Needed)

### Critical Issues Requiring Rollback
- Application error rate > 10%
- Database connection failures
- Authentication system down
- Data corruption detected
- Security breach detected

### Rollback Steps
1. **Assess Severity**
   - Determine if immediate rollback is needed
   - Notify team and stakeholders

2. **Execute Rollback**
   - Go to Manus Management UI → Dashboard
   - Find previous stable checkpoint
   - Click "Rollback" button
   - Confirm rollback action
   - Wait for rollback to complete (2-5 minutes)

3. **Verify Rollback**
   - [ ] Production URL is accessible
   - [ ] Application is responding normally
   - [ ] Database is connected
   - [ ] Error rates are normal
   - [ ] Users can log in

4. **Post-Rollback**
   - [ ] Notify users of incident
   - [ ] Investigate root cause
   - [ ] Fix issues in development
   - [ ] Create new checkpoint
   - [ ] Plan re-deployment

**Rollback Completed**: _____________ By: ________________

---

## INCIDENT RESPONSE

### During Incident
- [ ] Assess severity (Critical/High/Medium/Low)
- [ ] Notify team immediately
- [ ] Start incident log with timestamp
- [ ] Begin troubleshooting
- [ ] Consider rollback if critical

### Troubleshooting Guide

**Issue**: High error rate
- Check application logs
- Verify database connectivity
- Check for recent deployments
- Monitor error tracking dashboard
- Consider rollback if > 10% errors

**Issue**: Slow response times
- Check database query performance
- Monitor server resources
- Check rate limiting isn't too strict
- Verify CDN is working
- Scale resources if needed

**Issue**: OAuth not working
- Verify VITE_APP_ID is correct
- Check OAUTH_SERVER_URL
- Verify redirect URLs are configured
- Check OAuth provider status
- Review authentication logs

**Issue**: Database connection errors
- Verify DATABASE_URL is correct
- Check database server is running
- Verify firewall rules
- Check SSL/TLS certificate
- Verify connection pooling settings

### Post-Incident
- [ ] Document what happened
- [ ] Identify root cause
- [ ] Create action items to prevent recurrence
- [ ] Update runbooks if needed
- [ ] Schedule post-mortem meeting
- [ ] Communicate findings to team

---

## SUPPORT CONTACTS

| Role | Contact | Phone |
|------|---------|-------|
| On-Call Engineer | _________________ | _____________ |
| Team Lead | _________________ | _____________ |
| Database Admin | _________________ | _____________ |
| Security Lead | _________________ | _____________ |

**Escalation**: https://help.manus.im

---

## Sign-Off

**Deployment Approved By**: ___________________________

**Date**: _________________ **Time**: _________________

**Deployed By**: ___________________________

**Verified By**: ___________________________

---

## Post-Deployment Notes

```
Date: _________________
Deployment Version: 7f29ddd2
Production URL: _________________________________
Issues Encountered: _____________________________
Resolution: _____________________________________
Performance Baseline: ___________________________
Next Steps: _____________________________________
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-30  
**Status**: Ready for Production Deployment
