import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mic, MicOff, Video, VideoOff, Users, MessageSquare, Eye, Activity } from 'lucide-react';

interface Panelist {
  id: string;
  name: string;
  status: 'connecting' | 'connected' | 'speaking' | 'muted';
  videoEnabled: boolean;
  audioEnabled: boolean;
  bitrate: number;
  latency: number;
}

interface StreamMetrics {
  viewers: number;
  bitrate: number;
  fps: number;
  cpuUsage: number;
  memoryUsage: number;
  frameDrops: number;
}

interface QAMetrics {
  totalQuestions: number;
  pendingQuestions: number;
  approvedQuestions: number;
  answeredQuestions: number;
}

export default function ModeratorDashboard() {
  const [panelists, setPanelists] = useState<Panelist[]>([
    {
      id: '1',
      name: 'You (Main Moderator)',
      status: 'connected',
      videoEnabled: true,
      audioEnabled: true,
      bitrate: 2500,
      latency: 25,
    },
    {
      id: '2',
      name: 'Ghana Partner 1',
      status: 'connecting',
      videoEnabled: false,
      audioEnabled: false,
      bitrate: 0,
      latency: 0,
    },
    {
      id: '3',
      name: 'Ghana Partner 2',
      status: 'connecting',
      videoEnabled: false,
      audioEnabled: false,
      bitrate: 0,
      latency: 0,
    },
  ]);

  const [streamMetrics, setStreamMetrics] = useState<StreamMetrics>({
    viewers: 0,
    bitrate: 5000,
    fps: 30,
    cpuUsage: 45,
    memoryUsage: 62,
    frameDrops: 0,
  });

  const [qaMetrics, setQAMetrics] = useState<QAMetrics>({
    totalQuestions: 0,
    pendingQuestions: 0,
    approvedQuestions: 0,
    answeredQuestions: 0,
  });

  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'live' | 'paused'>('idle');
  const [selectedPanelist, setSelectedPanelist] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamMetrics(prev => ({
        ...prev,
        viewers: Math.floor(Math.random() * 50000),
        cpuUsage: 40 + Math.random() * 20,
        memoryUsage: 55 + Math.random() * 15,
        frameDrops: Math.floor(Math.random() * 3),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const togglePanelistMute = (panelistId: string) => {
    setPanelists(prev =>
      prev.map(p =>
        p.id === panelistId
          ? { ...p, audioEnabled: !p.audioEnabled }
          : p
      )
    );
  };

  const togglePanelistVideo = (panelistId: string) => {
    setPanelists(prev =>
      prev.map(p =>
        p.id === panelistId
          ? { ...p, videoEnabled: !p.videoEnabled }
          : p
      )
    );
  };

  const setSpeaker = (panelistId: string) => {
    setPanelists(prev =>
      prev.map(p =>
        p.id === panelistId
          ? { ...p, status: 'speaking' }
          : { ...p, status: 'connected' }
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'speaking':
        return 'bg-blue-100 text-blue-800';
      case 'muted':
        return 'bg-yellow-100 text-yellow-800';
      case 'connecting':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Broadcast Control Center</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => setBroadcastStatus(broadcastStatus === 'idle' ? 'live' : 'idle')}
                variant={broadcastStatus === 'live' ? 'destructive' : 'default'}
                size="lg"
              >
                {broadcastStatus === 'idle' ? '🔴 Go Live' : '⏹ Stop Broadcast'}
              </Button>
              {broadcastStatus === 'live' && (
                <Button
                  onClick={() => setBroadcastStatus('paused')}
                  variant="outline"
                  size="lg"
                >
                  ⏸ Pause
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${broadcastStatus === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-lg font-semibold">
              Status: {broadcastStatus === 'idle' ? 'Ready' : broadcastStatus === 'live' ? 'LIVE' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Panelists Management */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Panelists ({panelists.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {panelists.map(panelist => (
                    <div
                      key={panelist.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedPanelist === panelist.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPanelist(panelist.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{panelist.name}</h3>
                          <Badge className={getStatusColor(panelist.status)}>
                            {panelist.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-300">
                          <div>Bitrate: {panelist.bitrate} kbps</div>
                          <div>Latency: {panelist.latency}ms</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant={panelist.audioEnabled ? 'default' : 'destructive'}
                          onClick={() => togglePanelistMute(panelist.id)}
                          className="gap-2"
                        >
                          {panelist.audioEnabled ? (
                            <>
                              <Mic className="w-4 h-4" /> Unmute
                            </>
                          ) : (
                            <>
                              <MicOff className="w-4 h-4" /> Muted
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant={panelist.videoEnabled ? 'default' : 'destructive'}
                          onClick={() => togglePanelistVideo(panelist.id)}
                          className="gap-2"
                        >
                          {panelist.videoEnabled ? (
                            <>
                              <Video className="w-4 h-4" /> Video On
                            </>
                          ) : (
                            <>
                              <VideoOff className="w-4 h-4" /> Video Off
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant={panelist.status === 'speaking' ? 'default' : 'outline'}
                          onClick={() => setSpeaker(panelist.id)}
                        >
                          🎤 Make Speaker
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stream Metrics */}
          <div>
            <Card className="bg-gray-800 border-gray-700 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Stream Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">CPU Usage</span>
                    <span className="font-semibold">{streamMetrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        streamMetrics.cpuUsage > 80
                          ? 'bg-red-500'
                          : streamMetrics.cpuUsage > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${streamMetrics.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Memory Usage</span>
                    <span className="font-semibold">{streamMetrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        streamMetrics.memoryUsage > 80
                          ? 'bg-red-500'
                          : streamMetrics.memoryUsage > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${streamMetrics.memoryUsage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Viewers</span>
                    <span className="font-semibold">{streamMetrics.viewers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Bitrate</span>
                    <span className="font-semibold">{streamMetrics.bitrate} kbps</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">FPS</span>
                    <span className="font-semibold">{streamMetrics.fps}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {streamMetrics.frameDrops > 0 && (
              <Card className="bg-red-900/30 border-red-700">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm">
                      {streamMetrics.frameDrops} frame drops detected
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Q&A Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Audience Q&A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{qaMetrics.totalQuestions}</div>
                <div className="text-sm text-gray-300">Total Questions</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{qaMetrics.pendingQuestions}</div>
                <div className="text-sm text-gray-300">Pending Review</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{qaMetrics.approvedQuestions}</div>
                <div className="text-sm text-gray-300">Approved</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{qaMetrics.answeredQuestions}</div>
                <div className="text-sm text-gray-300">Answered</div>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full" size="lg">
                📋 Manage Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
