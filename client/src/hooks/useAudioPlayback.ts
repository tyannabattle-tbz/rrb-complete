/**
 * Audio Playback Hook
 * Manages HTML5 audio element with iOS/Android device detection
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
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'none';
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
        console.error('Audio error:', errorMessage, audio.error);
      };

      // Handle ended
      const handleEnded = () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      };

      // Handle loadedmetadata
      const handleLoadedMetadata = () => {
        setState(prev => ({ ...prev, duration: audio.duration }));
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  // Detect if running on iOS
  const isIOS = useCallback((): boolean => {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }, []);

  // Get optimal stream URL based on device
  const getOptimalStreamUrl = useCallback((streamUrl: string): string => {
    // For iOS, use iOS-optimized endpoint
    if (isIOS()) {
      return `/api/stream/ios?url=${encodeURIComponent(streamUrl)}`;
    }
    // For desktop/Android, use direct URL
    return streamUrl;
  }, [isIOS]);

  // Play stream - use device-optimized URL
  const play = useCallback((streamUrl: string) => {
    if (!audioRef.current) return;

    try {
      // Only update source if URL changed
      if (currentUrl !== streamUrl) {
        // Get optimal URL based on device
        const optimalUrl = getOptimalStreamUrl(streamUrl);
        audioRef.current.src = optimalUrl;
        audioRef.current.load();
        setCurrentUrl(streamUrl);
      }

      // Play with error handling
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Play error:', error);
          if (error.name === 'NotAllowedError') {
            setState(prev => ({ ...prev, error: 'Please tap to play audio', isPlaying: false }));
          } else {
            setState(prev => ({ ...prev, error: error.message, isPlaying: false }));
          }
        });
      }
    } catch (error) {
      console.error('Error playing stream:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isPlaying: false 
      }));
    }
  }, [currentUrl, getOptimalStreamUrl]);

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
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Play error:', error);
            setState(prev => ({ ...prev, error: error.message }));
          });
        }
      }
    }
  }, [state.isPlaying, play, pause]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      const clamped = Math.max(0, Math.min(100, volume));
      audioRef.current.volume = clamped / 100;
      setState(prev => ({ ...prev, volume: clamped }));
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
