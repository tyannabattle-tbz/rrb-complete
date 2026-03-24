'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';
import { webAudioService, AudioLevels } from '@/lib/webAudioService';
import { AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export default function PodcastRecordingStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [guests, setGuests] = useState<Array<{ name: string; email: string; connected: boolean }>>([]);
  const [audioLevels, setAudioLevels] = useState<AudioLevels>({ host: 0, guest1: 0, music: 0, sfx: 0 });
  const [microphoneGain, setMicrophoneGain] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const levelMonitorRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active podcast projects
  const { data: projects } = trpc.podcastStudio.getEpisodeAnalytics.useQuery(
    { episodeId: selectedProject || '' },
    { enabled: !!selectedProject }
  );

  // Recording mutations
  const startRecordingMutation = trpc.podcastStudio.startRecordingSession.useMutation();
  const endRecordingMutation = trpc.podcastStudio.endRecordingSession.useMutation();
  const recordGuestMutation = trpc.podcastStudio.recordGuestAudio.useMutation();

  // Initialize Web Audio API on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        await webAudioService.initialize();
        setAudioInitialized(true);
        setAudioError(null);
        console.log('[Recording Studio] Web Audio initialized');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to initialize audio';
        setAudioError(message);
        console.error('[Recording Studio] Audio initialization error:', error);
      }
    };

    initAudio();

    return () => {
      webAudioService.cleanup();
    };
  }, []);

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

  // Monitor audio levels during recording
  useEffect(() => {
    if (!isRecording || !audioInitialized) return;

    levelMonitorRef.current = setInterval(() => {
      const levels = webAudioService.getLevels();
      setAudioLevels(levels);
    }, 100);

    return () => {
      if (levelMonitorRef.current) {
        clearInterval(levelMonitorRef.current);
      }
    };
  }, [isRecording, audioInitialized]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (!audioInitialized) {
      setAudioError('Audio not initialized. Please refresh the page.');
      return;
    }

    try {
      // Resume audio context if suspended
      await webAudioService.resumeContext();

      // Start Web Audio recording
      webAudioService.startRecording();

      // Start server-side recording if project selected
      if (selectedProject) {
        await startRecordingMutation.mutateAsync({ projectId: selectedProject });
      }

      setIsRecording(true);
      setRecordingTime(0);
      setAudioError(null);
      console.log('[Recording Studio] Recording started');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start recording';
      setAudioError(message);
      console.error('[Recording Studio] Start recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      // Stop Web Audio recording
      const audioBlob = await webAudioService.stopRecording();
      setRecordedBlob(audioBlob);

      // Stop server-side recording if project selected
      if (selectedProject) {
        await endRecordingMutation.mutateAsync({ projectId: selectedProject });
      }

      setIsRecording(false);
      setAudioError(null);
      console.log('[Recording Studio] Recording stopped');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop recording';
      setAudioError(message);
      console.error('[Recording Studio] Stop recording error:', error);
    }
  };

  const handlePlayback = async () => {
    if (!recordedBlob) {
      setAudioError('No recording available to play');
      return;
    }

    try {
      await webAudioService.playAudio(recordedBlob);
      console.log('[Recording Studio] Playback completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to play audio';
      setAudioError(message);
      console.error('[Recording Studio] Playback error:', error);
    }
  };

  const handleMicrophoneGainChange = (value: number[]) => {
    const newGain = value[0];
    setMicrophoneGain(newGain);
    webAudioService.setMicrophoneGain(newGain);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      webAudioService.unmute();
    } else {
      webAudioService.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleAddGuest = async (name: string, email: string) => {
    if (selectedProject) {
      try {
        await recordGuestMutation.mutateAsync({
          sessionId: selectedProject,
          guestName: name,
          guestEmail: email,
        });
        setGuests([...guests, { name, email, connected: true }]);
      } catch (error) {
        console.error('[Recording Studio] Failed to add guest:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcast Recording Studio</h1>
          <p className="text-slate-400">Professional multi-track recording with Web Audio API</p>
        </div>

        {/* Audio Status Alert */}
        {audioError && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Audio Error</p>
              <p className="text-red-300 text-sm">{audioError}</p>
            </div>
          </div>
        )}

        {!audioInitialized && !audioError && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400">Initializing audio system...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Recording Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recording Control</CardTitle>
                <CardDescription>Web Audio API - Real-time audio capture</CardDescription>
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
                    {!isRecording && recordedBlob && (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 font-semibold">READY TO PUBLISH</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    Audio Context: <span className="text-slate-300 font-mono">{webAudioService.getState()}</span>
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="bg-slate-700 rounded-lg p-4 h-24 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-full w-full">
                    {[...Array(40)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t transition-all ${
                          isRecording ? '' : 'opacity-40'
                        }`}
                        style={{
                          height: `${isRecording ? Math.random() * 100 : 20}%`,
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
                      disabled={!audioInitialized}
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
                  {recordedBlob && (
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600 h-12"
                      onClick={handlePlayback}
                    >
                      ▶ Playback
                    </Button>
                  )}
                </div>

                {/* Microphone Controls */}
                <div className="space-y-4 bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Microphone Controls
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Gain Level</span>
                      <span className="text-white text-sm font-semibold">{(microphoneGain * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[microphoneGain]}
                      onValueChange={handleMicrophoneGainChange}
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-slate-600"
                    onClick={handleToggleMute}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Mute
                      </>
                    )}
                  </Button>
                </div>

                {/* Track Levels */}
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Track Levels</h3>
                  {[
                    { name: 'Host', level: audioLevels.host },
                    { name: 'Guest 1', level: audioLevels.guest1 },
                    { name: 'Music', level: audioLevels.music },
                    { name: 'SFX', level: audioLevels.sfx },
                  ].map(track => (
                    <div key={track.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">{track.name}</span>
                        <span className="text-white text-sm font-semibold">{track.level.toFixed(1)}%</span>
                      </div>
                      <Progress value={track.level} className="h-2" />
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
              <Button className="bg-purple-600 hover:bg-purple-700" disabled={!recordedBlob}>
                📝 Add Metadata
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" disabled={!recordedBlob}>
                📤 Upload to Cloud
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" disabled={!recordedBlob}>
                🚀 Publish Episode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
