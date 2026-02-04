/**
 * QUMUS Load Balancer Service
 * Manages request queuing, priority routing, and health monitoring
 * Prevents system overload and ensures optimal policy execution
 */

export interface QueuedRequest {
  id: string;
  policyName: string;
  priority: "critical" | "high" | "normal" | "low";
  timestamp: number;
  data: any;
  retries: number;
  maxRetries: number;
}

export interface LoadBalancerMetrics {
  queueDepth: number;
  totalProcessed: number;
  totalFailed: number;
  avgLatency: number;
  throughput: number;
  activePolicies: number;
  systemLoad: number;
  uptime: number;
}

/**
 * QUMUS Load Balancer
 * Manages request queuing with priority levels and rate limiting
 */
export class QUMUSLoadBalancer {
  private static requestQueue: QueuedRequest[] = [];
  private static processedRequests = 0;
  private static failedRequests = 0;
  private static startTime = Date.now();
  private static isProcessing = false;
  private static metrics: LoadBalancerMetrics = {
    queueDepth: 0,
    totalProcessed: 0,
    totalFailed: 0,
    avgLatency: 0,
    throughput: 0,
    activePolicies: 0,
    systemLoad: 0,
    uptime: 0,
  };

  // Rate limiting per policy (requests per hour)
  private static policyRateLimits: Map<string, { limit: number; current: number; resetTime: number }> = new Map([
    ["DonorOutreachPolicy", { limit: 500, current: 0, resetTime: Date.now() + 3600000 }],
    ["GrantApplicationPolicy", { limit: 200, current: 0, resetTime: Date.now() + 3600000 }],
    ["EmergencyAlertPriorityPolicy", { limit: 1000, current: 0, resetTime: Date.now() + 3600000 }],
    ["FundraisingCampaignPolicy", { limit: 300, current: 0, resetTime: Date.now() + 3600000 }],
    ["WellnessCheckInPolicy", { limit: 400, current: 0, resetTime: Date.now() + 3600000 }],
    ["ContentGenerationPolicy", { limit: 150, current: 0, resetTime: Date.now() + 3600000 }],
    ["BroadcastSchedulingPolicy", { limit: 250, current: 0, resetTime: Date.now() + 3600000 }],
    ["AnalyticsAggregationPolicy", { limit: 600, current: 0, resetTime: Date.now() + 3600000 }],
  ]);

  // Circuit breaker for failing policies
  private static circuitBreakers: Map<
    string,
    { state: "closed" | "open" | "half-open"; failures: number; lastFailure: number }
  > = new Map();

  /**
   * Initialize load balancer
   */
  static initialize(): void {
    console.log("[QUMUS Load Balancer] Initializing...");

    // Initialize circuit breakers for all policies
    for (const policyName of Array.from(this.policyRateLimits.keys())) {
      this.circuitBreakers.set(policyName, {
        state: "closed",
        failures: 0,
        lastFailure: 0,
      });
    }

    // Start processing loop
    this.startProcessingLoop();
    console.log("[QUMUS Load Balancer] Initialized successfully");
  }

