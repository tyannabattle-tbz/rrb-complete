import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, Trash2, Zap, Radio } from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  artist: string;
  status: 'draft' | 'published' | 'archived';
  plays: number;
}

export default function RockinBoogieManager() {
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', title: 'Electric Dreams', artist: 'Rockin Rockin', status: 'published', plays: 1250 },
    { id: '2', title: 'Boogie Nights', artist: 'DJ Rockin', status: 'published', plays: 890 },
  ]);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleAddTrack = () => {
    if (!title || !artist) {
      toast.error('Fill in all fields');
      return;
    }
    setTracks([...tracks, { id: `t-${Date.now()}`, title, artist, status: 'draft', plays: 0 }]);
    setTitle('');
    setArtist('');
    toast.success('Track added');
  };

  const handlePublish = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, status: 'published' as const } : t));
    toast.success('Published');
  };

  const handleDelete = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Rockin Rockin Boogie</h1>
          </div>
          <p className="text-slate-400">Content Manager & Music Streaming</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total Tracks</p>
              <p className="text-3xl font-bold text-white">{tracks.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Active Channels</p>
              <p className="text-3xl font-bold text-white">2</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total Listeners</p>
              <p className="text-3xl font-bold text-white">3,230</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total Plays</p>
              <p className="text-3xl font-bold text-white">{tracks.reduce((s, t) => s + t.plays, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tracks">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Add New Track</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                  <Input placeholder="Artist" value={artist} onChange={e => setArtist(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                  <Button onClick={handleAddTrack} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {tracks.map(track => (
                <Card key={track.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Music className="w-4 h-4 text-blue-400" />
                          <h3 className="font-semibold text-white">{track.title}</h3>
                          <Badge className={track.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {track.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{track.artist}</p>
                        <p className="text-xs text-slate-500 mt-1">Plays: {track.plays.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {track.status === 'draft' && (
                          <Button size="sm" onClick={() => handlePublish(track.id)} className="bg-green-600 hover:bg-green-700">
                            <Zap className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDelete(track.id)} className="border-red-600/50 text-red-400">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Main Channel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-xs text-slate-400">Listeners</p>
                      <p className="text-lg font-bold text-white">2,340</p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-xs text-slate-400">Tracks</p>
                      <p className="text-lg font-bold text-white">156</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Radio className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Live Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-xs text-slate-400">Listeners</p>
                      <p className="text-lg font-bold text-white">890</p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-xs text-slate-400">Tracks</p>
                      <p className="text-lg font-bold text-white">45</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Radio className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded p-4">
                    <p className="text-sm text-slate-400">Peak Listeners (24h)</p>
                    <p className="text-2xl font-bold text-blue-400">3,240</p>
                    <p className="text-xs text-slate-400 mt-1">+12% from yesterday</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-4">
                    <p className="text-sm text-slate-400">Avg. Session Duration</p>
                    <p className="text-2xl font-bold text-green-400">28m 45s</p>
                    <p className="text-xs text-slate-400 mt-1">+3m from last week</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-4">
                    <p className="text-sm text-slate-400">Total Streams (24h)</p>
                    <p className="text-2xl font-bold text-purple-400">12,540</p>
                    <p className="text-xs text-slate-400 mt-1">+8% from yesterday</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
