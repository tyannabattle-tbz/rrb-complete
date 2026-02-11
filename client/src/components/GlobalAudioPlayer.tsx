/**
 * Global Audio Player Bar
 * 
 * Persistent bottom bar that shows the currently playing track.
 * Visible from any page. Sits above the mobile bottom nav.
 * 
 * A Canryn Production
 */
import { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Radio, X, ChevronUp, ChevronDown, Loader2,
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, getAllLiveStreams } from '@/lib/streamLibrary';

export function GlobalAudioPlayer() {
  const audio = useAudio();
  const [expanded, setExpanded] = useState(false);
  const [showChannels, setShowChannels] = useState(false);

  // Don't render if nothing is playing and nothing has been played
  if (!audio.currentTrack && !audio.isLoading) {
    return <QuickPlayButton />;
  }

  const progress = audio.duration > 0
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-50 bg-zinc-900 text-white shadow-2xl border-t border-zinc-700/50">
      {/* Progress bar (thin line at top) */}
      {!audio.currentTrack?.isLiveStream && audio.duration > 0 && (
        <div className="h-1 bg-zinc-800 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          audio.seek(pct * audio.duration);
        }}>
          <div
            className="h-full bg-amber-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {audio.currentTrack?.isLiveStream && (
        <div className="h-1 bg-red-600 animate-pulse" />
      )}

      {/* Main player bar */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Track info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            {audio.currentTrack?.isLiveStream && (
              <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            )}
            <p className="text-sm font-medium truncate">
              {audio.currentTrack?.title || 'Loading...'}
            </p>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {audio.currentTrack?.artist}
            {audio.currentTrack?.channel && ` · ${audio.currentTrack.channel}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {audio.queue.length > 1 && (
            <button
              onClick={audio.previous}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={audio.togglePlayPause}
            className="p-2 bg-amber-500 hover:bg-amber-400 rounded-full transition-colors"
            aria-label={audio.isPlaying ? 'Pause' : 'Play'}
          >
            {audio.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : audio.isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>

          {audio.queue.length > 1 && (
            <button
              onClick={audio.next}
              className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={audio.toggleMute}
            className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors hidden sm:block"
            aria-label={audio.isMuted ? 'Unmute' : 'Mute'}
          >
            {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Volume slider - desktop only */}
          <div className="hidden md:flex items-center w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.isMuted ? 0 : audio.volume}
              onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Expand"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={audio.stop}
            className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time display */}
      {!audio.currentTrack?.isLiveStream && audio.duration > 0 && (
        <div className="flex justify-between px-3 pb-1 text-[10px] text-zinc-500">
          <span>{formatTime(audio.currentTime)}</span>
          <span>{formatTime(audio.duration)}</span>
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-zinc-800 p-3 max-h-48 sm:max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Quick Channels</h3>
            <button
              onClick={() => setShowChannels(!showChannels)}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              {showChannels ? 'Show Queue' : 'Browse Channels'}
            </button>
          </div>

          {showChannels ? (
            <div className="space-y-2">
              {CHANNEL_PRESETS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    const firstStream = channel.streams[0];
                    if (firstStream) {
                      audio.playQueue(channel.streams, 0);
                    }
                    setShowChannels(false);
                    setExpanded(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: channel.color + '30' }}
                  >
                    <Radio className="w-4 h-4" style={{ color: channel.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{channel.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{channel.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {audio.queue.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Queue is empty</p>
              ) : (
                audio.queue.map((track, i) => (
                  <button
                    key={track.id + i}
                    onClick={() => audio.playQueue(audio.queue, i)}
                    className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                      i === audio.queueIndex ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs w-5 text-center flex-shrink-0">
                      {i === audio.queueIndex && audio.isPlaying ? '▶' : i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{track.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                    </div>
                    {track.isLiveStream && (
                      <span className="text-[9px] text-red-400 font-bold ml-auto flex-shrink-0">LIVE</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {audio.error && (
        <div className="px-3 pb-2">
          <p className="text-xs text-red-400">⚠ {audio.error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Play Button — shown when nothing is playing.
 * Floating button that lets users start listening immediately.
 */
function QuickPlayButton() {
  const audio = useAudio();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      {/* Backdrop overlay — closes picker when tapping outside */}
      {showPicker && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setShowPicker(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-[70px] md:bottom-4 right-4 z-50">
        {showPicker && (
          <div className="absolute bottom-14 right-0 w-72 sm:w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden mb-2">
            <div className="p-2.5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Start Listening</h3>
                <p className="text-[10px] text-zinc-400">Choose a channel</p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 hover:bg-zinc-800 rounded-full"
                aria-label="Close channel picker"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
              {CHANNEL_PRESETS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    audio.playQueue(channel.streams, 0);
                    setShowPicker(false);
                  }}
                  className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: channel.color + '30' }}
                  >
                    <Radio className="w-3.5 h-3.5" style={{ color: channel.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{channel.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{channel.subsidiary}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-12 bg-amber-500 hover:bg-amber-400 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Open audio player"
        >
          <Radio className="w-6 h-6 text-black" />
        </button>
      </div>
    </>
  );
}
