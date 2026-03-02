import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Share2, Mic, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  url: string;
  type: 'song' | 'podcast' | 'audiobook' | 'commercial' | 'broadcast';
  thumbnail?: string;
}

interface UnifiedAudioPlayerProps {
  tracks: AudioTrack[];
  autoPlay?: boolean;
  showPlaylist?: boolean;
  onTrackChange?: (track: AudioTrack) => void;
}

export function UnifiedAudioPlayer({
  tracks,
  autoPlay = false,
  showPlaylist = true,
  onTrackChange,
}: UnifiedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(showPlaylist);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRecording, setIsRecording] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Playback error:', err);
          toast.error('Failed to play audio');
        });
      }
    }
    onTrackChange?.(currentTrack);
  }, [currentTrackIndex, currentTrack, onTrackChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', () => setIsLoading(true));
      audio.removeEventListener('canplay', () => setIsLoading(false));
    };
  }, [currentTrackIndex, tracks.length]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Playback error:', err);
          toast.error('Failed to play audio');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setPlaybackRate(rate);
    toast.success(`Playback speed: ${rate}x`);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentTrack.url;
    link.download = `${currentTrack.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = () => {
    const shareData = {
      title: currentTrack.title,
      text: `Listen to ${currentTrack.title}${currentTrack.artist ? ` by ${currentTrack.artist}` : ''}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Main Player */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-6">
          {currentTrack.thumbnail && (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{currentTrack.title}</h3>
            <p className="text-sm text-slate-400 truncate">
              {currentTrack.artist || 'Unknown Artist'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentTrack.type.charAt(0).toUpperCase() + currentTrack.type.slice(1)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <input
            type="range"
            min="0"
            max={currentTrack.duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={handlePrevious}
            disabled={currentTrackIndex === 0}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            onClick={togglePlayPause}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin">⟳</div>
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentTrackIndex === tracks.length - 1}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume and Settings */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-slate-400 w-8">{Math.round(volume * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
            <div>
              <p className="text-sm text-slate-300 mb-2">Playback Speed</p>
              <div className="flex gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <Button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    variant={playbackRate === rate ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Playlist */}
      {showPlaylistPanel && tracks.length > 1 && (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Playlist ({tracks.length})</h3>
            <Button
              onClick={() => setShowPlaylistPanel(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400"
            >
              ✕
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => setCurrentTrackIndex(index)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-blue-600/20 border border-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-6 text-center">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {track.artist || 'Unknown'} • {formatTime(track.duration)}
                    </p>
                  </div>
                  {index === currentTrackIndex && isPlaying && (
                    <div className="text-blue-400">♫</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
