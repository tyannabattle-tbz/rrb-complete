/**
 * Real Agent Backend Connector
 * Connects to actual autonomous agent backend with streaming support
 */

export interface AgentResponse {
  id: string;
  status: "thinking" | "executing" | "complete" | "error";
  message?: string;
  toolsUsed?: string[];
  result?: unknown;
  error?: string;
  timestamp: Date;
}

export interface StreamEvent {
  type: "start" | "thinking" | "tool_call" | "tool_result" | "complete" | "error";
  data: unknown;
  timestamp: Date;
}

export class RealAgentBackendConnector {
  private backendUrl: string;
  private apiKey: string;
  private timeout: number = 30000;
  private activeConnections: Map<string, AbortController> = new Map();

  constructor(backendUrl: string, apiKey: string) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
  }

  /**
   * Execute agent task with streaming
   */
  async executeWithStreaming(
    sessionId: string,
    prompt: string,
    onStream: (event: StreamEvent) => void
  ): Promise<AgentResponse> {
    const controller = new AbortController();
    this.activeConnections.set(sessionId, controller);

    try {
      const response = await fetch(`${this.backendUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sessionId,
          prompt,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Agent backend error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result: AgentResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const event = JSON.parse(line) as StreamEvent;
            onStream(event);

            if (event.type === "complete") {
              result = event.data as AgentResponse;
            }
          } catch (e) {
            console.error("Failed to parse stream event:", e);
          }
        }
      }

      return (
        result || {
          id: sessionId,
          status: "complete",
          timestamp: new Date(),
        }
      );
    } finally {
      this.activeConnections.delete(sessionId);
    }
  }

  /**
   * Execute agent task without streaming
   */
  async execute(sessionId: string, prompt: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sessionId,
          prompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Agent backend error: ${response.statusText}`);
      }

      return (await response.json()) as AgentResponse;
    } catch (error) {
      return {
        id: sessionId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Cancel active execution
   */
  cancelExecution(sessionId: string): boolean {
    const controller = this.activeConnections.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeConnections.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Get agent status
   */
  async getStatus(): Promise<{ healthy: boolean; version?: string }> {
    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return await response.json();
      }
      return { healthy: false };
    } catch {
      return { healthy: false };
    }
  }

  /**
   * Get agent capabilities
   */
  async getCapabilities(): Promise<string[]> {
    try {
      const response = await fetch(`${this.backendUrl}/capabilities`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = (await response.json()) as { capabilities: string[] };
        return data.capabilities;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Set backend timeout
   */
  setTimeout(ms: number): void {
    this.timeout = ms;
  }

  /**
   * Disconnect all active connections
   */
  disconnectAll(): void {
    const controllers = Array.from(this.activeConnections.values());
    for (const controller of controllers) {
      controller.abort();
    }
    this.activeConnections.clear();
  }
}

// Export singleton instance (to be initialized with env vars)
export let realAgentConnector: RealAgentBackendConnector | null = null;

export function initializeRealAgentConnector(
  backendUrl: string,
  apiKey: string
): RealAgentBackendConnector {
  realAgentConnector = new RealAgentBackendConnector(backendUrl, apiKey);
  return realAgentConnector;
}
