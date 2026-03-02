import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Radio, Plus, Trash2, Edit2, TrendingUp, Heart, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  plays: number;
  uploaded: number;
  frequency?: number;
}

interface Channel {
  id: string;
  name: string;
  genre: string;
  listeners: number;
  tracks: number;
  frequency?: number;
  healingFrequency?: number;
}

export default function RRBMusicStreaming() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Electric Dreams', artist: 'The Boogie Band', duration: 240, plays: 1250, uploaded: Date.now() - 86400000, frequency: 432 },
    { id: '2', title: 'Rockin All Night', artist: 'Night Riders', duration: 180, plays: 890, uploaded: Date.now() - 172800000, frequency: 432 },
    { id: '3', title: 'Boogie Fever', artist: 'Groove Masters', duration: 210, plays: 650, uploaded: Date.now() - 259200000, frequency: 528 },
    { id: '4', title: 'Dance Revolution', artist: 'Synth Wave', duration: 195, plays: 420, uploaded: Date.now() - 345600000, frequency: 432 },
  ]);
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'Main Stage', genre: 'Rock', listeners: 1250, tracks: 4, frequency: 101.5, healingFrequency: 432 },
    { id: '2', name: 'Jazz Lounge', genre: 'Jazz', listeners: 450, tracks: 2, frequency: 102.3, healingFrequency: 528 },
    { id: '3', name: 'Electronic Vibes', genre: 'Electronic', listeners: 890, tracks: 3, frequency: 103.1, healingFrequency: 432 },
    { id: '4', name: 'Healing Frequencies', genre: 'Meditation', listeners: 2100, tracks: 5, frequency: 104.0, healingFrequency: 432 },
  ]);
  const [volume, setVolume] = useState(40);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch radio channels from ecosystem
  const { data: radioChannels } = trpc.ecosystem.radio.getAll.useQuery();

  // Fetch broadcast analytics
  const { data: broadcastMetrics } = trpc.ecosystem.metrics.getLatest.useQuery({ system: 'rrb' });

  // Track listener engagement
  const recordMetrics = trpc.ecosystem.metrics.record.useMutation();

  useEffect(() => {
    // Record metrics on mount
    if (radioChannels) {
      recordMetrics.mutate({
        system: 'rrb',
        activeListeners: channels.reduce((sum, c) => sum + c.listeners, 0),
        totalBroadcasts: tracks.length,
        totalDonations: 0,
        uptime: 99.8,
      });
    }
  }, [radioChannels]);

  const handlePlayPause = () => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast.success('Now playing: ' + (currentTrack?.title || 'Track'));
    }
  };

  const handleNextTrack = () => {
    if (currentTrack && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrack(tracks[nextIndex]);
      setIsPlaying(true);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrack && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      setCurrentTrack(tracks[prevIndex]);
      setIsPlaying(true);
    }
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const selectChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    setCurrentTrack(null);
    setIsPlaying(true);
    toast.success(`Tuned to ${channel.name} (${channel.frequency} FM)`);
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const addTrack = () => {
    if (!newTrackTitle.trim() || !newTrackArtist.trim()) {
      toast.error('Please enter track title and artist');
      return;
    }
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: newTrackTitle,
      artist: newTrackArtist,
      duration: Math.floor(Math.random() * 300) + 120,
      plays: 0,
      uploaded: Date.now(),
      frequency: 432, // Default healing frequency
    };
    setTracks([newTrack, ...tracks]);
    setNewTrackTitle('');
    setNewTrackArtist('');
    toast.success('Track added successfully');
  };

  const deleteTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
    toast.success('Track deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 rounded-lg p-3">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Rockin Rockin Boogie</h1>
              <p className="text-purple-200">Healing Frequencies Music Streaming Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Active Listeners</p>
            <p className="text-2xl font-bold text-white">{channels.reduce((sum, c) => sum + c.listeners, 0).toLocaleString()}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Tracks</p>
            <p className="text-2xl font-bold text-white">{tracks.length}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Radio Channels</p>
            <p className="text-2xl font-bold text-white">{channels.length}</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Default Frequency</p>
            <p className="text-2xl font-bold text-purple-400">432 Hz</p>
          </Card>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
            <TabsTrigger value="player" className="gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Player</span>
            </TabsTrigger>
            <TabsTrigger value="tracks" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tracks</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Channels</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Player Tab */}
          <TabsContent value="player" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-purple-700 p-8">
              <div className="space-y-6">
                {/* Now Playing */}
                {currentTrack ? (
                  <div className="bg-purple-700/30 rounded-lg p-6 space-y-4">
                    <p className="text-purple-200 text-xs uppercase tracking-wide font-semibold">Now Playing</p>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{currentTrack.title}</h2>
                      <p className="text-purple-200 text-lg">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-purple-200">
                      <span>{Math.floor(currentTrack.duration / 60)}:{String(currentTrack.duration % 60).padStart(2, '0')}</span>
                      <span className="text-purple-300 font-semibold">{currentTrack.plays.toLocaleString()} plays</span>
                      <span className="text-purple-300 font-semibold">{currentTrack.frequency} Hz</span>
                    </div>
                  </div>
                ) : currentChannel ? (
                  <div className="bg-purple-700/30 rounded-lg p-6 space-y-4">
                    <p className="text-purple-200 text-xs uppercase tracking-wide font-semibold">Now Tuned To</p>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{currentChannel.name}</h2>
                      <p className="text-purple-200 text-lg">{currentChannel.genre} • {currentChannel.frequency} FM</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-purple-200">
                      <span>{currentChannel.listeners.toLocaleString()} listeners</span>
                      <span className="text-purple-300 font-semibold">{currentChannel.healingFrequency} Hz</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-700/30 rounded-lg p-6 text-center">
                    <Music className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                    <p className="text-purple-200">No track selected. Choose a track or channel to start playing.</p>
                  </div>
                )}

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-6">
                  <Button
                    onClick={handlePreviousTrack}
                    className="bg-purple-700 hover:bg-purple-600 rounded-full w-16 h-16 p-0"
                  >
                    <SkipBack className="w-8 h-8" />
                  </Button>
                  <Button
                    onClick={handlePlayPause}
                    className="bg-purple-600 hover:bg-purple-500 rounded-full w-20 h-20 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10" />
                    ) : (
                      <Play className="w-10 h-10 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={handleNextTrack}
                    className="bg-purple-700 hover:bg-purple-600 rounded-full w-16 h-16 p-0"
                  >
                    <SkipForward className="w-8 h-8" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-4 bg-purple-700/20 rounded-lg p-4">
                  <Volume2 className="w-5 h-5 text-purple-300" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="flex-1 h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-purple-200 w-12 text-right">{volume}%</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tracks Tab */}
          <TabsContent value="tracks" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Add New Track</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Track title"
                  value={newTrackTitle}
                  onChange={e => setNewTrackTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="Artist name"
                  value={newTrackArtist}
                  onChange={e => setNewTrackArtist(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={addTrack} className="bg-purple-600 hover:bg-purple-500">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">All Tracks</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      currentTrack?.id === track.id
                        ? 'bg-purple-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    onClick={() => selectTrack(track)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{track.title}</p>
                        <p className="text-sm text-slate-300">{track.artist} • {track.frequency} Hz</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{track.plays.toLocaleString()} plays</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(track.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            deleteTrack(track.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map(channel => (
                <Card
                  key={channel.id}
                  className={`p-6 cursor-pointer transition border-2 ${
                    currentChannel?.id === channel.id
                      ? 'bg-purple-900 border-purple-500'
                      : 'bg-slate-800 border-slate-700 hover:border-purple-500'
                  }`}
                  onClick={() => selectChannel(channel)}
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{channel.name}</h3>
                      <p className="text-purple-200">{channel.genre}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Frequency</p>
                        <p className="text-white font-semibold">{channel.frequency} FM</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Healing Hz</p>
                        <p className="text-purple-300 font-semibold">{channel.healingFrequency} Hz</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Listeners</p>
                        <p className="text-white font-semibold">{channel.listeners.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Tracks</p>
                        <p className="text-white font-semibold">{channel.tracks}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-500">
                      <Radio className="w-4 h-4 mr-2" />
                      Tune In
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Favorite Tracks</h3>
              {favorites.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No favorites yet. Click the heart icon to add tracks to your favorites.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tracks.filter(t => favorites.includes(t.id)).map(track => (
                    <div
                      key={track.id}
                      className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 cursor-pointer"
                      onClick={() => selectTrack(track)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{track.title}</p>
                          <p className="text-sm text-slate-300">{track.artist}</p>
                        </div>
                        <Heart className="fill-red-500 text-red-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Plays</span>
                    <span className="text-white font-semibold">{tracks.reduce((sum, t) => sum + t.plays, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Listeners</span>
                    <span className="text-white font-semibold">{channels.reduce((sum, c) => sum + c.listeners, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Listeners/Channel</span>
                    <span className="text-white font-semibold">{Math.round(channels.reduce((sum, c) => sum + c.listeners, 0) / channels.length).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top Tracks</h3>
                <div className="space-y-2">
                  {tracks.sort((a, b) => b.plays - a.plays).slice(0, 5).map((track, idx) => (
                    <div key={track.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{idx + 1}. {track.title}</span>
                      <span className="text-purple-300 font-semibold">{track.plays.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
