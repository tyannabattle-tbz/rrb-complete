# Phase 2, 3, 4 Implementation Guide

## Overview

This document provides complete implementation templates and deployment instructions for the three remaining evolution phases. Each phase builds on the QUMUS foundation and adds critical production capabilities.

## Phase 2: Role-Based Dashboards

### Database Schema (Already Added)
```sql
-- Dashboard configurations
CREATE TABLE dashboard_configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id),
  dashboardType VARCHAR(64) NOT NULL,
  layout TEXT NOT NULL,
  theme VARCHAR(64) DEFAULT 'light',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

-- Dashboard widgets
CREATE TABLE dashboard_widgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id),
  dashboardType VARCHAR(64) NOT NULL,
  widgetType VARCHAR(255) NOT NULL,
  position TEXT NOT NULL,
  size TEXT NOT NULL,
  config TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### Router Implementation
- File: `server/routers/dashboardCustomization.ts`
- Already created with 6 procedures:
  - `getConfiguration`: Retrieve user's dashboard layout
  - `saveConfiguration`: Save custom dashboard layout
  - `addWidget`: Add widget to dashboard
  - `removeWidget`: Remove widget from dashboard
  - `getAvailableWidgets`: List widgets for dashboard type
  - `resetToDefault`: Reset to default configuration

### Frontend Components to Create
```typescript
// client/src/components/AdminDashboard.tsx
- System health widget
- User management widget
- Policy management widget
- Audit logs widget
- Performance metrics widget

// client/src/components/ComplianceDashboard.tsx
- Compliance status widget
- Violation tracker widget
- Audit trail widget
- Report generator widget
- Policy effectiveness widget

// client/src/components/UserDashboard.tsx
- Decision history widget
- Usage analytics widget
- Preferences widget
- Notifications widget
- Quick actions widget

// client/src/components/AnalystDashboard.tsx
- Trend analysis widget
- Performance metrics widget
- Decision distribution widget
- Recommendations widget
- Export data widget
```

### Implementation Steps
1. Register `dashboardCustomizationRouter` in `server/routers.ts`
2. Create dashboard components in `client/src/components/`
3. Create dashboard pages in `client/src/pages/`
4. Add routes to `client/src/App.tsx`
5. Implement widget drag-and-drop UI using React Beautiful DnD
6. Add persistent layout storage via tRPC mutations
7. Create tests in `server/routers/dashboardCustomization.test.ts`

### QUMUS Integration
- Policy: `dashboard-access-policy` - Track who accesses which dashboards
- Policy: `dashboard-customization-policy` - Track layout changes
- Decision tracking for all widget interactions
- Audit trail for dashboard modifications

---

## Phase 3: API Rate Limiting Tiers

### Database Schema (Already Added)
```sql
-- Rate limiting tiers
CREATE TABLE rate_limiting_tiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tierName VARCHAR(64) NOT NULL UNIQUE,
  requestsPerMinute INT NOT NULL,
  requestsPerMonth INT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  features TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE REFERENCES users(id),
  tierId INT NOT NULL REFERENCES rate_limiting_tiers(id),
  stripeSubscriptionId VARCHAR(255),
  status ENUM('active', 'cancelled', 'suspended') DEFAULT 'active',
  requestsUsedThisMonth INT DEFAULT 0,
  resetDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### Tier Definitions
```typescript
const tiers = [
  {
    name: "Free",
    requestsPerMinute: 100,
    requestsPerMonth: 10000,
    price: 0,
    features: ["Basic analytics", "Email support", "API access"]
  },
  {
    name: "Pro",
    requestsPerMinute: 1000,
    requestsPerMonth: 1000000,
    price: 99,
    features: ["Advanced analytics", "Priority support", "Webhooks", "Custom policies"]
  },
  {
    name: "Enterprise",
    requestsPerMinute: null, // Unlimited
    requestsPerMonth: null,
    price: 999,
    features: ["Unlimited requests", "Dedicated support", "SLA", "Custom integrations"]
  }
];
```

