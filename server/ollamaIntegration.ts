/**
 * Ollama Integration Service
 * Connects QUMUS to local Ollama server for LLM inference
 */

import axios, { AxiosInstance } from 'axios';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  repeatPenalty?: number;
  numPredict?: number;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  model: string;
  createdAt: string;
  message: OllamaMessage;
  done: boolean;
  totalDuration: number;
  loadDuration: number;
  promptEvalCount: number;
  promptEvalDuration: number;
  evalCount: number;
  evalDuration: number;
}

export interface OllamaEmbeddingResponse {
  embedding: number[];
}

export interface OllamaModelInfo {
  name: string;
  modifiedAt: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameterSize: string;
    quantizationLevel: string;
  };
}

export class OllamaService {
  private client: AxiosInstance;
  private config: OllamaConfig;
  private isHealthy: boolean = false;

  constructor(config: Partial<OllamaConfig> = {}) {
    const baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    this.config = {
      baseUrl,
      model: config.model || process.env.OLLAMA_MODEL || 'llama2',
      temperature: config.temperature ?? 0.7,
      topK: config.topK ?? 40,
      topP: config.topP ?? 0.9,
      repeatPenalty: config.repeatPenalty ?? 1.1,
      numPredict: config.numPredict ?? 128,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 60000,
    });

    this.initializeHealth();
  }

  /**
   * Check Ollama server health
   */
  private async initializeHealth(): Promise<void> {
    try {
      await this.client.get('/api/tags');
      this.isHealthy = true;
      console.log('[Ollama] Server is healthy and ready');
    } catch (error) {
      this.isHealthy = false;
      console.warn('[Ollama] Server is not responding. Will retry on next request.');
    }
  }

  /**
   * Check if Ollama server is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      this.isHealthy = response.status === 200;
      return this.isHealthy;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('[Ollama] Error listing models:', error);
      return [];
    }
  }

  /**
   * Chat with Ollama
   */
  async chat(messages: OllamaMessage[]): Promise<string> {
    try {
      const response = await this.client.post('/api/chat', {
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          top_k: this.config.topK,
          top_p: this.config.topP,
          repeat_penalty: this.config.repeatPenalty,
          num_predict: this.config.numPredict,
        },
      });

      return response.data.message.content;
    } catch (error) {
      console.error('[Ollama] Chat error:', error);
      throw new Error('Failed to get response from Ollama');
    }
  }

  /**
   * Stream chat response
   */
  async *chatStream(messages: OllamaMessage[]): AsyncGenerator<string> {
    try {
      const response = await this.client.post(
        '/api/chat',
        {
          model: this.config.model,
          messages,
          stream: true,
          options: {
            temperature: this.config.temperature,
            top_k: this.config.topK,
            top_p: this.config.topP,
            repeat_penalty: this.config.repeatPenalty,
            num_predict: this.config.numPredict,
          },
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const line = chunk.toString().trim();
        if (line) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              yield json.message.content;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('[Ollama] Stream error:', error);
      throw new Error('Failed to stream response from Ollama');
    }
  }

  /**
   * Generate embeddings
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.post('/api/embeddings', {
        model: this.config.model,
        prompt: text,
      });

      return response.data.embedding;
    } catch (error) {
      console.error('[Ollama] Embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Pull a model from Ollama library
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      await this.client.post(
        '/api/pull',
        { name: modelName },
        { responseType: 'stream' }
      );
      console.log(`[Ollama] Successfully pulled model: ${modelName}`);
    } catch (error) {
      console.error('[Ollama] Pull error:', error);
      throw new Error(`Failed to pull model: ${modelName}`);
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(modelName: string): Promise<void> {
    try {
      await this.client.delete('/api/delete', {
        data: { name: modelName },
      });
      console.log(`[Ollama] Successfully deleted model: ${modelName}`);
    } catch (error) {
      console.error('[Ollama] Delete error:', error);
      throw new Error(`Failed to delete model: ${modelName}`);
    }
  }

  /**
   * Generate text completion
   */
  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.client.post('/api/generate', {
        model: this.config.model,
        prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          top_k: this.config.topK,
          top_p: this.config.topP,
          repeat_penalty: this.config.repeatPenalty,
          num_predict: this.config.numPredict,
        },
      });

      return response.data.response;
    } catch (error) {
      console.error('[Ollama] Generate error:', error);
      throw new Error('Failed to generate text');
    }
  }

  /**
   * Stream text generation
   */
  async *generateStream(prompt: string): AsyncGenerator<string> {
    try {
      const response = await this.client.post(
        '/api/generate',
        {
          model: this.config.model,
          prompt,
          stream: true,
          options: {
            temperature: this.config.temperature,
            top_k: this.config.topK,
            top_p: this.config.topP,
            repeat_penalty: this.config.repeatPenalty,
            num_predict: this.config.numPredict,
          },
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const line = chunk.toString().trim();
        if (line) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              yield json.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('[Ollama] Stream generate error:', error);
      throw new Error('Failed to stream generation');
    }
  }

  /**
   * Get model info
   */
  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await this.client.post('/api/show', {
        name: modelName,
      });
      return response.data;
    } catch (error) {
      console.error('[Ollama] Get model info error:', error);
      throw new Error(`Failed to get info for model: ${modelName}`);
    }
  }

  /**
   * Check if server is healthy
   */
  isServerHealthy(): boolean {
    return this.isHealthy;
  }

  /**
   * Get current config
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const ollamaService = new OllamaService({
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama2',
});
