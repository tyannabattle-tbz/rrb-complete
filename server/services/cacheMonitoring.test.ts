import { describe, it, expect, beforeEach } from 'vitest';
import { CacheMonitor } from './cacheMonitoring';

describe('CacheMonitor', () => {
  let monitor: CacheMonitor;

  beforeEach(() => {
    monitor = new CacheMonitor();
  });

  it('should record cache hits', () => {
    monitor.recordHit(100);
    monitor.recordHit(150);
    const metrics = monitor.getMetrics();
    expect(metrics.hits).toBe(2);
  });

  it('should record cache misses', () => {
    monitor.recordMiss(200);
    monitor.recordMiss(250);
    const metrics = monitor.getMetrics();
    expect(metrics.misses).toBe(2);
  });

  it('should calculate hit rate correctly', () => {
    monitor.recordHit(100);
    monitor.recordHit(100);
    monitor.recordMiss(200);
    const metrics = monitor.getMetrics();
    expect(metrics.hitRate).toBeCloseTo(66.67, 1);
  });

  it('should calculate average response time', () => {
    monitor.recordHit(100);
    monitor.recordHit(200);
    monitor.recordHit(300);
    const metrics = monitor.getMetrics();
    expect(metrics.avgResponseTime).toBe(200);
  });

  it('should reset metrics', () => {
    monitor.recordHit(100);
    monitor.recordMiss(200);
    monitor.reset();
    const metrics = monitor.getMetrics();
    expect(metrics.hits).toBe(0);
    expect(metrics.misses).toBe(0);
    expect(metrics.totalRequests).toBe(0);
  });
});
