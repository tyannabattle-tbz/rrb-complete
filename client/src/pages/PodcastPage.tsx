import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, Volume2, Share2, Download, Heart, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Podcast {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  uploadedAt: string;
  channel: string;
  views: number;
  youtubeUrl: string;
}

const mockPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Healing Frequencies: The Science of Solfeggio',
    description: 'Explore the ancient Solfeggio frequencies and their impact on healing and wellness.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Healing+Frequencies',
    duration: '45:32',
    uploadedAt: '2 days ago',
    channel: 'RRB Legacy',
    views: 1250,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Legacy Stories: Seabrun Candy Hunter',
    description: 'Stories and memories from the life and impact of Seabrun Candy Hunter.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Legacy+Stories',
    duration: '58:15',
    uploadedAt: '1 week ago',
    channel: 'RRB Legacy',
    views: 2840,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'Community Voices: Impact Stories',
    description: 'Hear from community members about the impact of RRB Radio on their lives.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Community+Voices',
    duration: '52:10',
    uploadedAt: '3 days ago',
    channel: 'RRB Legacy',
    views: 1890,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'Music & Healing: Frequency Deep Dive',
    description: 'Deep dive into how specific frequencies affect our body and mind.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Music+Healing',
    duration: '64:45',
    uploadedAt: '1 week ago',
    channel: 'RRB Legacy',
    views: 3120,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '5',
    title: 'Broadcasting for Change: 24/7 Impact',
    description: 'How continuous broadcasting creates lasting community impact.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Broadcasting+Change',
    duration: '41:20',
    uploadedAt: '2 weeks ago',
    channel: 'RRB Legacy',
    views: 1540,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '6',
    title: 'Solbones Sacred Math: Game & Spirituality',
    description: 'Exploring the spiritual and mathematical aspects of the Solbones game.',
    thumbnail: 'https://via.placeholder.com/320x180?text=Solbones+Game',
    duration: '37:55',
    uploadedAt: '3 weeks ago',
    channel: 'RRB Legacy',
    views: 892,
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>(mockPodcasts);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(mockPodcasts[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = mockPodcasts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.channel.toLowerCase().includes(query.toLowerCase())
      );
      setPodcasts(filtered);
    } else {
      setPodcasts(mockPodcasts);
    }
  };

  const handleShare = (podcast: Podcast) => {
    const shareText = `Check out "${podcast.title}" on RRB Radio - ${podcast.youtubeUrl}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Podcast link copied to clipboard!');
  };

  const handleDownload = (podcast: Podcast) => {
    toast.success(`Downloading "${podcast.title}"...`);
    // In production, this would trigger actual download
  };

  const toggleFavorite = (podcastId: string) => {
    setFavorites((prev) =>
      prev.includes(podcastId) ? prev.filter((id) => id !== podcastId) : [...prev, podcastId]
    );
    toast.success(favorites.includes(podcastId) ? 'Removed from favorites' : 'Added to favorites!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            RRB Podcasts & Videos
          </h1>
          <p className="text-xl text-pink-300 mb-8">
            Discover healing stories, community voices, and transformative content
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-pink-400" />
            <Input
              type="text"
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 border-pink-500/30 focus:border-pink-500 bg-slate-800/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2">
            {selectedPodcast && (
              <Card className="bg-slate-800/50 border-pink-500/20 overflow-hidden">
                <div className="relative bg-gradient-to-br from-pink-600/20 to-orange-600/20 aspect-video flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedPodcast.youtubeUrl}
                    title={selectedPodcast.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-white mb-2">
                        {selectedPodcast.title}
                      </CardTitle>
                      <CardDescription className="text-pink-300 mb-4">
                        {selectedPodcast.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-pink-500/50 text-pink-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {selectedPodcast.duration}
                        </Badge>
                        <Badge variant="outline" className="border-pink-500/50 text-pink-300">
                          <User className="w-3 h-3 mr-1" />
                          {selectedPodcast.channel}
                        </Badge>
                        <Badge variant="outline" className="border-pink-500/50 text-pink-300">
                          {selectedPodcast.views.toLocaleString()} views
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(selectedPodcast.id)}
                      className={`ml-4 ${
                        favorites.includes(selectedPodcast.id)
                          ? 'text-red-400'
                          : 'text-pink-300 hover:text-red-400'
                      }`}
                    >
                      <Heart
                        className="w-6 h-6"
                        fill={favorites.includes(selectedPodcast.id) ? 'currentColor' : 'none'}
                      />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Player Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>

                      <div className="flex-1 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-pink-300" />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-pink-300 w-8">{volume}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(selectedPodcast)}
                        className="flex-1 border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedPodcast)}
                        className="flex-1 border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Podcast List */}
          <div className="lg:col-span-1">
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {podcasts.map((podcast) => (
                <Card
                  key={podcast.id}
                  onClick={() => setSelectedPodcast(podcast)}
                  className={`cursor-pointer transition-all ${
                    selectedPodcast?.id === podcast.id
                      ? 'bg-pink-600/20 border-pink-500'
                      : 'bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <img
                        src={podcast.thumbnail}
                        alt={podcast.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm line-clamp-2">
                          {podcast.title}
                        </h3>
                        <p className="text-xs text-pink-300 mt-1">{podcast.uploadedAt}</p>
                        <p className="text-xs text-gray-400">{podcast.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
