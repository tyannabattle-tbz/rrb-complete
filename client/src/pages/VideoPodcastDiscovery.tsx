/**
 * Video Podcast Discovery Page
 * Browse, search, and discover video content
 * A Canryn Production
 */
import { useState } from 'react';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';

export function VideoPodcastDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const trendingQuery = trpc.videoPodcast.getTrending.useQuery({ limit: 12 });
  const searchQuery_trpc = trpc.videoPodcast.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const videos = searchQuery.length > 0 ? searchQuery_trpc.data || [] : trendingQuery.data || [];

  const categories = ['All', 'Music', 'Podcast', 'Interview', 'News', 'Entertainment'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎬 Video Podcasts</h1>
          <p className="text-blue-100">Discover, watch, and engage with RRB content</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Search Bar */}
        <Card className="p-4 bg-white shadow-lg">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-gray-200"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Search</Button>
          </div>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat.toLowerCase()}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Videos Grid */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            {searchQuery.length === 0 ? (
              <>
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
              </>
            )}
          </div>

          {videos.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <p className="text-gray-500 text-lg">
                {searchQuery.length > 0 ? 'No videos found. Try a different search.' : 'Loading videos...'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video: any) => (
                <Link key={video.id} href={`/videos/${video.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">▶️</div>
                        <p className="text-white text-sm">{Math.floor(video.duration / 60)}m</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>

                      <div className="flex gap-4 text-sm text-gray-500 pt-2">
                        <span>👁️ {video.views || 0}</span>
                        <span>❤️ {video.likes || 0}</span>
                        <span>💬 {video.comments || 0}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {video.tags?.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Section */}
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">✨ Featured Collection</h3>
          <p className="text-gray-600 mb-4">
            Explore curated playlists and exclusive content from RRB creators.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Browse Playlists
          </Button>
        </Card>
      </div>
    </div>
  );
}
