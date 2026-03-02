/**
 * Video API Service - Integrates with Synthesia, D-ID, and Runway ML
 * Handles video generation, status tracking, and result retrieval
 */

interface VideoGenerationRequest {
  prompt: string;
  duration: number;
  style: 'cinematic' | 'animated' | 'motion-graphics' | 'documentary';
  resolution: '720p' | '1080p' | '4k';
}

interface VideoGenerationResponse {
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
  progress: number;
}

/**
 * Synthesia API Integration
 */
export class SynthesiaAPI {
  private apiKey: string;
  private baseUrl = 'https://api.synthesia.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SYNTHESIA_API_KEY || '';
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId: `synthesia-${Date.now()}`,
        status: 'failed',
        error: 'Synthesia API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: request.prompt.substring(0, 100),
          description: request.prompt,
          duration: request.duration,
          resolution: request.resolution,
          style: request.style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Synthesia API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: data.status || 'processing',
        url: data.url,
        progress: 0,
      };
    } catch (error) {
      return {
        videoId: '',
        status: 'failed',
        error: `Synthesia error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId,
        status: 'failed',
        error: 'Synthesia API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Synthesia API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: data.status,
        url: data.url,
        progress: data.progress || 0,
      };
    } catch (error) {
      return {
        videoId,
        status: 'failed',
        error: `Synthesia error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }
}

/**
 * D-ID API Integration
 */
export class DIDAPI {
  private apiKey: string;
  private baseUrl = 'https://api.d-id.com/talks';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DID_API_KEY || '';
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId: `did-${Date.now()}`,
        status: 'failed',
        error: 'D-ID API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: request.prompt,
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-AriaNeural',
            },
          },
          config: {
            fluent: true,
            pad_audio: 0.0,
            resolution: request.resolution === '4k' ? 1080 : parseInt(request.resolution),
            duration: request.duration,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: 'processing',
        url: data.result_url,
        progress: 0,
      };
    } catch (error) {
      return {
        videoId: '',
        status: 'failed',
        error: `D-ID error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId,
        status: 'failed',
        error: 'D-ID API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: data.status,
        url: data.result_url,
        progress: data.status === 'done' ? 100 : 50,
      };
    } catch (error) {
      return {
        videoId,
        status: 'failed',
        error: `D-ID error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }
}

/**
 * Runway ML API Integration
 */
export class RunwayMLAPI {
  private apiKey: string;
  private baseUrl = 'https://api.runwayml.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RUNWAYML_API_KEY || '';
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId: `runway-${Date.now()}`,
        status: 'failed',
        error: 'Runway ML API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/video_generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          duration: request.duration,
          resolution: request.resolution,
          model: 'gen3',
          style: request.style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Runway ML API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: 'processing',
        url: data.url,
        progress: 0,
      };
    } catch (error) {
      return {
        videoId: '',
        status: 'failed',
        error: `Runway ML error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    if (!this.apiKey) {
      return {
        videoId,
        status: 'failed',
        error: 'Runway ML API key not configured',
        progress: 0,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/video_generation/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Runway ML API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        videoId: data.id,
        status: data.status,
        url: data.url,
        progress: data.progress || 0,
      };
    } catch (error) {
      return {
        videoId,
        status: 'failed',
        error: `Runway ML error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }
}

/**
 * Multi-API Video Generation Service
 */
export class VideoAPIService {
  private synthesia: SynthesiaAPI;
  private did: DIDAPI;
  private runway: RunwayMLAPI;
  private preferredProvider: 'synthesia' | 'did' | 'runway' = 'synthesia';

  constructor() {
    this.synthesia = new SynthesiaAPI();
    this.did = new DIDAPI();
    this.runway = new RunwayMLAPI();
  }

  setPreferredProvider(provider: 'synthesia' | 'did' | 'runway') {
    this.preferredProvider = provider;
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      // Try preferred provider first
      const response = await this.getProvider(this.preferredProvider).generateVideo(request);
      if (response.status !== 'failed') {
        return response;
      }

      // Fallback to other providers
      const providers: Array<'synthesia' | 'did' | 'runway'> = ['synthesia', 'did', 'runway'];
      for (const provider of providers) {
        if (provider === this.preferredProvider) continue;
        const fallbackResponse = await this.getProvider(provider).generateVideo(request);
        if (fallbackResponse.status !== 'failed') {
          return fallbackResponse;
        }
      }

      // All providers failed
      return {
        videoId: '',
        status: 'failed',
        error: 'All video generation APIs failed',
        progress: 0,
      };
    } catch (error) {
      return {
        videoId: '',
        status: 'failed',
        error: `Video generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
      };
    }
  }

  async getVideoStatus(videoId: string, provider?: 'synthesia' | 'did' | 'runway'): Promise<VideoGenerationResponse> {
    const targetProvider = provider || this.preferredProvider;
    return this.getProvider(targetProvider).getVideoStatus(videoId);
  }

  private getProvider(provider: 'synthesia' | 'did' | 'runway'): SynthesiaAPI | DIDAPI | RunwayMLAPI {
    switch (provider) {
      case 'did':
        return this.did;
      case 'runway':
        return this.runway;
      case 'synthesia':
      default:
        return this.synthesia;
    }
  }
}

export const videoAPIService = new VideoAPIService();
