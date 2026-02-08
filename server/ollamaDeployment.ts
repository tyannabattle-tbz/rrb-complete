import axios, { AxiosInstance } from 'axios';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface OllamaEmbedding {
  embedding: number[];
}

export class OllamaDeploymentService {
  private client: AxiosInstance;
  private baseUrl: string;
  private defaultModel: string;
  private availableModels: string[] = [];
  private healthCheckInterval: NodeJS.Timer | null = null;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama2') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 300000, // 5 minutes for long operations
    });
  }

  /**
   * Initialize Ollama deployment and detect available models
   */
  async initialize(): Promise<void> {
    try {
      await this.checkHealth();
      await this.detectAvailableModels();
      this.startHealthCheck();
      console.log(`[Ollama] Initialized with ${this.availableModels.length} models available`);
    } catch (error) {
      console.error('[Ollama] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if Ollama server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      console.error('[Ollama] Health check failed:', error);
      return false;
    }
  }

  /**
   * Detect available models on Ollama server
   */
  async detectAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get<{ models: OllamaModel[] }>('/api/tags');
      this.availableModels = response.data.models.map((m) => m.name);
      console.log('[Ollama] Available models:', this.availableModels);
      return this.availableModels;
    } catch (error) {
      console.error('[Ollama] Failed to detect models:', error);
      return [];
    }
  }

  /**
   * Get list of available models
   */
  getAvailableModels(): string[] {
    return this.availableModels;
  }

  /**
   * Chat completion with streaming support
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    model: string = this.defaultModel,
    streaming: boolean = true
  ): Promise<string> {
    try {
      const response = await this.client.post<OllamaResponse>('/api/chat', {
        model,
        messages,
        stream: streaming,
      });

      if (streaming) {
        // Handle streaming response
        return response.data.message.content;
      }

      return response.data.message.content;
    } catch (error) {
      console.error('[Ollama] Chat request failed:', error);
      throw error;
    }
  }

  /**
   * Generate text completion
   */
  async generate(
    prompt: string,
    model: string = this.defaultModel,
    options?: Record<string, unknown>
  ): Promise<string> {
    try {
      const response = await this.client.post('/api/generate', {
        model,
        prompt,
        stream: false,
        ...options,
      });

      return response.data.response;
    } catch (error) {
      console.error('[Ollama] Generate request failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string, model: string = this.defaultModel): Promise<number[]> {
    try {
      const response = await this.client.post<OllamaEmbedding>('/api/embeddings', {
        model,
        prompt: text,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('[Ollama] Embedding request failed:', error);
      throw error;
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      await this.client.post('/api/pull', {
        name: modelName,
        stream: false,
      });

      // Refresh available models
      await this.detectAvailableModels();
      console.log(`[Ollama] Successfully pulled model: ${modelName}`);
    } catch (error) {
      console.error(`[Ollama] Failed to pull model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a model from Ollama
   */
  async deleteModel(modelName: string): Promise<void> {
    try {
      await this.client.delete('/api/delete', {
        data: { name: modelName },
      });

      // Refresh available models
      await this.detectAvailableModels();
      console.log(`[Ollama] Successfully deleted model: ${modelName}`);
    } catch (error) {
      console.error(`[Ollama] Failed to delete model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        console.warn('[Ollama] Health check failed - server may be unavailable');
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop health checks
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get Ollama server status
   */
  async getStatus(): Promise<{
    healthy: boolean;
    baseUrl: string;
    defaultModel: string;
    availableModels: string[];
    modelCount: number;
  }> {
    const healthy = await this.checkHealth();
    return {
      healthy,
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      availableModels: this.availableModels,
      modelCount: this.availableModels.length,
    };
  }
}

// Singleton instance
let ollamaService: OllamaDeploymentService | null = null;

/**
 * Get or create Ollama deployment service
 */
export function getOllamaService(): OllamaDeploymentService {
  if (!ollamaService) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const defaultModel = process.env.OLLAMA_DEFAULT_MODEL || 'llama2';
    ollamaService = new OllamaDeploymentService(baseUrl, defaultModel);
  }
  return ollamaService;
}

/**
 * Initialize Ollama service on startup
 */
export async function initializeOllama(): Promise<void> {
  try {
    const service = getOllamaService();
    await service.initialize();
    console.log('[Ollama] Service initialized successfully');
  } catch (error) {
    console.error('[Ollama] Failed to initialize service:', error);
    // Continue without Ollama - fallback to simulated responses
  }
}
