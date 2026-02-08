import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface MediaPlayerProps {
  src: string;
  title: string;
  artist?: string;
  type: 'audio' | 'video';
  poster?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function MediaPlayer({
  src,
  title,
  artist,
  type,
  poster,
  onPlay,
  onPause,
  onEnded,
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  const togglePlay = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleSeek = (newTime: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;

    if (isMuted) {
      mediaRef.current.volume = volume / 100;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${title}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out: ${title}${artist ? ` by ${artist}` : ''}`,
        url: window.location.href,
      });
    } else {
      const text = `${title}${artist ? ` by ${artist}` : ''} - ${window.location.href}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-6 w-full">
      {/* Media Element */}
      {type === 'audio' ? (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          crossOrigin="anonymous"
        />
      ) : (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          crossOrigin="anonymous"
          className="w-full rounded-lg mb-4 bg-black"
        />
      )}

      {/* Info */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {artist && <p className="text-slate-400 text-sm mt-1">{artist}</p>}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={(v) => handleSeek(v[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Play Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-16 h-16"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={(v) => handleVolumeChange(v[0])}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 w-10 text-right">
            {isMuted ? '0' : volume}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
