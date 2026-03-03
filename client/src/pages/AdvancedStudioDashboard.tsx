import React, { useState, useEffect } from 'react';
import { FuturisticCard, FuturisticButton } from '@/components/FuturisticDesignSystem';
import { ARGlassInterface } from '@/components/ARGlassInterface';
import { voiceCommandService } from '@/services/voiceCommandService';
import { arGlassService } from '@/services/arGlassService';
import { predictiveAnalyticsService } from '@/services/predictiveAnalyticsService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Mic,
  Video,
  Radio,
  Settings,
  Eye,
  Zap,
  Volume2,
  Headphones,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';

export default function AdvancedStudioDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Studio Controls
  const [audioLevel, setAudioLevel] = useState([75]);
  const [videoQuality, setVideoQuality] = useState('4k');
  const [bitrate, setBitrate] = useState('25 Mbps');
  const [fps, setFps] = useState(60);

  // Metrics
  const [metrics, setMetrics] = useState({
    viewers: 1247,
    bitrate: '25.4 Mbps',
    fps: 60,
    resolution: '4K UHD (3840x2160)',
    uptime: '2h 15m',
    quality: 'Excellent',
    cpuUsage: 45,
    gpuUsage: 62,
    networkHealth: 98,
  });

  // Advanced Features
  const [predictions, setPredictions] = useState<any>(null);
  const [arStatus, setARStatus] = useState(arGlassService.getARStatus());

  useEffect(() => {
    // Initialize voice commands
    voiceCommandService.registerCommand('start recording', () => {
      startRecording();
    }, 'Start recording');

    voiceCommandService.registerCommand('stop recording', () => {
      stopRecording();
    }, 'Stop recording');

    voiceCommandService.registerCommand('go live', () => {
      startStreaming();
    }, 'Start streaming');

    voiceCommandService.registerCommand('activate ar', () => {
      activateAR();
    }, 'Activate AR interface');

    // Fetch predictions
    const prediction = predictiveAnalyticsService.predictTaskOutcome('Podcast Recording', 8);
    setPredictions(prediction);

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        viewers: Math.floor(Math.random() * 5000) + 1000,
        cpuUsage: Math.floor(Math.random() * 80) + 20,
        gpuUsage: Math.floor(Math.random() * 85) + 15,
      }));
    }, 2000);

    return () => clearInterval(metricsInterval);
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    voiceCommandService.speak('Recording started');
  };

  const stopRecording = async () => {
    setIsRecording(false);
    voiceCommandService.speak('Recording stopped');
  };

  const startStreaming = async () => {
    setIsStreaming(true);
    voiceCommandService.speak('Stream started');
  };

  const stopStreaming = async () => {
    setIsStreaming(false);
    voiceCommandService.speak('Stream stopped');
  };

  const activateAR = async () => {
    const success = await arGlassService.initializeARSession();
    if (success) {
      setIsARActive(true);
      setARStatus(arGlassService.getARStatus());
      voiceCommandService.speak('AR interface activated');
    }
  };

  const toggleVoiceControl = () => {
    if (!voiceActive) {
      voiceCommandService.startListening((transcript) => {
        console.log('Voice command:', transcript);
      });
      setVoiceActive(true);
      voiceCommandService.speak('Voice control activated');
    } else {
      voiceCommandService.stopListening();
      setVoiceActive(false);
      voiceCommandService.speak('Voice control deactivated');
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${
        fullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Advanced Studio Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Professional Broadcasting • AR Glasses • AI Orchestration</p>
            </div>
            <div className="flex gap-2">
              <Badge
                className={`${
                  isStreaming
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isStreaming ? '🔴 LIVE' : '⚫ OFFLINE'}
              </Badge>
              <Badge
                className={`${
                  isRecording
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isRecording ? '🟠 RECORDING' : '⚫ IDLE'}
              </Badge>
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
              >
                {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Live Monitor */}
        <div className="mb-8">
          <FuturisticCard holographic className="aspect-video bg-black/50 border-2 border-cyan-500/30 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto text-cyan-400 mb-4 animate-pulse" />
                <p className="text-cyan-400 font-mono">Live Monitor • 4K UHD • {metrics.fps} FPS</p>
                <p className="text-slate-400 text-sm mt-2">
                  {isStreaming ? `${metrics.viewers} viewers watching` : 'Ready for broadcast'}
                </p>
              </div>
            </div>
          </FuturisticCard>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="controls" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-purple-500/30">
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="ar" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              AR Glasses
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice
            </TabsTrigger>
          </TabsList>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FuturisticCard glow="cyan">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Recording Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <FuturisticButton
                      variant={isRecording ? 'secondary' : 'primary'}
                      onClick={() => (isRecording ? stopRecording() : startRecording())}
                      className="flex-1"
                    >
                      {isRecording ? '⏹ Stop' : '⏺ Record'}
                    </FuturisticButton>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Quality</label>
                    <select
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value)}
                      className="w-full mt-2 bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white"
                    >
                      <option>1080p HD</option>
                      <option>2K</option>
                      <option>4k</option>
                      <option>8K</option>
                    </select>
                  </div>
                </CardContent>
              </FuturisticCard>

              <FuturisticCard glow="magenta">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="w-5 h-5" />
                    Streaming Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <FuturisticButton
                      variant={isStreaming ? 'secondary' : 'primary'}
                      onClick={() => (isStreaming ? stopStreaming() : startStreaming())}
                      className="flex-1"
                    >
                      {isStreaming ? '🔴 Stop' : '🟢 Go Live'}
                    </FuturisticButton>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Bitrate</label>
                    <select
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                      className="w-full mt-2 bg-slate-700 border border-purple-500/30 rounded px-3 py-2 text-white"
                    >
                      <option>10 Mbps</option>
                      <option>15 Mbps</option>
                      <option>25 Mbps</option>
                      <option>50 Mbps</option>
                    </select>
                  </div>
                </CardContent>
              </FuturisticCard>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Viewers', value: metrics.viewers, color: 'text-cyan-400' },
                { label: 'Bitrate', value: metrics.bitrate, color: 'text-pink-400' },
                { label: 'FPS', value: metrics.fps, color: 'text-purple-400' },
                { label: 'Resolution', value: metrics.resolution, color: 'text-green-400' },
                { label: 'Uptime', value: metrics.uptime, color: 'text-yellow-400' },
                { label: 'Quality', value: metrics.quality, color: 'text-emerald-400' },
              ].map((metric, idx) => (
                <FuturisticCard key={idx} glow="cyan">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">{metric.label}</p>
                    <p className={`text-2xl font-bold ${metric.color} mt-2`}>{metric.value}</p>
                  </CardContent>
                </FuturisticCard>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'CPU Usage', value: metrics.cpuUsage, color: 'from-cyan-500 to-blue-500' },
                { label: 'GPU Usage', value: metrics.gpuUsage, color: 'from-purple-500 to-pink-500' },
                { label: 'Network', value: metrics.networkHealth, color: 'from-green-500 to-emerald-500' },
              ].map((metric, idx) => (
                <FuturisticCard key={idx} glow="cyan">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">{metric.label}</p>
                    <div className="mt-3 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${metric.color}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <p className="text-lg font-bold text-white mt-2">{metric.value}%</p>
                  </CardContent>
                </FuturisticCard>
              ))}
            </div>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-4">
            <FuturisticCard glow="cyan">
              <CardHeader>
                <CardTitle>Audio Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-slate-400">Master Volume</label>
                    <span className="text-sm font-mono text-cyan-400">{audioLevel[0]}%</span>
                  </div>
                  <Slider value={audioLevel} onValueChange={setAudioLevel} max={100} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['Left Channel', 'Right Channel'].map((channel, idx) => (
                    <div key={idx}>
                      <p className="text-sm text-slate-400 mb-2">{channel}</p>
                      <div className="bg-slate-700 rounded p-3">
                        <div className="flex gap-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-8 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-sm"
                              style={{ opacity: Math.random() * 0.8 + 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FuturisticButton variant="secondary">🎙️ Mic Boost</FuturisticButton>
                  <FuturisticButton variant="secondary">🔊 Normalize</FuturisticButton>
                  <FuturisticButton variant="secondary">🎚️ EQ</FuturisticButton>
                  <FuturisticButton variant="secondary">🔇 Mute</FuturisticButton>
                </div>
              </CardContent>
            </FuturisticCard>
          </TabsContent>

          {/* AR Glasses Tab */}
          <TabsContent value="ar" className="space-y-4">
            <FuturisticCard glow="magenta" holographic>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  AR Glasses Interface
                </CardTitle>
                <CardDescription>WebXR • Holographic Display • Voice Control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded border border-purple-500/30">
                  <p className="text-sm text-slate-300 mb-2">AR Status: {arStatus}</p>
                  <div className="flex gap-2">
                    <FuturisticButton
                      variant={isARActive ? 'secondary' : 'primary'}
                      onClick={activateAR}
                      className="flex-1"
                    >
                      {isARActive ? '✓ AR Active' : '📱 Activate AR'}
                    </FuturisticButton>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FuturisticButton variant="secondary">📊 Show Metrics</FuturisticButton>
                  <FuturisticButton variant="secondary">🔮 Show Predictions</FuturisticButton>
                  <FuturisticButton variant="secondary">🎯 Show Controls</FuturisticButton>
                  <FuturisticButton variant="secondary">📡 Show Status</FuturisticButton>
                </div>

                {predictions && (
                  <div className="p-3 bg-purple-900/30 rounded border border-purple-500/30">
                    <p className="text-sm text-slate-300 mb-2">Success Prediction</p>
                    <p className="text-lg font-bold text-purple-400">
                      {(predictions.successProbability * 100).toFixed(0)}% Success Rate
                    </p>
                  </div>
                )}
              </CardContent>
            </FuturisticCard>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-4">
            <FuturisticCard glow="cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Command Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <FuturisticButton
                    variant={voiceActive ? 'secondary' : 'primary'}
                    onClick={toggleVoiceControl}
                    className="flex-1"
                  >
                    {voiceActive ? '🎤 Stop Listening' : '🎙️ Start Listening'}
                  </FuturisticButton>
                </div>

                <div className="p-4 bg-slate-700/50 rounded border border-cyan-500/30">
                  <p className="text-sm text-slate-400 mb-3">Available Commands:</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>• "Start recording" - Begin recording</p>
                    <p>• "Stop recording" - Stop recording</p>
                    <p>• "Go live" - Start streaming</p>
                    <p>• "Activate AR" - Enable AR interface</p>
                    <p>• "Show metrics" - Display metrics in AR</p>
                    <p>• "Show predictions" - Display predictions</p>
                  </div>
                </div>
              </CardContent>
            </FuturisticCard>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <FuturisticButton variant="secondary" className="w-full">
            🎬 New Podcast
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="w-full">
            📞 Call-In
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="w-full">
            🤖 AI Assistant
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="w-full">
            ⚙️ Settings
          </FuturisticButton>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-slate-900/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Advanced Studio Dashboard • Professional Broadcasting • AR Glasses • Voice Control • AI Orchestration</p>
          <p className="mt-2">Powered by QUMUS • RRB Radio • HybridCast Emergency</p>
        </div>
      </footer>
    </div>
  );
}
