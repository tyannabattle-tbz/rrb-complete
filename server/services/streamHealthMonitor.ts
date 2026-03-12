/**
 * QUMUS Stream Health Monitor — Policy #19
 * Automated 15-minute health checks across all 54 RRB Radio channels.
 * Auto-heals down streams by swapping to verified backup streams.
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
 * Run a full health check across all 54 channels
 */
export async function runHealthCheck(): Promise<HealthReport> {
  console.log('[StreamHealth] Starting health check across all channels...');

  const db = await getDb();
  if (!db) {
    console.warn('[StreamHealth] Database not available');
    return { timestamp: Date.now(), totalChannels: 0, healthy: 0, degraded: 0, down: 0, unknown: 0, uptimePercent: 0, results: [] };
  }
  const channels = await db.execute(
    sql`SELECT id, name, streamUrl FROM radio_channels WHERE status = 'active' ORDER BY id`
  );

  const results: StreamHealthResult[] = [];

  // Check in batches of 10 to avoid overwhelming
  // drizzle mysql2 execute returns [[rows], fields] — extract the actual row array
  let rows: any[] = [];
  if (Array.isArray(channels)) {
    if (channels.length > 0 && Array.isArray(channels[0])) {
      rows = channels[0]; // [[rows], fields] format
    } else if (channels.length > 0 && typeof channels[0] === 'object' && 'id' in channels[0]) {
      rows = channels; // flat array of rows
    }
  }
  console.log(`[StreamHealth] Found ${rows.length} active channels to check`);
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
  // Log any non-healthy channels
  results.filter(r => r.status !== 'healthy').forEach(r => {
    console.log(`[StreamHealth] ${r.status.toUpperCase()}: ch-${r.channelId} ${r.channelName} — ${r.error || 'slow response'} (${r.responseTimeMs}ms)`);
  });

  // QUMUS Auto-Healing: swap down streams to verified backups
  if (down > 0) {
    const downChannels = results.filter(r => r.status === 'down');
    const backupStreams = [
      'https://funkyradio.streamingmedia.it/play.mp3',
      'https://listen.181fm.com/181-soul_128k.mp3',
      'https://npr-ice.streamguys1.com/live.mp3',
      'https://fm939.wnyc.org/wnycfm',
      'https://tunein.cdnstream1.com/2868_96.mp3',
      'https://stream.0nlineradio.com/soul',
      'https://stream.zeno.fm/yn65fsaurfhvv',
    ];

    const healed: string[] = [];
    const stillDown: string[] = [];

    for (const ch of downChannels) {
      let fixed = false;
      for (const backup of backupStreams) {
        if (backup === ch.streamUrl) continue;
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          const resp = await fetch(backup, { method: 'GET', signal: ctrl.signal, headers: { 'Range': 'bytes=0-512' } });
          clearTimeout(t);
          if (resp.ok || resp.status === 206) {
            try {
              await db.execute(
                sql`UPDATE radioChannels SET streamUrl = ${backup} WHERE id = ${ch.channelId}`
              );
              healed.push(`ch-${String(ch.channelId).padStart(3, '0')}: ${ch.channelName} → ${backup}`);
              console.log(`[StreamHealth] AUTO-HEALED: ${ch.channelName} swapped to ${backup}`);
              fixed = true;
            } catch (dbErr) {
              console.error(`[StreamHealth] DB update failed for ${ch.channelName}:`, dbErr);
            }
            break;
          }
        } catch { /* backup also down, try next */ }
      }
      if (!fixed) {
        stillDown.push(`• ch-${String(ch.channelId).padStart(3, '0')}: ${ch.channelName} — ${ch.error}`);
      }
    }

    let alertContent = '';
    if (healed.length > 0) {
      alertContent += `✅ AUTO-HEALED (${healed.length}):\n${healed.map(h => `• ${h}`).join('\n')}\n\n`;
    }
    if (stillDown.length > 0) {
      alertContent += `❌ STILL DOWN (${stillDown.length}):\n${stillDown.join('\n')}\n\n`;
    }
    alertContent += `Total: ${healthy + healed.length}/${results.length} healthy\nTime: ${new Date().toISOString()}`;

    await notifyOwner({
      title: `⚠️ RRB Radio: ${down} Channel${down > 1 ? 's' : ''} Down${healed.length > 0 ? ` — ${healed.length} Auto-Healed` : ''}`,
      content: alertContent,
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
