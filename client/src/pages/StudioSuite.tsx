import React, { useState, useRef } from 'react';
import { Music, Mic, Volume2, Settings, Save, Play, Pause, Square, Sliders, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function StudioSuite() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [tracks, setTracks] = useState<Array<{ id: string; name: string; duration: number; level: number }>>([
    { id: '1', name: 'Vocals', duration: 0, level: -12 },
    { id: '2', name: 'Drums', duration: 0, level: -15 },
    { id: '3', name: 'Bass', duration: 0, level: -10 },
    { id: '4', name: 'Guitar', duration: 0, level: -8 },
  ]);
  const [masterVolume, setMasterVolume] = useState(-6);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    toast.success('Recording started');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    toast.success(`Recording saved: ${recordingTime}s`);
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? 'Playback paused' : 'Playback started');
  };

  const handleSaveProject = () => {
    const projectData = {
      name: `RRB_Studio_${new Date().toISOString().split('T')[0]}`,
      tracks,
      masterVolume,
      timestamp: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = projectData.name + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Project saved successfully');
  };

  const updateTrackLevel = (id: string, level: number) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, level } : track
    ));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Studio Suite
            </h1>
          </div>
          <p className="text-gray-300">Professional recording, mixing, and production tools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recording Controls */}
            <Card className="bg-slate-800/50 border-pink-500/20 p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-pink-400" />
                  Recording
                </h2>
                
                {/* Time Display */}
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-4xl font-mono font-bold text-pink-400">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {isRecording ? 'Recording...' : 'Ready to record'}
                  </div>
                </div>

                {/* Recording Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>Input Level</span>
                    <span>-6dB</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 w-3/4"></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex-1 gap-2 ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePlay}
                    variant="outline"
                    className="flex-1 gap-2 border-pink-500/50 text-pink-300 hover:bg-pink-500/10"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mixing Board */}
            <Card className="bg-slate-800/50 border-pink-500/20 p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Sliders className="w-5 h-5 text-pink-400" />
                Mixing Board
              </h2>

              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">{track.name}</span>
                      <span className="text-xs text-gray-400">{track.level}dB</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="0"
                      value={track.level}
                      onChange={(e) => updateTrackLevel(track.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                ))}

                {/* Master Volume */}
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">Master Volume</span>
                    <span className="text-xs text-gray-400">{masterVolume}dB</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-pink-500/20 p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-pink-400" />
                Actions
              </h2>
              <div className="space-y-3">
                <Button
                  onClick={handleSaveProject}
                  className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="w-4 h-4" />
                  Save Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-pink-500/50 text-pink-300 hover:bg-pink-500/10"
                >
                  <Activity className="w-4 h-4" />
                  Export Audio
                </Button>
              </div>
            </Card>

            {/* Studio Stats */}
            <Card className="bg-slate-800/50 border-pink-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Studio Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={isRecording ? 'text-red-400 font-semibold' : 'text-green-400'}>
                    {isRecording ? 'Recording' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tracks</span>
                  <span className="text-gray-300">{tracks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Master Level</span>
                  <span className="text-gray-300">{masterVolume}dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recording Time</span>
                  <span className="text-gray-300">{formatTime(recordingTime)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
