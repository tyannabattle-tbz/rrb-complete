import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Get the actual origin (protocol + host) accounting for reverse proxies.
 * Behind a proxy, req.protocol may report "http" even though the client sees "https".
 */
function getOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  let protocol = req.protocol;
  if (forwardedProto) {
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto.split(",")[0];
    protocol = proto.trim().toLowerCase();
  }
  const host = req.get("host") || req.hostname;
  return `${protocol}://${host}`;
}

export function registerOAuthRoutes(app: Express) {
  // OAuth Login Initiation Route
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    try {
      const origin = getOrigin(req);
      const redirectUri = `${origin}/api/oauth/callback`;
      const state = Buffer.from(redirectUri).toString('base64');
      const loginUrl = `${ENV.oAuthPortalUrl}/app-auth?appId=${ENV.appId}&redirectUri=${encodeURIComponent(redirectUri)}&state=${state}&type=signIn`;
      
      console.log("[OAuth] Login initiated", {
        origin,
        redirectUri,
        loginUrl: loginUrl.substring(0, 120),
      });
      
      res.redirect(302, loginUrl);
    } catch (error) {
      console.error("[OAuth] Login initiation failed", error);
      res.status(500).json({ error: "OAuth login initiation failed" });
    }
  });

  // OAuth Callback Handler
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received", {
      hasCode: !!code,
      hasState: !!state,
      hostname: req.hostname,
      origin: getOrigin(req),
    });

    if (!code || !state) {
      console.error("[OAuth] Missing code or state");
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Exchanging code for token", { code: code?.substring(0, 20), state: state?.substring(0, 20) });
      let tokenResponse;
      try {
        tokenResponse = await sdk.exchangeCodeForToken(code, state);
        console.log("[OAuth] Got token response", { hasAccessToken: !!tokenResponse.accessToken });
      } catch (tokenError) {
        console.error("[OAuth] Token exchange failed", {
          error: tokenError instanceof Error ? tokenError.message : String(tokenError),
          code: tokenError instanceof Error ? tokenError.constructor.name : typeof tokenError,
        });
        throw tokenError;
      }
      
      let userInfo;
      try {
        userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
        console.log("[OAuth] Got user info", { openId: userInfo.openId });
      } catch (userError) {
        console.error("[OAuth] User info retrieval failed", {
          error: userError instanceof Error ? userError.message : String(userError),
          code: userError instanceof Error ? userError.constructor.name : typeof userError,
        });
        throw userError;
      }

      const openId = userInfo.openId || userInfo.id || userInfo.sub;
      if (!openId) {
        console.error("[OAuth] Missing openId in user info", userInfo);
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? "oauth",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting session cookie with options", cookieOptions);
      console.log("[OAuth] Session token created for user:", userInfo.openId);
      
      // Set the cookie
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      // Verify cookie was set
      const setCookieHeader = res.getHeader('set-cookie');
      console.log("[OAuth] Set-Cookie header:", setCookieHeader);
      
      // Also pass token in URL as fallback for client-side localStorage
      // This is critical for mobile browsers where cookies may be blocked
      const redirectUrl = `/?token=${encodeURIComponent(sessionToken)}`;
      console.log("[OAuth] Callback successful, redirecting with token");
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Return HTML page with error details instead of JSON
      // This prevents black screen on mobile
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Login Error</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 500px; margin: 100px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
              h1 { color: #d32f2f; margin: 0 0 10px 0; }
              p { color: #666; margin: 10px 0; }
              .error-details { background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 20px 0; font-size: 12px; color: #999; text-align: left; word-break: break-all; }
              a { color: #1976d2; text-decoration: none; margin-top: 20px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>⚠️ Login Failed</h1>
              <p>We encountered an error during the login process.</p>
              <div class="error-details">${errorMessage}</div>
              <p>Please try again or contact support if the problem persists.</p>
              <a href="/">← Return Home</a>
            </div>
          </body>
        </html>
      `);
    }
  });
}
