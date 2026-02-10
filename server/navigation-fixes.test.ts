import { describe, it, expect } from "vitest";

/**
 * Tests for navigation link fixes and Stripe webhook improvements
 * Session 2: Critical fixes for the RRB platform
 */

describe("Navigation Link Validation", () => {
  // These tests validate that all navigation links use correct paths
  // by checking the source files for proper /rrb/ prefixes

  it("should have correct RRB prefix paths in Navigation.tsx", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/rrb/Navigation.tsx", "utf-8");

    // Verify isActive checks use /rrb/ prefix
    expect(content).toContain("isActive('/rrb/radio-station')");
    expect(content).toContain("isActive('/rrb/podcast-and-video')");
    expect(content).toContain("isActive('/rrb/hybridcast')");
    expect(content).toContain("isActive('/rrb/meditation-guides')");
    expect(content).toContain("isActive('/rrb/canryn-production')");

    // Verify old incorrect paths are NOT present
    expect(content).not.toMatch(/isActive\('\/radio-station'\)/);
    expect(content).not.toMatch(/isActive\('\/podcast-and-video'\)/);
    expect(content).not.toMatch(/isActive\('\/hybridcast'\)/);
    expect(content).not.toMatch(/isActive\('\/meditation'\)/);
    expect(content).not.toMatch(/isActive\('\/sweet-miracles-company'\)/);
    expect(content).not.toMatch(/isActive\('\/client-portal'\)/);
  });

  it("should have correct QUMUS admin link in RRB Home", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/rrb/Home.tsx", "utf-8");

    // Verify the correct path
    expect(content).toContain("href: '/rrb/qumus/admin'");
    // Verify the old broken path is NOT present
    expect(content).not.toContain("href: '/qumus/admin'");
  });

  it("should have Studio section in AppHeaderEnhanced", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/AppHeaderEnhanced.tsx", "utf-8");

    // Verify Studio dropdown exists
    expect(content).toContain("id: 'studio'");
    expect(content).toContain("label: 'Studio'");
    expect(content).toContain("{ label: 'Production Studio', path: '/studio' }");
    expect(content).toContain("{ label: 'Video Processing', path: '/video-processing' }");
    expect(content).toContain("{ label: 'Motion Studio', path: '/motion-studio' }");
  });

  it("should have Studio section in SimplifiedMobileNav", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/SimplifiedMobileNav.tsx", "utf-8");

    expect(content).toContain("title: 'Studio'");
    expect(content).toContain("label: 'Production Studio'");
    expect(content).toContain("path: '/studio'");
  });

  it("should have Studio section in UnifiedMobileSidebar", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/components/UnifiedMobileSidebar.tsx", "utf-8");

    expect(content).toContain("Studio — The Bridge");
    expect(content).toContain("{ label: 'Production Studio', href: '/studio'");
    expect(content).toContain("{ label: 'Video Processing', href: '/video-processing'");
  });
});

describe("MerchandiseShop Import Fix", () => {
  it("should use sonner toast instead of non-existent use-toast hook", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/rrb/MerchandiseShop.tsx", "utf-8");

    // Verify sonner is used
    expect(content).toContain("import { toast } from 'sonner'");
    // Verify old broken import is NOT present
    expect(content).not.toContain("@/hooks/use-toast");
    expect(content).not.toContain("useToast");
  });
});

describe("Stripe Webhook Improvements", () => {
  it("should handle test events with verified response", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");

    // Verify test event handling
    expect(content).toContain("event.id.startsWith('evt_test_')");
    expect(content).toContain("verified: true");
  });

  it("should handle checkout.session.completed events", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/webhooks/stripeWebhook.ts", "utf-8");

    // Verify checkout session handling
    expect(content).toContain("checkout.session.completed");
    expect(content).toContain("handleCheckoutCompleted");
    expect(content).toContain("metadata.type === 'merchandise'");
  });

  it("should have merchandise checkout session procedure", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/routers/rrb/stripePayments.ts", "utf-8");

    // Verify the checkout session creation procedure exists
    expect(content).toContain("createMerchCheckoutSession");
    expect(content).toContain("type: 'merchandise'");
    expect(content).toContain("allow_promotion_codes: true");
  });
});

describe("Solbones Game Modes", () => {
  it("should have all three play modes defined", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Solbones.tsx", "utf-8");

    // Verify play modes
    expect(content).toContain("type PlayMode = 'solo' | 'ai' | 'local_multi'");
    expect(content).toContain("mode: 'solo'");
    expect(content).toContain("mode: 'ai'");
    expect(content).toContain("mode: 'local_multi'");
  });

  it("should have AI decision logic", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Solbones.tsx", "utf-8");

    // Verify AI logic
    expect(content).toContain("function aiDecision");
    expect(content).toContain("QUMUS AI");
    expect(content).toContain("runAITurn");
  });

  it("should have all three game modes", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/pages/Solbones.tsx", "utf-8");

    // Verify game modes
    expect(content).toContain("type GameMode = 'standard' | 'advanced' | 'spiral'");
    expect(content).toContain("Standard (First to 63)");
    expect(content).toContain("In the 9 (Advanced)");
    expect(content).toContain("Spiral Up/Down (First to 36)");
  });
});
