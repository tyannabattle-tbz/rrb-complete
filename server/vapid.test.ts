import { describe, it, expect } from "vitest";

describe("VAPID Key Configuration", () => {
  it("should have VAPID_PUBLIC_KEY environment variable set", () => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    expect(publicKey).toBeDefined();
    expect(publicKey!.length).toBeGreaterThan(20);
  });

  it("should have VAPID_PRIVATE_KEY environment variable set", () => {
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    expect(privateKey).toBeDefined();
    expect(privateKey!.length).toBeGreaterThan(10);
  });

  it("should have VITE_VAPID_PUBLIC_KEY matching VAPID_PUBLIC_KEY", () => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const vitePublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    expect(vitePublicKey).toBeDefined();
    expect(vitePublicKey).toBe(publicKey);
  });

  it("should be able to import and configure web-push with VAPID keys", async () => {
    const webpush = await import("web-push");
    const publicKey = process.env.VAPID_PUBLIC_KEY!;
    const privateKey = process.env.VAPID_PRIVATE_KEY!;

    // This should not throw if keys are valid
    expect(() => {
      webpush.setVapidDetails(
        'mailto:admin@canrynproduction.com',
        publicKey,
        privateKey
      );
    }).not.toThrow();
  });
});
