/**
 * QUMUS Stream Health Monitor — Policy #19
 * Automated 15-minute health checks across all 54 RRB Radio channels.
 * Auto-heals down streams by swapping to genre-matched backup streams.
 * Batched digest notifications (max 1 per check cycle) instead of per-channel alerts.
 * Tracks uptime history for dashboard visualization.
 */

import { notifyOwner } from '../_core/notification';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface StreamHealthResult {
  channelId: number;
  channelName: string;
  streamUrl: string;
  genre?: string;
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
  healedCount: number;
  stillDownCount: number;
}

// ─── Genre-Specific Backup Streams ────────────────────────────────────────────
// Each genre maps to a prioritized list of backup streams that match the content
const GENRE_BACKUP_STREAMS: Record<string, string[]> = {
  // R&B / Soul / Hip-Hop
  'R&B': [
    'https://listen.181fm.com/181-rnb_128k.mp3',
    'https://stream.zeno.fm/yn65fsaurfhvv',
    'https://stream.0nlineradio.com/soul',
  ],
  'Hip-Hop': [
    'https://listen.181fm.com/181-hiphoptop40_128k.mp3',
    'https://stream.zeno.fm/yn65fsaurfhvv',
    'https://stream.0nlineradio.com/hiphop',
  ],
  'Neo-Soul': [
    'https://listen.181fm.com/181-soul_128k.mp3',
    'https://stream.0nlineradio.com/soul',
    'https://stream.zeno.fm/yn65fsaurfhvv',
  ],
  'Soul': [
    'https://listen.181fm.com/181-soul_128k.mp3',
    'https://stream.0nlineradio.com/soul',
  ],
  // Jazz / Blues
  'Jazz': [
    'https://listen.181fm.com/181-bebop_128k.mp3',
    'https://stream.0nlineradio.com/jazz',
  ],
  'Blues': [
    'https://listen.181fm.com/181-blues_128k.mp3',
    'https://stream.0nlineradio.com/blues',
  ],
  // Reggae / Caribbean / Latin
  'Reggae': [
    'https://listen.181fm.com/181-reggae_128k.mp3',
    'https://stream.0nlineradio.com/reggae',
  ],
  'Caribbean': [
    'https://listen.181fm.com/181-reggae_128k.mp3',
    'https://stream.0nlineradio.com/reggae',
  ],
  'Latin': [
    'https://listen.181fm.com/181-latin_128k.mp3',
    'https://stream.0nlineradio.com/salsa',
  ],
  // Rock / Indie / Alternative
  'Rock': [
    'https://listen.181fm.com/181-rock40_128k.mp3',
    'https://stream.0nlineradio.com/rock',
  ],
  'Indie': [
    'https://listen.181fm.com/181-indie_128k.mp3',
    'https://stream.0nlineradio.com/indie',
  ],
  // Electronic / Dance
  'Electronic': [
    'https://listen.181fm.com/181-energy98_128k.mp3',
    'https://stream.0nlineradio.com/electronic',
  ],
  'Dance': [
    'https://listen.181fm.com/181-energy98_128k.mp3',
    'https://stream.0nlineradio.com/dance',
  ],
  // Country
  'Country': [
    'https://listen.181fm.com/181-kickincountry_128k.mp3',
    'https://stream.0nlineradio.com/country',
  ],
  // Classical / Relaxation
  'Classical': [
    'https://listen.181fm.com/181-classical_128k.mp3',
    'https://stream.0nlineradio.com/classical',
  ],
  'Relaxation': [
    'https://listen.181fm.com/181-chillout_128k.mp3',
    'https://stream.0nlineradio.com/chillout',
  ],
  'Sleep': [
    'https://listen.181fm.com/181-chillout_128k.mp3',
    'https://stream.0nlineradio.com/chillout',
  ],
  // Gospel / Worship
  'Gospel': [
    'https://listen.181fm.com/181-gospel_128k.mp3',
    'https://stream.0nlineradio.com/gospel',
  ],
  'Worship': [
    'https://listen.181fm.com/181-gospel_128k.mp3',
    'https://stream.0nlineradio.com/gospel',
  ],
  // Afrobeats / World
  'Afrobeats': [
    'https://stream.zeno.fm/yn65fsaurfhvv',
    'https://stream.0nlineradio.com/afrobeats',
  ],
  'World': [
    'https://stream.zeno.fm/yn65fsaurfhvv',
    'https://stream.0nlineradio.com/world',
  ],
  // Pop / Top 40
  'Pop': [
    'https://listen.181fm.com/181-star_128k.mp3',
    'https://stream.0nlineradio.com/pop',
  ],
  // Anime / Gaming
  'Anime': [
    'https://listen.181fm.com/181-anime_128k.mp3',
    'https://stream.0nlineradio.com/jpop',
  ],
  'Gaming': [
    'https://listen.181fm.com/181-energy98_128k.mp3',
    'https://stream.0nlineradio.com/electronic',
  ],
  // Love / Throwback
  'Love': [
    'https://listen.181fm.com/181-lovesongsplus_128k.mp3',
    'https://listen.181fm.com/181-soul_128k.mp3',
  ],
  'Throwback': [
    'https://listen.181fm.com/181-oldschool_128k.mp3',
    'https://listen.181fm.com/181-soul_128k.mp3',
  ],
  // Workout / Energy
  'Workout': [
    'https://listen.181fm.com/181-energy98_128k.mp3',
    'https://listen.181fm.com/181-hiphoptop40_128k.mp3',
  ],
  // Women in Music
  'Women': [
    'https://listen.181fm.com/181-star_128k.mp3',
    'https://listen.181fm.com/181-rnb_128k.mp3',
  ],
};

