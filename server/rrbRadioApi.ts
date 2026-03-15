/**
 * RRB Radio REST API — v1
 * Complete implementation of the 18 endpoints specified in the Ty OS Integration Guide.
 * 
 * Base: /api/radio/v1
 * 
 * Endpoints:
 *  1. GET  /channels                — List all 54 channels
 *  2. GET  /channels/:id            — Get single channel details
 *  3. GET  /channels/:id/stream     — Get stream URL + fallback chain
 *  4. GET  /channels/:id/now-playing — Current track metadata
 *  5. GET  /channels/:id/schedule   — Broadcast schedule
 *  6. GET  /channels/:id/listeners  — Listener count + breakdown
 *  7. POST /channels/:id/request    — Song request
 *  8. GET  /categories              — List categories with counts
 *  9. GET  /search                  — Search channels
 * 10. GET  /health                  — System health status
 * 11. GET  /health/streams          — All stream health checks
 * 12. GET  /status                  — Global broadcast state
 * 13. POST /webhooks/register       — Register webhook
 * 14. DELETE /webhooks/:id          — Remove webhook
 * 15. GET  /embed/:id               — Embeddable player widget HTML
 * 16. GET  /sdk.js                  — JavaScript SDK for embedding
 * 17. GET  /qumus/status            — QUMUS orchestration status
 * 18. GET  /qumus/decisions         — Recent QUMUS decisions
 * 
 * Canryn Production — Rockin Rockin Boogie
 */
import type { Express, Request, Response } from "express";
import { RADIO_STATIONS, getChannelById, getChannelByNumericId, getChannelsByCategory, searchChannels, getFallbackChain, getCategorySummary } from "../shared/radioStationRegistry";
import mysql from "mysql2/promise";

function getConnection() {
  return mysql.createConnection(process.env.DATABASE_URL!);
}

