'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Play,
  Save,
  Sparkles,
  Music,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  engagementScore: number;
  frequency: number;
}

interface Setlist {
  id: string;
  name: string;
  songs: Song[];
  totalDuration: number;
  engagementScore: number;
}

const AVAILABLE_SONGS: Song[] = [
  {
    id: '1',
    title: 'Healing Frequencies',
    artist: 'RRB',
    duration: 240,
    genre: 'Ambient',
    engagementScore: 92,
    frequency: 432,
  },
  {
    id: '2',
    title: 'Solfeggio Dreams',
    artist: 'RRB',
    duration: 300,
    genre: 'Electronic',
    engagementScore: 88,
    frequency: 528,
  },
  {
    id: '3',
    title: 'Soul Elevation',
    artist: 'RRB',
    duration: 280,
    genre: 'Soul',
    engagementScore: 95,
    frequency: 741,
  },
  {
    id: '4',
    title: 'Cosmic Vibrations',
    artist: 'RRB',
    duration: 320,
    genre: 'Ambient',
    engagementScore: 85,
    frequency: 963,
  },
  {
    id: '5',
    title: 'Love Frequency',
    artist: 'RRB',
    duration: 260,
    genre: 'R&B',
    engagementScore: 91,
    frequency: 639,
  },
  {
    id: '6',
    title: 'Divine Harmony',
    artist: 'RRB',
    duration: 290,
    genre: 'Gospel',
    engagementScore: 93,
    frequency: 852,
  },
];

export function SetlistGeneratorFunctional() {
  const [setlists, setSetlists] = useState<Setlist[]>([
    {
      id: '1',
      name: 'Evening Vibes',
      songs: [AVAILABLE_SONGS[0], AVAILABLE_SONGS[1]],
      totalDuration: 540,
      engagementScore: 90,
    },
  ]);

  const [newSetlistName, setNewSetlistName] = useState('');
  const [selectedSetlistId, setSelectedSetlistId] = useState<string | null>(setlists[0]?.id || null);

  const selectedSetlist = setlists.find((s) => s.id === selectedSetlistId);

  const generateOptimalSetlist = () => {
    const sortedSongs = [...AVAILABLE_SONGS].sort(
      (a, b) => b.engagementScore - a.engagementScore
    );

    const newSetlist: Setlist = {
      id: Date.now().toString(),
      name: `AI Generated Setlist ${new Date().toLocaleDateString()}`,
      songs: sortedSongs.slice(0, 4),
      totalDuration: sortedSongs.slice(0, 4).reduce((sum, s) => sum + s.duration, 0),
      engagementScore:
        sortedSongs.slice(0, 4).reduce((sum, s) => sum + s.engagementScore, 0) / 4,
    };

    setSetlists([...setlists, newSetlist]);
    setSelectedSetlistId(newSetlist.id);
  };

  const addSongToSetlist = (song: Song) => {
    if (!selectedSetlist) return;

    const updatedSetlists = setlists.map((s) => {
      if (s.id === selectedSetlistId) {
        const newSongs = [...s.songs, song];
        return {
          ...s,
          songs: newSongs,
          totalDuration: newSongs.reduce((sum, song) => sum + song.duration, 0),
          engagementScore:
            newSongs.reduce((sum, song) => sum + song.engagementScore, 0) / newSongs.length,
        };
      }
      return s;
    });

    setSetlists(updatedSetlists);
  };

  const removeSongFromSetlist = (songId: string) => {
    if (!selectedSetlist) return;

    const updatedSetlists = setlists.map((s) => {
      if (s.id === selectedSetlistId) {
        const newSongs = s.songs.filter((song) => song.id !== songId);
        return {
          ...s,
          songs: newSongs,
          totalDuration: newSongs.reduce((sum, song) => sum + song.duration, 0),
          engagementScore:
            newSongs.length > 0
              ? newSongs.reduce((sum, song) => sum + song.engagementScore, 0) / newSongs.length
              : 0,
        };
      }
      return s;
    });

    setSetlists(updatedSetlists);
  };

  const createNewSetlist = () => {
    if (newSetlistName.trim()) {
      const newSetlist: Setlist = {
        id: Date.now().toString(),
        name: newSetlistName,
        songs: [],
        totalDuration: 0,
        engagementScore: 0,
      };

      setSetlists([...setlists, newSetlist]);
      setSelectedSetlistId(newSetlist.id);
      setNewSetlistName('');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Create New Setlist */}
      <Card className="bg-slate-700/40 border-slate-600/30 p-4">
        <div className="flex gap-2">
          <Input
            value={newSetlistName}
            onChange={(e) => setNewSetlistName(e.target.value)}
            placeholder="New setlist name..."
            className="bg-slate-600/40 border-slate-600/30 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={createNewSetlist}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
          <Button
            onClick={generateOptimalSetlist}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI Generate
          </Button>
        </div>
      </Card>

      {/* Setlist Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {setlists.map((setlist) => (
          <Button
            key={setlist.id}
            onClick={() => setSelectedSetlistId(setlist.id)}
            variant={selectedSetlistId === setlist.id ? 'default' : 'outline'}
            className={
              selectedSetlistId === setlist.id
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'border-slate-600/30'
            }
          >
            {setlist.name}
          </Button>
        ))}
      </div>

      {selectedSetlist && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Setlist */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-700/40 border-slate-600/30 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                {selectedSetlist.name}
              </h3>

              {selectedSetlist.songs.length > 0 ? (
                <div className="space-y-2">
                  {selectedSetlist.songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between bg-slate-600/40 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-400 w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{song.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {song.genre}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatDuration(song.duration)}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400">
                              {song.engagementScore}% engagement
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeSongFromSetlist(song.id)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No songs in this setlist yet</p>
              )}
            </Card>
          </div>

          {/* Setlist Stats & Available Songs */}
          <div className="space-y-4">
            {/* Stats */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Total Duration</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    {formatDuration(selectedSetlist.totalDuration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Engagement Score</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    {Math.round(selectedSetlist.engagementScore)}%
                  </p>
                </div>
              </div>
            </Card>

            {/* Available Songs */}
            <Card className="bg-slate-700/40 border-slate-600/30 p-4">
              <h4 className="font-semibold text-white mb-3">Add Songs</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {AVAILABLE_SONGS.filter(
                  (song) => !selectedSetlist.songs.find((s) => s.id === song.id)
                ).map((song) => (
                  <Button
                    key={song.id}
                    onClick={() => addSongToSetlist(song)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-2 border-slate-600/30 hover:bg-slate-600/40"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-400">{formatDuration(song.duration)}</p>
                    </div>
                    <Plus className="w-4 h-4 flex-shrink-0 ml-2" />
                  </Button>
                ))}
              </div>
            </Card>

            {/* Save Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Save Setlist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
