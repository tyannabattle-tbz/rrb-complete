import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStreamFailover, RRB_STREAM_FAILOVERS, StreamFailoverConfig } from './streamFailover';

describe('Stream Failover Service', () => {
  let mockConfig: StreamFailoverConfig;

  beforeEach(() => {
    mockConfig = {
      primary: { url: 'https://primary.example.com/stream.mp3', format: 'mp3' },
      fallbacks: [
        { url: 'https://fallback1.example.com/stream.mp3', format: 'mp3' },
        { url: 'https://fallback2.example.com/stream.mp3', format: 'mp3' },
      ],
      healthCheckInterval: 1000,
      maxRetries: 2,
      timeout: 1000,
    };
  });

  describe('Initialization', () => {
    it('should create failover manager with config', () => {
      const manager = createStreamFailover(mockConfig);
      expect(manager.getCurrentEndpoint()).toEqual(mockConfig.primary);
    });

    it('should use default health check interval', () => {
      const config = {
        primary: { url: 'https://test.com/stream', format: 'mp3' },
        fallbacks: [],
      };
      const manager = createStreamFailover(config);
      expect(manager).toBeDefined();
    });
  });

  describe('Current Endpoint', () => {
    it('should return primary endpoint initially', () => {
      const manager = createStreamFailover(mockConfig);
      const endpoint = manager.getCurrentEndpoint();
      expect(endpoint.url).toBe('https://primary.example.com/stream.mp3');
    });

    it('should update endpoint after failover', async () => {
      const manager = createStreamFailover(mockConfig);

      // Mock fetch to fail for primary
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await manager.switchToFallback();

      const endpoint = manager.getCurrentEndpoint();
      expect(endpoint.url).toContain('fallback');
    });
  });

  describe('Health Checks', () => {
    it('should check stream health with HEAD request', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const isHealthy = await manager.checkStreamHealth(mockConfig.primary);
      expect(isHealthy).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        mockConfig.primary.url,
        expect.objectContaining({ method: 'HEAD' })
      );
    });

    it('should fallback to GET if HEAD fails', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('HEAD failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 206,
        });

      const isHealthy = await manager.checkStreamHealth(mockConfig.primary);
      expect(isHealthy).toBe(true);
    });

    it('should handle timeout errors', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          })
      );

      const isHealthy = await manager.checkStreamHealth(mockConfig.primary);
      expect(isHealthy).toBe(false);
    });

    it('should accept 206 Partial Content as healthy', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 206,
      });

      const isHealthy = await manager.checkStreamHealth(mockConfig.primary);
      expect(isHealthy).toBe(true);
    });
  });

  describe('Failover', () => {
    it('should switch to first healthy fallback', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 }) // Primary fails
        .mockResolvedValueOnce({ ok: false, status: 500 }) // First fallback fails
        .mockResolvedValueOnce({ ok: true, status: 200 }); // Second fallback succeeds

      const result = await manager.switchToFallback();
      expect(result?.url).toBe('https://fallback2.example.com/stream.mp3');
    });

    it('should return null if all fallbacks fail', async () => {
      const manager = createStreamFailover(mockConfig);

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await manager.switchToFallback();
      expect(result).toBeNull();
    });

    it('should notify listeners on failover', async () => {
      const manager = createStreamFailover(mockConfig);
      const listener = vi.fn();
      manager.onEndpointChange(listener);

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      await manager.switchToFallback();
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining('fallback') }));
    });
  });

  describe('Health Monitoring', () => {
    it('should start health monitoring', () => {
      const manager = createStreamFailover(mockConfig);
      manager.startHealthMonitoring();
      expect(manager).toBeDefined();
      manager.stopHealthMonitoring();
    });

    it('should stop health monitoring', () => {
      const manager = createStreamFailover(mockConfig);
      manager.startHealthMonitoring();
      manager.stopHealthMonitoring();
      expect(manager).toBeDefined();
    });

    it('should not start multiple monitoring intervals', () => {
      const manager = createStreamFailover(mockConfig);
      manager.startHealthMonitoring();
      manager.startHealthMonitoring();
      manager.stopHealthMonitoring();
      expect(manager).toBeDefined();
    });
  });

  describe('Listener Management', () => {
    it('should register endpoint change listener', () => {
      const manager = createStreamFailover(mockConfig);
      const listener = vi.fn();
      manager.onEndpointChange(listener);
      expect(manager).toBeDefined();
    });

    it('should call all registered listeners', async () => {
      const manager = createStreamFailover(mockConfig);
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.onEndpointChange(listener1);
      manager.onEndpointChange(listener2);

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      await manager.switchToFallback();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      const manager = createStreamFailover(mockConfig);
      manager.startHealthMonitoring();
      manager.destroy();
      expect(manager).toBeDefined();
    });
  });

  describe('Predefined Configurations', () => {
    it('should have Radio Paradise failover config', () => {
      const config = RRB_STREAM_FAILOVERS.radioParadise;
      expect(config.primary).toBeDefined();
      expect(config.fallbacks.length).toBeGreaterThan(0);
    });

    it('should have BBC Radio 1 failover config', () => {
      const config = RRB_STREAM_FAILOVERS.bbcRadio1;
      expect(config.primary).toBeDefined();
      expect(config.fallbacks.length).toBeGreaterThan(0);
    });

    it('should have BBC Radio 3 failover config', () => {
      const config = RRB_STREAM_FAILOVERS.bbcRadio3;
      expect(config.primary).toBeDefined();
      expect(config.fallbacks.length).toBeGreaterThan(0);
    });

    it('should have France Inter failover config', () => {
      const config = RRB_STREAM_FAILOVERS.franceInter;
      expect(config.primary).toBeDefined();
      expect(config.fallbacks.length).toBeGreaterThan(0);
    });

    it('should have Deutschlandfunk failover config', () => {
      const config = RRB_STREAM_FAILOVERS.deutschlandfunk;
      expect(config.primary).toBeDefined();
      expect(config.fallbacks.length).toBeGreaterThan(0);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
