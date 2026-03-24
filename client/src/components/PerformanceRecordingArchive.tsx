'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Play, Download, Share2, Trash2, Eye, 
  Calendar, Clock, Users, Volume2, BarChart3, Archive 
} from 'lucide-react';
import { toast } from 'sonner';

interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: number;
  bandMembers: string[];
  genre: string;
  quality: 'HD' | '4K' | 'Standard';
  views: number;
  size: number;
  tags: string[];
  thumbnail?: string;
}

export function PerformanceRecordingArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'duration'>('date');
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: '1',
      title: 'Soul Session - March 2026',
      date: new Date('2026-03-20'),
      duration: 245,
      bandMembers: ['Chris Battle Sr', 'C.J. Battle', 'Kairen Battle'],
      genre: 'Soul',
      quality: '4K',
      views: 5234,
      size: 2147483648,
      tags: ['live', 'performance', 'family'],
    },
    {
      id: '2',
      title: 'Gospel Celebration',
      date: new Date('2026-03-15'),
      duration: 180,
      bandMembers: ['Chris Battle Sr', 'AP/Amandes'],
      genre: 'Gospel',
      quality: 'HD',
      views: 3421,
      size: 1073741824,
      tags: ['gospel', 'spiritual', 'uplifting'],
    },
    {
      id: '3',
      title: 'R&B Freestyle',
      date: new Date('2026-03-10'),
      duration: 120,
      bandMembers: ['C.J. Battle', 'Kairen Battle'],
      genre: 'R&B',
      quality: 'HD',
      views: 2156,
      size: 536870912,
      tags: ['rnb', 'freestyle', 'experimental'],
    },
  ]);

  const filteredRecordings = recordings
    .filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(r => !filterGenre || r.genre === filterGenre)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'views':
          return b.views - a.views;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

  const genres = [...new Set(recordings.map(r => r.genre))];
  const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
  const totalSize = recordings.reduce((sum, r) => sum + r.size, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatSize = (bytes: number) => {
    const gb = (bytes / 1073741824).toFixed(2);
    return `${gb}GB`;
  };

  const handlePlayRecording = (recording: Recording) => {
    toast.success(`Playing: ${recording.title}`);
  };

  const handleDownloadRecording = (recording: Recording) => {
    toast.success(`Downloading: ${recording.title}`);
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(recordings.filter(r => r.id !== id));
    toast.success('Recording deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Archive className="w-8 h-8 text-blue-400" />
          Performance Recording Archive
        </h2>
        <p className="text-slate-400">Search, organize, and replay all your performances</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400 mb-1">Total Recordings</p>
            <p className="text-2xl font-bold text-white">{recordings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400 mb-1">Total Duration</p>
            <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400 mb-1">Total Storage</p>
            <p className="text-2xl font-bold text-white">{formatSize(totalSize)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-white">{recordings.reduce((sum, r) => sum + r.views, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recordings, tags..."
                className="pl-10 bg-slate-700/30 border-slate-600 text-white placeholder-slate-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-700/30 border border-slate-600 rounded text-white text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="views">Sort by Views</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterGenre === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterGenre(null)}
              className="text-xs"
            >
              All Genres
            </Button>
            {genres.map(genre => (
              <Button
                key={genre}
                variant={filterGenre === genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterGenre(genre)}
                className="text-xs"
              >
                {genre}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRecordings.length === 0 ? (
          <Card className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="pt-8 text-center">
              <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No recordings found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecordings.map(recording => (
            <Card key={recording.id} className="bg-slate-800/40 border-slate-700/30 hover:border-slate-600/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-8 h-8 text-white opacity-50" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold truncate">{recording.title}</h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs">{recording.quality}</Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs">{recording.genre}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {recording.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(recording.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recording.bandMembers.length} members
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {recording.views.toLocaleString()} views
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-3">
                      {recording.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handlePlayRecording(recording)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      onClick={() => handleDownloadRecording(recording)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      onClick={() => handleDeleteRecording(recording.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-600/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
