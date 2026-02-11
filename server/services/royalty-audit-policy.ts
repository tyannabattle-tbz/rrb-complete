/**
 * QUMUS 12th Autonomous Decision Policy — Royalty Audit
 * 
 * Cross-references BMI registration data with streaming platform payouts
 * to detect discrepancies, missing royalties, and unauthorized usage.
 * 
 * Autonomy: 88% — auto-flags discrepancies, auto-generates reports
 * Human Override: 12% — dispute filing, legal escalation, payout corrections
 * 
 * A Canryn Production — Past, Protection, Presentation, and Preservation
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RoyaltySource {
  id: string;
  platform: string;          // 'bmi' | 'ascap' | 'soundexchange' | 'spotify' | 'apple_music' | 'youtube' | 'tidal' | 'amazon_music' | 'pandora'
  type: 'pro' | 'streaming' | 'mechanical' | 'sync' | 'performance';
  songTitle: string;
  artist: string;
  ipi?: string;              // BMI IPI number
  isrc?: string;             // International Standard Recording Code
  iswc?: string;             // International Standard Musical Work Code
  expectedRate: number;      // Expected royalty rate per stream/play (cents)
  actualRate?: number;       // Actual rate received
  totalPlays?: number;
  totalEarned?: number;      // In cents
  period: string;            // e.g. '2025-Q4', '2026-01'
  lastChecked?: Date;
  status: 'verified' | 'discrepancy' | 'missing' | 'pending' | 'disputed';
  notes?: string;
}

export interface RoyaltyDiscrepancy {
  id: string;
  sourceId: string;
  platform: string;
  songTitle: string;
  artist: string;
  type: 'underpayment' | 'missing_royalty' | 'unauthorized_use' | 'rate_mismatch' | 'missing_credit' | 'delayed_payment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  expectedAmount: number;    // cents
  actualAmount: number;      // cents
  difference: number;        // cents
  period: string;
  detectedAt: Date;
  status: 'open' | 'acknowledged' | 'disputed' | 'resolved' | 'escalated';
  resolution?: string;
  resolvedAt?: Date;
}

export interface AuditReport {
  id: string;
  title: string;
  generatedAt: Date;
  period: string;
  totalSources: number;
  totalDiscrepancies: number;
  totalExpected: number;     // cents
  totalActual: number;       // cents
  totalDifference: number;   // cents
  summaryByPlatform: Record<string, { expected: number; actual: number; discrepancies: number }>;
  summaryByType: Record<string, number>;
  recommendations: string[];
}

export interface AuditSchedulerStatus {
  enabled: boolean;
  intervalMs: number;
  intervalHuman: string;
  lastRun: Date | null;
  nextRun: Date | null;
  totalAudits: number;
}

// ─── State ───────────────────────────────────────────────────────────────────

let royaltySources: RoyaltySource[] = [];
let discrepancies: RoyaltyDiscrepancy[] = [];
let auditReports: AuditReport[] = [];
let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let schedulerEnabled = false;
let schedulerIntervalMs = 12 * 60 * 60 * 1000; // 12 hours default
let lastAuditRun: Date | null = null;
let totalAudits = 0;

const MIN_AUDIT_INTERVAL = 60 * 60 * 1000; // 1 hour minimum

// ─── Default Royalty Sources (Seabrun Candy Hunter catalog) ──────────────────

function initializeDefaultSources(): void {
  royaltySources = [
    // BMI Registered Works
    {
      id: 'src_bmi_rrb',
      platform: 'bmi',
      type: 'pro',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Seabrun Candy Hunter',
      ipi: '00886749700',
      expectedRate: 0,
      status: 'verified',
      period: '2026-Q1',
      notes: 'BMI Songview verified — primary registration',
    },
    {
      id: 'src_bmi_rrb_little_richard',
      platform: 'bmi',
      type: 'pro',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Little Richard',
      ipi: '00886749700',
      expectedRate: 0,
      status: 'verified',
      period: '2026-Q1',
      notes: 'BMI Songview verified — co-artist registration',
    },
    {
      id: 'src_bmi_lwt',
      platform: 'bmi',
      type: 'pro',
      songTitle: "Let's Work Together",
      artist: 'Seabrun Candy Hunter',
      expectedRate: 0,
      status: 'verified',
      period: '2026-Q1',
      notes: 'BMI registered — Payten Music publisher credit (Discogs verified)',
    },
    // Streaming Platform Monitoring
    {
      id: 'src_spotify_rrb',
      platform: 'spotify',
      type: 'streaming',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Seabrun Candy Hunter',
      expectedRate: 0.4,  // ~$0.004 per stream
      actualRate: 0,
      totalPlays: 0,
      totalEarned: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Monitoring for streaming presence and royalty payments',
    },
    {
      id: 'src_apple_rrb',
      platform: 'apple_music',
      type: 'streaming',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Seabrun Candy Hunter',
      expectedRate: 0.8,  // ~$0.008 per stream
      actualRate: 0,
      totalPlays: 0,
      totalEarned: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Monitoring for streaming presence and royalty payments',
    },
    {
      id: 'src_youtube_rrb',
      platform: 'youtube',
      type: 'streaming',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Seabrun Candy Hunter',
      expectedRate: 0.2,  // ~$0.002 per stream
      actualRate: 0,
      totalPlays: 0,
      totalEarned: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Monitoring for YouTube Content ID and royalty payments',
    },
    {
      id: 'src_soundexchange_rrb',
      platform: 'soundexchange',
      type: 'performance',
      songTitle: "Rockin' Rockin' Boogie",
      artist: 'Seabrun Candy Hunter',
      expectedRate: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'SoundExchange digital performance royalties monitoring',
    },
    // Canned Heat — Let's Work Together (Payten Music publisher)
    {
      id: 'src_spotify_lwt',
      platform: 'spotify',
      type: 'streaming',
      songTitle: "Let's Work Together",
      artist: 'Canned Heat',
      expectedRate: 0.4,
      actualRate: 0,
      totalPlays: 0,
      totalEarned: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Payten Music publisher credit — monitoring mechanical royalties',
    },
    {
      id: 'src_apple_lwt',
      platform: 'apple_music',
      type: 'streaming',
      songTitle: "Let's Work Together",
      artist: 'Canned Heat',
      expectedRate: 0.8,
      actualRate: 0,
      totalPlays: 0,
      totalEarned: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Payten Music publisher credit — monitoring mechanical royalties',
    },
    // Mechanical Royalties
    {
      id: 'src_mechanical_lwt',
      platform: 'bmi',
      type: 'mechanical',
      songTitle: "Let's Work Together",
      artist: 'Canned Heat / Wilbert Harrison',
      expectedRate: 9.1,  // HFA statutory rate ~$0.091 per unit
      actualRate: 0,
      status: 'pending',
      period: '2026-Q1',
      notes: 'Mechanical royalty rate per HFA statutory rate — Payten Music',
    },
  ];

  console.log(`[QUMUS RoyaltyAudit] Initialized ${royaltySources.length} default royalty sources`);
}

// Initialize on module load
initializeDefaultSources();

// ─── Source Management ───────────────────────────────────────────────────────

export function getSources(filters?: { platform?: string; type?: string; status?: string }): RoyaltySource[] {
  let result = [...royaltySources];
  if (filters?.platform) result = result.filter(s => s.platform === filters.platform);
  if (filters?.type) result = result.filter(s => s.type === filters.type);
  if (filters?.status) result = result.filter(s => s.status === filters.status);
  return result;
}

export function getSourceById(id: string): RoyaltySource {
  const source = royaltySources.find(s => s.id === id);
  if (!source) throw new Error('Royalty source not found');
  return source;
}

export function addSource(input: Omit<RoyaltySource, 'id' | 'lastChecked' | 'status'>): RoyaltySource {
  const existing = royaltySources.find(s => s.platform === input.platform && s.songTitle === input.songTitle && s.artist === input.artist);
  if (existing) throw new Error('Source already monitored for this platform/song/artist combination');

  const source: RoyaltySource = {
    ...input,
    id: `src_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'pending',
    lastChecked: undefined,
  };
  royaltySources.push(source);
  return source;
}

export function removeSource(id: string): void {
  const idx = royaltySources.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Royalty source not found');
  royaltySources.splice(idx, 1);
}

export function updateSource(id: string, updates: Partial<RoyaltySource>): RoyaltySource {
  const source = royaltySources.find(s => s.id === id);
  if (!source) throw new Error('Royalty source not found');
  Object.assign(source, updates, { lastChecked: new Date() });
  return source;
}

// ─── Discrepancy Management ─────────────────────────────────────────────────

export function getDiscrepancies(filters?: { severity?: string; status?: string; platform?: string }): RoyaltyDiscrepancy[] {
  let result = [...discrepancies];
  if (filters?.severity) result = result.filter(d => d.severity === filters.severity);
  if (filters?.status) result = result.filter(d => d.status === filters.status);
  if (filters?.platform) result = result.filter(d => d.platform === filters.platform);
  return result.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
}

export function acknowledgeDiscrepancy(id: string): RoyaltyDiscrepancy {
  const disc = discrepancies.find(d => d.id === id);
  if (!disc) throw new Error('Discrepancy not found');
  disc.status = 'acknowledged';
  return disc;
}

export function disputeDiscrepancy(id: string, notes?: string): RoyaltyDiscrepancy {
  const disc = discrepancies.find(d => d.id === id);
  if (!disc) throw new Error('Discrepancy not found');
  disc.status = 'disputed';
  if (notes) disc.resolution = notes;
  return disc;
}

export function escalateDiscrepancy(id: string): RoyaltyDiscrepancy {
  const disc = discrepancies.find(d => d.id === id);
  if (!disc) throw new Error('Discrepancy not found');
  disc.status = 'escalated';
  return disc;
}

export function resolveDiscrepancy(id: string, resolution: string): RoyaltyDiscrepancy {
  const disc = discrepancies.find(d => d.id === id);
  if (!disc) throw new Error('Discrepancy not found');
  disc.status = 'resolved';
  disc.resolution = resolution;
  disc.resolvedAt = new Date();
  return disc;
}

// ─── Audit Engine ────────────────────────────────────────────────────────────

export function runAudit(): AuditReport {
  const now = new Date();
  const period = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

  // Cross-reference sources and detect discrepancies
  const newDiscrepancies: RoyaltyDiscrepancy[] = [];

  for (const source of royaltySources) {
    // Check for rate mismatches on streaming platforms
    if (source.type === 'streaming' && source.actualRate !== undefined && source.expectedRate > 0) {
      if (source.actualRate > 0 && Math.abs(source.actualRate - source.expectedRate) / source.expectedRate > 0.25) {
        newDiscrepancies.push({
          id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          sourceId: source.id,
          platform: source.platform,
          songTitle: source.songTitle,
          artist: source.artist,
          type: 'rate_mismatch',
          severity: Math.abs(source.actualRate - source.expectedRate) / source.expectedRate > 0.5 ? 'critical' : 'high',
          expectedAmount: source.expectedRate * (source.totalPlays || 0),
          actualAmount: source.actualRate * (source.totalPlays || 0),
          difference: (source.expectedRate - source.actualRate) * (source.totalPlays || 0),
          period,
          detectedAt: now,
          status: 'open',
        });
      }
    }

    // Check for missing credits on PRO registrations
    if (source.type === 'pro' && source.status === 'pending') {
      // If a PRO source has been pending for too long, flag as missing credit
      newDiscrepancies.push({
        id: `disc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sourceId: source.id,
        platform: source.platform,
        songTitle: source.songTitle,
        artist: source.artist,
        type: 'missing_credit',
        severity: 'high',
        expectedAmount: 0,
        actualAmount: 0,
        difference: 0,
        period,
        detectedAt: now,
        status: 'open',
      });
    }

    source.lastChecked = now;
  }

  // Add new discrepancies
  discrepancies.push(...newDiscrepancies);

  // Generate summary
  const summaryByPlatform: Record<string, { expected: number; actual: number; discrepancies: number }> = {};
  const summaryByType: Record<string, number> = {};

  for (const source of royaltySources) {
    if (!summaryByPlatform[source.platform]) {
      summaryByPlatform[source.platform] = { expected: 0, actual: 0, discrepancies: 0 };
    }
    summaryByPlatform[source.platform].expected += source.expectedRate * (source.totalPlays || 0);
    summaryByPlatform[source.platform].actual += (source.actualRate || 0) * (source.totalPlays || 0);
  }

  for (const disc of discrepancies.filter(d => d.status === 'open')) {
    summaryByType[disc.type] = (summaryByType[disc.type] || 0) + 1;
    if (summaryByPlatform[disc.platform]) {
      summaryByPlatform[disc.platform].discrepancies++;
    }
  }

  const totalExpected = Object.values(summaryByPlatform).reduce((s, p) => s + p.expected, 0);
  const totalActual = Object.values(summaryByPlatform).reduce((s, p) => s + p.actual, 0);

  // Generate recommendations
  const recommendations: string[] = [];
  const openDiscs = discrepancies.filter(d => d.status === 'open');
  if (openDiscs.some(d => d.type === 'missing_credit')) {
    recommendations.push('Contact BMI/ASCAP to verify all songwriter credits are properly registered');
  }
  if (openDiscs.some(d => d.type === 'rate_mismatch')) {
    recommendations.push('Review streaming platform payout statements for rate discrepancies');
  }
  if (openDiscs.some(d => d.type === 'underpayment')) {
    recommendations.push('File formal dispute with platforms showing underpayment patterns');
  }
  if (royaltySources.some(s => s.status === 'pending')) {
    recommendations.push('Update pending royalty sources with latest payout data');
  }
  recommendations.push('Schedule quarterly royalty reconciliation with Canryn Production accounting');

  const report: AuditReport = {
    id: `audit_${Date.now()}`,
    title: `Royalty Audit — ${period}`,
    generatedAt: now,
    period,
    totalSources: royaltySources.length,
    totalDiscrepancies: openDiscs.length,
    totalExpected,
    totalActual,
    totalDifference: totalExpected - totalActual,
    summaryByPlatform,
    summaryByType,
    recommendations,
  };

  auditReports.push(report);
  totalAudits++;
  lastAuditRun = now;

  console.log(`[QUMUS RoyaltyAudit] Audit complete: ${royaltySources.length} sources, ${newDiscrepancies.length} new discrepancies`);
  return report;
}

export function getAuditReports(): AuditReport[] {
  return [...auditReports].sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
}

export function getAuditSummary() {
  const openDiscs = discrepancies.filter(d => d.status === 'open');
  const criticalDiscs = openDiscs.filter(d => d.severity === 'critical');
  const verifiedSources = royaltySources.filter(s => s.status === 'verified');
  const pendingSources = royaltySources.filter(s => s.status === 'pending');

  const platforms = [...new Set(royaltySources.map(s => s.platform))];
  const songs = [...new Set(royaltySources.map(s => s.songTitle))];

  const healthScore = Math.max(0, Math.min(100,
    100 - (openDiscs.length * 8) - (criticalDiscs.length * 15) - (pendingSources.length * 3)
  ));

  const healthGrade = healthScore >= 90 ? 'A' : healthScore >= 80 ? 'B' : healthScore >= 70 ? 'C' : healthScore >= 60 ? 'D' : 'F';

  return {
    totalSources: royaltySources.length,
    verifiedSources: verifiedSources.length,
    pendingSources: pendingSources.length,
    totalDiscrepancies: openDiscs.length,
    criticalDiscrepancies: criticalDiscs.length,
    platformCount: platforms.length,
    songCount: songs.length,
    totalAudits,
    lastAuditRun,
    healthScore,
    healthGrade,
    platformBreakdown: Object.fromEntries(
      platforms.map(p => [p, royaltySources.filter(s => s.platform === p).length])
    ),
  };
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

export function startAuditScheduler(intervalMs?: number): void {
  if (intervalMs !== undefined) {
    if (intervalMs < MIN_AUDIT_INTERVAL) {
      throw new Error(`Minimum audit interval is ${MIN_AUDIT_INTERVAL / 60000} minutes`);
    }
    schedulerIntervalMs = intervalMs;
  }

  if (schedulerInterval) clearInterval(schedulerInterval);

  schedulerEnabled = true;
  schedulerInterval = setInterval(() => {
    console.log('[QUMUS RoyaltyAudit] Scheduled audit running...');
    runAudit();
  }, schedulerIntervalMs);

  console.log(`[QUMUS RoyaltyAudit] Scheduler started (every ${schedulerIntervalMs / 3600000}h)`);
}

export function stopAuditScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  schedulerEnabled = false;
  console.log('[QUMUS RoyaltyAudit] Scheduler stopped');
}

export function updateAuditSchedulerInterval(intervalMs: number): void {
  if (intervalMs < MIN_AUDIT_INTERVAL) {
    throw new Error(`Minimum audit interval is ${MIN_AUDIT_INTERVAL / 60000} minutes`);
  }
  schedulerIntervalMs = intervalMs;
  if (schedulerEnabled) {
    startAuditScheduler(intervalMs);
  }
}

export function getAuditSchedulerStatus(): AuditSchedulerStatus {
  return {
    enabled: schedulerEnabled,
    intervalMs: schedulerIntervalMs,
    intervalHuman: `${(schedulerIntervalMs / 3600000).toFixed(1)} hours`,
    lastRun: lastAuditRun,
    nextRun: schedulerEnabled && lastAuditRun
      ? new Date(lastAuditRun.getTime() + schedulerIntervalMs)
      : null,
    totalAudits,
  };
}

// ─── Command Console Integration ─────────────────────────────────────────────

export function executeCommand(command: string): string {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const subCmd = parts[1] || '';

  switch (subCmd) {
    case 'status': {
      const summary = getAuditSummary();
      return [
        '📊 Royalty Audit Status',
        `Sources: ${summary.totalSources} (${summary.verifiedSources} verified, ${summary.pendingSources} pending)`,
        `Platforms: ${summary.platformCount} | Songs: ${summary.songCount}`,
        `Discrepancies: ${summary.totalDiscrepancies} open (${summary.criticalDiscrepancies} critical)`,
        `Health: ${summary.healthGrade} (${summary.healthScore}/100)`,
        `Audits Run: ${summary.totalAudits}`,
        summary.lastAuditRun ? `Last Audit: ${summary.lastAuditRun.toISOString()}` : 'Last Audit: Never',
      ].join('\n');
    }

    case 'run':
    case 'audit': {
      const report = runAudit();
      return [
        `✅ Royalty audit complete — ${report.period}`,
        `Sources: ${report.totalSources} | Discrepancies: ${report.totalDiscrepancies}`,
        `Expected: $${(report.totalExpected / 100).toFixed(2)} | Actual: $${(report.totalActual / 100).toFixed(2)}`,
        report.recommendations.length > 0 ? `Recommendations: ${report.recommendations[0]}` : '',
      ].filter(Boolean).join('\n');
    }

    case 'discrepancies': {
      const discs = getDiscrepancies({ status: 'open' });
      if (discs.length === 0) return '✅ No open discrepancies detected';
      return [
        `⚠️ ${discs.length} Open Discrepancies:`,
        ...discs.slice(0, 5).map(d =>
          `  • [${d.severity.toUpperCase()}] ${d.songTitle} on ${d.platform}: ${d.type.replace(/_/g, ' ')}`
        ),
        discs.length > 5 ? `  ... and ${discs.length - 5} more` : '',
      ].filter(Boolean).join('\n');
    }

    case 'platforms': {
      const summary = getAuditSummary();
      return [
        '🎵 Monitored Platforms:',
        ...Object.entries(summary.platformBreakdown).map(([p, count]) =>
          `  • ${p}: ${count} source(s)`
        ),
      ].join('\n');
    }

    case 'scheduler': {
      const status = getAuditSchedulerStatus();
      return [
        '⏱️ Royalty Audit Scheduler',
        `Status: ${status.enabled ? 'ACTIVE' : 'STOPPED'}`,
        `Interval: ${status.intervalHuman}`,
        `Total Audits: ${status.totalAudits}`,
        status.lastRun ? `Last Run: ${status.lastRun.toISOString()}` : 'Last Run: Never',
        status.nextRun ? `Next Run: ${status.nextRun.toISOString()}` : '',
      ].filter(Boolean).join('\n');
    }

    default:
      return [
        '📊 Royalty Audit Commands:',
        '  royalty status     — View audit summary',
        '  royalty run        — Run a full royalty audit',
        '  royalty discrepancies — View open discrepancies',
        '  royalty platforms  — List monitored platforms',
        '  royalty scheduler  — View scheduler status',
      ].join('\n');
  }
}
