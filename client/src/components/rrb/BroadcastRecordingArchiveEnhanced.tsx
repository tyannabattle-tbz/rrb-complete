import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Download, Share2, Trash2, Search, Calendar, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BroadcastRecordingArchiveEnhancedProps {
  onPlayRecording?: (recordingId: string) => void;
}

export function BroadcastRecordingArchiveEnhanced({ onPlayRecording }: BroadcastRecordingArchiveEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all recordings
  const { data: recordingsData, isLoading } = trpc.broadcastRecording.getRecordings.useQuery();

  // Fetch statistics
  const { data: statsData } = trpc.broadcastRecording.getStatistics.useQuery();

  // Fetch popular recordings
  const { data: popularData } = trpc.broadcastRecording.getPopularRecordings.useQuery({ limit: 5 });

  // Fetch recent recordings
  const { data: recentData } = trpc.broadcastRecording.getRecentRecordings.useQuery({ limit: 5 });

  // Search mutation
  const searchMutation = trpc.broadcastRecording.searchRecordings.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Delete mutation
  const deleteMutation = trpc.broadcastRecording.deleteRecording.useMutation({
    onSuccess: () => {
      toast.success('🗑️ Recording deleted');
      // Refetch recordings
      trpc.broadcastRecording.getRecordings.useQuery();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Increment views mutation
  const incrementViewsMutation = trpc.broadcastRecording.incrementViews.useMutation();

  const recordings = recordingsData?.data || [];
  const stats = statsData?.data;
  const popular = popularData?.data || [];
  const recent = recentData?.data || [];
  const searchResults = searchMutation.data?.data || [];

  const filteredRecordings = searchQuery ? searchResults : recordings;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePlayRecording = async (recordingId: string) => {
    await incrementViewsMutation.mutateAsync({ id: recordingId });
    if (onPlayRecording) {
      onPlayRecording(recordingId);
    }
    toast.success('▶️ Playing recording');
  };

  const handleDownload = (recordingId: string) => {
    toast.success(`📥 Downloading recording ${recordingId}`);
  };

  const handleShare = (recordingId: string) => {
    navigator.clipboard.writeText(`https://rrb.canryn.org/vod/${recordingId}`);
    toast.success('📋 VOD link copied to clipboard');
  };

  const handleDelete = async (recordingId: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      await deleteMutation.mutateAsync({ id: recordingId });
    }
  };

  const RecordingCard = ({ recording }: { recording: any }) => (
    <Card
      className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
      onClick={() => handlePlayRecording(recording.id)}
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
              handlePlayRecording(recording.id);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Play className="w-4 h-4" />
            Play
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(recording.id);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(recording.id);
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
    </Card>
  );

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
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
            All ({recordings.length})
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
          {isLoading ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">Loading recordings...</p>
            </Card>
          ) : filteredRecordings.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No recordings found</p>
            </Card>
          ) : (
            filteredRecordings.map((recording) => <RecordingCard key={recording.id} recording={recording} />)
          )}
        </TabsContent>

        {/* Recent */}
        <TabsContent value="recent" className="space-y-3 mt-4">
          {recent.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No recent recordings</p>
            </Card>
          ) : (
            recent.map((recording) => <RecordingCard key={recording.id} recording={recording} />)
          )}
        </TabsContent>

        {/* Popular */}
        <TabsContent value="popular" className="space-y-3 mt-4">
          {popular.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No popular recordings</p>
            </Card>
          ) : (
            popular.map((recording) => <RecordingCard key={recording.id} recording={recording} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Archive Stats */}
      {stats && (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Recordings</p>
              <p className="text-white text-2xl font-bold">{stats.totalRecordings}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-white text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Duration</p>
              <p className="text-white text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
