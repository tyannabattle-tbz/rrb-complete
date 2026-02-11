/**
 * QUMUS Content Archival Policy — 11th Autonomous Decision Policy
 * Scans external links for availability, detects link rot, creates Wayback Machine snapshots,
 * and preserves critical evidence and documentation from external sources.
 * 90% autonomy — auto-archives healthy links, escalates dead links and critical failures
 */

import { QumusCompleteEngine } from '../qumus-complete-engine';

// ============ Types ============

export type LinkStatus = 'alive' | 'degraded' | 'dead' | 'unknown' | 'archived';
export type LinkCategory = 'evidence' | 'legal' | 'music_database' | 'streaming' | 'news' | 'reference' | 'social' | 'government';
export type ArchivalPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MonitoredLink {
  id: string;
  url: string;
  title: string;
  category: LinkCategory;
  priority: ArchivalPriority;
  status: LinkStatus;
  lastChecked: number;
  lastAlive: number | null;
  responseTime: number | null;
  httpStatus: number | null;
  waybackUrl: string | null;
  waybackLastSaved: number | null;
  failCount: number;
  checkCount: number;
  addedAt: number;
  notes: string;
}

export interface ArchivalScanResult {
  scanId: string;
  startedAt: number;
  completedAt: number;
  totalLinks: number;
  alive: number;
  degraded: number;
  dead: number;
  unknown: number;
  newArchives: number;
  linkRotDetected: string[];
  recommendations: string[];
}

export interface ArchivalAlert {
  id: string;
  linkId: string;
  url: string;
  type: 'link_rot' | 'degraded' | 'archive_needed' | 'archive_failed' | 'critical_down';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface ArchivalSummary {
  totalLinks: number;
  aliveLinks: number;
  degradedLinks: number;
  deadLinks: number;
  unknownLinks: number;
  archivedLinks: number;
  totalScans: number;
  totalAlerts: number;
  activeAlerts: number;
  linkRotRate: number; // percentage
  averageResponseTime: number;
  lastScanAt: number | null;
  healthScore: number; // 0-100
  healthGrade: string;
  categoryBreakdown: Record<LinkCategory, number>;
}

export interface ArchivalSchedulerStatus {
  enabled: boolean;
  intervalMs: number;
  intervalHuman: string;
  lastCheck: number | null;
  totalChecks: number;
  nextCheckEstimate: number;
}

// ============ In-Memory Store ============

const monitoredLinks: MonitoredLink[] = [];
const scanResults: ArchivalScanResult[] = [];
const archivalAlerts: ArchivalAlert[] = [];
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let schedulerEnabled = false;
let schedulerIntervalMs = 6 * 60 * 60 * 1000; // 6 hours default
let totalScheduledChecks = 0;
let lastScheduledCheck: number | null = null;

// ============ Helper Functions ============

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function formatInterval(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function calculateGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ============ Default Monitored Links ============

const DEFAULT_LINKS: Omit<MonitoredLink, 'id' | 'status' | 'lastChecked' | 'lastAlive' | 'responseTime' | 'httpStatus' | 'waybackUrl' | 'waybackLastSaved' | 'failCount' | 'checkCount' | 'addedAt'>[] = [
  // BMI Evidence (Critical)
  { url: 'https://repertoire.bmi.com/Search/Search', title: 'BMI Songview — Writer Search', category: 'evidence', priority: 'critical', notes: 'Primary evidence: Seabrun Whitney Hunter Jr. writer profile' },
  // Discogs Evidence
  { url: 'https://www.discogs.com/release/3292533-Canned-Heat-Lets-Work-Together', title: 'Discogs — Canned Heat "Let\'s Work Together"', category: 'evidence', priority: 'critical', notes: 'Payten Music publisher credit on physical CD' },
  { url: 'https://www.discogs.com', title: 'Discogs Music Database', category: 'music_database', priority: 'high', notes: 'World\'s largest physical music database' },
  // MusicBrainz
  { url: 'https://musicbrainz.org', title: 'MusicBrainz Open Music Encyclopedia', category: 'music_database', priority: 'high', notes: 'Open-source music metadata database' },
  // Copyright Office
  { url: 'https://www.copyright.gov', title: 'U.S. Copyright Office', category: 'legal', priority: 'critical', notes: 'Federal copyright registration records' },
  { url: 'https://cocatalog.loc.gov', title: 'Copyright Catalog (Library of Congress)', category: 'legal', priority: 'critical', notes: 'Public copyright search system' },
  // SoundExchange
  { url: 'https://www.soundexchange.com', title: 'SoundExchange', category: 'legal', priority: 'high', notes: 'Digital performance royalty collection' },
  // Streaming Platforms
  { url: 'https://open.spotify.com', title: 'Spotify', category: 'streaming', priority: 'medium', notes: 'Streaming platform presence' },
  { url: 'https://music.apple.com', title: 'Apple Music', category: 'streaming', priority: 'medium', notes: 'Streaming platform presence' },
  // Government / Legal
  { url: 'https://www.senate.mo.gov', title: 'Missouri Senate', category: 'government', priority: 'high', notes: 'Senate Resolution No. 1462 (Grandma Helen)' },
  // Wayback Machine
  { url: 'https://web.archive.org', title: 'Internet Archive / Wayback Machine', category: 'reference', priority: 'high', notes: 'Primary archival service for web content' },
  // BMI Main
  { url: 'https://www.bmi.com', title: 'BMI (Broadcast Music, Inc.)', category: 'legal', priority: 'high', notes: 'Performing rights organization' },
  // MLC
  { url: 'https://www.themlc.com', title: 'The Mechanical Licensing Collective', category: 'legal', priority: 'high', notes: 'Mechanical licensing rights' },
];

// ============ Initialization ============

function initializeDefaultLinks(): void {
  if (monitoredLinks.length > 0) return;
  
  DEFAULT_LINKS.forEach(link => {
    monitoredLinks.push({
      ...link,
      id: generateId('link'),
      status: 'unknown',
      lastChecked: 0,
      lastAlive: null,
      responseTime: null,
      httpStatus: null,
      waybackUrl: null,
      waybackLastSaved: null,
      failCount: 0,
      checkCount: 0,
      addedAt: Date.now(),
    });
  });
  
  console.log(`[QUMUS ContentArchival] Initialized ${monitoredLinks.length} default monitored links`);
}

// Initialize on module load
initializeDefaultLinks();

// ============ Link Checking ============

async function checkLink(link: MonitoredLink): Promise<void> {
  link.checkCount++;
  link.lastChecked = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const startTime = Date.now();
    const response = await fetch(link.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'QUMUS-ContentArchival/1.0 (RRB Legacy Preservation)',
      },
    });
    clearTimeout(timeout);
    
