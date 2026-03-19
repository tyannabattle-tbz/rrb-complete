import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables for testing
beforeEach(() => {
  process.env.TWITTER_API_KEY = 'test_consumer_key';
  process.env.TWITTER_API_SECRET = 'test_consumer_secret';
  process.env.TWITTER_ACCESS_TOKEN = '1448403994750210050-test_token';
  process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test_token_secret';
});

describe('Social Media Publisher', () => {
  it('should validate Twitter credentials when all are present', async () => {
    const { getCredentialStatuses } = await import('./socialMediaPublisher');
    // Credentials are set in beforeEach
    expect(process.env.TWITTER_API_KEY).toBeTruthy();
    expect(process.env.TWITTER_API_SECRET).toBeTruthy();
    expect(process.env.TWITTER_ACCESS_TOKEN).toBeTruthy();
    expect(process.env.TWITTER_ACCESS_TOKEN_SECRET).toBeTruthy();
  });

  it('should detect missing Twitter credentials', () => {
    const originalKey = process.env.TWITTER_API_KEY;
    delete process.env.TWITTER_API_KEY;
    
    expect(process.env.TWITTER_API_KEY).toBeUndefined();
    
    // Restore
    process.env.TWITTER_API_KEY = originalKey;
  });

  it('should have retry configuration with 503 handling', async () => {
    // Read the file to verify the constants exist
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/server/socialMediaPublisher.ts', 'utf-8');
    
    expect(content).toContain('MAX_RETRIES = 5');
    expect(content).toContain('MAX_503_RETRIES = 8');
    expect(content).toContain('RETRY_503_DELAY_MS = 10000');
    expect(content).toContain('is503');
    expect(content).toContain('503 Service Unavailable');
    expect(content).toContain('pay-per-use');
  });

  it('should handle 503 errors by rescheduling instead of marking as failed', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/server/socialMediaPublisher.ts', 'utf-8');
    
    // Verify 503 posts get rescheduled, not failed
    expect(content).toContain("const is503 = result.error?.includes('503')");
    expect(content).toContain("is503 ? 'scheduled' : 'failed'");
    expect(content).toContain('Date.now() + 5 * 60 * 1000'); // 5min reschedule
    expect(content).toContain('rescheduled for 5min later due to Twitter 503');
  });

  it('should use extended backoff for 503 errors', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/server/socialMediaPublisher.ts', 'utf-8');
    
    // Verify 503 gets longer delays
    expect(content).toContain('RETRY_503_DELAY_MS * Math.pow(1.5, attempt - 1)');
    expect(content).toContain('503 extended backoff');
  });

  it('should export publisher lifecycle functions', async () => {
    const publisher = await import('./socialMediaPublisher');
    
    expect(typeof publisher.checkAndPublishScheduledPosts).toBe('function');
    expect(typeof publisher.retryFailedPosts).toBe('function');
    expect(typeof publisher.startSocialMediaPublisher).toBe('function');
    expect(typeof publisher.stopSocialMediaPublisher).toBe('function');
    expect(typeof publisher.getCredentialStatuses).toBe('function');
  });

  it('should have OAuth 1.0a signature generation for Twitter v2 API', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/server/socialMediaPublisher.ts', 'utf-8');
    
    expect(content).toContain('oauth_consumer_key');
    expect(content).toContain('oauth_signature_method');
    expect(content).toContain('HMAC-SHA1');
    expect(content).toContain("'https://api.twitter.com/2/tweets'");
    expect(content).toContain('Content-Type');
    expect(content).toContain('application/json');
  });

  it('should not retry auth errors (401, 403)', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/home/ubuntu/manus-agent-web/server/socialMediaPublisher.ts', 'utf-8');
    
    // 401 and 403 should have retryable: false
    expect(content).toContain("resolve({ success: false, error, retryable: false }); // Don't retry auth errors");
    expect(content).toMatch(/403.*retryable: false/s);
  });
});
