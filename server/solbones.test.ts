import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-solbones-user",
    email: "test@solbones.com",
    name: "Test Player",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("solbones", () => {
  describe("getFrequencies", () => {
    it("returns the list of Solfeggio frequencies", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getFrequencies();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Each frequency should have name, frequency number, and description
      result.forEach((freq) => {
        expect(freq).toHaveProperty("name");
        expect(freq).toHaveProperty("frequency");
        expect(freq).toHaveProperty("description");
        expect(typeof freq.name).toBe("string");
        expect(typeof freq.frequency).toBe("number");
        expect(typeof freq.description).toBe("string");
      });
    });

    it("includes the core Solfeggio notes", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getFrequencies();
      const names = result.map((f) => f.name);

      // Should include the standard Solfeggio scale notes
      expect(names).toContain("UT");
      expect(names).toContain("SOL");
      expect(names).toContain("LA");
    });
  });

  describe("getLeaderboard", () => {
    it("returns an array for the public leaderboard", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getLeaderboard({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("respects the limit parameter", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getLeaderboard({ limit: 5 });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("rollDice", () => {
    it("returns a successful roll with frequency data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.rollDice({ notes: "Test roll" });

      expect(result.success).toBe(true);
      expect(result.frequency).toBeDefined();
      expect(result.frequency.name).toBeDefined();
      expect(result.frequency.frequency).toBeDefined();
      expect(typeof result.totalRolls).toBe("number");
      expect(result.totalRolls).toBeGreaterThanOrEqual(1);
    });

    it("rejects unauthenticated users", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.solbones.rollDice({ notes: "Should fail" })
      ).rejects.toThrow();
    });
  });

  describe("getHistory", () => {
    it("returns frequency history for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getHistory({ limit: 20 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("rejects unauthenticated users", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.solbones.getHistory({ limit: 20 })
      ).rejects.toThrow();
    });
  });

  describe("getStats", () => {
    it("returns stats for authenticated user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.solbones.getStats();

      // Should return either null or an object with stats
      if (result !== null) {
        expect(result).toHaveProperty("userId");
      }
    });

    it("rejects unauthenticated users", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.solbones.getStats()).rejects.toThrow();
    });
  });
});
