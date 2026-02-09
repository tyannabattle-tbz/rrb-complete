import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/contexts/AudioContext';
import type { AudioTrack } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, LIVE_STREAMS, RRB_LEGACY_TRACKS } from '@/lib/streamLibrary';

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
  const audio = useAudio();
  const [showLiveStreams, setShowLiveStreams] = useState(false);

  // Convert Track[] to AudioTrack[] for global player
  const audioTracks: AudioTrack[] = tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    url: t.url,
    channel: "Rockin' Rockin' Boogie",
    duration: t.duration,
  }));

  // Check if current track belongs to this player
  const isThisPlayerActive = audio.currentTrack &&
    audioTracks.some(t => t.id === audio.currentTrack?.id);

  const currentTrackIndex = isThisPlayerActive
    ? audioTracks.findIndex(t => t.id === audio.currentTrack?.id)
    : -1;

  const handlePlayTrack = (index: number) => {
    audio.playQueue(audioTracks, index);
  };

  const handlePlayPause = () => {
    if (isThisPlayerActive) {
      audio.togglePlayPause();
    } else {
      // Start playing from the beginning
      audio.playQueue(audioTracks, 0);
    }
  };

  const handlePlayLiveStream = (stream: AudioTrack) => {
    audio.play(stream);
    setShowLiveStreams(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isPlaying = isThisPlayerActive && audio.isPlaying;
  const currentTrack = isThisPlayerActive ? audio.currentTrack : tracks[0];

  // RRB-specific live streams
  const rrbChannel = CHANNEL_PRESETS.find(c => c.id === 'ch-rrb-radio');
  const rrbLiveStreams = rrbChannel?.streams.filter(s => s.isLiveStream) || [
    LIVE_STREAMS.funkyRadio,
    LIVE_STREAMS.sonicUniverse,
    LIVE_STREAMS.seventies,
  ];

  return (
    <div className="w-full bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 p-6 space-y-4">
      {/* Radio Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-semibold text-foreground/70">{isPlaying ? '🔴 LIVE' : '⚫ READY'}</span>
        </div>
        <button
          onClick={() => setShowLiveStreams(!showLiveStreams)}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-semibold transition-colors"
        >
          <Radio className="w-3.5 h-3.5" />
          {showLiveStreams ? 'Show Playlist' : 'Live Streams'}
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          📻 {title}
        </h3>
        {description && <p className="text-sm text-foreground/70">{description}</p>}
        <p className="text-xs text-accent font-semibold">Continuous Canryn Production Inc. & Music Rotation</p>
      </div>

      {/* Live Streams Panel */}
      {showLiveStreams && (
        <div className="bg-background rounded-lg p-4 border border-accent/30 space-y-2">
          <h4 className="text-sm font-semibold text-foreground mb-2">🔴 Live Radio Streams</h4>
          <p className="text-xs text-foreground/60 mb-3">24/7 continuous streams — soul, funk, R&B, and more</p>
          {rrbLiveStreams.map(stream => {
            const isActive = audio.currentTrack?.id === stream.id;
            return (
              <button
                key={stream.id}
                onClick={() => handlePlayLiveStream(stream)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  isActive ? 'bg-accent/20 border border-accent/40' : 'hover:bg-accent/10 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  {isActive && audio.isPlaying ? (
                    <Pause className="w-4 h-4 text-red-400" />
                  ) : (
                    <Play className="w-4 h-4 text-red-400 ml-0.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{stream.title}</p>
                  <p className="text-xs text-foreground/60">{stream.artist}</p>
                </div>
                {isActive && (
                  <span className="text-[10px] text-red-400 font-bold animate-pulse">LIVE</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Current Track Info */}
      {!showLiveStreams && (
        <>
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground/60 mb-1">
              {isPlaying ? 'Now Playing' : 'Ready to Play'}
            </p>
            <h4 className="text-lg font-semibold text-foreground">
              {currentTrack?.title || 'Select a track'}
            </h4>
            <p className="text-sm text-foreground/70">{currentTrack?.artist}</p>
            {audio.currentTrack?.isLiveStream && isThisPlayerActive && (
              <div className="flex items-center gap-1.5 mt-2">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-semibold">Live Stream</span>
              </div>
            )}
          </div>

          {/* Progress Bar (only for non-live tracks) */}
          {isThisPlayerActive && !audio.currentTrack?.isLiveStream && (
            <div className="space-y-2">
              <Slider
                value={[audio.currentTime]}
                min={0}
                max={audio.duration || 100}
                step={0.1}
                onValueChange={(value) => audio.seek(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>{formatTime(audio.currentTime)}</span>
                <span>{formatTime(audio.duration)}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => audio.previous()}
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
                onClick={() => audio.next()}
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
                onClick={() => audio.toggleMute()}
                title={audio.isMuted ? 'Unmute' : 'Mute'}
              >
                {audio.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[audio.isMuted ? 0 : audio.volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(value) => audio.setVolume(value[0])}
                className="w-24"
              />
            </div>
          </div>

          {/* Playlist */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Playlist ({tracks.length} tracks)
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {tracks.map((track, index) => {
                const isActive = currentTrackIndex === index;
                return (
                  <button
                    key={track.id}
                    onClick={() => handlePlayTrack(index)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-accent/20 text-foreground font-medium'
                        : 'hover:bg-background/50 text-foreground/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/50 w-5 text-center">
                        {isActive && isPlaying ? '▶' : `${index + 1}.`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{track.title}</p>
                        <p className="text-xs text-foreground/50 truncate">{track.artist}</p>
                      </div>
                      {track.duration && (
                        <span className="text-xs text-foreground/50 ml-2">{formatTime(track.duration)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Radio Info */}
      <div className="border-t border-accent/20 pt-4 mt-4 text-xs text-foreground/60">
        <p>🎙️ RRB Radio cycles through Canryn Production Inc. explanations, commercials, and music 24/7</p>
        <p className="mt-1">💡 Tip: Audio continues playing when you navigate to other pages</p>
      </div>
    </div>
  );
}
