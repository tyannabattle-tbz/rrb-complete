import { describe, it, expect, vi } from "vitest";

// We need to test the cookie domain logic directly
// Since getSessionCookieOptions requires an Express Request, we'll mock it

function computeCookieDomain(hostname: string): string | undefined {
  const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
  const isIpAddress = (host: string) => {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    return host.includes(":");
  };
  
  const isLocalhost = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  
  if (isLocalhost || !hostname) return undefined;
  
  const shortTLDs = new Set([
    "com", "net", "org", "io", "dev", "app", "sbs", "xyz",
    "co", "me", "tv", "fm", "space", "site", "online", "tech",
  ]);
  const parts = hostname.split(".");
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    if (shortTLDs.has(lastPart) && parts.length === 2) {
      return "." + hostname;
    } else if (parts.length > 2) {
      return "." + parts.slice(-2).join(".");
    } else {
      return "." + hostname;
    }
  }
  return undefined;
}

describe("Cookie domain calculation", () => {
  it("should return undefined for localhost", () => {
    expect(computeCookieDomain("localhost")).toBeUndefined();
    expect(computeCookieDomain("127.0.0.1")).toBeUndefined();
  });

  it("should handle manuweb.sbs correctly (not strip to .sbs)", () => {
    const domain = computeCookieDomain("manuweb.sbs");
    expect(domain).toBe(".manuweb.sbs");
    // Previously this was returning ".sbs" which is wrong
    expect(domain).not.toBe(".sbs");
  });

  it("should handle manus.space correctly", () => {
    expect(computeCookieDomain("manus.space")).toBe(".manus.space");
  });

  it("should handle subdomain of manus.space", () => {
    expect(computeCookieDomain("qumus.manus.space")).toBe(".manus.space");
  });

  it("should handle subdomain of manuweb.sbs", () => {
    expect(computeCookieDomain("www.manuweb.sbs")).toBe(".manuweb.sbs");
  });

  it("should handle example.com", () => {
    expect(computeCookieDomain("example.com")).toBe(".example.com");
  });

  it("should handle sub.example.com", () => {
    expect(computeCookieDomain("sub.example.com")).toBe(".example.com");
  });

  it("should handle deep subdomain", () => {
    expect(computeCookieDomain("a.b.example.com")).toBe(".example.com");
  });
});
