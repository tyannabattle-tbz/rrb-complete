# Rockin' Rockin' Boogie — Admin & Creator Guide

**Canryn Production and its subsidiaries**
**System Administration, Content Creation, and QUMUS Operations Manual**

---

## 1. Overview

This guide is for administrators and content creators who manage the Rockin' Rockin' Boogie ecosystem. It covers QUMUS autonomous system management, content operations, broadcast administration, policy configuration, and the full operational workflow from content creation to distribution.

---

## 2. Admin Access

### 2.1 Becoming an Admin

Admin access is controlled via the `role` field in the `users` database table. To promote a user to admin:

1. Navigate to the **Database** panel in the Management UI
2. Find the user in the `users` table
3. Change their `role` field from `user` to `admin`
4. The user must log out and log back in for the role change to take effect

Alternatively, use SQL directly:
```sql
UPDATE users SET role = 'admin' WHERE open_id = '<user_open_id>';
```

### 2.2 Admin Navigation

Once logged in as an admin, the **Admin** link appears in the top navigation bar. The admin section provides access to:

| Section | Path | Purpose |
|---------|------|---------|
| QUMUS Admin Dashboard | `/rrb/qumus/admin` | Central QUMUS control panel |
| Command Console | `/rrb/qumus/command-console` | Text-based command interface |
| Ecosystem Dashboard | `/rrb/qumus/ecosystem` | Full ecosystem overview |
| State of the Studio | `/rrb/state-of-the-studio` | Bridge between Legacy Restored & Continues |
| Broadcast Admin | `/rrb/broadcast/admin` | Radio channel management |
| Content Scheduler | `/rrb/studio/scheduler` | Content scheduling and rotation |

---

## 3. QUMUS Autonomous System

### 3.1 The 14 Policies

QUMUS operates under 14 autonomous decision policies. Each policy has a configurable autonomy level that determines what percentage of decisions are made automatically versus escalated for human review.

| # | Policy | Autonomy | Admin Path |
|---|--------|----------|------------|
| 1 | Recommendation Engine | 92% | `/rrb/qumus/admin` |
| 2 | Payment Processing | 85% | `/rrb/qumus/admin` |
| 3 | Content Moderation | 88% | `/rrb/qumus/admin` |
| 4 | User Registration | 95% | `/rrb/qumus/admin` |
| 5 | Subscription Management | 90% | `/rrb/qumus/admin` |
| 6 | Performance Alert | 92% | `/rrb/qumus/admin` |
| 7 | Analytics Aggregation | 95% | `/rrb/qumus/admin` |
| 8 | Compliance Reporting | 75% | `/rrb/qumus/admin` |
| 9 | Code Maintenance | 90% | `/rrb/qumus/code-maintenance` |
| 10 | Performance Monitoring | 92% | `/rrb/qumus/performance-monitoring` |
| 11 | Content Archival | 90% | `/rrb/qumus/content-archival` |
| 12 | Royalty Audit | 88% | `/rrb/qumus/royalty-audit` |
| 13 | Community Engagement | 85% | `/rrb/qumus/community-engagement` |
| 14 | AI Content Generation | 87% | `/rrb/qumus/ai-content` |

### 3.2 Decision Flow

Every QUMUS decision follows this flow:

1. **Event received** — An input event triggers a policy evaluation
2. **Confidence calculated** — QUMUS calculates a confidence score (0–100)
3. **Threshold check** — If confidence exceeds the policy's autonomy level, the decision is executed automatically
4. **Escalation** — If confidence is below threshold, the decision is escalated to the Human Review queue
5. **Audit trail** — Every decision (autonomous or escalated) is logged with full context

### 3.3 Human Review Queue

Access the Human Review queue at `/rrb/qumus/human-review`. Escalated decisions appear here with:

- The original event data
- QUMUS's confidence score and reasoning
- Recommended action
- Approve / Reject / Override controls

Critical decisions (payments, compliance, legal) always require human approval regardless of confidence.

### 3.4 Command Console

The Command Console at `/rrb/qumus/command-console` provides a text-based interface for system operations. Key commands:

**System Commands:**
```
QUMUS: health check       — Full system health report
QUMUS: autonomy status    — Current autonomy levels
QUMUS: metrics            — Performance metrics
```

**Broadcast Commands:**
```
RRB: now playing          — Current track info
RRB: schedule             — View broadcast schedule
RRB: switch channel <n>   — Switch active channel
```

