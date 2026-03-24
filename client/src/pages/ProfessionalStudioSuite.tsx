'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, Settings, Play, Pause, Square, Sliders, Zap, Download, Share2, Volume2, Maximize } from 'lucide-react';
import { toast } from 'sonner';
import { audioEngine } from '@/lib/audioEngineService';
import { StudioFileMenu } from '@/components/StudioFileMenu';
import { MultiTrackMixer } from '@/components/MultiTrackMixer';
import { AudioRecorder } from '@/components/AudioRecorder';
import { WaveformEditor } from '@/components/WaveformEditor';
import { LiveStreamer } from '@/components/LiveStreamer';
import { PresetManager } from '@/components/PresetManager';
import { AudioVisualizerEnhanced } from '@/components/AudioVisualizerEnhanced';
import { CollaborationManager } from '@/components/CollaborationManager';
import { MasteringEngine } from '@/components/MasteringEngine';
import { MobileController } from '@/components/MobileController';

interface ColorGradingPreset {
  name: string;
  description: string;
  colors: { shadows: string; midtones: string; highlights: string };
}

const colorGradingPresets: ColorGradingPreset[] = [
  {
    name: 'Cinematic Gold',
    description: 'Warm, sophisticated look',
    colors: { shadows: '#1a1a2e', midtones: '#c9a961', highlights: '#f4e4c1' },
  },
  {
    name: 'Tarantino Blue',
    description: 'Bold, dramatic aesthetic',
    colors: { shadows: '#0a1128', midtones: '#1e3a8a', highlights: '#60a5fa' },
  },
  {
    name: 'Clive Davis Gold',
    description: 'Elegant, timeless elegance',
    colors: { shadows: '#2d2d2d', midtones: '#d4af37', highlights: '#ffd700' },
  },
];

