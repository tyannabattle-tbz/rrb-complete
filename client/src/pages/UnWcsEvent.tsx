import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BroadcastPlayer from '@/components/BroadcastPlayer';
import BroadcastEngagement from '@/components/BroadcastEngagement';
import { Globe, Users, Share2, Download, Calendar, MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const UN_WCS_EVENT_ID = 'un-wcs-2026-march-17';

export default function UnWcsEvent() {
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Fetch broadcast data
  const { data: broadcast } = trpc.broadcast.getBroadcast.useQuery({
    id: UN_WCS_EVENT_ID,
  });

  // Fetch analytics
  const { data: analytics } = trpc.broadcast.getAnalytics.useQuery({
    broadcastId: UN_WCS_EVENT_ID,
    limit: 1,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 50000) + 5000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'UN WCS Parallel Event - RRB Live',
        description: 'Watch the UN World Conservation Summit parallel event with Rockin\' Rockin\' Boogie',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadRecording = () => {
    alert('Recording will be available after the event ends');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌍 UN WCS Parallel Event
              </h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                March 17th, 2026 • 10:00 AM UTC
              </p>
              <p className="text-slate-400 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                Rockin' Rockin' Boogie + Ghana Partnership
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-red-600 text-lg px-3 py-1 mb-2">
                {isLive ? '🔴 LIVE NOW' : '⏱️ COMING SOON'}
              </Badge>
              <p className="text-slate-400">
                <span className="text-2xl font-bold text-blue-400">
                  {viewerCount.toLocaleString()}
                </span>
                <br />
                watching worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Player - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <BroadcastPlayer
              title="UN WCS Parallel Event - Live Stream"
              isLive={isLive}
              viewerCount={viewerCount}
              quality={selectedQuality as '480p' | '720p' | '1080p' | '4k'}
              onQualityChange={setSelectedQuality}
              streamUrl="https://test-streams.mux.dev/x36xhzz/x3iqvq.m3u8"
            />

            {/* Event Description */}
            <Card className="mt-6 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">About This Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Join us for a historic parallel event at the United Nations World Conservation Summit, 
                  featuring Rockin' Rockin' Boogie and our partners in Ghana. This broadcast celebrates 
                  the legacy of Seabrun Candy Hunter and showcases the power of music, community, and 
                  conservation working together.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <p className="text-xs text-slate-400">Expected Audience</p>
                    <p className="text-lg font-semibold text-white">100,000+</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <p className="text-xs text-slate-400">Broadcast Duration</p>
                    <p className="text-lg font-semibold text-white">4 Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Engagement & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Share & Download</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleShare}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
                <Button
                  onClick={handleDownloadRecording}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Recording
                </Button>
              </CardContent>
            </Card>

            {/* Stream Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Stream Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Average Bitrate</p>
                  <p className="text-lg font-semibold text-white">4.5 Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Stream Quality</p>
                  <p className="text-lg font-semibold text-white">1080p 60fps</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Latency</p>
                  <p className="text-lg font-semibold text-white">&lt; 2 seconds</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Geographic Reach</p>
                  <p className="text-lg font-semibold text-white">195+ Countries</p>
                </div>
              </CardContent>
            </Card>

            {/* Participating Platforms */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Streaming On</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Custom Platform', 'YouTube', 'Facebook', 'Twitch'].map(platform => (
                  <div key={platform} className="flex items-center gap-2 p-2 bg-slate-900 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-slate-300">{platform}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Engagement Section */}
        <div className="mb-8">
          <BroadcastEngagement broadcastId={UN_WCS_EVENT_ID} />
        </div>

        {/* Footer Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Worldwide Access</h3>
                  <p className="text-sm text-slate-400">Available in 195+ countries with multi-language support</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Community Engagement</h3>
                  <p className="text-sm text-slate-400">Live chat, Q&A, and polls with thousands of participants</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">On-Demand Replay</h3>
                  <p className="text-sm text-slate-400">Full event recording available after broadcast ends</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
