import { invokeLLM } from "./_core/llm";

/**
 * Real Agent Backend Connector
 * Connects to actual autonomous agent backend with streaming support
 */

export interface AgentBackendConfig {
  backendUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  enableStreaming: boolean;
}

export interface StreamingMessage {
  type: "thinking" | "executing" | "tool_call" | "tool_result" | "completed" | "error";
  content: string;
  toolName?: string;
  toolParams?: Record<string, unknown>;
  timestamp: Date;
}

class AgentBackendConnector {
  private config: AgentBackendConfig;
  private isConnected: boolean = false;
  private activeConnections: Map<number, AbortController> = new Map();

  constructor(config: AgentBackendConfig) {
    this.config = config;
  }

  /**
   * Initialize connection to real agent backend
   */
  async initialize(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(`${this.config.backendUrl}/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.isConnected = true;
        console.log("[Agent Backend] Connected successfully");
        return true;
      }

      this.isConnected = false;
      return false;
    } catch (error) {
      console.error("[Agent Backend] Connection failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Stream agent execution with real-time updates
   */
  async *streamExecution(
    sessionId: number,
    message: string,
    systemPrompt?: string
  ): AsyncGenerator<StreamingMessage> {
    if (!this.isConnected) {
      const connected = await this.initialize();
      if (!connected) {
        yield {
          type: "error",
          content: "Agent backend unavailable",
          timestamp: new Date(),
        };
        return;
      }
    }

    const controller = new AbortController();
    this.activeConnections.set(sessionId, controller);

    try {
      const response = await fetch(
        `${this.config.backendUrl}/stream/execute`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message,
            systemPrompt,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Agent returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                yield {
                  type: data.type || "completed",
                  content: data.content || "",
                  toolName: data.toolName,
                  toolParams: data.toolParams,
                  timestamp: new Date(),
                };
              } catch (e) {
                console.error("[Agent Backend] Failed to parse stream data:", e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Agent Backend] Stream error:", errorMessage);

      yield {
        type: "error",
        content: errorMessage,
        timestamp: new Date(),
      };
    } finally {
      this.activeConnections.delete(sessionId);
    }
  }

  /**
   * Execute agent task with fallback to LLM
   */
  async executeWithFallback(
    sessionId: number,
    message: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      // Try real backend first
      let response = "";

      for await (const chunk of this.streamExecution(
        sessionId,
        message,
        systemPrompt
      )) {
        if (chunk.type === "error") {
          throw new Error(chunk.content);
        }
        response += chunk.content;
      }

      return response;
    } catch (error) {
      console.warn("[Agent Backend] Falling back to LLM:", error);

      // Fallback to LLM
      try {
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                systemPrompt ||
                "You are an autonomous agent. Respond helpfully.",
            },
            { role: "user", content: message },
          ],
        });

        const content = llmResponse.choices[0]?.message?.content;
        return typeof content === "string" ? content : "No response";
      } catch (llmError) {
        console.error("[Agent Backend] LLM fallback failed:", llmError);
        throw new Error("Both agent backend and LLM failed");
      }
    }
  }

  /**
   * Cancel active streaming connection
   */
  cancelStream(sessionId: number): void {
    const controller = this.activeConnections.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeConnections.delete(sessionId);
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; activeStreams: number } {
    return {
      connected: this.isConnected,
      activeStreams: this.activeConnections.size,
    };
  }

  /**
   * Disconnect from agent backend
   */
  disconnect(): void {
    // Cancel all active streams
    this.activeConnections.forEach((controller) => {
      controller.abort();
    });
    this.activeConnections.clear();
    this.isConnected = false;
    console.log("[Agent Backend] Disconnected");
  }
}

// Singleton instance
let connector: AgentBackendConnector | null = null;

/**
 * Get or create agent backend connector
 */
export function getAgentBackendConnector(
  config?: AgentBackendConfig
): AgentBackendConnector {
  if (!connector && config) {
    connector = new AgentBackendConnector(config);
  }

  if (!connector) {
    throw new Error("Agent backend connector not initialized");
  }

  return connector;
}

/**
 * Initialize agent backend connector
 */
export function initializeAgentBackendConnector(
  config: AgentBackendConfig
): AgentBackendConnector {
  connector = new AgentBackendConnector(config);
  return connector;
}
