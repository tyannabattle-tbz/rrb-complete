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
  const secure = isSecure || isLocalhost;

  // Determine domain for cookie
  let domain: string | undefined = undefined;
  
  // For localhost/127.0.0.1, don't set domain (browser will use exact hostname)
  if (!isLocalhost && hostname) {
    // For production domains, set the domain to allow subdomains
    if (!hostname.startsWith(".")) {
      // Extract the main domain (e.g., "example.com" from "sub.example.com")
      const parts = hostname.split(".");
      if (parts.length > 1) {
        // For multi-part domains, use the last 2 parts with dot prefix
        // This allows the cookie to be shared across all subdomains
        domain = "." + parts.slice(-2).join(".");
      } else {
        domain = hostname;
      }
    } else {
      domain = hostname;
    }
  }

  console.log("[Cookie] Setting cookie options", {
    hostname,
    domain,
    isLocalhost,
    isSecure,
    secure,
  });

  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
  };
}
