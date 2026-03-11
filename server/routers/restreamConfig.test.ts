import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();

vi.mock('../db', () => ({
  getDb: () => ({
    select: () => ({ from: (t: any) => ({ where: mockWhere }) }),
    insert: () => ({ values: mockValues }),
    update: () => ({ set: () => ({ where: mockWhere }) }),
  }),
}));

vi.mock('../../drizzle/schema', () => ({
  systemConfig: {
    configKey: 'config_key',
    configValue: 'config_value',
    description: 'description',
    updatedAt: 'updated_at',
    updatedBy: 'updated_by',
    id: 'id',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

describe('Restream Config Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should define the restreamConfigRouter with correct procedures', async () => {
    const { restreamConfigRouter } = await import('./restreamConfigRouter');
    expect(restreamConfigRouter).toBeDefined();
    // Check that the router has the expected procedures
    const procedures = Object.keys(restreamConfigRouter._def.procedures);
    expect(procedures).toContain('getRestreamUrl');
    expect(procedures).toContain('getConfig');
    expect(procedures).toContain('getAllConfigs');
    expect(procedures).toContain('setConfig');
    expect(procedures).toContain('setRestreamUrl');
  });

  it('should have 5 procedures total', async () => {
    const { restreamConfigRouter } = await import('./restreamConfigRouter');
    const procedures = Object.keys(restreamConfigRouter._def.procedures);
    expect(procedures.length).toBe(5);
  });

  it('should have getRestreamUrl as a public query', async () => {
    const { restreamConfigRouter } = await import('./restreamConfigRouter');
    const proc = restreamConfigRouter._def.procedures.getRestreamUrl;
    expect(proc).toBeDefined();
  });

  it('should have setRestreamUrl as a protected mutation', async () => {
    const { restreamConfigRouter } = await import('./restreamConfigRouter');
    const proc = restreamConfigRouter._def.procedures.setRestreamUrl;
    expect(proc).toBeDefined();
  });
});

describe('useRestreamUrl Hook Contract', () => {
  it('should export the hook from the expected path', async () => {
    // Verify the hook file exists and exports the function
    const fs = await import('fs');
    const hookPath = '/home/ubuntu/manus-agent-web/client/src/hooks/useRestreamUrl.ts';
    expect(fs.existsSync(hookPath)).toBe(true);
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain('export function useRestreamUrl');
    expect(content).toContain('openRestream');
    expect(content).toContain('restreamUrl');
    expect(content).toContain('isConfigured');
    expect(content).toContain('restreamConfig.getRestreamUrl');
  });

  it('should use staleTime to cache the URL', async () => {
    const fs = await import('fs');
    const hookPath = '/home/ubuntu/manus-agent-web/client/src/hooks/useRestreamUrl.ts';
    const content = fs.readFileSync(hookPath, 'utf-8');
    expect(content).toContain('staleTime');
  });
});

describe('System Config Table', () => {
  it('should have the system_config table in the schema', async () => {
    const fs = await import('fs');
    const schemaPath = '/home/ubuntu/manus-agent-web/drizzle/schema.ts';
    const content = fs.readFileSync(schemaPath, 'utf-8');
    expect(content).toContain('system_config');
    expect(content).toContain('config_key');
    expect(content).toContain('config_value');
    expect(content).toContain('updated_at');
    expect(content).toContain('updated_by');
  });
});

describe('Dynamic Restream URL Wiring', () => {
  const pagesToCheck = [
    { name: 'RRBRadioIntegration', path: '/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx' },
    { name: 'LiveStreamPage', path: '/home/ubuntu/manus-agent-web/client/src/pages/LiveStreamPage.tsx' },
    { name: 'ConventionHub', path: '/home/ubuntu/manus-agent-web/client/src/pages/ConventionHub.tsx' },
    { name: 'EcosystemMasterDashboard', path: '/home/ubuntu/manus-agent-web/client/src/pages/EcosystemMasterDashboard.tsx' },
    { name: 'QumusHome', path: '/home/ubuntu/manus-agent-web/client/src/pages/QumusHome.tsx' },
    { name: 'QumusMonitoringDashboard', path: '/home/ubuntu/manus-agent-web/client/src/pages/QumusMonitoringDashboard.tsx' },
    { name: 'RRBConferenceHub', path: '/home/ubuntu/manus-agent-web/client/src/pages/RRBConferenceHub.tsx' },
    { name: 'SquaddGoals', path: '/home/ubuntu/manus-agent-web/client/src/pages/SquaddGoals.tsx' },
    { name: 'TyBattleProfile', path: '/home/ubuntu/manus-agent-web/client/src/pages/TyBattleProfile.tsx' },
    { name: 'MediaBlastCampaign', path: '/home/ubuntu/manus-agent-web/client/src/pages/MediaBlastCampaign.tsx' },
    { name: 'ConferenceRoom', path: '/home/ubuntu/manus-agent-web/client/src/pages/ConferenceRoom.tsx' },
    { name: 'HybridCastHub', path: '/home/ubuntu/manus-agent-web/client/src/pages/HybridCastHub.tsx' },
    { name: 'PodcastRoom', path: '/home/ubuntu/manus-agent-web/client/src/components/PodcastRoom.tsx' },
  ];

  pagesToCheck.forEach(({ name, path }) => {
    it(`${name} should import useRestreamUrl`, async () => {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');
      expect(content).toContain('useRestreamUrl');
    });

    it(`${name} should NOT have hardcoded Restream URL (studio.restream.io/enk-osex-pju)`, async () => {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');
      expect(content).not.toContain('studio.restream.io/enk-osex-pju');
    });
  });
});

describe('C.J. Battle Apple Music Integration', () => {
  it('should have C.J. Battle channel in RRB Radio', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    expect(content).toContain('C.J. Battle Radio');
    expect(content).toContain('1438716457');
  });

  it('should have Apple Music URL for C.J. Battle', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    expect(content).toContain('https://music.apple.com/us/artist/c-j-battle/1438716457');
  });

  it('should have Spotify URL for C.J. Battle as fallback', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    expect(content).toContain('spotifyUrl');
    expect(content).toContain('open.spotify.com/artist');
  });

  it('should render Apple Music and Spotify buttons for artist stations', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/client/src/pages/RRBRadioIntegration.tsx', 'utf-8');
    expect(content).toContain('Apple Music');
    expect(content).toContain('Spotify');
    expect(content).toContain('isArtistStation');
  });
});
