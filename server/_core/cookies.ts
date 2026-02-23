import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
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
      // Special handling for manus.space - always use .manus.space for cross-subdomain cookies
      if (hostname.includes("manus.space")) {
        domain = ".manus.space";
      } else {
        // Extract the main domain (e.g., "example.com" from "sub.example.com")
        const parts = hostname.split(".");
        if (parts.length > 1) {
          // For multi-part domains, use the last 2 parts
          domain = "." + parts.slice(-2).join(".");
        } else {
          domain = hostname;
        }
      }
    } else {
      domain = hostname;
    }
  }

  return {
    domain,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
  };
}
