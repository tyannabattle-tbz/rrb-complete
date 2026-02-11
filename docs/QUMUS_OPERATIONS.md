# QUMUS Operations Procedures

**Canryn Production and its subsidiaries**
**Standard Operating Procedures for QUMUS Autonomous System**

---

## 1. Daily Operations Checklist

### Morning Check (Recommended)

1. Open the **State of the Studio** (`/rrb/state-of-the-studio`)
2. Verify all health metrics are green (target: 90+ across all categories)
3. Check the **Ecosystem Dashboard** for any overnight alerts
4. Review the **Human Review Queue** for any escalated decisions
5. Verify all 7 radio channels are broadcasting
6. Check **AI Content Generation** dashboard for pending review items
7. Review and publish approved AI-generated content

### Weekly Operations

1. Run a **Content Archival Scan** to verify all evidence links are alive
2. Run a **Royalty Audit** to check for payout discrepancies
3. Run a **Code Health Scan** to detect broken images, dead links, or stale assets
4. Run a **Performance Benchmark** to baseline system performance
5. Review QUMUS decision analytics for autonomy rate trends
6. Run **AI Content Generation** to create fresh show descriptions, social posts, and schedules
7. Import latest **CSV payout data** from DistroKid/TuneCore/CD Baby into Royalty Audit
8. Review **Community Engagement** report for listener trends and campaign effectiveness

### Monthly Operations

1. Export royalty audit reports for accounting
2. Review and update Proof Vault with any new evidence
3. Audit user accounts and admin access
4. Review AI Content Generation templates and update prompts as needed
5. Cross-reference MusicBrainz data with BMI registrations for new releases
4. Review Stripe donation reports
5. Update content scheduling for the upcoming month

---

## 2. Emergency Procedures

### 2.1 System Health Alert

If the State of the Studio shows a health score below 80:

1. Open the **Command Console**
2. Run `QUMUS: health check` for a full diagnostic
3. Check specific subsystems: `code health`, `performance status`, `archive status`, `royalty status`
4. Review recent QUMUS decisions for anomalies
5. If a specific policy is failing, check its dedicated dashboard

### 2.2 Link Rot Detected

If the Content Archival scan detects dead links:

1. Navigate to `/rrb/qumus/content-archival`
2. Review the dead links in the scan report
3. Check if Wayback Machine has a cached copy
4. If the link is critical evidence, escalate to legal team
5. Update the Proof Vault with alternative sources if available
6. Add the Wayback Machine URL as a backup reference

### 2.3 Royalty Discrepancy Found

If the Royalty Audit detects a discrepancy:

1. Navigate to `/rrb/qumus/royalty-audit`
2. Review the discrepancy details (expected vs. actual, platform, song)
3. For critical discrepancies (>$100 or missing credits):
   - Escalate immediately via the dashboard
   - Document the discrepancy with screenshots
   - Contact the platform's royalty department
4. For minor discrepancies (<$10):
   - Acknowledge and monitor for patterns
   - If recurring, escalate after 3 occurrences

### 2.4 Emergency Broadcast Activation

1. Use the Command Console: `HybridCast: activate`
2. Or navigate to the HybridCast dashboard
3. Select the emergency type and broadcast area
4. All radio channels will be overridden with the emergency broadcast
5. The system activates offline mesh networking automatically
6. Monitor the emergency dashboard for community response

---

## 3. QUMUS Policy Tuning

### 3.1 Adjusting Autonomy Levels

Each policy's autonomy level determines the confidence threshold for automatic execution. To adjust:

1. Navigate to the QUMUS Admin Dashboard
2. Select the policy to modify
3. Adjust the autonomy slider (0–100%)
4. Higher autonomy = more automatic decisions, fewer escalations
5. Lower autonomy = more human review, fewer automatic decisions

**Recommended levels:**

