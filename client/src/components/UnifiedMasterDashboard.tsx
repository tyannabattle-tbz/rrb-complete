'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, Radio, Video, Zap, Settings, 
  Play, Pause, Square, Volume2, Eye, Cpu, Activity, AlertCircle 
} from 'lucide-react';

interface PerformanceMetric {
  label: string;
  audioValue: number;
  videoValue: number;
  unit: string;
}

export function UnifiedMasterDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(75);
  const [videoQuality, setVideoQuality] = useState('1080p');

  const metrics: PerformanceMetric[] = [
    { label: 'Listeners/Viewers', audioValue: 2847, videoValue: 5234, unit: 'users' },
    { label: 'Bitrate', audioValue: 320, videoValue: 8500, unit: 'kbps' },
    { label: 'Latency', audioValue: 45, videoValue: 120, unit: 'ms' },
    { label: 'Engagement', audioValue: 92, videoValue: 88, unit: '%' },
  ];

  const platforms = [
    { name: 'YouTube', status: 'live', viewers: 3200, bitrate: '5000 kbps' },
    { name: 'Twitch', status: 'live', viewers: 1500, bitrate: '6000 kbps' },
    { name: 'Facebook', status: 'live', viewers: 534, bitrate: '4000 kbps' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-8 h-8 text-amber-400" />
          Unified Master Dashboard
        </h2>
        <p className="text-slate-400">Complete audio + video production control center</p>
      </div>

      {/* Master Controls */}
      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-900/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-green-400" />
              Master Control
            </span>
            <Badge className={isRecording ? 'bg-red-500/20 text-red-300' : 'bg-slate-600/20 text-slate-300'}>
              {isRecording ? 'RECORDING' : 'STANDBY'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRecording(!isRecording)}
              className={isRecording ? 'flex-1 bg-red-600 hover:bg-red-700' : 'flex-1 bg-green-600 hover:bg-green-700'}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            <Button variant="outline" className="border-slate-600">
              <Pause className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="border-slate-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Audio/Video Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4" />
                Audio Level
              </label>
              <input
                type="range"
                value={audioLevel}
                onChange={(e) => setAudioLevel(parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full"
              />
              <p className="text-xs text-amber-400 mt-1">{audioLevel}%</p>
            </div>
            <div>
              <label className="text-sm text-slate-300 flex items-center gap-2 mb-2">
                <Video className="w-4 h-4" />
                Video Quality
              </label>
              <select
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white text-sm"
              >
                <option>720p</option>
                <option>1080p</option>
                <option>1440p</option>
                <option>4K</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-400 mb-2">{metric.label}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    Audio
                  </span>
                  <span className="text-sm font-semibold text-amber-400">
                    {metric.audioValue} {metric.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Video
                  </span>
                  <span className="text-sm font-semibold text-cyan-400">
                    {metric.videoValue} {metric.unit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Status */}
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="w-5 h-5 text-purple-400" />
            Multi-Platform Broadcasting
          </CardTitle>
          <CardDescription>Real-time streaming across all platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {platforms.map((platform, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-sm">{platform.name}</p>
                  <p className="text-xs text-slate-400">{platform.bitrate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-400">{platform.viewers}</p>
                <p className="text-xs text-slate-400">viewers</p>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-600/30">
            <p className="text-xs text-slate-400">
              Total Viewers: <span className="text-amber-400 font-semibold">5,234</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">CPU Usage</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
              <span className="text-amber-400 w-10 text-right">45%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Memory</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
              <span className="text-amber-400 w-10 text-right">62%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Network</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-700/50 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '38%' }} />
              </div>
              <span className="text-amber-400 w-10 text-right">38%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          Save Snapshot
        </Button>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <BarChart3 className="w-4 h-4 mr-2" />
          Export Metrics
        </Button>
      </div>

      {/* Alerts */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="pt-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-300 font-semibold">Performance Tip</p>
            <p className="text-xs text-amber-200 mt-1">
              Video bitrate is optimal. Consider increasing audio bitrate to 192 kbps for better quality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