**Code Maintenance (Policy #9):**
```
code scan                 — Run full code health scan
code health               — Code health summary
code scheduler            — Scan scheduler status
```

**Performance Monitoring (Policy #10):**
```
performance benchmark     — Run performance benchmark
performance status        — Current performance status
performance latency       — API latency report
performance memory        — Memory usage report
```

**Content Archival (Policy #11):**
```
archive scan              — Run content archival scan
archive status            — Archival health summary
archive wayback           — Check Wayback Machine archives
archive linkrot           — List dead/degraded links
archive scheduler         — Archival scheduler status
```

**Royalty Audit (Policy #12):**
```
royalty status             — Royalty audit summary
royalty run                — Run full royalty audit
royalty discrepancies      — View open discrepancies
royalty platforms          — List monitored platforms
royalty scheduler          — Audit scheduler status
royalty musicbrainz        — View MusicBrainz cross-references
royalty mb-scan            — Run MusicBrainz scan
```

**Community Engagement (Policy #13):**
```
community status           — Community engagement summary
community channels         — Channel metrics overview
community campaigns        — Active campaigns list
community score            — Overall engagement score
community report           — Generate engagement report
community members          — List community members by tier
```

**AI Content Generation Commands:**
```
aicontent status            — Content generation summary
aicontent generate          — Run content generation now
aicontent templates         — List active templates
aicontent pending           — Show pending review items
aicontent scheduler         — Scheduler status
aicontent reports           — Recent generation reports
```

**CSV Import Commands (via Royalty Audit dashboard):**
- Navigate to Royalty Audit > CSV Import tab
- Paste CSV or upload .csv file from DistroKid, TuneCore, CD Baby, Spotify, Apple Music
- System auto-detects columns and cross-references against expected payout rates

**HybridCast Commands:**
```
HybridCast: status        — Emergency broadcast status
HybridCast: activate      — Activate emergency mode
```

---

## 4. Content Archival Operations (Policy #11)

### 4.1 Purpose

The Content Archival Policy monitors 14+ evidence links across BMI, Discogs, U.S. Copyright Office, streaming platforms, and legal resources. It detects link rot, preserves content via the Wayback Machine, and maintains the integrity of the Proof Vault's external references.

### 4.2 Running a Scan

1. Navigate to `/rrb/qumus/content-archival`
2. Click **Run Full Scan** to check all monitored links
3. The scan reports: alive, degraded, dead links, new Wayback archives, and recommendations
4. Alternatively, use the Command Console: `archive scan`

### 4.3 Adding Monitored Links

From the Content Archival Dashboard, click **Add Link** and provide:
- URL to monitor
- Category (bmi, discogs, copyright_office, streaming, legal, social)
- Description of what the link proves
- Priority level (critical, high, medium, low)

### 4.4 Scheduler

Enable the automated scheduler to run periodic scans. Default interval is 6 hours. The scheduler can be started/stopped from the dashboard or via commands:
```
archive scheduler         — Check status
```

---

## 5. Royalty Audit Operations (Policy #12)

### 5.1 Purpose

The Royalty Audit Policy cross-references BMI song registrations with streaming platform payouts to detect discrepancies, missing credits, and rate mismatches. It monitors 11+ royalty sources across 6+ platforms for Seabrun Candy Hunter's legacy works.

### 5.2 Default Monitored Sources

| Platform | Song | Type |
|----------|------|------|
| BMI | Rockin' Rockin' Boogie (Performer) | Registration |
| BMI | Rockin' Rockin' Boogie (Writer) | Registration |
| BMI | Let's Work Together (Performer) | Registration |
| BMI | Let's Work Together (Writer/Payten Music) | Registration |
| Spotify | Rockin' Rockin' Boogie | Streaming |
| Spotify | Let's Work Together | Streaming |
| Apple Music | Rockin' Rockin' Boogie | Streaming |
| YouTube | Rockin' Rockin' Boogie | Streaming |
| SoundExchange | Rockin' Rockin' Boogie | Digital Performance |
| SoundExchange | Let's Work Together | Digital Performance |
| Discogs | Canned Heat Catalog | Marketplace |

### 5.3 Running an Audit

1. Navigate to `/rrb/qumus/royalty-audit`
2. Click **Run Full Audit** to scan all sources
3. The audit compares expected vs. actual rates, flags discrepancies, and generates recommendations
4. Alternatively, use the Command Console: `royalty run`

### 5.4 Managing Discrepancies

When a discrepancy is detected, it appears in the Discrepancies tab with severity (critical/high/medium/low). Actions available:

- **Acknowledge** — Mark as seen, under review
- **Escalate** — Flag for legal review (appears in Human Review queue)
- **Dispute** — Add a dispute note with reason
- **Resolve** — Mark as resolved with resolution notes

### 5.5 Adding New Sources

From the Royalty Audit Dashboard, click **Add Source** and provide:
- Platform (bmi, spotify, apple_music, youtube, soundexchange, discogs, tidal, amazon_music, etc.)
- Type (registration, streaming, digital_performance, marketplace)
- Song title and artist
- Expected royalty rate (cents per stream/play)
- Period (e.g., 2026-Q1)

---

## 6. Broadcast Administration

### 6.1 Channel Management

Navigate to `/rrb/broadcast/admin` to manage the 7 radio channels. Each channel can be configured with:

- Name and description
- Content source (playlist, live stream, scheduled content)
- Schedule (24/7 or time-based)
- Audio quality settings

### 6.2 Content Scheduling

The Content Scheduler at `/rrb/studio/scheduler` manages automated content rotation. Create schedules with:

- Time slots (day, hour, duration)
- Content type (music, podcast, meditation, emergency)
- Priority levels for override scenarios
- Repeat patterns (daily, weekly, custom)

### 6.3 Emergency Broadcast

When an emergency broadcast is needed:

1. Use the Command Console: `HybridCast: activate`
2. Or navigate to the HybridCast dashboard
3. Emergency broadcasts override all channels
4. The system supports offline mesh networking via LoRa/Meshtastic

---

## 7. Content Creation Workflow

### 7.1 Adding Proof Vault Items

To add new evidence to the Proof Vault:

1. Capture screenshots or gather documentation
2. Upload files to the platform's S3 storage
3. Add the proof item with: title, category, date, description, source URL, and screenshots
4. The Content Archival Policy will automatically begin monitoring the source URL

### 7.2 Publishing Podcasts

1. Record and edit your podcast episode
2. Upload the audio/video file through the Studio Suite
3. Add metadata: title, description, series, episode number
4. Schedule publication or publish immediately
5. The content scheduler handles distribution across channels

### 7.3 Music Catalog Management

Navigate to **The Music** admin section to:

- Add new verified songs with BMI registration data
- Update streaming platform links
- Add collaborator credits
- Link to Proof Vault evidence items

---

## 8. Financial Operations

### 8.1 Donations (Stripe)

The platform accepts donations exclusively for legacy recovery efforts through the Sweet Miracles Foundation. Stripe is pre-configured with test and live keys.

**Testing payments:**
- Use card number: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Navigate to Settings → Payment for a 99% discount promo code for live mode testing

**Going live:**
1. Complete Stripe KYC verification
2. Enter live keys in Settings → Payment
3. Minimum transaction: $0.50 USD

### 8.2 Royalty Tracking

The Royalty Tracker at `/rrb/royalty-tracker` provides:

- Estimated earnings across platforms
- Historical payout data
- Discrepancy alerts from the Royalty Audit Policy
- Export capabilities for accounting

---

## 9. Ecosystem Dashboard

The Ecosystem Dashboard at `/rrb/qumus/ecosystem` provides a unified view of all platform systems:

- **QUMUS Brain** — Autonomy rate, decision count, active policies
- **Broadcast Status** — Channel health, listener count, stream quality
- **Code Maintenance** — Open issues, auto-fixes, scan history
- **Performance Monitoring** — Page load times, API latency, memory usage
- **Content Archival** — Monitored links, health score, Wayback archives
- **Royalty Audit** — Sources, platforms, discrepancies, audit history
- **Event Bus** — Total events, throughput, failed events
- **AI Collaboration Hub** — External AI engagement status

---

## 10. State of the Studio

The State of the Studio at `/rrb/state-of-the-studio` is the critical bridge between Legacy Restored and Legacy Continues. It provides:

- Overall ecosystem health score
- Individual system health metrics (QUMUS, Broadcast, Data Integrity, API Response, Code Health, Performance, Content Archival, Royalty Audit)
- Entity status for all ecosystem components
- Quick links to all admin dashboards
- Mission Control navigation

---

## 11. Canryn Production Divisions

The Divisions page at `/rrb/divisions` displays all Canryn Production subsidiaries with their logos and roles:

- **Canryn Production** — Parent company
- **Payten Music** — Music publishing
- **Sweet Miracles Foundation** — Nonprofit arm
- **HybridCast** — Emergency broadcast technology
- **QumUnity** — Community platform

---

## 12. Security & Compliance

### 12.1 Authentication

All authentication flows through Manus OAuth. Session cookies are HTTP-only and signed with JWT_SECRET. Protected procedures require authentication; admin procedures require the `admin` role.

### 12.2 Data Protection

- All timestamps stored as UTC Unix timestamps
- Stripe handles all payment data; no card numbers stored locally
- S3 storage for all file assets; no file bytes in the database
- Webhook signatures verified before processing

### 12.3 Compliance Reporting (Policy #8)

The Compliance Reporting Policy (75% autonomy) generates regulatory reports and flags potential compliance issues. Due to the sensitive nature, 25% of decisions require human review.

---

## 13. Deployment & Publishing

### 13.1 Creating a Checkpoint

Before publishing, always create a checkpoint:
1. Ensure all changes are saved
2. The system creates a checkpoint automatically
3. Checkpoints can be rolled back if issues are discovered

### 13.2 Publishing

Click the **Publish** button in the Management UI header. The platform deploys to the production domain. Custom domains can be configured in Settings → Domains.

### 13.3 Domain Configuration

- Auto-generated domain: `xxx.manus.space`
- Custom domains can be purchased or bound through Settings → Domains
- SSL certificates are managed automatically

---

*Copyright 2024–2026 Canryn Production and its subsidiaries. All rights reserved.*
*A Canryn Production — Past, Protection, Presentation, and Preservation*
