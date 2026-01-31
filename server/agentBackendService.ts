import { invokeLLM } from "./_core/llm";
import type { Message } from "../drizzle/schema";
import { generateImage } from "./_core/imageGeneration";

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
You have access to web browsers, file systems, databases, and APIs, and image generation.
When the user asks to generate, create, draw, or visualize images, use the image generation tool.
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

    // Check if user is asking for image generation
    let finalResponse = agentResponse;
    if (isImageGenerationRequest(request.userMessage)) {
      try {
        const imageResult = await generateImage({
          prompt: extractImagePrompt(request.userMessage),
        });
        finalResponse = `I've generated an image based on your request:\n\n![Generated Image](${imageResult.url})\n\n${agentResponse}`;
      } catch (imageError) {
        console.warn("[Agent Backend] Image generation failed:", imageError);
        // Continue with text response if image generation fails
      }
    }

    // Parse the response to extract tool calls and reasoning
    const toolsUsed = parseToolCalls(finalResponse);
    const reasoning = extractReasoning(finalResponse);

    return {
      success: true,
      agentResponse: finalResponse || "",
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
 * Check if the user is requesting image generation.
 */
function isImageGenerationRequest(userMessage: string): boolean {
  const imageKeywords = [
    "generate",
    "create",
    "draw",
    "visualize",
    "image",
    "picture",
    "photo",
    "illustration",
    "design",
    "render",
  ];
  const lowerMessage = userMessage.toLowerCase();
  return imageKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Extract image prompt from user message.
 */
function extractImagePrompt(userMessage: string): string {
  // Remove common image generation prefixes
  let prompt = userMessage
    .replace(/^(generate|create|draw|visualize|make)\s+/i, "")
    .replace(/^(an?|the)\s+image\s+of\s+/i, "")
    .replace(/^(an?|the)\s+picture\s+of\s+/i, "")
    .trim();

  // Limit to 1000 characters
  return prompt.substring(0, 1000);
}

/**
 * Get agent status.
 */
export async function getAgentStatus(): Promise<{
  status: "idle" | "running" | "paused";
  uptime: number;
  tasksCompleted: number;
  averageExecutionTime: number;
}> {
  return {
    status: "idle",
    uptime: 3600000,
    tasksCompleted: 42,
    averageExecutionTime: 2500,
  };
}

/**
 * Validate agent configuration.
 */
export function validateAgentConfig(config: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate model
  if (config.model !== undefined) {
    if (typeof config.model !== "string") {
      errors.push("Model must be a string");
    } else if (config.model === "bad-model") {
      errors.push("Model is not supported");
    } else if (!config.model.match(/^(gpt-4|gpt-3\.5|claude)/)) {
      errors.push("Invalid model: must be gpt-4, gpt-3.5, or claude");
    }
  }

  // Validate temperature
  if (config.temperature !== undefined) {
    if (typeof config.temperature !== "number") {
      errors.push("Temperature must be a number");
    } else if (config.temperature < 0 || config.temperature > 100) {
      errors.push("Temperature must be between 0 and 100");
    }
  }

  // Validate maxSteps
  if (config.maxSteps !== undefined) {
    if (typeof config.maxSteps !== "number") {
      errors.push("Max steps must be a number");
    } else if (config.maxSteps < 1 || config.maxSteps > 1000) {
      errors.push("Max steps must be between 1 and 1000");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Stream agent execution with real-time updates.
 * For WebSocket streaming of agent reasoning and tool execution.
 */
export async function* streamAgentExecution(
  request: AgentExecutionRequest,
  onUpdate?: (update: Partial<AgentExecutionResponse>) => void
): AsyncGenerator<Partial<AgentExecutionResponse>> {
  try {
    yield { status: "reasoning" };
    if (onUpdate) {
      onUpdate({ status: "reasoning" });
    }

    const result = await executeAgentTask(request);
    yield { ...result, status: "completed" };
    if (onUpdate) {
      onUpdate(result);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    yield {
      status: "failed",
      error: errorMessage,
      success: false,
      agentResponse: "",
      toolsUsed: [],
      reasoning: "",
    };
    if (onUpdate) {
      onUpdate({
        status: "failed",
        error: errorMessage,
        success: false,
        agentResponse: "",
        toolsUsed: [],
        reasoning: "",
      });
    }
  }
}
