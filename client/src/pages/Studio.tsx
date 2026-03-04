"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  Settings,
  Eye,
  Film,
  Radio,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Download,
  Share2,
  Edit3,
  Maximize2,
  Minimize2,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Music,
  MapPin,
  Heart,
  Upload,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import TimelineEditor from "@/components/TimelineEditor";
import BatchProcessing from "@/components/BatchProcessing";
import EditingPresets from "@/components/EditingPresets";
import RecordingControls from "@/components/RecordingControls";

/**
 * Professional Studio Component
 * State-of-the-art media production interface with:
 * - Live monitoring (HybridCast network + stream metrics)
 * - Control panels (playback, audio, stream settings)
 * - Media management (library, scheduling, content)
 * - Advanced editing (video adjustments, effects, export)
 */
export default function Studio() {
  const [activeTab, setActiveTab] = useState("monitors");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(3600);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [recordingActive, setRecordingActive] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);

  // Fetch live metrics from backend
  const { data: liveMetrics } = trpc.entertainment.studioStreaming.getLiveMetrics.useQuery(
    undefined,
    { refetchInterval: 1000 }
  );

  // HybridCast network monitoring
  const { data: networkStatus } = trpc.entertainment.studioStreaming.getNetworkHealth.useQuery(
    undefined,
    { refetchInterval: 2000 }
  );

  // Rockin Boogie content schedule
  const { data: contentSchedule } = trpc.entertainment.studioStreaming.getBroadcastSchedule.useQuery(
    { limit: 5 },
    { refetchInterval: 30000 }
  );

  // Mock data fallback
  const metrics = liveMetrics || {
    viewers: 1250,
    bitrate: "5.2 Mbps",
    fps: 60,
    resolution: "1920x1080",
    uptime: "2h 15m",
    quality: "Excellent",
  };

  const networkHealth = networkStatus || {
    isOnline: true,
    nodesOnline: 12,
    totalNodes: 15,
    coverage: 92,
    latency: "45ms",
    bandwidth: "98 Mbps",
  };

  const mediaLibrary = [
    { id: "1", name: "Rockin' Boogie Episode 1", duration: "45:30", size: "2.4 GB", date: "2026-02-04", type: "music" },
    { id: "2", name: "Sweet Miracles Fundraiser", duration: "1:23:15", size: "5.8 GB", date: "2026-02-03", type: "broadcast" },
    { id: "3", name: "HybridCast Network Test", duration: "12:45", size: "890 MB", date: "2026-02-02", type: "test" },
    { id: "4", name: "Emergency Alert Broadcast", duration: "8:20", size: "450 MB", date: "2026-02-01", type: "emergency" },
  ];

  const upcomingSchedule = contentSchedule || [
    { id: "1", title: "Rockin' Boogie Live", time: "14:00", type: "music", duration: "2h" },
    { id: "2", title: "Sweet Miracles Donation Drive", time: "16:00", type: "fundraiser", duration: "1h" },
    { id: "3", title: "HybridCast Network Check", time: "18:00", type: "test", duration: "30m" },
  ];

  const handleStartStream = async () => {
    // TODO: Connect to actual stream backend
    setStreamActive(true);
  };

  const handleStopStream = async () => {
    // TODO: Connect to actual stream backend
    setStreamActive(false);
  };

  const startRecordingMutation = trpc.entertainment.studioStreaming.startRecording.useMutation();
  const stopRecordingMutation = trpc.entertainment.studioStreaming.stopRecording.useMutation();

  const handleStartRecording = async () => {
    try {
      await startRecordingMutation.mutateAsync({
        title: "Studio Recording",
        description: "Professional studio recording",
        format: "mp4",
      });
      setRecordingActive(true);
    } catch (error) {
      console.error("Recording start failed:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (recordingActive) {
        await stopRecordingMutation.mutateAsync({
          recordingId: `rec_${Date.now()}`,
        });
      }
      setRecordingActive(false);
    } catch (error) {
      console.error("Recording stop failed:", error);
    }
  };

  return (
    <div className={`w-full ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "h-full"}`}>
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Professional Studio</h1>
                <p className="text-sm text-slate-400">HybridCast + Rockin' Boogie + Sweet Miracles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {streamActive && (
                <Badge className="bg-red-500 animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
              {recordingActive && (
                <Badge className="bg-orange-500 animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  RECORDING
                </Badge>
              )}
              {networkHealth.isOnline ? (
                <Badge className="bg-green-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  Network OK
                </Badge>
              ) : (
                <Badge className="bg-red-500">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Network Down
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-slate-300 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-8 bg-slate-800 border-b border-slate-700 rounded-none overflow-x-auto">
              <TabsTrigger value="monitors" className="rounded-none">
                <Eye className="w-4 h-4 mr-2" />
                Monitors
              </TabsTrigger>
              <TabsTrigger value="controls" className="rounded-none">
                <Settings className="w-4 h-4 mr-2" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="media" className="rounded-none">
                <Film className="w-4 h-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-none">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-none">
                <Zap className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="editing" className="rounded-none">
                <Edit3 className="w-4 h-4 mr-2" />
                Editing
              </TabsTrigger>
              <TabsTrigger value="presets" className="rounded-none">
                <Sparkles className="w-4 h-4 mr-2" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="batch" className="rounded-none">
                <Download className="w-4 h-4 mr-2" />
                Batch
              </TabsTrigger>
            </TabsList>

            {/* Monitors Tab */}
            <TabsContent value="monitors" className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Main Monitor */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800 border-slate-700 h-96">
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Play className="w-16 h-16 text-slate-600" />
                      <div className="absolute bottom-4 left-4 text-sm text-slate-300">
                        {streamActive ? "LIVE BROADCAST" : "Ready to broadcast"}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Metrics Sidebar */}
                <div className="space-y-4">
                  {/* Live Metrics */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Live Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-slate-400 uppercase">Viewers</div>
                        <div className="text-2xl font-bold text-white">{metrics.viewers.toLocaleString()}</div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                          <TrendingUp size={12} />
                          +12% from last hour
                        </div>
                      </div>
                      <div className="border-t border-slate-700 pt-3">
                        <div className="text-xs font-medium text-slate-400 uppercase">Bitrate</div>
                        <div className="text-xl font-bold text-blue-400">{metrics.bitrate}</div>
                      </div>
                      <div className="border-t border-slate-700 pt-3">
                        <div className="text-xs font-medium text-slate-400 uppercase">Quality</div>
                        <div className="text-lg font-bold text-green-400">{metrics.quality}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Network Status */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        HybridCast Network
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Nodes Online</span>
                        <span className="font-bold text-white">{networkHealth.nodesOnline}/{networkHealth.totalNodes}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Coverage</span>
                        <span className="font-bold text-green-400">{networkHealth.coverage}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Latency</span>
                        <span className="font-bold text-white">{networkHealth.latency}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Bandwidth</span>
                        <span className="font-bold text-blue-400">{networkHealth.bandwidth}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stream Controls */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleStartStream}
                      disabled={streamActive}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Stream
                    </Button>
                    <Button
                      onClick={handleStopStream}
                      disabled={!streamActive}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Stream
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-xs font-medium text-slate-400 uppercase mb-2">FPS</div>
                    <div className="text-2xl font-bold text-white">{metrics.fps}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-xs font-medium text-slate-400 uppercase mb-2">Resolution</div>
                    <div className="text-xl font-bold text-white">{metrics.resolution}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-xs font-medium text-slate-400 uppercase mb-2">Uptime</div>
                    <div className="text-xl font-bold text-white">{metrics.uptime}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-xs font-medium text-slate-400 uppercase mb-2">Status</div>
                    <Badge className="bg-green-500">Active</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recording Controls - Full Width */}
                <div className="lg:col-span-3">
                  <RecordingControls />
                </div>
                {/* Playback Controls */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Playback Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Timeline */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Timeline</label>
                      <Slider
                        value={[currentTime]}
                        onValueChange={(value) => setCurrentTime(value[0])}
                        max={duration}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, "0")}</span>
                        <span>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>
                      </div>
                    </div>

                    {/* Playback Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button
                        onClick={handleStartRecording}
                        disabled={recordingActive}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <Radio className="w-4 h-4 mr-2" />
                        Record
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Audio Controls */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Audio Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Volume */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Master Volume</label>
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => setVolume(value[0])}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-slate-400 w-8 text-right">{volume}%</span>
                      </div>
                    </div>

                    {/* Audio Levels */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Audio Levels</label>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Left Channel</div>
                          <div className="w-full bg-slate-700 rounded h-2">
                            <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded" style={{ width: "75%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Right Channel</div>
                          <div className="w-full bg-slate-700 rounded h-2">
                            <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded" style={{ width: "72%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Media Library</h2>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Media
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mediaLibrary.map((media) => (
                    <Card
                      key={media.id}
                      className={`bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors ${
                        selectedClipIds.includes(media.id) ? "border-blue-500 ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedMedia(media.id);
                        setSelectedClipIds((prev) =>
                          prev.includes(media.id)
                            ? prev.filter((id) => id !== media.id)
                            : [...prev, media.id]
                        );
                      }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-t-lg flex items-center justify-center relative">
                        <Film className="w-8 h-8 text-slate-600" />
                        {selectedClipIds.includes(media.id) && (
                          <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-blue-400" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                          {media.duration}
                        </div>
                      </div>
                      <CardContent className="pt-3">
                        <h3 className="font-medium text-white truncate text-sm">{media.name}</h3>
                        <div className="text-xs text-slate-400 mt-1">
                          {media.size} • {media.date}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedClipIds.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 text-sm text-blue-200">
                    <p className="font-medium">{selectedClipIds.length} clip(s) selected</p>
                    <p className="text-xs text-blue-300 mt-1">Go to the Presets tab to apply editing templates</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Broadcast Schedule</h2>

                <div className="space-y-3">
                  {upcomingSchedule.map((item) => (
                    <Card key={item.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.type === "music" && <Music className="w-5 h-5 text-purple-400" />}
                            {item.type === "fundraiser" && <Heart className="w-5 h-5 text-red-400" />}
                            {item.type === "test" && <Wifi className="w-5 h-5 text-blue-400" />}
                            <div>
                              <h3 className="font-medium text-white">{item.title}</h3>
                              <p className="text-sm text-slate-400">{item.time} • {item.duration}</p>
                            </div>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Editing Tab */}
            <TabsContent value="editing" className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Preview */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800 border-slate-700 h-96">
                    <div
                      className="w-full h-full bg-gradient-to-br from-slate-900 to-black rounded-lg flex items-center justify-center"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                      }}
                    >
                      <Film className="w-16 h-16 text-slate-600" />
                    </div>
                  </Card>
                </div>

                {/* Editing Tools */}
                <div className="space-y-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle>Editing Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Brightness */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Brightness</label>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value) => setBrightness(value[0])}
                          min={50}
                          max={150}
                          step={1}
                        />
                        <span className="text-xs text-slate-400">{brightness}%</span>
                      </div>

                      {/* Contrast */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Contrast</label>
                        <Slider
                          value={[contrast]}
                          onValueChange={(value) => setContrast(value[0])}
                          min={50}
                          max={150}
                          step={1}
                        />
                        <span className="text-xs text-slate-400">{contrast}%</span>
                      </div>

                      {/* Saturation */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Saturation</label>
                        <Slider
                          value={[saturation]}
                          onValueChange={(value) => setSaturation(value[0])}
                          min={0}
                          max={200}
                          step={1}
                        />
                        <span className="text-xs text-slate-400">{saturation}%</span>
                      </div>

                      {/* Export */}
                      <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
                        <Download className="w-4 h-4 mr-2" />
                        Export Video
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Editor Tab */}
            <TabsContent value="timeline" className="flex-1 overflow-auto p-6">
              <TimelineEditor
                onSave={(clips) => {
                  console.log("Timeline saved:", clips);
                }}
              />
            </TabsContent>

            {/* Editing Presets Tab */}
            <TabsContent value="presets" className="flex-1 overflow-auto p-6">
              <EditingPresets selectedClipIds={selectedClipIds} />
            </TabsContent>

            {/* Batch Processing Tab */}
            <TabsContent value="batch" className="flex-1 overflow-auto p-6">
              <BatchProcessing />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


