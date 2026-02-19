/**
 * Video Autopilot Player Component
 * Autonomous video playback with YouTube, spoke feeds, and open source channels
 * Integrated with QUMUS orchestration
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Radio,
  Zap,
  TrendingUp,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

type AutopilotSource = 'youtube' | 'spoke' | 'trending' | 'rrb';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration?: number;
  publishedAt?: Date;
  channelTitle?: string;
  viewCount?: number;
  link?: string;
  mediaUrl?: string;
}

export function VideoAutopilotPlayer() {
  const { user } = useAuth();
  const [source, setSource] = useState<AutopilotSource>('rrb');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const { mutate: initializeAutopilot, isPending: isInitializing } =
    trpc.videoAutopilot.initializeAutopilot.useMutation();

  const { data: nextInQueue, refetch: refetchQueue } =
    trpc.videoAutopilot.getNextInQueue.useQuery(
      {
        source,
        count: 10,
      },
      {
        enabled: !!user && isPlaying,
        refetchInterval: 30000, // Refresh every 30 seconds
      }
    );

  const { mutate: advanceQueue } = trpc.videoAutopilot.advanceQueue.useMutation({
    onSuccess: () => {
      refetchQueue();
    },
  });

  const { data: searchResults, isPending: isSearchingResults } =
    trpc.videoAutopilot.searchSpokeFeeds.useQuery(
      {
        query: searchQuery,
        limit: 20,
      },
      {
        enabled: searchQuery.length > 0 && isSearching,
      }
    );

  const { data: trendingContent } =
    trpc.videoAutopilot.getTrendingContent.useQuery(
      { limit: 20 },
      { enabled: source === 'trending' && !isPlaying }
    );

  // Initialize autopilot on source change
  useEffect(() => {
    if (!user) return;

    initializeAutopilot(
      { source },
      {
        onSuccess: (result) => {
          if (result.success && result.queue?.items.length > 0) {
            setQueue(result.queue.items);
            setQueueIndex(0);
            setCurrentVideo(result.queue.items[0]);
            toast.success(`Autopilot initialized: ${source}`);
          }
        },
        onError: (error) => {
          toast.error(`Failed to initialize autopilot: ${error.message}`);
        },
      }
    );
  }, [source, user, initializeAutopilot]);

  // Update queue when next items arrive
  useEffect(() => {
    if (nextInQueue?.items && nextInQueue.items.length > 0) {
      setQueue((prev) => [...prev, ...nextInQueue.items]);
    }
  }, [nextInQueue]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (!currentVideo) {
      toast.error('No video selected');
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
    } else {
      setIsPlaying(true);
      if (videoRef.current) videoRef.current.play().catch(() => {
        toast.error('Click on the page first, then try again');
      });
    }
  };

  // Handle skip forward
  const handleSkipForward = () => {
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentVideo(queue[nextIndex]);
      advanceQueue({ source, steps: 1 });
      setIsPlaying(true);
    } else {
      toast.info('End of queue reached');
    }
  };

  // Handle skip backward
  const handleSkipBack = () => {
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentVideo(queue[prevIndex]);
      setIsPlaying(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {
        toast.error('Fullscreen not available');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="w-full bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black aspect-video">
        {currentVideo?.link ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=${isPlaying ? 1 : 0}`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        ) : currentVideo?.mediaUrl ? (
          <video
            ref={videoRef}
            src={currentVideo.mediaUrl}
            className="w-full h-full object-cover"
            onEnded={handleSkipForward}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
              <Radio className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">No video selected</p>
              <p className="text-sm text-slate-500 mt-2">Select a source to start autopilot</p>
            </div>
          </div>
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
          {/* Top Info */}
          <div>
            <Badge className="bg-amber-500/90">{source.toUpperCase()}</Badge>
            {isPlaying && (
              <Badge className="ml-2 bg-green-500/90 animate-pulse">LIVE</Badge>
            )}
          </div>

          {/* Center Play Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-amber-500 hover:bg-amber-600"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleSkipBack}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleSkipForward}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
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
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info & Controls */}
      <div className="p-4 bg-slate-900">
        {/* Current Video Info */}
        {currentVideo && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {currentVideo.title}
            </h3>
            <p className="text-sm text-slate-400 mb-2">{currentVideo.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {currentVideo.channelTitle && (
                <span>{currentVideo.channelTitle}</span>
              )}
              {currentVideo.viewCount && (
                <span>•{' '}{(currentVideo.viewCount / 1000).toFixed(0)}K views</span>
              )}
              {currentVideo.duration && (
                <span>•{' '}{formatDuration(currentVideo.duration)}</span>
              )}
            </div>
          </div>
        )}

        {/* Source Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">
            Autopilot Source
          </label>
          <div className="flex gap-2">
            {(['rrb', 'youtube', 'spoke', 'trending'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={source === s ? 'default' : 'outline'}
                className={source === s ? 'bg-amber-500 hover:bg-amber-600' : ''}
                onClick={() => setSource(s)}
                disabled={isInitializing}
              >
                {s === 'rrb' && <Radio className="w-3 h-3 mr-1" />}
                {s === 'trending' && <TrendingUp className="w-3 h-3 mr-1" />}
                {s === 'spoke' && <Zap className="w-3 h-3 mr-1" />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search across all feeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearching(true)}
              className="flex-1 px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:border-amber-500 outline-none text-sm"
            />
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600"
              disabled={isSearchingResults}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Results */}
          {isSearching && searchResults && searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-slate-800 rounded border border-slate-700">
              {searchResults.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentVideo(item);
                    setIsSearching(false);
                    setSearchQuery('');
                    setIsPlaying(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm text-slate-300 border-b border-slate-700 last:border-b-0"
                >
                  <div className="font-medium text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {item.channelTitle || item.source}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Queue Preview */}
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">
            Next in Queue ({queue.length} items)
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {queue.slice(queueIndex + 1, queueIndex + 4).map((item, idx) => (
              <Card
                key={item.id}
                className="p-2 bg-slate-800 border-slate-700 cursor-pointer hover:bg-slate-700 transition"
                onClick={() => {
                  setQueueIndex(queueIndex + idx + 1);
                  setCurrentVideo(item);
                  setIsPlaying(true);
                }}
              >
                <p className="text-xs font-medium text-white truncate">
                  {idx + 1}. {item.title}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {item.channelTitle || 'Unknown'}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
