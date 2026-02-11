import { describe, it, expect } from 'vitest';

describe('LiveCallIn Environment Variables', () => {
  it('VITE_SKYPE_URL should be set and be a valid URL', () => {
    const url = process.env.VITE_SKYPE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//);
  });

  it('VITE_ZOOM_URL should be set and be a valid URL', () => {
    const url = process.env.VITE_ZOOM_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//);
  });

  it('VITE_MEET_URL should be set and be a valid URL', () => {
    const url = process.env.VITE_MEET_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//);
  });

  it('VITE_DISCORD_URL should be set and be a valid URL', () => {
    const url = process.env.VITE_DISCORD_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https?:\/\//);
  });
});
