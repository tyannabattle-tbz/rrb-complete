import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Share2, Trash2, Eye, Grid, List, Search, Filter } from 'lucide-react';

export interface Video {
  id: string;
  name: string;
  thumbnail: string;
  duration: number;
  format: string;
  quality: string;
  fileSize: number;
  createdAt: Date;
  tags: string[];
  views: number;
  shared: boolean;
}

interface VideoGalleryProps {
  videos: Video[];
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function VideoGallery({ videos, onDelete, onShare, onDownload }: VideoGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'name'>('recent');

  // Get all unique tags
  const allTags = Array.from(new Set(videos.flatMap(v => v.tags)));

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => video.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'views':
        return b.views - a.views;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Video Gallery</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="recent">Most Recent</option>
            <option value="views">Most Viewed</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Filter className="w-4 h-4 text-muted-foreground mt-1" />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Videos Display */}
      {sortedVideos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No videos found</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVideos.map(video => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative group">
                <img
                  src={video.thumbnail}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}s
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold truncate">{video.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(video.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{video.quality}</span>
                  <span>{formatFileSize(video.fileSize)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onDownload?.(video.id)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShare?.(video.id)}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete?.(video.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedVideos.map(video => (
            <Card key={video.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <img
                  src={video.thumbnail}
                  alt={video.name}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{video.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(video.createdAt)} • {video.duration}s • {video.quality} • {formatFileSize(video.fileSize)}
                  </p>
                  {video.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {video.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{video.views}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload?.(video.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onShare?.(video.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete?.(video.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{sortedVideos.length}</p>
            <p className="text-sm text-muted-foreground">Videos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatFileSize(sortedVideos.reduce((sum, v) => sum + v.fileSize, 0))}
            </p>
            <p className="text-sm text-muted-foreground">Total Size</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {sortedVideos.reduce((sum, v) => sum + v.views, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
