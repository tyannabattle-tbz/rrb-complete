import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

/**
 * Video streaming middleware for serving MP4 files with range request support
 */
export const videoStreamingMiddleware = (req: Request, res: Response) => {
  const videoPath = req.path.replace('/videos/', '');
  const filepath = join(process.cwd(), 'public', 'videos', videoPath);

  try {
    const stat = statSync(filepath);
    const fileSize = stat.size;

    // Handle range requests for seeking in video
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4',
      });

      createReadStream(filepath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });

      createReadStream(filepath).pipe(res);
    }
  } catch (error) {
    res.status(404).json({ error: 'Video not found' });
  }
};

/**
 * Configure video streaming routes
 */
export const configureVideoStreaming = (app: any) => {
  // Serve videos with streaming support
  app.get('/videos/:filename', videoStreamingMiddleware);

  // Serve video metadata
  app.get('/api/videos/:videoId/metadata', (req: Request, res: Response) => {
    const { videoId } = req.params;
    res.json({
      videoId,
      duration: 10,
      resolution: '1080p',
      bitrate: '5000k',
      codec: 'h264',
      format: 'mp4',
    });
  });

  // Get video thumbnail
  app.get('/api/videos/:videoId/thumbnail', (req: Request, res: Response) => {
    const { videoId } = req.params;
    res.json({
      videoId,
      thumbnail: `/videos/${videoId}-thumb.jpg`,
      timestamp: 0,
    });
  });
};
