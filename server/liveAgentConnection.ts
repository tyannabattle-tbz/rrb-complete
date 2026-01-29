import { invokeLLM } from "./_core/llm";
import type { ToolExecution } from "./agentBackendService";

/**
 * Live Agent Connection Service
 * Manages real-time connection to autonomous agent backend
 */

export interface LiveAgentConfig {
  agentBackendUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: ToolExecution[];
}

export interface LiveAgentResponse {
  success: boolean;
  message: string;
  toolsExecuted: ToolExecution[];
  reasoning: string;
  nextAction: string;
  status: "thinking" | "executing" | "completed" | "error";
  executionTime: number;
}

class LiveAgentConnection {
  private config: LiveAgentConfig;
  private messageHistory: AgentMessage[] = [];
  private connectionStatus: "connected" | "disconnected" | "reconnecting" =
    "disconnected";
  private lastHeartbeat: Date = new Date();

  constructor(config: LiveAgentConfig) {
    this.config = config;
  }

  /**
   * Initialize connection to agent backend
   */
  async connect(): Promise<boolean> {
    try {
      this.connectionStatus = "reconnecting";

      // Test connection with health check
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(`${this.config.agentBackendUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.connectionStatus = "connected";
        this.lastHeartbeat = new Date();
        console.log("[Live Agent] Connected successfully");
        return true;
      }

      this.connectionStatus = "disconnected";
      return false;
    } catch (error) {
      console.error("[Live Agent] Connection failed:", error);
      this.connectionStatus = "disconnected";
      return false;
    }
  }

  /**
   * Send message to live agent and get response
   */
  async sendMessage(userMessage: string): Promise<LiveAgentResponse> {
    if (this.connectionStatus !== "connected") {
      const connected = await this.connect();
      if (!connected) {
        return {
          success: false,
          message: "Agent backend is not available",
          toolsExecuted: [],
          reasoning: "",
          nextAction: "",
          status: "error",
          executionTime: 0,
        };
      }
    }

    const startTime = Date.now();

    try {
      // Add user message to history
      this.messageHistory.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      });

      // Send to agent backend
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.agentBackendUrl}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            message: userMessage,
            history: this.messageHistory,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Agent returned status ${response.status}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      // Add assistant response to history
      this.messageHistory.push({
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        toolCalls: data.toolsExecuted,
      });

      this.lastHeartbeat = new Date();

      return {
        success: true,
        message: data.message,
        toolsExecuted: data.toolsExecuted || [],
        reasoning: data.reasoning || "",
        nextAction: data.nextAction || "",
        status: data.status || "completed",
        executionTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[Live Agent] Execution error:", errorMessage);

      return {
        success: false,
        message: errorMessage,
        toolsExecuted: [],
        reasoning: "",
        nextAction: "",
        status: "error",
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Stream agent execution with real-time updates
   */
  async *streamExecution(
    userMessage: string
  ): AsyncGenerator<LiveAgentResponse> {
    try {
      // Initial thinking status
      yield {
        success: true,
        message: "Agent is thinking...",
        toolsExecuted: [],
        reasoning: "Processing your request",
        nextAction: "analyzing",
        status: "thinking",
        executionTime: 0,
      };

      // Get response from agent
      const response = await this.sendMessage(userMessage);

      // Yield intermediate updates if available
      if (response.toolsExecuted.length > 0) {
        for (const tool of response.toolsExecuted) {
          yield {
            success: true,
            message: `Executing tool: ${tool.toolName}`,
            toolsExecuted: [tool],
            reasoning: `Running ${tool.toolName}`,
            nextAction: "executing",
            status: "executing",
            executionTime: tool.duration,
          };
        }
      }

      // Yield final response
      yield response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      yield {
        success: false,
        message: errorMessage,
        toolsExecuted: [],
        reasoning: "",
        nextAction: "",
        status: "error",
        executionTime: 0,
      };
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    status: string;
    lastHeartbeat: Date;
    messageCount: number;
  } {
    return {
      connected: this.connectionStatus === "connected",
      status: this.connectionStatus,
      lastHeartbeat: this.lastHeartbeat,
      messageCount: this.messageHistory.length,
    };
  }

  /**
   * Get message history
   */
  getHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Disconnect from agent
   */
  disconnect(): void {
    this.connectionStatus = "disconnected";
    console.log("[Live Agent] Disconnected");
  }
}

// Singleton instance
let agentConnection: LiveAgentConnection | null = null;

/**
 * Get or create agent connection
 */
export function getAgentConnection(
  config?: LiveAgentConfig
): LiveAgentConnection {
  if (!agentConnection && config) {
    agentConnection = new LiveAgentConnection(config);
  }

  if (!agentConnection) {
    throw new Error("Agent connection not initialized");
  }

  return agentConnection;
}

/**
 * Initialize agent connection with config
 */
export function initializeAgentConnection(
  config: LiveAgentConfig
): LiveAgentConnection {
  agentConnection = new LiveAgentConnection(config);
  return agentConnection;
}

/**
 * Fallback to LLM if agent backend is unavailable
 */
export async function executeWithFallback(
  userMessage: string,
  agentConfig?: LiveAgentConfig
): Promise<LiveAgentResponse> {
  if (agentConfig) {
    try {
      const connection = getAgentConnection(agentConfig);
      return await connection.sendMessage(userMessage);
    } catch (error) {
      console.warn("[Live Agent] Falling back to LLM:", error);
    }
  }

  // Fallback to direct LLM call
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an autonomous agent. Respond with your reasoning and next actions.",
        },
        { role: "user", content: userMessage },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const message =
      typeof messageContent === "string" ? messageContent : "No response";

    return {
      success: true,
      message,
      toolsExecuted: [],
      reasoning: "Using fallback LLM",
      nextAction: "completed",
      status: "completed",
      executionTime: 0,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      message: errorMessage,
      toolsExecuted: [],
      reasoning: "",
      nextAction: "",
      status: "error",
      executionTime: 0,
    };
  }
}
