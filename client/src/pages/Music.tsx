import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Music as MusicIcon, Radio, TrendingUp } from 'lucide-react';

export default function Music() {
  const [, setLocation] = useLocation();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [filterGenre, setFilterGenre] = useState<string>('all');

  // Fetch all channels
  const { data: channels, isLoading: channelsLoading } = trpc.spotify.getAllChannels.useQuery();
  const { data: stats } = trpc.spotify.getSystemStats.useQuery();
  const { data: trending } = trpc.spotify.getTrendingChannels.useQuery();

  // Get channel details
  const { data: channelDetails } = trpc.spotify.getChannelDetails.useQuery(
    { channelId: selectedChannel || '' },
    { enabled: !!selectedChannel }
  );

  const genres = ['all', 'healing', 'meditation', 'uplifting', 'energizing', 'grounding'];

  const filteredChannels = channels?.filter((ch: any) =>
    filterGenre === 'all' ? true : ch.genre?.toLowerCase().includes(filterGenre)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">RRB Radio</h1>
                <p className="text-sm text-pink-300">41 Solfeggio Frequency Channels</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="border-pink-500 text-pink-400"
            >
              ← Back Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-pink-400">{stats.totalListeners}</div>
                <p className="text-sm text-slate-400 mt-2">Total Listeners</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-400">{stats.activeChannels}</div>
                <p className="text-sm text-slate-400 mt-2">Active Channels</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-400">{stats.averageListenersPerChannel}</div>
                <p className="text-sm text-slate-400 mt-2">Avg per Channel</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-400">24/7</div>
                <p className="text-sm text-slate-400 mt-2">Broadcasting</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Channel List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MusicIcon className="w-5 h-5 text-pink-500" />
                  All Channels
                </CardTitle>
                <CardDescription>Select a channel to listen</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Genre Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      onClick={() => setFilterGenre(genre)}
                      variant={filterGenre === genre ? 'default' : 'outline'}
                      size="sm"
                      className={filterGenre === genre ? 'bg-pink-600 hover:bg-pink-700' : 'border-pink-500/30'}
                    >
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Channels Grid */}
                {channelsLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading channels...</div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredChannels.map((channel: any) => (
                      <div
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedChannel === channel.id
                            ? 'bg-pink-600/30 border border-pink-500'
                            : 'bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{channel.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {channel.frequency}Hz • {channel.listeners} listeners
                            </p>
                            <p className="text-xs text-pink-300 mt-1">{channel.description}</p>
                          </div>
                          <Badge variant="outline" className="border-pink-500 text-pink-400 ml-2">
                            {channel.frequency}Hz
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player */}
          <div>
            <Card className="bg-slate-800/50 border-pink-500/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white">Now Playing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedChannel && channelDetails ? (
                  <>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Radio className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{channelDetails.name}</h3>
                      <p className="text-sm text-pink-300 mt-1">{channelDetails.frequency}Hz</p>
                      <p className="text-xs text-slate-400 mt-2">{channelDetails.description}</p>
                    </div>

                    {/* Player Controls */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
                        size="lg"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-slate-400 text-center">{Math.round(volume * 100)}%</p>
                    </div>

                    {/* Channel Stats */}
                    <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Listeners:</span>
                        <span className="text-pink-300 font-semibold">{channelDetails.listeners}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Genre:</span>
                        <span className="text-pink-300 font-semibold">{channelDetails.genre}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Bitrate:</span>
                        <span className="text-pink-300 font-semibold">{channelDetails.bitrate}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Radio className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Select a channel to start listening</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trending Channels */}
        {trending && trending.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              Trending Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trending.map((channel: any) => (
                <Card
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className="bg-slate-800/50 border-pink-500/20 cursor-pointer hover:border-pink-500/50 transition-all"
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-white">{channel.name}</h3>
                    <p className="text-sm text-pink-300 mt-2">{channel.frequency}Hz</p>
                    <p className="text-xs text-slate-400 mt-2">{channel.listeners} listeners</p>
                    <Button
                      onClick={() => setIsPlaying(true)}
                      className="w-full mt-4 bg-pink-600 hover:bg-pink-700"
                      size="sm"
                    >
                      <Play className="w-3 h-3 mr-2" />
                      Listen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
