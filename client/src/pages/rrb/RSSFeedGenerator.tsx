import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Check, Rss, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  episodeCount: number;
}

const CHANNELS: Channel[] = [
  {
    id: 'rrb-main',
    name: 'RRB Main',
    description: 'Rockin\' Rockin\' Boogie - The Legacy of Seabrun Candy Hunter',
    imageUrl: '🎵',
    episodeCount: 6,
  },
  {
    id: 'sean-music',
    name: 'Sean\'s Music',
    description: 'Music Production & Theory Sessions',
    imageUrl: '🎸',
    episodeCount: 3,
  },
  {
    id: 'anna-promotion',
    name: 'Anna Promotion Co.',
    description: 'Creative Conversations & Business Insights',
    imageUrl: '🎭',
    episodeCount: 2,
  },
  {
    id: 'jaelon-enterprises',
    name: 'Jaelon Enterprises',
    description: 'Industry Trends & Strategic Planning',
    imageUrl: '🚀',
    episodeCount: 2,
  },
  {
    id: 'little-c',
    name: 'Little C Recording Co.',
    description: 'Young Voices & Creative Experiments',
    imageUrl: '⭐',
    episodeCount: 2,
  },
];

export default function RSSFeedGenerator() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  const generateRSSFeed = (channelId: string) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return '';

    const baseUrl = window.location.origin;
    const feedUrl = `${baseUrl}/api/rss/${channelId}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${channel.name}</title>
    <link>${baseUrl}/rrb/podcast-and-video</link>
    <description>${channel.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>Canryn Production Inc.</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Arts"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>${channel.name}</title>
      <link>${baseUrl}</link>
    </image>
    <item>
      <title>Episode 1: ${channel.name}</title>
      <description>${channel.description}</description>
      <link>${baseUrl}/rrb/podcast-and-video</link>
      <guid isPermaLink="false">${channelId}-ep1</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <enclosure url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" type="audio/wav" length="882044"/>
      <itunes:duration>600</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>
  </channel>
</rss>`;
  };

  const copyToClipboard = (channelId: string) => {
    const feed = generateRSSFeed(channelId);
    navigator.clipboard.writeText(feed).then(() => {
      setCopiedFeed(channelId);
      toast.success('RSS feed copied to clipboard!');
      setTimeout(() => setCopiedFeed(null), 2000);
    });
  };

  const downloadRSSFeed = (channelId: string) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return;

    const feed = generateRSSFeed(channelId);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(feed));
    element.setAttribute('download', `${channel.name.replace(/\s+/g, '-')}-feed.xml`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('RSS feed downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Rss className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold">Podcast RSS Feeds</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Subscribe to your favorite Canryn Production channels on any podcast platform
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CHANNELS.map(channel => (
            <Card
              key={channel.id}
              className={`p-6 cursor-pointer transition-all ${
                selectedChannel === channel.id
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <div className="text-5xl mb-4">{channel.imageUrl}</div>
              <h3 className="text-xl font-bold mb-2">{channel.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{channel.description}</p>
              <Badge variant="secondary">{channel.episodeCount} episodes</Badge>
            </Card>
          ))}
        </div>

        {/* RSS Feed Display */}
        {selectedChannel && (
          <Card className="p-8 bg-white dark:bg-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {CHANNELS.find(c => c.id === selectedChannel)?.name} - RSS Feed
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Copy the feed URL or download the RSS file to subscribe on your podcast platform
              </p>
            </div>

            {/* Feed URL */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Feed URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/api/rss/${selectedChannel}`}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-sm font-mono"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/rss/${selectedChannel}`);
                    toast.success('Feed URL copied!');
                  }}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Subscribe Links */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Subscribe on:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button className="w-full bg-red-600 hover:bg-red-700 gap-2" asChild>
                  <a href={`https://www.youtube.com/@rockinrockinboogie`} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </a>
                </Button>
                <Button className="w-full bg-black hover:bg-gray-800 gap-2" asChild>
                  <a href={`https://podcasts.apple.com/us/podcast/rockin-rockin-boogie/id1234567890`} target="_blank" rel="noopener noreferrer">
                    Apple Podcasts
                  </a>
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 gap-2" asChild>
                  <a href={`https://open.spotify.com/show/rockinrockinboogie`} target="_blank" rel="noopener noreferrer">
                    Spotify
                  </a>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2" asChild>
                  <a href={`https://podcasts.google.com/feed/rockinrockinboogie`} target="_blank" rel="noopener noreferrer">
                    Google Podcasts
                  </a>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => copyToClipboard(selectedChannel)}
                className="flex-1 gap-2"
                variant={copiedFeed === selectedChannel ? 'default' : 'outline'}
              >
                {copiedFeed === selectedChannel ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy RSS Feed
                  </>
                )}
              </Button>
              <Button
                onClick={() => downloadRSSFeed(selectedChannel)}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Download XML
              </Button>
              <Button
                onClick={() => {
                  const feedUrl = `${window.location.origin}/api/rss/${selectedChannel}`;
                  navigator.share?.({
                    title: `${CHANNELS.find(c => c.id === selectedChannel)?.name} Podcast`,
                    text: 'Subscribe to this podcast',
                    url: feedUrl,
                  }).catch(() => {
                    navigator.clipboard.writeText(feedUrl);
                    toast.success('Feed URL copied!');
                  });
                }}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* RSS Preview */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold mb-3">RSS Feed Preview</label>
              <pre className="text-xs overflow-x-auto max-h-64 text-gray-700 dark:text-gray-300">
                {generateRSSFeed(selectedChannel).substring(0, 500)}...
              </pre>
            </div>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold mb-2">What is RSS?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              RSS feeds allow podcast apps to automatically download new episodes as they're published
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold mb-2">How to Subscribe</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copy the feed URL and paste it into your podcast app's "Add by URL" feature
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold mb-2">Supported Platforms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Works with Apple Podcasts, Spotify, Google Podcasts, and all RSS-compatible apps
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
