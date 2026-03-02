/**
 * Resource Monitoring and Optimization System
 * Monitor and optimize CPU, RAM, storage, and network usage
 */

export interface ResourceMetric {
  timestamp: Date;
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  activeProcesses: number;
}

export interface ResourceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'storage' | 'network';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface OptimizationRecommendation {
  id: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedSavings: string;
  action: () => void;
}

export class ResourceMonitor {
  private metrics: ResourceMetric[] = [];
  private alerts: ResourceAlert[] = [];
  private recommendations: OptimizationRecommendation[] = [];
  private maxMetricsHistory = 1000;
  private thresholds = {
    cpu: 80,
    memory: 85,
    storage: 90,
    network: 95,
  };

  /**
   * Record resource metric
   */
  recordMetric(
    cpu: number,
    memory: number,
    storage: number,
    network: number,
    activeProcesses: number
  ): void {
    const metric: ResourceMetric = {
      timestamp: new Date(),
      cpu,
      memory,
      storage,
      network,
      activeProcesses,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Check thresholds and generate alerts
    this.checkThresholds(metric);

    // Generate recommendations
    this.generateRecommendations(metric);
  }

  /**
   * Check resource thresholds
   */
  private checkThresholds(metric: ResourceMetric): void {
    if (metric.cpu > this.thresholds.cpu) {
      this.createAlert('cpu', 'critical', `High CPU usage: ${metric.cpu}%`);
    }
    if (metric.memory > this.thresholds.memory) {
      this.createAlert('memory', 'critical', `High memory usage: ${metric.memory}%`);
    }
    if (metric.storage > this.thresholds.storage) {
      this.createAlert('storage', 'warning', `Storage nearly full: ${metric.storage}%`);
    }
    if (metric.network > this.thresholds.network) {
      this.createAlert('network', 'warning', `High network usage: ${metric.network}%`);
    }
  }

  /**
   * Create alert
   */
  private createAlert(
    type: 'cpu' | 'memory' | 'storage' | 'network',
    severity: 'info' | 'warning' | 'critical',
    message: string
  ): void {
    const alert: ResourceAlert = {
      id: `alert-${Date.now()}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metric: ResourceMetric): void {
    if (metric.cpu > 70) {
      this.addRecommendation(
        'performance',
        'high',
        'Reduce concurrent video processing',
        'Close or pause non-essential video processing tasks',
        '20-30% CPU reduction',
        () => console.log('Pausing non-essential tasks...')
      );
    }

    if (metric.memory > 75) {
      this.addRecommendation(
        'performance',
        'high',
        'Clear memory cache',
        'Clear browser cache and temporary files',
        '15-25% memory reduction',
        () => console.log('Clearing cache...')
      );
    }

    if (metric.storage > 80) {
      this.addRecommendation(
        'storage',
        'high',
        'Archive old projects',
        'Move completed projects to archive storage',
        '30-50% storage reduction',
        () => console.log('Archiving old projects...')
      );
    }
  }

  /**
   * Add recommendation
   */
  private addRecommendation(
    category: string,
    priority: 'low' | 'medium' | 'high',
    title: string,
    description: string,
    estimatedSavings: string,
    action: () => void
  ): void {
    const recommendation: OptimizationRecommendation = {
      id: `rec-${Date.now()}`,
      category,
      priority,
      title,
      description,
      estimatedSavings,
      action,
    };

    // Avoid duplicates
    if (!this.recommendations.find((r) => r.title === title)) {
      this.recommendations.push(recommendation);
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): ResourceMetric | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(timeRange: 'hour' | 'day' | 'week' = 'hour'): ResourceMetric[] {
    const now = new Date();
    let cutoffTime: Date;

    if (timeRange === 'hour') {
      cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === 'day') {
      cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return this.metrics.filter((m) => m.timestamp >= cutoffTime);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): ResourceAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    return true;
  }

  /**
   * Get recommendations
   */
  getRecommendations(): OptimizationRecommendation[] {
    return this.recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Apply recommendation
   */
  applyRecommendation(recommendationId: string): boolean {
    const recommendation = this.recommendations.find((r) => r.id === recommendationId);
    if (!recommendation) return false;

    recommendation.action();
    return true;
  }

  /**
   * Get resource summary
   */
  getResourceSummary() {
    const current = this.getCurrentMetrics();
    if (!current) return null;

    const history = this.getMetricsHistory('hour');
    const avgCpu = Math.round(history.reduce((sum, m) => sum + m.cpu, 0) / history.length);
    const avgMemory = Math.round(history.reduce((sum, m) => sum + m.memory, 0) / history.length);
    const avgStorage = Math.round(history.reduce((sum, m) => sum + m.storage, 0) / history.length);

    return {
      current,
      averages: {
        cpu: avgCpu,
        memory: avgMemory,
        storage: avgStorage,
      },
      health: this.calculateHealth(current),
      recommendations: this.getRecommendations(),
      alerts: this.getActiveAlerts(),
    };
  }

  /**
   * Calculate overall system health
   */
  private calculateHealth(metric: ResourceMetric): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgUsage = (metric.cpu + metric.memory + metric.storage + metric.network) / 4;

    if (avgUsage < 40) return 'excellent';
    if (avgUsage < 60) return 'good';
    if (avgUsage < 80) return 'fair';
    return 'poor';
  }

  /**
   * Set custom thresholds
   */
  setThresholds(
    cpu?: number,
    memory?: number,
    storage?: number,
    network?: number
  ): void {
    if (cpu !== undefined) this.thresholds.cpu = cpu;
    if (memory !== undefined) this.thresholds.memory = memory;
    if (storage !== undefined) this.thresholds.storage = storage;
    if (network !== undefined) this.thresholds.network = network;
  }
}

export const resourceMonitor = new ResourceMonitor();
