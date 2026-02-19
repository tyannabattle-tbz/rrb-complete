import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Download, Share2, Trash2, Search, Calendar, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: number;
  views: number;
  thumbnail: string;
  channel: string;
  frequency: string;
  transcript?: string;
}

interface BroadcastRecordingArchiveProps {
  onPlayRecording?: (recording: Recording) => void;
}

export function BroadcastRecordingArchive({ onPlayRecording }: BroadcastRecordingArchiveProps) {
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: '1',
      title: 'Healing Frequencies Session - 432 Hz Deep Meditation',
      date: new Date('2026-02-19'),
      duration: 3600,
      views: 1247,
      thumbnail: '🎙️',
      channel: 'RRB Main',
      frequency: '432 Hz',
      transcript: 'Welcome to our healing frequencies session...',
    },
    {
      id: '2',
      title: 'Sean\'s Music World - Live Performance',
      date: new Date('2026-02-18'),
      duration: 5400,
      views: 892,
      thumbnail: '🎵',
      channel: 'Sean\'s Music World',
      frequency: '528 Hz',
      transcript: 'Tonight we bring you an incredible live performance...',
    },
    {
      id: '3',
      title: 'Poetry Station - Evening Readings',
      date: new Date('2026-02-17'),
      duration: 2700,
      views: 456,
      thumbnail: '📖',
      channel: 'Poetry Station',
      frequency: '639 Hz',
      transcript: 'Join us for an evening of beautiful poetry...',
    },
    {
      id: '4',
      title: 'Anna Promotion Co. - Artist Spotlight',
      date: new Date('2026-02-16'),
      duration: 4200,
      views: 678,
      thumbnail: '🎨',
      channel: 'Anna Promotion Co.',
      frequency: '741 Hz',
      transcript: 'This week we feature an amazing artist...',
    },
    {
      id: '5',
      title: 'Jaelon Enterprises - Business Hour',
      date: new Date('2026-02-15'),
      duration: 3300,
      views: 523,
      thumbnail: '💼',
      channel: 'Jaelon Enterprises',
      frequency: '852 Hz',
      transcript: 'Business insights and market analysis...',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const filteredRecordings = recordings.filter((rec) =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePlayRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    if (onPlayRecording) {
      onPlayRecording(recording);
    }
    toast.success(`▶️ Playing: ${recording.title}`);
  };

  const handleDownload = (recording: Recording) => {
    toast.success(`📥 Downloading: ${recording.title}`);
  };

  const handleShare = (recording: Recording) => {
    navigator.clipboard.writeText(`https://rrb.canryn.org/vod/${recording.id}`);
    toast.success('📋 VOD link copied to clipboard');
  };

  const handleDelete = (recordingId: string) => {
    setRecordings(recordings.filter((rec) => rec.id !== recordingId));
    toast.success('🗑️ Recording deleted');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recordings by title or channel..."
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
            All Recordings ({recordings.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-purple-600">
            Recent
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-purple-600">
            Popular
          </TabsTrigger>
        </TabsList>

        {/* All Recordings */}
        <TabsContent value="all" className="space-y-3 mt-4">
          {filteredRecordings.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No recordings found</p>
            </Card>
          ) : (
            filteredRecordings.map((recording) => (
              <Card
                key={recording.id}
                className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                onClick={() => handlePlayRecording(recording)}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center text-4xl">
                    {recording.thumbnail}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate hover:text-purple-400">
                      {recording.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(recording.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(recording.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {recording.views.toLocaleString()} views
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                        {recording.channel}
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-900 text-xs text-purple-200 rounded">
                        {recording.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayRecording(recording);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(recording);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(recording);
                      }}
                      className="bg-gray-700 hover:bg-gray-600 text-white"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recording.id);
                      }}
                      className="bg-red-900 hover:bg-red-800 text-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Transcript Preview */}
                {recording.transcript && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <span className="font-semibold">Transcript:</span> {recording.transcript.substring(0, 100)}...
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Recent */}
        <TabsContent value="recent" className="space-y-3 mt-4">
          {filteredRecordings
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 3)
            .map((recording) => (
              <Card
                key={recording.id}
                className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                onClick={() => handlePlayRecording(recording)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{recording.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{formatDate(recording.date)}</p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayRecording(recording);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>

        {/* Popular */}
        <TabsContent value="popular" className="space-y-3 mt-4">
          {filteredRecordings
            .sort((a, b) => b.views - a.views)
            .slice(0, 3)
            .map((recording) => (
              <Card
                key={recording.id}
                className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                onClick={() => handlePlayRecording(recording)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{recording.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      <Eye className="w-3 h-3 inline mr-1" />
                      {recording.views.toLocaleString()} views
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayRecording(recording);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Archive Stats */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Total Recordings</p>
            <p className="text-white text-2xl font-bold">{recordings.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-white text-2xl font-bold">
              {recordings.reduce((sum, rec) => sum + rec.views, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Duration</p>
            <p className="text-white text-2xl font-bold">
              {formatDuration(recordings.reduce((sum, rec) => sum + rec.duration, 0))}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
