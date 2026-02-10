/**
 * Stripe Donation-Only Compliance, Advertising, and Business Module Tests v10.7
 * Verifies donation-only Stripe setup, advertising services, and all business modules
 */
import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

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

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@canrynproduction.com',
      name: 'Canryn Admin',
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

// ============================================================
// STRIPE DONATIONS-ONLY COMPLIANCE
// ============================================================
describe('Stripe Donation-Only Compliance', () => {
  it('donation tiers are properly configured for legacy recovery', async () => {
    const { getDonationTiers, getDonationPurposes } = await import('./config/stripeProducts');

    const tiers = getDonationTiers();
    expect(tiers.length).toBeGreaterThanOrEqual(3);

    for (const tier of tiers) {
      expect(tier.id).toBeDefined();
      expect(tier.label).toBeDefined();
      expect(tier.amount).toBeGreaterThan(0);
      expect(tier.description).toBeDefined();
    }

    const purposes = getDonationPurposes();
    expect(purposes.length).toBeGreaterThanOrEqual(1);
    const purposeIds = purposes.map((p: any) => p.id);
    expect(purposeIds).toContain('legacy-recovery');
  });

  it('rrbPayments returns donation tiers as public endpoint', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const tiers = await caller.rrbPayments.getDonationTiers();
    expect(tiers).toBeDefined();
    expect(Array.isArray(tiers)).toBe(true);
    expect(tiers.length).toBeGreaterThanOrEqual(3);
  });

  it('rrbPayments returns donation purposes', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const purposes = await caller.rrbPayments.getDonationPurposes();
    expect(purposes).toBeDefined();
    expect(Array.isArray(purposes)).toBe(true);
    const legacyPurpose = purposes.find((p: any) => p.id === 'legacy-recovery');
    expect(legacyPurpose).toBeDefined();
  });

  it('no subscription or product-purchase endpoints exist on rrbPayments', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // tRPC proxy creates lazy accessors, so we test by calling and expecting NOT_FOUND
    await expect((caller.rrbPayments as any).cancelSubscription()).rejects.toThrow();
    await expect((caller.rrbPayments as any).getSubscriptionStatus()).rejects.toThrow();
    await expect((caller.rrbPayments as any).getPricingPlans()).rejects.toThrow();
  });
});

// ============================================================
// COMMERCIAL ENGINE & ADVERTISING
// ============================================================
describe('Commercial Engine & Advertising', () => {
  it('commercials.getStats returns stats with categories', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const stats = await caller.commercials.getStats();
    expect(stats).toBeDefined();
    expect(stats.totalCommercials).toBeGreaterThanOrEqual(7);
    expect(stats.byCategory).toBeDefined();
  });

  it('commercials.getClientAds returns client ad list', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const clientAds = await caller.commercials.getClientAds();
    expect(clientAds).toBeDefined();
    expect(Array.isArray(clientAds)).toBe(true);
  });

  it('commercials.getCommercials returns all commercials', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const commercials = await caller.commercials.getCommercials({});
    expect(commercials).toBeDefined();
    expect(Array.isArray(commercials)).toBe(true);
    expect(commercials.length).toBeGreaterThanOrEqual(7);
  });
});

// ============================================================
// BUSINESS MODULES
// ============================================================
describe('Business Modules — Bookkeeping', () => {
  it('bookkeeping.getAccounts returns chart of accounts', async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const accounts = await caller.bookkeeping.getAccounts({});
    expect(accounts).toBeDefined();
    expect(Array.isArray(accounts)).toBe(true);
  });
});

describe('Business Modules — HR', () => {
  it('hr.getEmployees returns employee list', async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const employees = await caller.hr.getEmployees({});
    expect(employees).toBeDefined();
    expect(Array.isArray(employees)).toBe(true);
  });
});

describe('Business Modules — Accounting', () => {
  it('accounting.getFinancialSummary returns financial data', async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const summary = await caller.accounting.getFinancialSummary({});
    expect(summary).toBeDefined();
    expect(summary.totalReceivable).toBeDefined();
    expect(summary.totalPayable).toBeDefined();
  });
});

describe('Business Modules — Legal', () => {
  it('legal.getContracts returns contract list', async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const contracts = await caller.legal.getContracts({});
    expect(contracts).toBeDefined();
    expect(Array.isArray(contracts)).toBe(true);
  });
});

// ============================================================
// AI BUSINESS ASSISTANTS
// ============================================================
describe('AI Business Assistants', () => {
  it('aiBusinessAssistants.getBots returns all 10 active bots', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const bots = await caller.aiBusinessAssistants.getBots();
    expect(bots).toBeDefined();
    expect(Array.isArray(bots)).toBe(true);
    expect(bots.length).toBe(10);
    const activeBots = bots.filter((b: any) => b.status === 'active');
    expect(activeBots.length).toBe(10);
  });

  it('aiBusinessAssistants.getStatus returns engine status', async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const status = await caller.aiBusinessAssistants.getStatus();
    expect(status).toBeDefined();
    expect(status.totalBots).toBe(10);
    expect(status.activeBots).toBe(10);
  });
});

// ============================================================
// GRANT DISCOVERY via Sweet Miracles (chunk5 nested router)
// ============================================================
describe('Grant Discovery — Sweet Miracles', () => {
  it('sweetMiracles.grants.search returns grant results', async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.sweetMiracles.grants.search({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