    const responseTime = Date.now() - startTime;
    link.responseTime = responseTime;
    link.httpStatus = response.status;
    
    if (response.ok || response.status === 301 || response.status === 302) {
      link.status = responseTime > 5000 ? 'degraded' : 'alive';
      link.lastAlive = Date.now();
      link.failCount = 0;
    } else if (response.status === 403 || response.status === 429) {
      // Rate limited or forbidden — not necessarily dead
      link.status = 'degraded';
      link.lastAlive = link.lastAlive || Date.now();
    } else if (response.status === 404 || response.status === 410) {
      link.status = 'dead';
      link.failCount++;
    } else {
      link.status = 'degraded';
      link.failCount++;
    }
  } catch (error) {
    // Network errors, timeouts, etc.
    link.status = link.failCount >= 3 ? 'dead' : 'degraded';
    link.failCount++;
    link.responseTime = null;
    link.httpStatus = null;
  }
}

async function checkWaybackAvailability(url: string): Promise<{ available: boolean; waybackUrl: string | null; timestamp: number | null }> {
  try {
    const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!response.ok) return { available: false, waybackUrl: null, timestamp: null };
    
    const data = await response.json() as any;
    if (data?.archived_snapshots?.closest?.available) {
      return {
        available: true,
        waybackUrl: data.archived_snapshots.closest.url,
        timestamp: data.archived_snapshots.closest.timestamp ? parseInt(data.archived_snapshots.closest.timestamp) : null,
      };
    }
    return { available: false, waybackUrl: null, timestamp: null };
  } catch {
    return { available: false, waybackUrl: null, timestamp: null };
  }
}

