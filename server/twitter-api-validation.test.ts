import { describe, it, expect, beforeAll } from 'vitest';

describe('Twitter API Live Validation', () => {
  let bearerToken: string;
  let apiKey: string;
  let apiSecret: string;
  let accessToken: string;
  let accessTokenSecret: string;

  beforeAll(() => {
    bearerToken = process.env.TWITTER_BEARER_TOKEN || '';
    apiKey = process.env.TWITTER_API_KEY || '';
    apiSecret = process.env.TWITTER_API_SECRET || '';
    accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
  });

  it('should have all Twitter credentials set', () => {
    expect(bearerToken).toBeTruthy();
    expect(apiKey).toBeTruthy();
    expect(apiSecret).toBeTruthy();
    expect(accessToken).toBeTruthy();
    expect(accessTokenSecret).toBeTruthy();
  });

  it('should validate Bearer Token against Twitter API v2', async () => {
    // Use the Bearer Token to call the /2/users/me endpoint (lightweight)
    const decoded = decodeURIComponent(bearerToken);
    const res = await fetch('https://api.x.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${decoded}`,
      },
    });
    // Bearer tokens are app-only and cannot access /users/me (requires user context)
    // But we should get a 401 (bad token) or 403 (forbidden - valid token, no user context)
    // A 403 means the token is valid but app-only tokens can't access user endpoints
    // A 401 means the token is invalid
    console.log(`Bearer token validation: status=${res.status}`);
    // Accept 200 (unlikely for app-only), 403 (valid app-only token), or 429 (rate limited = valid)
    expect([200, 403, 429]).toContain(res.status);
  });

  it('should validate OAuth 1.0a credentials by verifying account', async () => {
    // Use OAuth 1.0a to call /2/users/me which requires user context
    const crypto = await import('crypto');
    
    const method = 'GET';
    const url = 'https://api.x.com/2/users/me';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Build OAuth signature
    const params: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0',
    };

    const sortedParams = Object.keys(params).sort().map(k => 
      `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
    ).join('&');

    const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

    const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(apiKey)}", oauth_nonce="${encodeURIComponent(nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken)}", oauth_version="1.0"`;

    const res = await fetch(url, {
      headers: {
        'Authorization': authHeader,
      },
    });

    const body = await res.text();
    console.log(`OAuth 1.0a validation: status=${res.status}, body=${body.substring(0, 200)}`);

    // 200 = success (valid credentials, can read user info)
    // 403 = valid credentials but insufficient permissions
    // 429 = rate limited (credentials are valid)
    // 401 = invalid credentials
    if (res.status === 200) {
      const data = JSON.parse(body);
      console.log(`Authenticated as: @${data.data?.username} (${data.data?.name})`);
      expect(data.data?.username).toBeTruthy();
    } else if (res.status === 429) {
      // Rate limited means credentials are valid
      console.log('Rate limited - credentials are valid');
      expect(res.status).toBe(429);
    } else if (res.status === 403) {
      // Forbidden means credentials valid but need elevated access
      console.log('Forbidden - credentials valid but may need elevated access');
      expect(res.status).toBe(403);
    } else {
      // 401 = bad credentials
      console.error(`Authentication failed: ${body}`);
      expect(res.status).not.toBe(401);
    }
  });
});