  /**
   * Add request to queue
   */
  static enqueueRequest(
    policyName: string,
    priority: "critical" | "high" | "normal" | "low",
    data: any
  ): { success: boolean; message: string; requestId?: string } {
    // Check rate limit
    const rateLimit = this.policyRateLimits.get(policyName);
    if (!rateLimit) {
      return { success: false, message: `Unknown policy: ${policyName}` };
    }

    // Reset rate limit if hour has passed
    if (Date.now() > rateLimit.resetTime) {
      rateLimit.current = 0;
      rateLimit.resetTime = Date.now() + 3600000;
    }

    if (rateLimit.current >= rateLimit.limit) {
      return { success: false, message: `Rate limit exceeded for ${policyName}` };
    }

    // Check circuit breaker
    const breaker = this.circuitBreakers.get(policyName);
    if (breaker && breaker.state === "open") {
      // Check if half-open timeout has passed
      if (Date.now() - breaker.lastFailure > 60000) {
        breaker.state = "half-open";
      } else {
        return { success: false, message: `Circuit breaker open for ${policyName}` };
      }
    }

    // Check queue depth (max 1000 requests)
    if (this.requestQueue.length >= 1000) {
      return { success: false, message: "Queue is full, please retry later" };
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const request: QueuedRequest = {
      id: requestId,
      policyName,
      priority,
      timestamp: Date.now(),
      data,
      retries: 0,
      maxRetries: 3,
    };

    this.requestQueue.push(request);
    rateLimit.current++;

    // Sort by priority
    this.sortQueue();

    this.metrics.queueDepth = this.requestQueue.length;

    console.log(
      `[QUMUS Load Balancer] Request enqueued: ${requestId} (${policyName}, priority: ${priority}, queue depth: ${this.requestQueue.length})`
    );

    return { success: true, message: "Request queued", requestId };
  }

  /**
   * Sort queue by priority
   */
  private static sortQueue(): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

    this.requestQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Start processing loop
   */
  private static startProcessingLoop(): void {
    setInterval(() => {
      this.processQueue();
    }, 100); // Process every 100ms
  }

  /**
   * Process queued requests
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process up to 10 requests per cycle
      for (let i = 0; i < Math.min(10, this.requestQueue.length); i++) {
        const request = this.requestQueue.shift();
        if (!request) break;

        const startTime = Date.now();

        try {
          // Simulate policy execution
          await this.executePolicy(request);

          const latency = Date.now() - startTime;
          this.updateMetrics(request.policyName, latency, true);
          this.processedRequests++;

          // Reset circuit breaker on success
          const breaker = this.circuitBreakers.get(request.policyName);
          if (breaker) {
            breaker.failures = 0;
            breaker.state = "closed";
          }

          console.log(`[QUMUS Load Balancer] Request processed: ${request.id} (${latency}ms)`);
        } catch (error) {
          const latency = Date.now() - startTime;
          this.updateMetrics(request.policyName, latency, false);

          // Handle circuit breaker
          const breaker = this.circuitBreakers.get(request.policyName);
          if (breaker) {
            breaker.failures++;
            breaker.lastFailure = Date.now();

            if (breaker.failures >= 5) {
              breaker.state = "open";
              console.error(`[QUMUS Load Balancer] Circuit breaker opened for ${request.policyName}`);
            }
          }

          // Retry logic
          if (request.retries < request.maxRetries) {
            request.retries++;
            this.requestQueue.push(request);
            this.sortQueue();
            console.warn(
              `[QUMUS Load Balancer] Request retry: ${request.id} (attempt ${request.retries}/${request.maxRetries})`
            );
          } else {
            this.failedRequests++;
            console.error(`[QUMUS Load Balancer] Request failed after retries: ${request.id}`);
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.metrics.queueDepth = this.requestQueue.length;
    }
  }

  /**
   * Execute policy (simulated)
   */
  private static async executePolicy(request: QueuedRequest): Promise<void> {
    // Simulate policy execution with random latency (50-500ms)
    const executionTime = Math.random() * 450 + 50;
    await new Promise((resolve) => setTimeout(resolve, executionTime));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`Policy execution failed: ${request.policyName}`);
    }
  }

  /**
   * Update metrics
   */
  private static updateMetrics(policyName: string, latency: number, success: boolean): void {
    // Update average latency
    const totalLatency = this.metrics.avgLatency * this.metrics.totalProcessed;
    this.metrics.totalProcessed++;
    this.metrics.avgLatency = Math.round((totalLatency + latency) / this.metrics.totalProcessed);

    // Update throughput (requests per second)
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = Math.round(this.metrics.totalProcessed / uptime);

    // Update system load (0-100%)
    this.metrics.systemLoad = Math.min(
      100,
      Math.round((this.requestQueue.length / 1000) * 100 + (this.metrics.avgLatency / 1000) * 10)
    );

    // Update uptime
    this.metrics.uptime = uptime;
  }

  /**
   * Get metrics
   */
  static getMetrics(): LoadBalancerMetrics {
    return {
      ...this.metrics,
      queueDepth: this.requestQueue.length,
      totalProcessed: this.processedRequests,
      totalFailed: this.failedRequests,
      activePolicies: this.policyRateLimits.size,
    };
  }

  /**
   * Get queue status
   */
  static getQueueStatus(): {
    depth: number;
    byPriority: Record<string, number>;
    byPolicy: Record<string, number>;
    oldestRequest: { age: number; policyName: string } | null;
  } {
    const byPriority = { critical: 0, high: 0, normal: 0, low: 0 };
    const byPolicy: Record<string, number> = {};

    for (const request of this.requestQueue) {
      byPriority[request.priority]++;
      byPolicy[request.policyName] = (byPolicy[request.policyName] || 0) + 1;
    }

    const oldestRequest = this.requestQueue.length > 0 ? this.requestQueue[0] : null;

    return {
      depth: this.requestQueue.length,
      byPriority,
      byPolicy,
      oldestRequest: oldestRequest
        ? {
            age: Date.now() - oldestRequest.timestamp,
            policyName: oldestRequest.policyName,
          }
        : null,
    };
  }

  /**
   * Get circuit breaker status
   */
  static getCircuitBreakerStatus(): Record<string, { state: string; failures: number }> {
    const status: Record<string, { state: string; failures: number }> = {};

    for (const [policyName, breaker] of Array.from(this.circuitBreakers.entries())) {
      status[policyName] = {
        state: breaker.state,
        failures: breaker.failures,
      };
    }

    return status;
  }

  /**
   * Get rate limit status
   */
  static getRateLimitStatus(): Record<string, { current: number; limit: number; remaining: number }> {
    const status: Record<string, { current: number; limit: number; remaining: number }> = {};

    for (const [policyName, rateLimit] of Array.from(this.policyRateLimits.entries())) {
      // Reset if hour has passed
      if (Date.now() > rateLimit.resetTime) {
        rateLimit.current = 0;
        rateLimit.resetTime = Date.now() + 3600000;
      }

      status[policyName] = {
        current: rateLimit.current,
        limit: rateLimit.limit,
        remaining: rateLimit.limit - rateLimit.current,
      };
    }

    return status;
  }

  /**
   * Get health status
   */
  static getHealthStatus(): {
    healthy: boolean;
    systemLoad: number;
    queueDepth: number;
    avgLatency: number;
    errorRate: number;
    circuitBreakersOpen: number;
  } {
    const openBreakers = Array.from(this.circuitBreakers.values()).filter((b) => b.state === "open").length;

    const errorRate =
      this.processedRequests + this.failedRequests > 0
        ? (this.failedRequests / (this.processedRequests + this.failedRequests)) * 100
        : 0;

    return {
      healthy: this.metrics.systemLoad < 80 && errorRate < 5 && openBreakers === 0,
      systemLoad: this.metrics.systemLoad,
      queueDepth: this.requestQueue.length,
      avgLatency: this.metrics.avgLatency,
      errorRate: Math.round(errorRate * 100) / 100,
      circuitBreakersOpen: openBreakers,
    };
  }

  /**
   * Force process queue (for testing)
   */
  static async forceProcess(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Clear queue (for testing)
   */
  static clearQueue(): void {
    this.requestQueue = [];
    this.metrics.queueDepth = 0;
  }

  /**
   * Reset metrics (for testing)
   */
  static resetMetrics(): void {
    this.processedRequests = 0;
    this.failedRequests = 0;
    this.startTime = Date.now();
    this.metrics = {
      queueDepth: 0,
      totalProcessed: 0,
      totalFailed: 0,
      avgLatency: 0,
      throughput: 0,
      activePolicies: this.policyRateLimits.size,
      systemLoad: 0,
      uptime: 0,
    };
  }
}

export const qumusLoadBalancer = QUMUSLoadBalancer;
