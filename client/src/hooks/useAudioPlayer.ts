import { useState, useEffect, useCallback } from 'react';
import { audioPlayerService, AudioPlayerState, NowPlayingTrack } from '@/lib/audioPlayerService';

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>(audioPlayerService.getState());

  useEffect(() => {
    // Subscribe to audio player state changes
    const unsubscribe = audioPlayerService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const play = useCallback(
    (streamUrl: string, track: Partial<NowPlayingTrack>) => {
      audioPlayerService.play(streamUrl, track);
    },
    []
  );

  const pause = useCallback(() => {
    audioPlayerService.pause();
  }, []);

  const resume = useCallback(() => {
    audioPlayerService.resume();
  }, []);

  const stop = useCallback(() => {
    audioPlayerService.stop();
  }, []);

  const seek = useCallback((time: number) => {
    audioPlayerService.seek(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioPlayerService.setVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    audioPlayerService.toggleMute();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.isPlaying, pause, resume]);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume,
    toggleMute,
    togglePlayPause,
  };
}
