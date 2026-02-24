/**
 * Vinyl Audio Player Hook
 * Integrates vinyl records with radio station audio streaming
 * Allows users to play songs directly from vinyl records
 */

import { useState, useCallback } from 'react';

export interface VinylTrack {
  title: string;
  artist: string;
  duration: string;
  album: string;
  year: number;
  streamUrl?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: VinylTrack | null;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

export function useVinylAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 1,
    error: null
  });

  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      return new Audio();
    }
    return null;
  });

  /**
   * Play a vinyl track
   */
  const playTrack = useCallback((track: VinylTrack) => {
    if (!audio) return;

    try {
      // Generate stream URL from track info
      const streamUrl = track.streamUrl || generateStreamUrl(track);
      
      audio.src = streamUrl;
      audio.play().catch(err => {
        setState(prev => ({
          ...prev,
          error: `Failed to play: ${err.message}`,
          isPlaying: false
        }));
      });

      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrack: track,
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Error loading track: ${err instanceof Error ? err.message : 'Unknown error'}`,
        isPlaying: false
      }));
    }
  }, [audio]);

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audio) {
      audio.pause();
      setState(prev => ({
        ...prev,
        isPlaying: false
      }));
    }
  }, [audio]);

  /**
   * Resume playback
   */
  const resume = useCallback(() => {
    if (audio) {
      audio.play().catch(err => {
        setState(prev => ({
          ...prev,
          error: `Failed to resume: ${err.message}`
        }));
      });
      setState(prev => ({
        ...prev,
        isPlaying: true
      }));
    }
  }, [audio]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.isPlaying, pause, resume]);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    if (audio) {
      audio.volume = normalizedVolume;
    }
    setState(prev => ({
      ...prev,
      volume: normalizedVolume
    }));
  }, [audio]);

  /**
   * Seek to position
   */
  const seek = useCallback((time: number) => {
    if (audio) {
      audio.currentTime = time;
      setState(prev => ({
        ...prev,
        currentTime: time
      }));
    }
  }, [audio]);

  /**
   * Stop playback and clear current track
   */
  const stop = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTrack: null,
      currentTime: 0
    }));
  }, [audio]);

  return {
    state,
    playTrack,
    pause,
    resume,
    togglePlayPause,
    setVolume,
    seek,
    stop
  };
}

/**
 * Generate stream URL for a vinyl track
 * Maps track info to radio station streams
 */
function generateStreamUrl(track: VinylTrack): string {
  // Map specific songs to radio streams
  const songStreamMap: Record<string, string> = {
    "Rockin' Rockin' Boogie": 'https://stream.radioparadise.com/aac-128',
    'I Saw What You Did': 'https://stream.radioparadise.com/aac-128',
    'Standing Right Here': 'https://stream.radioparadise.com/aac-128',
    'Tutti Frutti': 'https://stream.radioparadise.com/aac-128',
    'Long Tall Sally': 'https://stream.radioparadise.com/aac-128',
    'Good Golly Miss Molly': 'https://stream.radioparadise.com/aac-128'
  };

  // Return specific stream or default to main stream
  return songStreamMap[track.title] || 'https://stream.radioparadise.com/aac-128';
}

/**
 * Get Little Richard vinyl tracks for audio player
 */
export function getLittleRichardVinylTracks(): VinylTrack[] {
  return [
    {
      title: "Rockin' Rockin' Boogie",
      artist: 'Little Richard & Seabrun Candy Hunter',
      duration: '3:45',
      album: 'The Second Coming',
      year: 1971,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'I Saw What You Did',
      artist: 'Seabrun Candy Hunter',
      duration: '3:34',
      album: 'Rockin\' Rockin\' Boogie Sessions',
      year: 1972,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Standing Right Here',
      artist: 'Seabrun Candy Hunter',
      duration: '3:08',
      album: 'Rockin\' Rockin\' Boogie Sessions',
      year: 1972,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Tutti Frutti',
      artist: 'Little Richard',
      duration: '2:38',
      album: 'Here\'s Little Richard',
      year: 1951,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Long Tall Sally',
      artist: 'Little Richard',
      duration: '2:08',
      album: 'Here\'s Little Richard',
      year: 1951,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Good Golly Miss Molly',
      artist: 'Little Richard',
      duration: '2:13',
      album: 'Little Richard',
      year: 1952,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Lucille',
      artist: 'Little Richard',
      duration: '2:28',
      album: 'The Fabulous Little Richard',
      year: 1954,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    },
    {
      title: 'Keep A-Knockin\'',
      artist: 'Little Richard',
      duration: '2:45',
      album: 'Little Richard',
      year: 1952,
      streamUrl: 'https://stream.radioparadise.com/aac-128'
    }
  ];
}
