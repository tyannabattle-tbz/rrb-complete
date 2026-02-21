/**
 * Stream Proxy Routes
 * Handles proxying of external audio streams
 */

import { Router, Request, Response } from 'express';
import { StreamProxyService } from '../services/streamProxy';

const router = Router();

/**
 * Proxy a stream by URL
 * POST /api/stream/proxy
 */
router.post('/proxy', async (req: Request, res: Response) => {
  try {
    const { streamUrl } = req.body;

    if (!streamUrl) {
      return res.status(400).json({ error: 'Stream URL is required' });
    }

    // Set response headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Proxy the stream
    const buffer = await StreamProxyService.proxyStream({ url: streamUrl });
    res.send(buffer);
  } catch (error) {
    console.error('Stream proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy stream' });
  }
});

/**
 * Get cache stats
 * GET /api/stream/cache-stats
 */
router.get('/cache-stats', (req: Request, res: Response) => {
  try {
    const stats = StreamProxyService.getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

/**
 * Clear cache
 * POST /api/stream/clear-cache
 */
router.post('/clear-cache', (req: Request, res: Response) => {
  try {
    StreamProxyService.clearCache();
    res.json({ message: 'Cache cleared' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

export default router;
