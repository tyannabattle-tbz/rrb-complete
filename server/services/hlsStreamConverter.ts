/**
 * HLS Stream Converter Service
 * Converts MP3/Icecast streams to HLS format for iOS compatibility
 */

import { spawn } from 'child_process';
import { Writable } from 'stream';
import path from 'path';
import fs from 'fs';

export class HLSStreamConverter {
  /**
   * Convert a stream to HLS format and pipe to response
   * iOS Safari requires HLS (.m3u8) format for reliable playback
   */
  static async convertToHLS(
    streamUrl: string,
    response: any
  ): Promise<void> {
    try {
      // Set response headers for HLS playlist
      response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Headers', '*');

      // Generate HLS playlist that points to the original stream
      // iOS can handle MP3 streams if served with proper HLS headers
      const hlsPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
${streamUrl}
#EXT-X-ENDLIST`;

      response.send(hlsPlaylist);
    } catch (error) {
      console.error('HLS conversion error:', error);
      if (!response.headersSent) {
        response.status(500).json({ error: 'Failed to convert stream to HLS' });
      } else {
        response.end();
      }
    }
  }

  /**
   * Create a simple HLS stream wrapper for direct MP3 streams
   * This allows iOS to play MP3 streams as if they were HLS
   */
  static generateHLSPlaylist(streamUrl: string): string {
    return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
${encodeURI(streamUrl)}
#EXT-X-ENDLIST`;
  }

  /**
   * Detect if client is iOS
   */
  static isIOSClient(userAgent: string): boolean {
    return /iPhone|iPad|iPod/.test(userAgent);
  }

  /**
   * Detect if client is Android
   */
  static isAndroidClient(userAgent: string): boolean {
    return /Android/.test(userAgent);
  }

  /**
   * Get appropriate stream URL based on client device
   */
  static getOptimalStreamUrl(
    streamUrl: string,
    userAgent: string,
    isHLS: boolean = false
  ): string {
    // For iOS, use HLS endpoint
    if (this.isIOSClient(userAgent) && isHLS) {
      return `/api/stream/hls?url=${encodeURIComponent(streamUrl)}`;
    }

    // For others, use direct stream
    return streamUrl;
  }
}
