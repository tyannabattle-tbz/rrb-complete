import React, { useState, useEffect } from "react";
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
} from "lucide-react";

/**
 * Professional Studio Component
 * State-of-the-art media production interface with live monitoring,
 * control panels, and editing capabilities
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

  // Mock live data
  const liveMetrics = {
    viewers: 1250,
    bitrate: "5.2 Mbps",
    fps: 60,
    resolution: "1920x1080",
    uptime: "2h 15m",
    quality: "Excellent",
  };

  const mediaLibrary = [
    { id: "1", name: "Rockin' Boogie Episode 1", duration: "45:30", size: "2.4 GB", date: "2026-02-04" },
    { id: "2", name: "Sweet Miracles Fundraiser", duration: "1:23:15", size: "5.8 GB", date: "2026-02-03" },
    { id: "3", name: "HybridCast Network Test", duration: "12:45", size: "890 MB", date: "2026-02-02" },
    { id: "4", name: "Emergency Alert Broadcast", duration: "8:20", size: "450 MB", date: "2026-02-01" },
  ];

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
                <p className="text-sm text-slate-400">State-of-the-art media production</p>
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
            <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 rounded-none">
              <TabsTrigger value="monitors" className="data-[state=active]:bg-slate-700">
                <Eye className="w-4 h-4 mr-2" />
                Live Monitors
              </TabsTrigger>
              <TabsTrigger value="controls" className="data-[state=active]:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-slate-700">
                <Film className="w-4 h-4 mr-2" />
                Media Library
              </TabsTrigger>
              <TabsTrigger value="editing" className="data-[state=active]:bg-slate-700">
                <Edit3 className="w-4 h-4 mr-2" />
                Editing
              </TabsTrigger>
            </TabsList>

            {/* Live Monitors Tab */}
            <TabsContent value="monitors" className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Main Monitor */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800 border-slate-700 h-96">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Main Output Monitor</CardTitle>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {streamActive ? "STREAMING" : "STANDBY"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="h-80 bg-black rounded flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                      <div className="text-center z-10">
                        <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">
                          {streamActive ? "Live Stream Active" : "Ready for broadcast"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Metrics */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Live Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Viewers</span>
                        <span className="text-white font-semibold">{liveMetrics.viewers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Bitrate</span>
                        <span className="text-white font-semibold">{liveMetrics.bitrate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">FPS</span>
                        <span className="text-white font-semibold">{liveMetrics.fps}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Resolution</span>
                        <span className="text-white font-semibold">{liveMetrics.resolution}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Uptime</span>
                        <span className="text-white font-semibold">{liveMetrics.uptime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Quality</span>
                        <Badge className="bg-green-500 text-xs">{liveMetrics.quality}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stream Status */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Stream Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setStreamActive(!streamActive)}
                      className={`w-full ${
                        streamActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {streamActive ? "Stop Stream" : "Start Stream"}
                    </Button>
                    <Button
                      onClick={() => setRecordingActive(!recordingActive)}
                      variant="outline"
                      className={`w-full ${recordingActive ? "border-orange-500 text-orange-400" : ""}`}
                    >
                      <Radio className="w-4 h-4 mr-2" />
                      {recordingActive ? "Stop Recording" : "Start Recording"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Playback Controls */}
                <Card className="bg-slate-800 border-slate-700 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-white">Playback Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, "0")}</span>
                        <span>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}</span>
                      </div>
                      <Slider
                        value={[currentTime]}
                        onValueChange={(val) => setCurrentTime(val[0])}
                        max={duration}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 w-16 h-16"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Volume Control */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <Slider
                        value={[volume]}
                        onValueChange={(val) => setVolume(val[0])}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-slate-400 w-8 text-right">{volume}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Audio Levels */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Audio Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Left</span>
                        <span>-6dB</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Right</span>
                        <span>-8dB</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stream Settings */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Stream Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Encoder</span>
                      <span className="text-white">H.264</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preset</span>
                      <span className="text-white">Fast</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rate Control</span>
                      <span className="text-white">CBR</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2 text-slate-300">
                      <Settings className="w-3 h-3 mr-2" />
                      Advanced Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Media Library Tab */}
            <TabsContent value="media" className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Media Library</h3>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Film className="w-4 h-4 mr-2" />
                    Upload Media
                  </Button>
                </div>

                <div className="grid gap-4">
                  {mediaLibrary.map((media) => (
                    <Card
                      key={media.id}
                      className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                        selectedMedia === media.id ? "border-blue-500 ring-2 ring-blue-500/50" : ""
                      }`}
                      onClick={() => setSelectedMedia(media.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-24 h-16 bg-slate-700 rounded flex items-center justify-center">
                              <Film className="w-8 h-8 text-slate-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{media.name}</h4>
                              <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                <span>{media.duration}</span>
                                <span>{media.size}</span>
                                <span>{media.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Video Editor</CardTitle>
                  </CardHeader>
                  <CardContent className="h-96 bg-black rounded flex items-center justify-center">
                    <div className="text-center">
                      <Edit3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Select a media file to edit</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Editing Tools */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Editing Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-slate-300">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Brightness
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-300">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Contrast
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-300">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Saturation
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-300">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Crop & Trim
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-300">
                      <Users className="w-4 h-4 mr-2" />
                      Add Watermark
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                      Export Video
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
