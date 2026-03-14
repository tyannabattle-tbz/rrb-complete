/**
 * RadioContext — Persistent Radio Audio Manager
 * 
 * Keeps the audio element alive at the App level so navigating
 * to other pages doesn't stop the radio stream. Shows a persistent
 * mini-player bar when the user is away from the radio page.
 * 
 * Anti-timeout features:
 * - Handles 'stalled' and 'ended' events with auto-reconnect
 * - Recovers playback after visibility change (screen lock, tab switch)
 * - Keepalive watchdog detects silent drops and reconnects
 * - Progressive retry with fallback stream support
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Returns a proxied URL for HTTP streams when running on HTTPS.
 */
function getProxiedStreamUrl(streamUrl: string): string {
  if (!streamUrl) return streamUrl;
  if (streamUrl.startsWith('https://')) return streamUrl;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
  }
  return streamUrl;
}

interface RadioChannel {
  id: number;
  name: string;
  icon?: string;
  genre?: string;
  frequency?: string;
  streamUrl: string;
  fallbackUrl?: string;
  nowPlaying?: string;
  description?: string;
  listeners?: number;
  category?: string;
  metadata?: Record<string, any>;
}

interface RadioState {
  isPlaying: boolean;
  channel: RadioChannel | null;
  volume: number;
  isMuted: boolean;
  status: 'idle' | 'loading' | 'playing' | 'error' | 'reconnecting';
  errorMessage?: string;
}