// Universal fallback streams (used when no genre match found)
const UNIVERSAL_FALLBACKS = [
  'https://funkyradio.streamingmedia.it/play.mp3',
  'https://listen.181fm.com/181-soul_128k.mp3',
  'https://npr-ice.streamguys1.com/live.mp3',
  'https://fm939.wnyc.org/wnycfm',
  'https://tunein.cdnstream1.com/2868_96.mp3',
  'https://stream.0nlineradio.com/soul',
  'https://stream.zeno.fm/yn65fsaurfhvv',
];

// ─── Notification Throttling ──────────────────────────────────────────────────
// Track last notification time to prevent spam
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN_MS = 14 * 60 * 1000; // 14 minutes (just under 15-min cycle)
let pendingDigestItems: string[] = [];

// ─── Circuit Breaker ─────────────────────────────────────────────────────────
// If >50% of channels are down simultaneously, it's likely a network/provider issue
// not individual channel failures. Skip auto-healing to prevent mass URL overwrites.
const CIRCUIT_BREAKER_THRESHOLD = 0.5; // 50% of channels
let circuitBreakerTripped = false;
let lastCircuitBreakerTrip = 0;

// ─── Root Cause Tracking ─────────────────────────────────────────────────────
interface OutageEvent {
  timestamp: number;
  channelsAffected: number;
  totalChannels: number;
  rootCause: 'provider_outage' | 'network_issue' | 'individual_failure' | 'unknown';
  details: string;
  resolved: boolean;
}
const outageHistory: OutageEvent[] = [];
const MAX_OUTAGE_HISTORY = 50;

// In-memory health history (last 96 checks = 24 hours at 15-min intervals)
const healthHistory: HealthReport[] = [];
const MAX_HISTORY = 96;

let monitorInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let lastReport: HealthReport | null = null;

/**
 * Find the best genre match for a channel name/genre
 */
