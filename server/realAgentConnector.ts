import { invokeLLM } from "./_core/llm";
import type { ToolExecution } from "./agentBackendService";

/**
 * Real Agent Backend Connector
 * Connects to actual autonomous agent backend with full streaming and tool execution support
 */

export interface RealAgentConfig {
  backendUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  enableStreaming: boolean;
}

export interface AgentExecutionRequest {
  sessionId: number;
  userId: number;
  message: string;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  maxSteps?: number;
}

export interface AgentExecutionResponse {
  success: boolean;
  sessionId: number;
  messageId: number;
  response: string;
  toolsExecuted: ToolExecution[];
  reasoning: string;
  nextAction: string;
  status: "thinking" | "executing" | "completed" | "error";
  executionTime: number;
  timestamp: Date;
}

class RealAgentConnector {
  private config: RealAgentConfig;
  private isConnected: boolean = false;
  private lastHealthCheck: Date = new Date();
  private failureCount: number = 0;

  constructor(config: RealAgentConfig) {
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
        this.failureCount = 0;
        this.lastHealthCheck = new Date();
        console.log("[Real Agent] Connected successfully");
        return true;
      }

      this.isConnected = false;
      this.failureCount++;
      return false;
    } catch (error) {
      console.error("[Real Agent] Connection failed:", error);
      this.isConnected = false;
      this.failureCount++;
      return false;
    }
  }

  /**
   * Execute agent task with real backend
   */
  async executeTask(
    request: AgentExecutionRequest
  ): Promise<AgentExecutionResponse> {
    if (!this.isConnected) {
      const connected = await this.initialize();
      if (!connected) {
        return this.createErrorResponse(request, "Agent backend unavailable");
      }
    }

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(`${this.config.backendUrl}/execute`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: request.sessionId,
          userId: request.userId,
          message: request.message,
          systemPrompt: request.systemPrompt,
          temperature: request.temperature,
          model: request.model,
          maxSteps: request.maxSteps,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Agent returned status ${response.status}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      this.failureCount = 0;

      return {
        success: true,
        sessionId: request.sessionId,
        messageId: data.messageId || 0,
        response: data.response || data.message,
        toolsExecuted: data.toolsExecuted || [],
        reasoning: data.reasoning || "",
        nextAction: data.nextAction || "",
        status: data.status || "completed",
        executionTime,
        timestamp: new Date(),
      };
    } catch (error) {
      this.failureCount++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Real Agent] Execution error:", errorMessage);

      return this.createErrorResponse(
        request,
        errorMessage,
        Date.now() - startTime
      );
    }
  }

  /**
   * Stream agent execution with real-time updates
   */
  async *streamTask(
    request: AgentExecutionRequest
  ): AsyncGenerator<AgentExecutionResponse> {
    try {
      // Initial thinking status
      yield this.createResponse(request, {
        response: "Agent is thinking...",
        status: "thinking",
        reasoning: "Processing your request",
        nextAction: "analyzing",
        executionTime: 0,
      });

      // Execute task
      const response = await this.executeTask(request);

      // Yield intermediate updates if tools were executed
      if (response.toolsExecuted.length > 0) {
        for (const tool of response.toolsExecuted) {
          yield this.createResponse(request, {
            response: `Executing tool: ${tool.toolName}`,
            status: "executing",
            reasoning: `Running ${tool.toolName}`,
            nextAction: "executing",
            executionTime: tool.duration,
            toolsExecuted: [tool],
          });
        }
      }

      // Yield final response
      yield response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      yield this.createErrorResponse(request, errorMessage);
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    lastHealthCheck: Date;
    failureCount: number;
    isHealthy: boolean;
  } {
    const isHealthy = this.failureCount < this.config.retryAttempts;

    return {
      connected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck,
      failureCount: this.failureCount,
      isHealthy,
    };
  }

  /**
   * Helper to create response object
   */
  private createResponse(
    request: AgentExecutionRequest,
    partial: Partial<AgentExecutionResponse>
  ): AgentExecutionResponse {
    return {
      success: true,
      sessionId: request.sessionId,
      messageId: 0,
      response: "",
      toolsExecuted: [],
      reasoning: "",
      nextAction: "",
      status: "completed",
      executionTime: 0,
      timestamp: new Date(),
      ...partial,
    };
  }

  /**
   * Helper to create error response
   */
  private createErrorResponse(
    request: AgentExecutionRequest,
    errorMessage: string,
    executionTime: number = 0
  ): AgentExecutionResponse {
    return {
      success: false,
      sessionId: request.sessionId,
      messageId: 0,
      response: errorMessage,
      toolsExecuted: [],
      reasoning: "",
      nextAction: "",
      status: "error",
      executionTime,
      timestamp: new Date(),
    };
  }

  /**
   * Disconnect from agent backend
   */
  disconnect(): void {
    this.isConnected = false;
    console.log("[Real Agent] Disconnected");
  }
}

// Singleton instance
let connector: RealAgentConnector | null = null;

/**
 * Get or create real agent connector
 */
export function getRealAgentConnector(
  config?: RealAgentConfig
): RealAgentConnector {
  if (!connector && config) {
    connector = new RealAgentConnector(config);
  }

  if (!connector) {
    throw new Error("Real agent connector not initialized");
  }

  return connector;
}

/**
 * Initialize real agent connector
 */
export function initializeRealAgentConnector(
  config: RealAgentConfig
): RealAgentConnector {
  connector = new RealAgentConnector(config);
  return connector;
}

/**
 * Execute with real backend or fallback to LLM
 */
export async function executeWithRealBackend(
  request: AgentExecutionRequest,
  config?: RealAgentConfig
): Promise<AgentExecutionResponse> {
  if (config) {
    try {
      const conn = getRealAgentConnector(config);
      return await conn.executeTask(request);
    } catch (error) {
      console.warn("[Real Agent] Falling back to LLM:", error);
    }
  }

  // Fallback to LLM
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            request.systemPrompt ||
            "You are an autonomous agent. Respond with your reasoning and next actions.",
        },
        { role: "user", content: request.message },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const message =
      typeof messageContent === "string" ? messageContent : "No response";

    return {
      success: true,
      sessionId: request.sessionId,
      messageId: 0,
      response: message,
      toolsExecuted: [],
      reasoning: "Using fallback LLM",
      nextAction: "completed",
      status: "completed",
      executionTime: 0,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      sessionId: request.sessionId,
      messageId: 0,
      response: errorMessage,
      toolsExecuted: [],
      reasoning: "",
      nextAction: "",
      status: "error",
      executionTime: 0,
      timestamp: new Date(),
    };
  }
}
