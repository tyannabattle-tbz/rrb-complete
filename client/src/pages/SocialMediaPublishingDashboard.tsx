import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function SocialMediaPublishingDashboard() {
  const [episodeId, setEpisodeId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'instagram']);
  const [autoGenerateClips, setAutoGenerateClips] = useState<boolean>(true);

  // Fetch social media dashboard
  const { data: dashboard, isLoading } = trpc.advancedMonetization.socialMedia.getSocialMediaDashboard.useQuery();

  // Auto-publish mutation
  const autoPublish = trpc.advancedMonetization.socialMedia.autoPublishEpisode.useMutation({
    onSuccess: () => {
      setEpisodeId('');
      setTitle('');
      setDescription('');
      alert('Episode published to all platforms!');
    }
  });

  const platforms = [
    { id: 'twitter', label: 'Twitter/X' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' }
  ];

  const handlePublish = () => {
    if (!episodeId || !title || !description) {
      alert('Please fill in all fields');
      return;
    }

    autoPublish.mutate({
      episodeId,
      title,
      description,
      platforms: selectedPlatforms as any,
      autoGenerateClips
    });
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading social media data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalPosts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Clips Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalClips || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeSchedules || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalEngagement || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Auto-Publish Form */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Publish Episode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Episode ID</label>
              <Input
                value={episodeId}
                onChange={(e) => setEpisodeId(e.target.value)}
                placeholder="ep-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Episode description"
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center">
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => togglePlatform(platform.id)}
                    />
                    <label className="ml-2 text-sm">{platform.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox
                checked={autoGenerateClips}
                onCheckedChange={(checked) => setAutoGenerateClips(checked as boolean)}
              />
              <label className="ml-2 text-sm">Auto-generate AI clips</label>
            </div>

            <Button
              onClick={handlePublish}
              disabled={autoPublish.isPending}
              className="w-full"
            >
              {autoPublish.isPending ? 'Publishing...' : 'Publish to All Platforms'}
            </Button>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="p-2 rounded bg-gray-50">
                <p className="font-medium">{platform.label}</p>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Posts: {Math.floor(Math.random() * 50)}</span>
                  <span>Engagement: {Math.floor(Math.random() * 1000)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboard?.topPosts?.map((post) => (
              <div key={post.postId} className="flex items-center justify-between p-2 rounded hover:bg-gray-100">
                <div>
                  <p className="font-medium text-sm">{post.platform.toUpperCase()}</p>
                  <p className="text-xs text-gray-600">{post.content.substring(0, 50)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{post.engagement.likes} likes</p>
                  <p className="text-xs text-gray-600">{post.engagement.shares} shares</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
