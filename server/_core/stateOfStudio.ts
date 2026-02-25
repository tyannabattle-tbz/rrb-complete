/**
 * State of the Studio - Critical Bridge Component
 * Acts as the central metric connecting Legacy Restored and Legacy Continues
 * Essential for entire ecosystem functionality
 */

export interface StudioMetrics {
  timestamp: Date;
  systemHealth: number; // 0-100
  autonomyLevel: number; // 0-100, target 90%
  activeChannels: number;
  activeStreams: number;
  totalListeners: number;
  contentQueueLength: number;
  averageLatency: number; // ms
  uptime: number; // percentage
  errorRate: number; // percentage
  humanInterventions: number;
  autonomousDecisions: number;
}

export interface LegacyStatus {
  legacyRestored: {
    status: 'active' | 'inactive';
    dataIntegrity: number; // 0-100
    archiveHealth: number; // 0-100
    accessibilityScore: number; // 0-100
  };
  legacyContinues: {
    status: 'active' | 'inactive';
    perpetualOperation: boolean;
    generationalWealth: number; // 0-100
    communityImpact: number; // 0-100
  };
}

class StateOfStudio {
  private metrics: StudioMetrics;
  private legacyStatus: LegacyStatus;
  private metricsHistory: StudioMetrics[] = [];
  private maxHistoryLength = 1440; // 24 hours at 1-minute intervals

  constructor() {
    this.metrics = {
      timestamp: new Date(),
      systemHealth: 100,
      autonomyLevel: 90,
      activeChannels: 0,
      activeStreams: 0,
      totalListeners: 0,
      contentQueueLength: 0,
      averageLatency: 0,
      uptime: 99.9,
      errorRate: 0.1,
      humanInterventions: 0,
      autonomousDecisions: 0,
    };

    this.legacyStatus = {
      legacyRestored: {
        status: 'active',
        dataIntegrity: 100,
        archiveHealth: 100,
        accessibilityScore: 95,
      },
      legacyContinues: {
        status: 'active',
        perpetualOperation: true,
        generationalWealth: 85,
        communityImpact: 90,
      },
    };
  }

  /**
   * Get current state of studio metrics
   */
  getMetrics(): StudioMetrics {
    return { ...this.metrics };
  }

  /**
   * Get legacy status bridge
   */
  getLegacyStatus(): LegacyStatus {
    return JSON.parse(JSON.stringify(this.legacyStatus));
  }

  /**
   * Update studio metrics
   */
  updateMetrics(updates: Partial<StudioMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...updates,
      timestamp: new Date(),
    };

    // Keep history for trend analysis
    this.metricsHistory.push({ ...this.metrics });
    if (this.metricsHistory.length > this.maxHistoryLength) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Update legacy status
   */
  updateLegacyStatus(updates: Partial<LegacyStatus>): void {
    this.legacyStatus = {
      ...this.legacyStatus,
      ...updates,
    };
  }

  /**
   * Get comprehensive health report
   */
  getHealthReport() {
    const avgAutonomy =
      this.metricsHistory.length > 0
        ? this.metricsHistory.reduce((sum, m) => sum + m.autonomyLevel, 0) /
          this.metricsHistory.length
        : this.metrics.autonomyLevel;

    const avgHealth =
      this.metricsHistory.length > 0
        ? this.metricsHistory.reduce((sum, m) => sum + m.systemHealth, 0) /
          this.metricsHistory.length
        : this.metrics.systemHealth;

    return {
      currentMetrics: this.metrics,
      legacyStatus: this.legacyStatus,
      trends: {
        averageAutonomy: avgAutonomy,
        averageHealth: avgHealth,
        totalDecisions:
          this.metrics.autonomousDecisions + this.metrics.humanInterventions,
        autonomyRatio:
          this.metrics.autonomousDecisions /
          (this.metrics.autonomousDecisions + this.metrics.humanInterventions),
      },
      bridgeStatus: {
        legacyRestoredActive: this.legacyStatus.legacyRestored.status === 'active',
        legacyContinuesActive: this.legacyStatus.legacyContinues.status === 'active',
        perpetualOperationEnabled:
          this.legacyStatus.legacyContinues.perpetualOperation,
        ecosystemIntegrated: true,
      },
    };
  }

  /**
   * Record autonomous decision
   */
  recordAutonomousDecision(): void {
    this.metrics.autonomousDecisions++;
  }

  /**
   * Record human intervention
   */
  recordHumanIntervention(): void {
    this.metrics.humanInterventions++;
  }

  /**
   * Update channel count
   */
  updateChannelCount(count: number): void {
    this.metrics.activeChannels = count;
  }

  /**
   * Update stream count
   */
  updateStreamCount(count: number): void {
    this.metrics.activeStreams = count;
  }

  /**
   * Update listener count
   */
  updateListenerCount(count: number): void {
    this.metrics.totalListeners = count;
  }

  /**
   * Get metrics history for trend analysis
   */
  getMetricsHistory(limit?: number): StudioMetrics[] {
    if (limit) {
      return this.metricsHistory.slice(-limit);
    }
    return [...this.metricsHistory];
  }

  /**
   * Calculate ecosystem health score
   */
  calculateEcosystemHealth(): number {
    const weights = {
      systemHealth: 0.3,
      autonomyLevel: 0.25,
      uptime: 0.2,
      dataIntegrity: 0.15,
      communityImpact: 0.1,
    };

    const score =
      this.metrics.systemHealth * weights.systemHealth +
      this.metrics.autonomyLevel * weights.autonomyLevel +
      this.metrics.uptime * weights.uptime +
      this.legacyStatus.legacyRestored.dataIntegrity * weights.dataIntegrity +
      this.legacyStatus.legacyContinues.communityImpact * weights.communityImpact;

    return Math.round(score);
  }
}

// Export singleton instance
export const stateOfStudio = new StateOfStudio();
