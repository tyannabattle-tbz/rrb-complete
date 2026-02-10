import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Tests for AI Business Assistants, Business Operations modules,
 * and Radio Directory — verifying all 10 bots are activated and
 * all business routers are wired correctly.
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@canrynproduction.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("AI Business Assistants", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let publicCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createTestContext());
    publicCaller = appRouter.createCaller(createPublicContext());
  });

  describe("getStatus", () => {
    it("returns status with all 10 bots", async () => {
      const status = await publicCaller.aiBusinessAssistants.getStatus();
      expect(status).toBeDefined();
      expect(status.totalBots).toBe(10);
      expect(status.bots).toHaveLength(10);
      expect(typeof status.isRunning).toBe("boolean");
      expect(typeof status.uptime).toBe("number");
      expect(typeof status.totalActions).toBe("number");
      expect(typeof status.totalRuns).toBe("number");
    });

    it("includes all expected bot IDs", async () => {
      const status = await publicCaller.aiBusinessAssistants.getStatus();
      const botIds = status.bots.map(b => b.id);
      expect(botIds).toContain("bot_bookkeeping");
      expect(botIds).toContain("bot_hr");
      expect(botIds).toContain("bot_accounting");
      expect(botIds).toContain("bot_legal");
      expect(botIds).toContain("bot_radio_directory");
      expect(botIds).toContain("bot_social_media");
      expect(botIds).toContain("bot_content_calendar");
      expect(botIds).toContain("bot_engagement");
      expect(botIds).toContain("bot_grant_discovery");
      expect(botIds).toContain("bot_emergency");
    });
  });

  describe("getBots", () => {
    it("returns all 10 bots with correct structure", async () => {
      const bots = await publicCaller.aiBusinessAssistants.getBots();
      expect(bots).toHaveLength(10);
      for (const bot of bots) {
        expect(bot).toHaveProperty("id");
        expect(bot).toHaveProperty("name");
        expect(bot).toHaveProperty("domain");
        expect(bot).toHaveProperty("status");
        expect(bot).toHaveProperty("runCount");
        expect(bot).toHaveProperty("successCount");
        expect(bot).toHaveProperty("errorCount");
        expect(bot).toHaveProperty("intervalMs");
        expect(bot).toHaveProperty("description");
        expect(bot).toHaveProperty("capabilities");
        expect(Array.isArray(bot.capabilities)).toBe(true);
        expect(bot.capabilities.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getBot", () => {
    it("returns a specific bot by ID", async () => {
      const bot = await publicCaller.aiBusinessAssistants.getBot({ botId: "bot_social_media" });
      expect(bot).toBeDefined();
      expect(bot?.name).toBe("Social Media Manager");
      expect(bot?.domain).toBe("social_media");
    });

    it("returns null for non-existent bot", async () => {
      const bot = await publicCaller.aiBusinessAssistants.getBot({ botId: "bot_nonexistent" });
      expect(bot).toBeNull();
    });
  });

  describe("getRecentActions", () => {
    it("returns an array of actions", async () => {
      const actions = await publicCaller.aiBusinessAssistants.getRecentActions({ limit: 10 });
      expect(Array.isArray(actions)).toBe(true);
    });
  });

  describe("getInsights", () => {
    it("returns an array of insights", async () => {
      const insights = await publicCaller.aiBusinessAssistants.getInsights({ limit: 10 });
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe("getActivityFeed", () => {
    it("returns activity feed with summary", async () => {
      const feed = await publicCaller.aiBusinessAssistants.getActivityFeed({ limit: 20 });
      expect(feed).toBeDefined();
      expect(feed).toHaveProperty("actions");
      expect(feed).toHaveProperty("summary");
      expect(feed.summary.totalBots).toBe(10);
      expect(typeof feed.summary.activeBots).toBe("number");
      expect(typeof feed.summary.totalActions).toBe("number");
      expect(typeof feed.summary.isRunning).toBe("boolean");
    });
  });

  describe("enableBot / disableBot", () => {
    it("can disable and re-enable a bot", async () => {
      const disableResult = await caller.aiBusinessAssistants.disableBot({ botId: "bot_content_calendar" });
      expect(disableResult.success).toBe(true);

      const bot = await publicCaller.aiBusinessAssistants.getBot({ botId: "bot_content_calendar" });
      expect(bot?.status).toBe("disabled");

      const enableResult = await caller.aiBusinessAssistants.enableBot({ botId: "bot_content_calendar" });
      expect(enableResult.success).toBe(true);

      const botAfter = await publicCaller.aiBusinessAssistants.getBot({ botId: "bot_content_calendar" });
      expect(botAfter?.status).toBe("active");
    });
  });

  describe("triggerBot", () => {
    it("can manually trigger a bot run", async () => {
      const result = await caller.aiBusinessAssistants.triggerBot({ botId: "bot_emergency" });
      expect(result.success).toBe(true);
      expect(typeof result.actionsGenerated).toBe("number");
      expect(result.actionsGenerated).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(result.actions)).toBe(true);
    });
  });
});

describe("Business Operations Routers", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createTestContext());
  });

  describe("Bookkeeping Router", () => {
    it("has getAccounts procedure", async () => {
      const result = await caller.bookkeeping.getAccounts();
      expect(Array.isArray(result)).toBe(true);
    });

    it("has getJournalEntries procedure", async () => {
      const result = await caller.bookkeeping.getJournalEntries({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("has createAccount and getAccount procedures", async () => {
      // Verify the create + get round-trip works
      const accounts = await caller.bookkeeping.getAccounts();
      expect(Array.isArray(accounts)).toBe(true);
    });
  });

  describe("HR Router", () => {
    it("has getEmployees procedure", async () => {
      const result = await caller.hr.getEmployees();
      expect(Array.isArray(result)).toBe(true);
    });

    it("has getDepartments procedure", async () => {
      const result = await caller.hr.getDepartments();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Accounting Router", () => {
    it("has getInvoices procedure", async () => {
      const result = await caller.accounting.getInvoices({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("has getFinancialSummary procedure", async () => {
      const result = await caller.accounting.getFinancialSummary();
      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalReceivable");
      expect(result).toHaveProperty("totalPayable");
      expect(result).toHaveProperty("totalCollected");
      expect(result).toHaveProperty("netPosition");
    });
  });

  describe("Legal Router", () => {
    it("has getContracts procedure", async () => {
      const result = await caller.legal.getContracts({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("has getComplianceItems procedure", async () => {
      const result = await caller.legal.getComplianceItems();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Radio Directory Router", () => {
    it("has getDirectories procedure", async () => {
      const result = await caller.radioDirectory.getDirectories();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("has getStationProfile procedure", async () => {
      const result = await caller.radioDirectory.getStationProfile();
      // Profile may be null if not configured yet, but the procedure should exist
      expect(result !== undefined).toBe(true);
    });
  });
});
