'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Download,
  Trash2,
  Search,
  Volume2,
  BarChart3,
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: number;
  listeners: number;
  quality: 'HD' | 'HQ' | 'Standard';
  audioUrl: string;
  size: string;
}

const SAMPLE_RECORDINGS: Recording[] = [
  {
    id: '1',
    title: 'Legendary Night - Full Performance',
    date: new Date('2026-03-24'),
    duration: 3600,
    listeners: 2847,
    quality: 'HD',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    size: '285 MB',
  },
  {
    id: '2',
    title: 'Acoustic Session - Solfeggio Frequencies',
    date: new Date('2026-03-23'),
    duration: 1800,
    listeners: 1523,
    quality: 'HQ',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    size: '142 MB',
  },
  {
    id: '3',
    title: 'Live Band Jam - 432Hz Tuning',
    date: new Date('2026-03-22'),
    duration: 2400,
    listeners: 3201,
    quality: 'HD',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    size: '190 MB',
  },
  {
    id: '4',
    title: 'Studio Mastering Session',
    date: new Date('2026-03-21'),
    duration: 900,
    listeners: 856,
    quality: 'Standard',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    size: '71 MB',
  },
];

export function PerformanceRecordingArchiveFunctional() {
  const [recordings, setRecordings] = useState<Recording[]>(SAMPLE_RECORDINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredRecordings = recordings.filter(
    (rec) =>
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.date.toLocaleDateString().includes(searchTerm)
  );

  const handlePlay = (recording: Recording) => {
    if (playingId === recording.id) {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    } else {
      setPlayingId(recording.id);
      if (audioRef.current) {
        audioRef.current.src = recording.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const handleDownload = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.audioUrl;
    link.download = `${recording.title}.mp3`;
    link.click();
  };

  const handleDelete = (id: string) => {
    setRecordings(recordings.filter((r) => r.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recordings by title or date..."
            className="pl-10 bg-slate-700/40 border-slate-600/30 text-white placeholder:text-slate-500"
          />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Filter
        </Button>
      </div>

      {/* Recordings List */}
      <div className="space-y-3">
        {filteredRecordings.length > 0 ? (
          filteredRecordings.map((recording) => (
            <Card
              key={recording.id}
              className="bg-slate-700/40 border-slate-600/30 p-4 hover:bg-slate-700/60 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Play Button & Info */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <Button
                    onClick={() => handlePlay(recording)}
                    size="icon"
                    className={`flex-shrink-0 ${
                      playingId === recording.id
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {playingId === recording.id && audioRef.current && !audioRef.current.paused ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{recording.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {recording.date.toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(recording.duration)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          recording.quality === 'HD'
                            ? 'bg-green-500/20 text-green-400'
                            : recording.quality === 'HQ'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {recording.quality}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Volume2 className="w-4 h-4" />
                      <span>{recording.listeners.toLocaleString()} listeners</span>
                    </div>
                    <div className="text-slate-400">{recording.size}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(recording)}
                      size="sm"
                      variant="outline"
                      className="text-slate-400 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleDelete(recording.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-700/40 border-slate-600/30 p-8 text-center">
            <p className="text-slate-400">No recordings found. Start recording your first performance!</p>
          </Card>
        )}
      </div>

      {/* Stats Summary */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{recordings.length}</p>
            <p className="text-sm text-slate-400">Total Recordings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {recordings.reduce((sum, r) => sum + r.listeners, 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">Total Listeners</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {formatDuration(recordings.reduce((sum, r) => sum + r.duration, 0))}
            </p>
            <p className="text-sm text-slate-400">Total Duration</p>
          </div>
        </div>
      </Card>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />
    </div>
  );
}
