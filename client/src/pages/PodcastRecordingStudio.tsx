import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

export default function PodcastRecordingStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [guests, setGuests] = useState<Array<{ name: string; email: string; connected: boolean }>>([]);

  // Fetch active podcast projects
  const { data: projects } = trpc.podcastStudio.getEpisodeAnalytics.useQuery(
    { episodeId: selectedProject || '' },
    { enabled: !!selectedProject }
  );

  // Start recording mutation
  const startRecordingMutation = trpc.podcastStudio.startRecordingSession.useMutation();
  const endRecordingMutation = trpc.podcastStudio.endRecordingSession.useMutation();
  const recordGuestMutation = trpc.podcastStudio.recordGuestAudio.useMutation();

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (selectedProject) {
      await startRecordingMutation.mutateAsync({ projectId: selectedProject });
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    // End recording session
  };

  const handleAddGuest = async (name: string, email: string) => {
    if (selectedProject) {
      await recordGuestMutation.mutateAsync({
        sessionId: selectedProject,
        guestName: name,
        guestEmail: email,
      });
      setGuests([...guests, { name, email, connected: true }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcast Recording Studio</h1>
          <p className="text-slate-400">Professional multi-track recording and live streaming</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Recording Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recording Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recording Status */}
                <div className="bg-slate-700 rounded-lg p-6 text-center">
                  <div className="text-6xl font-bold text-white font-mono mb-4">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {isRecording && (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400 font-semibold">RECORDING</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="bg-slate-700 rounded-lg p-4 h-24 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-full">
                    {[...Array(40)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all ${
                          isRecording ? 'animate-pulse' : ''
                        }`}
                        style={{
                          height: `${Math.random() * 100}%`,
                          opacity: isRecording ? 0.8 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex gap-4">
                  {!isRecording ? (
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-lg"
                      onClick={handleStartRecording}
                    >
                      ● Start Recording
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-slate-600 hover:bg-slate-700 h-12 text-lg"
                      onClick={handleStopRecording}
                    >
                      ⏹ Stop Recording
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 border-slate-600 h-12">
                    ⏸ Pause
                  </Button>
                </div>

                {/* Track Levels */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Track Levels</h3>
                  {['Host', 'Guest 1', 'Music', 'SFX'].map((track, idx) => (
                    <div key={track}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">{track}</span>
                        <span className="text-white text-sm font-semibold">-12dB</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guests & Settings */}
          <div className="space-y-6">
            {/* Guest Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Guests</CardTitle>
                <CardDescription>Connected participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {guests.length === 0 ? (
                  <p className="text-slate-400 text-sm">No guests connected</p>
                ) : (
                  guests.map((guest, idx) => (
                    <div key={idx} className="bg-slate-700 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{guest.name}</p>
                        <p className="text-slate-400 text-xs">{guest.email}</p>
                      </div>
                      <Badge className={guest.connected ? 'bg-green-600' : 'bg-red-600'}>
                        {guest.connected ? 'Live' : 'Offline'}
                      </Badge>
                    </div>
                  ))
                )}
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                  + Invite Guest
                </Button>
              </CardContent>
            </Card>

            {/* Call-In Feature */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Call-In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm mb-2">Call-in Number</p>
                  <p className="text-white text-2xl font-bold font-mono">+1 (555) 123-4567</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-2">Waiting Callers</p>
                  <p className="text-white font-semibold">3 callers in queue</p>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Accept Next Caller
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-slate-600 justify-start">
                    🤖 Research Assistant
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 justify-start">
                    🎙️ Moderator Bot
                  </Button>
                  <Button variant="outline" className="w-full border-slate-600 justify-start">
                    ✏️ Content Editor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Game */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Interactive</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  🎮 Launch Game Screen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Episode Publishing */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Episode Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                📝 Add Metadata
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                🎯 Generate Chapters
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                🚀 Publish to All Platforms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
