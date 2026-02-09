/**
 * Global Audio Context
 * 
 * Manages a single persistent HTML5 Audio element across the entire app.
 * Any page or component can trigger playback through useAudio().
 * Audio persists across page navigation — no interruption when switching routes.
 */
import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  imageUrl?: string;
  channel?: string;
  duration?: number;
  isLiveStream?: boolean;
}

export interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  queue: AudioTrack[];
  queueIndex: number;
}

interface AudioContextType extends AudioState {
  play: (track: AudioTrack) => void;
  playQueue: (tracks: AudioTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  addToQueue: (track: AudioTrack) => void;
  clearQueue: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isLoading: false,
    error: null,
    queue: [],
    queueIndex: -1,
  });

  // Create the audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.8;
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      });

      audio.addEventListener('loadedmetadata', () => {
        setState(prev => ({
          ...prev,
          duration: isFinite(audio.duration) ? audio.duration : 0,
          isLoading: false,
        }));
      });

      audio.addEventListener('playing', () => {
        setState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
      });

      audio.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });

      audio.addEventListener('waiting', () => {
        setState(prev => ({ ...prev, isLoading: true }));
      });

      audio.addEventListener('error', () => {
        const errorMsg = audio.error?.message || 'Audio playback error';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false, isPlaying: false }));
      });

      audio.addEventListener('ended', () => {
        // Auto-advance to next track in queue
        setState(prev => {
          if (prev.queueIndex < prev.queue.length - 1) {
            const nextIndex = prev.queueIndex + 1;
            const nextTrack = prev.queue[nextIndex];
            audio.src = nextTrack.url;
            audio.play().catch(() => {});
            return {
              ...prev,
              currentTrack: nextTrack,
              queueIndex: nextIndex,
              currentTime: 0,
              isPlaying: true,
            };
          }
          return { ...prev, isPlaying: false, currentTime: 0 };
        });
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const recordPlayMutation = trpc.audio.recordPlay.useMutation();

  const play = useCallback((track: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.url;
    audio.volume = state.isMuted ? 0 : state.volume;
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isLoading: true,
      error: null,
      currentTime: 0,
      queue: [track],
      queueIndex: 0,
    }));
    audio.play().catch(err => {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    });
    // Record play count in database
    recordPlayMutation.mutate({
      trackId: track.id,
      trackTitle: track.title,
      artist: track.artist,
      source: track.channel || 'direct',
    });
  }, [state.volume, state.isMuted, recordPlayMutation]);

  const playQueue = useCallback((tracks: AudioTrack[], startIndex = 0) => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    const track = tracks[startIndex] || tracks[0];
    audio.src = track.url;
    audio.volume = state.isMuted ? 0 : state.volume;
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isLoading: true,
      error: null,
      currentTime: 0,
      queue: tracks,
      queueIndex: startIndex,
    }));
    audio.play().catch(err => {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    });
  }, [state.volume, state.isMuted]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    setState(prev => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      queue: [],
      queueIndex: -1,
    }));
  }, []);

  const next = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setState(prev => {
      if (prev.queueIndex < prev.queue.length - 1) {
        const nextIndex = prev.queueIndex + 1;
        const nextTrack = prev.queue[nextIndex];
        audio.src = nextTrack.url;
        audio.play().catch(() => {});
        return {
          ...prev,
          currentTrack: nextTrack,
          queueIndex: nextIndex,
          currentTime: 0,
          isLoading: true,
        };
      }
      return prev;
    });
  }, []);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // If more than 3 seconds in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setState(prev => {
      if (prev.queueIndex > 0) {
        const prevIndex = prev.queueIndex - 1;
        const prevTrack = prev.queue[prevIndex];
        audio.src = prevTrack.url;
        audio.play().catch(() => {});
        return {
          ...prev,
          currentTrack: prevTrack,
          queueIndex: prevIndex,
          currentTime: 0,
          isLoading: true,
        };
      }
      audio.currentTime = 0;
      return prev;
    });
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(time)) {
      audio.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    setState(prev => ({ ...prev, volume: clamped, isMuted: false }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : prev.volume;
      }
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  const addToQueue = useCallback((track: AudioTrack) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, track] }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, queue: [], queueIndex: -1 }));
  }, []);

  return (
    <AudioCtx.Provider value={{
      ...state,
      play,
      playQueue,
      pause,
      resume,
      togglePlayPause,
      stop,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      addToQueue,
      clearQueue,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}