interface RadioContextType {
  radio: RadioState;
  play: (channel: RadioChannel) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  switchChannel: (channel: RadioChannel) => void;
  isOnRadioPage: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const RadioContext = createContext<RadioContextType | null>(null);

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used within RadioProvider');
  return ctx;
}

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const triedFallbackRef = useRef(false);
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlayingTimeRef = useRef<number>(0);
  const intentionalPauseRef = useRef(false);
  const maxRetries = 5; // Increased from 3 for better resilience

  const [radio, setRadio] = useState<RadioState>({
    isPlaying: false,
    channel: null,
    volume: 75,
    isMuted: false,
    status: 'idle',
  });

  const isOnRadioPage = location === '/rrb-radio' || location === '/radio' || location === '/live';

  // Helper: reconnect the current stream
  const reconnectStream = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src || audio.src === window.location.href) return;

    console.log('[Radio] Reconnecting stream...');
    const currentSrc = audio.src;
    // Add cache-buster to force fresh connection
    const bustSrc = currentSrc.includes('?')
      ? `${currentSrc}&_t=${Date.now()}`
      : `${currentSrc}?_t=${Date.now()}`;
    audio.src = '';
    // Small delay to ensure the browser releases the old connection
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = bustSrc;
        audioRef.current.play().catch(() => {});
      }
    }, 300);
  }, []);

  // Create audio element once on mount — never destroyed
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'none';
      audioRef.current = audio;
    }

    // Cleanup only on full app unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      if (watchdogRef.current) clearInterval(watchdogRef.current);
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radio.isMuted ? 0 : radio.volume / 100;
    }
  }, [radio.volume, radio.isMuted]);

  // ─── Keepalive Watchdog ───
  // Checks every 15 seconds if audio is supposed to be playing but has stalled
  useEffect(() => {
    if (watchdogRef.current) clearInterval(watchdogRef.current);

    if (radio.isPlaying || radio.status === 'loading' || radio.status === 'reconnecting') {
      watchdogRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (!audio || intentionalPauseRef.current) return;

        // If we're supposed to be playing but audio is paused/ended, reconnect
        if (audio.paused && radio.channel && !intentionalPauseRef.current) {
          console.log('[Radio] Watchdog: Audio paused unexpectedly, reconnecting...');
          setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: 'Reconnecting...' }));
          reconnectStream();
          return;
        }

        // Check for stalled stream: currentTime hasn't advanced in 30+ seconds
        const now = Date.now();
        if (audio.currentTime > 0) {
          lastPlayingTimeRef.current = now;
        } else if (now - lastPlayingTimeRef.current > 30000 && lastPlayingTimeRef.current > 0) {
          console.log('[Radio] Watchdog: Stream appears stalled (no time progress), reconnecting...');
          setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: 'Stream stalled, reconnecting...' }));
          reconnectStream();
          lastPlayingTimeRef.current = now; // Reset to avoid rapid retries
        }
      }, 15000);
    }

    return () => {
      if (watchdogRef.current) clearInterval(watchdogRef.current);
    };
  }, [radio.isPlaying, radio.status, radio.channel, reconnectStream]);

  // ─── Visibility Change Handler ───
  // When user returns from background/screen lock, check if stream is still alive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const audio = audioRef.current;
        if (!audio || !radio.channel || intentionalPauseRef.current) return;

        // Give the browser a moment to resume, then check
        setTimeout(() => {
          if (audio && audio.paused && radio.channel && !intentionalPauseRef.current) {
            console.log('[Radio] Visibility restored — stream was paused, resuming...');
            setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: 'Resuming stream...' }));
            // Try simple resume first
            audio.play().catch(() => {
              // If resume fails, do a full reconnect
              console.log('[Radio] Resume failed, doing full reconnect...');
              reconnectStream();
            });
          }
        }, 1000);
      }
    };

    // Also handle page show (back/forward cache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const audio = audioRef.current;
        if (audio && audio.paused && radio.channel && !intentionalPauseRef.current) {
          console.log('[Radio] Page restored from bfcache, reconnecting...');
          reconnectStream();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [radio.channel, reconnectStream]);

  // Wire up audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      retryCountRef.current = 0;
      lastPlayingTimeRef.current = Date.now();
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
      setRadio(prev => ({ ...prev, isPlaying: true, status: 'playing', errorMessage: undefined }));
    };

    const onPause = () => {
      setRadio(prev => ({ ...prev, isPlaying: false }));
    };

    const onWaiting = () => {
      setRadio(prev => ({ ...prev, status: 'loading' }));
      // Set a stall timeout — if we're stuck in 'waiting' for 20 seconds, reconnect
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => {
        console.log('[Radio] Stall timeout: stuck in waiting state for 20s, reconnecting...');
        reconnectStream();
      }, 20000);
    };

    const onStalled = () => {
      console.log('[Radio] Stream stalled event fired');
      // Don't immediately error — give it 15 seconds to recover, then reconnect
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => {
        const a = audioRef.current;
        if (a && !a.paused && a.readyState < 3) {
          console.log('[Radio] Stream still stalled after 15s, reconnecting...');
          setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: 'Stream interrupted, reconnecting...' }));
          reconnectStream();
        }
      }, 15000);
    };

    const onEnded = () => {
      // Live streams should never "end" — if they do, it's a server-side disconnect
      if (!intentionalPauseRef.current) {
        console.log('[Radio] Stream ended unexpectedly, reconnecting...');
        setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: 'Stream ended, reconnecting...' }));
        setTimeout(() => reconnectStream(), 2000);
      }
    };

    const onError = () => {
      if (!audio.src || audio.src === window.location.href) return;
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
      
      retryCountRef.current += 1;
      if (retryCountRef.current <= maxRetries) {
        setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: `Reconnecting (${retryCountRef.current}/${maxRetries})...` }));
        setTimeout(() => {
          reconnectStream();
        }, 2000 * Math.min(retryCountRef.current, 3)); // Cap backoff at 6 seconds
      } else if (!triedFallbackRef.current) {
        // Try fallback stream URL from channel metadata
        setRadio(prev => {
          const fallback = prev.channel?.fallbackUrl || prev.channel?.metadata?.fallbackUrl;
          if (fallback) {
            triedFallbackRef.current = true;
            retryCountRef.current = 0;
            console.log(`[Radio] Primary stream failed, switching to fallback: ${fallback}`);
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.src = getProxiedStreamUrl(fallback);
                audioRef.current.play().catch(() => {});
              }
            }, 500);
            return { ...prev, status: 'reconnecting', errorMessage: 'Switching to backup stream...' };
          }
          return { ...prev, isPlaying: false, status: 'error', errorMessage: 'Stream unavailable. Try another channel.' };
        });
      } else {
        setRadio(prev => ({ ...prev, isPlaying: false, status: 'error', errorMessage: 'Stream unavailable. Try another channel.' }));
      }
    };

    // Also handle timeupdate to track that audio is actually progressing
    const onTimeUpdate = () => {
      lastPlayingTimeRef.current = Date.now();
      // Clear any stall timer since we're getting data
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('stalled', onStalled);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('stalled', onStalled);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [reconnectStream]);

  const play = useCallback((channel: RadioChannel) => {
    const audio = audioRef.current;
    if (!audio) return;

    intentionalPauseRef.current = false;
    retryCountRef.current = 0;
    triedFallbackRef.current = false;
    lastPlayingTimeRef.current = Date.now();
    setRadio(prev => ({ ...prev, channel, status: 'loading', errorMessage: undefined }));

    audio.pause();
    audio.src = getProxiedStreamUrl(channel.streamUrl);
    audio.volume = radio.isMuted ? 0 : radio.volume / 100;
    audio.play().catch(() => {
      setRadio(prev => ({ ...prev, status: 'error', errorMessage: 'Could not start playback. Tap play to retry.' }));
    });
  }, [radio.volume, radio.isMuted]);

  const pause = useCallback(() => {
    intentionalPauseRef.current = true;
    audioRef.current?.pause();
    setRadio(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src || audio.src === window.location.href) return;
    intentionalPauseRef.current = false;
    lastPlayingTimeRef.current = Date.now();
    audio.play().catch(() => {
      // If resume fails (stale connection), do a full reconnect
      console.log('[Radio] Resume failed, reconnecting...');
      reconnectStream();
    });
  }, [reconnectStream]);

  const stop = useCallback(() => {
    intentionalPauseRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
    setRadio({ isPlaying: false, channel: null, volume: radio.volume, isMuted: radio.isMuted, status: 'idle' });
  }, [radio.volume, radio.isMuted]);

  const setVolume = useCallback((vol: number) => {
    setRadio(prev => ({ ...prev, volume: vol }));
  }, []);

  const toggleMute = useCallback(() => {
    setRadio(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const switchChannel = useCallback((channel: RadioChannel) => {
    play(channel);
  }, [play]);

  return (
    <RadioContext.Provider value={{
      radio,
      play,
      pause,
      resume,
      stop,
      setVolume,
      toggleMute,
      switchChannel,
      isOnRadioPage,
      audioRef,
    }}>
      {children}
    </RadioContext.Provider>
  );
}
