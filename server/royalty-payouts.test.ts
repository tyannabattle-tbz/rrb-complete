import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

describe("Royalty Payouts — Stripe Connect Integration", () => {
  describe("Router file structure", () => {
    it("should have the royaltyPayouts router file", () => {
      const exists = fs.existsSync("server/routers/royaltyPayouts.ts");
      expect(exists).toBe(true);
    });

    it("should export royaltyPayoutsRouter", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("export const royaltyPayoutsRouter");
    });

    it("should be wired into main routers.ts", () => {
      const content = fs.readFileSync("server/routers.ts", "utf-8");
      expect(content).toContain("import { royaltyPayoutsRouter }");
      expect(content).toContain("royaltyPayouts: royaltyPayoutsRouter");
    });
  });

  describe("Stripe Connect onboarding procedure", () => {
    it("should have createConnectOnboarding procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("createConnectOnboarding");
      expect(content).toContain("protectedProcedure");
    });

    it("should create Express Connect accounts", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain('type: "express"');
      expect(content).toContain("stripe.accounts.create");
    });

    it("should create account onboarding links", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("stripe.accountLinks.create");
      expect(content).toContain("account_onboarding");
    });

    it("should verify project ownership before onboarding", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("eq(royaltyProjects.createdBy, ctx.user.id)");
      expect(content).toContain("Access denied");
    });
  });

  describe("Payout execution procedures", () => {
    it("should have payDistribution procedure for individual payouts", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("payDistribution");
      expect(content).toContain("stripe.transfers.create");
    });

    it("should validate minimum payout amount ($0.50)", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("amountCents < 50");
      expect(content).toContain("Payout amount must be at least $0.50");
    });

    it("should prevent double-payment of distributions", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain('dist.status === "paid"');
      expect(content).toContain("Distribution already paid");
    });

    it("should require Stripe Connect onboarding completion", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("stripeOnboardingComplete");
      expect(content).toContain("not completed Stripe Connect onboarding");
    });

    it("should mark distributions as paid after successful transfer", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain('status: "paid"');
      expect(content).toContain("transactionRef: transfer.id");
    });

    it("should include transfer metadata for webhook reconciliation", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("distributionId: dist.id.toString()");
      expect(content).toContain("collaboratorId: collab.id.toString()");
      expect(content).toContain("projectId: project.id.toString()");
    });
  });

  describe("Batch payout procedure", () => {
    it("should have batchPayProject procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("batchPayProject");
    });

    it("should skip collaborators without Stripe Connect", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain('"No Stripe Connect account"');
      expect(content).toContain('status: "skipped"');
    });

    it("should skip amounts below minimum", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain('"Amount below $0.50 minimum"');
    });

    it("should return summary with paid/skipped/failed counts", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("summary:");
      expect(content).toContain("paid:");
      expect(content).toContain("skipped:");
      expect(content).toContain("failed:");
      expect(content).toContain("totalPaid:");
    });

    it("should notify owner after batch payouts", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("notifyOwner");
      expect(content).toContain("Batch Royalty Payouts Complete");
    });
  });

  describe("Query procedures", () => {
    it("should have getPayoutHistory procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("getPayoutHistory");
    });

    it("should have getPendingPayouts procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("getPendingPayouts");
    });

    it("should have checkOnboardingStatus procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("checkOnboardingStatus");
    });

    it("should have updatePayoutMethod procedure", () => {
      const content = fs.readFileSync("server/routers/royaltyPayouts.ts", "utf-8");
      expect(content).toContain("updatePayoutMethod");
      expect(content).toContain("stripe_connect");
      expect(content).toContain("manual");
      expect(content).toContain("check");
      expect(content).toContain("wire");
      expect(content).toContain("paypal");
    });
  });

  describe("Webhook handlers for payouts", () => {
    it("should handle transfer.paid events", () => {
      const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");
      expect(content).toContain('"transfer.paid"');
      expect(content).toContain("handleTransferPaid");
    });

    it("should handle account.updated events for onboarding", () => {
      const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");
      expect(content).toContain('"account.updated"');
      expect(content).toContain("handleAccountUpdated");
    });

    it("should confirm distribution payment on transfer.paid", () => {
      const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");
      expect(content).toContain("Royalty Payout Confirmed");
    });

    it("should update onboarding status on account.updated", () => {
      const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");
      expect(content).toContain("stripeOnboardingComplete: true");
      expect(content).toContain("Artist Payout Account Ready");
    });
  });

  describe("Database schema", () => {
    it("should have stripeConnectAccountId in royalty_collaborators", () => {
      const content = fs.readFileSync("drizzle/schema.ts", "utf-8");
      expect(content).toContain("stripeConnectAccountId");
    });

    it("should have stripeOnboardingComplete in royalty_collaborators", () => {
      const content = fs.readFileSync("drizzle/schema.ts", "utf-8");
      expect(content).toContain("stripeOnboardingComplete");
    });

    it("should have payoutMethod enum in royalty_collaborators", () => {
      const content = fs.readFileSync("drizzle/schema.ts", "utf-8");
      expect(content).toContain("payoutMethod");
      expect(content).toContain("stripe_connect");
      expect(content).toContain("manual");
    });
  });

  describe("Frontend integration", () => {
    it("should have Stripe Connect UI in RoyaltyTracker", () => {
      const content = fs.readFileSync("client/src/pages/rrb/RoyaltyTracker.tsx", "utf-8");
      expect(content).toContain("Stripe Payouts");
      expect(content).toContain("Setup Payout");
      expect(content).toContain("Stripe Ready");
    });

    it("should have batch pay button", () => {
      const content = fs.readFileSync("client/src/pages/rrb/RoyaltyTracker.tsx", "utf-8");
      expect(content).toContain("Pay All Eligible");
      expect(content).toContain("batchPay.mutate");
    });

    it("should have individual pay button for pending distributions", () => {
      const content = fs.readFileSync("client/src/pages/rrb/RoyaltyTracker.tsx", "utf-8");
      expect(content).toContain("payDistribution.mutate");
    });

    it("should use royaltyPayouts tRPC namespace", () => {
      const content = fs.readFileSync("client/src/pages/rrb/RoyaltyTracker.tsx", "utf-8");
      expect(content).toContain("trpc.royaltyPayouts.getPendingPayouts");
      expect(content).toContain("trpc.royaltyPayouts.createConnectOnboarding");
      expect(content).toContain("trpc.royaltyPayouts.payDistribution");
      expect(content).toContain("trpc.royaltyPayouts.batchPayProject");
    });
  });
});
