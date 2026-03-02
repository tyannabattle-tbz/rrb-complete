import { invokeLLM } from "./_core/llm";
import type { Message } from "../drizzle/schema";

export interface AgentExecutionContext {
  sessionId: number;
  userId: number;
  systemPrompt: string;
  temperature: number;
  model: string;
  maxSteps: number;
}

export interface AgentResponse {
  content: string;
  toolCalls: ToolCall[];
  reasoning: string;
  status: "thinking" | "executing" | "completed" | "error";
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  id: string;
}

export interface ToolResult {
  toolId: string;
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

/**
 * Execute a single step of the agent loop
 * This connects to the LLM and processes the agent's reasoning
 */
export async function executeAgentStep(
  context: AgentExecutionContext,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  previousToolResults: ToolResult[] = []
): Promise<AgentResponse> {
  try {
    // Build the system prompt with tool definitions
    const systemPromptWithTools = buildSystemPrompt(context.systemPrompt);

    // Format previous tool results into the message history
    const formattedMessages = formatMessagesWithToolResults(
      messages,
      previousToolResults
    );

    // Call the LLM
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPromptWithTools },
        ...formattedMessages,
      ],
    });

    // Parse the response
    let content = "No response from LLM";
    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === "string") {
      content = messageContent;
    }

    // Extract tool calls from the response (simplified parsing)
    const toolCalls = parseToolCalls(content);

    return {
      content,
      toolCalls,
      reasoning: extractReasoning(content),
      status: toolCalls.length > 0 ? "executing" : "completed",
    };
  } catch (error) {
    console.error("Agent step execution failed:", error);
    return {
      content: `Error executing agent step: ${error instanceof Error ? error.message : "Unknown error"}`,
      toolCalls: [],
      reasoning: "Error occurred during execution",
      status: "error",
    };
  }
}

/**
 * Execute a tool based on the agent's request
 * This is a placeholder that would be replaced with actual tool implementations
 */
export async function executeTool(
  toolName: string,
  parameters: Record<string, any>
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    // Route to appropriate tool handler
    switch (toolName) {
      case "browser":
        return await executeBrowserTool(parameters, startTime);
      case "memory":
        return await executeMemoryTool(parameters, startTime);
      case "search":
        return await executeSearchTool(parameters, startTime);
      case "api":
        return await executeApiTool(parameters, startTime);
      default:
        return {
          toolId: parameters.id || "unknown",
          toolName,
          success: false,
          error: `Unknown tool: ${toolName}`,
          duration: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      toolId: parameters.id || "unknown",
      toolName,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Browser tool implementation
 */
async function executeBrowserTool(
  parameters: Record<string, any>,
  startTime: number
): Promise<ToolResult> {
  const action = parameters.action || "navigate";

  // Simulate browser tool execution
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    toolId: parameters.id || "browser-" + Date.now(),
    toolName: "browser",
    success: true,
    result: {
      action,
      url: parameters.url,
      status: "completed",
      content: "Page content would be returned here",
    },
    duration: Date.now() - startTime,
  };
}

/**
 * Memory tool implementation
 */
async function executeMemoryTool(
  parameters: Record<string, any>,
  startTime: number
): Promise<ToolResult> {
  const action = parameters.action || "retrieve";

  // Simulate memory tool execution
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    toolId: parameters.id || "memory-" + Date.now(),
    toolName: "memory",
    success: true,
    result: {
      action,
      key: parameters.key,
      value: parameters.value || "Retrieved value",
    },
    duration: Date.now() - startTime,
  };
}

/**
 * Search tool implementation
 */
async function executeSearchTool(
  parameters: Record<string, any>,
  startTime: number
): Promise<ToolResult> {
  // Simulate search tool execution
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    toolId: parameters.id || "search-" + Date.now(),
    toolName: "search",
    success: true,
    result: {
      query: parameters.query,
      results: [
        { title: "Result 1", url: "https://example.com/1", snippet: "..." },
        { title: "Result 2", url: "https://example.com/2", snippet: "..." },
      ],
    },
    duration: Date.now() - startTime,
  };
}

/**
 * API tool implementation
 */