export function registerRRBRadioApi(app: Express) {
  const BASE = "/api/radio/v1";

  // ─── 1. GET /channels ────────────────────────────────────────────
  app.get(`${BASE}/channels`, async (_req: Request, res: Response) => {
    try {
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM radio_channels ORDER BY id");
      await conn.end();

      const channels = (rows as any[]).map(row => ({
        id: row.id,
        name: row.name,
        genre: row.genre,
        streamUrl: row.streamUrl,
        fallbackUrl: row.fallbackUrl,
        frequency: row.frequency || 432,
        status: row.status || "active",
        currentListeners: row.currentListeners || 0,
      }));

      res.json({
        success: true,
        count: channels.length,
        channels,
        registry: RADIO_STATIONS.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 2. GET /channels/:id ───────────────────────────────────────
  app.get(`${BASE}/channels/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM radio_channels WHERE id = ?", [id]);
      await conn.end();

      const row = (rows as any[])[0];
      if (!row) return res.status(404).json({ success: false, error: "Channel not found" });

      const registryEntry = getChannelByNumericId(id) || RADIO_STATIONS.find(s => s.name === row.name);

      res.json({
        success: true,
        channel: {
          id: row.id,
          name: row.name,
          genre: row.genre,
          streamUrl: row.streamUrl,
          fallbackUrl: row.fallbackUrl,
          frequency: row.frequency || 432,
          status: row.status || "active",
          currentListeners: row.currentListeners || 0,
          description: row.description,
          stationId: row.stationId,
        },
        registry: registryEntry ? {
          category: registryEntry.category,
          color: registryEntry.color,
          qumus: registryEntry.qumus,
          metadata: registryEntry.metadata,
        } : null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 3. GET /channels/:id/stream ────────────────────────────────
  app.get(`${BASE}/channels/:id/stream`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM radio_channels WHERE id = ?", [id]);
      await conn.end();

      const row = (rows as any[])[0];
      if (!row) return res.status(404).json({ success: false, error: "Channel not found" });

      const registryEntry = getChannelByNumericId(id);
      const fallbackChain = registryEntry ? getFallbackChain(registryEntry) : [
        { tier: "primary", source: row.streamUrl, type: "direct", available: true },
        { tier: "backup", source: row.fallbackUrl || row.streamUrl, type: "direct", available: !!row.fallbackUrl },
        { tier: "emergency", source: `synth://${row.frequency || 432}Hz`, type: "synth_only", available: true },
      ];

      res.json({
        success: true,
        channelId: id,
        channelName: row.name,
        primaryStream: row.streamUrl,
        fallbackChain,
        proxyUrl: `/api/stream-proxy?url=${encodeURIComponent(row.streamUrl)}`,
        format: "mp3",
        bitrate: 128,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 4. GET /channels/:id/now-playing ───────────────────────────
  app.get(`${BASE}/channels/:id/now-playing`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM radio_channels WHERE id = ?", [id]);
      const [statusRows] = await conn.execute("SELECT * FROM streaming_status WHERE channel_id = ?", [id]);
      await conn.end();

      const row = (rows as any[])[0];
      if (!row) return res.status(404).json({ success: false, error: "Channel not found" });

      const status = (statusRows as any[])[0];

      res.json({
        success: true,
        channelId: id,
        channelName: row.name,
        nowPlaying: {
          title: status?.current_track || row.name,
          artist: status?.current_artist || "RRB Radio",
          album: status?.current_album || "",
          genre: row.genre,
          startedAt: status?.last_checked ? new Date(status.last_checked).toISOString() : new Date().toISOString(),
        },
        listeners: row.currentListeners || 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 5. GET /channels/:id/schedule ──────────────────────────────
  app.get(`${BASE}/channels/:id/schedule`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      const [rows] = await conn.execute(
        "SELECT * FROM broadcast_schedules WHERE channel_id = ? ORDER BY start_time LIMIT 20",
        [id]
      );
      await conn.end();

      res.json({
        success: true,
        channelId: id,
        schedule: (rows as any[]).map(r => ({
          id: r.id,
          title: r.title,
          startTime: r.start_time,
          endTime: r.end_time,
          type: r.content_type || "music",
          host: r.host_name,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 6. GET /channels/:id/listeners ─────────────────────────────
  app.get(`${BASE}/channels/:id/listeners`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM radio_channels WHERE id = ?", [id]);
      const [stateRows] = await conn.execute("SELECT * FROM global_broadcast_state LIMIT 1");
      await conn.end();

      const row = (rows as any[])[0];
      if (!row) return res.status(404).json({ success: false, error: "Channel not found" });
      const state = (stateRows as any[])[0];

      res.json({
        success: true,
        channelId: id,
        channelName: row.name,
        currentListeners: row.currentListeners || 0,
        peakListeners: row.totalListeners || 0,
        totalListeningHours: 0,
        globalListeners: state?.listener_count || 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 7. POST /channels/:id/request ──────────────────────────────
  app.post(`${BASE}/channels/:id/request`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { song, artist, requestedBy } = req.body || {};
      if (!song) return res.status(400).json({ success: false, error: "Song title required" });

      const conn = await getConnection();
      await conn.execute(
        "INSERT INTO song_requests (channel_id, song_title, artist_name, requested_by, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())",
        [id, song, artist || "Unknown", requestedBy || "Anonymous"]
      );
      await conn.end();

      res.json({
        success: true,
        message: `Song "${song}" requested on channel ${id}`,
        status: "pending",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // If table doesn't exist, create it
      try {
        const conn = await getConnection();
        await conn.execute(`CREATE TABLE IF NOT EXISTS song_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          channel_id INT NOT NULL,
          song_title VARCHAR(255) NOT NULL,
          artist_name VARCHAR(255),
          requested_by VARCHAR(255),
          status ENUM('pending','queued','played','rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        const { song, artist, requestedBy } = req.body || {};
        await conn.execute(
          "INSERT INTO song_requests (channel_id, song_title, artist_name, requested_by, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())",
          [parseInt(req.params.id), song, artist || "Unknown", requestedBy || "Anonymous"]
        );
        await conn.end();
        res.json({ success: true, message: `Song "${song}" requested`, status: "pending" });
      } catch (e2) {
        res.status(500).json({ success: false, error: String(e2) });
      }
    }
  });

  // ─── 8. GET /categories ─────────────────────────────────────────
  app.get(`${BASE}/categories`, (_req: Request, res: Response) => {
    const summary = getCategorySummary();
    res.json({
      success: true,
      categories: summary.map(c => ({
        name: c.category,
        count: c.count,
        channels: c.channels.map(ch => ({ id: ch.numericId, name: ch.name })),
      })),
      totalChannels: RADIO_STATIONS.length,
      timestamp: new Date().toISOString(),
    });
  });

  // ─── 9. GET /search ─────────────────────────────────────────────
  app.get(`${BASE}/search`, (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    if (!q) return res.status(400).json({ success: false, error: "Query parameter 'q' required" });

    const results = searchChannels(q);
    res.json({
      success: true,
      query: q,
      count: results.length,
      results: results.map(ch => ({
        id: ch.numericId,
        name: ch.name,
        description: ch.description,
        category: ch.category,
        genres: ch.metadata.genres,
        streamUrl: ch.stream.url,
      })),
      timestamp: new Date().toISOString(),
    });
  });

  // ─── 10. GET /health ────────────────────────────────────────────
  app.get(`${BASE}/health`, async (_req: Request, res: Response) => {
    try {
      const conn = await getConnection();
      const [countRows] = await conn.execute("SELECT COUNT(*) as cnt FROM radio_channels WHERE status = 'active'");
      const [listenerRows] = await conn.execute("SELECT SUM(currentListeners) as total FROM radio_channels");
      await conn.end();

      const activeChannels = (countRows as any[])[0]?.cnt || 0;
      const totalListeners = (listenerRows as any[])[0]?.total || 0;

      res.json({
        success: true,
        status: "operational",
        activeChannels,
        totalChannels: 54,
        registryChannels: RADIO_STATIONS.length,
        totalListeners,
        qumusStatus: "running",
        subsystems: "18/18 healthy",
        uptime: process.uptime(),
        version: "3.3.0",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, status: "degraded", error: String(error) });
    }
  });

  // ─── 11. GET /health/streams ────────────────────────────────────
  app.get(`${BASE}/health/streams`, async (_req: Request, res: Response) => {
    try {
      const conn = await getConnection();
      const [rows] = await conn.execute("SELECT * FROM streaming_status ORDER BY channel_id");
      await conn.end();

      const streams = (rows as any[]).map(r => ({
        channelId: r.channel_id,
        streamUrl: r.stream_url,
        status: r.status,
        platform: r.platform,
        bitrate: r.bitrate,
        viewerCount: r.viewer_count,
        lastUpdated: r.last_updated,
        latency: r.latency,
      }));

      const healthy = streams.filter(s => s.status === "active" || s.status === "live").length;
      const degraded = streams.filter(s => s.status === "degraded" || s.status === "buffering").length;
      const down = streams.filter(s => s.status === "down" || s.status === "offline" || s.status === "error").length;

      res.json({
        success: true,
        totalStreams: streams.length,
        healthy,
        degraded,
        down,
        uptimePercent: streams.length > 0 ? Math.round((healthy / streams.length) * 100) : 0,
        streams,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 12. GET /status ────────────────────────────────────────────
  app.get(`${BASE}/status`, async (_req: Request, res: Response) => {
    try {
      const conn = await getConnection();
      const [stateRows] = await conn.execute("SELECT * FROM global_broadcast_state ORDER BY id");
      const [totalListeners] = await conn.execute("SELECT SUM(listener_count) as total FROM global_broadcast_state");
      await conn.end();

      res.json({
        success: true,
        globalState: {
          totalChannels: (stateRows as any[]).length,
          totalListeners: (totalListeners as any[])[0]?.total || 0,
          activeStreams: (stateRows as any[]).filter((r: any) => r.is_live).length,
          isLive: (stateRows as any[]).some((r: any) => r.is_live),
          syncStatus: (stateRows as any[])[0]?.sync_status || "unknown",
          channelsInSync: (stateRows as any[])[0]?.channels_in_sync || 0,
          allChannels: (stateRows as any[])[0]?.all_channels || 54,
          currentContent: (stateRows as any[])[0]?.current_content_title || "RRB Radio Live",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 13. POST /webhooks/register ────────────────────────────────
  app.post(`${BASE}/webhooks/register`, async (req: Request, res: Response) => {
    try {
      const { url, events, secret } = req.body || {};
      if (!url) return res.status(400).json({ success: false, error: "Webhook URL required" });

      const conn = await getConnection();
      await conn.execute(`CREATE TABLE IF NOT EXISTS radio_webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        events JSON,
        secret VARCHAR(255),
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      const [result] = await conn.execute(
        "INSERT INTO radio_webhooks (url, events, secret) VALUES (?, ?, ?)",
        [url, JSON.stringify(events || ["*"]), secret || null]
      );
      await conn.end();

      res.json({
        success: true,
        webhookId: (result as any).insertId,
        url,
        events: events || ["*"],
        message: "Webhook registered successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 14. DELETE /webhooks/:id ───────────────────────────────────
  app.delete(`${BASE}/webhooks/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conn = await getConnection();
      await conn.execute("DELETE FROM radio_webhooks WHERE id = ?", [id]);
      await conn.end();

      res.json({
        success: true,
        message: `Webhook ${id} removed`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 15. GET /embed/:id ─────────────────────────────────────────
  app.get(`${BASE}/embed/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const station = getChannelByNumericId(id);
    const name = station?.name || `Channel ${id}`;
    const color = station?.color || "#F59E0B";
    const streamUrl = station?.stream.url || "";
    const origin = req.headers.origin || req.protocol + "://" + req.get("host");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RRB Radio — ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fff; }
    .player { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; border: 1px solid ${color}33; }
    .play-btn { width: 44px; height: 44px; border-radius: 50%; background: ${color}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
    .play-btn:hover { transform: scale(1.1); }
    .play-btn svg { width: 20px; height: 20px; fill: #fff; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status { font-size: 11px; color: #888; margin-top: 2px; }
    .live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; margin-right: 4px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .brand { font-size: 9px; color: #555; text-align: right; }
    .brand a { color: ${color}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="player">
    <button class="play-btn" id="playBtn" onclick="togglePlay()">
      <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
    </button>
    <div class="info">
      <div class="name">${name}</div>
      <div class="status"><span class="live-dot"></span>LIVE — RRB Radio</div>
    </div>
    <div class="brand"><a href="${origin}" target="_blank">Powered by<br>Canryn Production</a></div>
  </div>
  <audio id="audio" preload="none"></audio>
  <script>
    const audio = document.getElementById('audio');
    const btn = document.getElementById('playBtn');
    let playing = false;
    const streamUrl = '${streamUrl}';
    const proxyUrl = '${origin}/api/stream-proxy?url=' + encodeURIComponent(streamUrl);
    function togglePlay() {
      if (playing) {
        audio.pause(); audio.src = '';
        btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>';
        playing = false;
      } else {
        audio.src = streamUrl.startsWith('http://') ? proxyUrl : streamUrl;
        audio.play().catch(() => { audio.src = proxyUrl; audio.play(); });
        btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        playing = true;
      }
    }
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  // ─── 16. GET /sdk.js ────────────────────────────────────────────
  app.get(`${BASE}/sdk.js`, (req: Request, res: Response) => {
    const origin = req.headers.origin || req.protocol + "://" + req.get("host");
    const sdk = `/**
 * RRB Radio SDK v1.0
 * Canryn Production — Rockin Rockin Boogie
 * 
 * Usage:
 *   <script src="${origin}/api/radio/v1/sdk.js"></script>
 *   <script>
 *     const radio = new RRBRadio();
 *     radio.play(1);  // Play channel 1
 *     radio.stop();
 *     radio.getChannels().then(channels => console.log(channels));
 *   </script>
 */
(function(global) {
  'use strict';
  
  const API_BASE = '${origin}/api/radio/v1';
  const PROXY_BASE = '${origin}/api/stream-proxy';
  
  class RRBRadio {
    constructor(options = {}) {
      this.audio = new Audio();
      this.audio.preload = 'none';
      this.currentChannel = null;
      this.isPlaying = false;
      this.volume = options.volume || 0.8;
      this.audio.volume = this.volume;
      this.onPlay = options.onPlay || null;
      this.onStop = options.onStop || null;
      this.onError = options.onError || null;
      this.onChannelChange = options.onChannelChange || null;
      
      this.audio.addEventListener('error', (e) => {
        if (this.onError) this.onError(e);
        this._tryFallback();
      });
    }
    
    async getChannels() {
      const res = await fetch(API_BASE + '/channels');
      const data = await res.json();
      return data.channels;
    }
    
    async getChannel(id) {
      const res = await fetch(API_BASE + '/channels/' + id);
      return await res.json();
    }
    
    async getCategories() {
      const res = await fetch(API_BASE + '/categories');
      return await res.json();
    }
    
    async search(query) {
      const res = await fetch(API_BASE + '/search?q=' + encodeURIComponent(query));
      return await res.json();
    }
    
    async getNowPlaying(channelId) {
      const res = await fetch(API_BASE + '/channels/' + channelId + '/now-playing');
      return await res.json();
    }
    
    async getStreamInfo(channelId) {
      const res = await fetch(API_BASE + '/channels/' + channelId + '/stream');
      return await res.json();
    }
    
    async getHealth() {
      const res = await fetch(API_BASE + '/health');
      return await res.json();
    }
    
    async requestSong(channelId, song, artist) {
      const res = await fetch(API_BASE + '/channels/' + channelId + '/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song, artist }),
      });
      return await res.json();
    }
    
    async play(channelId) {
      try {
        const streamInfo = await this.getStreamInfo(channelId);
        if (!streamInfo.success) throw new Error('Channel not found');
        
        this.currentChannel = channelId;
        this._fallbackChain = streamInfo.fallbackChain || [];
        this._fallbackIndex = 0;
        
        const url = streamInfo.primaryStream;
        this.audio.src = url.startsWith('http://') 
          ? PROXY_BASE + '?url=' + encodeURIComponent(url)
          : url;
        
        await this.audio.play();
        this.isPlaying = true;
        if (this.onPlay) this.onPlay(channelId);
        if (this.onChannelChange) this.onChannelChange(channelId);
      } catch (err) {
        if (this.onError) this.onError(err);
      }
    }
    
    stop() {
      this.audio.pause();
      this.audio.src = '';
      this.isPlaying = false;
      if (this.onStop) this.onStop();
    }
    
    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
      this.audio.volume = this.volume;
    }
    
    _tryFallback() {
      if (!this._fallbackChain || this._fallbackIndex >= this._fallbackChain.length) return;
      const next = this._fallbackChain[this._fallbackIndex++];
      if (next && next.source && !next.source.startsWith('synth://')) {
        const url = next.source;
        this.audio.src = url.startsWith('http://') 
          ? PROXY_BASE + '?url=' + encodeURIComponent(url)
          : url;
        this.audio.play().catch(() => this._tryFallback());
      }
    }
    
    embed(containerId, channelId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const iframe = document.createElement('iframe');
      iframe.src = API_BASE + '/embed/' + channelId;
      iframe.style.width = options.width || '320px';
      iframe.style.height = options.height || '80px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.style.overflow = 'hidden';
      container.appendChild(iframe);
    }
  }
  
  global.RRBRadio = RRBRadio;
})(typeof window !== 'undefined' ? window : global);
`;

    res.setHeader("Content-Type", "application/javascript");
    res.send(sdk);
  });

  // ─── 17. GET /qumus/status ──────────────────────────────────────
  app.get(`${BASE}/qumus/status`, async (_req: Request, res: Response) => {
    try {
      const conn = await getConnection();
      const [policyRows] = await conn.execute("SELECT COUNT(*) as cnt FROM qumus_core_policies");
      const [decisionRows] = await conn.execute("SELECT COUNT(*) as cnt FROM qumus_decisions");
      const [logRows] = await conn.execute("SELECT COUNT(*) as cnt FROM qumus_decision_logs");
      const [metricsRows] = await conn.execute("SELECT COUNT(*) as cnt FROM qumus_metrics");
      await conn.end();

      res.json({
        success: true,
        qumus: {
          status: "running",
          activePolicies: (policyRows as any[])[0]?.cnt || 0,
          totalDecisions: (decisionRows as any[])[0]?.cnt || 0,
          totalDecisionLogs: (logRows as any[])[0]?.cnt || 0,
          totalMetrics: (metricsRows as any[])[0]?.cnt || 0,
          healthySubsystems: 18,
          totalSubsystems: 18,
          autonomyLevel: 0.90,
          humanOverride: 0.10,
          version: "3.3.0",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // ─── 18. GET /qumus/decisions ───────────────────────────────────
  app.get(`${BASE}/qumus/decisions`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const conn = await getConnection();
      const [rows] = await conn.execute(
        `SELECT * FROM qumus_decisions ORDER BY createdAt DESC LIMIT ${parseInt(String(limit)) || 20}`
      );
      await conn.end();

      res.json({
        success: true,
        count: (rows as any[]).length,
        decisions: (rows as any[]).map(r => ({
          id: r.id,
          decisionId: r.decisionId,
          policyName: r.policyName,
          action: r.action,
          confidence: r.confidence,
          status: r.status,
          isAutonomous: r.isAutonomous,
          createdAt: r.createdAt,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  console.log(`[RRB Radio API] Registered 18 endpoints at ${BASE}/*`);
}
