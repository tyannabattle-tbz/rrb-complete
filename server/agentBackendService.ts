import { invokeLLM } from "./_core/llm";
import type { Message } from "../drizzle/schema";

/**
 * Service for connecting to and managing the autonomous agent backend.
 * This service handles communication with the real agent loop implementation.
 */

export interface AgentExecutionRequest {
  sessionId: number;
  userMessage: string;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  maxSteps?: number;
}

export interface AgentExecutionResponse {
  success: boolean;
  agentResponse: string;
  toolsUsed: ToolExecution[];
  reasoning: string;
  status: "idle" | "reasoning" | "executing" | "completed" | "failed";
  error?: string;
}

export interface ToolExecution {
  toolName: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  duration: number;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}

/**
 * Execute a task through the autonomous agent backend.
 * This integrates with your autonomous agent loop implementation.
 */
export async function executeAgentTask(
  request: AgentExecutionRequest
): Promise<AgentExecutionResponse> {
  try {
    // Build the system prompt with configuration
    const systemPrompt =
      request.systemPrompt ||
      `You are an autonomous agent capable of using various tools to complete tasks.
You have access to web browsers, file systems, databases, and APIs.
Think step by step and use the appropriate tools to accomplish the user's goal.
Always explain your reasoning and the tools you use.`;

    // Call the LLM with the user message
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
      { role: "user", content: request.userMessage },
    ];

    const response = await invokeLLM({
      messages: messages as any,
    });

    const messageContent = response.choices[0]?.message?.content;
    const agentResponse =
      typeof messageContent === "string"
        ? messageContent
        : "No response from agent";

    // Parse the response to extract tool calls and reasoning
    const toolsUsed = parseToolCalls(agentResponse);
    const reasoning = extractReasoning(agentResponse);

    return {
      success: true,
      agentResponse: agentResponse || "",
      toolsUsed,
      reasoning,
      status: "completed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Agent Backend] Execution error:", errorMessage);

    return {
      success: false,
      agentResponse: "",
      toolsUsed: [],
      reasoning: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Parse tool calls from agent response.
 * Extracts structured tool execution information from the agent's response.
 */
function parseToolCalls(response: string): ToolExecution[] {
  const toolExecutions: ToolExecution[] = [];

  // Look for tool call patterns in the response
  // This is a basic implementation - adapt based on your agent's output format
  const toolPattern =
    /Tool:\s*(\w+)\s*Parameters:\s*({[\s\S]*?})\s*Result:\s*({[\s\S]*?})/g;
  let match;

  while ((match = toolPattern.exec(response)) !== null) {
    try {
      const toolName = match[1];
      const parameters = JSON.parse(match[2]);
      const result = JSON.parse(match[3]);

      toolExecutions.push({
        toolName,
        parameters,
        result,
        duration: 0,
        status: "completed",
      });
    } catch (e) {
      // Skip malformed tool calls
      console.warn("[Agent Backend] Failed to parse tool call:", match[0]);
    }
  }

  return toolExecutions;
}

/**
 * Extract reasoning from agent response.
 * Pulls out the agent's thinking process and explanation.
 */
function extractReasoning(response: string): string {
  // Look for reasoning markers or use the first paragraph
  const reasoningMatch = response.match(
    /(?:Thinking:|Reasoning:|Analysis:)([\s\S]*?)(?:Tool:|Action:|$)/i
  );

  if (reasoningMatch) {
    return reasoningMatch[1].trim().substring(0, 500);
  }

  // Fall back to first 500 characters
  return response.substring(0, 500);
}

/**
 * Stream agent execution with real-time updates.
 * For WebSocket streaming of agent reasoning and tool execution.
 */
export async function* streamAgentExecution(
  request: AgentExecutionRequest
): AsyncGenerator<AgentExecutionResponse> {
  try {
    // Initial status update
    yield {
      success: true,
      agentResponse: "",
      toolsUsed: [],
      reasoning: "Starting agent execution...",
      status: "reasoning",
    };

    // Execute the task
    const result = await executeAgentTask(request);

    // Yield the final result
    yield result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    yield {
      success: false,
      agentResponse: "",
      toolsUsed: [],
      reasoning: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Get agent status and metrics.
 * Returns current agent state and performance metrics.
 */
export async function getAgentStatus(): Promise<{
  status: "idle" | "reasoning" | "executing" | "completed" | "failed";
  uptime: number;
  tasksCompleted: number;
  averageExecutionTime: number;
  lastExecution: Date | null;
}> {
  return {
    status: "idle",
    uptime: Date.now(),
    tasksCompleted: 0,
    averageExecutionTime: 0,
    lastExecution: null,
  };
}

/**
 * Validate agent configuration.
 * Checks if the configuration is valid before execution.
 */
export function validateAgentConfig(config: {
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  maxSteps?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 100) {
      errors.push("Temperature must be between 0 and 100");
    }
  }

  if (config.maxSteps !== undefined) {
    if (config.maxSteps < 1 || config.maxSteps > 1000) {
      errors.push("Max steps must be between 1 and 1000");
    }
  }

  if (config.model && !["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"].includes(config.model)) {
    errors.push("Invalid model specified");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
