/**
 * QUMUS Full Integration Tests v10.8
 * Tests QUMUS identity, ecosystem status, business oversight,
 * Stripe donation-only compliance, advertising, and all bot activation
 */
import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Create an unauthenticated context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: { origin: 'https://test.example.com' },
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

// Create an authenticated context for protected procedures
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: 'https',
      headers: { origin: 'https://test.example.com' },
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

describe('QUMUS Identity System', () => {
  it('returns QUMUS identification with full ecosystem awareness', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getIdentification();

    expect(result.identification).toContain('QUMUS');
    expect(result.identification).toContain('Canryn Production');
    expect(result.identification).toContain('Autonomous Orchestration Engine');
    expect(result.identification).toContain('Sweet Miracles Foundation');
    expect(result.identification).toContain("Rockin' Rockin' Boogie");
    expect(result.identification).toContain('HybridCast');
    expect(result.identification).toContain('Solbones');
    // v10.8 additions — all bots and business modules
    expect(result.identification).toContain('10 AI Bots');
    expect(result.identification).toContain('Bookkeeping');
    expect(result.identification).toContain('HR');
    expect(result.identification).toContain('Accounting');
    expect(result.identification).toContain('Legal');
    expect(result.identification).toContain('Commercial Engine');
    expect(result.identification).toContain('Radio Directory');
    expect(result.identification).toContain('Social Media');
    expect(result.identification).toContain('Grant Discovery');
    expect(result.identification).toContain('Donations only');
    expect(result.identification).toContain('Contact Canryn');
    expect(result.timestamp).toBeDefined();
  });

  it('returns QUMUS capabilities with 16+ service integrations', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getCapabilities();

    expect(result.capabilities).toBeDefined();
    expect(result.capabilities.autonomousOrchestration.autonomyLevel).toBeGreaterThanOrEqual(90);
    expect(result.capabilities.serviceIntegration.totalServices).toBeGreaterThanOrEqual(16);
    expect(result.capabilities.serviceIntegration.integratedServices).toContain('Commercial Engine (Radio Ads)');
    expect(result.capabilities.serviceIntegration.integratedServices).toContain('Grant Discovery Engine (50+ Sources)');
    expect(result.capabilities.serviceIntegration.integratedServices).toContain('AI Business Assistants (10 Bots)');
    expect(result.capabilities.serviceIntegration.integratedServices).toContain('Social Media Bots (6 Platforms)');
    expect(result.operationalStatus).toBeDefined();
    expect(result.operationalStatus.rockinRockinBoogieStatus).toBe('ACTIVE');
  });

  it('returns 8 decision policies including donation-aware payment policy', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getDecisionPolicies();

    expect(result.policies).toHaveLength(8);
    const policyNames = result.policies.map((p: any) => p.name);
    expect(policyNames).toContain('Content Policy');
    expect(policyNames).toContain('Payment Policy');
    expect(policyNames).toContain('Compliance Policy');
    expect(policyNames).toContain('System Policy');
    // Check payment policy mentions donations
    const paymentPolicy = result.policies.find((p: any) => p.name === 'Payment Policy');
    expect(paymentPolicy?.description).toContain('donation');
  });

  it('returns 16+ service integrations all ACTIVE', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getServiceIntegrations();

    expect(result.services.length).toBeGreaterThanOrEqual(16);
    const allActive = result.services.every((s: any) => s.status === 'ACTIVE');
    expect(allActive).toBe(true);

    const serviceNames = result.services.map((s: any) => s.name);
    expect(serviceNames).toContain('Stripe');
    expect(serviceNames).toContain('LLM');
    expect(serviceNames).toContain('Commercial Engine');
    expect(serviceNames).toContain('Grant Discovery');
    expect(serviceNames).toContain('AI Business Bots');
    expect(serviceNames).toContain('Radio Directory');
    expect(serviceNames).toContain('Social Media');
    expect(serviceNames).toContain('HybridCast');
  });
});

describe('QUMUS Ecosystem Status', () => {
  it('returns full ecosystem status with all subsystems', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getEcosystemStatus();

    // Check top-level structure
    expect(result.orchestration).toBeDefined();
    expect(result.orchestration.rockinRockinBoogieStatus).toBe('ACTIVE');

    // Check AI bots
    expect(result.aiBots).toBeDefined();
    expect(result.aiBots.total).toBeGreaterThanOrEqual(10);

    // Check business modules
    expect(result.businessModules).toBeDefined();
    expect(result.businessModules.bookkeeping.status).toBe('ACTIVE');
    expect(result.businessModules.bookkeeping.offlineCapable).toBe(true);
    expect(result.businessModules.hr.status).toBe('ACTIVE');
    expect(result.businessModules.hr.offlineCapable).toBe(true);
    expect(result.businessModules.accounting.status).toBe('ACTIVE');
    expect(result.businessModules.legal.status).toBe('ACTIVE');
    expect(result.businessModules.radioDirectory.status).toBe('ACTIVE');
    expect(result.businessModules.advertising.status).toBe('ACTIVE');

    // Check donation model
    expect(result.donations).toBeDefined();
    expect(result.donations.model).toBe('donations-only');
    expect(result.donations.organization).toBe('Sweet Miracles Foundation');
    expect(result.donations.taxStatus).toBe('501(c)(3)');
    expect(result.donations.purpose).toBe('Legacy recovery efforts');
    expect(result.donations.processor).toBe('Stripe');

    // Check identity and services
    expect(result.identity.name).toBe('QUMUS');
    expect(result.services.length).toBeGreaterThanOrEqual(16);
    expect(result.policies).toHaveLength(8);
    expect(result.timestamp).toBeDefined();
  });

  it('returns operational metrics with uptime', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.qumusChat.getOperationalMetrics();

    expect(result.metrics).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.status.autonomyLevel).toBeGreaterThanOrEqual(90);
    expect(result.status.operatingMode).toBe('Full Autonomous Operations');
    expect(result.status.uptime).toBeGreaterThan(0);
  });
});

