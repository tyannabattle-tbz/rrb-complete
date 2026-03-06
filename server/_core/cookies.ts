import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // Check if the request is already HTTPS
  if (req.protocol === "https") return true;

  // Check for x-forwarded-proto header (common in proxies)
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }

  // Check for x-forwarded-proto from Manus proxy
  const manusProto = req.headers["x-e2bp-proto"] || req.headers["x-forwarded-proto"];
  if (manusProto && typeof manusProto === "string") {
    return manusProto.toLowerCase() === "https";
  }

  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname || "";
  const isLocalhost = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const isSecure = isSecureRequest(req);
  const secure = isSecure;

  // Determine domain for cookie
  // For localhost/127.0.0.1, don't set domain (browser will use exact hostname)
  let domain: string | undefined = undefined;
  
  if (!isLocalhost && hostname) {
    // Known short TLDs where "name.tld" is the registrable domain
    // e.g., manuweb.sbs → domain should be ".manuweb.sbs" not ".sbs"
    const shortTLDs = new Set([
      "com", "net", "org", "io", "dev", "app", "sbs", "xyz",
      "co", "me", "tv", "fm", "space", "site", "online", "tech",
    ]);
    const parts = hostname.split(".");
    
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      if (shortTLDs.has(lastPart) && parts.length === 2) {
        // e.g., manuweb.sbs → ".manuweb.sbs"
        domain = "." + hostname;
      } else if (parts.length > 2) {
        // e.g., qumus.manus.space → ".manus.space"
        // e.g., www.manuweb.sbs → ".manuweb.sbs"
        domain = "." + parts.slice(-2).join(".");
      } else {
        domain = "." + hostname;
      }
    }
  }

  console.log("[Cookie] Setting cookie options", {
    hostname,
    domain,
    isLocalhost,
    isSecure,
    secure,
  });

  // ALWAYS use 'lax' for OAuth redirect cookies
  // 'lax' allows cookies on top-level navigation redirects (GET requests)
  // which is exactly what OAuth callback does (302 redirect back to our site)
  // 'none' is blocked by Safari ITP on mobile and requires Secure
  // 'lax' is the safest cross-browser default for this flow
  const sameSite: "strict" | "lax" | "none" = "lax";

  console.log("[Cookie] Final options", {
    domain,
    sameSite,
    secure,
    isLocalhost,
  });

  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