function findGenreBackups(channelName: string, genre?: string): string[] {
  // Try exact genre match first
  if (genre) {
    for (const [key, urls] of Object.entries(GENRE_BACKUP_STREAMS)) {
      if (genre.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(genre.toLowerCase())) {
        return urls;
      }
    }
  }

  // Try matching from channel name
  const name = channelName.toLowerCase();
  for (const [key, urls] of Object.entries(GENRE_BACKUP_STREAMS)) {
    if (name.includes(key.toLowerCase())) {
      return urls;
    }
  }

  // Special channel name matches
  if (name.includes('hip-hop') || name.includes('hip hop')) return GENRE_BACKUP_STREAMS['Hip-Hop'] || [];
  if (name.includes('r&b') || name.includes('rnb')) return GENRE_BACKUP_STREAMS['R&B'] || [];
  if (name.includes('neo-soul') || name.includes('neo soul')) return GENRE_BACKUP_STREAMS['Neo-Soul'] || [];
  if (name.includes('valanna') || name.includes('candy') || name.includes('seraph') || name.includes('ai radio')) return GENRE_BACKUP_STREAMS['R&B'] || [];
  if (name.includes('battle') || name.includes('ty')) return GENRE_BACKUP_STREAMS['Hip-Hop'] || [];
  if (name.includes('sweet miracles') || name.includes('canryn') || name.includes('squadd')) return GENRE_BACKUP_STREAMS['R&B'] || [];
  if (name.includes('dragon') || name.includes('healing') || name.includes('frequenc')) return GENRE_BACKUP_STREAMS['Relaxation'] || [];
  if (name.includes('legacy') || name.includes('archive')) return GENRE_BACKUP_STREAMS['Soul'] || [];
  if (name.includes('open mic')) return GENRE_BACKUP_STREAMS['R&B'] || [];
  if (name.includes('un advocacy')) return GENRE_BACKUP_STREAMS['World'] || [];

  return [];
}

/**
 * Check a single stream URL for health
 */