describe('QUMUS Business Oversight', () => {
  it('oversight service runs and produces a report', async () => {
    const { QumusBusinessOversight } = await import('./services/qumus-business-oversight');

    const report = await QumusBusinessOversight.runOversightScan();

    expect(report).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.overallHealth).toMatch(/healthy|warning|critical/);
    expect(report.autonomyPercentage).toBeGreaterThanOrEqual(90);

    // All 9 modules should be present
    expect(report.modules.bookkeeping).toBeDefined();
    expect(report.modules.hr).toBeDefined();
    expect(report.modules.accounting).toBeDefined();
    expect(report.modules.legal).toBeDefined();
    expect(report.modules.commercials).toBeDefined();
    expect(report.modules.radioDirectory).toBeDefined();
    expect(report.modules.advertising).toBeDefined();
    expect(report.modules.socialMedia).toBeDefined();
    expect(report.modules.grantDiscovery).toBeDefined();

    // All modules should be QUMUS-controlled
    const allModules = Object.values(report.modules);
    const allControlled = allModules.every(m => m.qumusControlled);
    expect(allControlled).toBe(true);
  });

  it('generates status summary for QUMUS chat context', async () => {
    const { QumusBusinessOversight } = await import('./services/qumus-business-oversight');

    // Run a scan first to populate the report
    await QumusBusinessOversight.runOversightScan();

    const summary = QumusBusinessOversight.getStatusSummary();
    expect(summary).toContain('Business Operations');
    expect(summary).toContain('Autonomy');
  });
});

describe('Stripe Donation-Only Compliance', () => {
  it('donation tiers are configured correctly', async () => {
    const { getDonationTiers } = await import('./config/stripeProducts');

    const tiers = getDonationTiers();
    expect(tiers).toBeDefined();
    expect(Array.isArray(tiers)).toBe(true);
    expect(tiers.length).toBeGreaterThanOrEqual(1);

    // All tiers should have required fields
    for (const tier of tiers) {
      expect(tier.id).toBeDefined();
      expect(tier.label).toBeDefined();
    }
  });

  it('Stripe router returns donation tiers', async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const tiers = await caller.rrbPayments.getDonationTiers();
    expect(tiers).toBeDefined();
    expect(Array.isArray(tiers)).toBe(true);
  });
});

describe('AI Business Assistants', () => {
  it('all 10 bots are registered and enabled', async () => {
    const { getAIBusinessAssistants } = await import('./services/ai-business-assistants');

    const engine = getAIBusinessAssistants();
    const bots = engine.getBots();
    expect(bots.length).toBe(10);

    const activeBots = bots.filter((b: any) => b.status === 'active');
    expect(activeBots.length).toBe(10);

    // Check all domains are present
    const domains = bots.map((b: any) => b.domain);
    expect(domains).toContain('bookkeeping');
    expect(domains).toContain('hr');
    expect(domains).toContain('accounting');
    expect(domains).toContain('legal');
    expect(domains).toContain('radio_directory');
    expect(domains).toContain('social_media');
    expect(domains).toContain('content_calendar');
    expect(domains).toContain('engagement');
    expect(domains).toContain('grant_discovery');
    expect(domains).toContain('emergency');
  });
});

describe('Commercial Engine', () => {
  it('has default commercials seeded', async () => {
    const { getCommercialEngine } = await import('./services/commercial-engine');

    const engine = getCommercialEngine();
    const stats = engine.getStats();
    expect(stats.totalCommercials).toBeGreaterThanOrEqual(7);
    expect(stats.activeCommercials).toBeGreaterThanOrEqual(1);

    // Check brand coverage
    expect(Object.keys(stats.byBrand).length).toBeGreaterThanOrEqual(3);
  });

  it('supports client advertising category', async () => {
    const { getCommercialEngine } = await import('./services/commercial-engine');

    const engine = getCommercialEngine();
    const stats = engine.getStats();
    expect(stats.byCategory).toBeDefined();
  });
});

describe('Grant Discovery Engine', () => {
  it('has 10+ grant categories configured', async () => {
    const { getGrantCategories } = await import('./services/grant-discovery-engine');

    const categories = getGrantCategories();
    expect(categories.length).toBeGreaterThanOrEqual(10);
  });

  it('returns discovery stats', async () => {
    const { getDiscoveryStats } = await import('./services/grant-discovery-engine');

    const stats = getDiscoveryStats();
    expect(stats).toBeDefined();
    expect(stats.categories).toBeDefined();
  });
});

describe('QUMUS Complete Engine', () => {
  it('returns system health with autonomy percentage', async () => {
    const { QumusCompleteEngine } = await import('./qumus-complete-engine');

    const health = await QumusCompleteEngine.getSystemHealth();
    expect(health.status).toBe('healthy');
    expect(health.policyCount).toBeGreaterThanOrEqual(8);
    expect(health.activePolicies).toBeGreaterThanOrEqual(8);
    expect(health.engineVersion).toBeDefined();
    expect(health.uptime).toBeGreaterThan(0);
  });
});
