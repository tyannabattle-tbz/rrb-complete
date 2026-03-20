/**
 * Unified Feed Health Check & Auto-Reconnect
 * Monitors Ty OS, QUMUS, and RRB feed health
 * Implements auto-reconnect logic and fallback strategies
 */

import { tyOSFeedService } from './tyOSUnifiedFeedService';
import { qumusUnifiedFeedIntegration } from './qumusUnifiedFeedIntegration';
import { rrbUnifiedFeedIntegration } from './rrbUnifiedFeedIntegration';

interface HealthCheckResult {
  timestamp: number;
  tyOS: {
    isHealthy: boolean;
    channelCount: number;
    liveChannels: number;
  };
  qumus: {
    isConnected: boolean;
    lastSync: number;
    reconnectAttempts: number;
  };
  rrb: {
    isStreaming: boolean;
    currentChannel: number;
    currentStreamUrl: string;
  };
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

class UnifiedFeedHealthCheck {
  private checkInterval = 5000; // 5 seconds
  private checkTimer: NodeJS.Timeout | null = null;
  private lastCheck: HealthCheckResult | null = null;
  private healthHistory: HealthCheckResult[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.initialize();
  }

  private initialize() {
    console.log('[Health Check] Initializing unified feed health monitoring...');
    this.startHealthCheck();
  }

  private startHealthCheck() {
    if (this.checkTimer) clearInterval(this.checkTimer);

    this.checkTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    // Initial check
    this.performHealthCheck();
  }

  private performHealthCheck(): HealthCheckResult {
    const tyOSStatus = tyOSFeedService.getSyncStatus();
    const qumusStatus = qumusUnifiedFeedIntegration.getSyncStatus();
    const rrbStatus = rrbUnifiedFeedIntegration.getSyncStatus();

    const result: HealthCheckResult = {
      timestamp: Date.now(),
      tyOS: {
        isHealthy: tyOSStatus.isHealthy,
        channelCount: tyOSStatus.channelCount,
        liveChannels: tyOSStatus.liveChannels,
      },
      qumus: {
        isConnected: qumusStatus.isConnected,
        lastSync: qumusStatus.lastSync,
        reconnectAttempts: qumusStatus.reconnectAttempts,
      },
      rrb: {
        isStreaming: rrbStatus.isStreaming,
        currentChannel: rrbStatus.currentChannel,
        currentStreamUrl: rrbStatus.currentStreamUrl,
      },
      overallStatus: this.determineOverallStatus(tyOSStatus, qumusStatus, rrbStatus),
    };

    this.lastCheck = result;
    this.addToHistory(result);

    // Log health status
    if (result.overallStatus === 'critical') {
      console.error('[Health Check] CRITICAL:', JSON.stringify(result, null, 2));
      this.handleCriticalStatus(result);
    } else if (result.overallStatus === 'degraded') {
      console.warn('[Health Check] DEGRADED:', JSON.stringify(result, null, 2));
      this.handleDegradedStatus(result);
    } else {
      console.log('[Health Check] HEALTHY:', JSON.stringify(result, null, 2));
    }

    return result;
  }

  private determineOverallStatus(tyOS: any, qumus: any, rrb: any): 'healthy' | 'degraded' | 'critical' {
    const healthyCount = [tyOS.isHealthy, qumus.isConnected, rrb.isStreaming].filter(Boolean).length;

    if (healthyCount === 3) return 'healthy';
    if (healthyCount >= 1) return 'degraded';
    return 'critical';
  }

  private handleCriticalStatus(result: HealthCheckResult) {
    console.error('[Health Check] CRITICAL STATUS DETECTED');
    console.error('[Health Check] Ty OS healthy:', result.tyOS.isHealthy);
    console.error('[Health Check] QUMUS connected:', result.qumus.isConnected);
    console.error('[Health Check] RRB streaming:', result.rrb.isStreaming);

    // Attempt recovery
    if (!result.tyOS.isHealthy) {
      console.log('[Health Check] Attempting Ty OS recovery...');
      tyOSFeedService.setHealthStatus(true);
    }

    if (!result.qumus.isConnected) {
      console.log('[Health Check] Attempting QUMUS reconnect...');
      qumusUnifiedFeedIntegration.triggerSync();
    }

    if (!result.rrb.isStreaming) {
      console.log('[Health Check] Attempting RRB stream recovery...');
      rrbUnifiedFeedIntegration.triggerSync();
    }
  }

  private handleDegradedStatus(result: HealthCheckResult) {
    console.warn('[Health Check] DEGRADED STATUS - Attempting recovery...');

    // Attempt recovery for degraded systems
    if (!result.tyOS.isHealthy) {
      console.log('[Health Check] Ty OS degraded, attempting recovery...');
      tyOSFeedService.setHealthStatus(true);
    }

    if (!result.qumus.isConnected && result.qumus.reconnectAttempts < 5) {
      console.log('[Health Check] QUMUS degraded, attempting reconnect...');
      qumusUnifiedFeedIntegration.triggerSync();
    }

    if (!result.rrb.isStreaming) {
      console.log('[Health Check] RRB degraded, attempting recovery...');
      rrbUnifiedFeedIntegration.triggerSync();
    }
  }

  private addToHistory(result: HealthCheckResult) {
    this.healthHistory.push(result);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory.shift();
    }
  }

  /**
   * Get last health check result
   */
  getLastCheck(): HealthCheckResult | null {
    return this.lastCheck;
  }

  /**
   * Get health history
   */
  getHistory(limit: number = 10): HealthCheckResult[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get overall system status
   */
  getSystemStatus() {
    return {
      lastCheck: this.lastCheck,
      history: this.getHistory(10),
      systemHealth: this.lastCheck?.overallStatus || 'unknown',
      timestamp: Date.now(),
    };
  }

  /**
   * Manually trigger health check
   */
  triggerCheck(): HealthCheckResult {
    return this.performHealthCheck();
  }

  /**
   * Shutdown
   */
  shutdown() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    console.log('[Health Check] Shutdown complete');
  }
}

export const unifiedFeedHealthCheck = new UnifiedFeedHealthCheck();
