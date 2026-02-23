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
  // Add middleware to prevent caching of auth endpoints
  app.use('/api/oauth', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

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
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Exchanging code for token");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Got token response");
      
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] Got user info", { openId: userInfo.openId });

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
      
      // Set session cookie with extended maxAge for persistence
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS,
        // Ensure cookie is sent with all requests
        path: '/',
      });

      // Set a cookie to signal frontend to check localStorage for return-to URL
      res.cookie('auth-complete', 'true', { 
        maxAge: 5000, // 5 second cookie
        httpOnly: false,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        path: '/',
      });

      // Also set a header to prevent caching of auth state
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      console.log("[OAuth] Callback successful, redirecting to /");
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      // Set cache prevention headers on error too
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
