import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const platformIcons: Record<string, { name: string; icon: string; color: string }> = {
  spotify: { name: 'Spotify', icon: '🎵', color: 'bg-green-500' },
  apple: { name: 'Apple Podcasts', icon: '🎙️', color: 'bg-gray-800' },
  youtube: { name: 'YouTube', icon: '📺', color: 'bg-red-600' },
  tunein: { name: 'TuneIn', icon: '📻', color: 'bg-blue-600' },
  amazon: { name: 'Amazon Music', icon: '🎧', color: 'bg-orange-500' },
  iheartradio: { name: 'iHeartRadio', icon: '❤️', color: 'bg-red-500' },
  podbean: { name: 'Podbean', icon: '🎬', color: 'bg-purple-600' },
  buzzsprout: { name: 'Buzzsprout', icon: '🚀', color: 'bg-yellow-500' },
  transistor: { name: 'Transistor', icon: '📡', color: 'bg-indigo-600' },
  anchor: { name: 'Anchor', icon: '⚓', color: 'bg-blue-400' },
};

export function PodcastFeeds() {
  const [selectedFeed, setSelectedFeed] = useState<string>('rrb-legacy-restored');

  const { data: feeds, isLoading: feedsLoading } = trpc.podcastFeeds.getAllFeeds.useQuery();
  const { data: distributions, isLoading: distLoading } = trpc.podcastFeeds.getPlatformDistribution.useQuery(
    { feedId: selectedFeed },
    { enabled: !!selectedFeed }
  );
  const { data: globalStats, isLoading: statsLoading } = trpc.podcastFeeds.getGlobalStats.useQuery();

  if (feedsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ Podcast Feeds & Distribution</h1>
          <p className="text-gray-300">RRB reaches listeners everywhere across 10+ platforms</p>
        </div>

        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Listeners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {(globalStats.totalListeners / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-gray-400 mt-1">across all platforms</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Feeds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{globalStats.totalFeeds}</div>
                <p className="text-xs text-gray-400 mt-1">podcast feeds</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{globalStats.totalPlatforms}</div>
                <p className="text-xs text-gray-400 mt-1">distribution channels</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Avg per Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {(globalStats.averageListenersPerFeed / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-gray-400 mt-1">listeners per feed</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="feeds" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="feeds" className="text-gray-300">Podcast Feeds</TabsTrigger>
            <TabsTrigger value="distribution" className="text-gray-300">Distribution</TabsTrigger>
            <TabsTrigger value="platforms" className="text-gray-300">Platform Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="feeds" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feeds?.map(feed => (
                <Card
                  key={feed.id}
                  className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:border-purple-500 ${
                    selectedFeed === feed.id ? 'border-purple-500 ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedFeed(feed.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{feed.title}</CardTitle>
                        <CardDescription className="text-gray-400 mt-1">{feed.author}</CardDescription>
                      </div>
                      <Badge className="ml-2 bg-purple-600">{feed.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4">{feed.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{feed.language.toUpperCase()}</span>
                      <span>{feed.explicit ? '🔞 Explicit' : '✅ Clean'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4 mt-6">
            {distLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {feeds?.find(f => f.id === selectedFeed)?.title} - Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Available on {distributions?.length || 0} platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {distributions?.map(dist => {
                      const platform = platformIcons[dist.platform];
                      return (
                        <div
                          key={dist.platform}
                          className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-purple-500 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{platform?.icon}</span>
                              <div>
                                <p className="font-semibold text-white">{platform?.name}</p>
                                <Badge
                                  className={`${
                                    dist.status === 'live'
                                      ? 'bg-green-600'
                                      : dist.status === 'pending'
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                  } text-xs mt-1`}
                                >
                                  {dist.status.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                              <span>Listeners:</span>
                              <span className="font-semibold">{(dist.listeners! / 1000).toFixed(1)}K</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Rating:</span>
                              <span className="font-semibold text-yellow-400">
                                {'⭐'.repeat(Math.round(dist.rating!))} {dist.rating?.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full mt-4 bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                            onClick={() => window.open(dist.url, '_blank')}
                          >
                            Listen on {platform?.name}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4 mt-6">
            {globalStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(globalStats.platformBreakdown).map(([platform, listeners]) => {
                  const platformInfo = platformIcons[platform];
                  const percentage =
                    globalStats.totalListeners > 0
                      ? ((listeners / globalStats.totalListeners) * 100).toFixed(1)
                      : '0';

                  return (
                    <Card key={platform} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{platformInfo?.icon}</span>
                          <div>
                            <CardTitle className="text-white">{platformInfo?.name}</CardTitle>
                            <CardDescription className="text-gray-400">
                              {(listeners / 1000).toFixed(1)}K listeners
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-300">
                            <span>Market Share</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Listen Everywhere</h2>
          <p className="text-gray-100 mb-6">
            RRB is available on all major podcast and streaming platforms. Subscribe now and never miss an episode.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="bg-white text-purple-600 hover:bg-gray-100">Subscribe on Spotify</Button>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">Subscribe on Apple</Button>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">Subscribe on YouTube</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
