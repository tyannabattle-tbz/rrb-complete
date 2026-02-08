import axios from 'axios';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  topK: number;
  topP: number;
  repeatPenalty: number;
}

export interface OllamaModel {
  name: string;
  size: string;
  digest: string;
  modifiedAt: string;
}

const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama2',
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  repeatPenalty: 1.1,
};

let currentConfig = { ...DEFAULT_CONFIG };
let isOllamaAvailable = false;

export async function initializeOllama(): Promise<boolean> {
  try {
    const response = await axios.get(`${currentConfig.baseUrl}/api/tags`, {
      timeout: 5000,
    });
    
    if (response.status === 200 && response.data.models) {
      isOllamaAvailable = true;
      console.log(`[Ollama] Connected successfully. Available models: ${response.data.models.length}`);
      
      // Log available models
      response.data.models.forEach((model: OllamaModel) => {
        console.log(`  - ${model.name} (${model.size})`);
      });
      
      return true;
    }
  } catch (error) {
    console.warn(`[Ollama] Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.warn(`[Ollama] Falling back to simulated responses`);
    isOllamaAvailable = false;
  }
  
  return false;
}

export function getOllamaConfig(): OllamaConfig {
  return { ...currentConfig };
}

export function setOllamaConfig(config: Partial<OllamaConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  console.log(`[Ollama] Configuration updated:`, currentConfig);
}

export function isOllamaConnected(): boolean {
  return isOllamaAvailable;
}

export async function generateWithOllama(
  prompt: string,
  options?: Partial<OllamaConfig>
): Promise<string> {
  const config = { ...currentConfig, ...options };
  
  if (!isOllamaAvailable) {
    console.warn('[Ollama] Not connected, returning simulated response');
    return generateSimulatedResponse(prompt);
  }
  
  try {
    const response = await axios.post(
      `${config.baseUrl}/api/generate`,
      {
        model: config.model,
        prompt,
        temperature: config.temperature,
        top_k: config.topK,
        top_p: config.topP,
        repeat_penalty: config.repeatPenalty,
        stream: false,
      },
      { timeout: 30000 }
    );
    
    return response.data.response || '';
  } catch (error) {
    console.error('[Ollama] Generation failed:', error instanceof Error ? error.message : 'Unknown error');
    return generateSimulatedResponse(prompt);
  }
}

export async function generateWithOllamaStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  options?: Partial<OllamaConfig>
): Promise<void> {
  const config = { ...currentConfig, ...options };
  
  if (!isOllamaAvailable) {
    console.warn('[Ollama] Not connected, using simulated streaming');
    const response = generateSimulatedResponse(prompt);
    for (const char of response) {
      onChunk(char);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return;
  }
  
  try {
    const response = await axios.post(
      `${config.baseUrl}/api/generate`,
      {
        model: config.model,
        prompt,
        temperature: config.temperature,
        top_k: config.topK,
        top_p: config.topP,
        repeat_penalty: config.repeatPenalty,
        stream: true,
      },
      {
        timeout: 60000,
        responseType: 'stream',
      }
    );
    
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        try {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.trim()) {
              const json = JSON.parse(line);
              if (json.response) {
                onChunk(json.response);
              }
            }
          }
        } catch (error) {
          console.error('[Ollama] Stream parsing error:', error);
        }
      });
      
      response.data.on('end', () => resolve());
      response.data.on('error', reject);
    });
  } catch (error) {
    console.error('[Ollama] Streaming failed:', error instanceof Error ? error.message : 'Unknown error');
    const response = generateSimulatedResponse(prompt);
    for (const char of response) {
      onChunk(char);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

function generateSimulatedResponse(prompt: string): string {
  const responses: { [key: string]: string } = {
    'broadcast': 'I\'ll help you schedule a broadcast. Let me set up the content and timing for your next show.',
    'schedule': 'Creating a new broadcast schedule with your specifications. This will be added to the calendar.',
    'music': 'Loading your music library. I can help you select tracks and create playlists for your broadcast.',
    'commercial': 'Adding commercial breaks to your broadcast. I\'ll insert them at optimal times for maximum engagement.',
    'analytics': 'Pulling up real-time analytics for your broadcasts. Here are the key metrics and viewer insights.',
    'stream': 'Initializing streaming connection. Your broadcast will be live across all platforms shortly.',
    'recording': 'Starting broadcast recording. This will be saved for VOD and archive purposes.',
    'default': 'Processing your request. I\'m analyzing the command and preparing the appropriate response for your broadcast system.',
  };
  
  const lowerPrompt = prompt.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowerPrompt.includes(key)) {
      return response;
    }
  }
  
  return responses.default;
}

export async function listAvailableModels(): Promise<OllamaModel[]> {
  try {
    const response = await axios.get(`${currentConfig.baseUrl}/api/tags`, {
      timeout: 5000,
    });
    return response.data.models || [];
  } catch (error) {
    console.error('[Ollama] Failed to list models:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function pullModel(modelName: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `${currentConfig.baseUrl}/api/pull`,
      { name: modelName },
      { timeout: 300000 } // 5 minute timeout for pulling models
    );
    
    if (response.status === 200) {
      console.log(`[Ollama] Successfully pulled model: ${modelName}`);
      return true;
    }
  } catch (error) {
    console.error(`[Ollama] Failed to pull model ${modelName}:`, error instanceof Error ? error.message : 'Unknown error');
  }
  
  return false;
}
