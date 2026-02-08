import axios, { AxiosInstance } from 'axios';

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaConfig {
  baseUrl: string;
  defaultModel: string;
  fallbackModel: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaConfigService {
  private client: AxiosInstance;
  private config: OllamaConfig;
  private availableModels: OllamaModel[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<OllamaConfig>) {
    this.config = {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: 'llama2',
      fallbackModel: 'mistral',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });

    this.initializeHealthCheck();
  }

  /**
   * Initialize periodic health checks for Ollama service
   */
  private initializeHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth().catch(err => {
        console.error('Ollama health check failed:', err.message);
      });
    }, 60000); // Check every minute
  }

  /**
   * Check if Ollama service is healthy and available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags', {
        timeout: 5000,
      });
      this.availableModels = response.data.models || [];
      return true;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get('/api/tags');
      this.availableModels = response.data.models || [];
      return this.availableModels;
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      return [];
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await this.client.post('/api/show', {
        name: modelName,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get info for model ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      await this.client.post('/api/pull', {
        name: modelName,
        stream: false,
      });
      console.log(`Successfully pulled model: ${modelName}`);
      return true;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(modelName: string): Promise<boolean> {
    try {
      await this.client.delete('/api/delete', {
        data: { name: modelName },
      });
      console.log(`Successfully deleted model: ${modelName}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Chat with a model
   */
  async chat(
    messages: ChatMessage[],
    modelName?: string
  ): Promise<ChatResponse | null> {
    const model = modelName || this.config.defaultModel;

    try {
      const response = await this.client.post('/api/chat', {
        model,
        messages,
        stream: false,
      });
      return response.data;
    } catch (error) {
      console.error(`Chat failed with model ${model}:`, error);
      
      // Try fallback model if primary fails
      if (model !== this.config.fallbackModel) {
        console.log(`Attempting fallback with ${this.config.fallbackModel}...`);
        return this.chat(messages, this.config.fallbackModel);
      }
      
      return null;
    }
  }

  /**
   * Stream chat response
   */
  async chatStream(
    messages: ChatMessage[],
    modelName?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const model = modelName || this.config.defaultModel;
    let fullResponse = '';

    try {
      const response = await this.client.post(
        '/api/chat',
        {
          model,
          messages,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  fullResponse += json.message.content;
                  if (onChunk) {
                    onChunk(json.message.content);
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve(fullResponse);
        });

        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error(`Stream chat failed with model ${model}:`, error);
      
      // Try fallback model if primary fails
      if (model !== this.config.fallbackModel) {
        console.log(`Attempting fallback stream with ${this.config.fallbackModel}...`);
        return this.chatStream(messages, this.config.fallbackModel, onChunk);
      }
      
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(text: string, modelName?: string): Promise<number[] | null> {
    const model = modelName || this.config.defaultModel;

    try {
      const response = await this.client.post('/api/embeddings', {
        model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      console.error(`Embeddings generation failed with model ${model}:`, error);
      return null;
    }
  }

  /**
   * Generate text completion
   */
  async generateCompletion(
    prompt: string,
    modelName?: string
  ): Promise<string | null> {
    const model = modelName || this.config.defaultModel;

    try {
      const response = await this.client.post('/api/generate', {
        model,
        prompt,
        stream: false,
      });
      return response.data.response;
    } catch (error) {
      console.error(`Text generation failed with model ${model}:`, error);
      
      // Try fallback model if primary fails
      if (model !== this.config.fallbackModel) {
        console.log(`Attempting fallback with ${this.config.fallbackModel}...`);
        return this.generateCompletion(prompt, this.config.fallbackModel);
      }
      
      return null;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    isHealthy: boolean;
    baseUrl: string;
    availableModels: string[];
    defaultModel: string;
    fallbackModel: string;
  }> {
    const isHealthy = await this.checkHealth();
    return {
      isHealthy,
      baseUrl: this.config.baseUrl,
      availableModels: this.availableModels.map(m => m.name),
      defaultModel: this.config.defaultModel,
      fallbackModel: this.config.fallbackModel,
    };
  }
}

// Singleton instance
let ollamaService: OllamaConfigService | null = null;

export function getOllamaService(): OllamaConfigService {
  if (!ollamaService) {
    ollamaService = new OllamaConfigService();
  }
  return ollamaService;
}

export function initializeOllama(config?: Partial<OllamaConfig>): OllamaConfigService {
  ollamaService = new OllamaConfigService(config);
  return ollamaService;
}
