/**
 * Now Playing Widget
 * 
 * Compact audio player widget designed for sidebars and dashboard panels.
 * Shows current track, play/pause, skip, and volume — always visible.
 * Connects to the global AudioContext for persistent playback.
 * 
 * A Canryn Production — All Rights Reserved
 */
import { useAudio } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, getAllLiveStreams } from '@/lib/streamLibrary';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Radio, Music, Loader2
} from 'lucide-react';
import { useState } from 'react';

export function NowPlayingWidget({ compact = false }: { compact?: boolean }) {
  const audio = useAudio();
  const [showChannels, setShowChannels] = useState(false);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds === 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // If nothing is playing, show a quick-start panel
  if (!audio.currentTrack) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Now Playing
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Nothing playing. Pick a channel:
        </p>
        <div className="space-y-1.5">
          {CHANNEL_PRESETS.slice(0, 4).map(ch => (
            <button
              key={ch.id}
              onClick={() => {
                if (ch.streams.length > 0) {
                  audio.playQueue(ch.streams, 0);
                }
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-accent/50 transition-colors text-left"
            >
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ch.color }}
              />
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <div className="relative">
          <Radio className="h-4 w-4 text-primary" />
          {audio.isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Now Playing
        </span>
        {audio.currentTrack.isLiveStream && (
          <span className="ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
            LIVE
          </span>
        )}
      </div>

      {/* Track Info */}
      <div className="px-3 py-2">
        <p className="text-sm font-semibold truncate leading-tight">
          {audio.currentTrack.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {audio.currentTrack.artist}
          {audio.currentTrack.channel && (
            <span className="text-primary/70"> · {audio.currentTrack.channel}</span>
          )}
        </p>
      </div>

      {/* Progress bar (non-live only) */}
      {!audio.currentTrack.isLiveStream && audio.duration > 0 && (
        <div className="px-3 pb-1">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(audio.currentTime / audio.duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-muted-foreground">
              {formatTime(audio.currentTime)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTime(audio.duration)}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-1 px-3 pb-2">
        <button
          onClick={audio.previous}
          className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={audio.togglePlayPause}
          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label={audio.isPlaying ? 'Pause' : 'Play'}
        >
          {audio.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : audio.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        <button
          onClick={audio.next}
          className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Next"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>

        <div className="ml-auto">
          <button
            onClick={audio.toggleMute}
            className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={audio.isMuted ? 'Unmute' : 'Mute'}
          >
            {audio.isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Channel switcher */}
      <div className="border-t border-border/30">
        <button
          onClick={() => setShowChannels(!showChannels)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <Music className="h-3 w-3" />
          Switch Channel
        </button>
        {showChannels && (
          <div className="px-2 pb-2 space-y-1">
            {CHANNEL_PRESETS.map(ch => (
              <button
                key={ch.id}
                onClick={() => {
                  if (ch.streams.length > 0) {
                    audio.playQueue(ch.streams, 0);
                    setShowChannels(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-accent/50 transition-colors text-left"
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: ch.color }}
                />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NowPlayingWidget;
