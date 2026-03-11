import React, { useState } from 'react';
import { Music, Video, FileAudio, Upload, Download, Trash2, Play, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { RRB_SONG_LINKS } from '@/lib/rrbSongLinks';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'document';
  duration?: string;
  size: string;
  uploadedDate: string;
  plays: number;
  appleMusicUrl?: string;
  spotifyUrl?: string;
}

export function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video' | 'document'>('all');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: '1',
      name: 'Rockin Rockin Boogie - Theme Song',
      type: 'audio',
      duration: '3:45',
      size: '8.2 MB',
      uploadedDate: '2026-03-01',
      plays: 1240,
      appleMusicUrl: 'https://music.apple.com/us/song/rockin-rockin-boogie/335850412',
      spotifyUrl: 'https://open.spotify.com/track/6vmu5hZHazgoa2BwPiSswD',
    },
    {
      id: '2',
      name: 'Seabrun Candy Hunter - Documentary',
      type: 'video',
      duration: '45:30',
      size: '520 MB',
      uploadedDate: '2026-02-28',
      plays: 3420,
    },
    {
      id: '3',
      name: 'Healing Frequencies - 528Hz',
      type: 'audio',
      duration: '10:00',
      size: '22.5 MB',
      uploadedDate: '2026-02-25',
      plays: 5680,
    },
    {
      id: '4',
      name: 'RRB Radio - Live Broadcast',
      type: 'video',
      duration: '120:00',
      size: '1.2 GB',
      uploadedDate: '2026-02-20',
      plays: 8920,
    },
  ]);

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    setMediaFiles(mediaFiles.filter(f => f.id !== id));
    toast.success('File deleted');
  };

  const handlePlay = (name: string) => {
    toast.success(`Playing: ${name}`);
  };

  const handleDownload = (name: string) => {
    toast.success(`Downloading: ${name}`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Music className="w-5 h-5 text-pink-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-orange-400" />;
      default:
        return <FileAudio className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Media Library
            </h1>
          </div>
          <p className="text-gray-300">Manage and organize all RRB audio, video, and media files</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Upload className="w-4 h-4" />
              Upload Media
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'audio', 'video', 'document'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className={filterType === type ? 'bg-pink-600' : 'border-slate-600'}
              >
                <Filter className="w-4 h-4 mr-2" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <Card
                key={file.id}
                className="bg-slate-800/50 border-pink-500/20 overflow-hidden hover:border-pink-500/50 transition-all"
              >
                {/* Thumbnail */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 h-40 flex items-center justify-center relative group">
                  {getFileIcon(file.type)}
                  <Button
                    size="sm"
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-pink-600 hover:bg-pink-700"
                    onClick={() => handlePlay(file.name)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white truncate">{file.name}</h3>
                    <div className="text-xs text-gray-400 mt-1">
                      {file.duration && <span>{file.duration} • </span>}
                      {file.size}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-xs text-gray-400 border-t border-slate-700 pt-3">
                    <span>Uploaded: {file.uploadedDate}</span>
                    <span>Plays: {file.plays}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 border-slate-600 text-gray-300 hover:bg-slate-700"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2 border-red-600/50 text-red-400 hover:bg-red-600/10"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                  {(file.appleMusicUrl || file.spotifyUrl) && (
                    <div className="pt-2 border-t border-slate-700">
                      <RRBSongBadge variant="compact" showTitle />
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No media files found</p>
            </div>
          )}
        </div>

        {/* Storage Info */}
        <Card className="mt-8 bg-slate-800/50 border-pink-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Storage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Files</div>
              <div className="text-2xl font-bold text-pink-400">{mediaFiles.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Size</div>
              <div className="text-2xl font-bold text-orange-400">1.75 GB</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Plays</div>
              <div className="text-2xl font-bold text-purple-400">19,260</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
