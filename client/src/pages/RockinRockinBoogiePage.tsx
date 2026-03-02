import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Play, Pause, SkipForward, Volume2, Radio, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  plays: number;
  uploaded: number;
}

interface Channel {
  id: string;
  name: string;
  genre: string;
  listeners: number;
  tracks: number;
}

export default function RockinRockinBoogiePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Electric Dreams', artist: 'The Boogie Band', duration: 240, plays: 1250, uploaded: Date.now() - 86400000 },
    { id: '2', title: 'Rockin All Night', artist: 'Night Riders', duration: 180, plays: 890, uploaded: Date.now() - 172800000 },
    { id: '3', title: 'Boogie Fever', artist: 'Groove Masters', duration: 210, plays: 650, uploaded: Date.now() - 259200000 },
    { id: '4', title: 'Dance Revolution', artist: 'Synth Wave', duration: 195, plays: 420, uploaded: Date.now() - 345600000 },
  ]);
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'Main Stage', genre: 'Rock', listeners: 1250, tracks: 4 },
    { id: '2', name: 'Jazz Lounge', genre: 'Jazz', listeners: 450, tracks: 2 },
    { id: '3', name: 'Electronic Vibes', genre: 'Electronic', listeners: 890, tracks: 3 },
  ]);
  const [volume, setVolume] = useState(70);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');

  const handlePlayPause = () => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (currentTrack && tracks.length > 0) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrack(tracks[nextIndex]);
      setIsPlaying(true);
    }
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
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
              <p className="text-purple-200">Live Music Streaming Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 rounded-full px-4 py-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-bold">LIVE</span>
          </div>
        </div>

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
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
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-700/30 rounded-lg p-6 text-center">
                    <Music className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
                    <p className="text-purple-200">No track selected. Choose a track to start playing.</p>
                  </div>
                )}

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-6">
                  <Button
                    onClick={handlePlayPause}
                    className="bg-purple-600 hover:bg-purple-500 rounded-full w-16 h-16 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
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

            {/* Up Next */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Up Next</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tracks.map(track => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm opacity-75 truncate">{track.artist}</p>
                      </div>
                      <span className="text-sm ml-2 opacity-75">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tracks Tab */}
          <TabsContent value="tracks" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Add New Track</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Track title..."
                  value={newTrackTitle}
                  onChange={e => setNewTrackTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  placeholder="Artist name..."
                  value={newTrackArtist}
                  onChange={e => setNewTrackArtist(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  onClick={addTrack}
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Track
                </Button>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">All Tracks ({tracks.length})</h3>
              <div className="space-y-2">
                {tracks.map(track => (
                  <div key={track.id} className="bg-slate-700 rounded p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{track.title}</p>
                      <p className="text-sm text-slate-400">{track.artist} • {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</p>
                      <p className="text-xs text-slate-500 mt-1">{track.plays.toLocaleString()} plays</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTrack(track.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channels.map(channel => (
                <Card key={channel.id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">{channel.name}</h4>
                        <p className="text-sm text-slate-400">{channel.genre}</p>
                      </div>
                      <Radio className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{channel.listeners.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Listeners</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{channel.tracks}</p>
                        <p className="text-xs text-slate-400">Tracks</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700 p-6">
                <p className="text-slate-400 text-sm">Total Plays</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{tracks.reduce((sum, t) => sum + t.plays, 0).toLocaleString()}</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <p className="text-slate-400 text-sm">Total Tracks</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{tracks.length}</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <p className="text-slate-400 text-sm">Active Channels</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{channels.length}</p>
              </Card>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <p className="text-slate-400 text-sm">Total Listeners</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{channels.reduce((sum, c) => sum + c.listeners, 0).toLocaleString()}</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
