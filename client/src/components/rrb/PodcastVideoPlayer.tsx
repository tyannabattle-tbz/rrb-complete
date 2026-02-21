import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Maximize2, Gamepad2, X } from 'lucide-react';

interface GameOverlayConfig {
  gameType: 'trivia' | 'memory' | 'reaction' | 'rhythm';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
}

interface PodcastVideoPlayerProps {
  videoUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  hasGameOverlay: boolean;
  gameOverlayConfig?: GameOverlayConfig;
  onView?: () => void;
}

export const PodcastVideoPlayer: React.FC<PodcastVideoPlayerProps> = ({
  videoUrl,
  title,
  description,
  thumbnailUrl,
  hasGameOverlay,
  gameOverlayConfig,
  onView,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGameOverlay, setShowGameOverlay] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768);
    });

    onView?.();
  }, [onView]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleGameOverlay = () => {
    if (isMobile && hasGameOverlay) {
      setShowGameOverlay(!showGameOverlay);
    }
  };

  const generateGameScore = () => {
    const score = Math.floor(Math.random() * 1000) + 100;
    setGameScore(score);
  };

  return (
    <div className="w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      {/* Video Container */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Game Overlay (Mobile) */}
        {showGameOverlay && isMobile && hasGameOverlay && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <button
              onClick={() => setShowGameOverlay(false)}
              className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <Gamepad2 className="w-16 h-16 text-orange-500 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">
              {gameOverlayConfig?.gameType.toUpperCase()} GAME
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Difficulty: {gameOverlayConfig?.difficulty}
            </p>

            <div className="bg-slate-800 rounded-lg p-6 mb-4 w-4/5">
              <p className="text-slate-400 text-sm mb-4">Quick Challenge</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <button
                    key={i}
                    onClick={generateGameScore}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Option {i}
                  </button>
                ))}
              </div>
              {gameScore > 0 && (
                <div className="text-center">
                  <p className="text-green-400 font-bold text-2xl">+{gameScore} pts!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGameOverlay(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Video
            </button>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
          >
            <Play className="w-20 h-20 text-white group-hover:scale-110 transition-transform fill-current" />
          </button>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-current" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-slate-400 w-8">{volume}%</span>
            </div>

            <div className="flex-1" />

            {hasGameOverlay && isMobile && (
              <button
                onClick={handleGameOverlay}
                className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-500"
                title="Play Game"
              >
                <Gamepad2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          {hasGameOverlay && (
            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              Interactive Game
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastVideoPlayer;
