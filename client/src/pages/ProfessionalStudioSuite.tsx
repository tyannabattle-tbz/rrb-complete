'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Mic,
  Settings,
  Play,
  Pause,
  Square,
  Sliders,
  Layers,
  Zap,
  Download,
  Share2,
  Eye,
  Volume2,
  Radio,
  Maximize,
  Minimize,
} from 'lucide-react';

interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  duration: number;
  startTime: number;
}

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
  {
    name: 'Noir',
    description: 'Classic black and white',
    colors: { shadows: '#000000', midtones: '#808080', highlights: '#ffffff' },
  },
];

export default function ProfessionalStudioSuite() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3600);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const mockTracks: TimelineTrack[] = [
    { id: '1', type: 'video', name: 'Main Camera', duration: 3600, startTime: 0 },
    { id: '2', type: 'audio', name: 'Microphone', duration: 3600, startTime: 0 },
    { id: '3', type: 'audio', name: 'Background Music', duration: 3600, startTime: 0 },
    { id: '4', type: 'text', name: 'Lower Third', duration: 1800, startTime: 600 },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Premium Studio Branding */}
        <div className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 mb-2">
                PROFESSIONAL STUDIO SUITE
              </h1>
              <p className="text-slate-300 text-lg">
                Cinematic Production. Legendary Quality. Your Vision, Amplified.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-red-900/30 text-red-300 border-red-500 px-4 py-2 text-sm">
                {isRecording ? '● RECORDING' : 'READY'}
              </Badge>
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-500 px-4 py-2 text-sm">
                4K • 60FPS
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Video Preview */}
          <div className="lg:col-span-3">
            <Card className="bg-black border-slate-700 overflow-hidden">
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                {/* Video Canvas */}
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${colorGradingPresets[selectedPreset].colors.shadows} 0%, ${colorGradingPresets[selectedPreset].colors.midtones} 50%, ${colorGradingPresets[selectedPreset].colors.highlights} 100%)`,
                  }}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/80 px-3 py-2 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-300 text-sm font-semibold">REC</span>
                  </div>
                )}

                {/* Playback Controls Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 rounded-full w-16 h-16 flex items-center justify-center"
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) {
                          videoRef.current.pause();
                        } else {
                          videoRef.current.play();
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
                {/* Progress Bar */}
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

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={() => setIsRecording(!isRecording)}
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

                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Mic className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => setShowEffects(!showEffects)}
                    >
                      <Sliders className="w-4 h-4" />
                    </Button>

                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Color Grading & Effects */}
          <div className="space-y-6">
            {/* Color Grading Presets */}
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
                      selectedPreset === idx
                        ? 'bg-purple-900/40 border border-purple-500'
                        : 'bg-slate-700 hover:bg-slate-600'
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

            {/* Quick Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Brightness', value: 75 },
                  { label: 'Contrast', value: 60 },
                  { label: 'Saturation', value: 80 },
                ].map((setting, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-xs font-semibold">{setting.label}</span>
                      <span className="text-white text-xs">{setting.value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={setting.value}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export 4K
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline Editor */}
        {showTimeline && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Timeline Editor
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600"
                  onClick={() => setShowTimeline(!showTimeline)}
                >
                  <Minimize className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTracks.map(track => (
                <div key={track.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {track.type === 'video' && <Video className="w-4 h-4 text-blue-400" />}
                      {track.type === 'audio' && <Mic className="w-4 h-4 text-green-400" />}
                      {track.type === 'text' && <Radio className="w-4 h-4 text-yellow-400" />}
                      <span className="text-white text-sm font-semibold">{track.name}</span>
                    </div>
                    <span className="text-slate-400 text-xs">{formatTime(track.duration)}</span>
                  </div>
                  <div className="relative h-12 bg-slate-700 rounded overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 opacity-70"
                      style={{
                        width: `${(track.duration / duration) * 100}%`,
                        marginLeft: `${(track.startTime / duration) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
