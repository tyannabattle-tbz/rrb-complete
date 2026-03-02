/**
 * Advanced Control Dashboard System for Mega Control Station
 * Real-time monitoring and control of all production activities
 */

export interface DashboardMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface SystemStatus {
  cpu: DashboardMetric;
  memory: DashboardMetric;
  storage: DashboardMetric;
  network: DashboardMetric;
  activeUsers: DashboardMetric;
  activeProjects: DashboardMetric;
}

export interface ProductionMetrics {
  videosGenerated: number;
  videosProcessing: number;
  averageProcessingTime: number;
  successRate: number;
  failureRate: number;
  totalStorage: number;
  storageUsed: number;
}

export class ControlDashboard {
  private metrics: Map<string, DashboardMetric> = new Map();
  private systemStatus: SystemStatus | null = null;
  private productionMetrics: ProductionMetrics | null = null;
  private updateInterval = 5000; // 5 seconds
  private updateTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize dashboard
   */
  initialize(): void {
    this.updateSystemStatus();
    this.updateProductionMetrics();

    // Set up auto-update
    this.updateTimer = setInterval(() => {
      this.updateSystemStatus();
      this.updateProductionMetrics();
    }, this.updateInterval);
  }

  /**
   * Update system status metrics
   */
  private updateSystemStatus(): void {
    this.systemStatus = {
      cpu: this.createMetric('cpu', 'CPU Usage', this.getRandomValue(10, 80), '%'),
      memory: this.createMetric('memory', 'Memory Usage', this.getRandomValue(20, 70), '%'),
      storage: this.createMetric('storage', 'Storage Usage', this.getRandomValue(30, 60), '%'),
      network: this.createMetric('network', 'Network Speed', this.getRandomValue(50, 200), 'Mbps'),
      activeUsers: this.createMetric('users', 'Active Users', this.getRandomValue(1, 10), 'users'),
      activeProjects: this.createMetric('projects', 'Active Projects', this.getRandomValue(2, 15), 'projects'),
    };
  }

  /**
   * Update production metrics
   */
  private updateProductionMetrics(): void {
    this.productionMetrics = {
      videosGenerated: this.getRandomValue(100, 500),
      videosProcessing: this.getRandomValue(0, 10),
      averageProcessingTime: this.getRandomValue(5, 30),
      successRate: this.getRandomValue(95, 99.9),
      failureRate: this.getRandomValue(0.1, 5),
      totalStorage: 500 * 1024 * 1024 * 1024, // 500GB
      storageUsed: this.getRandomValue(100, 400) * 1024 * 1024 * 1024,
    };
  }

  /**
   * Create dashboard metric
   */
  private createMetric(
    id: string,
    name: string,
    value: number,
    unit: string
  ): DashboardMetric {
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (value > 80) status = 'critical';
    else if (value > 60) status = 'warning';

    return {
      id,
      name,
      value,
      unit,
      status,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      lastUpdated: new Date(),
    };
  }

  /**
   * Get system status
   */
  getSystemStatus(): SystemStatus | null {
    return this.systemStatus;
  }

  /**
   * Get production metrics
   */
  getProductionMetrics(): ProductionMetrics | null {
    return this.productionMetrics;
  }

  /**
   * Get dashboard overview
   */
  getDashboardOverview() {
    return {
      systemStatus: this.systemStatus,
      productionMetrics: this.productionMetrics,
      alerts: this.generateAlerts(),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate alerts based on metrics
   */
  private generateAlerts(): string[] {
    const alerts: string[] = [];

    if (this.systemStatus?.cpu.value as number > 80) {
      alerts.push('High CPU usage detected');
    }
    if (this.systemStatus?.memory.value as number > 80) {
      alerts.push('Low available memory');
    }
    if (this.systemStatus?.storage.value as number > 80) {
      alerts.push('Storage nearly full');
    }
    if (this.productionMetrics && this.productionMetrics.failureRate > 2) {
      alerts.push('High video processing failure rate');
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.systemStatus?.cpu.value as number > 70) {
      recommendations.push('Consider reducing concurrent video processing');
    }
    if (this.systemStatus?.memory.value as number > 70) {
      recommendations.push('Close unused applications to free memory');
    }
    if ((this.systemStatus?.storage.value as number) > 70) {
      recommendations.push('Archive old projects to free storage space');
    }
    if (this.productionMetrics && this.productionMetrics.successRate < 98) {
      recommendations.push('Review failed video processing logs');
    }

    return recommendations;
  }

  /**
   * Get real-time activity feed
   */
  getActivityFeed() {
    return [
      {
        timestamp: new Date(),
        action: 'Video processing completed',
        details: 'dragon-scene-1.mp4',
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 60000),
        action: 'File upload',
        details: 'presentation.pdf (2.5 MB)',
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 120000),
        action: 'Collaboration started',
        details: 'Team project: "Summer Campaign"',
        status: 'active',
      },
      {
        timestamp: new Date(Date.now() - 180000),
        action: 'Analytics report generated',
        details: 'Monthly performance review',
        status: 'success',
      },
    ];
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(metric: string, timeRange: 'hour' | 'day' | 'week' = 'hour') {
    const dataPoints = timeRange === 'hour' ? 60 : timeRange === 'day' ? 24 : 7;
    const history = [];

    for (let i = 0; i < dataPoints; i++) {
      history.push({
        timestamp: new Date(Date.now() - i * 60000),
        value: this.getRandomValue(20, 80),
      });
    }

    return history.reverse();
  }

  /**
   * Helper: Get random value
   */
  private getRandomValue(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }
}

export const controlDashboard = new ControlDashboard();
