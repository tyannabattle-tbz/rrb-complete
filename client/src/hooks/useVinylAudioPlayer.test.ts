/**
 * Tests for Vinyl Audio Player Hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVinylAudioPlayer, getLittleRichardVinylTracks } from './useVinylAudioPlayer';

// Mock the Audio API
global.Audio = vi.fn(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  src: ''
})) as any;

describe('useVinylAudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVinylAudioPlayer());

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentTrack).toBeNull();
    expect(result.current.state.currentTime).toBe(0);
    expect(result.current.state.volume).toBe(1);
    expect(result.current.state.error).toBeNull();
  });

  it('should play a track', async () => {
    const { result } = renderHook(() => useVinylAudioPlayer());
    const track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:00',
      album: 'Test Album',
      year: 2024
    };

    await act(async () => {
      result.current.playTrack(track);
    });

    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.currentTrack).toEqual(track);
  });

  it('should pause playback', async () => {
    const { result } = renderHook(() => useVinylAudioPlayer());
    const track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:00',
      album: 'Test Album',
      year: 2024
    };

    await act(async () => {
      result.current.playTrack(track);
    });

    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.state.isPlaying).toBe(false);
  });

  it('should resume playback', async () => {
    const { result } = renderHook(() => useVinylAudioPlayer());
    const track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:00',
      album: 'Test Album',
      year: 2024
    };

    await act(async () => {
      result.current.playTrack(track);
      result.current.pause();
    });

    expect(result.current.state.isPlaying).toBe(false);

    act(() => {
      result.current.resume();
    });

    expect(result.current.state.isPlaying).toBe(true);
  });

  it('should toggle play/pause', async () => {
    const { result } = renderHook(() => useVinylAudioPlayer());
    const track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:00',
      album: 'Test Album',
      year: 2024
    };

    await act(async () => {
      result.current.playTrack(track);
    });

    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.state.isPlaying).toBe(false);

    act(() => {
      result.current.togglePlayPause();
    });

    expect(result.current.state.isPlaying).toBe(true);
  });

  it('should set volume', () => {
    const { result } = renderHook(() => useVinylAudioPlayer());

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.state.volume).toBe(0.5);
  });

  it('should clamp volume between 0 and 1', () => {
    const { result } = renderHook(() => useVinylAudioPlayer());

    act(() => {
      result.current.setVolume(1.5);
    });

    expect(result.current.state.volume).toBe(1);

    act(() => {
      result.current.setVolume(-0.5);
    });

    expect(result.current.state.volume).toBe(0);
  });

  it('should seek to position', () => {
    const { result } = renderHook(() => useVinylAudioPlayer());

    act(() => {
      result.current.seek(45);
    });

    expect(result.current.state.currentTime).toBe(45);
  });

  it('should stop playback', async () => {
    const { result } = renderHook(() => useVinylAudioPlayer());
    const track = {
      title: 'Test Song',
      artist: 'Test Artist',
      duration: '3:00',
      album: 'Test Album',
      year: 2024
    };

    await act(async () => {
      result.current.playTrack(track);
    });

    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.state.isPlaying).toBe(false);
    expect(result.current.state.currentTrack).toBeNull();
    expect(result.current.state.currentTime).toBe(0);
  });
});

describe('getLittleRichardVinylTracks', () => {
  it('should return array of tracks', () => {
    const tracks = getLittleRichardVinylTracks();

    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThan(0);
  });

  it('should include Rockin\' Rockin\' Boogie', () => {
    const tracks = getLittleRichardVinylTracks();
    const rrrb = tracks.find(t => t.title === "Rockin' Rockin' Boogie");

    expect(rrrb).toBeDefined();
    expect(rrrb?.artist).toContain('Little Richard');
    expect(rrrb?.artist).toContain('Seabrun Candy Hunter');
  });

  it('should include collaboration era tracks', () => {
    const tracks = getLittleRichardVinylTracks();
    const collaborationTracks = tracks.filter(t => 
      t.album.includes('Rockin\' Rockin\' Boogie') || t.year >= 1971
    );

    expect(collaborationTracks.length).toBeGreaterThan(0);
  });

  it('should have valid stream URLs', () => {
    const tracks = getLittleRichardVinylTracks();

    tracks.forEach(track => {
      expect(track.streamUrl).toBeDefined();
      expect(track.streamUrl).toMatch(/^https:\/\//);
    });
  });

  it('should have valid duration format', () => {
    const tracks = getLittleRichardVinylTracks();

    tracks.forEach(track => {
      expect(track.duration).toMatch(/^\d+:\d{2}$/);
    });
  });

  it('should have valid year values', () => {
    const tracks = getLittleRichardVinylTracks();

    tracks.forEach(track => {
      expect(track.year).toBeGreaterThanOrEqual(1951);
      expect(track.year).toBeLessThanOrEqual(new Date().getFullYear());
    });
  });
});
