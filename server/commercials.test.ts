import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@canryn.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://test.canryn.com" },
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

describe("commercials", () => {
  // ─── Commercial Library ─────────────────────────────────────────────────

  describe("getCommercials", () => {
    it("returns seeded default commercials", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const commercials = await caller.commercials.getCommercials();

      expect(Array.isArray(commercials)).toBe(true);
      expect(commercials.length).toBeGreaterThanOrEqual(7); // 7 seeded defaults
    });

    it("filters commercials by category", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const stationIds = await caller.commercials.getCommercials({ category: "station_id" });

      expect(stationIds.length).toBeGreaterThanOrEqual(2); // 2 seeded station IDs
      stationIds.forEach(c => {
        expect(c.category).toBe("station_id");
      });
    });

    it("filters commercials by brand", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const sweetMiracles = await caller.commercials.getCommercials({ brand: "sweet_miracles" });

      expect(sweetMiracles.length).toBeGreaterThanOrEqual(2); // PSA + fundraiser
      sweetMiracles.forEach(c => {
        expect(c.brand).toBe("sweet_miracles");
      });
    });
  });

  // ─── Single Commercial ──────────────────────────────────────────────────

  describe("getCommercial", () => {
    it("returns a specific commercial by ID", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const commercial = await caller.commercials.getCommercial({ id: "commercial_default_station_id_1" });

      expect(commercial).not.toBeNull();
      expect(commercial!.category).toBe("station_id");
      expect(commercial!.brand).toBe("rrb_radio");
      expect(commercial!.script).toContain("Rockin");
    });

    it("returns null for non-existent commercial", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const commercial = await caller.commercials.getCommercial({ id: "nonexistent_id" });

      expect(commercial).toBeNull();
    });
  });

  // ─── Commercial Generation ──────────────────────────────────────────────

  describe("generate", () => {
    it("generates a new commercial script (protected)", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const commercial = await caller.commercials.generate({
        category: "promo",
        brand: "canryn_production",
        targetDuration: 15,
      });

      expect(commercial).toBeDefined();
      expect(commercial.id).toMatch(/^commercial_/);
      expect(commercial.category).toBe("promo");
      expect(commercial.brand).toBe("canryn_production");
      expect(commercial.script.length).toBeGreaterThan(10);
      expect(commercial.status).toBe("draft");
      expect(commercial.generatedBy).toBe("ai");
      expect(commercial.duration).toBeGreaterThan(0);
    });

    it("generates a station ID commercial", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const commercial = await caller.commercials.generate({
        category: "station_id",
        brand: "rrb_radio",
        targetDuration: 10,
      });

      expect(commercial.category).toBe("station_id");
      expect(commercial.brand).toBe("rrb_radio");
    });

    it("accepts custom prompt direction", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const commercial = await caller.commercials.generate({
        category: "event",
        brand: "sweet_miracles",
        customPrompt: "Announce the community wellness fair on March 15th",
        targetDuration: 30,
      });

      expect(commercial.category).toBe("event");
      expect(commercial.brand).toBe("sweet_miracles");
    });
  });

  // ─── Update Commercial ──────────────────────────────────────────────────

  describe("update", () => {
    it("updates a commercial status to active", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updated = await caller.commercials.update({
        id: "commercial_default_station_id_1",
        status: "active",
      });

      expect(updated.status).toBe("active");
      expect(updated.id).toBe("commercial_default_station_id_1");
    });

    it("updates a commercial script", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const newScript = "Updated test script for RRB Radio.";
      const updated = await caller.commercials.update({
        id: "commercial_default_station_id_2",
        script: newScript,
      });

      expect(updated.script).toBe(newScript);
    });

    it("throws error for non-existent commercial", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.commercials.update({ id: "nonexistent", status: "active" })
      ).rejects.toThrow("Commercial not found");
    });
  });

  // ─── Rotation ───────────────────────────────────────────────────────────

  describe("getRotation", () => {
    it("returns rotation state", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const rotation = await caller.commercials.getRotation();

      expect(rotation).toBeDefined();
      expect(typeof rotation.totalPlaysToday).toBe("number");
      expect(typeof rotation.rotationActive).toBe("boolean");
    });
  });

  describe("getNextCommercial", () => {
    it("returns a commercial from the rotation", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const next = await caller.commercials.getNextCommercial();

      // Should return a commercial since we have active seeded ones
      expect(next).not.toBeNull();
      if (next) {
        expect(next.status).toBe("active");
        expect(next.script.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Mark Played ────────────────────────────────────────────────────────

  describe("markPlayed", () => {
    it("increments play count for a commercial", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Get initial play count
      const before = await caller.commercials.getCommercial({ id: "commercial_default_psa_1" });
      const initialCount = before?.playCount || 0;

      // Mark as played
      const result = await caller.commercials.markPlayed({ id: "commercial_default_psa_1" });
      expect(result.success).toBe(true);

      // Verify count incremented
      const after = await caller.commercials.getCommercial({ id: "commercial_default_psa_1" });
      expect(after!.playCount).toBe(initialCount + 1);
    });
  });

  // ─── Stats ──────────────────────────────────────────────────────────────

  describe("getStats", () => {
    it("returns comprehensive commercial statistics", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.commercials.getStats();

      expect(stats.totalCommercials).toBeGreaterThanOrEqual(7);
      expect(stats.activeCommercials).toBeGreaterThanOrEqual(1);
      expect(typeof stats.totalPlaysToday).toBe("number");
      expect(typeof stats.totalPlaysAllTime).toBe("number");
      expect(typeof stats.rotationActive).toBe("boolean");

      // Category breakdown
      expect(stats.byCategory).toBeDefined();
      expect(typeof stats.byCategory.promo).toBe("number");
      expect(typeof stats.byCategory.psa).toBe("number");
      expect(typeof stats.byCategory.station_id).toBe("number");

      // Brand breakdown
      expect(stats.byBrand).toBeDefined();
      expect(typeof stats.byBrand.rrb_radio).toBe("number");
      expect(typeof stats.byBrand.sweet_miracles).toBe("number");

      // Available brands and categories
      expect(stats.availableBrands.length).toBeGreaterThanOrEqual(6);
      expect(stats.availableCategories).toContain("promo");
      expect(stats.availableCategories).toContain("psa");
      expect(stats.availableCategories).toContain("station_id");
    });
  });

  // ─── Delete ─────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("deletes a commercial", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Generate a commercial to delete
      const commercial = await caller.commercials.generate({
        category: "jingle",
        brand: "rrb_radio",
        targetDuration: 5,
      });

      // Delete it
      const result = await caller.commercials.delete({ id: commercial.id });
      expect(result.success).toBe(true);

      // Verify it's gone
      const deleted = await caller.commercials.getCommercial({ id: commercial.id });
      expect(deleted).toBeNull();
    });

    it("throws error for non-existent commercial", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.commercials.delete({ id: "nonexistent" })
      ).rejects.toThrow("Commercial not found");
    });
  });
});
