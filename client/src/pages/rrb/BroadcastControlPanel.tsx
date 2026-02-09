/**
 * Broadcast Control Panel
 * Real-time broadcast management interface for operators
 * Schedule, start/stop broadcasts, manage music, insert commercials
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  Square,
  Radio,
  Music,
  Zap,
  Send,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface BroadcastSession {
  broadcastId: string;
  title: string;
  status: 'scheduled' | 'live' | 'paused' | 'completed';
  startTime: Date;
  endTime: Date;
  viewers: number;
  engagement: number;
}

export default function BroadcastControlPanel() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'control' | 'music' | 'chat'>('schedule');
  const [currentBroadcast, setCurrentBroadcast] = useState<BroadcastSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'live' as const,
    channels: ['website'] as string[],
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-foreground/70">You must be logged in to access the broadcast control panel.</p>
        </Card>
      </div>
    );
  }

  const handleCreateBroadcast = async () => {
    setIsLoading(true);
    try {
      // Create broadcast via tRPC
      console.log('Creating broadcast:', broadcastForm);
      // await trpc.broadcast.createBroadcast.mutate({...})
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating broadcast:', error);
      setIsLoading(false);
    }
  };

  const handleStartBroadcast = async () => {
    if (!currentBroadcast) return;
    setIsLoading(true);
    try {
      // Update broadcast status via tRPC
      console.log('Starting broadcast:', currentBroadcast.broadcastId);
      // await trpc.broadcast.updateBroadcastStatus.mutate({...})
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting broadcast:', error);
      setIsLoading(false);
    }
  };

  const handleSendChatCommand = async () => {
    if (!chatInput.trim() || !currentBroadcast) return;
    setIsLoading(true);
    try {
      // Process chat command via tRPC
      console.log('Sending command:', chatInput);
      // await trpc.broadcast.processChatCommand.mutate({...})
      setChatInput('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending command:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Broadcast Control Panel</h1>
          <p className="text-foreground/70">
            Welcome, {user?.name}. Manage your broadcasts in real-time.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              {[
                { id: 'schedule', label: 'Schedule', icon: Clock },
                { id: 'control', label: 'Control', icon: Radio },
                { id: 'music', label: 'Music', icon: Music },
                { id: 'chat', label: 'Chat Commands', icon: Send },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Schedule New Broadcast</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      placeholder="Broadcast title"
                      value={broadcastForm.title}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      placeholder="Broadcast description"
                      value={broadcastForm.description}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={broadcastForm.startTime}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, startTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <Input
                        type="datetime-local"
                        value={broadcastForm.endTime}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Broadcast Type</label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="live">Live</option>
                      <option value="prerecorded">Pre-recorded</option>
                      <option value="streaming">Streaming</option>
                      <option value="podcast">Podcast</option>
                      <option value="radio">Radio</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleCreateBroadcast}
                    disabled={isLoading || !broadcastForm.title}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Create Broadcast
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Control Tab */}
            {activeTab === 'control' && (
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Broadcast Controls</h3>

                {currentBroadcast ? (
                  <div className="space-y-4">
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <p className="text-sm text-foreground/70 mb-1">Current Broadcast</p>
                      <p className="text-xl font-bold">{currentBroadcast.title}</p>
                      <p className="text-sm text-foreground/70 mt-2">
                        Status:{' '}
                        <span
                          className={`font-semibold ${
                            currentBroadcast.status === 'live'
                              ? 'text-green-500'
                              : currentBroadcast.status === 'paused'
                                ? 'text-yellow-500'
                                : 'text-foreground/70'
                          }`}
                        >
                          {currentBroadcast.status.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={handleStartBroadcast}
                        disabled={isLoading || currentBroadcast.status === 'live'}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isLoading || currentBroadcast.status !== 'live'}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isLoading || currentBroadcast.status === 'completed'}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button variant="destructive" disabled={isLoading}>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Emergency Stop
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Radio className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
                    <p className="text-foreground/70">No active broadcast selected</p>
                  </div>
                )}
              </Card>
            )}

            {/* Music Tab */}
            {activeTab === 'music' && (
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Music Management</h3>
                <div className="text-center py-8">
                  <Music className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
                  <p className="text-foreground/70">Music playlist management coming soon</p>
                </div>
              </Card>
            )}

            {/* Chat Commands Tab */}
            {activeTab === 'chat' && (
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold">Natural Language Commands</h3>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-sm text-foreground/70">
                      Example: "Start streaming to YouTube and Twitch"
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-sm text-foreground/70">
                      Example: "Insert 30-second commercial break in 5 minutes"
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter command..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatCommand()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendChatCommand}
                    disabled={isLoading || !chatInput.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Live Stats */}
          <div className="space-y-6">
            {/* Live Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Live Metrics</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Viewers
                    </span>
                    <span className="text-2xl font-bold">
                      {currentBroadcast?.viewers.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min((currentBroadcast?.viewers || 0) / 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground/70 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Engagement
                    </span>
                    <span className="text-2xl font-bold">
                      {currentBroadcast?.engagement.toFixed(1) || '0'}%
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${currentBroadcast?.engagement || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/70">Status</span>
                    <span className="flex items-center gap-2">
                      {currentBroadcast?.status === 'live' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-green-500">LIVE</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-foreground/30 rounded-full" />
                          <span className="text-sm font-semibold text-foreground/70">OFFLINE</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Music className="w-4 h-4 mr-2" />
                  Manage Playlist
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
