import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayback } from './useAudioPlayback';

describe('useAudioPlayback', () => {
  let mockAudio: any;

  beforeEach(() => {
    // Mock HTML5 Audio API
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      src: '',
      volume: 1,
      currentTime: 0,
      duration: 0,
      error: null,
    };

    // Mock Audio constructor
    global.Audio = vi.fn(() => mockAudio) as any;
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.volume).toBe(70);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.duration).toBe(0);
      expect(result.current.error).toBe(null);
    });

    it('should create audio element on first render', () => {
      renderHook(() => useAudioPlayback());

      expect(global.Audio).toHaveBeenCalled();
    });

    it('should set crossOrigin attribute', () => {
      renderHook(() => useAudioPlayback());

      expect(mockAudio.crossOrigin).toBe('anonymous');
    });
  });

  describe('play', () => {
    it('should play stream with proxy URL for external streams', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://ice1.somafm.com/metal-128-mp3');
      });

      expect(mockAudio.src).toContain('/api/stream/proxy?url=');
      expect(mockAudio.load).toHaveBeenCalled();
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should use direct URL for same-origin streams', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('/api/stream/local.mp3');
      });

      expect(mockAudio.src).toBe('/api/stream/local.mp3');
    });

    it('should only load new source if URL changed', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      const streamUrl = 'https://ice1.somafm.com/metal-128-mp3';

      await act(async () => {
        await result.current.play(streamUrl);
      });

      const loadCallCount = mockAudio.load.mock.calls.length;

      // Play same URL again
      await act(async () => {
        await result.current.play(streamUrl);
      });

      // load should not be called again
      expect(mockAudio.load.mock.calls.length).toBe(loadCallCount);
    });

    it('should handle NotAllowedError for mobile autoplay restrictions', async () => {
      mockAudio.play.mockRejectedValue(new DOMException('NotAllowedError', 'NotAllowedError'));

      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://ice1.somafm.com/metal-128-mp3');
      });

      expect(result.current.error).toContain('tap to play');
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle other play errors', async () => {
      mockAudio.play.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://ice1.somafm.com/metal-128-mp3');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('pause', () => {
    it('should pause audio playback', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.pause();
      });

      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('togglePlayPause', () => {
    it('should pause if currently playing', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      // Mock play event to set isPlaying to true
      const playListener = mockAudio.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'play'
      )?.[1];

      if (playListener) {
        playListener();
      }

      await act(async () => {
        await result.current.togglePlayPause('https://ice1.somafm.com/metal-128-mp3');
      });

      // Should pause
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should play if not currently playing', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.togglePlayPause('https://ice1.somafm.com/metal-128-mp3');
      });

      expect(mockAudio.play).toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    it('should set volume between 0 and 100', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.setVolume(50);
      });

      expect(mockAudio.volume).toBe(0.5);
      expect(result.current.volume).toBe(50);
    });

    it('should clamp volume to valid range', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.setVolume(150);
      });

      expect(mockAudio.volume).toBe(1);
      expect(result.current.volume).toBe(100);

      act(() => {
        result.current.setVolume(-50);
      });

      expect(mockAudio.volume).toBe(0);
      expect(result.current.volume).toBe(0);
    });
  });

  describe('seek', () => {
    it('should seek to specified time', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.seek(30);
      });

      expect(mockAudio.currentTime).toBe(30);
    });
  });

  describe('stop', () => {
    it('should pause and reset playback', () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.stop();
      });

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
    });
  });

  describe('proxy URL generation', () => {
    it('should proxy SomaFM URLs', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://ice1.somafm.com/metal-128-mp3');
      });

      expect(mockAudio.src).toContain('/api/stream/proxy?url=');
      expect(mockAudio.src).toContain('ice1.somafm.com');
    });

    it('should proxy Shoutcast URLs', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://shoutcast.example.com/stream');
      });

      expect(mockAudio.src).toContain('/api/stream/proxy?url=');
    });

    it('should proxy Icecast URLs', async () => {
      const { result } = renderHook(() => useAudioPlayback());

      await act(async () => {
        await result.current.play('https://icecast.example.com/stream');
      });

      expect(mockAudio.src).toContain('/api/stream/proxy?url=');
    });
  });
});
