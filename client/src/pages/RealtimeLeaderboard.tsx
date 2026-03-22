import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function RealtimeLeaderboard() {
  const [activeTab, setActiveTab] = useState('donors');

  const topDonorsQuery = trpc.finalFeatures.leaderboard.getTopDonors.useQuery({ limit: 10 });
  const topChannelsQuery = trpc.finalFeatures.leaderboard.getTopChannels.useQuery({ limit: 10 });
  const trendingEpisodesQuery = trpc.finalFeatures.leaderboard.getTrendingEpisodes.useQuery({ limit: 10 });
  const statisticsQuery = trpc.finalFeatures.leaderboard.getStatistics.useQuery();

  const getTrendBadge = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <Badge className="bg-green-100 text-green-800">↑ Up</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">↓ Down</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">→ Stable</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Real-Time Leaderboard</h1>
        <p className="text-gray-600 mt-2">Live rankings of top donors, channels, and episodes</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Donor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{statisticsQuery.data?.topDonor?.name || 'N/A'}</div>
            <p className="text-xs text-gray-600 mt-1">
              ${statisticsQuery.data?.topDonor?.totalDonations || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{statisticsQuery.data?.topChannel?.name || 'N/A'}</div>
            <p className="text-xs text-gray-600 mt-1">
              {statisticsQuery.data?.topChannel?.currentListeners || 0} listeners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trending Episode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{statisticsQuery.data?.topEpisode?.name || 'N/A'}</div>
            <p className="text-xs text-gray-600 mt-1">
              {statisticsQuery.data?.topEpisode?.plays || 0} plays
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
          <TabsTrigger value="channels">Top Channels</TabsTrigger>
          <TabsTrigger value="episodes">Trending Episodes</TabsTrigger>
        </TabsList>

        {/* Top Donors */}
        <TabsContent value="donors">
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Most generous supporters of Rockin Rockin Boogie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDonorsQuery.data?.map((donor, index) => (
                  <div key={donor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                      <div>
                        <div className="font-semibold">{donor.name}</div>
                        <div className="text-sm text-gray-600">
                          {donor.donationCount} donations • Avg: ${(donor.averageDonation || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">${donor.totalDonations}</div>
                        {getTrendBadge(donor.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Channels */}
        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Top Channels</CardTitle>
              <CardDescription>Most listened channels on Rockin Rockin Boogie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topChannelsQuery.data?.map((channel, index) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                      <div>
                        <div className="font-semibold">{channel.name}</div>
                        <div className="text-sm text-gray-600">
                          Total: {channel.totalListeners} • Avg Listen: {(channel.averageListenTime / 60).toFixed(1)}m
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">{channel.currentListeners}</div>
                        <div className="text-xs text-gray-600">listening now</div>
                        {getTrendBadge(channel.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Episodes */}
        <TabsContent value="episodes">
          <Card>
            <CardHeader>
              <CardTitle>Trending Episodes</CardTitle>
              <CardDescription>Most played episodes this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingEpisodesQuery.data?.map((episode, index) => (
                  <div key={episode.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                      <div>
                        <div className="font-semibold">{episode.name}</div>
                        <div className="text-sm text-gray-600">
                          {episode.podcast} • Avg Play: {(episode.averagePlayTime / 60).toFixed(1)}m
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg">{episode.plays}</div>
                        <div className="text-xs text-gray-600">plays</div>
                        {getTrendBadge(episode.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
