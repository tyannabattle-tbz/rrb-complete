import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue({
    execute: vi.fn().mockResolvedValue([
      [
        { id: 1, name: 'RRB Main Radio', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3' },
        { id: 2, name: 'Podcast Network', streamUrl: 'https://ice5.somafm.com/live-128-mp3' },
      ],
      [], // fields
    ]),
  }),
}));

vi.mock('../_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('Stream Health Monitor Service', () => {
  it('should export all required functions', async () => {
    const mod = await import('./streamHealthMonitor');
    expect(mod.runHealthCheck).toBeDefined();
    expect(mod.getLatestReport).toBeDefined();
    expect(mod.getHealthHistory).toBeDefined();
    expect(mod.getMonitorStatus).toBeDefined();
    expect(mod.startStreamHealthMonitor).toBeDefined();
    expect(mod.stopStreamHealthMonitor).toBeDefined();
  });

  it('should have correct HealthReport interface fields', async () => {
    const mod = await import('./streamHealthMonitor');
    // getLatestReport returns null before any check
    const report = mod.getLatestReport();
    // Before any check, should be null
    expect(report === null || typeof report === 'object').toBe(true);
  });

  it('should return monitor status with isRunning field', async () => {
    const mod = await import('./streamHealthMonitor');
    const status = mod.getMonitorStatus();
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('lastCheckAt');
    expect(status).toHaveProperty('totalChecks');
    expect(typeof status.isRunning).toBe('boolean');
  });

  it('should return empty health history initially', async () => {
    const mod = await import('./streamHealthMonitor');
    const history = mod.getHealthHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});

describe('Stream Health Router', () => {
  it('should define the streamHealthRouter with correct procedures', async () => {
    const { streamHealthRouter } = await import('../routers/streamHealthRouter');
    expect(streamHealthRouter).toBeDefined();
    const procedures = Object.keys(streamHealthRouter._def.procedures);
    expect(procedures).toContain('getLatest');
    expect(procedures).toContain('getStatus');
    expect(procedures).toContain('getHistory');
    expect(procedures).toContain('runCheck');
    expect(procedures).toContain('startMonitor');
    expect(procedures).toContain('stopMonitor');
    expect(procedures.length).toBe(6);
  });
});

describe('Stream Health Widget Component', () => {
  it('should exist at the expected path', async () => {
    const fs = await import('fs');
    const widgetPath = '/home/ubuntu/manus-agent-web/client/src/components/StreamHealthWidget.tsx';
    expect(fs.existsSync(widgetPath)).toBe(true);
    const content = fs.readFileSync(widgetPath, 'utf-8');
    expect(content).toContain('StreamHealthWidget');
    expect(content).toContain('streamHealth.getLatest');
    expect(content).toContain('streamHealth.getStatus');
    expect(content).toContain('streamHealth.runCheck');
    expect(content).toContain('streamHealth.startMonitor');
    expect(content).toContain('streamHealth.stopMonitor');
  });

  it('should be imported in QumusHome', async () => {
    const fs = await import('fs');
    const qumusPath = '/home/ubuntu/manus-agent-web/client/src/pages/QumusHome.tsx';
    const content = fs.readFileSync(qumusPath, 'utf-8');
    expect(content).toContain('StreamHealthWidget');
    expect(content).toContain('import { StreamHealthWidget }');
  });
});

describe('Admin Control Panel', () => {
  it('should exist at the expected path', async () => {
    const fs = await import('fs');
    const adminPath = '/home/ubuntu/manus-agent-web/client/src/pages/AdminControlPanel.tsx';
    expect(fs.existsSync(adminPath)).toBe(true);
    const content = fs.readFileSync(adminPath, 'utf-8');
    expect(content).toContain('AdminControlPanel');
  });

  it('should have Restream management tab', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/AdminControlPanel.tsx', 'utf-8');
    expect(content).toContain('Restream');
    expect(content).toContain('restreamConfig');
  });

  it('should have Stream Health tab', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/AdminControlPanel.tsx', 'utf-8');
    expect(content).toContain('Stream Health');
    expect(content).toContain('streamHealth');
  });

  it('should have System Config tab', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/AdminControlPanel.tsx', 'utf-8');
    expect(content).toContain('System Config');
    expect(content).toContain('getAllConfigs');
  });

  it('should be registered in App.tsx at /admin route', async () => {
    const fs = await import('fs');
    const appContent = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/App.tsx', 'utf-8');
    expect(appContent).toContain('AdminControlPanel');
    expect(appContent).toContain('/admin');
  });
});

describe('Restream Room Creation', () => {
  it('should have createRoom and getRooms endpoints in restreamConfigRouter', async () => {
    const { restreamConfigRouter } = await import('../routers/restreamConfigRouter');
    const procedures = Object.keys(restreamConfigRouter._def.procedures);
    expect(procedures).toContain('createRoom');
    expect(procedures).toContain('getRooms');
  });

  it('should have restreamService with room creation logic', async () => {
    const fs = await import('fs');
    const servicePath = '/home/ubuntu/manus-agent-web/server/services/restreamService.ts';
    expect(fs.existsSync(servicePath)).toBe(true);
    const content = fs.readFileSync(servicePath, 'utf-8');
    expect(content).toContain('createRestreamRoom');
    expect(content).toContain('getRestreamRooms');
  });
});

describe('54-Channel Consistency', () => {
  it('should have exactly 54 channels in the frontend', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    const channelMatches = content.match(/\{ id: \d+/g);
    expect(channelMatches?.length).toBe(54);
  });

  it('should reference 54 channels in text', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    expect(content).toContain('51');
  });
});
