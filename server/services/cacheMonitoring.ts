export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  avgResponseTime: number;
}

export class CacheMonitor {
  private hits = 0;
  private misses = 0;
  private responseTimes: number[] = [];
  private maxSamples = 1000;

  recordHit(responseTime: number) {
    this.hits++;
    this.recordResponseTime(responseTime);
  }

  recordMiss(responseTime: number) {
    this.misses++;
    this.recordResponseTime(responseTime);
  }

  private recordResponseTime(time: number) {
    this.responseTimes.push(time);
    if (this.responseTimes.length > this.maxSamples) {
      this.responseTimes.shift();
    }
  }

  getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      totalRequests,
      avgResponseTime,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.responseTimes = [];
  }
}

export const cacheMonitor = new CacheMonitor();
