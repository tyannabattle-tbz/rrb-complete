import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Copy,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
} from 'lucide-react';

interface ShareMetric {
  platform: string;
  shares: number;
  clicks: number;
  engagement: number;
  trend: number;
}

interface SharedContent {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  sharedAt: string;
  platforms: string[];
  metrics: {
    views: number;
    clicks: number;
    shares: number;
    engagement: number;
  };
}

const SHARE_METRICS: ShareMetric[] = [
  { platform: 'Facebook', shares: 2340, clicks: 5620, engagement: 8.2, trend: 12 },
  { platform: 'Twitter', shares: 1850, clicks: 3420, engagement: 6.5, trend: -3 },
  { platform: 'LinkedIn', shares: 920, clicks: 1850, engagement: 4.2, trend: 8 },
  { platform: 'Email', shares: 1560, clicks: 4230, engagement: 7.1, trend: 15 },
];

const SHARED_CONTENT: SharedContent[] = [
  {
    id: 'share_1',
    title: 'Episode 42: The Future of Entertainment',
    description: 'A deep dive into the evolution of digital media and streaming platforms.',
    thumbnail: '🎬',
    sharedAt: '2 days ago',
    platforms: ['Facebook', 'Twitter', 'LinkedIn'],
    metrics: { views: 12450, clicks: 3240, shares: 850, engagement: 6.8 },
  },
  {
    id: 'share_2',
    title: 'Live Q&A with Industry Experts',
    description: 'Join us for an exclusive conversation with leading content creators.',
    thumbnail: '🎙️',
    sharedAt: '5 days ago',
    platforms: ['Facebook', 'Email'],
    metrics: { views: 8920, clicks: 2150, shares: 620, engagement: 5.2 },
  },
  {
    id: 'share_3',
    title: 'Behind the Scenes: Studio Tour',
    description: 'Exclusive look at our state-of-the-art broadcasting facilities.',
    thumbnail: '📹',
    sharedAt: '1 week ago',
    platforms: ['Twitter', 'LinkedIn', 'Email'],
    metrics: { views: 15600, clicks: 4820, shares: 1240, engagement: 7.9 },
  },
];

export function SocialSharing() {
  const [selectedContent, setSelectedContent] = useState<SharedContent | null>(null);
  const [shareUrl, setShareUrl] = useState('https://rockinrockinboogie.com/episode/42');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent('Check this out!');

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };

    if (urls[platform.toLowerCase()]) {
      window.open(urls[platform.toLowerCase()], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-8 h-8 text-blue-500" /> Social Sharing & Viral Growth
          </h1>
          <p className="text-gray-400 mt-2">Track and optimize your content distribution across social platforms</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Share Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Share Current Content</h2>
          <div className="space-y-4">
            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                placeholder="Enter share URL..."
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
                { name: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
                { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800' },
                { name: 'Email', icon: Mail, color: 'bg-gray-600 hover:bg-gray-700' },
              ].map((social) => (
                <Button
                  key={social.name}
                  onClick={() => handleShare(social.name)}
                  className={`gap-2 ${social.color} text-white`}
                >
                  <social.icon className="w-4 h-4" /> {social.name}
                </Button>
              ))}
            </div>

            {/* Generate Shareable Link */}
            <div className="pt-4 border-t border-gray-700">
              <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Link2 className="w-4 h-4" /> Generate Unique Share Link
              </Button>
              <p className="text-gray-400 text-sm mt-2">Create trackable links to monitor individual share performance</p>
            </div>
          </div>
        </Card>

        {/* Platform Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHARE_METRICS.map((metric) => (
              <Card key={metric.platform} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{metric.platform}</h3>
                  <TrendingUp className={`w-5 h-5 ${metric.trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-400 text-sm">Shares</p>
                    <p className="text-2xl font-bold text-white">{metric.shares.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Clicks</p>
                    <p className="text-lg text-blue-400">{metric.clicks.toLocaleString()}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <p className={`text-sm ${metric.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend}% from last week
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Shared Content History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Shares</h2>
          <div className="space-y-3">
            {SHARED_CONTENT.map((content) => (
              <Card
                key={content.id}
                className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                onClick={() => setSelectedContent(content)}
              >
                <div className="flex gap-4">
                  <div className="text-4xl">{content.thumbnail}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{content.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{content.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {content.platforms.map((platform) => (
                        <span key={platform} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{content.sharedAt}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-400">Views</p>
                        <p className="text-lg font-bold text-white">{(content.metrics.views / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Clicks</p>
                        <p className="text-lg font-bold text-blue-400">{(content.metrics.clicks / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Viral Growth Tracking */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-500" /> Viral Growth Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded border border-gray-600">
              <p className="text-gray-400 text-sm">Total Impressions</p>
              <p className="text-3xl font-bold text-white mt-2">2.4M</p>
              <p className="text-green-400 text-sm mt-2">↑ 23% this month</p>
            </div>
            <div className="p-4 bg-gray-700 rounded border border-gray-600">
              <p className="text-gray-400 text-sm">Viral Coefficient</p>
              <p className="text-3xl font-bold text-white mt-2">1.8x</p>
              <p className="text-yellow-400 text-sm mt-2">Good viral potential</p>
            </div>
            <div className="p-4 bg-gray-700 rounded border border-gray-600">
              <p className="text-gray-400 text-sm">Avg Engagement Rate</p>
              <p className="text-3xl font-bold text-white mt-2">6.8%</p>
              <p className="text-blue-400 text-sm mt-2">↑ 2.1% from last week</p>
            </div>
          </div>
        </Card>

        {/* Content Details */}
        {selectedContent && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedContent.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedContent(null)}>
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Views', value: selectedContent.metrics.views, icon: Eye },
                { label: 'Clicks', value: selectedContent.metrics.clicks, icon: Link2 },
                { label: 'Shares', value: selectedContent.metrics.shares, icon: Share2 },
                { label: 'Engagement', value: `${selectedContent.metrics.engagement}%`, icon: Heart },
              ].map((stat, idx) => (
                <div key={idx} className="p-3 bg-gray-700 rounded border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="w-4 h-4 text-blue-400" />
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4" /> Share Again
              </Button>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" /> View Full Analytics
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
