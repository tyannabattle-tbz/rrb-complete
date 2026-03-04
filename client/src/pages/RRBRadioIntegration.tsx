import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, Radio, Heart, Share2, Settings, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

interface Station {
  id: number;
  name: string;
  description?: string;
  contentTypes: string[];
  icon?: string;
  currentListeners: number;
  totalListeners: number;
  isPublic: boolean;
}

interface PlaybackState {
  stationId: number | null;
  isPlaying: boolean;
  currentTrack?: {
    title: string;
    contentType: string;
    duration?: number;
  };
  volume: number;
}

export const RRBRadioIntegration: React.FC = () => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    stationId: null,
    isPlaying: false,
    volume: 75,
  });

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch user's favorite stations
  const { data: favorites } = trpc.customStationBuilder.getFavorites.useQuery();

  // Fetch all public stations
  const { data: publicStations } = trpc.customStationBuilder.browsePublicStations.useQuery({
    limit: 50,
  });

  // Fetch user's custom stations
  const { data: userStations } = trpc.customStationBuilder.getUserStations.useQuery();

  // Get current playback
  const { data: currentPlayback } = trpc.customStationBuilder.getCurrentPlayback.useQuery(
    { stationId: playbackState.stationId || 0 },
    { enabled: !!playbackState.stationId }
  );

  // Update last listened
  const updateLastListenedMutation = trpc.customStationBuilder.updateLastListened.useMutation();

  // Add listen time
  const addListenTimeMutation = trpc.customStationBuilder.addListenTime.useMutation();

  // Toggle favorite
  const toggleFavoriteMutation = trpc.customStationBuilder.toggleFavorite.useMutation();

  // Handle station selection
  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    setPlaybackState((prev) => ({
      ...prev,
      stationId: station.id,
      isPlaying: true,
    }));
    updateLastListenedMutation.mutate({ stationId: station.id });
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (!selectedStation) return;
    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setPlaybackState((prev) => ({
      ...prev,
      volume: value,
    }));
  };

  // Combine all stations
  const allStations = [
    ...(userStations || []),
    ...(publicStations || []),
  ].filter((s, i, arr) => arr.findIndex((t) => t.id === s.id) === i);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8" />
            <h1 className="text-4xl font-bold">RRB Radio</h1>
          </div>
          <p className="text-lg opacity-90">Elite Custom Station Platform - Powered by QUMUS</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Now Playing Section */}
        {selectedStation && (
          <Card className="mb-8 border-pink-500/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Station Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-6xl">{selectedStation.icon || '📻'}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {selectedStation.name}
                      </h2>
                      <p className="text-muted-foreground mb-4">{selectedStation.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(selectedStation.contentTypes as string[]).map((ct) => (
                          <Badge key={ct} variant="secondary">
                            {ct}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedStation.currentListeners} listening now
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {selectedStation.totalListeners} total listeners
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Currently Playing */}
                  {currentPlayback && (
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <p className="text-xs text-muted-foreground mb-1">NOW PLAYING</p>
                      <p className="font-semibold text-foreground">{currentPlayback.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentPlayback.contentType} • {currentPlayback.duration ? `${Math.floor(currentPlayback.duration / 60)} min` : 'Live'}
                      </p>
                    </div>
                  )}

                  {/* Playback Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="gap-2"
                    >
                      {playbackState.isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg">
                      <SkipForward className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() =>
                        toggleFavoriteMutation.mutate({
                          stationId: selectedStation.id,
                          isFavorite: true,
                        })
                      }
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="lg">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-xs">
                    <div className="flex items-center gap-4 mb-6">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={playbackState.volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm font-medium w-8 text-right">
                        {playbackState.volume}%
                      </span>
                    </div>
                  </div>

                  {/* Station Stats */}
                  <div className="w-full bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-2">FREQUENCY</p>
                    <p className="text-2xl font-bold text-foreground">432 Hz</p>
                    <p className="text-xs text-muted-foreground mt-2">Default Healing Frequency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Available Stations</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Stations Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStations.map((station: Station) => (
              <Card
                key={station.id}
                className={`cursor-pointer transition-all ${
                  selectedStation?.id === station.id
                    ? 'border-pink-500 bg-pink-500/5'
                    : 'hover:border-pink-500/50'
                }`}
                onClick={() => handleSelectStation(station)}
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{station.icon || '📻'}</div>
                  <h3 className="font-semibold text-foreground mb-1">{station.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {station.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(station.contentTypes as string[]).slice(0, 2).map((ct) => (
                      <Badge key={ct} variant="secondary" className="text-xs">
                        {ct}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {station.currentListeners} listening
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {allStations.map((station: Station) => (
              <Card
                key={station.id}
                className={`cursor-pointer transition-all ${
                  selectedStation?.id === station.id
                    ? 'border-pink-500 bg-pink-500/5'
                    : 'hover:border-pink-500/50'
                }`}
                onClick={() => handleSelectStation(station)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{station.icon || '📻'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{station.name}</h3>
                      <p className="text-sm text-muted-foreground">{station.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {station.currentListeners} listening
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(station.contentTypes as string[]).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RRBRadioIntegration;
