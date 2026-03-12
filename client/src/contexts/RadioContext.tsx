/**
 * RadioContext — Persistent Radio Audio Manager
 * 
 * Keeps the audio element alive at the App level so navigating
 * to other pages doesn't stop the radio stream. Shows a persistent
 * mini-player bar when the user is away from the radio page.
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
  nowPlaying?: string;
  description?: string;
  listeners?: number;
  category?: string;
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
  const maxRetries = 3;

  const [radio, setRadio] = useState<RadioState>({
    isPlaying: false,
    channel: null,
    volume: 75,
    isMuted: false,
    status: 'idle',
  });

  const isOnRadioPage = location === '/rrb-radio' || location === '/radio' || location === '/live';

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
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radio.isMuted ? 0 : radio.volume / 100;
    }
  }, [radio.volume, radio.isMuted]);

  // Wire up audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      retryCountRef.current = 0;
      setRadio(prev => ({ ...prev, isPlaying: true, status: 'playing', errorMessage: undefined }));
    };

    const onPause = () => {
      setRadio(prev => ({ ...prev, isPlaying: false }));
    };

    const onWaiting = () => {
      setRadio(prev => ({ ...prev, status: 'loading' }));
    };

    const onError = () => {
      if (!audio.src || audio.src === window.location.href) return;
      
      retryCountRef.current += 1;
      if (retryCountRef.current <= maxRetries) {
        setRadio(prev => ({ ...prev, status: 'reconnecting', errorMessage: `Reconnecting (${retryCountRef.current}/${maxRetries})...` }));
        // Retry after a short delay
        setTimeout(() => {
          if (audioRef.current && audioRef.current.src) {
            const currentSrc = audioRef.current.src;
            audioRef.current.src = '';
            audioRef.current.src = currentSrc;
            audioRef.current.play().catch(() => {});
          }
        }, 2000 * retryCountRef.current);
      } else {
        setRadio(prev => ({ ...prev, isPlaying: false, status: 'error', errorMessage: 'Stream unavailable. Try another channel.' }));
      }
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const play = useCallback((channel: RadioChannel) => {
    const audio = audioRef.current;
    if (!audio) return;

    retryCountRef.current = 0;
    setRadio(prev => ({ ...prev, channel, status: 'loading', errorMessage: undefined }));

    audio.pause();
    audio.src = getProxiedStreamUrl(channel.streamUrl);
    audio.volume = radio.isMuted ? 0 : radio.volume / 100;
    audio.play().catch(() => {
      setRadio(prev => ({ ...prev, status: 'error', errorMessage: 'Could not start playback. Tap play to retry.' }));
    });
  }, [radio.volume, radio.isMuted]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setRadio(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src || audio.src === window.location.href) return;
    audio.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
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
