/**
 * Stream Health Monitoring & Failover Service
 * Monitors stream health and automatically switches to backup sources
 */

export interface StreamHealth {
  streamId: string;
  url: string;
  status: 'healthy' | 'degraded' | 'failed' | 'unknown';
  lastChecked: number;
  responseTime: number;
  errorCount: number;
  successCount: number;
  uptime: number; // percentage
  backupUrl?: string;
}

export interface StreamHealthReport {
  timestamp: number;
  totalStreams: number;
  healthyStreams: number;
  degradedStreams: number;
  failedStreams: number;
  averageUptime: number;
  streams: StreamHealth[];
}

export interface HealthCheckOptions {
  timeout: number; // milliseconds
  retries: number;
  checkInterval: number; // milliseconds
}

const DEFAULT_OPTIONS: HealthCheckOptions = {
  timeout: 5000,
  retries: 3,
  checkInterval: 60000 // Check every minute
};

const healthCache = new Map<string, StreamHealth>();
const failoverMap = new Map<string, string[]>(); // streamId -> backup URLs

/**
 * Check if a stream is healthy by attempting to fetch headers
 */
export async function checkStreamHealth(
  streamId: string,
  url: string,
  options: Partial<HealthCheckOptions> = {}
): Promise<StreamHealth> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  let lastError: Error | null = null;
  let responseTime = 0;

  for (let attempt = 0; attempt < opts.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      responseTime = Date.now() - startTime;

      const cached = healthCache.get(streamId) || {
        streamId,
        url,
        status: 'unknown',
        lastChecked: 0,
        responseTime: 0,
        errorCount: 0,
        successCount: 0,
        uptime: 100
      };

      const health: StreamHealth = {
        ...cached,
        status: response.ok ? 'healthy' : 'degraded',
        lastChecked: Date.now(),
        responseTime,
        successCount: cached.successCount + 1,
        uptime: Math.min(100, ((cached.successCount + 1) / (cached.successCount + cached.errorCount + 1)) * 100)
      };

      healthCache.set(streamId, health);
      return health;
    } catch (error) {
      lastError = error as Error;
      responseTime = Date.now() - startTime;

      if (attempt === opts.retries - 1) {
        const cached = healthCache.get(streamId) || {
          streamId,
          url,
          status: 'unknown',
          lastChecked: 0,
          responseTime: 0,
          errorCount: 0,
          successCount: 0,
          uptime: 100
        };

        const health: StreamHealth = {
          ...cached,
          status: 'failed',
          lastChecked: Date.now(),
          responseTime,
          errorCount: cached.errorCount + 1,
          uptime: Math.max(0, ((cached.successCount) / (cached.successCount + cached.errorCount + 1)) * 100)
        };

        healthCache.set(streamId, health);
        return health;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('Stream health check failed');
}

/**
 * Get current health status of a stream
 */
export function getStreamHealth(streamId: string): StreamHealth | null {
  return healthCache.get(streamId) || null;
}

/**
 * Register backup URLs for a stream
 */
export function registerBackupStreams(streamId: string, backupUrls: string[]): void {
  failoverMap.set(streamId, backupUrls);
}

/**
 * Get backup streams for failover
 */
export function getBackupStreams(streamId: string): string[] {
  return failoverMap.get(streamId) || [];
}

/**
 * Attempt failover to backup stream
 */
export async function attemptFailover(
  streamId: string,
  primaryUrl: string,
  options?: Partial<HealthCheckOptions>
): Promise<{ success: boolean; url: string; reason?: string }> {
  const backups = getBackupStreams(streamId);

  for (const backupUrl of backups) {
    try {
      const health = await checkStreamHealth(`${streamId}-backup`, backupUrl, options);

      if (health.status === 'healthy' || health.status === 'degraded') {
        return {
          success: true,
          url: backupUrl,
          reason: `Switched to backup stream (${health.status})`
        };
      }
    } catch (error) {
      console.warn(`Backup stream ${backupUrl} failed:`, error);
      continue;
    }
  }

  return {
    success: false,
    url: primaryUrl,
    reason: 'No healthy backup streams available'
  };
}

/**
 * Monitor multiple streams and generate report
 */
export async function monitorStreams(
  streams: Array<{ id: string; url: string }>,
  options?: Partial<HealthCheckOptions>
): Promise<StreamHealthReport> {
  const healthChecks = await Promise.allSettled(
    streams.map(stream => checkStreamHealth(stream.id, stream.url, options))
  );

  const results: StreamHealth[] = [];
  let healthyCount = 0;
  let degradedCount = 0;
  let failedCount = 0;
  let totalUptime = 0;

  healthChecks.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const health = result.value;
      results.push(health);

      if (health.status === 'healthy') healthyCount++;
      else if (health.status === 'degraded') degradedCount++;
      else if (health.status === 'failed') failedCount++;

      totalUptime += health.uptime;
    }
  });

  return {
    timestamp: Date.now(),
    totalStreams: streams.length,
    healthyStreams: healthyCount,
    degradedStreams: degradedCount,
    failedStreams: failedCount,
    averageUptime: results.length > 0 ? totalUptime / results.length : 0,
    streams: results
  };
}

