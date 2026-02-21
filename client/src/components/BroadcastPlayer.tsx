import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings, AlertCircle } from 'lucide-react';

interface BroadcastPlayerProps {
  streamUrl?: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  quality?: '480p' | '720p' | '1080p' | '4k';
  onQualityChange?: (quality: string) => void;
}

export default function BroadcastPlayer({
  streamUrl,
  title,
  isLive,
  viewerCount,
  quality = '720p',
  onQualityChange,
}: BroadcastPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [selectedQuality, setSelectedQuality] = useState(quality);
  const [showSettings, setShowSettings] = useState(false);
  const [hasError, setHasError] = useState(false);

  const qualities = ['480p', '720p', '1080p', '4k'];

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

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleQualityChange = (newQuality: string) => {
    setSelectedQuality(newQuality);
    onQualityChange?.(newQuality);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  return (
    <Card className="bg-slate-900 border-slate-700 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {isLive ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span>LIVE</span>
                </div>
              ) : (
                'Offline'
              )}
            </CardDescription>
          </div>
          <Badge className="bg-blue-600">👥 {viewerCount.toLocaleString()} viewers</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden group">
          {hasError ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400">Stream unavailable</p>
                <p className="text-slate-500 text-sm mt-2">Please check your connection</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                onError={handleVideoError}
                crossOrigin="anonymous"
              >
                {streamUrl && <source src={streamUrl} type="application/x-mpegURL" />}
                Your browser does not support the video tag.
              </video>

              {/* Player Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700 rounded-full h-1 cursor-pointer hover:h-2 transition-all">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-slate-700"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleMuteToggle}
                          className="text-white hover:bg-slate-700"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-slate-600 rounded-full cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 w-8">{volume}%</span>
                      </div>

                      <span className="text-sm text-slate-400">
                        {isLive ? 'LIVE' : '00:00 / 00:00'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSettings(!showSettings)}
                          className="text-white hover:bg-slate-700"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>

                        {showSettings && (
                          <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg p-2 space-y-1 z-10">
                            <p className="text-xs font-semibold text-slate-300 px-2 py-1">Quality</p>
                            {qualities.map(q => (
                              <button
                                key={q}
                                onClick={() => {
                                  handleQualityChange(q);
                                  setShowSettings(false);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                                  selectedQuality === q
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-slate-700"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Badge */}
              {isLive && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 animate-pulse">🔴 LIVE</Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stream Info */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Quality</p>
            <p className="text-sm font-semibold text-white">{selectedQuality}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Bitrate</p>
            <p className="text-sm font-semibold text-white">4.5 Mbps</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Latency</p>
            <p className="text-sm font-semibold text-white">&lt; 2s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
