/**
 * QUMUS Stream Health Monitor — Policy #19
 * Automated 15-minute health checks across all 51 RRB Radio channels.
 * Alerts via notifyOwner when streams go down. Tracks uptime history.
 */

import { notifyOwner } from '../_core/notification';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface StreamHealthResult {
  channelId: number;
  channelName: string;
  streamUrl: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  responseTimeMs: number;
  contentType: string;
  checkedAt: number;
  error?: string;
}

export interface HealthReport {
  timestamp: number;
  totalChannels: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  uptimePercent: number;
  results: StreamHealthResult[];
}

// In-memory health history (last 96 checks = 24 hours at 15-min intervals)
const healthHistory: HealthReport[] = [];
const MAX_HISTORY = 96;

let monitorInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let lastReport: HealthReport | null = null;

/**
 * Check a single stream URL for health
 */
async function checkStream(channelId: number, channelName: string, streamUrl: string): Promise<StreamHealthResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(streamUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Range': 'bytes=0-1024' },
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - start;
    const contentType = response.headers.get('content-type') || '';
    const isAudio = contentType.includes('audio') || contentType.includes('mpeg') || contentType.includes('ogg') || contentType.includes('aac');
    const isOk = response.ok || response.status === 206;

    if (isOk && isAudio) {
      return { channelId, channelName, streamUrl, status: 'healthy', responseTimeMs: elapsed, contentType, checkedAt: Date.now() };
    } else if (isOk) {
      return { channelId, channelName, streamUrl, status: 'degraded', responseTimeMs: elapsed, contentType, checkedAt: Date.now(), error: `Non-audio content: ${contentType}` };
    } else {
      return { channelId, channelName, streamUrl, status: 'down', responseTimeMs: elapsed, contentType, checkedAt: Date.now(), error: `HTTP ${response.status}` };
    }
  } catch (err: any) {
    return {
      channelId, channelName, streamUrl,
      status: err.name === 'AbortError' ? 'degraded' : 'down',
      responseTimeMs: Date.now() - start,
      contentType: '',
      checkedAt: Date.now(),
      error: err.message || 'Connection failed',
    };
  }
}

/**
 * Run a full health check across all 51 channels
 */
export async function runHealthCheck(): Promise<HealthReport> {
  console.log('[StreamHealth] Starting health check across all channels...');

  const db = getDb();
  const channels = await db.execute(
    sql`SELECT id, name, streamUrl FROM radio_channels WHERE status = 'active' ORDER BY id`
  );

  const results: StreamHealthResult[] = [];

  // Check in batches of 10 to avoid overwhelming
  const rows = channels.rows as any[];
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const batchResults = await Promise.all(
      batch.map((ch: any) => checkStream(ch.id, ch.name, ch.streamUrl || ''))
    );
    results.push(...batchResults);
  }

  const healthy = results.filter(r => r.status === 'healthy').length;
  const degraded = results.filter(r => r.status === 'degraded').length;
  const down = results.filter(r => r.status === 'down').length;
  const unknown = results.filter(r => r.status === 'unknown').length;

  const report: HealthReport = {
    timestamp: Date.now(),
    totalChannels: results.length,
    healthy,
    degraded,
    down,
    unknown,
    uptimePercent: results.length > 0 ? Math.round((healthy / results.length) * 100) : 0,
    results,
  };

  // Store in history
  healthHistory.push(report);
  if (healthHistory.length > MAX_HISTORY) healthHistory.shift();
  lastReport = report;

  console.log(`[StreamHealth] Check complete: ${healthy}/${results.length} healthy (${report.uptimePercent}% uptime)`);

  // Alert if any streams are down
  if (down > 0) {
    const downChannels = results.filter(r => r.status === 'down');
    const alertContent = downChannels
      .map(c => `• ch-${String(c.channelId).padStart(3, '0')}: ${c.channelName} — ${c.error}`)
      .join('\n');

    await notifyOwner({
      title: `⚠️ RRB Radio: ${down} Channel${down > 1 ? 's' : ''} Down`,
      content: `Stream health check detected ${down} down channel${down > 1 ? 's' : ''}:\n\n${alertContent}\n\nTotal: ${healthy}/${results.length} healthy (${report.uptimePercent}% uptime)\nTime: ${new Date().toISOString()}`,
    }).catch(err => console.error('[StreamHealth] Alert failed:', err));
  }

  return report;
}

/**
 * Start the automated 15-minute health monitor
 */
export function startStreamHealthMonitor(): void {
  if (isRunning) {
    console.log('[StreamHealth] Monitor already running');
    return;
  }

  isRunning = true;
  console.log('[StreamHealth] Starting automated 15-minute health monitor');

  // Run initial check after 30 seconds (let server warm up)
  setTimeout(() => {
    runHealthCheck().catch(err => console.error('[StreamHealth] Initial check failed:', err));
  }, 30_000);

  // Then every 15 minutes
  monitorInterval = setInterval(() => {
    runHealthCheck().catch(err => console.error('[StreamHealth] Scheduled check failed:', err));
  }, 15 * 60 * 1000);
}

/**
 * Stop the health monitor
 */
export function stopStreamHealthMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  isRunning = false;
  console.log('[StreamHealth] Monitor stopped');
}

/**
 * Get the latest health report
 */
export function getLatestReport(): HealthReport | null {
  return lastReport;
}

/**
 * Get health history (last 24 hours)
 */
export function getHealthHistory(): HealthReport[] {
  return healthHistory;
}

/**
 * Get monitor status
 */
export function getMonitorStatus() {
  return {
    isRunning,
    lastCheckAt: lastReport?.timestamp || null,
    totalChecks: healthHistory.length,
    currentUptime: lastReport?.uptimePercent || null,
    healthyChannels: lastReport?.healthy || 0,
    totalChannels: lastReport?.totalChannels || 0,
    downChannels: lastReport?.results.filter(r => r.status === 'down').map(r => ({
      id: r.channelId,
      name: r.channelName,
      error: r.error,
    })) || [],
  };
}
