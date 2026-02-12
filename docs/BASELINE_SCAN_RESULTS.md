# Baseline Scan Results — February 11, 2026

These are the initial baseline scans run against the live RRB QUMUS platform. All future scans will be compared against these baselines to detect changes, link rot, and royalty discrepancies.

---

## Content Archival Baseline Scan

| Metric | Value |
|--------|-------|
| **Scan Date** | February 11, 2026 |
| **Total Monitored Links** | 13 |
| **Alive** | 9 |
| **Degraded** | 4 (possible network latency — not dead) |
| **Dead** | 0 |
| **New Wayback Archives** | 0 (already archived) |
| **Link Rot Rate** | 0% |
| **Average Response Time** | 1,285ms |
| **Health Score** | 85/100 (Grade B) |

**Links by Category:**

| Category | Count |
|----------|-------|
| Evidence | 2 |
| Legal | 5 |
| Music Database | 2 |
| Streaming | 2 |
| Reference | 1 |
| Government | 1 |

**Recommendations:** 4 links showing degraded response times — likely network latency, not link rot. Monitor on next scan.

---

## Royalty Audit Baseline Scan

| Metric | Value |
|--------|-------|
| **Scan Date** | February 11, 2026 |
| **Period** | 2026-Q1 |
| **Total Sources** | 10 |
| **Verified Sources** | 3 |
| **Pending Sources** | 7 (awaiting payout data import) |
| **Total Discrepancies** | 0 |
| **Critical Discrepancies** | 0 |
| **Songs Tracked** | 2 |
| **Platforms** | 5 (BMI, Spotify, Apple Music, YouTube, SoundExchange) |
| **Health Score** | 79/100 (Grade C) |

**Platform Breakdown:**

| Platform | Sources |
|----------|---------|
| BMI | 4 |
| Spotify | 2 |
| Apple Music | 2 |
| YouTube | 1 |
| SoundExchange | 1 |

**Recommendations:**
1. Update pending royalty sources with latest payout data (import CSV from distributor)
2. Schedule quarterly royalty reconciliation with Canryn Production accounting

The health score will improve from C to A once payout data is imported and sources are verified.

---

## Next Steps

1. **Import CSV payout data** when available — this will move 7 pending sources to verified status
2. **Re-run Content Archival scan** in 1 week to confirm degraded links recover
3. **Set up automated schedulers** on both dashboards for ongoing monitoring
4. QUMUS will automatically track changes from these baselines going forward

---

*Canryn Production and its subsidiaries — Sweet Miracles, HuBaRu, RRB Radio.*
