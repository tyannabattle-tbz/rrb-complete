import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function PodcastAndVideoPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from tRPC
  const { data: podcasts = [] } = trpc.podcastsData.getPodcasts.useQuery();
  const { data: videos = [] } = trpc.podcastsData.getVideos.useQuery();

  const filteredPodcasts = podcasts.filter((podcast: any) => {
    const matchesSearch =
      !searchQuery ||
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredVideos = videos.filter((video: any) => {
    const matchesSearch =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcasts & Videos</h1>
          <p className="text-slate-300">Discover and stream your favorite content</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search podcasts and videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="podcasts" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700 mb-6">
            <TabsTrigger
              value="podcasts"
              className="text-slate-300 data-[state=active]:text-white"
            >
              Podcasts ({filteredPodcasts.length})
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="text-slate-300 data-[state=active]:text-white"
            >
              Videos ({filteredVideos.length})
            </TabsTrigger>
          </TabsList>

          {/* Podcasts Tab */}
          <TabsContent value="podcasts" className="space-y-6">
            {filteredPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPodcasts.map((podcast: any) => (
                  <Card
                    key={podcast.id}
                    className="bg-slate-800 border-slate-700 hover:border-purple-500 cursor-pointer transition-all overflow-hidden group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-2 line-clamp-2">
                        {podcast.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {podcast.description}
                      </p>
                      <p className="text-xs text-slate-500 mb-3">
                        by {podcast.artist}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{podcast.episodeCount} episodes</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{podcast.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                <p className="text-slate-400">No podcasts found.</p>
              </Card>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video: any) => (
                  <Card
                    key={video.id}
                    className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-all overflow-hidden group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      <p className="text-xs text-slate-500 mb-3">
                        by {video.artist}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{video.duration} min</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{video.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                <p className="text-slate-400">No videos found.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