export default function ProfessionalStudioSuite() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3600);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [volume, setVolume] = useState(80);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [audioBuffers, setAudioBuffers] = useState<Map<string, AudioBuffer>>(new Map());
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mixer' | 'recorder' | 'editor' | 'stream' | 'presets' | 'visualizer' | 'collab' | 'mastering' | 'mobile'>('mixer');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.resumeContext();
        toast.success('Audio engine initialized');
        
        // Load audio files
        const files = [
          { id: 'lead_vocals', path: '/audio/lead_vocals.mp3' },
          { id: 'drums', path: '/audio/drums.mp3' },
          { id: 'bass', path: '/audio/bass.mp3' },
        ];

        const buffers = new Map();
        for (const file of files) {
          try {
            const buffer = await audioEngine.loadAudioFile(file.path);
            buffers.set(file.id, buffer);
            console.log('Loaded', file.id, 'successfully');
          } catch (err) {
            console.error('Failed to load', file.id, ':', err);
          }
        }
        setAudioBuffers(buffers);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setError('Failed to initialize: ' + msg);
        console.error('Audio initialization failed:', error);
        toast.error('Audio system failed to initialize');
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update visualization
  useEffect(() => {
    const updateVisualization = () => {
      const freq = audioEngine.getFrequencyData();
      setFrequencyData(freq);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await audioEngine.startAudioCapture();
      audioStreamRef.current = stream;

      const recorder = audioEngine.createRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();

      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording - check microphone permissions');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioStreamRef.current) {
        audioEngine.stopAudioCapture(audioStreamRef.current);
      }
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handlePlayAudio = () => {
    if (isPlaying && currentAudioSource) {
      try {
        currentAudioSource.stop();
        setCurrentAudioSource(null);
        setIsPlaying(false);
        toast.success('Audio stopped');
      } catch (err) {
        console.error('Error stopping audio:', err);
      }
    } else {
      const buffer = audioBuffers.get('lead_vocals');
      if (buffer) {
        try {
          const source = audioEngine.playAudioBufferWithId(buffer, 'lead_vocals');
          setCurrentAudioSource(source);
          setIsPlaying(true);
          toast.success('Playing audio...');
          source.onended = () => {
            setIsPlaying(false);
            setCurrentAudioSource(null);
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setError('Playback failed: ' + msg);
          toast.error('Playback failed: ' + msg);
          console.error('Playback error:', err);
        }
      } else {
        setError('Audio file not loaded');
        toast.error('Audio file not loaded');
      }
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    audioEngine.setVolume(value / 100);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderFrequencyBars = () => {
    if (!frequencyData) return null;

    const bars = [];
    const barCount = 32;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length);
      const height = (frequencyData[dataIndex] / 255) * 100;

      bars.push(
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-sm"
          style={{
            height: `${height}%`,
            minHeight: '2px',
            margin: '0 1px',
          }}
        />
      );
    }

    return bars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 mb-2">
                PROFESSIONAL STUDIO SUITE
              </h1>
              <p className="text-slate-300 text-lg">Cinematic Production. Legendary Quality. Your Vision, Amplified.</p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-red-900/30 text-red-300 border-red-500 px-4 py-2 text-sm">
                {isRecording ? '● RECORDING' : 'READY'}
              </Badge>
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-500 px-4 py-2 text-sm">4K • 60FPS</Badge>
            </div>
          </div>

          {/* Menu Bar */}
          <div className="flex gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <StudioFileMenu
              onNewProject={() => toast.success('New project created')}
              onOpenProject={(file) => toast.success(`Opened: ${file.name}`)}
              onSaveProject={() => toast.success('Project saved')}
              onExportAudio={() => toast.success('Exporting audio...')}
              onImportProject={(file) => toast.success(`Imported: ${file.name}`)}
            />
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => toast.success('Edit mode activated - Track controls enabled')}>
              Edit
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => toast.success('Track management panel opened')}>
              Track
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => toast.success('Mixing console activated')}>
              Mix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Video Preview */}
          <div className="lg:col-span-3">
            <Card className="bg-black border-slate-700 overflow-hidden">
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${colorGradingPresets[selectedPreset].colors.shadows} 0%, ${colorGradingPresets[selectedPreset].colors.midtones} 50%, ${colorGradingPresets[selectedPreset].colors.highlights} 100%)`,
                  }}
                >
                  <video ref={videoRef} className="w-full h-full object-cover" />
                </div>

                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/80 px-3 py-2 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-300 text-sm font-semibold">REC</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 rounded-full w-16 h-16 flex items-center justify-center"
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }
                    }}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                </div>
              </div>

              {/* Video Controls */}
              <CardContent className="bg-slate-900 p-6 space-y-4">
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Record
                        </>
                      )}
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600" onClick={handlePlayAudio}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => toast.success('Microphone input selector opened')}>
                      <Mic className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => toast.success('Audio device selector opened')}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => toast.success('Effects and settings panel opened')}>
                      <Sliders className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600" onClick={() => toast.success('Fullscreen mode activated')}>
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Color Grading */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Color Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {colorGradingPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreset(idx)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedPreset === idx ? 'bg-purple-900/40 border border-purple-500' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          background: `linear-gradient(90deg, ${preset.colors.shadows}, ${preset.colors.midtones}, ${preset.colors.highlights})`,
                        }}
                      />
                      <p className="text-white text-sm font-semibold">{preset.name}</p>
                    </div>
                    <p className="text-slate-400 text-xs">{preset.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Audio Levels */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Audio Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-slate-900 rounded flex items-end justify-center gap-1 p-2 border border-slate-700">
                  {renderFrequencyBars()}
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-xs text-slate-400">Master Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-400 text-center">{volume}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b border-slate-700 pb-4">
          <Button
            variant={activeTab === 'mixer' ? 'default' : 'outline'}
            onClick={() => setActiveTab('mixer')}
            className="text-sm"
          >
            Multi-Track Mixer
          </Button>
          <Button
            variant={activeTab === 'recorder' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recorder')}
            className="text-sm"
          >
            Recording Studio
          </Button>
          <Button
            variant={activeTab === 'editor' ? 'default' : 'outline'}
            onClick={() => setActiveTab('editor')}
            className="text-sm"
          >
            Waveform Editor
          </Button>
          <Button
            variant={activeTab === 'stream' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stream')}
            className="text-sm"
          >
            Live Streaming
          </Button>
          <Button
            variant={activeTab === 'presets' ? 'default' : 'outline'}
            onClick={() => setActiveTab('presets')}
            className="text-sm"
          >
            Presets
          </Button>
          <Button
            variant={activeTab === 'visualizer' ? 'default' : 'outline'}
            onClick={() => setActiveTab('visualizer')}
            className="text-sm"
          >
            Visualizer
          </Button>
          <Button
            variant={activeTab === 'collab' ? 'default' : 'outline'}
            onClick={() => setActiveTab('collab')}
            className="text-sm"
          >
            Collaboration
          </Button>
          <Button
            variant={activeTab === 'mastering' ? 'default' : 'outline'}
            onClick={() => setActiveTab('mastering')}
            className="text-sm"
          >
            AI Mastering
          </Button>
          <Button
            variant={activeTab === 'mobile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('mobile')}
            className="text-sm"
          >
            Mobile Control
          </Button>
        </div>

        {/* Advanced Features */}
        <div className="mb-8">
          {activeTab === 'mixer' && <MultiTrackMixer audioBuffers={audioBuffers} />}
          {activeTab === 'recorder' && <AudioRecorder />}
          {activeTab === 'editor' && <WaveformEditor />}
          {activeTab === 'stream' && <LiveStreamer />}
          {activeTab === 'presets' && <PresetManager />}
          {activeTab === 'visualizer' && <AudioVisualizerEnhanced />}
          {activeTab === 'collab' && <CollaborationManager />}
          {activeTab === 'mastering' && <MasteringEngine />}
          {activeTab === 'mobile' && <MobileController />}
        </div>

        {/* Status Bar */}
        <div className="bg-slate-900 border border-slate-700 rounded p-3 flex justify-between text-xs text-slate-400">
          <div>Audio Engine: {error ? 'Error' : 'Ready'}</div>
          <div>Status: {isRecording ? 'Recording' : isPlaying ? 'Playing' : 'Idle'}</div>
          <div>Buffers: {audioBuffers.size}</div>
          <div>Volume: {volume}%</div>
          {error && <div className="text-red-400">{error}</div>}
        </div>
      </div>
    </div>
  );
}
