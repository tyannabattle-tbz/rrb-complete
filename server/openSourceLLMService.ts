import axios from 'axios';

/**
 * Open Source LLM Service
 * Provides integration with government-grade open source LLM systems
 * Supports Ollama, LocalAI, and other open-source LLM providers
 */

interface LLMConfig {
  provider: 'ollama' | 'localai' | 'llama-cpp' | 'vllm';
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
}

export class OpenSourceLLMService {
  private config: LLMConfig;
  private client: axios.AxiosInstance;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 60000,
    });
  }

  /**
   * Chat completion with open source LLM
   */
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.post('/api/chat', {
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        top_k: this.config.topK,
        stream: false,
      });

      const latency = Date.now() - startTime;

      return {
        content: response.data.message?.content || response.data.choices?.[0]?.message?.content || '',
        model: this.config.model,
        provider: this.config.provider,
        tokens: {
          prompt: response.data.usage?.prompt_tokens || 0,
          completion: response.data.usage?.completion_tokens || 0,
          total: response.data.usage?.total_tokens || 0,
        },
        latency,
      };
    } catch (error) {
      throw new Error(`LLM chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Streaming chat completion
   */
  async *chatStream(messages: LLMMessage[]): AsyncGenerator<string> {
    try {
      const response = await this.client.post(
        '/api/chat',
        {
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
          top_k: this.config.topK,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const text = chunk.toString();
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.message?.content || json.choices?.[0]?.delta?.content || '';
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`LLM stream failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Text completion
   */
  async complete(prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.post('/api/generate', {
        model: this.config.model,
        prompt,
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
        top_p: this.config.topP,
        top_k: this.config.topK,
        stream: false,
      });

      const latency = Date.now() - startTime;

      return {
        content: response.data.response || '',
        model: this.config.model,
        provider: this.config.provider,
        tokens: {
          prompt: response.data.prompt_eval_count || 0,
          completion: response.data.eval_count || 0,
          total: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
        },
        latency,
      };
    } catch (error) {
      throw new Error(`LLM completion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Embedding generation
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.post('/api/embeddings', {
        model: this.config.model,
        prompt: text,
      });

      return response.data.embedding || [];
    } catch (error) {
      throw new Error(`Embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      throw new Error(`Failed to list models: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get model info
   */
  async getModelInfo(model: string): Promise<any> {
    try {
      const response = await this.client.post('/api/show', {
        name: model,
      });

      return {
        name: response.data.name,
        model: response.data.model,
        parameters: response.data.parameters,
        template: response.data.template,
        license: response.data.license,
      };
    } catch (error) {
      throw new Error(`Failed to get model info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Pull a model
   */
  async pullModel(model: string): Promise<void> {
    try {
      await this.client.post('/api/pull', {
        name: model,
        stream: false,
      });
    } catch (error) {
      throw new Error(`Failed to pull model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(model: string): Promise<void> {
    try {
      await this.client.delete('/api/delete', {
        data: { name: model },
      });
    } catch (error) {
      throw new Error(`Failed to delete model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Create LLM service instance
 */
export function createOpenSourceLLM(config: LLMConfig): OpenSourceLLMService {
  return new OpenSourceLLMService(config);
}

/**
 * Default Ollama configuration
 */
export const DEFAULT_OLLAMA_CONFIG: LLMConfig = {
  provider: 'ollama',
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama2',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  topK: 40,
};

/**
 * Create default Ollama service
 */
export function createOllamaService(): OpenSourceLLMService {
  return createOpenSourceLLM(DEFAULT_OLLAMA_CONFIG);
}
