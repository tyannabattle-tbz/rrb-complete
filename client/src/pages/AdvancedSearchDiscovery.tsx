'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Clock, Users, TrendingUp, Star } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  channel: string;
  category: string;
  description: string;
  duration: number;
  plays: number;
  rating: number;
  date: number;
  tags: string[];
  thumbnail: string;
}

interface SearchFilter {
  category: string[];
  channel: string[];
  duration: 'any' | 'short' | 'medium' | 'long';
  sortBy: 'relevance' | 'recent' | 'popular' | 'trending';
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Healing Frequencies: 432Hz Meditation',
    channel: 'Healing Frequencies',
    category: 'Wellness',
    description: 'Deep meditation session with 432Hz healing frequency',
    duration: 3600,
    plays: 12450,
    rating: 4.8,
    date: Date.now() - 86400000 * 2,
    tags: ['meditation', 'healing', '432hz', 'wellness'],
    thumbnail: '🧘',
  },
  {
    id: '2',
    title: 'Rockin Rockin Boogie: Legacy Stories',
    channel: 'RRB Legacy',
    category: 'Podcast',
    description: 'Stories from the Rockin Rockin Boogie archives',
    duration: 2700,
    plays: 8923,
    rating: 4.6,
    date: Date.now() - 86400000 * 5,
    tags: ['podcast', 'stories', 'legacy', 'music'],
    thumbnail: '🎙️',
  },
  {
    id: '3',
    title: 'Morning Vibes Mix',
    channel: 'Ty OS Radio',
    category: 'Music',
    description: 'Uplifting morning music mix to start your day',
    duration: 1800,
    plays: 23450,
    rating: 4.7,
    date: Date.now() - 86400000,
    tags: ['music', 'morning', 'vibes', 'uplifting'],
    thumbnail: '🎵',
  },
  {
    id: '4',
    title: 'Ocean Waves Ambient Soundscape',
    channel: 'Ambient Soundscapes',
    category: 'Ambient',
    description: 'Relaxing ocean waves for focus and relaxation',
    duration: 7200,
    plays: 15670,
    rating: 4.9,
    date: Date.now() - 86400000 * 3,
    tags: ['ambient', 'nature', 'relaxation', 'focus'],
    thumbnail: '🌊',
  },
  {
    id: '5',
    title: 'Tech Talk: AI in Broadcasting',
    channel: 'Tech Talks',
    category: 'Education',
    description: 'Exploring artificial intelligence in modern broadcasting',
    duration: 2400,
    plays: 5234,
    rating: 4.5,
    date: Date.now() - 86400000 * 7,
    tags: ['technology', 'ai', 'broadcasting', 'education'],
    thumbnail: '🤖',
  },
  {
    id: '6',
    title: 'Evening Jazz Sessions',
    channel: 'Ty OS Radio',
    category: 'Music',
    description: 'Smooth jazz for evening relaxation',
    duration: 3000,
    plays: 18900,
    rating: 4.8,
    date: Date.now() - 86400000 * 4,
    tags: ['jazz', 'music', 'evening', 'relaxation'],
    thumbnail: '🎷',
  },
];

export default function AdvancedSearchDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({
    category: [],
    channel: [],
    duration: 'any',
    sortBy: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);

  // Get unique categories and channels
  const categories = [...new Set(mockContent.map(c => c.category))];
  const channels = [...new Set(mockContent.map(c => c.channel))];

  // Filter and search logic
  const filteredContent = useMemo(() => {
    let results = mockContent;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      results = results.filter(item => filters.category.includes(item.category));
    }

    // Channel filter
    if (filters.channel.length > 0) {
      results = results.filter(item => filters.channel.includes(item.channel));
    }

    // Duration filter
    if (filters.duration !== 'any') {
      results = results.filter(item => {
        const minutes = item.duration / 60;
        if (filters.duration === 'short') return minutes < 15;
        if (filters.duration === 'medium') return minutes >= 15 && minutes < 60;
        if (filters.duration === 'long') return minutes >= 60;
        return true;
      });
    }

    // Sorting
    const sorted = [...results];
    if (filters.sortBy === 'recent') {
      sorted.sort((a, b) => b.date - a.date);
    } else if (filters.sortBy === 'popular') {
      sorted.sort((a, b) => b.plays - a.plays);
    } else if (filters.sortBy === 'trending') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    return sorted;
  }, [searchQuery, filters]);

  const handleToggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleToggleChannel = (channel: string) => {
    setFilters(prev => ({
      ...prev,
      channel: prev.channel.includes(channel)
        ? prev.channel.filter(c => c !== channel)
        : [...prev.channel, channel],
    }));
  };

  const handleSaveSearch = () => {
    if (searchQuery && !savedSearches.includes(searchQuery)) {
      setSavedSearches([...savedSearches, searchQuery]);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Search & Discovery</h1>
          <p className="text-slate-400">Find content across all 54 channels with smart filters</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white h-12"
              />
            </div>
            <Button
              variant="outline"
              className="border-slate-600 h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 h-12" onClick={handleSaveSearch}>
              💾 Save Search
            </Button>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {savedSearches.map(search => (
                <Badge
                  key={search}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-700"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Category</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category)}
                            onChange={() => handleToggleCategory(category)}
                            className="rounded"
                          />
                          <span className="text-slate-300 text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Channel Filter */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Channel</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {channels.map(channel => (
                        <label key={channel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.channel.includes(channel)}
                            onChange={() => handleToggleChannel(channel)}
                            className="rounded"
                          />
                          <span className="text-slate-300 text-sm">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Duration</h3>
                    <select
                      value={filters.duration}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          duration: e.target.value as any,
                        }))
                      }
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="any">Any</option>
                      <option value="short">Short (&lt;15 min)</option>
                      <option value="medium">Medium (15-60 min)</option>
                      <option value="long">Long (&gt;60 min)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 text-sm">Sort By</h3>
                    <select
                      value={filters.sortBy}
                      onChange={e =>
                        setFilters(prev => ({
                          ...prev,
                          sortBy: e.target.value as any,
                        }))
                      }
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-slate-600"
                    onClick={() =>
                      setFilters({
                        category: [],
                        channel: [],
                        duration: 'any',
                        sortBy: 'relevance',
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="mb-4">
              <p className="text-slate-400">
                Found <span className="text-white font-semibold">{filteredContent.length}</span> results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map(item => (
                <Card
                  key={item.id}
                  className="bg-slate-800 border-slate-700 hover:border-purple-500 transition cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="text-4xl">{item.thumbnail}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                        <p className="text-slate-400 text-sm mb-2">{item.channel}</p>
                        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{item.description}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(item.duration)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.plays.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {item.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No content found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
