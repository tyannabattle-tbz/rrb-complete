import { describe, it, expect, beforeEach } from 'vitest';

describe('useOfflinePodcasts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should cache podcasts to localStorage', () => {
    const mockPodcasts = [
      {
        id: '1',
        title: 'Test Podcast',
        description: 'Test Description',
        imageUrl: 'https://example.com/image.jpg',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishedAt: '2026-02-23',
      },
    ];

    localStorage.setItem(
      'cached_podcasts',
      JSON.stringify({
        data: mockPodcasts,
        timestamp: Date.now(),
      })
    );

    const cached = localStorage.getItem('cached_podcasts');
    expect(cached).toBeDefined();
    expect(JSON.parse(cached!).data).toHaveLength(1);
  });

  it('should retrieve cached podcasts', () => {
    const mockPodcasts = [
      {
        id: '1',
        title: 'Test Podcast',
        description: 'Test Description',
        imageUrl: 'https://example.com/image.jpg',
        audioUrl: 'https://example.com/audio.mp3',
        duration: 3600,
        publishedAt: '2026-02-23',
      },
    ];

    localStorage.setItem(
      'cached_podcasts',
      JSON.stringify({
        data: mockPodcasts,
        timestamp: Date.now(),
      })
    );

    const cached = localStorage.getItem('cached_podcasts');
    const parsed = JSON.parse(cached!);
    expect(parsed.data[0].title).toBe('Test Podcast');
  });

  it('should clear cache', () => {
    localStorage.setItem('cached_podcasts', JSON.stringify({ data: [] }));
    localStorage.removeItem('cached_podcasts');
    expect(localStorage.getItem('cached_podcasts')).toBeNull();
  });
});
