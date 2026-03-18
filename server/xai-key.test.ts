import { describe, it, expect } from 'vitest';

describe('xAI API Key Validation', () => {
  it('should have XAI_API_KEY environment variable set', () => {
    const key = process.env.XAI_API_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe('');
    expect(key!.startsWith('xai-')).toBe(true);
  });

  it('should authenticate with xAI API', async () => {
    const key = process.env.XAI_API_KEY;
    if (!key) {
      throw new Error('XAI_API_KEY not set');
    }

    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    // 200 = success, 429 = rate limited (valid key, free tier limit)
    // 401/403 = invalid key
    expect([200, 429]).toContain(response.status);
    if (response.status === 200) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  }, 15000);
});
