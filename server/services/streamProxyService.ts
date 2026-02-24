/**
 * Stream Proxy Service
 * Handles proxying audio streams for iOS and CORS compatibility
 */

export interface StreamProxyOptions {
  url: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class StreamProxyService {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_BUFFER_SIZE = 1024 * 1024 * 10; // 10MB

  /**
   * Get stream health status
   */
  static async checkStreamHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get stream metadata
   */
  static async getStreamMetadata(url: string) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Icy-MetaData': '1',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        return null;
      }

      return {
        contentType: response.headers.get('content-type'),
        bitrate: response.headers.get('icy-br'),
        genre: response.headers.get('icy-genre'),
        name: response.headers.get('icy-name'),
        description: response.headers.get('icy-description'),
        url: response.headers.get('icy-url'),
      };
    } catch (error) {
      console.error('Error getting stream metadata:', error);
      return null;
    }
  }
}
