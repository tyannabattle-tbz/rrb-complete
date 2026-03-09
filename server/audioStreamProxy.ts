/**
 * Audio Stream Proxy
 * Proxies HTTP radio streams through the HTTPS server to solve mixed-content blocking.
 * When deployed on HTTPS, browsers block HTTP audio streams. This proxy fetches
 * the HTTP stream server-side and forwards it to the client over HTTPS.
 */
import type { Express, Request, Response } from "express";
import http from "http";

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
    try {
      const url = new URL(streamUrl);
      console.log(`[Stream Proxy] Proxying: ${url.hostname}${url.pathname}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    try {
      const proxyReq = http.get(streamUrl, {
        headers: {
          "User-Agent": "RRB-Radio/1.0",
          "Accept": "*/*",
          "Icy-MetaData": "0",
        },
        timeout: 10000,
      }, (proxyRes) => {
        // Forward content type
        const contentType = proxyRes.headers["content-type"] || "audio/mpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-cache, no-store");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Transfer-Encoding", "chunked");

        // Pipe the audio stream to the client
        proxyRes.pipe(res);

        // Clean up on client disconnect
        req.on("close", () => {
          proxyRes.destroy();
        });
      });

      proxyReq.on("error", (err) => {
        console.error(`[Stream Proxy] Error: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({ error: "Stream unavailable" });
        }
      });

      proxyReq.on("timeout", () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).json({ error: "Stream timeout" });
        }
      });
    } catch (error) {
      console.error("[Stream Proxy] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Proxy error" });
      }
    }
  });

  console.log("[Stream Proxy] Audio stream proxy registered at /api/stream-proxy");
}
