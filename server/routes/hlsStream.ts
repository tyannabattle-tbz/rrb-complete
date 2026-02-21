/**
 * HLS Stream Routes
 * Provides HLS endpoints for iOS audio playback
 */

import { Router, Request, Response } from 'express';
import { HLSStreamConverter } from '../services/hlsStreamConverter';

const router = Router();

/**
 * Get HLS playlist for a stream URL
 * GET /api/stream/hls?url=<encoded_url>
 * 
 * Returns an M3U8 playlist that iOS Safari can play
 */
router.get('/hls', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Stream URL is required' });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);

    // Validate it's a valid URL
    try {
      new URL(decodedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate and send HLS playlist
    await HLSStreamConverter.convertToHLS(decodedUrl, res);
  } catch (error) {
    console.error('HLS route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate HLS playlist' });
    }
  }
});

/**
 * Direct stream with iOS-friendly headers
 * GET /api/stream/ios?url=<encoded_url>
 * 
 * Streams audio with headers optimized for iOS
 */
router.get('/ios', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Stream URL is required' });
    }

    const decodedUrl = decodeURIComponent(url);

    // Validate URL
    try {
      new URL(decodedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fetch and stream the audio with iOS-friendly headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const streamResponse = await fetch(decodedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      },
    });

    clearTimeout(timeoutId);

    if (!streamResponse.ok) {
      throw new Error(`Stream request failed: ${streamResponse.statusText}`);
    }

    // Set iOS-friendly headers
    res.setHeader('Content-Type', streamResponse.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Connection', 'keep-alive');

    // Forward Icecast headers
    const icyMetaint = streamResponse.headers.get('icy-metaint');
    if (icyMetaint) {
      res.setHeader('icy-metaint', icyMetaint);
    }

    // Stream the response
    if (streamResponse.body) {
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(streamResponse.body as any);
      
      nodeStream.pipe(res);

      nodeStream.on('error', (error: any) => {
        console.error('Stream read error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error' });
        } else {
          res.end();
        }
      });

      res.on('error', (error: any) => {
        console.error('Response write error:', error);
        nodeStream.destroy();
      });
    } else {
      res.end();
    }
  } catch (error) {
    console.error('iOS stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
});

export default router;
