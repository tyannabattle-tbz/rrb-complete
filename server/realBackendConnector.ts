import axios, { AxiosInstance } from "axios";

/**
 * Real Agent Backend Connector
 * Connects to the actual autonomous agent backend with streaming support
 */

export interface AgentExecutionRequest {
  sessionId: string;
  userMessage: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxSteps?: number;
}

export interface AgentStreamUpdate {
  type: "thinking" | "executing" | "tool_call" | "tool_result" | "completed" | "error";
  content: string;
  timestamp: Date;
  toolName?: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
}

export interface AgentExecutionResponse {
  sessionId: string;
  success: boolean;
  finalResponse: string;
  toolsUsed: string[];
  executionTime: number;
  stepsExecuted: number;
  updates: AgentStreamUpdate[];
}

export class RealBackendConnector {
  private client: AxiosInstance;
  private backendUrl: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(
    backendUrl: string = process.env.AGENT_BACKEND_URL || "http://localhost:8000",
    apiKey: string = process.env.AGENT_BACKEND_API_KEY || "",
    timeout: number = 30000,
    retryAttempts: number = 3
  ) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;

    this.client = axios.create({
      baseURL: this.backendUrl,
      timeout: this.timeout,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Execute agent with streaming support
   */
  async executeWithStreaming(
    request: AgentExecutionRequest,
    onUpdate: (update: AgentStreamUpdate) => void
  ): Promise<AgentExecutionResponse> {
    const updates: AgentStreamUpdate[] = [];
    let retryCount = 0;

    while (retryCount < this.retryAttempts) {
      try {
        const startTime = Date.now();
        const response = await this.client.post<AgentExecutionResponse>(
          "/api/execute",
          {
            sessionId: request.sessionId,
            userMessage: request.userMessage,
            systemPrompt: request.systemPrompt || "You are a helpful AI assistant.",
            model: request.model || "gpt-4-turbo",
            temperature: request.temperature || 0.7,
            maxSteps: request.maxSteps || 50,
          }
        );

        const executionTime = Date.now() - startTime;

        // Process streaming updates
        if (response.data.updates && Array.isArray(response.data.updates)) {
          for (const update of response.data.updates) {
            const streamUpdate: AgentStreamUpdate = {
              type: update.type,
              content: update.content,
              timestamp: new Date(update.timestamp),
              toolName: update.toolName,
              parameters: update.parameters,
              result: update.result,
            };

            updates.push(streamUpdate);
            onUpdate(streamUpdate);
          }
        }

        return {
          sessionId: request.sessionId,
          success: response.data.success,
          finalResponse: response.data.finalResponse,
          toolsUsed: response.data.toolsUsed || [],
          executionTime,
          stepsExecuted: response.data.stepsExecuted || 0,
          updates,
        };
      } catch (error) {
        retryCount++;

        if (retryCount >= this.retryAttempts) {
          console.error(
            `[RealBackendConnector] Failed after ${this.retryAttempts} attempts:`,
            error
          );
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    throw new Error("Failed to execute agent");
  }

  /**
   * Execute agent without streaming
   */
  async execute(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    const updates: AgentStreamUpdate[] = [];

    return this.executeWithStreaming(request, (update) => {
      updates.push(update);
    });
  }

  /**
   * Check backend health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health", { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error("[RealBackendConnector] Health check failed:", error);
      return false;
    }
  }

  /**
   * Get agent status
   */
  async getStatus(sessionId: string): Promise<{
    sessionId: string;
    status: "idle" | "reasoning" | "executing" | "completed" | "error";
    currentStep: number;
    totalSteps: number;
    lastUpdate: Date;
  }> {
    try {
      const response = await this.client.get(`/api/status/${sessionId}`);
      return {
        sessionId,
        status: response.data.status,
        currentStep: response.data.currentStep,
        totalSteps: response.data.totalSteps,
        lastUpdate: new Date(response.data.lastUpdate),
      };
    } catch (error) {
      console.error("[RealBackendConnector] Failed to get status:", error);
      return {
        sessionId,
        status: "error",
        currentStep: 0,
        totalSteps: 0,
        lastUpdate: new Date(),
      };
    }
  }

  /**
   * Cancel agent execution
   */
  async cancel(sessionId: string): Promise<boolean> {
    try {
      const response = await this.client.post(`/api/cancel/${sessionId}`);
      return response.status === 200;
    } catch (error) {
      console.error("[RealBackendConnector] Failed to cancel execution:", error);
      return false;
    }
  }

  /**
   * Get execution history
   */
  async getHistory(sessionId: string): Promise<AgentStreamUpdate[]> {
    try {
      const response = await this.client.get(`/api/history/${sessionId}`);
      return response.data.updates || [];
    } catch (error) {
      console.error("[RealBackendConnector] Failed to get history:", error);
      return [];
    }
  }
}

// Export singleton instance
export const backendConnector = new RealBackendConnector();
