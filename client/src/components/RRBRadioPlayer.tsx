/**
 * RRB Radio Player Component
 * Complete radio streaming player with channel selection, controls, and listener stats
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Channel {
  id: number;
  name: string;
  frequency: number;
  currentListeners: number;
  status: 'active' | 'maintenance' | 'offline';
}

interface RadioPlayerProps {
  channels?: Channel[];
  onChannelChange?: (channelId: number) => void;
}

export const RRBRadioPlayer: React.FC<RadioPlayerProps> = ({
  channels = [
    {
      id: 1,
      name: "Rockin' Rockin' Boogie Main",
      frequency: 432,
      currentListeners: 342,
      status: 'active',
    },
    {
      id: 2,
      name: 'Healing Frequencies',
      frequency: 528,
      currentListeners: 156,
      status: 'active',
    },
    {
      id: 3,
      name: 'Emergency Broadcast',
      frequency: 432,
      currentListeners: 0,
      status: 'active',
    },
  ],
  onChannelChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Handle channel change
  const handleChannelChange = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onChannelChange?.(channel.id);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
          setIsLoading(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Handle mute
  const handleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Player Card */}
      <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500 p-6">
        {/* Channel Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">{selectedChannel.name}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>📡 {selectedChannel.frequency} Hz</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{selectedChannel.currentListeners.toLocaleString()} listeners</span>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="space-y-4">
          {/* Play/Pause Button */}
          <div className="flex justify-center">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin">
                  <Radio className="w-8 h-8" />
                </div>
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Time Display */}
          <div className="text-center text-sm text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Progress Bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(value) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value[0];
              }
            }}
            className="w-full"
          />

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleMute}
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8">{isMuted ? 0 : volume}%</span>
          </div>
        </div>
      </Card>

      {/* Channel Selector */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Select Channel</h3>
        <div className="grid grid-cols-1 gap-2">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              onClick={() => handleChannelChange(channel)}
              variant={selectedChannel.id === channel.id ? 'default' : 'outline'}
              className={`justify-start text-left h-auto py-3 px-4 ${
                selectedChannel.id === channel.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                  : 'border-purple-500 hover:bg-purple-900/20'
              }`}
            >
              <div className="flex-1">
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs opacity-75">
                  {channel.frequency} Hz • {channel.currentListeners.toLocaleString()} listeners
                </div>
              </div>
              {channel.status === 'active' && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={`/api/stream/channel-${selectedChannel.id}`}
        onError={(e) => {
          console.error('Audio playback error:', e);
          setIsLoading(false);
          toast?.error?.('Unable to load audio stream');
        }}
      />
    </div>
  );
};

export default RRBRadioPlayer;
