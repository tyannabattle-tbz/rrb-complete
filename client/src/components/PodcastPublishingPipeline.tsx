'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, AlertCircle, Share2, Music, Radio } from 'lucide-react';
import { toast } from 'sonner';

interface PublishingPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'uploading' | 'published' | 'failed';
  progress: number;
}

interface EpisodeMetadata {
  title: string;
  description: string;
  author: string;
  category: string;
  explicit: boolean;
  imageUrl?: string;
  duration: number;
}

export const PodcastPublishingPipeline: React.FC = () => {
  const [platforms, setPlatforms] = useState<PublishingPlatform[]>([
    { id: 'spotify', name: 'Spotify', icon: <Music className="w-5 h-5" />, status: 'idle', progress: 0 },
    { id: 'apple', name: 'Apple Podcasts', icon: <Radio className="w-5 h-5" />, status: 'idle', progress: 0 },
    { id: 'youtube', name: 'YouTube', icon: <Music className="w-5 h-5" />, status: 'idle', progress: 0 },
    { id: 'rss', name: 'RSS Feed', icon: <Radio className="w-5 h-5" />, status: 'idle', progress: 0 },
  ]);

  const [metadata, setMetadata] = useState<EpisodeMetadata>({
    title: 'Episode 1: The Future of Audio',
    description: 'Exploring the latest trends in podcast production and distribution.',
    author: 'Your Podcast Name',
    category: 'Technology',
    explicit: false,
    duration: 3600,
  });

  const [scheduledRelease, setScheduledRelease] = useState<string>('');
  const [autoPublish, setAutoPublish] = useState(false);

  const updatePlatformStatus = (id: string, status: PublishingPlatform['status'], progress: number = 0) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, progress } : p))
    );
  };

  const publishToSpotify = async () => {
    updatePlatformStatus('spotify', 'uploading', 10);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updatePlatformStatus('spotify', 'uploading', 50);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updatePlatformStatus('spotify', 'uploading', 90);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatePlatformStatus('spotify', 'published', 100);
    toast.success('Published to Spotify');
  };

  const publishToApple = async () => {
    updatePlatformStatus('apple', 'uploading', 10);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updatePlatformStatus('apple', 'uploading', 50);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updatePlatformStatus('apple', 'uploading', 90);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatePlatformStatus('apple', 'published', 100);
    toast.success('Published to Apple Podcasts');
  };

  const publishToYouTube = async () => {
    updatePlatformStatus('youtube', 'uploading', 10);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updatePlatformStatus('youtube', 'uploading', 50);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updatePlatformStatus('youtube', 'uploading', 90);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatePlatformStatus('youtube', 'published', 100);
    toast.success('Published to YouTube');
  };

  const generateRSSFeed = async () => {
    updatePlatformStatus('rss', 'uploading', 50);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updatePlatformStatus('rss', 'published', 100);
    toast.success('RSS Feed generated and published');
  };

  const publishAll = async () => {
    toast.loading('Publishing to all platforms...');
    await Promise.all([publishToSpotify(), publishToApple(), publishToYouTube(), generateRSSFeed()]);
    toast.success('Published to all platforms!');
  };

  const getStatusIcon = (status: PublishingPlatform['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uploading':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Upload className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: PublishingPlatform['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-900/30 text-green-300">Published</Badge>;
      case 'uploading':
        return <Badge className="bg-blue-900/30 text-blue-300">Uploading</Badge>;
      case 'failed':
        return <Badge className="bg-red-900/30 text-red-300">Failed</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-300">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Episode Metadata */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Episode Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Author</label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Category</label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              >
                <option>Technology</option>
                <option>Business</option>
                <option>Entertainment</option>
                <option>Education</option>
                <option>News</option>
                <option>Sports</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={metadata.explicit}
              onChange={(e) => setMetadata({ ...metadata, explicit: e.target.checked })}
              className="rounded"
            />
            Mark as Explicit Content
          </label>
        </CardContent>
      </Card>

      {/* Publishing Platforms */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Publish to Platforms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">{platform.icon}</div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{platform.name}</h4>
                    <p className="text-xs text-slate-400">{getStatusBadge(platform.status)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(platform.status)}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (platform.id === 'spotify') publishToSpotify();
                      else if (platform.id === 'apple') publishToApple();
                      else if (platform.id === 'youtube') publishToYouTube();
                      else if (platform.id === 'rss') generateRSSFeed();
                    }}
                    disabled={platform.status === 'uploading' || platform.status === 'published'}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {platform.status === 'published' ? 'Published' : 'Publish'}
                  </Button>
                </div>
              </div>

              {platform.status === 'uploading' && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${platform.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}

          <Button onClick={publishAll} className="w-full bg-green-600 hover:bg-green-700 mt-4">
            <Share2 className="w-4 h-4 mr-2" />
            Publish to All Platforms
          </Button>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Schedule Release</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Release Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledRelease}
              onChange={(e) => setScheduledRelease(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="rounded"
            />
            Auto-publish at scheduled time
          </label>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Schedule Release
          </Button>
        </CardContent>
      </Card>

      {/* Distribution Status */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Distribution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Platforms Active:</span>
              <span className="font-semibold">{platforms.filter((p) => p.status === 'published').length}/4</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Reach:</span>
              <span className="font-semibold">2.5M+ listeners</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Distribution Time:</span>
              <span className="font-semibold">24-48 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