### Router Implementation
Create `server/routers/rateLimitingRouter.ts`:
```typescript
export const rateLimitingRouter = router({
  getTiers: publicProcedure.query(async () => {
    // Return all available tiers
  }),
  
  getUserTier: protectedProcedure.query(async ({ ctx }) => {
    // Return user's current tier
  }),
  
  upgradeTier: protectedProcedure.input(z.object({ tierId: z.number() }))
    .mutation(async ({ ctx, input }) => {
    // Create Stripe checkout session
    // Update user subscription
  }),
  
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    // Return current month's usage
  }),
  
  checkRateLimit: publicProcedure.input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
    // Check if user has exceeded rate limit
  })
});
```

### Middleware Implementation
Create `server/_core/rateLimitingMiddleware.ts`:
```typescript
export function rateLimitingMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  const userTier = getUserTier(userId);
  
  // Check rate limit
  const requestsThisMinute = getRequestCount(userId, 'minute');
  if (requestsThisMinute > userTier.requestsPerMinute) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Check monthly limit
  const requestsThisMonth = getRequestCount(userId, 'month');
  if (requestsThisMonth > userTier.requestsPerMonth) {
    return res.status(429).json({ error: 'Monthly limit exceeded' });
  }
  
  next();
}
```

### Stripe Integration
- Create checkout session for tier upgrades
- Handle webhook for subscription updates
- Manage billing cycles and cancellations
- Track usage metrics per user

### Implementation Steps
1. Register `rateLimitingRouter` in `server/routers.ts`
2. Create rate limiting middleware
3. Apply middleware to Express app
4. Create pricing page in `client/src/pages/Pricing.tsx`
5. Create subscription management page
6. Integrate Stripe checkout
7. Create tests for rate limiting logic
8. Add usage analytics dashboard

### QUMUS Integration
- Policy: `rate-limit-enforcement-policy` - Enforce tier-based limits
- Policy: `tier-upgrade-policy` - Track upgrade decisions
- Decision tracking for all tier changes
- Audit trail for usage violations

---

## Phase 4: Continuous Learning Pipeline

### Database Schema (Already Added)
```sql
-- Decision feedback
CREATE TABLE decision_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id),
  decisionId VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  actionTaken BOOLEAN DEFAULT FALSE,
  outcome TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Policy performance metrics
CREATE TABLE policy_performance_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policyName VARCHAR(255) NOT NULL UNIQUE,
  totalDecisions INT DEFAULT 0,
  acceptedDecisions INT DEFAULT 0,
  rejectedDecisions INT DEFAULT 0,
  averageRating DECIMAL(3, 2) DEFAULT 0.00,
  accuracy DECIMAL(5, 2) DEFAULT 0.00,
  precision DECIMAL(5, 2) DEFAULT 0.00,
  recall DECIMAL(5, 2) DEFAULT 0.00,
  f1Score DECIMAL(5, 2) DEFAULT 0.00,
  lastUpdated TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### Router Implementation
Create `server/routers/continuousLearningRouter.ts`:
```typescript
export const continuousLearningRouter = router({
  submitFeedback: protectedProcedure
    .input(z.object({
      decisionId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
      actionTaken: z.boolean().optional(),
      outcome: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
    // Save feedback to database
    // Trigger learning pipeline
    // Update policy metrics
  }),
  
  getPolicyMetrics: protectedProcedure
    .input(z.object({ policyName: z.string() }))
    .query(async ({ input }) => {
    // Return performance metrics for policy
  }),
  
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    // Return policy improvement recommendations
  }),
  
  comparePolicies: protectedProcedure
    .input(z.object({ policy1: z.string(), policy2: z.string() }))
    .query(async ({ input }) => {
    // Compare performance of two policies
  })
});
```

### Learning Pipeline Architecture
```
1. Feedback Collection
   - User rates decisions (1-5 stars)
   - Optional comments and outcome tracking
   - Stored in decision_feedback table

2. Analysis Phase
   - Calculate accuracy: (correct decisions / total) * 100
   - Calculate precision: (true positives / (true positives + false positives)) * 100
   - Calculate recall: (true positives / (true positives + false negatives)) * 100
   - Calculate F1 score: 2 * (precision * recall) / (precision + recall)

