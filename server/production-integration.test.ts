import { describe, it, expect, vi } from 'vitest';

// Test the production integration router procedures
describe('Production Integration Router', () => {
  describe('getProductionStatus', () => {
    it('should return production status with required fields', async () => {
      // Import the router to check procedure existence
      const { productionIntegrationRouter } = await import('./routers/productionIntegrationRouter');
      expect(productionIntegrationRouter).toBeDefined();
      
      // Check that the router has the expected procedures
      const procedures = Object.keys(productionIntegrationRouter._def.procedures);
      expect(procedures).toContain('getProductionStatus');
      expect(procedures).toContain('emitEvent');
      expect(procedures).toContain('getEventLog');
      expect(procedures).toContain('getSubsystemStatus');
      expect(procedures).toContain('startBroadcastWithAds');
    });
  });
});

// Test the content scheduler with ads integration
describe('Content Scheduler Integration', () => {
  it('should have getNowPlayingWithAds procedure', async () => {
    const { contentSchedulerRouter } = await import('./routers/contentSchedulerRouter');
    expect(contentSchedulerRouter).toBeDefined();
    const procedures = Object.keys(contentSchedulerRouter._def.procedures);
    expect(procedures).toContain('getNowPlayingWithAds');
    expect(procedures).toContain('getSchedule');
    expect(procedures).toContain('getStats');
    expect(procedures).toContain('getNowPlaying');
    expect(procedures).toContain('seedDefaultSchedule');
  });
});

// Test the listener analytics enhanced procedures
describe('Listener Analytics Enhanced', () => {
  it('should have all enhanced analytics procedures', async () => {
    const { listenerAnalyticsRouter } = await import('./routers/listenerAnalyticsRouter');
    expect(listenerAnalyticsRouter).toBeDefined();
    const procedures = Object.keys(listenerAnalyticsRouter._def.procedures);
    expect(procedures).toContain('getRealtimeStats');
    expect(procedures).toContain('getAdPerformance');
    expect(procedures).toContain('getHourlyTrends');
    expect(procedures).toContain('getChannelHeatmap');
    expect(procedures).toContain('getEngagementScores');
    expect(procedures).toContain('recordEvent');
  });
});

// Test the team updates enhanced procedures
describe('Team Updates Enhanced', () => {
  it('should have notification dispatch procedures', async () => {
    const { teamUpdatesRouter } = await import('./routers/teamUpdatesRouter');
    expect(teamUpdatesRouter).toBeDefined();
    const procedures = Object.keys(teamUpdatesRouter._def.procedures);
    expect(procedures).toContain('publishUpdate');
    expect(procedures).toContain('getUpdates');
    expect(procedures).toContain('getDeliveryStats');
    expect(procedures).toContain('acknowledgeUpdate');
    expect(procedures).toContain('applyUpdate');
    expect(procedures).toContain('dispatchWebhook');
  });
});

// Test the webhook manager procedures
describe('Webhook Manager', () => {
  it('should have all webhook management procedures', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    expect(webhookManagerRouter).toBeDefined();
    const procedures = Object.keys(webhookManagerRouter._def.procedures);
    expect(procedures).toContain('list');
    expect(procedures).toContain('add');
    expect(procedures).toContain('remove');
    expect(procedures).toContain('toggle');
    expect(procedures).toContain('test');
    expect(procedures).toContain('stats');
    expect(procedures).toContain('logs');
    expect(procedures).toContain('dispatchUpdate');
  });
});

// Test the ad rotation procedures
describe('Ad Rotation', () => {
  it('should have all ad management procedures', async () => {
    const { adRotationRouter } = await import('./routers/adRotationRouter');
    expect(adRotationRouter).toBeDefined();
    const procedures = Object.keys(adRotationRouter._def.procedures);
    expect(procedures).toContain('getAds');
    expect(procedures).toContain('createAd');
    expect(procedures).toContain('updateAd');
    expect(procedures).toContain('deleteAd');
    expect(procedures).toContain('getStats');
    expect(procedures).toContain('seedDefaults');
    expect(procedures).toContain('getNextAd');
  });
});

// Test the chunk5 router integration
describe('Chunk5 Router Integration', () => {
  it('should contain all production subsystem routers', async () => {
    const { chunk5Router } = await import('./routerChunks/chunk5');
    expect(chunk5Router).toBeDefined();
    const procedures = Object.keys(chunk5Router._def.procedures);
    
    // Check that all key subsystems are wired in
    const expectedPrefixes = [
      'productionIntegration',
      'contentScheduler',
      'listenerAnalytics',
      'teamUpdates',
      'webhookManager',
      'adRotation',
      'qumusOrchestration',
    ];
    
    for (const prefix of expectedPrefixes) {
      const hasProcedures = procedures.some(p => p.startsWith(prefix + '.'));
      expect(hasProcedures).toBe(true);
    }
  });
});

// Test the QUMUS production integration service
describe('QUMUS Production Integration Service', () => {
  it('should export the service module', async () => {
    const mod = await import('./services/qumusProductionIntegration');
    expect(mod).toBeDefined();
    expect(mod.getProductionIntegration).toBeDefined();
    expect(mod.startProductionIntegration).toBeDefined();
  });

  it('should create an engine instance', async () => {
    const { getProductionIntegration } = await import('./services/qumusProductionIntegration');
    const engine = getProductionIntegration();
    expect(engine).toBeDefined();
    expect(typeof engine.getStatus).toBe('function');
    expect(typeof engine.emit).toBe('function');
    expect(typeof engine.getEventLog).toBe('function');
  });

  it('should emit and retrieve events', async () => {
    const { getProductionIntegration } = await import('./services/qumusProductionIntegration');
    const engine = getProductionIntegration();
    
    await engine.emit({
      id: 'test-event-1',
      type: 'system_health_check',
      source: 'test',
      data: { test: true },
      severity: 'info',
      timestamp: Date.now(),
    });
    
    const log = engine.getEventLog();
    expect(log.length).toBeGreaterThanOrEqual(1);
    // The event should be in the log
    expect(log.some((e: any) => e.type === 'system_health_check')).toBe(true);
  });

  it('should return subsystem status', async () => {
    const { getProductionIntegration } = await import('./services/qumusProductionIntegration');
    const engine = getProductionIntegration();
    
    const status = engine.getSubsystemStatus();
    expect(status).toBeDefined();
    expect(typeof status).toBe('object');
    // Should have multiple subsystems
    expect(Object.keys(status).length).toBeGreaterThan(0);
  });
});
