# Rockin' Rockin' Boogie — Future To-Do List

**Last Updated:** February 11, 2026
**Platform Version:** v11.7
**Status:** Site live at [rockinrockinboogie.com](https://rockinrockinboogie.com)
**GitHub Backup:** [tyannabattle-tbz/rrb-qumus-platform](https://github.com/tyannabattle-tbz/rrb-qumus-platform) (private)

This document tracks all pending operational tasks that are **not code changes** — they are actions you (the owner) take when ready. The QUMUS autonomous engine is aware of these tasks and will remind you through the dashboard.

---

## Priority 1 — Do When Ready (Revenue & Rights Protection)

| # | Task | Where | When to Do It | Why It Matters |
|---|------|-------|---------------|----------------|
| 1 | **Import CSV payout data** | `/rrb/qumus/royalty-audit` → CSV Import tab | When you receive your first payout report from DistroKid, TuneCore, CD Baby, Spotify, or Apple Music | Tracks every penny earned, detects discrepancies between BMI registrations and actual payouts |
| 2 | **Register with BMI as publisher** | [bmi.com](https://www.bmi.com) | As soon as possible if not already done | Required to collect performance royalties for Seabrun's compositions |
| 3 | **Register with SoundExchange** | [soundexchange.com](https://www.soundexchange.com) | As soon as possible | Collects digital performance royalties from internet/satellite radio plays |
| 4 | **Set up a distributor** (DistroKid, TuneCore, or CD Baby) | Distributor website | When ready to distribute music to streaming platforms | Gets Seabrun's music on Spotify, Apple Music, Amazon, etc. and generates the CSV payout files |
| 5 | **Run initial Royalty Audit baseline scan** | `/rrb/qumus/royalty-audit` → click "Run Scan" | After importing first CSV data | Establishes baseline for QUMUS to detect future discrepancies |
| 6 | **Run initial Content Archival baseline scan** | `/rrb/qumus/content-archival` → click "Run Scan" | Anytime (can do now) | Checks all evidence links in Proof Vault, archives to Wayback Machine, detects link rot |

---

## Priority 2 — GitHub Repository Maintenance

| # | Task | Where | How |
|---|------|-------|-----|
| 7 | **Enable GitHub Discussions** | GitHub repo → Settings → Features | Check the "Discussions" box. Creates a community forum for the project |
| 8 | **Enable auto-delete head branches** | GitHub repo → Settings → General → Pull Requests | Check "Automatically delete head branches." Keeps repo clean after merging PRs |
| 9 | **Set branch protection rules** | GitHub repo → Settings → Branches | Add rule for `main` branch: require PR reviews before merging |

---

## Priority 3 — Ongoing Operations (QUMUS Handles Automatically)

These tasks run automatically through the QUMUS autonomous engine. You only need to check dashboards periodically.

| Task | QUMUS Policy | Frequency | Your Action |
|------|-------------|-----------|-------------|
| Content link monitoring | Content Archival (#11) | Every 6 hours | Review alerts if links go dead |
| Royalty discrepancy detection | Royalty Audit (#12) | Daily | Acknowledge or escalate flagged discrepancies |
| Performance metrics tracking | Performance Monitoring (#10) | Continuous | Review weekly summary |
| Community engagement scoring | Community Engagement (#13) | Daily | Review engagement trends monthly |
| AI content generation | AI Content Generation (#14) | On-demand | Approve or reject generated content |
| Code health scanning | Code Maintenance (#9) | Every 6 hours | Review if critical issues found |
| Human review queue | Human Review (#8) | As needed | Approve/reject pending decisions |

---

## Priority 4 — Future Enhancements (Optional, No Rush)

| # | Enhancement | Description | Effort |
|---|------------|-------------|--------|
| 10 | **Stripe Connect for collaborator payouts** | Already built — activate when collaborating artists need direct payouts | Configuration only |
| 11 | **Sweet Miracles NPO integration** | Connect donation system to nonprofit entity when established | Medium |
| 12 | **HuBaRu healing frequency content** | Upload meditation/healing audio content to the platform | Content creation |
| 13 | **RRB Radio live broadcasting** | Set up live stream scheduling for the 7-channel radio system | Configuration |
| 14 | **Solbones dice game content** | Add game assets and player community features | Content creation |
| 15 | **Custom merchandise shop** | Activate e-commerce features for RRB branded merchandise | Medium |

---

## How to Use This Document

1. **Check the QUMUS Ecosystem Dashboard** at `/rrb/qumus/ecosystem` — it shows the status of all 14 policies and any pending tasks
2. **Start with Priority 1** items — these protect Seabrun's revenue and rights
3. **Priority 2** items are one-time GitHub settings — takes 2 minutes
4. **Priority 3** runs automatically — just check dashboards weekly
5. **Priority 4** is for when you're ready to expand

---

*This document is part of the RRB QUMUS Ecosystem documentation suite.*
*Canryn Production and its subsidiaries — Sweet Miracles, HuBaRu, RRB Radio.*
*All logos designed by Seabrun Candy Hunter.*
