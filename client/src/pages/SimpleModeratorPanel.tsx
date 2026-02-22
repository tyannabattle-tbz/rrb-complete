import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Radio, Users, Mic, MicOff, Eye, EyeOff } from 'lucide-react';

interface Panelist {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'speaking';
  isMuted: boolean;
}

export const SimpleModeratorPanel: React.FC = () => {
  const [streamStatus, setStreamStatus] = useState<'idle' | 'live' | 'paused'>('live');
  const [panelists, setPanelists] = useState<Panelist[]>([
    { id: '1', name: 'You (Main Host)', status: 'speaking', isMuted: false },
    { id: '2', name: 'Ghana Partner 1', status: 'connected', isMuted: false },
    { id: '3', name: 'Ghana Partner 2', status: 'connected', isMuted: true },
  ]);
  const [viewerCount, setViewerCount] = useState(2847);
  const [streamHealth, setStreamHealth] = useState('excellent');

  const toggleMute = (id: string) => {
    setPanelists(
      panelists.map(p =>
        p.id === id ? { ...p, isMuted: !p.isMuted } : p
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'speaking':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'connected':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Main Controls */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h1 className="text-2xl font-bold mb-4">Broadcast Control Panel</h1>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Stream Status */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600">Stream</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 capitalize">
              {streamStatus}
            </div>
            <div className="text-xs text-gray-500 mt-1">Status</div>
          </div>

          {/* Viewers */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-600">Viewers</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(viewerCount / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500 mt-1">Watching live</div>
          </div>

          {/* Stream Health */}
          <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-600">Health</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 capitalize">
              {streamHealth}
            </div>
            <div className="text-xs text-gray-500 mt-1">Connection</div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className={`flex-1 ${
              streamStatus === 'live'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
            onClick={() =>
              setStreamStatus(streamStatus === 'live' ? 'paused' : 'live')
            }
          >
            {streamStatus === 'live' ? '⏹ Stop Broadcast' : '▶ Start Broadcast'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => setStreamStatus('paused')}
          >
            ⏸ Pause
          </Button>
        </div>
      </Card>

      {/* Panelists Control */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Panelists
        </h2>

        <div className="space-y-3">
          {panelists.map((panelist) => (
            <div
              key={panelist.id}
              className={`p-4 rounded-lg border-2 ${getStatusColor(
                panelist.status
              )} flex items-center justify-between`}
            >
              <div>
                <div className="font-semibold">{panelist.name}</div>
                <div className="text-xs opacity-75 capitalize">
                  {panelist.status === 'speaking'
                    ? '🔴 Speaking'
                    : panelist.status === 'connected'
                    ? '🟢 Connected'
                    : '⚪ Disconnected'}
                </div>
              </div>

              <Button
                size="sm"
                variant={panelist.isMuted ? 'destructive' : 'outline'}
                onClick={() => toggleMute(panelist.id)}
              >
                {panelist.isMuted ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1" />
                    Muted
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" />
                    Unmuted
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-amber-50">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            📋 Show Slides
          </Button>
          <Button variant="outline" className="justify-start">
            💬 Enable Chat
          </Button>
          <Button variant="outline" className="justify-start">
            ❓ Show Q&A
          </Button>
          <Button variant="outline" className="justify-start">
            🎙️ Test Audio
          </Button>
        </div>
      </Card>

      {/* Emergency Controls */}
      <Card className="p-4 bg-red-50 border-2 border-red-200">
        <Button
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          🚨 EMERGENCY STOP
        </Button>
        <p className="text-xs text-red-600 mt-2 text-center">
          Immediately stops all streams and alerts all platforms
        </p>
      </Card>
    </div>
  );
};

export default SimpleModeratorPanel;
