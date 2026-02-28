/**
 * Local LLM Service
 * Uses Ollama for offline LLM processing with cloud fallback
 * Supports Mistral, Llama, and other local models
 */

import { offlineConfig } from '../config/offlineConfig';
import { invokeLLM } from '../_core/llm';

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
  source: 'ollama' | 'openai' | 'anthropic' | 'error';
  executionTime: number;
}

class LocalLLMService {
  private ollamaUrl: string;
  private ollamaModel: string;
  private ollamaPort: number;
  private fallbackEnabled: boolean;
  private requestTimeout: number;

  constructor() {
    const config = offlineConfig;

    if (config.llm.ollama) {
      this.ollamaUrl = config.llm.ollama.baseUrl;
      this.ollamaModel = config.llm.ollama.model;
      this.ollamaPort = config.llm.ollama.port;
    } else {
      this.ollamaUrl = 'http://localhost';
      this.ollamaModel = 'mistral';
      this.ollamaPort = 11434;
    }

    this.fallbackEnabled = config.llm.fallback === 'cloud';
    this.requestTimeout = config.llm.timeout || 30000;
  }

  /**
   * Check if Ollama is available
   */
  async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}:${this.ollamaPort}/api/tags`, {
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.warn('[LocalLLM] Ollama not available:', error);
      return false;
    }
  }

  /**
   * Invoke local LLM via Ollama
   */
  async invokeOllama(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.ollamaUrl}:${this.ollamaPort}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: this.formatPrompt(request.messages),
          stream: false,
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 512,
        }),
        signal: AbortSignal.timeout(this.requestTimeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.response || '',
        model: this.ollamaModel,
        tokensUsed: data.eval_count || 0,
        source: 'ollama',
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[LocalLLM] Ollama invocation error:', error);
      throw error;
    }
  }

  /**
   * Invoke cloud LLM as fallback
   */
  async invokeCloudLLM(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await invokeLLM({
        messages: request.messages,
        temperature: request.temperature,
      });

      const content =
        response.choices?.[0]?.message?.content || 'No response from cloud LLM';

      return {
        content,
        model: 'cloud-llm',
        source: 'openai',
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[LocalLLM] Cloud LLM fallback error:', error);
      throw error;
    }
  }

  /**
   * Main invoke method with fallback logic
   */
  async invoke(request: LLMRequest): Promise<LLMResponse> {
    try {
      // Try Ollama first
      const ollamaAvailable = await this.isOllamaAvailable();

      if (ollamaAvailable) {
        try {
          return await this.invokeOllama(request);
        } catch (error) {
          console.warn('[LocalLLM] Ollama failed, trying fallback:', error);

          if (this.fallbackEnabled) {
            try {
              return await this.invokeCloudLLM(request);
            } catch (fallbackError) {
              console.error('[LocalLLM] Cloud fallback also failed:', fallbackError);
              throw new Error('All LLM services failed');
            }
          }

          throw error;
        }
      } else {
        // Ollama not available, try cloud if enabled
        if (this.fallbackEnabled) {
          return await this.invokeCloudLLM(request);
        }

        throw new Error('Ollama not available and cloud fallback disabled');
      }
    } catch (error) {
      console.error('[LocalLLM] Invoke error:', error);
      throw error;
    }
  }

  /**
   * Format messages into Ollama prompt format
   */
  private formatPrompt(messages: LLMRequest['messages']): string {
    return messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaUrl}:${this.ollamaPort}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('[LocalLLM] Error fetching models:', error);
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}:${this.ollamaPort}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      });

      return response.ok;
    } catch (error) {
      console.error('[LocalLLM] Error pulling model:', error);
      return false;
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<{
    ollamaAvailable: boolean;
    currentModel: string;
    fallbackEnabled: boolean;
    availableModels: string[];
  }> {
    const ollamaAvailable = await this.isOllamaAvailable();
    const availableModels = ollamaAvailable ? await this.getAvailableModels() : [];

    return {
      ollamaAvailable,
      currentModel: this.ollamaModel,
      fallbackEnabled: this.fallbackEnabled,
      availableModels,
    };
  }
}

export const localLLMService = new LocalLLMService();
