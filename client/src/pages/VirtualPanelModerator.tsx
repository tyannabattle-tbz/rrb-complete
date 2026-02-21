import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Mic, MicOff, Video, VideoOff, Play, Pause, Square, Settings,
  Users, Radio, AlertCircle, CheckCircle, Clock, Zap
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Panelist {
  id: string;
  name: string;
  role: 'moderator' | 'panelist';
  isMuted: boolean;
  isSpeaking: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export default function VirtualPanelModerator() {
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<'scheduled' | 'live' | 'paused' | 'ended'>('scheduled');
  const [panelists, setPanelists] = useState<Panelist[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [newPanelistName, setNewPanelistName] = useState('');
  const [sessionStats, setSessionStats] = useState({
    totalPanelists: 0,
    connectedPanelists: 0,
    activeSpeaker: null as string | null,
    sessionDuration: 0,
  });

  // Fetch session data
  const { data: session } = trpc.virtualPanel.getSession.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  // Fetch panelists
  const { data: fetchedPanelists } = trpc.virtualPanel.getPanelists.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  // Fetch stats
  const { data: stats } = trpc.virtualPanel.getStats.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  // Mutations
  const addPanelistMutation = trpc.virtualPanel.addPanelist.useMutation();
  const toggleMuteMutation = trpc.virtualPanel.toggleMute.useMutation();
  const setSpeakerMutation = trpc.virtualPanel.setSpeaker.useMutation();
  const startSessionMutation = trpc.virtualPanel.startSession.useMutation();
  const pauseSessionMutation = trpc.virtualPanel.pauseSession.useMutation();
  const endSessionMutation = trpc.virtualPanel.endSession.useMutation();
  const startRecordingMutation = trpc.virtualPanel.startRecording.useMutation();
  const stopRecordingMutation = trpc.virtualPanel.stopRecording.useMutation();

  // Update panelists when fetched
  useEffect(() => {
    if (fetchedPanelists) {
      setPanelists(fetchedPanelists as Panelist[]);
    }
  }, [fetchedPanelists]);

  // Update stats
  useEffect(() => {
    if (stats) {
      setSessionStats(stats);
      setActiveSpeaker(stats.activeSpeaker);
    }
  }, [stats]);

  const handleAddPanelist = async () => {
    if (!newPanelistName.trim() || !sessionId) return;

    await addPanelistMutation.mutateAsync({
      sessionId,
      name: newPanelistName,
    });

    setNewPanelistName('');
  };

  const handleToggleMute = async (panelistId: string) => {
    if (!sessionId) return;

    await toggleMuteMutation.mutateAsync({
      sessionId,
      panelistId,
    });
  };

  const handleSetSpeaker = async (panelistId: string) => {
    if (!sessionId) return;

    await setSpeakerMutation.mutateAsync({
      sessionId,
      panelistId,
    });

    setActiveSpeaker(panelistId);
  };

  const handleStartSession = async () => {
    if (!sessionId) return;

    await startSessionMutation.mutateAsync({ sessionId });
    setSessionStatus('live');
  };

  const handlePauseSession = async () => {
    if (!sessionId) return;

    await pauseSessionMutation.mutateAsync({ sessionId });
    setSessionStatus('paused');
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    await endSessionMutation.mutateAsync({ sessionId });
    setSessionStatus('ended');
  };

  const handleStartRecording = async () => {
    if (!sessionId) return;

    await startRecordingMutation.mutateAsync({ sessionId });
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;

    await stopRecordingMutation.mutateAsync({ sessionId });
    setIsRecording(false);
  };

  const getConnectionBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500">Connecting...</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500">Disconnected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎙️ Virtual Panel Moderator</h1>
          <p className="text-slate-400">UN WCS Parallel Event - March 17th, 2026</p>
        </div>

        {/* Session Setup */}
        {!sessionId && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create or Join Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter session ID or create new"
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setSessionId((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                onClick={() => setSessionId(`session-${Date.now()}`)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Create New Session
              </Button>
            </CardContent>
          </Card>
        )}

        {sessionId && (
          <>
            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Session Status */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-400" />
                    Session Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      sessionStatus === 'live' ? 'bg-red-500 animate-pulse' :
                      sessionStatus === 'paused' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-white font-semibold capitalize">{sessionStatus}</span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleStartSession}
                      disabled={sessionStatus === 'live'}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      onClick={handlePauseSession}
                      disabled={sessionStatus !== 'live'}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={handleEndSession}
                      disabled={sessionStatus === 'ended'}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recording */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-white font-semibold">
                      {isRecording ? 'Recording' : 'Not Recording'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleStartRecording}
                      disabled={isRecording || sessionStatus !== 'live'}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Start Recording
                    </Button>
                    <Button
                      onClick={handleStopRecording}
                      disabled={!isRecording}
                      className="w-full bg-slate-700 hover:bg-slate-600"
                    >
                      Stop Recording
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Total Panelists</p>
                    <p className="text-2xl font-bold text-white">{sessionStats.totalPanelists}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Connected</p>
                    <p className="text-2xl font-bold text-green-400">{sessionStats.connectedPanelists}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="text-sm text-white">
                      {Math.floor(sessionStats.sessionDuration / 1000)}s
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Panelist */}
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Add Panelist</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Panelist name"
                  value={newPanelistName}
                  onChange={(e) => setNewPanelistName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPanelist()}
                />
                <Button
                  onClick={handleAddPanelist}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add
                </Button>
              </CardContent>
            </Card>

            {/* Panelists List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Panelists</CardTitle>
                <CardDescription className="text-slate-400">
                  {panelists.length} panelists in session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {panelists.map(panelist => (
                    <div key={panelist.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{panelist.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{panelist.role}</p>
                        </div>
                        {getConnectionBadge(panelist.connectionStatus)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleToggleMute(panelist.id)}
                          className={panelist.isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                          {panelist.isMuted ? (
                            <MicOff className="w-4 h-4 mr-1" />
                          ) : (
                            <Mic className="w-4 h-4 mr-1" />
                          )}
                          {panelist.isMuted ? 'Muted' : 'Unmuted'}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleSetSpeaker(panelist.id)}
                          className={activeSpeaker === panelist.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-500'}
                        >
                          {activeSpeaker === panelist.id ? '🎤 Speaking' : 'Set Speaker'}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {panelists.length === 0 && (
                    <p className="text-slate-400 text-center py-8">No panelists yet. Add some to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
