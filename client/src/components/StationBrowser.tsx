import React, { useState, useMemo } from 'react';
import { Search, Filter, Play, Heart, Share2, Zap, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

type ContentType = 'talk' | 'music' | 'news' | 'meditation' | 'healing' | 'entertainment' | 'educational' | 'sports' | 'comedy' | 'mixed';

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; icon: string; color: string }[] = [
  { value: 'talk', label: 'Talk', icon: '🎙️', color: 'bg-blue-500' },
  { value: 'music', label: 'Music', icon: '🎵', color: 'bg-purple-500' },
  { value: 'news', label: 'News', icon: '📰', color: 'bg-red-500' },
  { value: 'meditation', label: 'Meditation', icon: '🧘', color: 'bg-green-500' },
  { value: 'healing', label: 'Healing', icon: '💚', color: 'bg-emerald-500' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-pink-500' },
  { value: 'educational', label: 'Educational', icon: '📚', color: 'bg-yellow-500' },
  { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-orange-500' },
  { value: 'comedy', label: 'Comedy', icon: '😄', color: 'bg-cyan-500' },
  { value: 'mixed', label: 'Mixed', icon: '🎪', color: 'bg-indigo-500' },
];

interface StationBrowserProps {
  onStationSelect?: (stationId: number) => void;
}

export const StationBrowser: React.FC<StationBrowserProps> = ({ onStationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [sortBy, setSortBy] = useState<'listeners' | 'trending' | 'newest'>('listeners');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'favorites'>('all');

  const { data: userStations } = trpc.customStationBuilder.getUserStations.useQuery();
  const { data: publicStations } = trpc.customStationBuilder.browsePublicStations.useQuery({
    limit: 100,
  });
  const { data: favorites } = trpc.customStationBuilder.getFavorites.useQuery();

  // Combine and filter stations
  const allStations = useMemo(() => {
    let stations = [];

    if (filterType === 'all' || filterType === 'public') {
      stations = [...(publicStations || [])];
    }

    if (filterType === 'all' || filterType === 'favorites') {
      if (favorites && favorites.length > 0) {
        const favoriteIds = new Set(favorites.map((f: any) => f.stationId));
        const favoriteStations = (userStations || []).filter((s: any) => favoriteIds.has(s.id));
        stations = [...stations, ...favoriteStations];
      }
    }

    if (filterType === 'all') {
      stations = [...(userStations || []), ...stations];
    }

    // Remove duplicates
    const uniqueStations = Array.from(new Map(stations.map((s: any) => [s.id, s])).values());

    // Filter by search query
    let filtered = uniqueStations.filter((station: any) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by content types
    if (selectedContentTypes.length > 0) {
      filtered = filtered.filter((station: any) =>
        selectedContentTypes.some((ct) => (station.contentTypes as ContentType[]).includes(ct))
      );
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      if (sortBy === 'listeners') {
        return (b.currentListeners || 0) - (a.currentListeners || 0);
      } else if (sortBy === 'trending') {
        return (b.totalListeners || 0) - (a.totalListeners || 0);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [userStations, publicStations, favorites, searchQuery, selectedContentTypes, sortBy, filterType]);

  const toggleContentType = (contentType: ContentType) => {
    setSelectedContentTypes((prev) =>
      prev.includes(contentType)
        ? prev.filter((ct) => ct !== contentType)
        : [...prev, contentType]
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discover Stations</h1>
        <p className="text-muted-foreground">Browse and listen to custom stations from the community</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All Stations
          </Button>
          <Button
            variant={filterType === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('public')}
          >
            Public
          </Button>
          <Button
            variant={filterType === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('favorites')}
          >
            Favorites
          </Button>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={sortBy === 'listeners' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('listeners')}
            className="gap-1"
          >
            <Users className="w-3 h-3" />
            Live Listeners
          </Button>
          <Button
            variant={sortBy === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('trending')}
            className="gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            Trending
          </Button>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('newest')}
            className="gap-1"
          >
            <Clock className="w-3 h-3" />
            Newest
          </Button>
        </div>

        {/* Content Type Filter */}
        <div>
          <p className="text-sm font-medium mb-2">Filter by Content Type:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedContentTypes.includes(option.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleContentType(option.value)}
                className="justify-start text-xs"
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {allStations.length} Station{allStations.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {allStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStations.map((station: any) => (
              <Card
                key={station.id}
                className="hover:border-pink-500/50 transition-all cursor-pointer group"
                onClick={() => onStationSelect?.(station.id)}
              >
                <CardContent className="pt-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{station.icon || '📻'}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{station.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{station.description}</p>

                  {/* Content Types */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(station.contentTypes as ContentType[]).slice(0, 3).map((ct) => {
                      const option = CONTENT_TYPE_OPTIONS.find((o) => o.value === ct);
                      return (
                        <Badge key={ct} variant="secondary" className="text-xs">
                          {option?.icon} {option?.label}
                        </Badge>
                      );
                    })}
                    {(station.contentTypes as ContentType[]).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(station.contentTypes as ContentType[]).length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>{station.currentListeners || 0} listening now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>{station.totalListeners || 0} total listeners</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button className="w-full gap-2" onClick={(e) => {
                    e.stopPropagation();
                    onStationSelect?.(station.id);
                  }}>
                    <Play className="w-4 h-4" />
                    Play Station
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No stations found matching your filters</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContentTypes([]);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StationBrowser;
