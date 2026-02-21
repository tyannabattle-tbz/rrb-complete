/**
 * Stream Proxy Routes
 * Handles proxying of external audio streams with proper streaming
 */

import { Router, Request, Response } from 'express';
import { StreamProxyService } from '../services/streamProxy';

const router = Router();

/**
 * Proxy a stream by URL
 * GET /api/stream/proxy?url=<encoded_url>
 */
router.get('/proxy', async (req: Request, res: Response) => {
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

    // Proxy the stream
    await StreamProxyService.proxyStreamToResponse(decodedUrl, res);
  } catch (error) {
    console.error('Stream proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to proxy stream' });
    }
  }
});

/**
 * Validate if a stream is accessible
 * GET /api/stream/validate?url=<encoded_url>
 */
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Stream URL is required' });
    }

    const decodedUrl = decodeURIComponent(url);
    const isValid = await StreamProxyService.validateStream(decodedUrl);

    res.json({ valid: isValid, url: decodedUrl });
  } catch (error) {
    console.error('Stream validation error:', error);
    res.status(500).json({ error: 'Failed to validate stream' });
  }
});

export default router;
