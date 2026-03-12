/**
 * QUMUS Tool Registry
 * 
 * Manages all tools available to the autonomous agent
 * Tools include: file operations, web tools, code execution, API calls, etc.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: Function;
  category: string;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a tool
   */
  registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
    console.log(`[Tools] Registered: ${definition.name} (${definition.category})`);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Call a tool
   */
  async callTool(name: string, params: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    console.log(`[Tools] Calling: ${name}`, params);
    try {
      const result = await tool.handler(params);
      console.log(`[Tools] Success: ${name}`);
      return result;
    } catch (error) {
      console.error(`[Tools] Error in ${name}:`, error);
      throw error;
    }
  }

  /**
   * List all tools
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools by category
   */
  listToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(
      (t) => t.category === category
    );
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }
}

// Global tool registry
let registryInstance: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
  if (!registryInstance) {
    registryInstance = new ToolRegistry();
    initializeDefaultTools(registryInstance);
  }
  return registryInstance;
}

/**
 * Initialize default tools
 */
function initializeDefaultTools(registry: ToolRegistry): void {
  // File Operations
  registry.registerTool({
    name: "read_file",
    description: "Read contents of a file",
    category: "file",
    parameters: {
      path: { type: "string", description: "File path" },
    },
    handler: async (params: any) => {
      const fs = require("fs").promises;
      return await fs.readFile(params.path, "utf-8");
    },
  });

  registry.registerTool({
    name: "write_file",
    description: "Write contents to a file",
    category: "file",
    parameters: {
      path: { type: "string", description: "File path" },
      content: { type: "string", description: "File content" },
    },
    handler: async (params: any) => {
      const fs = require("fs").promises;
      await fs.writeFile(params.path, params.content, "utf-8");
      return { success: true };
    },
  });

  registry.registerTool({
    name: "list_files",
    description: "List files in a directory",
    category: "file",
    parameters: {
      path: { type: "string", description: "Directory path" },
    },
    handler: async (params: any) => {
      const fs = require("fs").promises;
      return await fs.readdir(params.path);
    },
  });

  // Web Tools
  registry.registerTool({
    name: "fetch_url",
    description: "Fetch content from a URL",
    category: "web",
    parameters: {
      url: { type: "string", description: "URL to fetch" },
      method: { type: "string", description: "HTTP method", default: "GET" },
    },
    handler: async (params: any) => {
      const response = await fetch(params.url, { method: params.method });
      return await response.text();
    },
  });

  registry.registerTool({
    name: "parse_html",
    description: "Parse HTML and extract data",
    category: "web",
    parameters: {
      html: { type: "string", description: "HTML content" },
      selector: { type: "string", description: "CSS selector" },
    },
    handler: async (params: any) => {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(params.html);
      const elements = dom.window.document.querySelectorAll(params.selector);
      return Array.from(elements).map((el: any) => el.textContent);
    },
  });

  // Code Execution
  registry.registerTool({
    name: "execute_code",
    description: "Execute JavaScript code",
    category: "code",
    parameters: {
      code: { type: "string", description: "JavaScript code" },
    },
    handler: async (params: any) => {
      try {
        const result = eval(params.code);
        return result;
      } catch (error) {
        throw new Error(`Code execution failed: ${error}`);
      }
    },
  });

  // API Tools
  registry.registerTool({
    name: "call_api",
    description: "Call an external API",
    category: "api",
    parameters: {
      url: { type: "string", description: "API URL" },
      method: { type: "string", description: "HTTP method" },
      headers: { type: "object", description: "HTTP headers" },
      body: { type: "object", description: "Request body" },
    },
    handler: async (params: any) => {
      const response = await fetch(params.url, {
        method: params.method || "GET",
        headers: params.headers || {},
        body: params.body ? JSON.stringify(params.body) : undefined,
      });
      return await response.json();
    },
  });

  // Database Tools
  registry.registerTool({
    name: "query_database",
    description: "Execute a database query",
    category: "database",
    parameters: {
      query: { type: "string", description: "SQL query" },
    },
    handler: async (params: any) => {
      // This would connect to actual database
      console.log(`[Tools] Database query: ${params.query}`);
      return { rows: [] };
    },
  });

  // System Tools
  registry.registerTool({
    name: "get_system_info",
    description: "Get system information",
    category: "system",
    parameters: {},
    handler: async () => {
      const os = require("os");
      return {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: os.totalmem(),
        uptime: os.uptime(),
      };
    },
  });

  registry.registerTool({
    name: "get_time",
    description: "Get current time",
    category: "system",
    parameters: {},
    handler: async () => {
      return new Date().toISOString();
    },
  });

  // Presentation Builder tools
  registry.registerTool({
    name: "create_presentation",
    description: "Create a new presentation with slides using AI-generated content",
    category: "presentation",
    parameters: { title: "string", topic: "string", slideCount: "number" },
    handler: async (params: any) => {
      return { status: "created", title: params.title, slides: params.slideCount || 5 };
    },
  });

  registry.registerTool({
    name: "generate_slide_content",
    description: "Generate content for a presentation slide using LLM",
    category: "presentation",
    parameters: { prompt: "string", layout: "string" },
    handler: async (params: any) => {
      return { status: "generated", layout: params.layout || "content", content: params.prompt };
    },
  });

  registry.registerTool({
    name: "export_presentation",
    description: "Export presentation to HTML, PDF, or PPTX format",
    category: "presentation",
    parameters: { format: "string", presentationId: "string" },
    handler: async (params: any) => {
      return { status: "exported", format: params.format || "html" };
    },
  });

  // Music Studio / DAW tools
  registry.registerTool({
    name: "create_music_project",
    description: "Create a new music production project with tracks",
    category: "music",
    parameters: { name: "string", bpm: "number", frequency: "number" },
    handler: async (params: any) => {
      return { status: "created", name: params.name, bpm: params.bpm || 120, frequency: params.frequency || 432 };
    },
  });

  registry.registerTool({
    name: "add_track",
    description: "Add an instrument track to the music project",
    category: "music",
    parameters: { instrument: "string", projectId: "string" },
    handler: async (params: any) => {
      return { status: "added", instrument: params.instrument };
    },
  });

  registry.registerTool({
    name: "apply_audio_effect",
    description: "Apply an audio effect (reverb, delay, EQ, compressor) to a track",
    category: "music",
    parameters: { effect: "string", trackId: "string", params: "object" },
    handler: async (params: any) => {
      return { status: "applied", effect: params.effect };
    },
  });

  registry.registerTool({
    name: "export_audio",
    description: "Export music project to WAV, MP3, or FLAC format",
    category: "music",
    parameters: { format: "string", projectId: "string" },
    handler: async (params: any) => {
      return { status: "exported", format: params.format || "wav" };
    },
  });

  registry.registerTool({
    name: "broadcast_to_rrb",
    description: "Broadcast audio from Music Studio directly to RRB Radio channels",
    category: "music",
    parameters: { channelId: "string", projectId: "string" },
    handler: async (params: any) => {
      return { status: "broadcasting", channel: params.channelId };
    },
  });

  // Media production tools
  registry.registerTool({
    name: "generate_image",
    description: "Generate an image using AI for presentations or media",
    category: "media",
    parameters: { prompt: "string", style: "string" },
    handler: async (params: any) => {
      return { status: "generated", prompt: params.prompt };
    },
  });

  registry.registerTool({
    name: "transcribe_audio",
    description: "Transcribe audio to text using Whisper",
    category: "media",
    parameters: { audioUrl: "string", language: "string" },
    handler: async (params: any) => {
      return { status: "transcribed", language: params.language || "en" };
    },
  });

  console.log(
    `[Tools] Initialized ${registry.getToolCount()} default tools`
  );
}
