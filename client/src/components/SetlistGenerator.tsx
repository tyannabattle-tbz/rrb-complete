'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Music, Sparkles, TrendingUp, Clock, Users, 
  GripVertical, Plus, Trash2, Play, Zap, Target 
} from 'lucide-react';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  mood: string;
  engagementScore: number;
  tempo: number;
}

interface Setlist {
  id: string;
  name: string;
  occasion: string;
  songs: Song[];
  totalDuration: number;
  estimatedEngagement: number;
  createdAt: Date;
}

export function SetlistGenerator() {
  const [setlists, setSetlists] = useState<Setlist[]>([
    {
      id: '1',
      name: 'Soul Session - March 2026',
      occasion: 'Live Performance',
      songs: [
        { id: '1', title: 'Rise Up', artist: 'Chris Battle Sr', duration: 240, genre: 'Soul', mood: 'Uplifting', engagementScore: 0.95, tempo: 120 },
        { id: '2', title: 'Healing Frequencies', artist: 'Family', duration: 180, genre: 'Ambient', mood: 'Peaceful', engagementScore: 0.88, tempo: 90 },
        { id: '3', title: 'Gospel Celebration', artist: 'Chris Battle Sr', duration: 200, genre: 'Gospel', mood: 'Joyful', engagementScore: 0.92, tempo: 110 },
      ],
      totalDuration: 620,
      estimatedEngagement: 0.92,
      createdAt: new Date('2026-03-20'),
    },
  ]);

  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(setlists[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');

  const availableSongs: Song[] = [
    { id: 'a1', title: 'Rise Up', artist: 'Chris Battle Sr', duration: 240, genre: 'Soul', mood: 'Uplifting', engagementScore: 0.95, tempo: 120 },
    { id: 'a2', title: 'Healing Frequencies', artist: 'Family', duration: 180, genre: 'Ambient', mood: 'Peaceful', engagementScore: 0.88, tempo: 90 },
    { id: 'a3', title: 'Gospel Celebration', artist: 'Chris Battle Sr', duration: 200, genre: 'Gospel', mood: 'Joyful', engagementScore: 0.92, tempo: 110 },
    { id: 'a4', title: 'Soulful Journey', artist: 'C.J. Battle', duration: 220, genre: 'R&B', mood: 'Romantic', engagementScore: 0.87, tempo: 100 },
    { id: 'a5', title: 'Frequency Flow', artist: 'AP/Amandes', duration: 190, genre: 'Electronic', mood: 'Energetic', engagementScore: 0.90, tempo: 130 },
  ];

  const occasions = ['Live Performance', 'Studio Session', 'Healing Event', 'Family Gathering', 'Charity Event'];

  const generateOptimalSetlist = async () => {
    setIsGenerating(true);
    
    // Simulate ML optimization
    await new Promise(resolve => setTimeout(resolve, 2000));

    const optimized: Song[] = availableSongs
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 4);

    const newSetlist: Setlist = {
      id: Date.now().toString(),
      name: `AI Generated Setlist - ${new Date().toLocaleDateString()}`,
      occasion: 'Live Performance',
      songs: optimized,
      totalDuration: optimized.reduce((sum, s) => sum + s.duration, 0),
      estimatedEngagement: optimized.reduce((sum, s) => sum + s.engagementScore, 0) / optimized.length,
      createdAt: new Date(),
    };

    setSetlists([...setlists, newSetlist]);
    setSelectedSetlist(newSetlist);
    setIsGenerating(false);
    toast.success('Optimal setlist generated!');
  };

  const addSongToSetlist = (song: Song) => {
    if (!selectedSetlist) return;

    const updatedSetlist = {
      ...selectedSetlist,
      songs: [...selectedSetlist.songs, song],
      totalDuration: selectedSetlist.totalDuration + song.duration,
      estimatedEngagement: (selectedSetlist.songs.reduce((sum, s) => sum + s.engagementScore, 0) + song.engagementScore) / (selectedSetlist.songs.length + 1),
    };

    setSetlists(setlists.map(s => s.id === selectedSetlist.id ? updatedSetlist : s));
    setSelectedSetlist(updatedSetlist);
    toast.success(`Added "${song.title}" to setlist`);
  };

  const removeSongFromSetlist = (songId: string) => {
    if (!selectedSetlist) return;

    const song = selectedSetlist.songs.find(s => s.id === songId);
    if (!song) return;

    const updatedSetlist = {
      ...selectedSetlist,
      songs: selectedSetlist.songs.filter(s => s.id !== songId),
      totalDuration: selectedSetlist.totalDuration - song.duration,
      estimatedEngagement: selectedSetlist.songs.length > 1
        ? selectedSetlist.songs
            .filter(s => s.id !== songId)
            .reduce((sum, s) => sum + s.engagementScore, 0) / (selectedSetlist.songs.length - 1)
        : 0,
    };

    setSetlists(setlists.map(s => s.id === selectedSetlist.id ? updatedSetlist : s));
    setSelectedSetlist(updatedSetlist);
    toast.success('Song removed from setlist');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Music className="w-8 h-8 text-green-400" />
          AI-Powered Setlist Generator
        </h2>
        <p className="text-slate-400">Optimize your performance with ML-based song sequencing</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Setlist List */}
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-sm text-white">Your Setlists</CardTitle>
            <CardDescription>{setlists.length} setlists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {setlists.map(setlist => (
              <div
                key={setlist.id}
                onClick={() => setSelectedSetlist(setlist)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedSetlist?.id === setlist.id
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/30'
                }`}
              >
                <p className="text-sm font-semibold text-white truncate">{setlist.name}</p>
                <p className="text-xs text-slate-400">{setlist.songs.length} songs</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">{(setlist.estimatedEngagement * 100).toFixed(0)}% engagement</span>
                </div>
              </div>
            ))}
            <Button
              onClick={generateOptimalSetlist}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
            >
              {isGenerating ? 'Generating...' : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Setlist
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Setlist */}
        {selectedSetlist && (
          <Card className="bg-slate-800/40 border-slate-700/30 col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{selectedSetlist.name}</CardTitle>
                  <CardDescription>{selectedSetlist.occasion}</CardDescription>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Setlist Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/30 p-2 rounded">
                  <p className="text-xs text-slate-400">Total Duration</p>
                  <p className="text-lg font-bold text-white">{formatDuration(selectedSetlist.totalDuration)}</p>
                </div>
                <div className="bg-slate-700/30 p-2 rounded">
                  <p className="text-xs text-slate-400">Songs</p>
                  <p className="text-lg font-bold text-white">{selectedSetlist.songs.length}</p>
                </div>
                <div className="bg-slate-700/30 p-2 rounded">
                  <p className="text-xs text-slate-400">Est. Engagement</p>
                  <p className="text-lg font-bold text-green-400">{(selectedSetlist.estimatedEngagement * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Songs List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedSetlist.songs.map((song, idx) => (
                  <div key={song.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded">
                    <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-400 w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-400">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{formatDuration(song.duration)}</Badge>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{(song.engagementScore * 100).toFixed(0)}%</span>
                      <Button
                        onClick={() => removeSongFromSetlist(song.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Songs */}
              <div className="border-t border-slate-700/30 pt-4">
                <p className="text-sm font-semibold text-white mb-2">Available Songs</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableSongs
                    .filter(s => !selectedSetlist.songs.find(ss => ss.id === s.id))
                    .map(song => (
                      <div key={song.id} className="flex items-center justify-between p-2 bg-slate-700/20 rounded text-xs">
                        <div>
                          <p className="text-white">{song.title}</p>
                          <p className="text-slate-400">{song.artist}</p>
                        </div>
                        <Button
                          onClick={() => addSongToSetlist(song)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>✓ Optimal pacing detected - Mix of uplifting and peaceful songs</p>
          <p>✓ Engagement score: 92% - High audience connection expected</p>
          <p>✓ Duration: 10m 20s - Perfect for your time slot</p>
          <p>✓ Genre variety: 3 genres - Keeps audience engaged</p>
        </CardContent>
      </Card>
    </div>
  );
}