/**
 * Get streams that need attention
 */
export function getUnhealthyStreams(): StreamHealth[] {
  return Array.from(healthCache.values()).filter(
    stream => stream.status === 'degraded' || stream.status === 'failed'
  );
}

/**
 * Clear health cache for a stream
 */
export function clearStreamHealth(streamId: string): void {
  healthCache.delete(streamId);
}

/**
 * Clear all health cache
 */
export function clearAllHealthCache(): void {
  healthCache.clear();
}

/**
 * Get health statistics
 */
export function getHealthStatistics() {
  const streams = Array.from(healthCache.values());

  if (streams.length === 0) {
    return {
      total: 0,
      healthy: 0,
      degraded: 0,
      failed: 0,
      averageUptime: 0,
      averageResponseTime: 0
    };
  }

  const healthy = streams.filter(s => s.status === 'healthy').length;
  const degraded = streams.filter(s => s.status === 'degraded').length;
  const failed = streams.filter(s => s.status === 'failed').length;
  const avgUptime = streams.reduce((sum, s) => sum + s.uptime, 0) / streams.length;
  const avgResponseTime = streams.reduce((sum, s) => sum + s.responseTime, 0) / streams.length;

  return {
    total: streams.length,
    healthy,
    degraded,
    failed,
    averageUptime: Math.round(avgUptime),
    averageResponseTime: Math.round(avgResponseTime)
  };
}

/**
 * Start continuous monitoring
 */
export function startContinuousMonitoring(
  streams: Array<{ id: string; url: string }>,
  options?: Partial<HealthCheckOptions>
): () => void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let isRunning = true;

  const monitor = async () => {
    while (isRunning) {
      try {
        await monitorStreams(streams, opts);
      } catch (error) {
        console.error('Monitoring error:', error);
      }

      await new Promise(resolve => setTimeout(resolve, opts.checkInterval));
    }
  };

  // Start monitoring in background
  monitor();

  // Return stop function
  return () => {
    isRunning = false;
  };
}

/**
 * Export health report as JSON
 */
export function exportHealthReport(report: StreamHealthReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export health report as CSV
 */
export function exportHealthReportAsCSV(report: StreamHealthReport): string {
  const headers = ['Stream ID', 'Status', 'Uptime %', 'Response Time (ms)', 'Success Count', 'Error Count'];
  const rows = report.streams.map(stream => [
    stream.streamId,
    stream.status,
    stream.uptime.toFixed(2),
    stream.responseTime,
    stream.successCount,
    stream.errorCount
  ]);

  const csv = [
    `Stream Health Report - ${new Date(report.timestamp).toISOString()}`,
    `Total Streams: ${report.totalStreams}`,
    `Healthy: ${report.healthyStreams}, Degraded: ${report.degradedStreams}, Failed: ${report.failedStreams}`,
    `Average Uptime: ${report.averageUptime.toFixed(2)}%`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}
