/**
 * Audio Playback Hook
 * Manages HTML5 audio element and playback state
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 70,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.volume = 0.7;
      audioRef.current = audio;

      // Update state on time update
      const handleTimeUpdate = () => {
        setState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
          duration: audio.duration,
        }));
      };

      // Handle play
      const handlePlay = () => {
        setState(prev => ({ ...prev, isPlaying: true, error: null }));
      };

      // Handle pause
      const handlePause = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      // Handle error
      const handleError = () => {
        const errorMessage = audio.error?.message || 'Failed to load audio';
        setState(prev => ({ ...prev, error: errorMessage, isPlaying: false }));
        console.error('Audio error:', errorMessage);
      };

      // Handle ended
      const handleEnded = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Play stream
  const play = useCallback((streamUrl: string) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(error => {
        console.error('Play error:', error);
        setState(prev => ({ ...prev, error: error.message, isPlaying: false }));
      });
    } catch (error) {
      console.error('Error playing stream:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isPlaying: false 
      }));
    }
  }, []);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback((streamUrl?: string) => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      pause();
    } else {
      if (streamUrl) {
        play(streamUrl);
      } else if (audioRef.current.src) {
        audioRef.current.play().catch(error => {
          console.error('Play error:', error);
          setState(prev => ({ ...prev, error: error.message }));
        });
      }
    }
  }, [state.isPlaying, play, pause]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      setState(prev => ({ ...prev, volume }));
    }
  }, []);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlayPause,
    setVolume,
    seek,
    stop,
    audioRef,
  };
}
