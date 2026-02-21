/**
 * Stream Proxy Service
 * Properly streams external audio without buffering entire stream
 * Supports live streams and on-demand audio
 */

import { Readable } from 'stream';

export class StreamProxyService {
  /**
   * Proxy a stream URL and pipe it to response
   * Supports live streams by forwarding chunks instead of buffering
   */
  static async proxyStreamToResponse(
    url: string,
    response: any
  ): Promise<void> {
    try {
      // Fetch the stream with proper timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const streamResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);

      if (!streamResponse.ok) {
        throw new Error(`Stream request failed: ${streamResponse.statusText}`);
      }

      // Set response headers for audio streaming
      response.setHeader('Content-Type', streamResponse.headers.get('content-type') || 'audio/mpeg');
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', '0');
      response.setHeader('Connection', 'keep-alive');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Headers', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      // Forward Icecast/Shoutcast headers if present
      const icyMetaint = streamResponse.headers.get('icy-metaint');
      if (icyMetaint) {
        response.setHeader('icy-metaint', icyMetaint);
      }

      const icyName = streamResponse.headers.get('icy-name');
      if (icyName) {
        response.setHeader('icy-name', icyName);
      }

      const icyGenre = streamResponse.headers.get('icy-genre');
      if (icyGenre) {
        response.setHeader('icy-genre', icyGenre);
      }

      // Pipe the stream to response (streams chunks, doesn't buffer entire file)
      if (streamResponse.body) {
        // Convert Web ReadableStream to Node.js stream
        const nodeStream = Readable.fromWeb(streamResponse.body as any);
        
        nodeStream.pipe(response);

        // Handle errors
        nodeStream.on('error', (error: any) => {
          console.error('Stream read error:', error);
          if (!response.headersSent) {
            response.status(500).json({ error: 'Stream error' });
          } else {
            response.end();
          }
        });

        response.on('error', (error: any) => {
          console.error('Response write error:', error);
          nodeStream.destroy();
        });
      } else {
        response.end();
      }
    } catch (error) {
      console.error('Stream proxy error:', error);
      if (!response.headersSent) {
        response.status(500).json({ error: 'Failed to proxy stream' });
      } else {
        response.end();
      }
    }
  }

  /**
   * Validate if a stream URL is accessible
   */
  static async validateStream(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
