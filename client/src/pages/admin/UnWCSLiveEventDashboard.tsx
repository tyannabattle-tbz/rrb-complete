/**
 * UN WCS Live Event Integration Dashboard
 * Real-time broadcast monitoring, panelist tracking, commercial rotation, emergency controls
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Radio, Users, Zap, TrendingUp, Clock } from 'lucide-react';

export default function UnWCSLiveEventDashboard() {
  const { user } = useAuth();
  const [eventStatus, setEventStatus] = useState('LIVE');
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Mock real-time data
  const liveMetrics = {
    status: eventStatus,
    startTime: new Date('2026-03-17T09:00:00Z'),
    currentTime: new Date(),
    listeners: 5420000,
    activeChannels: 7,
    panelists: {
      total: 12,
      confirmed: 11,
      live: 10,
      pending: 1,
    },
    commercials: {
      scheduled: 8,
      played: 3,
      nextIn: 12,
    },
    engagement: {
      score: 9.2,
      sentiment: 'positive',
      comments: 45230,
      shares: 12450,
    },
  };

  const panelists = [
    { id: 1, name: 'Sheila Brown', status: 'live', role: 'Broadcaster', audio: 'on', video: 'on' },
    { id: 2, name: 'Tracey Bell', status: 'live', role: 'CEO', audio: 'on', video: 'on' },
    { id: 3, name: 'Tina Redmond', status: 'live', role: 'DJ/Owner', audio: 'on', video: 'on' },
    { id: 4, name: 'Cathy Hughes', status: 'live', role: 'Pioneer', audio: 'on', video: 'on' },
    { id: 5, name: 'Community Leader', status: 'standby', role: 'Guest', audio: 'off', video: 'off' },
  ];

  const commercials = [
    { id: 1, title: 'UN WCS - 30s', duration: 30, channels: 7, status: 'played', time: '09:05' },
    { id: 2, title: 'Sweet Miracles - 60s', duration: 60, channels: 7, status: 'played', time: '09:35' },
    { id: 3, title: 'Canryn Production - 30s', duration: 30, channels: 7, status: 'playing', time: '10:05' },
    { id: 4, title: 'RRB - 30s', duration: 30, channels: 7, status: 'scheduled', time: '10:35' },
  ];

  const channels = [
    { name: 'RRB Radio', listeners: 2100000, status: 'streaming', quality: '320kbps' },
    { name: 'YouTube Live', viewers: 1800000, status: 'streaming', quality: '1080p' },
    { name: 'HybridCast', listeners: 890000, status: 'streaming', quality: '128kbps' },
    { name: 'Spotify', listeners: 650000, status: 'streaming', quality: 'variable' },
    { name: 'Apple Podcasts', listeners: 420000, status: 'streaming', quality: 'variable' },
    { name: 'Twitter/X', viewers: 340000, status: 'streaming', quality: '720p' },
    { name: 'TikTok', viewers: 220000, status: 'streaming', quality: '480p' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">UN WCS Live Broadcast</h1>
          <p className="text-muted-foreground">March 17, 2026 • 9:00 AM UTC</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={eventStatus === 'LIVE' ? 'default' : 'secondary'} className="text-lg px-3 py-1">
            <Radio className="mr-2 h-4 w-4 animate-pulse" />
            {eventStatus}
          </Badge>
          <Button
            variant={emergencyMode ? 'destructive' : 'outline'}
            onClick={() => setEmergencyMode(!emergencyMode)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Emergency Override
          </Button>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Emergency broadcast mode activated. All commercial rotation paused. QUMUS autonomous control suspended.
            Manual override active.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listeners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(liveMetrics.listeners / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-green-600">↑ 12% from last event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.activeChannels}/7</div>
            <p className="text-xs text-green-600">All synchronized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Panelists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.panelists.live}/{liveMetrics.panelists.total}</div>
            <p className="text-xs text-green-600">{liveMetrics.panelists.confirmed} confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.engagement.score}/10</div>
            <p className="text-xs text-green-600">{liveMetrics.engagement.sentiment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="panelists" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="panelists">
            <Users className="mr-2 h-4 w-4" />
            Panelists
          </TabsTrigger>
          <TabsTrigger value="commercials">
            <Zap className="mr-2 h-4 w-4" />
            Commercials
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Radio className="mr-2 h-4 w-4" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Panelists Tab */}
        <TabsContent value="panelists">
          <Card>
            <CardHeader>
              <CardTitle>Live Panelists ({liveMetrics.panelists.live}/{liveMetrics.panelists.total})</CardTitle>
              <CardDescription>Real-time status and audio/video controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {panelists.map((panelist) => (
                  <div key={panelist.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{panelist.name}</h3>
                      <p className="text-sm text-muted-foreground">{panelist.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={panelist.status === 'live' ? 'default' : 'secondary'}>
                        {panelist.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {panelist.audio === 'on' ? '🎤 On' : '🎤 Off'}
                      </Button>
                      <Button size="sm" variant="outline">
                        {panelist.video === 'on' ? '📹 On' : '📹 Off'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercials Tab */}
        <TabsContent value="commercials">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Rotation</CardTitle>
              <CardDescription>QUMUS-orchestrated commercial scheduling and sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commercials.map((commercial) => (
                  <div key={commercial.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{commercial.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {commercial.duration}s • {commercial.channels} channels
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono">{commercial.time}</span>
                      <Badge
                        variant={
                          commercial.status === 'playing'
                            ? 'default'
                            : commercial.status === 'played'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {commercial.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Channels</CardTitle>
              <CardDescription>Real-time listener counts and stream quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground">{channel.quality}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">
                        {(
                          (channel.listeners || channel.viewers || 0) / 1000
                        ).toFixed(0)}K
                      </span>
                      <Badge variant="default">Streaming</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription>Engagement metrics and audience insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm">Engagement Score</h3>
                  <p className="text-2xl font-bold mt-2">{liveMetrics.engagement.score}/10</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm">Comments</h3>
                  <p className="text-2xl font-bold mt-2">{(liveMetrics.engagement.comments / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm">Shares</h3>
                  <p className="text-2xl font-bold mt-2">{(liveMetrics.engagement.shares / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-sm">Sentiment</h3>
                  <p className="text-2xl font-bold mt-2 text-green-600">
                    {liveMetrics.engagement.sentiment}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Controls</CardTitle>
          <CardDescription>QUMUS autonomous control with manual override</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="w-full">
              <Radio className="mr-2 h-4 w-4" />
              Pause Broadcast
            </Button>
            <Button className="w-full" variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Skip Commercial
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Mute Panelist
            </Button>
            <Button className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Extend Time
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
