import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Share2, Radio, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface Episode {
  id: string;
  title: string;
  streamUrl: string;
  duration?: number;
  description?: string;
}

interface EnhancedPodcastPlayerProps {
  podcast: {
    id: string;
    collectionName: string;
    artistName: string;
    artworkUrl600?: string;
    feedUrl?: string;
  };
  episodes?: Episode[];
  onClose?: () => void;
}

export default function EnhancedPodcastPlayer({
  podcast,
  episodes = [],
  onClose,
}: EnhancedPodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [streamingSource, setStreamingSource] = useState<'direct' | 'spotify' | 'apple' | 'soundcloud'>('direct');
  const [playlistMode, setPlaylistMode] = useState(false);

  const currentEpisode = episodes[currentEpisodeIndex];

  // Format time for display
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.error('Play error:', err));
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

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle playback rate
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Handle skip forward/backward
  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  // Handle next episode
  const handleNextEpisode = () => {
    if (episodes.length > 0) {
      const nextIndex = (currentEpisodeIndex + 1) % episodes.length;
      setCurrentEpisodeIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  // Handle previous episode
  const handlePreviousEpisode = () => {
    if (episodes.length > 0) {
      const prevIndex = (currentEpisodeIndex - 1 + episodes.length) % episodes.length;
      setCurrentEpisodeIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (currentEpisode?.streamUrl) {
      const a = document.createElement('a');
      a.href = currentEpisode.streamUrl;
      a.download = `${podcast.collectionName}-${currentEpisode.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Handle share
  const handleShare = () => {
    const shareText = `Check out "${currentEpisode?.title}" from ${podcast.collectionName} by ${podcast.artistName}`;
    if (navigator.share) {
      navigator.share({
        title: podcast.collectionName,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current && currentEpisode?.streamUrl) {
      audioRef.current.src = currentEpisode.streamUrl;
      setIsLoading(true);
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.error('Play error:', err));
      }
    }
  }, [currentEpisodeIndex, currentEpisode?.streamUrl]);

  // Handle episode end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (playlistMode && episodes.length > 0) {
        handleNextEpisode();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playlistMode, episodes.length, currentEpisodeIndex]);

  if (!currentEpisode && episodes.length === 0) {
    return (
      <Card className="p-6 bg-slate-800 border-slate-700 text-white">
        <p className="text-center text-slate-300">No episodes available</p>
      </Card>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 text-white shadow-2xl space-y-4">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      )}

      {/* Podcast Info */}
      <div className="flex gap-4">
        {podcast.artworkUrl600 && (
          <img
            src={podcast.artworkUrl600}
            alt={podcast.collectionName}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold">{podcast.collectionName}</h3>
          <p className="text-sm text-gray-300">{podcast.artistName}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-600">
              {episodes.length} Episodes
            </Badge>
            <Badge className={streamingSource === 'direct' ? 'bg-green-600' : 'bg-gray-600'}>
              {streamingSource.charAt(0).toUpperCase() + streamingSource.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Episode */}
      {currentEpisode && (
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Now Playing</p>
          <h4 className="font-semibold text-white">{currentEpisode.title}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {formatTime(currentTime)} / {formatTime(duration || currentEpisode.duration || 0)}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => skip(-15)}
          className="text-gray-300 hover:text-white"
        >
          -15s
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handlePreviousEpisode}
          className="text-gray-300 hover:text-white"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          size="lg"
          onClick={togglePlay}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 p-0"
        >
          {isLoading ? (
            <span className="animate-spin">⟳</span>
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleNextEpisode}
          className="text-gray-300 hover:text-white"
        >
          <SkipForward className="w-5 h-5" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => skip(15)}
          className="text-gray-300 hover:text-white"
        >
          +15s
        </Button>
      </div>

      {/* Volume and Playback Rate */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-8">{volume}%</span>
        </div>

        <select
          value={playbackRate}
          onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
          className="bg-slate-700 text-white text-sm px-2 py-1 rounded border border-slate-600"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      {/* Streaming Source Selector */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={streamingSource === 'direct' ? 'default' : 'outline'}
          onClick={() => setStreamingSource('direct')}
          className="flex-1"
        >
          <Radio className="w-4 h-4 mr-1" />
          Direct
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          className="flex-1 text-xs"
          title="Coming soon"
        >
          Spotify
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled
          className="flex-1 text-xs"
          title="Coming soon"
        >
          Apple
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          className="flex-1 border-slate-600 text-gray-300 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="flex-1 border-slate-600 text-gray-300 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          size="sm"
          variant={playlistMode ? 'default' : 'outline'}
          onClick={() => setPlaylistMode(!playlistMode)}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          {playlistMode ? 'Loop' : 'Queue'}
        </Button>
      </div>

      {/* Episode List */}
      {episodes.length > 1 && (
        <div className="bg-slate-700 rounded-lg p-3 max-h-40 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 mb-2">Episodes</p>
          <div className="space-y-1">
            {episodes.map((ep, idx) => (
              <button
                key={ep.id}
                onClick={() => {
                  setCurrentEpisodeIndex(idx);
                  setIsPlaying(true);
                }}
                className={`w-full text-left p-2 rounded text-sm truncate transition-colors ${
                  idx === currentEpisodeIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                }`}
                title={ep.title}
              >
                {idx + 1}. {ep.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        crossOrigin="anonymous"
      />
    </div>
  );
}
