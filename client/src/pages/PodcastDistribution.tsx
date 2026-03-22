import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, Share2 } from 'lucide-react';

interface Platform {
  name: string;
  type: 'streaming' | 'rss' | 'social' | 'custom';
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
}

interface Episode {
  episodeId: string;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  author: string;
  status: 'draft' | 'scheduled' | 'published';
}

const platforms: Platform[] = [
  {
    name: 'Spotify',
    type: 'streaming',
    enabled: true,
    status: 'connected',
    icon: '🎵'
  },
  {
    name: 'Apple Podcasts',
    type: 'streaming',
    enabled: true,
    status: 'connected',
    icon: '🍎'
  },
  {
    name: 'YouTube',
    type: 'streaming',
    enabled: true,
    status: 'connected',
    icon: '📺'
  },
  {
    name: 'RSS Feed',
    type: 'rss',
    enabled: true,
    status: 'connected',
    icon: '📡'
  },
  {
    name: 'Custom Website',
    type: 'custom',
    enabled: true,
    status: 'connected',
    icon: '🌐'
  }
];

const episodes: Episode[] = [
  {
    episodeId: 'ep-001',
    title: 'The Future of Radio Broadcasting',
    description: 'Exploring how autonomous systems are revolutionizing radio...',
    duration: 3600,
    releaseDate: '2026-03-22',
    author: 'Rockin Rockin Boogie Team',
    status: 'published'
  },
  {
    episodeId: 'ep-002',
    title: 'Community Voices: Stories from Our Listeners',
    description: 'Hear from our amazing community members...',
    duration: 2700,
    releaseDate: '2026-03-29',
    author: 'Rockin Rockin Boogie Team',
    status: 'scheduled'
  },
  {
    episodeId: 'ep-003',
    title: 'Behind the Scenes at RRB Studios',
    description: 'A tour of our state-of-the-art recording facilities...',
    duration: 1800,
    releaseDate: '2026-04-05',
    author: 'Rockin Rockin Boogie Team',
    status: 'draft'
  }
];

export function PodcastDistribution() {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [distributionResults, setDistributionResults] = useState<
    Record<string, { platform: string; status: 'success' | 'failed' | 'pending' }[]>
  >({});

  const handlePublish = (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowDistributionModal(true);
  };

  const handleDistribute = () => {
    if (!selectedEpisode) return;

    const results = platforms
      .filter((p) => p.enabled)
      .map((p) => ({
        platform: p.name,
        status: p.status === 'connected' ? 'success' : 'failed'
      }));

    setDistributionResults((prev) => ({
      ...prev,
      [selectedEpisode.episodeId]: results
    }));

    setTimeout(() => {
      setShowDistributionModal(false);
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: Episode['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Podcast Distribution</h1>
        <p className="text-lg text-muted-foreground">
          Auto-publish episodes to all platforms with optimized metadata
        </p>
      </div>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Platforms</CardTitle>
          <CardDescription>Connected platforms for automatic episode publishing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">{platform.icon}</div>
                <p className="font-semibold text-sm text-center">{platform.name}</p>
                <div className="mt-2">
                  {platform.status === 'connected' ? (
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  ) : (
                    <Badge variant="destructive">Error</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Episodes List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Episodes</h2>

        {episodes.map((episode) => (
          <Card key={episode.episodeId}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{episode.title}</h3>
                    <Badge className={getStatusColor(episode.status)}>
                      {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{episode.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Duration: {formatDuration(episode.duration)}</span>
                    <span>Release: {episode.releaseDate}</span>
                    <span>Author: {episode.author}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {episode.status === 'draft' && (
                    <Button onClick={() => handlePublish(episode)} className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Publish Now
                    </Button>
                  )}

                  {episode.status === 'scheduled' && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      Scheduled
                    </div>
                  )}

                  {episode.status === 'published' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Published
                    </div>
                  )}

                  {distributionResults[episode.episodeId] && (
                    <div className="text-xs space-y-1">
                      {distributionResults[episode.episodeId].map((result) => (
                        <div key={result.platform} className="flex items-center gap-1">
                          {result.status === 'success' ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-600" />
                          )}
                          <span>{result.platform}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution Modal */}
      {showDistributionModal && selectedEpisode && (
        <Card className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 z-50">
          <CardHeader>
            <CardTitle>Publish Episode</CardTitle>
            <CardDescription>{selectedEpisode.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Publishing to:</p>
              {platforms
                .filter((p) => p.enabled)
                .map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between">
                    <span className="text-sm">{platform.icon} {platform.name}</span>
                    {distributionResults[selectedEpisode.episodeId]?.some(
                      (r) => r.platform === platform.name && r.status === 'success'
                    ) ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDistributionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleDistribute} className="flex-1">
                Publish to All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay */}
      {showDistributionModal && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowDistributionModal(false)}
        />
      )}
    </div>
  );
}
