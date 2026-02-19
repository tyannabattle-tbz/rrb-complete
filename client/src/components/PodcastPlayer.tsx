/**
 * Podcast Player - ULTRA SIMPLE WORKING VERSION
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const EPISODES = [
  {
    id: 'rr-001',
    title: "Rockin' Rockin' Boogie",
    artist: 'Little Richard',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    channel: 'Rockin\' Rockin\' Boogie',
  },
  {
    id: 'rr-002',
    title: 'Tutti Frutti',
    artist: 'Little Richard',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    channel: 'Rockin\' Rockin\' Boogie',
  },
  {
    id: 'bh-001',
    title: 'The Thrill is Gone',
    artist: 'B.B. King',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    channel: 'Blues Hour',
  },
  {
    id: 'je-001',
    title: 'Take Five',
    artist: 'Dave Brubeck',
    streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    channel: 'Jazz Essentials',
  },
];

const CHANNELS = [
  { id: 7, name: "Rockin' Rockin' Boogie", description: 'Classic rock and roll hits' },
  { id: 8, name: 'Blues Hour', description: 'Classic blues and soul' },
  { id: 9, name: 'Jazz Essentials', description: 'Smooth jazz and bebop classics' },
];

export function PodcastPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [currentChannel, setCurrentChannel] = useState(7);

  const currentEpisode = EPISODES[currentIndex];

  // Set audio src when episode changes
  useEffect(() => {
    if (audioRef.current && currentEpisode?.streamUrl) {
      audioRef.current.src = currentEpisode.streamUrl;
      audioRef.current.load();
    }
  }, [currentIndex]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % EPISODES.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + EPISODES.length) % EPISODES.length);
    setIsPlaying(true);
  };

  const handleSwitchChannel = (channelId: number) => {
    setCurrentChannel(channelId);
    // Find first episode in channel
    const channelEpisodes = EPISODES.filter(ep => {
      if (channelId === 7) return ep.channel === "Rockin' Rockin' Boogie";
      if (channelId === 8) return ep.channel === 'Blues Hour';
      if (channelId === 9) return ep.channel === 'Jazz Essentials';
      return false;
    });
    if (channelEpisodes.length > 0) {
      const index = EPISODES.indexOf(channelEpisodes[0]);
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Now Playing Card */}
        <Card className="mb-6 p-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              {currentEpisode?.title || 'No Episode'}
            </h2>
            <p className="text-orange-100 mb-4">
              {currentEpisode?.artist || 'Unknown Artist'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                }`}
              ></div>
              <span className="font-semibold">
                {isPlaying ? 'PLAYING' : 'STOPPED'}
              </span>
            </div>
          </div>
        </Card>

        {/* Channels */}
        <Card className="mb-6 p-6 border-2 border-orange-300">
          <h3 className="text-sm font-bold text-orange-600 mb-4">CHANNELS</h3>
          <div className="grid grid-cols-3 gap-3">
            {CHANNELS.map((channel) => (
              <Button
                key={channel.id}
                onClick={() => handleSwitchChannel(channel.id)}
                variant={currentChannel === channel.id ? 'default' : 'outline'}
                className={`text-sm h-auto py-2 ${
                  currentChannel === channel.id
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : ''
                }`}
                title={channel.description}
              >
                {channel.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>{Math.floor(currentTime)}s</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(value) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = value[0];
                }
              }}
              className="flex-1"
            />
            <span>{Math.floor(duration)}s</span>
          </div>
        </Card>

        {/* Volume Control */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-orange-600" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-orange-600 w-8">
              {volume}
            </span>
          </div>
        </Card>

        {/* Playback Controls */}
        <Card className="mb-6 p-4 border-2 border-orange-300">
          <div className="flex gap-3">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="lg"
              className="flex-1"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 mr-2" />
              PREV
            </Button>
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              size="lg"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  PLAY
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              size="lg"
              className="flex-1"
              title="Next"
            >
              NEXT
              <SkipForward className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Episode Info */}
        {currentEpisode && (
          <Card className="p-4 bg-gray-50 border-2 border-gray-200">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Episode:</span>{' '}
                {currentEpisode.title}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Artist:</span>{' '}
                {currentEpisode.artist}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Channel:</span>{' '}
                {currentEpisode.channel}
              </div>
              <div>
                <span className="font-semibold text-gray-600">Volume:</span>{' '}
                {volume}%
              </div>
              <div>
                <span className="font-semibold text-gray-600">Status:</span>{' '}
                {isPlaying ? 'Playing' : 'Stopped'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <span className="font-semibold">Stream URL:</span>{' '}
                {currentEpisode.streamUrl?.substring(0, 50)}...
              </div>
            </div>
          </Card>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={handleNext}
          onError={(e) => console.error('Audio error:', e)}
        />
      </div>
    </div>
  );
}
