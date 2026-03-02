import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
const AXIOS_TIMEOUT_MS = 15000;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }

  private decodeState(state: string): string {
    const redirectUri = atob(state);
    return redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter(isNonEmptyString)
    );
    return set.size > 0 ? Array.from(set).join(",") : null;
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  async getUserInfo(
    accessToken: string
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken,
      }
    );

    return data;
  }

  async getUserInfoWithJwt(
    jwt: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      {
        jwt,
      } as GetUserInfoWithJwtRequest
    );

    return data;
  }

  async createSessionToken(
    openId: string,
    options: { name?: string; expiresInMs?: number } = {}
  ): Promise<string> {
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;

    const payload: SessionPayload = {
      openId,
      appId: ENV.appId,
      name: options.name || "",
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInMs / 1000)
      .sign(secret);

    return jwt;
  }

  async verifySession(token: string | null): Promise<SessionPayload | null> {
    if (!token) {
      console.log("[Auth] No token provided to verifySession");
      return null;
    }

    try {
      const secret = new TextEncoder().encode(ENV.jwtSecret);
      const verified = await jwtVerify(token, secret);
      const payload = verified.payload as unknown as SessionPayload;

      console.log("[Auth] Session verified successfully", {
        openId: payload.openId,
      });

      return payload;
    } catch (error) {
      console.error("[Auth] Session verification failed:", error);
      return null;
    }
  }

  private parseCookies(
    cookieHeader: string | undefined
  ): Map<string, string> {
    if (!cookieHeader) return new Map();
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  async getUserInfoWithJwtRequest(
    jwt: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      {
        jwt,
      } as GetUserInfoWithJwtRequest
    );

    return data;
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Check for Authorization header first (from localStorage token)
    const authHeader = req.headers.authorization;
    let sessionToken = null;
    
    console.log("[Auth] authenticateRequest called", {
      hasAuthHeader: !!authHeader,
      method: req.method,
      path: req.path,
    });
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log("[Auth] Found Authorization header with token", {
        tokenLength: sessionToken?.length,
      });
    } else {
      // Fall back to cookie
      const cookies = this.parseCookies(req.headers.cookie);
      sessionToken = cookies.get(COOKIE_NAME);
      console.log("[Auth] Checking cookie-based token", {
        hasCookie: !!sessionToken,
        cookieCount: cookies.size,
      });
    }
    
    if (!sessionToken) {
      console.log("[Auth] No session token found - returning null user");
      return null as any;
    }

    console.log("[Auth] About to verify session", {
      hasToken: !!sessionToken,
      tokenLength: sessionToken?.length,
    });
    
    const session = await this.verifySession(sessionToken);

    console.log("[Auth] Session verification result", {
      isValid: !!session,
      openId: session?.openId,
    });

    if (!session) {
      console.error("[Auth] Session verification failed - invalid token");
      return null as any;
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    console.log("[Auth] User lookup result", {
      userId: user?.id,
      userName: user?.name,
      foundInDb: !!user,
    });

    // If user not in DB, sync from OAuth server automatically
    if (!user) {
      try {
        console.log("[Auth] User not found in DB, syncing from OAuth server");
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        console.log("[Auth] Got user info from OAuth", {
          openId: userInfo.openId,
          name: userInfo.name,
        });
        
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(userInfo.openId);
        console.log("[Auth] User synced and created in DB", {
          userId: user?.id,
        });
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        return null as any;
      }
    }

    if (!user) {
      console.error("[Auth] User not found after sync attempt");
      return null as any;
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    console.log("[Auth] Authentication successful", {
      userId: user.id,
      userName: user.name,
    });

    return user;
  }
}

export const sdk = new SDKServer();