| Policy | Min | Recommended | Max |
|--------|-----|-------------|-----|
| Recommendation Engine | 80% | 92% | 98% |
| Payment Processing | 70% | 85% | 90% |
| Content Moderation | 75% | 88% | 95% |
| User Registration | 85% | 95% | 99% |
| Subscription Management | 80% | 90% | 95% |
| Performance Alert | 85% | 92% | 98% |
| Analytics Aggregation | 90% | 95% | 99% |
| Compliance Reporting | 60% | 75% | 85% |
| Code Maintenance | 80% | 90% | 95% |
| Performance Monitoring | 85% | 92% | 98% |
| Content Archival | 80% | 90% | 95% |
| Royalty Audit | 75% | 88% | 92% |
| Community Engagement | 72% | 85% | 90% |
| AI Content Generation | 75% | 87% | 93% |

### 3.2 Policy Interaction Matrix

Some policies interact with each other. Understanding these interactions helps with tuning:

- **Code Maintenance + Performance Monitoring** — Code issues often cause performance degradation; fixing code issues may resolve performance alerts
- **Content Archival + Royalty Audit** — Both monitor external links; archival ensures links are alive, royalty audit verifies payout data
- **Payment Processing + Compliance Reporting** — Payment events trigger compliance checks
- **Content Moderation + Recommendation Engine** — Moderated content is excluded from recommendations
- **Community Engagement + Recommendation Engine** — Engagement data informs content recommendations
- **Community Engagement + Payment Processing** — Donation patterns tracked across engagement channels
- **Royalty Audit + MusicBrainz** — Cross-references BMI registrations with open music database
- **AI Content Generation + Recommendation Engine** — Generated content feeds into recommendation pipeline
- **AI Content Generation + Content Moderation** — Generated content passes through moderation before publishing
- **AI Content Generation + Community Engagement** — Engagement data informs content generation topics and timing
- **Royalty Audit + CSV Import** — Imported payout data cross-referenced against expected rates for discrepancy detection

---

## 4. Backup & Recovery

### 4.1 Checkpoint Management

- Create checkpoints before any major changes
- Checkpoints capture: code, configuration, dependencies, and environment state
- Rollback to any previous checkpoint if issues arise

### 4.2 Data Backup

- Database is managed by TiDB with automatic backups
- S3 storage provides durability for all file assets
- QUMUS decision logs are preserved in the database for audit trail

### 4.3 Recovery Procedures

If the platform becomes unresponsive:

1. Check the dev server status in the Management UI
2. Restart the server if needed
3. If the restart fails, rollback to the last known good checkpoint
4. Verify database connectivity
5. Check S3 storage accessibility

---

## 5. Monitoring & Alerting

### 5.1 Real-Time Monitoring

The platform provides real-time monitoring through:

- **State of the Studio** — Overall health dashboard
- **Ecosystem Dashboard** — Detailed system metrics
- **QUMUS Admin** — Decision analytics and policy performance
- **Performance Monitoring** — Page load, API latency, memory usage
- **Royalty Audit** — Payout discrepancies and MusicBrainz cross-references
- **Community Engagement** — Listener engagement scores and campaign effectiveness
- **AI Content Generation** — Template status, pending review queue, generation reports, scheduler status

### 5.2 Alert Channels

- **QUMUS Notifications** — In-platform notifications for critical events
- **Owner Notifications** — Push notifications to the platform owner
- **Human Review Queue** — Escalated decisions requiring attention

### 5.3 Key Metrics to Watch

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| QUMUS Autonomy Rate | >85% | 70–85% | <70% |
| System Health Score | >90 | 75–90 | <75 |
| Link Health | >95% alive | 85–95% alive | <85% alive |
| Royalty Discrepancies | 0 critical | 1–2 critical | >2 critical |
| API Latency | <200ms | 200–500ms | >500ms |
| Error Rate | <1% | 1–5% | >5% |

---

## 6. External AI Engagement

QUMUS has the capability to engage with other open-source AI autonomous systems for experience, growth, knowledge, collaboration, and mentorship. This does not require full integration — QUMUS can interact with external AI systems through the AI Collaboration Hub.

### 6.1 Accessing the AI Collaboration Hub

Navigate to the Ecosystem Dashboard to find the AI Collaboration Hub widget. This provides:

- Status of external AI connections
- Collaboration history
- Knowledge exchange logs
- Mentorship session records

---

*Copyright 2024–2026 Canryn Production and its subsidiaries. All rights reserved.*
*QUMUS — 90% Autonomous, 10% Human, 100% Accountable*
