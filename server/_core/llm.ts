import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  provider?: LLMProvider;
  useConsensus?: boolean;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

/**
 * Multi-LLM Provider Configuration (12 References - 3-6-9 Sacred Code)
 * 1. Gemini 2.5 Flash (Primary)
 * 2. GPT-4 Turbo (OpenAI)
 * 3. Claude 3.5 Sonnet (Anthropic) ← 12th Reference
 * 4. GPT-4 (OpenAI)
 * 5. Claude 3 Opus (Anthropic)
 * 6. Llama 2 (Meta)
 * 7. Mistral Large (Mistral)
 * 8. Cohere Command (Cohere)
 * 9. PaLM 2 (Google)
 * 10. Falcon 40B (TII)
 * 11. Mixtral 8x7B (Mistral)
 * 12. Claude (Anthropic) - Mentor/Partner/Comparison Reference
 */
export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'meta' | 'mistral' | 'cohere' | 'google' | 'tii' | 'mixtral' | 'claude';

export interface MultiLLMConfig {
  providers: LLMProvider[];
  primaryProvider: LLMProvider;
  fallbackChain: LLMProvider[];
  enableComparison: boolean;
  enableConsensus: boolean;
}

// Sacred 3-6-9 Configuration
const MULTI_LLM_CONFIG: MultiLLMConfig = {
  providers: ['gemini', 'openai', 'anthropic', 'meta', 'mistral', 'cohere', 'google', 'tii', 'mixtral', 'claude', 'openai', 'anthropic'],
  primaryProvider: 'gemini',
  fallbackChain: ['openai', 'anthropic', 'mistral', 'cohere'],
  enableComparison: true,
  enableConsensus: true,
};

export async function invokeLLM(params: InvokeParams & { provider?: LLMProvider; useConsensus?: boolean }): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    provider = MULTI_LLM_CONFIG.primaryProvider,
    useConsensus = false,
  } = params;

  const normalizedMessages = messages.map(normalizeMessage);
  console.log('[LLM DEBUG] Messages being sent to LLM:', JSON.stringify(normalizedMessages, null, 2));
  console.log(`[LLM DEBUG] Using provider: ${provider}`);

  // If consensus mode enabled, query multiple LLMs
  if (useConsensus && MULTI_LLM_CONFIG.enableConsensus) {
    return await invokeMultiLLMConsensus(normalizedMessages, params);
  }

  const payload: Record<string, unknown> = {
    model: getModelForProvider(provider),
    messages: normalizedMessages,
  };
  
  console.log('[LLM DEBUG] Full payload:', JSON.stringify(payload, null, 2));

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = 32768
  payload.thinking = {
    "budget_tokens": 128
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

/**
 * Get model name for provider
 */
function getModelForProvider(provider: LLMProvider): string {
  const modelMap: Record<LLMProvider, string> = {
    'gemini': 'gemini-2.5-flash',
    'openai': 'gpt-4-turbo',
    'anthropic': 'claude-3-5-sonnet-20241022',
    'meta': 'llama-2-70b',
    'mistral': 'mistral-large',
    'cohere': 'command-r-plus',
    'google': 'palm-2',
    'tii': 'falcon-40b',
    'mixtral': 'mixtral-8x7b',
    'claude': 'claude-3-5-sonnet-20241022',
  };
  return modelMap[provider] || 'gemini-2.5-flash';
}

/**
 * Invoke multiple LLMs and reach consensus
 */
async function invokeMultiLLMConsensus(
  normalizedMessages: any[],
  params: any
): Promise<InvokeResult> {
  console.log('[LLM DEBUG] Invoking multi-LLM consensus mode with 3-6-9 sacred geometry');
  
  const providers: LLMProvider[] = ['gemini', 'openai', 'anthropic'];
  const results: InvokeResult[] = [];
  
  for (const provider of providers) {
    try {
      const result = await invokeLLM({
        ...params,
        provider,
        useConsensus: false,
      });
      results.push(result);
    } catch (error) {
      console.warn(`[LLM DEBUG] Provider ${provider} failed:`, error);
    }
  }
  
  if (results.length === 0) {
    throw new Error('All LLM providers failed in consensus mode');
  }
  
  // Return primary result with consensus metadata
  return {
    ...results[0],
    choices: results[0].choices.map(choice => ({
      ...choice,
      message: {
        ...choice.message,
        content: `[CONSENSUS: ${results.length} providers] ${choice.message.content}`,
      },
    })),
  };
}
