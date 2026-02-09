/**
 * Audio Player Component
 * 
 * Provides play/pause controls, progress bar, and listener analytics
 */

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  duration: number; // in seconds
  contentType: "podcast" | "audiobook" | "radio";
  listeners?: number;
  engagementRate?: number;
  onDownload?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  duration,
  contentType,
  listeners = 0,
  engagementRate = 0,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.error("Play error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Handle skip forward/backward
  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <Card className="p-3 sm:p-6 space-y-3 sm:space-y-4">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" />

      {/* Title and Type */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 capitalize">{contentType}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          onClick={handleProgressClick}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:h-3 transition-all"
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <Button
          onClick={() => handleSkip(-15)}
          variant="ghost"
          size="sm"
          title="Skip 15s back"
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
          size="lg"
        >
          {isLoading ? (
            <div className="animate-spin">⏳</div>
          ) : isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </Button>

        <Button
          onClick={() => handleSkip(15)}
          variant="ghost"
          size="sm"
          title="Skip 15s forward"
          className="h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
        {/* Volume Control */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            <span className="text-xs text-gray-600">Volume</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Playback Speed */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Speed</p>
          <div className="flex gap-1">
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  playbackRate === rate
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex flex-col justify-end">
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Listener Analytics */}
      {(listeners > 0 || engagementRate > 0) && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          {listeners > 0 && (
            <div>
              <p className="text-xs text-gray-600">Current Listeners</p>
              <p className="text-xl font-bold text-blue-600">{listeners.toLocaleString()}</p>
            </div>
          )}
          {engagementRate > 0 && (
            <div>
              <p className="text-xs text-gray-600">Engagement Rate</p>
              <p className="text-xl font-bold text-blue-600">{engagementRate.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Quality Info */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md">
        <p>Audio Format: MP3 • Bitrate: 128 kbps • Sample Rate: 24 kHz</p>
      </div>
    </Card>
  );
};
