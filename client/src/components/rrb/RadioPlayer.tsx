import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioVisualizer } from './AudioVisualizer';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
  description?: string;
}

interface RadioPlayerProps {
  tracks: Track[];
  title?: string;
  description?: string;
}

export function RadioPlayer({ tracks, title = "Legacy Radio", description }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play enabled
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [listeners, setListeners] = useState(2450);
  const [uptime, setUptime] = useState('24h 15m');
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Auto-cycle through tracks
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;
    
    const checkTrackEnd = setInterval(() => {
      if (audioRef.current && audioRef.current.currentTime >= audioRef.current.duration - 1) {
        handleNextTrack();
      }
    }, 500);
    
    return () => clearInterval(checkTrackEnd);
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleTrackEnd = () => {
    handleNextTrack();
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 p-6 space-y-4">
      {/* Radio Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-semibold text-foreground/70">{isPlaying ? '🔴 LIVE' : '⚫ OFFLINE'}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-foreground/60">
          <span>{listeners.toLocaleString()} listeners</span>
          <span>Uptime: {uptime}</span>
        </div>
      </div>
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          📻 {title}
        </h3>
        {description && <p className="text-sm text-foreground/70">{description}</p>}
        <p className="text-xs text-accent font-semibold">Continuous Canryn Production Inc. & Music Rotation</p>
      </div>

      {/* Current Track Info */}
      <div className="bg-background rounded-lg p-4 border border-border">
        <p className="text-sm text-foreground/60 mb-1">Now Playing</p>
        <h4 className="text-lg font-semibold text-foreground">{currentTrack.title}</h4>
        <p className="text-sm text-foreground/70">{currentTrack.artist}</p>
        {currentTrack.description && (
          <p className="text-xs text-foreground/60 mt-2">{currentTrack.description}</p>
        )}
      </div>

      {/* Audio Visualizer */}
      <AudioVisualizer
        audioRef={audioRef}
        isPlaying={isPlaying}
        height={60}
        spectrumColor="#d4af37"
      />

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={(value) => handleSeek(value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-foreground/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousTrack}
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="bg-accent hover:bg-accent/90"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextTrack}
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>

      {/* Playlist - Up Next */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Up Next ({tracks.length - currentTrackIndex - 1} tracks)</p>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {tracks.slice(currentTrackIndex + 1).map((track, index) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrackIndex(currentTrackIndex + index + 1);
                setIsPlaying(true);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-background/50 text-foreground/70"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/50">{currentTrackIndex + index + 2}.</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{track.title}</p>
                  <p className="text-xs text-foreground/50 truncate">{track.artist}</p>
                </div>
                {track.duration && (
                  <span className="text-xs text-foreground/50 ml-2">{formatTime(track.duration)}</span>
                )}
                {track.description && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded ml-2">CPI</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnd}
        crossOrigin="anonymous"
        autoPlay={true}
      />
      {/* Radio Info */}
      <div className="border-t border-accent/20 pt-4 mt-4 text-xs text-foreground/60">
        <p>🎙️ RRB Radio cycles through Canryn Production Inc. explanations, commercials, and music 24/7</p>
      </div>
    </div>
  );
}
