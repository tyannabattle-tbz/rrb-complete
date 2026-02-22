/**
 * Live Broadcast Control Dashboard
 * Real-time monitoring and control for active broadcasts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Pause, Play, Radio, Users, Zap, TrendingUp } from 'lucide-react';

interface BroadcastMetrics {
  status: 'live' | 'scheduled' | 'ended';
  panelists: {
    total: number;
    connected: number;
    disconnected: number;
  };
  viewers: {
    total: number;
    active: number;
    peakConcurrent: number;
  };
  commercials: {
    played: number;
    scheduled: number;
    currentlyPlaying?: string;
  };
  engagement: {
    surveyResponses: number;
    chatMessages: number;
    callIns: number;
  };
  technical: {
    audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
    videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
    bandwidth: number;
  };
  errors: Array<{
    id: string;
    type: 'audio' | 'video' | 'connection' | 'other';
    message: string;
    severity: 'critical' | 'warning' | 'info';
    timestamp: Date;
  }>;
}

interface LiveBroadcastDashboardProps {
  broadcastId?: string;
}

export const LiveBroadcastDashboard: React.FC<LiveBroadcastDashboardProps> = ({ broadcastId }) => {
  const [metrics, setMetrics] = useState<BroadcastMetrics>({
    status: 'live',
    panelists: { total: 12, connected: 11, disconnected: 1 },
    viewers: { total: 4250, active: 3890, peakConcurrent: 5120 },
    commercials: { played: 8, scheduled: 4, currentlyPlaying: 'UN WCS 30s Spot' },
    engagement: { surveyResponses: 342, chatMessages: 1256, callIns: 23 },
    technical: {
      audioQuality: 'excellent',
      videoQuality: 'excellent',
      latency: 45,
      bandwidth: 8.5,
    },
    errors: [
      {
        id: 'err-1',
        type: 'connection',
        message: 'Panelist Dr. Jane Smith experienced brief connection drop',
        severity: 'warning',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
  });

  const [isPaused, setIsPaused] = useState(false);
  const [showEmergencyOverride, setShowEmergencyOverride] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        viewers: {
          ...prev.viewers,
          active: Math.max(3000, prev.viewers.active + Math.floor(Math.random() * 200 - 100)),
        },
        engagement: {
          ...prev.engagement,
          surveyResponses: prev.engagement.surveyResponses + Math.floor(Math.random() * 5),
          chatMessages: prev.engagement.chatMessages + Math.floor(Math.random() * 10),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600">LIVE</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-600">SCHEDULED</Badge>;
      case 'ended':
        return <Badge className="bg-gray-600">ENDED</Badge>;
      default:
        return <Badge>UNKNOWN</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Broadcast Control</h1>
          <p className="text-gray-600 mt-1">UN WCS Parallel Event - March 17, 2026</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(metrics.status)}
          <div className="text-sm text-gray-600">
            <p>Uptime: 2h 34m</p>
            <p>Started: 9:00 AM UTC</p>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Active Alerts ({metrics.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.errors.map((error) => (
              <div key={error.id} className="flex items-start justify-between p-3 bg-white rounded border border-red-200">
                <div>
                  <p className="font-medium text-sm">{error.message}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {error.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {error.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panelists */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Panelists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.panelists.connected}</div>
            <p className="text-xs text-gray-600 mt-1">
              of {metrics.panelists.total} connected
            </p>
            {metrics.panelists.disconnected > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {metrics.panelists.disconnected} disconnected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Viewers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Active Viewers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.viewers.active.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              Peak: {metrics.viewers.peakConcurrent.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>Surveys: {metrics.engagement.surveyResponses}</p>
              <p>Chat: {metrics.engagement.chatMessages}</p>
              <p>Call-ins: {metrics.engagement.callIns}</p>
            </div>
          </CardContent>
        </Card>

        {/* Commercials */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Commercials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.commercials.played}</div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.commercials.scheduled} scheduled
            </p>
            {metrics.commercials.currentlyPlaying && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                Now: {metrics.commercials.currentlyPlaying}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technical Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Audio Quality</p>
              <p className={`text-lg font-semibold capitalize ${getQualityColor(metrics.technical.audioQuality)}`}>
                {metrics.technical.audioQuality}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Video Quality</p>
              <p className={`text-lg font-semibold capitalize ${getQualityColor(metrics.technical.videoQuality)}`}>
                {metrics.technical.videoQuality}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Latency</p>
              <p className="text-lg font-semibold">{metrics.technical.latency}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bandwidth</p>
              <p className="text-lg font-semibold">{metrics.technical.bandwidth} Mbps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant={isPaused ? 'default' : 'outline'}
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Resume Broadcast
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Broadcast
                </>
              )}
            </Button>
            <Button variant="outline">Adjust Audio Levels</Button>
            <Button variant="outline">Switch Camera</Button>
            <Button variant="outline">Manage Panelists</Button>
          </div>

          {/* Emergency Override */}
          <div className="border-t pt-4">
            <Button
              onClick={() => setShowEmergencyOverride(!showEmergencyOverride)}
              variant="destructive"
              className="gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Emergency Broadcast Override
            </Button>

            {showEmergencyOverride && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-900 mb-3">
                  Emergency Override - Proceed with caution
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Cut All Audio
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Cut All Video
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Emergency Shutdown
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Panelist Status */}
      <Card>
        <CardHeader>
          <CardTitle>Panelist Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'Dr. Jane Smith', status: 'connected', audio: 'on', video: 'on' },
              { name: 'Prof. Michael Chen', status: 'connected', audio: 'on', video: 'on' },
              { name: 'Dr. Sarah Johnson', status: 'connected', audio: 'on', video: 'off' },
              { name: 'Dr. Ahmed Hassan', status: 'disconnected', audio: 'off', video: 'off' },
            ].map((panelist, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{panelist.name}</p>
                  <p className="text-xs text-gray-600">
                    Audio: {panelist.audio === 'on' ? '✓' : '✗'} | Video: {panelist.video === 'on' ? '✓' : '✗'}
                  </p>
                </div>
                <Badge variant={panelist.status === 'connected' ? 'default' : 'secondary'}>
                  {panelist.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">14:32</span> - Commercial "UN WCS 30s Spot" started
            </p>
            <p className="text-gray-600">
              <span className="font-medium">14:30</span> - 45 new survey responses received
            </p>
            <p className="text-gray-600">
              <span className="font-medium">14:28</span> - Panelist Dr. Ahmed Hassan reconnected
            </p>
            <p className="text-gray-600">
              <span className="font-medium">14:25</span> - Viewer count reached peak of 5,120
            </p>
            <p className="text-gray-600">
              <span className="font-medium">14:20</span> - Broadcast started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveBroadcastDashboard;