3. Comparison Phase
   - A/B test policy variants
   - Compare metrics across policies
   - Identify underperforming policies

4. Optimization Phase
   - Generate recommendations for policy improvements
   - Suggest rule changes based on feedback patterns
   - Identify edge cases and exceptions

5. Deployment Phase
   - Gradual rollout of improved policies
   - Canary deployment (5% → 25% → 50% → 100%)
   - Monitor performance during rollout
   - Automatic rollback if metrics degrade
```

### Frontend Components
```typescript
// client/src/components/FeedbackWidget.tsx
- Star rating component
- Comment input
- Action tracking
- Outcome selection

// client/src/pages/PolicyMetrics.tsx
- Performance metrics dashboard
- Trend charts
- Comparison views
- Recommendation panel

// client/src/pages/LearningDashboard.tsx
- Feedback analytics
- Policy performance trends
- A/B test results
- Improvement recommendations
```

### Implementation Steps
1. Register `continuousLearningRouter` in `server/routers.ts`
2. Create feedback collection UI component
3. Implement metrics calculation service
4. Create policy comparison UI
5. Build learning pipeline service
6. Create recommendation engine
7. Implement A/B testing framework
8. Add monitoring and alerting
9. Create comprehensive tests

### QUMUS Integration
- Policy: `feedback-collection-policy` - Track feedback submissions
- Policy: `policy-optimization-policy` - Track policy improvements
- Policy: `learning-model-policy` - Track ML model deployments
- Decision tracking for all learning pipeline actions
- Audit trail for policy changes

---

## Deployment Checklist

### Pre-Deployment
- [ ] All database migrations applied
- [ ] All routers registered in `server/routers.ts`
- [ ] All tests passing (267+ tests)
- [ ] TypeScript compilation: 0 errors
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated

### Deployment
- [ ] Database backup created
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Deploy to production
- [ ] Monitor all metrics
- [ ] Verify all features working

### Post-Deployment
- [ ] Monitor error rates (target: < 1%)
- [ ] Monitor latency (target: p99 < 1000ms)
- [ ] Verify QUMUS decision tracking
- [ ] Check audit trail logging
- [ ] Monitor resource usage
- [ ] Gather user feedback
- [ ] Plan Phase 5 & 6

---

## Testing Strategy

### Unit Tests
- Test each router procedure independently
- Test rate limiting logic
- Test feedback collection
- Test metrics calculation
- Target: 90%+ code coverage

### Integration Tests
- Test router → database interactions
- Test Stripe integration
- Test learning pipeline end-to-end
- Test QUMUS decision tracking

### Load Tests
- Test with 1000+ concurrent users
- Verify rate limiting under load
- Monitor database performance
- Check API response times

### Security Tests
- Test rate limit bypass attempts
- Test unauthorized access
- Test data validation
- Test SQL injection prevention

---

## Monitoring & Alerting

### Key Metrics
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Rate limit violations
- Feedback submission rate
- Policy performance trends
- Database query performance

### Alerting Thresholds
- Error rate > 1% → Critical
- Latency p99 > 1000ms → Warning
- Rate limit violations > 10/min → Alert
- Feedback rating < 3.0 → Warning
- Policy accuracy < 90% → Alert

---

## Timeline

- **Week 1**: Phase 2 (Dashboards)
- **Week 2**: Phase 3 (Rate Limiting)
- **Week 3**: Phase 4 (Learning Pipeline)
- **Week 4**: Testing & Optimization
- **Week 5**: Production Deployment

---

## Support & Questions

Refer to:
- QUMUS_EVOLUTION_FRAMEWORK.md for architecture
- PRODUCTION_DEPLOYMENT.md for deployment procedures
- FINAL_VERIFICATION.md for verification checklist
- Code comments in router implementations

---

**Last Updated**: 2026-02-05
**Status**: Ready for Phase 2 Implementation
**Next Review**: 2026-02-12
