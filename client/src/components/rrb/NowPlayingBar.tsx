import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';

export const NowPlayingBar: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack, volume, setVolume } = useAudio();
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!currentTrack) return;

    const interval = setInterval(() => {
      setProgress(prev => (prev + 1) % 100);
    }, 500);

    return () => clearInterval(interval);
  }, [currentTrack, isPlaying]);

  if (!currentTrack) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          title="Now Playing"
        >
          <span className="text-xs font-bold">♫</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-orange-500/30 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate text-sm">
              {currentTrack.title}
            </p>
            <p className="text-slate-400 truncate text-xs">
              {currentTrack.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={previousTrack}
              className="text-slate-300 hover:text-white transition-colors p-2"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlayPause}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-slate-300 hover:text-white transition-colors p-2"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-600">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-slate-700 rounded-full cursor-pointer"
                title="Volume"
              />
            </div>

            {/* Minimize/Close */}
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white transition-colors p-2 ml-2"
              title="Minimize"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;
