# Production Deployment - Quick Start (30-Minute Overview)

## The Three Immediate Steps

### STEP 1: Pre-Deployment Configuration (2-4 hours)

**What to do**: Configure environment and infrastructure for production.

**Key Actions**:
1. **Set Environment Variables** in Manus Management UI (Settings → Secrets):
   - `JWT_SECRET`: Generate new 32+ character secret
   - `DATABASE_URL`: Point to production database
   - Verify all OAuth and API keys are correct

2. **Prepare Database**:
   - Ensure production database is running and accessible
   - Run `pnpm db:push` to apply all migrations
   - Configure automated daily backups
   - Enable SSL/TLS encryption

3. **Security Setup**:
   - Obtain SSL/TLS certificate (auto-provisioned by Manus)
   - Configure HTTPS redirect
   - Set up rate limiting (100 requests/minute)
   - Enable DDoS protection

4. **Monitoring Configuration**:
   - Set up error tracking (Sentry, DataDog, or similar)
   - Configure uptime monitoring
   - Create alerting rules for critical metrics
   - Test alert notifications

5. **Final Validation**:
   ```bash
   pnpm test          # All 282 tests must pass ✓
   pnpm tsc --noEmit  # Zero errors ✓
   pnpm db:push       # Migrations complete ✓
   ```

**Success Criteria**: All environment variables configured, database migrated, monitoring active, all tests passing.

---

### STEP 2: Deployment & Infrastructure Setup (1-2 hours)

**What to do**: Deploy application to production using Manus platform.

**Key Actions**:
1. **Create Database Backup**:
   - Backup production database
   - Verify backup is restorable
   - Document recovery procedure

2. **Configure Custom Domain** (Manus Management UI → Settings → Domains):
   - Choose domain option:
     - Auto-generated: `your-app.manus.space`
     - New domain: Purchase through Manus
     - Existing domain: Bind to your domain
   - Configure DNS records as instructed
   - Wait for DNS propagation

3. **Set Production Configuration**:
   - `VITE_APP_TITLE`: Your production app name
   - `VITE_APP_LOGO`: Production logo URL
   - Verify all environment variables one final time

4. **Deploy to Production**:
   - Go to Manus Management UI Dashboard
   - Find checkpoint `7f29ddd2` (latest)
   - Click "Publish" button
   - Confirm production deployment
   - Wait 2-5 minutes for deployment to complete

5. **Verify Deployment**:
   - [ ] Production URL is accessible
   - [ ] SSL certificate is valid
   - [ ] HTTPS is enforced
   - [ ] Application logs show no errors
   - [ ] Database connection is active

**Success Criteria**: Application is live on production URL, HTTPS is working, database is connected, no errors in logs.

---

### STEP 3: Post-Deployment Verification & Monitoring (1-3 hours)

**What to do**: Verify application is working correctly and set up ongoing monitoring.

**Key Actions**:
1. **Smoke Tests** (First 30 minutes - test critical flows):
   - Sign up/login with OAuth
   - Create agent session
   - Send message to agent
   - Verify response received
   - Check session persistence
   - Access admin dashboard
   - Test webhook delivery

2. **Performance Baseline**:
   - Measure response times (target: <500ms p95)
   - Check error rate (target: <0.5%)
   - Monitor database query times
   - Check memory usage (target: <80%)
   - Test concurrent user handling

3. **Security Verification**:
   - Verify HTTPS is enforced
   - Check security headers are present
   - Test rate limiting is active
   - Verify CORS is configured correctly
   - Check authentication tokens are secure

4. **Monitoring Activation**:
   - Verify monitoring is collecting data
   - Test alert notifications
   - Verify error tracking is working
   - Check logs are being collected
   - Create monitoring dashboard

5. **User Communication**:
   - Send deployment notification
   - Provide production URL
   - List new features
   - Provide support contact
   - Gather initial feedback

**Success Criteria**: All smoke tests pass, performance is acceptable, monitoring is active, users are notified.

---

## Rollback Procedure (If Critical Issues Occur)

If you encounter critical issues (>10% error rate, database down, security breach):

1. Go to Manus Management UI → Dashboard
2. Find previous stable checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. Wait 2-5 minutes for rollback to complete
6. Verify application is working
7. Investigate root cause
8. Fix and re-deploy

---

## Critical Checklist

| Step | Item | Status |
|------|------|--------|
| 1 | Environment variables configured | ☐ |
| 1 | Database migrated | ☐ |
| 1 | Monitoring set up | ☐ |
| 1 | All tests passing | ☐ |
| 2 | Database backed up | ☐ |
| 2 | Domain configured | ☐ |
| 2 | Published to production | ☐ |
| 3 | Smoke tests passed | ☐ |
| 3 | Performance verified | ☐ |
| 3 | Monitoring active | ☐ |

---

## Timeline

- **Step 1**: 2-4 hours (can be done in parallel with Step 2 prep)
- **Step 2**: 1-2 hours (requires Step 1 to be complete)
- **Step 3**: 1-3 hours (starts immediately after Step 2)
- **Total**: 4-9 hours for full deployment

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Database connection fails | Verify DATABASE_URL, check firewall, enable SSL |
| OAuth not working | Verify VITE_APP_ID, check OAUTH_SERVER_URL |
| High error rate | Check logs, verify env vars, consider rollback |
| Slow response times | Check database performance, verify rate limiting |
| SSL certificate error | Verify domain is configured, wait for provisioning |

---

## Support

- **Manus Help**: https://help.manus.im
- **Documentation**: See DEPLOYMENT_GUIDE.md for detailed information
- **Checklist**: See DEPLOYMENT_CHECKLIST.md for printable checklist

---

**Platform Status**: ✅ Production Ready  
**Checkpoint**: 7f29ddd2  
**Tests**: 282/282 passing  
**TypeScript**: 0 errors  
**Ready to Deploy**: YES
