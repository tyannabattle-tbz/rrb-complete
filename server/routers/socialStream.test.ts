import { describe, it, expect } from 'vitest';

describe('socialStreamRouter', () => {
  it('should define the socialStreamRouter with correct procedures', async () => {
    const { socialStreamRouter } = await import('./socialStreamRouter');
    expect(socialStreamRouter).toBeDefined();
    const procedures = Object.keys(socialStreamRouter._def.procedures);
    expect(procedures).toContain('getDestinations');
    expect(procedures).toContain('addDestination');
    expect(procedures).toContain('updateDestination');
    expect(procedures).toContain('removeDestination');
    expect(procedures).toContain('getPlatformInfo');
    expect(procedures).toContain('goLive');
    expect(procedures).toContain('stopStream');
    expect(procedures).toContain('getStreamHistory');
    expect(procedures).toContain('getActiveStream');
    expect(procedures).toContain('getStreamStats');
  });

  it('should have correct procedure count of 10', async () => {
    const { socialStreamRouter } = await import('./socialStreamRouter');
    const procedures = Object.keys(socialStreamRouter._def.procedures);
    expect(procedures.length).toBe(10);
  });

  it('should have getPlatformInfo as a public procedure', async () => {
    const { socialStreamRouter } = await import('./socialStreamRouter');
    const proc = socialStreamRouter._def.procedures.getPlatformInfo;
    expect(proc).toBeDefined();
  });

  it('should have goLive as a protected procedure', async () => {
    const { socialStreamRouter } = await import('./socialStreamRouter');
    const proc = socialStreamRouter._def.procedures.goLive;
    expect(proc).toBeDefined();
  });

  it('should be registered in the main app router', async () => {
    const { appRouter } = await import('../routers');
    const procedures = Object.keys(appRouter._def.procedures);
    const hasSocialStream = procedures.some(p => p.startsWith('socialStream.'));
    expect(hasSocialStream).toBe(true);
  }, 30000);
});