async function checkStream(channelId: number, channelName: string, streamUrl: string, genre?: string): Promise<StreamHealthResult> {
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
      return { channelId, channelName, streamUrl, genre, status: 'healthy', responseTimeMs: elapsed, contentType, checkedAt: Date.now() };
    } else if (isOk) {
      return { channelId, channelName, streamUrl, genre, status: 'degraded', responseTimeMs: elapsed, contentType, checkedAt: Date.now(), error: `Non-audio content: ${contentType}` };
    } else {
      return { channelId, channelName, streamUrl, genre, status: 'down', responseTimeMs: elapsed, contentType, checkedAt: Date.now(), error: `HTTP ${response.status}` };
    }
  } catch (err: any) {
    return {
      channelId, channelName, streamUrl, genre,
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
    return { timestamp: Date.now(), totalChannels: 0, healthy: 0, degraded: 0, down: 0, unknown: 0, uptimePercent: 0, results: [], healedCount: 0, stillDownCount: 0 };
  }
  const channels = await db.execute(
    sql`SELECT id, name, streamUrl, genre FROM radio_channels WHERE status = 'active' ORDER BY id`
  );

  const results: StreamHealthResult[] = [];

  // drizzle mysql2 execute returns [[rows], fields] — extract the actual row array
  let rows: any[] = [];
  if (Array.isArray(channels)) {
    if (channels.length > 0 && Array.isArray(channels[0])) {
      rows = channels[0];
    } else if (channels.length > 0 && typeof channels[0] === 'object' && 'id' in channels[0]) {
      rows = channels;
    }
  }
  console.log(`[StreamHealth] Found ${rows.length} active channels to check`);

  // Check in batches of 10 to avoid overwhelming
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const batchResults = await Promise.all(
      batch.map((ch: any) => checkStream(ch.id, ch.name, ch.streamUrl || '', ch.genre || ''))
    );
    results.push(...batchResults);
  }

  const healthy = results.filter(r => r.status === 'healthy').length;
  const degraded = results.filter(r => r.status === 'degraded').length;
  const down = results.filter(r => r.status === 'down').length;
  const unknown = results.filter(r => r.status === 'unknown').length;

  let healedCount = 0;
  let stillDownCount = 0;

  // Log non-healthy channels
  results.filter(r => r.status !== 'healthy').forEach(r => {
    console.log(`[StreamHealth] ${r.status.toUpperCase()}: ch-${r.channelId} ${r.channelName} — ${r.error || 'slow response'} (${r.responseTimeMs}ms)`);
  });

  // ─── Root Cause Analysis ────────────────────────────────────────────────────
  const downPercent = results.length > 0 ? down / results.length : 0;
  let rootCause: OutageEvent['rootCause'] = 'unknown';
  let rootCauseDetails = '';

  if (down > 0) {
    // Analyze error patterns to determine root cause
    const downChannels = results.filter(r => r.status === 'down');
    const errorTypes = new Map<string, number>();
    downChannels.forEach(ch => {
      const errKey = ch.error?.includes('abort') || ch.error?.includes('timeout') ? 'timeout'
        : ch.error?.includes('ENOTFOUND') || ch.error?.includes('DNS') ? 'dns'
        : ch.error?.includes('ECONNREFUSED') ? 'refused'
        : ch.error?.includes('fetch failed') ? 'fetch_failed'
        : 'other';
      errorTypes.set(errKey, (errorTypes.get(errKey) || 0) + 1);
    });

    // Determine root cause
    if (downPercent >= CIRCUIT_BREAKER_THRESHOLD) {
      // >50% down = likely provider or network outage, NOT individual failures
      const dominantError = [...errorTypes.entries()].sort((a, b) => b[1] - a[1])[0];
      if (dominantError[0] === 'timeout' || dominantError[0] === 'fetch_failed') {
        rootCause = 'provider_outage';
        rootCauseDetails = `${down}/${results.length} channels (${Math.round(downPercent * 100)}%) failed simultaneously with ${dominantError[0]} errors. Likely upstream provider outage — auto-healing PAUSED to prevent mass URL overwrites.`;
      } else if (dominantError[0] === 'dns') {
        rootCause = 'network_issue';
        rootCauseDetails = `DNS resolution failures across ${down} channels. Possible DNS outage or network connectivity issue.`;
      } else {
        rootCause = 'provider_outage';
        rootCauseDetails = `Mass failure: ${down}/${results.length} channels down. Dominant error: ${dominantError[0]} (${dominantError[1]} occurrences).`;
      }
      circuitBreakerTripped = true;
      lastCircuitBreakerTrip = Date.now();
      console.log(`[StreamHealth] ⚡ CIRCUIT BREAKER TRIPPED: ${rootCauseDetails}`);
    } else if (down <= 3) {
      rootCause = 'individual_failure';
      rootCauseDetails = `${down} individual channel(s) down — normal auto-healing applies.`;
    } else {
      rootCause = 'unknown';
      rootCauseDetails = `${down} channels down (${Math.round(downPercent * 100)}%). Mixed error types.`;
      // Reset circuit breaker if we're below threshold
      if (circuitBreakerTripped && Date.now() - lastCircuitBreakerTrip > 30 * 60 * 1000) {
        circuitBreakerTripped = false;
        console.log('[StreamHealth] Circuit breaker reset after 30-minute cooldown');
      }
    }

    // Log the outage event
    outageHistory.push({
      timestamp: Date.now(),
      channelsAffected: down,
      totalChannels: results.length,
      rootCause,
      details: rootCauseDetails,
      resolved: false,
    });
    if (outageHistory.length > MAX_OUTAGE_HISTORY) outageHistory.shift();
  } else {
    // All healthy — reset circuit breaker
    if (circuitBreakerTripped) {
      circuitBreakerTripped = false;
      console.log('[StreamHealth] ✅ All channels healthy — circuit breaker reset');
    }
  }

  // ─── QUMUS Auto-Healing with Genre-Matched Backups ────────────────────────
  if (down > 0 && !circuitBreakerTripped) {
    const downChannels = results.filter(r => r.status === 'down');
    const digestHealed: string[] = [];
    const digestStillDown: string[] = [];

    for (const ch of downChannels) {
      let fixed = false;

      // Step 1: Try genre-specific backups first
      const genreBackups = findGenreBackups(ch.channelName, ch.genre);
      const allBackups = [...genreBackups, ...UNIVERSAL_FALLBACKS];
      // Deduplicate and skip current URL
      const uniqueBackups = [...new Set(allBackups)].filter(url => url !== ch.streamUrl);

      for (const backup of uniqueBackups) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 5000);
          const resp = await fetch(backup, { method: 'GET', signal: ctrl.signal, headers: { 'Range': 'bytes=0-512' } });
          clearTimeout(t);
          if (resp.ok || resp.status === 206) {
            try {
              await db.execute(
                sql`UPDATE radio_channels SET streamUrl = ${backup} WHERE id = ${ch.channelId}`
              );
              const isGenreMatch = genreBackups.includes(backup);
              digestHealed.push(`ch-${String(ch.channelId).padStart(3, '0')}: ${ch.channelName} → ${isGenreMatch ? '🎵' : '📻'} ${backup}`);
              console.log(`[StreamHealth] AUTO-HEALED: ${ch.channelName} → ${backup} (${isGenreMatch ? 'genre-match' : 'universal'})`);
              fixed = true;
              healedCount++;
            } catch (dbErr) {
              console.error(`[StreamHealth] DB update failed for ${ch.channelName}:`, dbErr);
            }
            break;
          }
        } catch { /* backup also down, try next */ }
      }
      if (!fixed) {
        digestStillDown.push(`ch-${String(ch.channelId).padStart(3, '0')}: ${ch.channelName} — ${ch.error}`);
        stillDownCount++;
      }
    }

    // ─── Batched Digest Notification ──────────────────────────────────────────
    const now = Date.now();
    const timeSinceLastNotification = now - lastNotificationTime;

    if (timeSinceLastNotification >= NOTIFICATION_COOLDOWN_MS) {
      // Send a single digest notification
      let digestContent = `📊 RRB Radio Health Digest\n`;
      digestContent += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      digestContent += `Total: ${healthy + healedCount}/${results.length} channels operational\n`;
      digestContent += `Uptime: ${results.length > 0 ? Math.round(((healthy + healedCount) / results.length) * 100) : 0}%\n`;
      digestContent += `Root Cause: ${rootCauseDetails}\n\n`;

      if (digestHealed.length > 0) {
        digestContent += `✅ Auto-Healed (${digestHealed.length}):\n`;
        // Show first 5, summarize rest
        const shown = digestHealed.slice(0, 5);
        shown.forEach(h => { digestContent += `  ${h}\n`; });
        if (digestHealed.length > 5) {
          digestContent += `  ... and ${digestHealed.length - 5} more channels restored\n`;
        }
        digestContent += `\n`;
      }

      if (digestStillDown.length > 0) {
        digestContent += `❌ Needs Attention (${digestStillDown.length}):\n`;
        digestStillDown.forEach(d => { digestContent += `  ${d}\n`; });
        digestContent += `\n`;
      }

      // Include any pending items from previous cycles
      if (pendingDigestItems.length > 0) {
        digestContent += `📋 Previous Cycle Notes:\n`;
        pendingDigestItems.forEach(item => { digestContent += `  ${item}\n`; });
        pendingDigestItems = [];
      }

      digestContent += `\nTime: ${new Date().toISOString()}`;
      digestContent += `\nCircuit Breaker: ${circuitBreakerTripped ? '⚡ ACTIVE (auto-heal paused)' : '✅ Normal'}`;
      digestContent += `\nNext check in 15 minutes`;

      const severity = digestStillDown.length > 0 ? '🔴' : digestHealed.length > 10 ? '🟡' : '🟢';
      await notifyOwner({
        title: `${severity} RRB Radio Digest: ${healthy + healedCount}/${results.length} Operational`,
        content: digestContent,
      }).catch(err => console.error('[StreamHealth] Digest notification failed:', err));

      lastNotificationTime = now;
    } else {
      // Queue items for next digest instead of sending immediately
      if (digestHealed.length > 0) {
        pendingDigestItems.push(`${digestHealed.length} channels auto-healed`);
      }
      if (digestStillDown.length > 0) {
        pendingDigestItems.push(`${digestStillDown.length} channels still down`);
      }
      console.log(`[StreamHealth] Notification throttled — ${Math.round((NOTIFICATION_COOLDOWN_MS - timeSinceLastNotification) / 1000)}s until next digest`);
    }
  }

  const report: HealthReport = {
    timestamp: Date.now(),
    totalChannels: results.length,
    healthy,
    degraded,
    down,
    unknown,
    uptimePercent: results.length > 0 ? Math.round(((healthy + healedCount) / results.length) * 100) : 0,
    results,
    healedCount,
    stillDownCount,
  };

  // Store in history
  healthHistory.push(report);
  if (healthHistory.length > MAX_HISTORY) healthHistory.shift();
  lastReport = report;

  console.log(`[StreamHealth] Check complete: ${healthy + healedCount}/${results.length} healthy (${report.uptimePercent}% uptime) | Healed: ${healedCount} | Still down: ${stillDownCount} | Root cause: ${rootCause || 'none'}`);

  // ─── Circuit Breaker Notification (when tripped, send even if healing is paused) ───
  if (circuitBreakerTripped && down > 0) {
    const now = Date.now();
    if (now - lastNotificationTime >= NOTIFICATION_COOLDOWN_MS) {
      await notifyOwner({
        title: `⚡ CIRCUIT BREAKER: ${down}/${results.length} Channels Down — Auto-Heal Paused`,
        content: `${rootCauseDetails}\n\nAuto-healing is paused to prevent mass URL overwrites. The system will retry when fewer than ${Math.round(CIRCUIT_BREAKER_THRESHOLD * 100)}% of channels are affected.\n\nChannels affected:\n${results.filter(r => r.status === 'down').slice(0, 10).map(r => `  ch-${r.channelId}: ${r.channelName}`).join('\n')}${down > 10 ? `\n  ... and ${down - 10} more` : ''}\n\nTime: ${new Date().toISOString()}`,
      }).catch(err => console.error('[StreamHealth] Circuit breaker notification failed:', err));
      lastNotificationTime = now;
    }
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
  console.log('[StreamHealth] Starting automated 15-minute health monitor with genre-matched healing');

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
    healedThisCycle: lastReport?.healedCount || 0,
    stillDownThisCycle: lastReport?.stillDownCount || 0,
    circuitBreaker: {
      tripped: circuitBreakerTripped,
      lastTrippedAt: lastCircuitBreakerTrip || null,
      threshold: `${Math.round(CIRCUIT_BREAKER_THRESHOLD * 100)}%`,
    },
    downChannels: lastReport?.results.filter(r => r.status === 'down').map(r => ({
      id: r.channelId,
      name: r.channelName,
      genre: r.genre,
      error: r.error,
    })) || [],
    recentOutages: outageHistory.slice(-10).map(o => ({
      timestamp: o.timestamp,
      channelsAffected: o.channelsAffected,
      totalChannels: o.totalChannels,
      rootCause: o.rootCause,
      details: o.details,
      resolved: o.resolved,
    })),
    uptimeHistory: healthHistory.slice(-12).map(h => ({
      timestamp: h.timestamp,
      uptimePercent: h.uptimePercent,
      healthy: h.healthy,
      total: h.totalChannels,
      healed: h.healedCount,
    })),
  };
}

/**
 * Get outage history for root cause analysis
 */
export function getOutageHistory(): OutageEvent[] {
  return outageHistory;
}