async function executeApiTool(
  parameters: Record<string, any>,
  startTime: number
): Promise<ToolResult> {
  // Simulate API tool execution
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    toolId: parameters.id || "api-" + Date.now(),
    toolName: "api",
    success: true,
    result: {
      method: parameters.method || "GET",
      url: parameters.url,
      status: 200,
      data: { message: "API response data" },
    },
    duration: Date.now() - startTime,
  };
}

/**
 * Build system prompt with tool definitions
 */
function buildSystemPrompt(basePrompt: string): string {
  return `${basePrompt}

AVAILABLE TOOLS:
1. browser - Navigate and interact with web pages
   - action: navigate, screenshot, get_content, click, fill
   - url: target URL
   - selector: CSS selector for interactions

2. memory - Store and retrieve information
   - action: store, retrieve, list, delete
   - key: memory key
   - value: value to store

3. search - Search the web for information
   - query: search query
   - limit: number of results (default: 10)

4. api - Make HTTP requests to APIs
   - method: GET, POST, PUT, DELETE
   - url: API endpoint
   - headers: request headers
   - body: request body

When using tools, format your requests as:
TOOL: tool_name
PARAMETERS: {json_parameters}

Always explain your reasoning before using tools.`;
}

/**
 * Parse tool calls from LLM response
 */
function parseToolCalls(content: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  const toolPattern = /TOOL:\s*(\w+)\s*\nPARAMETERS:\s*({[\s\S]*?})/g;

  let match;
  while ((match = toolPattern.exec(content)) !== null) {
    try {
      const toolName = match[1];
      const parameters = JSON.parse(match[2]);
      toolCalls.push({
        toolName,
        parameters,
        id: `${toolName}-${Date.now()}-${Math.random()}`,
      });
    } catch (error) {
      console.error("Failed to parse tool call:", error);
    }
  }

  return toolCalls;
}

/**
 * Extract reasoning from LLM response
 */
function extractReasoning(content: string): string {
  // Extract text before the first TOOL: call
  const toolIndex = content.indexOf("TOOL:");
  if (toolIndex > 0) {
    return content.substring(0, toolIndex).trim();
  }
  return content;
}

/**
 * Format messages with tool results
 */
function formatMessagesWithToolResults(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  toolResults: ToolResult[]
): Array<{ role: "user" | "assistant" | "system"; content: string }> {
  if (toolResults.length === 0) {
    return messages;
  }

  // Add tool results as a system message
  const toolResultsMessage = {
    role: "system" as const,
    content: `Previous tool execution results:\n${toolResults
      .map(
        (r) =>
          `- ${r.toolName} (${r.success ? "success" : "failed"}): ${r.result ? JSON.stringify(r.result) : r.error}`
      )
      .join("\n")}`,
  };

  return [...messages, toolResultsMessage];
}

/**
 * Run a complete agent task
 */
export async function runAgentTask(
  context: AgentExecutionContext,
  userMessage: string,
  existingMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = []
): Promise<{
  finalResponse: string;
  allMessages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  toolExecutions: ToolResult[];
  stepsExecuted: number;
}> {
  const toolExecutions: ToolResult[] = [];
  let messages = [...existingMessages];
  let stepsExecuted = 0;

  // Add user message
  messages.push({ role: "user", content: userMessage });

  // Execute agent loop
  while (stepsExecuted < context.maxSteps) {
    stepsExecuted++;

    // Execute one step
    const stepResponse = await executeAgentStep(context, messages, toolExecutions);

    // Add assistant response
    messages.push({ role: "assistant", content: stepResponse.content });

    // If no tool calls, we're done
    if (stepResponse.toolCalls.length === 0) {
      return {
        finalResponse: stepResponse.content,
        allMessages: messages,
        toolExecutions,
        stepsExecuted,
      };
    }

    // Execute tools
    for (const toolCall of stepResponse.toolCalls) {
      const result = await executeTool(toolCall.toolName, toolCall.parameters);
      toolExecutions.push(result);
    }
  }

  return {
    finalResponse: "Max steps reached",
    allMessages: messages,
    toolExecutions,
    stepsExecuted,
  };
}
