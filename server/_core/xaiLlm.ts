import { ENV } from "./env";
import type { Message, InvokeResult, InvokeParams, Tool, ToolChoice, ResponseFormat } from "./llm";

/**
 * xAI/Grok LLM Service — Ty Bat Zan AI Brain
 * 
 * Uses the xAI API (api.x.ai) with Grok models for autonomous reasoning.
 * Falls back to the built-in Forge LLM if xAI key is not configured.
 */

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const XAI_DEFAULT_MODEL = "grok-3-mini-fast";

/**
 * Check if xAI/Grok is available (key is configured)
 */
export function isXaiAvailable(): boolean {
  return !!ENV.xaiApiKey && ENV.xaiApiKey.trim().length > 0;
}

/**
 * Get xAI service status
 */
export function getXaiStatus(): {
  available: boolean;
  model: string;
  provider: string;
  keyConfigured: boolean;
} {
  return {
    available: isXaiAvailable(),
    model: XAI_DEFAULT_MODEL,
    provider: "xAI (Grok)",
    keyConfigured: !!ENV.xaiApiKey && ENV.xaiApiKey.trim().length > 0,
  };
}

/**
 * Invoke xAI/Grok LLM directly
 * Uses the same interface as invokeLLM for compatibility
 */
export async function invokeXai(params: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Tool[];
  toolChoice?: ToolChoice;
  responseFormat?: ResponseFormat;
}): Promise<InvokeResult> {
  if (!isXaiAvailable()) {
    throw new Error("xAI API key not configured. Set XAI_API_KEY in environment.");
  }

  const payload: Record<string, unknown> = {
    model: params.model || XAI_DEFAULT_MODEL,
    messages: params.messages,
    max_tokens: params.maxTokens || 4096,
    temperature: params.temperature ?? 0.7,
    stream: false,
  };

  if (params.tools && params.tools.length > 0) {
    payload.tools = params.tools;
  }

  if (params.toolChoice) {
    payload.tool_choice = params.toolChoice;
  }

  if (params.responseFormat) {
    payload.response_format = params.responseFormat;
  }

  console.log(`[xAI/Grok] Invoking ${payload.model} with ${params.messages.length} messages`);

  const response = await fetch(XAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.xaiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[xAI/Grok] API error: ${response.status} ${response.statusText} – ${errorText}`);
    throw new Error(`xAI API error: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const result = await response.json() as InvokeResult;
  console.log(`[xAI/Grok] Response received: ${result.choices?.[0]?.finish_reason || 'unknown'}, tokens: ${result.usage?.total_tokens || 'unknown'}`);
  
  return result;
}

/**
 * Smart LLM router — uses xAI/Grok when available, falls back to Forge
 * This is the primary entry point for Ty Bat Zan AI brain
 */
export async function invokeSmartLlm(params: {
  messages: Array<{ role: string; content: string }>;
  preferXai?: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{
  result: InvokeResult;
  provider: "xai" | "forge";
}> {
  // Try xAI first if available and preferred (default: prefer xAI)
  const preferXai = params.preferXai !== false;
  
  if (preferXai && isXaiAvailable()) {
    try {
      const result = await invokeXai({
        messages: params.messages,
        model: params.model,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
      });
      return { result, provider: "xai" };
    } catch (error) {
      console.warn("[xAI/Grok] Failed, falling back to Forge:", error instanceof Error ? error.message : error);
    }
  }

  // Fallback to Forge LLM
  const { invokeLLM } = await import("./llm");
  const result = await invokeLLM({
    messages: params.messages as any,
  });
  return { result, provider: "forge" };
}
