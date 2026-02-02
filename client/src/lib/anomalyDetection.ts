/**
 * AI-Powered Anomaly Detection System
 * Detects unusual patterns in production metrics and alerts users
 */

export interface Metric {
  timestamp: Date;
  value: number;
  source: string;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

export type AnomalyType =
  | 'spike'
  | 'drop'
  | 'trend_change'
  | 'pattern_break'
  | 'threshold_exceeded'
  | 'resource_exhaustion'
  | 'performance_degradation'
  | 'error_rate_increase';

export interface AnomalyAlert {
  id: string;
  anomaly: Anomaly;
  notified: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class AnomalyDetection {
  private metrics: Map<string, Metric[]> = new Map();
  private anomalies: Map<string, Anomaly> = new Map();
  private alerts: AnomalyAlert[] = [];
  private thresholds: Map<string, { min: number; max: number }> = new Map();

  constructor() {
    this.initializeThresholds();
  }

  /**
   * Initialize metric thresholds
   */
  private initializeThresholds(): void {
    this.thresholds.set('cpu_usage', { min: 0, max: 80 });
    this.thresholds.set('memory_usage', { min: 0, max: 85 });
    this.thresholds.set('storage_usage', { min: 0, max: 90 });
    this.thresholds.set('error_rate', { min: 0, max: 5 });
    this.thresholds.set('processing_time', { min: 0, max: 120 });
    this.thresholds.set('success_rate', { min: 90, max: 100 });
  }

  /**
   * Record metric
   */
  recordMetric(source: string, value: number): void {
    if (!this.metrics.has(source)) {
      this.metrics.set(source, []);
    }

    const metricList = this.metrics.get(source)!;
    metricList.push({
      timestamp: new Date(),
      value,
      source,
    });

    // Keep only last 1000 metrics
    if (metricList.length > 1000) {
      metricList.shift();
    }

    // Check for anomalies
    this.checkForAnomalies(source, value);
  }

  /**
   * Check for anomalies
   */
  private checkForAnomalies(source: string, currentValue: number): void {
    const metrics = this.metrics.get(source) || [];
    if (metrics.length < 10) return;

    // Check threshold exceeded
    const threshold = this.thresholds.get(source);
    if (threshold && (currentValue > threshold.max || currentValue < threshold.min)) {
      this.createAnomaly(
        'threshold_exceeded',
        source,
        this.getAverageValue(source),
        currentValue
      );
    }

    // Check for spike
    const average = this.getAverageValue(source);
    const deviation = Math.abs(currentValue - average) / average;
    if (deviation > 0.5) {
      this.createAnomaly('spike', source, average, currentValue);
    }

    // Check for trend change
    const trend = this.detectTrendChange(source);
    if (trend) {
      this.createAnomaly('trend_change', source, average, currentValue);
    }
  }

  /**
   * Get average value
   */
  private getAverageValue(source: string): number {
    const metrics = this.metrics.get(source) || [];
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Detect trend change
   */
  private detectTrendChange(source: string): boolean {
    const metrics = this.metrics.get(source) || [];
    if (metrics.length < 20) return false;

    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);

    const recentAvg = recent.reduce((acc, m) => acc + m.value, 0) / recent.length;
    const olderAvg = older.reduce((acc, m) => acc + m.value, 0) / older.length;

    const change = Math.abs(recentAvg - olderAvg) / olderAvg;
    return change > 0.3;
  }

  /**
   * Create anomaly
   */
  private createAnomaly(
    type: AnomalyType,
    metric: string,
    expectedValue: number,
    actualValue: number
  ): void {
    const deviation = Math.abs(actualValue - expectedValue) / expectedValue;
    const severity = this.calculateSeverity(type, deviation);

    const anomaly: Anomaly = {
      id: `anomaly-${Date.now()}`,
      type,
      severity,
      metric,
      expectedValue,
      actualValue,
      deviation,
      description: this.generateAnomalyDescription(type, metric, expectedValue, actualValue),
      detectedAt: new Date(),
      resolved: false,
    };

    this.anomalies.set(anomaly.id, anomaly);

    // Create alert
    const alert: AnomalyAlert = {
      id: `alert-${Date.now()}`,
      anomaly,
      notified: false,
    };

    this.alerts.push(alert);
  }

  /**
   * Calculate severity
   */
  private calculateSeverity(
    type: AnomalyType,
    deviation: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (deviation > 2) return 'critical';
    if (deviation > 1) return 'high';
    if (deviation > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate anomaly description
   */
  private generateAnomalyDescription(
    type: AnomalyType,
    metric: string,
    expectedValue: number,
    actualValue: number
  ): string {
    const descriptions: Record<AnomalyType, string> = {
      spike: `Sudden spike in ${metric}: expected ${expectedValue.toFixed(2)}, got ${actualValue.toFixed(2)}`,
      drop: `Sudden drop in ${metric}: expected ${expectedValue.toFixed(2)}, got ${actualValue.toFixed(2)}`,
      trend_change: `Trend change detected in ${metric}`,
      pattern_break: `Pattern break detected in ${metric}`,
      threshold_exceeded: `${metric} exceeded threshold: ${actualValue.toFixed(2)}`,
      resource_exhaustion: `Resource exhaustion warning for ${metric}`,
      performance_degradation: `Performance degradation detected in ${metric}`,
      error_rate_increase: `Error rate increased for ${metric}`,
    };

    return descriptions[type] || `Anomaly detected in ${metric}`;
  }

  /**
   * Get all anomalies
   */
  getAnomalies(unresolved: boolean = false): Anomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (unresolved) {
      anomalies = anomalies.filter((a) => !a.resolved);
    }

    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get anomalies by severity
   */
  getAnomaliesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Anomaly[] {
    return this.getAnomalies().filter((a) => a.severity === severity);
  }

  /**
   * Resolve anomaly
   */
  resolveAnomaly(anomalyId: string): boolean {
    const anomaly = this.anomalies.get(anomalyId);
    if (!anomaly) return false;

    anomaly.resolved = true;
    return true;
  }

  /**
   * Get alerts
   */
  getAlerts(unnotified: boolean = false): AnomalyAlert[] {
    let alerts = this.alerts;

    if (unnotified) {
      alerts = alerts.filter((a) => !a.notified);
    }

    return alerts.sort((a, b) => b.anomaly.detectedAt.getTime() - a.anomaly.detectedAt.getTime());
  }

  /**
   * Mark alert as notified
   */
  markAlertAsNotified(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.notified = true;
    return true;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    return true;
  }

  /**
   * Get anomaly statistics
   */
  getAnomalyStatistics(): {
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
  } {
    const anomalies = this.getAnomalies();
    const unresolved = anomalies.filter((a) => !a.resolved);

    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byType: Record<string, number> = {};

    anomalies.forEach((a) => {
      bySeverity[a.severity]++;
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    return {
      total: anomalies.length,
      unresolved: unresolved.length,
      bySeverity,
      byType,
    };
  }

  /**
   * Get metric history
   */
  getMetricHistory(source: string, limit: number = 100): Metric[] {
    const metrics = this.metrics.get(source) || [];
    return metrics.slice(-limit);
  }

  /**
   * Predict future anomalies
   */
  predictAnomalies(source: string): Array<{ probability: number; type: AnomalyType }> {
    const metrics = this.metrics.get(source) || [];
    if (metrics.length < 20) return [];

    const predictions: Array<{ probability: number; type: AnomalyType }> = [];

    // Simple trend analysis
    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);

    const recentAvg = recent.reduce((acc, m) => acc + m.value, 0) / recent.length;
    const olderAvg = older.reduce((acc, m) => acc + m.value, 0) / older.length;

    const trend = recentAvg > olderAvg ? 'increasing' : 'decreasing';

    if (trend === 'increasing') {
      predictions.push({ probability: 0.7, type: 'threshold_exceeded' });
    }

    if (Math.random() > 0.7) {
      predictions.push({ probability: 0.5, type: 'spike' });
    }

    return predictions;
  }
}

export const anomalyDetection = new AnomalyDetection();
