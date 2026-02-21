/**
 * Audio Player Service
 * Manages streaming audio playback with real-time track information
 */

export interface NowPlayingTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  streamUrl: string;
  channelId: string;
  channelName: string;
}

export interface AudioPlayerState {
  currentTrack: NowPlayingTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
}

class AudioPlayerService {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: NowPlayingTrack | null = null;
  private listeners: Set<(state: AudioPlayerState) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      // Listen to audio events
      this.audioElement.addEventListener('play', () => this.notifyListeners());
      this.audioElement.addEventListener('pause', () => this.notifyListeners());
      this.audioElement.addEventListener('timeupdate', () => this.notifyListeners());
      this.audioElement.addEventListener('ended', () => this.onTrackEnded());
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.notifyListeners();
      });
    }
  }

  // Play a stream
  play(streamUrl: string, track: Partial<NowPlayingTrack>) {
    if (!this.audioElement) return;

    this.currentTrack = {
      id: track.id || `track-${Date.now()}`,
      title: track.title || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      duration: track.duration || 0,
      currentTime: 0,
      isPlaying: true,
      streamUrl,
      channelId: track.channelId || '',
      channelName: track.channelName || '',
    };

    this.audioElement.src = streamUrl;
    this.audioElement.play().catch(err => {
      console.error('Failed to play audio:', err);
      this.currentTrack!.isPlaying = false;
      this.notifyListeners();
    });

    this.startUpdateInterval();
    this.notifyListeners();
  }

  // Pause playback
  pause() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    if (this.currentTrack) {
      this.currentTrack.isPlaying = false;
    }
    this.notifyListeners();
  }

  // Resume playback
  resume() {
    if (!this.audioElement) return;
    this.audioElement.play().catch(err => {
      console.error('Failed to resume audio:', err);
    });
    if (this.currentTrack) {
      this.currentTrack.isPlaying = true;
    }
    this.notifyListeners();
  }

  // Stop playback
  stop() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.audioElement.src = '';
    this.currentTrack = null;
    this.stopUpdateInterval();
    this.notifyListeners();
  }

  // Seek to position
  seek(time: number) {
    if (!this.audioElement) return;
    this.audioElement.currentTime = time;
    if (this.currentTrack) {
      this.currentTrack.currentTime = time;
    }
    this.notifyListeners();
  }

  // Set volume (0-1)
  setVolume(volume: number) {
    if (!this.audioElement) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clampedVolume;
    this.notifyListeners();
  }

  // Toggle mute
  toggleMute() {
    if (!this.audioElement) return;
    this.audioElement.muted = !this.audioElement.muted;
    this.notifyListeners();
  }

  // Get current state
  getState(): AudioPlayerState {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.audioElement?.paused === false,
      volume: this.audioElement?.volume || 0,
      isMuted: this.audioElement?.muted || false,
      currentTime: this.audioElement?.currentTime || 0,
      duration: this.audioElement?.duration || 0,
    };
  }

  // Subscribe to state changes
  subscribe(listener: (state: AudioPlayerState) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getState());
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Private methods
  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in audio player listener:', error);
      }
    });
  }

  private onTrackEnded() {
    if (this.currentTrack) {
      this.currentTrack.isPlaying = false;
      this.currentTrack.currentTime = this.currentTrack.duration;
    }
    this.notifyListeners();
  }

  private startUpdateInterval() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => {
      if (this.currentTrack && this.audioElement) {
        this.currentTrack.currentTime = this.audioElement.currentTime;
        this.notifyListeners();
      }
    }, 100);
  }

  private stopUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Export singleton instance
export const audioPlayerService = new AudioPlayerService();
