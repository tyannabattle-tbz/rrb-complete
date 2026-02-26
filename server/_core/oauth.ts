import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received", {
      hasCode: !!code,
      hasState: !!state,
      hostname: req.hostname,
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

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
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
      const redirectUrl = `/?token=${encodeURIComponent(sessionToken)}`;
      console.log("[OAuth] Callback successful, redirecting with token");
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
