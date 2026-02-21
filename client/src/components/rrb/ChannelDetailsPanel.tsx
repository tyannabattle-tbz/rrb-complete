import React, { useState } from 'react';
import { CHANNEL_DESCRIPTIONS } from '@/data/channelDescriptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Radio, Volume2 } from 'lucide-react';

interface ChannelDetailsPanelProps {
  channelId: string;
  onClose?: () => void;
}

export function ChannelDetailsPanel({ channelId, onClose }: ChannelDetailsPanelProps) {
  const channel = CHANNEL_DESCRIPTIONS[channelId];
  const [showSchedule, setShowSchedule] = useState(false);

  if (!channel) {
    return (
      <div className="p-4 text-center text-gray-500">
        Channel details not found
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Music: 'bg-purple-100 text-purple-800',
      Talk: 'bg-blue-100 text-blue-800',
      '24/7': 'bg-green-100 text-green-800',
      Operators: 'bg-orange-100 text-orange-800',
      Events: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{channel.name}</h2>
            <Badge className={getCategoryColor(channel.category)}>
              {channel.category}
            </Badge>
          </div>
          <p className="text-gray-600">{channel.description}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Listeners</p>
                <p className="text-lg font-semibold">
                  {channel.listenerCount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="text-lg font-semibold">
                  {channel.frequency}Hz
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Show */}
      {channel.currentShow && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              Now Playing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{channel.currentShow}</p>
            <p className="text-sm text-gray-600">Live</p>
          </CardContent>
        </Card>
      )}

      {/* Next Show */}
      {channel.nextShow && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Up Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{channel.nextShow}</p>
            <p className="text-sm text-gray-600">Coming soon</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">About This Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{channel.longDescription}</p>
        </CardContent>
      </Card>

      {/* Featured Shows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Featured Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {channel.featured.map((show, idx) => (
              <div
                key={`featured-${idx}-${show}`}
                className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">{show}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Button */}
      <Button
        onClick={() => setShowSchedule(!showSchedule)}
        className="w-full"
        variant={showSchedule ? 'default' : 'outline'}
      >
        {showSchedule ? 'Hide Schedule' : 'View Full Schedule'}
      </Button>

      {/* Schedule View */}
      {showSchedule && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Channel Schedule</CardTitle>
            <CardDescription>
              24/7 programming guide for {channel.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                This channel provides continuous programming throughout the day and night.
              </p>
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold text-blue-900">Auto-Rotation Enabled</p>
                <p className="text-blue-800 text-xs">
                  Shows rotate automatically based on the schedule.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
