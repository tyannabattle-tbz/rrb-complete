/**
 * QUMUS API Client
 * RRB integration with standalone Qumus orchestration engine
 */

const QUMUS_API_URL = process.env.VITE_QUMUS_API_URL || 'http://localhost:3001';

export interface QumusDecision {
  id: string;
  policyId: string;
  timestamp: number;
  autonomous: boolean;
  action: string;
  metadata: Record<string, any>;
  result: 'success' | 'failed' | 'pending';
  systemsAffected: string[];
}

export interface QumusMetrics {
  totalDecisions: number;
  autonomousDecisions: number;
  humanOverrides: number;
  autonomyPercentage: number;
  policies: number;
  enabledPolicies: number;
}

export interface QumusPolicy {
  id: string;
  name: string;
  description: string;
  autonomyLevel: number;
  enabled: boolean;
  executionCount: number;
  lastExecuted: number | null;
}

class QumusClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;

  constructor(baseUrl: string = QUMUS_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a decision through Qumus
   */
  async makeDecision(
    policyId: string,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<QumusDecision> {
    const response = await fetch(`${this.baseUrl}/api/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyId, action, metadata }),
    });

    if (!response.ok) {
      throw new Error(`Failed to make decision: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get autonomy metrics
   */
  async getMetrics(): Promise<QumusMetrics> {
    const response = await fetch(`${this.baseUrl}/api/metrics`);

    if (!response.ok) {
      throw new Error(`Failed to get metrics: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all policies
   */
  async getPolicies(): Promise<QumusPolicy[]> {
    const response = await fetch(`${this.baseUrl}/api/policies`);

    if (!response.ok) {
      throw new Error(`Failed to get policies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get specific policy
   */
  async getPolicy(policyId: string): Promise<QumusPolicy> {
    const response = await fetch(`${this.baseUrl}/api/policies/${policyId}`);

    if (!response.ok) {
      throw new Error(`Failed to get policy: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update policy autonomy level
   */
  async updatePolicyAutonomy(policyId: string, autonomyLevel: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/policies/${policyId}/autonomy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autonomyLevel }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update policy: ${response.statusText}`);
    }
  }

  /**
   * Get decision history
   */
  async getDecisionHistory(limit: number = 100): Promise<QumusDecision[]> {
    const response = await fetch(`${this.baseUrl}/api/decisions?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to get decision history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    const response = await fetch(`${this.baseUrl}/api/dashboard`);

    if (!response.ok) {
      throw new Error(`Failed to get dashboard data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sync with Qumus
   */
  async sync(system: string, data: Record<string, any>) {
    const response = await fetch(`${this.baseUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send webhook event to Qumus
   */
  async sendWebhook(system: string, event: string, data: Record<string, any>) {
    const response = await fetch(`${this.baseUrl}/webhooks/${system}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send webhook: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Human override of autonomous decision
   */
  async override(decisionId: string, action: string, reason: string) {
    const response = await fetch(`${this.baseUrl}/api/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisionId, action, reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to override decision: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(onMessage: (data: any) => void, onError?: (err: Error) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.baseUrl.replace('http', 'ws');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Connected to Qumus WebSocket');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        this.ws.onerror = (event) => {
          const error = new Error('WebSocket error');
          if (onError) onError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Disconnected from Qumus WebSocket');
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to WebSocket channel
   */
  subscribe(channel: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }

  /**
   * Check Qumus health
   */
  async health() {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Qumus health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const qumusClient = new QumusClient();

// Export class for testing
export default QumusClient;
