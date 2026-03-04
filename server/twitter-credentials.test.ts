import { describe, it, expect, beforeAll } from 'vitest';

describe('Twitter API Credentials Validation', () => {
  let credentials: {
    apiKey?: string;
    apiSecret?: string;
    bearerToken?: string;
    accessToken?: string;
    accessTokenSecret?: string;
  } = {};

  beforeAll(() => {
    credentials = {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };
  });

  it('should have Twitter API Key configured', () => {
    expect(credentials.apiKey).toBeDefined();
    expect(credentials.apiKey).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should have Twitter API Secret configured', () => {
    expect(credentials.apiSecret).toBeDefined();
    expect(credentials.apiSecret).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should have Twitter Bearer Token configured', () => {
    expect(credentials.bearerToken).toBeDefined();
    expect(credentials.bearerToken).toMatch(/^AAAA/);
  });

  it('should have Twitter Access Token configured', () => {
    expect(credentials.accessToken).toBeDefined();
    expect(credentials.accessToken).toMatch(/^[A-Za-z0-9-]+$/);
  });

  it('should have Twitter Access Token Secret configured', () => {
    expect(credentials.accessTokenSecret).toBeDefined();
    expect(credentials.accessTokenSecret).toMatch(/^[A-Za-z0-9_]+$/);
  });

  it('should validate all credentials are non-empty strings', () => {
    Object.entries(credentials).forEach(([key, value]) => {
      expect(value).toBeTruthy();
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('should confirm credentials format matches Twitter API standards', () => {
    // Bearer token should start with AAAA
    expect(credentials.bearerToken).toMatch(/^AAAA/);
    
    // Access token should be alphanumeric with hyphens
    expect(credentials.accessToken).toMatch(/^[A-Za-z0-9-]+$/);
    
    // API key and secret should be alphanumeric with underscores/hyphens
    expect(credentials.apiKey).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(credentials.apiSecret).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