async function requestWaybackSave(url: string): Promise<boolean> {
  try {
    const saveUrl = `https://web.archive.org/save/${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(saveUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'QUMUS-ContentArchival/1.0 (RRB Legacy Preservation)',
      },
    });
    clearTimeout(timeout);
    
    return response.ok || response.status === 302;
  } catch {
    return false;
  }
}

// ============ Scan Functions ============

export async function runArchivalScan(): Promise<ArchivalScanResult> {
  const scanId = generateId('scan');
  const startedAt = Date.now();
  const linkRotDetected: string[] = [];
  const recommendations: string[] = [];
  let newArchives = 0;
  
  console.log(`[QUMUS ContentArchival] Starting scan of ${monitoredLinks.length} links...`);
  
  // Check all links
  for (const link of monitoredLinks) {
    await checkLink(link);
    
    // Check Wayback Machine availability for critical/high priority links
    if (link.priority === 'critical' || link.priority === 'high') {
      const wayback = await checkWaybackAvailability(link.url);
      if (wayback.available) {
        link.waybackUrl = wayback.waybackUrl;
        link.waybackLastSaved = wayback.timestamp;
      }
    }
    
    // Detect link rot
    if (link.status === 'dead') {
      linkRotDetected.push(link.url);
      
      // Create alert
      const existingAlert = archivalAlerts.find(a => a.linkId === link.id && !a.resolvedAt && a.type === 'link_rot');
      if (!existingAlert) {
        archivalAlerts.push({
          id: generateId('alert'),
          linkId: link.id,
          url: link.url,
          type: 'link_rot',
          severity: link.priority === 'critical' ? 'critical' : 'warning',
          message: `Link rot detected: ${link.title} (${link.url}) — ${link.failCount} consecutive failures`,
          triggeredAt: Date.now(),
          acknowledged: false,
        });
      }
      
      // Try to archive dead critical links
      if (link.priority === 'critical' && !link.waybackUrl) {
        recommendations.push(`CRITICAL: ${link.title} is down with no Wayback archive — manual preservation needed`);
      }
    }
    
    // Auto-archive alive critical links that haven't been archived recently
    if (link.status === 'alive' && link.priority === 'critical') {
      const daysSinceArchive = link.waybackLastSaved
        ? (Date.now() - link.waybackLastSaved) / (1000 * 60 * 60 * 24)
        : Infinity;
      
      if (daysSinceArchive > 30) {
        const saved = await requestWaybackSave(link.url);
        if (saved) {
          newArchives++;
          link.waybackLastSaved = Date.now();
          console.log(`[QUMUS ContentArchival] Archived: ${link.url}`);
        }
      }
    }
    
    // Degraded link alerts
    if (link.status === 'degraded') {
      const existingAlert = archivalAlerts.find(a => a.linkId === link.id && !a.resolvedAt && a.type === 'degraded');
      if (!existingAlert) {
        archivalAlerts.push({
          id: generateId('alert'),
          linkId: link.id,
          url: link.url,
          type: 'degraded',
          severity: 'info',
          message: `Degraded response: ${link.title} — ${link.responseTime ? `${link.responseTime}ms` : 'timeout/error'}`,
          triggeredAt: Date.now(),
          acknowledged: false,
        });
      }
    }
    
    // Resolve alerts for links that are now alive
    if (link.status === 'alive') {
      archivalAlerts
        .filter(a => a.linkId === link.id && !a.resolvedAt)
        .forEach(a => { a.resolvedAt = Date.now(); });
    }
  }
  
  // Generate recommendations
  const aliveCount = monitoredLinks.filter(l => l.status === 'alive').length;
  const degradedCount = monitoredLinks.filter(l => l.status === 'degraded').length;
  const deadCount = monitoredLinks.filter(l => l.status === 'dead').length;
  
  if (deadCount > 0) {
    recommendations.push(`${deadCount} link(s) detected as dead — review and update or remove`);
  }
  if (degradedCount > 3) {
    recommendations.push(`${degradedCount} links showing degraded response — possible network issues`);
  }
  if (aliveCount === monitoredLinks.length) {
    recommendations.push('All monitored links are healthy — ecosystem preservation intact');
  }
  
  const criticalDead = monitoredLinks.filter(l => l.status === 'dead' && l.priority === 'critical');
  if (criticalDead.length > 0) {
    recommendations.push(`URGENT: ${criticalDead.length} critical evidence link(s) are down — immediate attention required`);
  }
  
  const completedAt = Date.now();
  const result: ArchivalScanResult = {
    scanId,
    startedAt,
    completedAt,
    totalLinks: monitoredLinks.length,
    alive: aliveCount,
    degraded: degradedCount,
    dead: deadCount,
    unknown: monitoredLinks.filter(l => l.status === 'unknown').length,
    newArchives,
    linkRotDetected,
    recommendations,
  };
  
  scanResults.push(result);
  
  // Log to QUMUS decision system
  try {
    const engine = QumusCompleteEngine.getInstance();
    await engine.processDecision({
      policyId: 'policy_content_archival',
      input: {
        type: 'archival_scan',
        totalLinks: result.totalLinks,
        alive: result.alive,
        dead: result.dead,
        degraded: result.degraded,
        linkRotCount: linkRotDetected.length,
        newArchives,
      },
      confidence: aliveCount / Math.max(monitoredLinks.length, 1),
    });
  } catch (e) {
    console.log('[QUMUS ContentArchival] Decision logging skipped:', (e as Error).message);
  }
  
  // Notify on critical issues
  if (criticalDead.length > 0) {
    try {
      const { queueNotification } = await import('./qumus-notifications');
      queueNotification({
        type: 'emergency',
        priority: 'critical',
        title: `Content Archival Alert: ${criticalDead.length} critical link(s) down`,
        message: criticalDead.map(l => `${l.title}: ${l.url}`).join('; '),
      });
    } catch (e) {
      console.log('[QUMUS ContentArchival] Notification skipped');
    }
  }
  
  console.log(`[QUMUS ContentArchival] Scan complete — ${aliveCount} alive, ${degradedCount} degraded, ${deadCount} dead, ${newArchives} new archives`);
  return result;
}

// ============ Link Management ============

export function addLink(data: {
  url: string;
  title: string;
  category: LinkCategory;
  priority: ArchivalPriority;
  notes?: string;
}): MonitoredLink {
  const existing = monitoredLinks.find(l => l.url === data.url);
  if (existing) throw new Error(`Link already monitored: ${data.url}`);
  
  const link: MonitoredLink = {
    id: generateId('link'),
    url: data.url,
    title: data.title,
    category: data.category,
    priority: data.priority,
    status: 'unknown',
    lastChecked: 0,
    lastAlive: null,
    responseTime: null,
    httpStatus: null,
    waybackUrl: null,
    waybackLastSaved: null,
    failCount: 0,
    checkCount: 0,
    addedAt: Date.now(),
    notes: data.notes || '',
  };
  
  monitoredLinks.push(link);
  return link;
}

export function removeLink(linkId: string): void {
  const idx = monitoredLinks.findIndex(l => l.id === linkId);
  if (idx === -1) throw new Error(`Link not found: ${linkId}`);
  monitoredLinks.splice(idx, 1);
}

export function getLinks(filter?: { category?: LinkCategory; status?: LinkStatus; priority?: ArchivalPriority }): MonitoredLink[] {
  let result = [...monitoredLinks];
  if (filter?.category) result = result.filter(l => l.category === filter.category);
  if (filter?.status) result = result.filter(l => l.status === filter.status);
  if (filter?.priority) result = result.filter(l => l.priority === filter.priority);
  return result.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getLinkById(linkId: string): MonitoredLink {
  const link = monitoredLinks.find(l => l.id === linkId);
  if (!link) throw new Error(`Link not found: ${linkId}`);
  return link;
}

// ============ Alert Management ============

export function getArchivalAlerts(filter?: { type?: string; severity?: string; acknowledged?: boolean }): ArchivalAlert[] {
  let result = [...archivalAlerts];
  if (filter?.type) result = result.filter(a => a.type === filter.type);
  if (filter?.severity) result = result.filter(a => a.severity === filter.severity);
  if (filter?.acknowledged !== undefined) result = result.filter(a => a.acknowledged === filter.acknowledged);
  return result.sort((a, b) => b.triggeredAt - a.triggeredAt);
}

export function acknowledgeArchivalAlert(alertId: string): ArchivalAlert {
  const alert = archivalAlerts.find(a => a.id === alertId);
  if (!alert) throw new Error(`Alert not found: ${alertId}`);
  alert.acknowledged = true;
  return alert;
}

export function resolveArchivalAlert(alertId: string): ArchivalAlert {
  const alert = archivalAlerts.find(a => a.id === alertId);
  if (!alert) throw new Error(`Alert not found: ${alertId}`);
  alert.acknowledged = true;
  alert.resolvedAt = Date.now();
  return alert;
}

// ============ Wayback Machine Operations ============

export async function archiveLink(linkId: string): Promise<{ success: boolean; waybackUrl: string | null }> {
  const link = monitoredLinks.find(l => l.id === linkId);
  if (!link) throw new Error(`Link not found: ${linkId}`);
  
  const saved = await requestWaybackSave(link.url);
  if (saved) {
    link.waybackLastSaved = Date.now();
    // Check for the new URL
    const wayback = await checkWaybackAvailability(link.url);
    if (wayback.available) {
      link.waybackUrl = wayback.waybackUrl;
    }
    return { success: true, waybackUrl: link.waybackUrl };
  }
  return { success: false, waybackUrl: null };
}

export async function checkAllWayback(): Promise<{ checked: number; available: number; missing: number }> {
  let available = 0;
  let missing = 0;
  
  for (const link of monitoredLinks) {
    const wayback = await checkWaybackAvailability(link.url);
    if (wayback.available) {
      link.waybackUrl = wayback.waybackUrl;
      link.waybackLastSaved = wayback.timestamp;
      available++;
    } else {
      missing++;
    }
  }
  
  return { checked: monitoredLinks.length, available, missing };
}

// ============ Summary & History ============

export function getScanHistory(): ArchivalScanResult[] {
  return [...scanResults].sort((a, b) => b.completedAt - a.completedAt);
}

export function getArchivalSummary(): ArchivalSummary {
  const aliveLinks = monitoredLinks.filter(l => l.status === 'alive').length;
  const degradedLinks = monitoredLinks.filter(l => l.status === 'degraded').length;
  const deadLinks = monitoredLinks.filter(l => l.status === 'dead').length;
  const unknownLinks = monitoredLinks.filter(l => l.status === 'unknown').length;
  const archivedLinks = monitoredLinks.filter(l => l.waybackUrl !== null).length;
  
  const activeAlerts = archivalAlerts.filter(a => !a.resolvedAt && !a.acknowledged).length;
  
  const responseTimes = monitoredLinks
    .filter(l => l.responseTime !== null)
    .map(l => l.responseTime!);
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;
  
  const total = monitoredLinks.length || 1;
  const linkRotRate = Math.round((deadLinks / total) * 100 * 10) / 10;
  const healthScore = Math.round(((aliveLinks + degradedLinks * 0.5) / total) * 100);
  
  const categoryBreakdown: Record<LinkCategory, number> = {
    evidence: 0, legal: 0, music_database: 0, streaming: 0, news: 0, reference: 0, social: 0, government: 0,
  };
  monitoredLinks.forEach(l => { categoryBreakdown[l.category]++; });
  
  return {
    totalLinks: monitoredLinks.length,
    aliveLinks,
    degradedLinks,
    deadLinks,
    unknownLinks,
    archivedLinks,
    totalScans: scanResults.length,
    totalAlerts: archivalAlerts.length,
    activeAlerts,
    linkRotRate,
    averageResponseTime: avgResponseTime,
    lastScanAt: scanResults.length > 0 ? scanResults[scanResults.length - 1].completedAt : null,
    healthScore,
    healthGrade: calculateGrade(healthScore),
    categoryBreakdown,
  };
}

// ============ Scheduler ============

export function startArchivalScheduler(intervalMs?: number): ArchivalSchedulerStatus {
  if (intervalMs !== undefined && intervalMs < 300000) {
    throw new Error('Minimum archival scan interval is 5 minutes (300000ms)');
  }
  if (intervalMs) schedulerIntervalMs = intervalMs;
  
  stopArchivalScheduler();
  schedulerEnabled = true;
  
  schedulerTimer = setInterval(async () => {
    try {
      await runArchivalScan();
      totalScheduledChecks++;
      lastScheduledCheck = Date.now();
    } catch (e) {
      console.error('[QUMUS ContentArchival] Scheduled scan failed:', e);
    }
  }, schedulerIntervalMs);
  
  console.log(`[QUMUS ContentArchival] Scheduler started — interval: ${formatInterval(schedulerIntervalMs)}`);
  return getSchedulerStatus();
}

export function stopArchivalScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  schedulerEnabled = false;
  console.log('[QUMUS ContentArchival] Scheduler stopped');
}

export function getSchedulerStatus(): ArchivalSchedulerStatus {
  return {
    enabled: schedulerEnabled,
    intervalMs: schedulerIntervalMs,
    intervalHuman: formatInterval(schedulerIntervalMs),
    lastCheck: lastScheduledCheck,
    totalChecks: totalScheduledChecks,
    nextCheckEstimate: schedulerEnabled ? Date.now() + schedulerIntervalMs : 0,
  };
}

export function updateSchedulerInterval(intervalMs: number): ArchivalSchedulerStatus {
  if (intervalMs < 300000) {
    throw new Error('Minimum archival scan interval is 5 minutes (300000ms)');
  }
  schedulerIntervalMs = intervalMs;
  if (schedulerEnabled) {
    return startArchivalScheduler(intervalMs);
  }
  return getSchedulerStatus();
}

// ============ QUMUS Event Processing ============

export async function processArchivalEvent(
  type: 'link_down' | 'link_recovered' | 'archive_success' | 'archive_failed' | 'critical_evidence_at_risk',
  data: { url?: string; title?: string; details?: string; confidence: number }
): Promise<{ decisionId: string; action: string; confidence: number }> {
  const engine = QumusCompleteEngine.getInstance();
  
  const result = await engine.processDecision({
    policyId: 'policy_content_archival',
    input: { type, ...data },
    confidence: data.confidence,
  });
  
  return {
    decisionId: result.decisionId,
    action: result.result,
    confidence: result.confidence,
  };
}

// ============ Command Console Integration ============

export function executeCommand(command: string): string {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const subCommand = parts[1] || '';
  
  switch (subCommand) {
    case 'scan':
      runArchivalScan().catch(e => console.error('[ContentArchival] Scan failed:', e));
      return '🔍 Content archival scan initiated. Results will appear in the dashboard.';
    
    case 'status': {
      const summary = getArchivalSummary();
      return `📦 Content Archival Status:\n` +
        `  Links: ${summary.totalLinks} total (${summary.aliveLinks} alive, ${summary.degradedLinks} degraded, ${summary.deadLinks} dead)\n` +
        `  Archived: ${summary.archivedLinks} links have Wayback snapshots\n` +
        `  Health: ${summary.healthScore}/100 (${summary.healthGrade})\n` +
        `  Link Rot Rate: ${summary.linkRotRate}%\n` +
        `  Scans: ${summary.totalScans} total, ${summary.activeAlerts} active alerts`;
    }
    
    case 'wayback':
      checkAllWayback().catch(e => console.error('[ContentArchival] Wayback check failed:', e));
      return '🏛️ Checking Wayback Machine availability for all monitored links...';
    
    case 'linkrot': {
      const deadLinks = monitoredLinks.filter(l => l.status === 'dead');
      if (deadLinks.length === 0) return '✅ No link rot detected — all monitored links are responsive.';
      return `⚠️ Link Rot Detected (${deadLinks.length} links):\n` +
        deadLinks.map(l => `  ❌ ${l.title}: ${l.url} (${l.failCount} failures)`).join('\n');
    }
    
    case 'scheduler': {
      const status = getSchedulerStatus();
      return `⏰ Archival Scheduler: ${status.enabled ? 'ACTIVE' : 'STOPPED'}\n` +
        `  Interval: ${status.intervalHuman}\n` +
        `  Total Checks: ${status.totalChecks}\n` +
        `  Last Check: ${status.lastCheck ? new Date(status.lastCheck).toISOString() : 'Never'}`;
    }
    
    default:
      return '📦 Content Archival Commands:\n' +
        '  archive scan — Run full archival scan\n' +
        '  archive status — View archival summary\n' +
        '  archive wayback — Check Wayback Machine availability\n' +
        '  archive linkrot — List dead links\n' +
        '  archive scheduler — View scheduler status';
  }
}
