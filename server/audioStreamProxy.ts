/**
 * Audio Stream Proxy — Persistent Live Stream Relay
 * 
 * Proxies HTTP radio streams through the HTTPS server to solve mixed-content blocking.
 * When deployed on HTTPS, browsers block HTTP audio streams. This proxy fetches
 * the HTTP stream server-side and forwards it to the client over HTTPS.
 * 
 * Anti-timeout features:
 * - Connection timeout only applies to initial handshake (15s), NOT ongoing stream
 * - Socket keepalive enabled to prevent idle TCP drops
 * - Proper cleanup on client disconnect
 * - No response timeout — live streams run indefinitely
 */
import type { Express, Request, Response } from "express";
import http from "http";

// Reusable HTTP agent with keepalive for connection pooling
const proxyAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 0, // No socket timeout for streaming
});

export function registerAudioStreamProxy(app: Express) {
  app.get("/api/stream-proxy", async (req: Request, res: Response) => {
    const streamUrl = req.query.url as string;

    if (!streamUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    // Only proxy HTTP streams (HTTPS streams don't need proxying)
    if (!streamUrl.startsWith("http://")) {
      return res.status(400).json({ error: "Only HTTP streams can be proxied" });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(streamUrl);
      console.log(`[Stream Proxy] Proxying: ${parsedUrl.hostname}${parsedUrl.pathname}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Disable Express/Node response timeout for this streaming endpoint
    req.setTimeout(0);
    res.setTimeout(0);

    try {
      const proxyReq = http.get(streamUrl, {
        agent: proxyAgent,
        headers: {
          "User-Agent": "RRB-Radio/2.0 (Canryn Production)",
          "Accept": "*/*",
          "Icy-MetaData": "0",
          "Connection": "keep-alive",
        },
        // Connection timeout: only for initial TCP handshake + first response byte
        timeout: 15000,
      }, (proxyRes) => {
        // Once connected, remove the timeout — stream runs indefinitely
        proxyReq.setTimeout(0);

        // Forward content type and streaming headers
        const contentType = proxyRes.headers["content-type"] || "audio/mpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader("X-Content-Type-Options", "nosniff");
        // Prevent proxy/CDN buffering that can cause stalls
        res.setHeader("X-Accel-Buffering", "no");

        // Enable TCP keepalive on the upstream socket
        if (proxyRes.socket) {
          proxyRes.socket.setKeepAlive(true, 30000);
          proxyRes.socket.setTimeout(0); // No timeout on the streaming socket
        }

        // Pipe the audio stream to the client
        proxyRes.pipe(res);

        // Handle upstream stream ending (server-side disconnect)
        proxyRes.on('end', () => {
          console.log(`[Stream Proxy] Upstream ended: ${parsedUrl.hostname}`);
          if (!res.writableEnded) {
            res.end();
          }
        });

        proxyRes.on('error', (err) => {
          console.error(`[Stream Proxy] Upstream error: ${err.message}`);
          if (!res.writableEnded) {
            res.end();
          }
        });

        // Clean up on client disconnect
        req.on("close", () => {
          proxyRes.destroy();
        });

        res.on("close", () => {
          proxyRes.destroy();
        });
      });

      proxyReq.on("error", (err) => {
        console.error(`[Stream Proxy] Connection error: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({ error: "Stream unavailable" });
        } else if (!res.writableEnded) {
          res.end();
        }
      });

      proxyReq.on("timeout", () => {
        // This only fires during initial connection (15s timeout above)
        console.error(`[Stream Proxy] Connection timeout: ${parsedUrl.hostname}`);
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: "Stream connection timeout" });
        }
      });
    } catch (error) {
      console.error("[Stream Proxy] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Proxy error" });
      }
    }
  });

  console.log("[Stream Proxy] Audio stream proxy registered at /api/stream-proxy (v2 — persistent)");
}
