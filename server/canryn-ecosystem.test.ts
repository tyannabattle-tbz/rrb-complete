import { describe, it, expect, beforeEach } from 'vitest';
import { canrynEcosystem } from './_core/canrynEcosystem';
import { rrbRadioService } from './_core/rrbRadioService';
import { sweetMiraclesService } from './_core/sweetMiraclesService';

describe('Canryn Ecosystem', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('Ecosystem Configuration', () => {
    it('should have correct company name', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.companyName).toBe('Canryn Production Inc.');
    });

    it('should have correct founder', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.founder).toBe('Seabrun "Candy" Hunter Jr.');
    });

    it('should have correct operators', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.operators).toEqual(['Jaelon', 'Sean']);
    });

    it('should have correct motto', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.motto).toBe('A Corporation with the Right Stuff!');
    });

    it('should have 90% autonomy target', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.autonomyTarget).toBe(90);
    });

    it('should have 10% human oversight level', () => {
      const config = canrynEcosystem.getConfig();
      expect(config.humanOversightLevel).toBe(10);
    });
  });

  describe('Subsidiaries', () => {
    it('should have 11 entities initialized (6 Legacy Restored + 5 Legacy Continued)', () => {
      const subsidiaries = canrynEcosystem.getAllSubsidiaries();
      expect(subsidiaries).toHaveLength(11);
    });

    it('should have 6 Legacy Restored subsidiaries', () => {
      const subsidiaries = canrynEcosystem.getAllSubsidiaries();
      const legacyRestored = ['Canryn Publishing Co.', 'Seasha Distribution Co.', 'Annas Promotion Co.', 'Jaelon Enterprises', 'Little C Recording Co.', "Sean's Music World"];
      const found = subsidiaries.filter(s => legacyRestored.includes(s.name));
      expect(found).toHaveLength(6);
    });

    it('should have 5 Legacy Continued products', () => {
      const subsidiaries = canrynEcosystem.getAllSubsidiaries();
      const legacyContinued = ['Qumus', 'RRB Radio', 'HybridCast', 'Sweet Miracles', 'Rockin Rockin Boogie'];
      const found = subsidiaries.filter(s => legacyContinued.includes(s.name));
      expect(found).toHaveLength(5);
    });

    it('should have Qumus as central brain', () => {
      const qumus = canrynEcosystem.getSubsidiary('qumus-core');
      expect(qumus).toBeDefined();
      expect(qumus?.name).toBe('Qumus');
      expect(qumus?.autonomyLevel).toBeGreaterThanOrEqual(90);
    });

    it('should have RRB Radio subsidiary', () => {
      const rrb = canrynEcosystem.getSubsidiary('rrb-radio');
      expect(rrb).toBeDefined();
      expect(rrb?.name).toBe('RRB Radio');
      expect(rrb?.status).toBe('active');
    });

    it('should have HybridCast subsidiary', () => {
      const hybridcast = canrynEcosystem.getSubsidiary('hybridcast');
      expect(hybridcast).toBeDefined();
      expect(hybridcast?.name).toBe('HybridCast');
      expect(hybridcast?.status).toBe('active');
    });

    it('should have Sweet Miracles subsidiary', () => {
      const sweetMiracles = canrynEcosystem.getSubsidiary('sweet-miracles');
      expect(sweetMiracles).toBeDefined();
      expect(sweetMiracles?.name).toBe('Sweet Miracles');
      expect(sweetMiracles?.status).toBe('active');
    });

    it('should have Rockin Rockin Boogie subsidiary', () => {
      const rockin = canrynEcosystem.getSubsidiary('rockin-boogie');
      expect(rockin).toBeDefined();
      expect(rockin?.name).toBe('Rockin Rockin Boogie');
      expect(rockin?.status).toBe('active');
    });
  });

  describe('System Health', () => {
    it('should report healthy system', () => {
      const health = canrynEcosystem.getHealthReport();
      expect(health.status).toBe('HEALTHY');
      expect(health.systemHealth).toBeGreaterThanOrEqual(80);
    });

    it('should have autonomy level around 90%', () => {
      const health = canrynEcosystem.getHealthReport();
      expect(health.autonomyLevel).toBeGreaterThanOrEqual(80);
    });

    it('should list all subsidiaries in health report', () => {
      const health = canrynEcosystem.getHealthReport();
      expect(health.subsidiaryStatus).toHaveLength(11);
    });
  });

  describe('Metrics', () => {
    it('should report 11 total entities', () => {
      const metrics = canrynEcosystem.getMetrics();
      expect(metrics.totalSubsidiaries).toBe(11);
    });

    it('should report 11 active entities', () => {
      const metrics = canrynEcosystem.getMetrics();
      expect(metrics.activeSubsidiaries).toBe(11);
    });

    it('should have system health metric', () => {
      const metrics = canrynEcosystem.getMetrics();
      expect(metrics.systemHealth).toBeGreaterThan(0);
      expect(metrics.systemHealth).toBeLessThanOrEqual(100);
    });

    it('should track human interventions', () => {
      const metrics = canrynEcosystem.getMetrics();
      expect(metrics.humanInterventions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Map', () => {
    it('should show Qumus integrations', () => {
      const map = canrynEcosystem.getIntegrationMap();
      expect(map['Qumus']).toBeDefined();
      expect(map['Qumus'].length).toBeGreaterThan(0);
    });

    it('should show RRB Radio integrations', () => {
      const map = canrynEcosystem.getIntegrationMap();
      expect(map['RRB Radio']).toBeDefined();
      expect(map['RRB Radio']).toContain('Qumus');
    });

    it('should show HybridCast integrations', () => {
      const map = canrynEcosystem.getIntegrationMap();
      expect(map['HybridCast']).toBeDefined();
      expect(map['HybridCast']).toContain('Qumus');
    });
  });

  describe('Status Management', () => {
    it('should update subsidiary status', () => {
      const success = canrynEcosystem.updateSubsidiaryStatus('rrb-radio', 'maintenance');
      expect(success).toBe(true);

      const rrb = canrynEcosystem.getSubsidiary('rrb-radio');
      expect(rrb?.status).toBe('maintenance');
    });

    it('should return false for invalid subsidiary', () => {
      const success = canrynEcosystem.updateSubsidiaryStatus('invalid-id', 'maintenance');
      expect(success).toBe(false);
    });
  });

  describe('Autonomy Management', () => {
    it('should update autonomy level', () => {
      const success = canrynEcosystem.updateAutonomyLevel('qumus-core', 95);
      expect(success).toBe(true);

      const qumus = canrynEcosystem.getSubsidiary('qumus-core');
      expect(qumus?.autonomyLevel).toBe(95);
    });

    it('should reject invalid autonomy levels', () => {
      const success1 = canrynEcosystem.updateAutonomyLevel('qumus-core', -10);
      expect(success1).toBe(false);

      const success2 = canrynEcosystem.updateAutonomyLevel('qumus-core', 150);
      expect(success2).toBe(false);
    });
  });

  describe('Human Override', () => {
    it('should enable human override', () => {
      const success = canrynEcosystem.enableHumanOverride('rrb-radio');
      expect(success).toBe(true);

      const rrb = canrynEcosystem.getSubsidiary('rrb-radio');
      expect(rrb?.humanOversightRequired).toBe(true);
    });

    it('should disable human override', () => {
      canrynEcosystem.enableHumanOverride('rrb-radio');
      const success = canrynEcosystem.disableHumanOverride('rrb-radio');
      expect(success).toBe(true);

      const rrb = canrynEcosystem.getSubsidiary('rrb-radio');
      expect(rrb?.humanOversightRequired).toBe(false);
    });
  });
});

describe('RRB Radio Service', () => {
  it('should schedule broadcast', async () => {
    const broadcastId = await rrbRadioService.scheduleBroadcast({
      broadcastId: '',
      stationId: 'test-station',
      title: 'Test Broadcast',
      description: 'Test Description',
      videoUrl: 'https://example.com/video.mp4',
      scheduledTime: new Date(Date.now() + 3600000),
      duration: 60,
      status: 'scheduled',
      automationStatus: 'active',
      viewerCount: 0,
      bitrate: 5000,
      quality: '1080p',
    });

    expect(broadcastId).toBeDefined();
    expect(broadcastId).toMatch(/^broadcast-/);
  });

  it('should list broadcasts', async () => {
    const broadcasts = await rrbRadioService.listBroadcasts('test-station');
    expect(Array.isArray(broadcasts)).toBe(true);
  });

  it('should get broadcast stats', async () => {
    const stats = await rrbRadioService.getBroadcastStats();
    expect(stats).toBeDefined();
    expect(stats.totalBroadcasts).toBeGreaterThanOrEqual(0);
  });
});

describe('Sweet Miracles Service', () => {
  it('should process donation', async () => {
    const donationId = await sweetMiraclesService.processDonation({
      donorId: 'donor-123',
      amount: 100,
      currency: 'USD',
      purpose: 'Community Support',
      timestamp: new Date(),
      status: 'completed',
    });

    expect(donationId).toBeDefined();
    expect(donationId).toMatch(/^donation-/);
  });

  it('should create grant', async () => {
    const grantId = await sweetMiraclesService.createGrant({
      title: 'Community Grant',
      description: 'Grant for community projects',
      amount: 5000,
      deadline: new Date(Date.now() + 86400000),
      status: 'open',
      purpose: 'Community Development',
    });

    expect(grantId).toBeDefined();
    expect(grantId).toMatch(/^grant-/);
  });

  it('should create campaign', async () => {
    const campaignId = await sweetMiraclesService.createCampaign({
      title: 'Emergency Relief',
      description: 'Emergency relief campaign',
      targetAmount: 10000,
      currentAmount: 0,
      deadline: new Date(Date.now() + 86400000),
      status: 'active',
      beneficiaries: ['beneficiary-1', 'beneficiary-2'],
    });

    expect(campaignId).toBeDefined();
    expect(campaignId).toMatch(/^campaign-/);
  });

  it('should get fundraising stats', async () => {
    const stats = await sweetMiraclesService.getFundraisingStats();
    expect(stats).toBeDefined();
    expect(stats.totalDonations).toBeGreaterThanOrEqual(0);
    expect(stats.totalRaised).toBeGreaterThanOrEqual(0);
  });

  it('should get impact report', async () => {
    const report = await sweetMiraclesService.getImpactReport();
    expect(report).toBeDefined();
    expect(report.motto).toBe('A Voice for the Voiceless');
    expect(report.totalFundsRaised).toBeGreaterThanOrEqual(0);
  });
});
