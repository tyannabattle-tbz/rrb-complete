import React, { useState, useEffect } from 'react';
import { Search, Play, Download, Share2, Heart, MoreVertical, Filter, Grid, List } from 'lucide-react';

/**
 * Content Library UI
 * Browse and manage podcasts, radio shows, and video content
 * Full-text search and AI recommendations
 */

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'podcast' | 'radio' | 'video' | 'audio';
  duration: number;
  views: number;
  likes: number;
  uploadDate: number;
  thumbnail?: string;
  tags: string[];
  aiRecommendationScore?: number;
  url: string;
  system: 'rrb' | 'hybridcast' | 'qumus';
}

interface FilterOptions {
  type: ('podcast' | 'radio' | 'video' | 'audio')[];
  system: ('rrb' | 'hybridcast' | 'qumus')[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  sortBy: 'recent' | 'popular' | 'trending' | 'recommended';
}

export const ContentLibraryUI: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<FilterOptions>({
    type: ['podcast', 'radio', 'video', 'audio'],
    system: ['rrb', 'hybridcast', 'qumus'],
    dateRange: 'all',
    sortBy: 'recommended',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content/library');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('[Content] Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Filter and search content
  useEffect(() => {
    let result = content;

    // Apply type filter
    result = result.filter((item) => filters.type.includes(item.type));

    // Apply system filter
    result = result.filter((item) => filters.system.includes(item.system));

    // Apply date range filter
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    switch (filters.dateRange) {
      case 'week':
        result = result.filter((item) => now - item.uploadDate < 7 * dayMs);
        break;
      case 'month':
        result = result.filter((item) => now - item.uploadDate < 30 * dayMs);
        break;
      case 'year':
        result = result.filter((item) => now - item.uploadDate < 365 * dayMs);
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'recent':
        result.sort((a, b) => b.uploadDate - a.uploadDate);
        break;
      case 'popular':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'recommended':
        result.sort((a, b) => (b.aiRecommendationScore || 0) - (a.aiRecommendationScore || 0));
        break;
    }

    setFilteredContent(result);
  }, [content, searchQuery, filters]);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-6">Content Library</h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search podcasts, shows, videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white hover:border-cyan-500 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          <div className="flex gap-2 bg-slate-800 border-2 border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-6 bg-slate-800 rounded-lg border-2 border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <div className="space-y-2">
                  {(['podcast', 'radio', 'video', 'audio'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              type: [...filters.type, type],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              type: filters.type.filter((t) => t !== type),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* System Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">System</label>
                <div className="space-y-2">
                  {(['rrb', 'hybridcast', 'qumus'] as const).map((system) => (
                    <label key={system} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.system.includes(system)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              system: [...filters.system, system],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              system: filters.system.filter((s) => s !== system),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 uppercase">{system}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="recommended">Recommended</option>
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid/List */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No content found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredContent.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer overflow-hidden ${
                viewMode === 'list' ? 'flex gap-4 p-4' : ''
              }`}
            >
              {/* Thumbnail */}
              {item.thumbnail && (
                <div
                  className={`relative bg-slate-700 ${
                    viewMode === 'grid'
                      ? 'w-full h-48'
                      : 'w-24 h-24 flex-shrink-0'
                  }`}
                  style={{
                    backgroundImage: `url(${item.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}

              {/* Content Info */}
              <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">{item.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.has(item.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>{formatDuration(item.duration)}</span>
                  <span>{item.views.toLocaleString()} views</span>
                  <span>{formatDate(item.uploadDate)}</span>
                </div>

                {item.aiRecommendationScore && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{ width: `${item.aiRecommendationScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-cyan-400 font-medium">
                      {Math.round(item.aiRecommendationScore * 100)}% match
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white text-sm font-medium flex items-center justify-center gap-1">
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentLibraryUI;
