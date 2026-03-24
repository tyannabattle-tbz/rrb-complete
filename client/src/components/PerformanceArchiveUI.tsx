'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Search, Play, Download, Heart, Share2, MessageSquare, Calendar, Clock, Music, Users, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceRecord {
  id: string;
  title: string;
  date: Date;
  duration: number;
  genre: string;
  bandMembers: string[];
  plays: number;
  likes: number;
  comments: number;
  audioUrl: string;
  thumbnailUrl?: string;
  isFavorite: boolean;
  rating?: number;
  lufs: number;
}

interface PerformanceArchiveUIProps {
  performances?: PerformanceRecord[];
  onPlayPerformance?: (performanceId: string) => void;
  onDownloadPerformance?: (performanceId: string) => void;
}

export function PerformanceArchiveUI({ 
  performances = [], 
  onPlayPerformance,
  onDownloadPerformance 
}: PerformanceArchiveUIProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'plays' | 'likes' | 'rating'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample performances if none provided
  const samplePerformances: PerformanceRecord[] = [
    {
      id: '1',
      title: 'Live Studio Session - Take 3',
      date: new Date('2026-03-20'),
      duration: 245,
      genre: 'soul',
      bandMembers: ['Chris Battle Sr', 'C.J. Battle', 'Kairen Battle'],
      plays: 342,
      likes: 89,
      comments: 12,
      audioUrl: 'https://example.com/audio1.mp3',
      isFavorite: true,
      rating: 5,
      lufs: -14,
    },
    {
      id: '2',
      title: 'Healing Frequencies Session',
      date: new Date('2026-03-18'),
      duration: 180,
      genre: 'ambient',
      bandMembers: ['AP/Amandes Studio'],
      plays: 156,
      likes: 45,
      comments: 8,
      audioUrl: 'https://example.com/audio2.mp3',
      isFavorite: false,
      rating: 4,
      lufs: -14,
    },
    {
      id: '3',
      title: 'Hip-Hop Beat Session',
      date: new Date('2026-03-15'),
      duration: 320,
      genre: 'hip-hop',
      bandMembers: ['Chris Battle Sr', 'C.J. Battle'],
      plays: 523,
      likes: 134,
      comments: 28,
      audioUrl: 'https://example.com/audio3.mp3',
      isFavorite: true,
      rating: 5,
      lufs: -14,
    },
  ];

  const displayPerformances = performances.length > 0 ? performances : samplePerformances;

  // Filter and sort performances
  const filteredPerformances = useMemo(() => {
    let filtered = displayPerformances.filter(perf => {
      const matchesSearch = perf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           perf.bandMembers.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGenre = !selectedGenre || perf.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'plays':
          return b.plays - a.plays;
        case 'likes':
          return b.likes - a.likes;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'date':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

    return filtered;
  }, [displayPerformances, searchQuery, selectedGenre, sortBy]);

  const genres = [...new Set(displayPerformances.map(p => p.genre))];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Archive className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Performance Archive</h2>
          <Badge className="bg-amber-500/20 text-amber-300">{filteredPerformances.length} Recordings</Badge>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search performances or band members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/60 border-slate-700/50 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedGenre === null ? 'default' : 'outline'}
              onClick={() => setSelectedGenre(null)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              <Filter className="w-3 h-3 mr-1" /> All Genres
            </Button>
            {genres.map(genre => (
              <Button
                key={genre}
                size="sm"
                variant={selectedGenre === genre ? 'default' : 'outline'}
                onClick={() => setSelectedGenre(genre)}
                className={selectedGenre === genre ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-700 hover:bg-slate-600'}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-800/60 border border-slate-700/50 text-white rounded-md text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="plays">Sort by Plays</option>
              <option value="likes">Sort by Likes</option>
              <option value="rating">Sort by Rating</option>
            </select>

            <div className="flex gap-1 ml-auto">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Performances Grid/List */}
      {filteredPerformances.length === 0 ? (
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="py-12 text-center">
            <Archive className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">No performances found matching your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredPerformances.map((perf) => (
            <Card
              key={perf.id}
              className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-700/30 hover:border-amber-500/30 transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              {perf.thumbnailUrl && (
                <div className="h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
                  <img
                    src={perf.thumbnailUrl}
                    alt={perf.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-white text-sm line-clamp-2">{perf.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(perf.date)}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success(perf.isFavorite ? 'Removed from favorites' : 'Added to favorites')}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <Heart className={`w-4 h-4 ${perf.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDuration(perf.duration)}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Music className="w-3 h-3" />
                    <span className="capitalize">{perf.genre}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-3 h-3" />
                    {perf.bandMembers.length} members
                  </div>
                  <div className="text-slate-400">
                    LUFS: {perf.lufs}
                  </div>
                </div>

                {/* Band Members */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Band Members</p>
                  <div className="flex flex-wrap gap-1">
                    {perf.bandMembers.map((member, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-300 text-xs">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                      <Play className="w-3 h-3" />
                      <span className="text-xs font-semibold">{perf.plays}</span>
                    </div>
                    <p className="text-xs text-slate-400">Plays</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs font-semibold">{perf.likes}</span>
                    </div>
                    <p className="text-xs text-slate-400">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-xs font-semibold">{perf.comments}</span>
                    </div>
                    <p className="text-xs text-slate-400">Comments</p>
                  </div>
                </div>

                {/* Rating */}
                {perf.rating && (
                  <div className="flex items-center gap-1 pt-2 border-t border-slate-700/30">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < perf.rating! ? 'text-amber-400' : 'text-slate-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      onPlayPerformance?.(perf.id);
                      toast.success('Playing performance...');
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" /> Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => {
                      onDownloadPerformance?.(perf.id);
                      toast.success('Downloading...');
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Archive Stats */}
      <Card className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Archive Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Recordings</p>
              <p className="text-2xl font-bold text-amber-400">{displayPerformances.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Plays</p>
              <p className="text-2xl font-bold text-purple-400">
                {displayPerformances.reduce((sum, p) => sum + p.plays, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Likes</p>
              <p className="text-2xl font-bold text-red-400">
                {displayPerformances.reduce((sum, p) => sum + p.likes, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Avg. Duration</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatDuration(Math.floor(displayPerformances.reduce((sum, p) => sum + p.duration, 0) / displayPerformances.length))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
