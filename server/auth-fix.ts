import type { Request } from 'express';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-production';
const OAUTH_SERVER_URL = process.env.OAUTH_SERVER_URL || 'https://api.manus.im';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  tier: 'free' | 'professional' | 'advanced';
}

/**
 * Enhanced OAuth authentication with fallback and debugging
 */
export async function authenticateOAuth(req: Request): Promise<AuthUser | null> {
  try {
    // 1. Check for session cookie
    const sessionToken = req.cookies?.session_token || req.cookies?.auth_token;
    
    if (sessionToken) {
      console.log('[Auth] Found session token in cookies');
      
      try {
        // Verify JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const verified = await jwtVerify(sessionToken, secret);
        
        if (verified.payload) {
          console.log('[Auth] JWT verification successful');
          return {
            id: (verified.payload.sub as string) || 'user-' + Date.now(),
            email: (verified.payload.email as string) || 'user@example.com',
            name: (verified.payload.name as string) || 'User',
            role: (verified.payload.role as 'user' | 'admin') || 'user',
            tier: (verified.payload.tier as 'free' | 'professional' | 'advanced') || 'free',
          };
        }
      } catch (jwtError) {
        console.log('[Auth] JWT verification failed:', (jwtError as Error).message);
      }
    }

    // 2. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      console.log('[Auth] Found Bearer token in Authorization header');
      
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const verified = await jwtVerify(token, secret);
        
        if (verified.payload) {
          console.log('[Auth] Bearer token verification successful');
          return {
            id: (verified.payload.sub as string) || 'user-' + Date.now(),
            email: (verified.payload.email as string) || 'user@example.com',
            name: (verified.payload.name as string) || 'User',
            role: (verified.payload.role as 'user' | 'admin') || 'user',
            tier: (verified.payload.tier as 'free' | 'professional' | 'advanced') || 'free',
          };
        }
      } catch (error) {
        console.log('[Auth] Bearer token verification failed:', (error as Error).message);
      }
    }

    // 3. Check for OAuth callback
    const oauthToken = req.query?.oauth_token || req.body?.oauth_token;
    if (oauthToken) {
      console.log('[Auth] Found OAuth token in request');
      
      try {
        // Verify with OAuth server
        const response = await fetch(`${OAUTH_SERVER_URL}/api/oauth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('[Auth] OAuth verification successful');
          return {
            id: userData.id || 'user-' + Date.now(),
            email: userData.email || 'user@example.com',
            name: userData.name || 'User',
            role: userData.role || 'user',
            tier: userData.tier || 'free',
          };
        }
      } catch (error) {
        console.log('[Auth] OAuth verification failed:', (error as Error).message);
      }
    }

    console.log('[Auth] No valid authentication found');
    return null;
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    return null;
  }
}

/**
 * Create a test/demo user for development
 */
export function createDemoUser(): AuthUser {
  return {
    id: 'demo-user-' + Date.now(),
    email: 'demo@rrb.studio',
    name: 'RRB Demo User',
    role: 'user',
    tier: 'free',
  };
}

/**
 * Generate a mock JWT token for testing
 */
export function generateMockToken(user: AuthUser): string {
  // This is a simplified mock - in production, use proper JWT signing
  const payload = Buffer.from(JSON.stringify(user)).toString('base64');
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.mock-signature`;
}
