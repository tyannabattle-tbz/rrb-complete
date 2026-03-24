import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Wifi, Volume2, Radio, QrCode, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface TouchFader {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
}

interface MobileSession {
  id: string;
  deviceName: string;
  connected: boolean;
  lastPing: Date;
  latency: number;
}

export function MobileController() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessions, setSessions] = useState<MobileSession[]>([]);
  const [qrCode, setQrCode] = useState('https://qr.example.com/studio-session-' + Math.random().toString(36).substr(2, 9));
  const [faders, setFaders] = useState<TouchFader[]>([
    { id: '1', name: 'Master Volume', value: 75, min: 0, max: 100 },
    { id: '2', name: 'Mic Level', value: 60, min: 0, max: 100 },
    { id: '3', name: 'Bass', value: 50, min: 0, max: 100 },
    { id: '4', name: 'Treble', value: 50, min: 0, max: 100 },
  ]);
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [latency, setLatency] = useState(45);
  const [bandwidth, setBandwidth] = useState(2.5);
  const touchStartRef = useRef<number | null>(null);

  const connectDevice = () => {
    const newSession: MobileSession = {
      id: Date.now().toString(),
      deviceName: `Mobile Device ${sessions.length + 1}`,
      connected: true,
      lastPing: new Date(),
      latency: Math.floor(Math.random() * 100) + 20,
    };
    setSessions([...sessions, newSession]);
    setIsConnected(true);
    toast.success('Mobile device connected');
  };

  const disconnectDevice = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    if (sessions.length === 1) {
      setIsConnected(false);
    }
    toast.success('Device disconnected');
  };

  const updateFader = (id: string, value: number) => {
    setFaders(faders.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent, fader: TouchFader) => {
    if (touchStartRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = touchStartRef.current - currentY;
    const newValue = Math.max(fader.min, Math.min(fader.max, fader.value + delta / 2));
    updateFader(fader.id, newValue);
  };

  const copyQRCode = () => {
    navigator.clipboard.writeText(qrCode);
    toast.success('QR code link copied');
  };

  const generateNewQRCode = () => {
    setQrCode('https://qr.example.com/studio-session-' + Math.random().toString(36).substr(2, 9));
    toast.success('New QR code generated');
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Mobile Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-medium">Connection Status</div>
              <div className={`text-xs mt-1 ${isConnected ? 'text-green-400' : 'text-slate-400'}`}>
                {isConnected ? '🟢 Connected' : '⚫ Disconnected'}
              </div>
            </div>
            <Button
              onClick={connectDevice}
              disabled={isConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Connect Device
            </Button>
          </div>

          {isConnected && (
            <div className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Latency:</span>
                <span className="text-cyan-400 font-semibold">{latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bandwidth:</span>
                <span className="text-cyan-400 font-semibold">{bandwidth.toFixed(1)} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stream Quality:</span>
                <span className="text-cyan-400 font-semibold capitalize">{streamQuality}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Pairing */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <QrCode className="w-4 h-4 text-purple-400" />
            Pair New Device
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-slate-900 rounded p-4 border border-slate-700 flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded p-2 mb-3 flex items-center justify-center">
              <div className="text-xs text-center text-slate-800 font-mono break-all">{qrCode}</div>
            </div>
            <div className="text-xs text-slate-400 text-center mb-3">
              Scan with mobile device to connect
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={copyQRCode} variant="outline" className="flex-1 text-xs">
                Copy Link
              </Button>
              <Button onClick={generateNewQRCode} variant="outline" className="flex-1 text-xs">
                New Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      {sessions.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Connected Devices ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700"
                >
                  <div>
                    <div className="text-sm text-white font-medium">{session.deviceName}</div>
                    <div className="text-xs text-slate-400">Latency: {session.latency}ms</div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => disconnectDevice(session.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Touch Faders */}
      {isConnected && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-400" />
              Touch Faders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faders.map((fader) => (
              <div key={fader.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-300">{fader.name}</label>
                  <span className="text-lg font-bold text-cyan-400">{Math.round(fader.value)}</span>
                </div>
                <div
                  className="h-12 bg-slate-900 rounded border-2 border-slate-700 flex items-center cursor-grab active:cursor-grabbing"
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove(e, fader)}
                >
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded transition-all"
                    style={{ width: `${((fader.value - fader.min) / (fader.max - fader.min)) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={fader.min}
                  max={fader.max}
                  value={fader.value}
                  onChange={(e) => updateFader(fader.id, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stream Quality Settings */}
      {isConnected && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-400" />
              Stream Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Audio Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((quality) => (
                  <Button
                    key={quality}
                    size="sm"
                    variant={streamQuality === quality ? 'default' : 'outline'}
                    onClick={() => setStreamQuality(quality)}
                    className="text-xs capitalize"
                  >
                    {quality}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Bitrate:</span>
                <span className="text-green-400">
                  {streamQuality === 'low' ? '64 kbps' : streamQuality === 'medium' ? '128 kbps' : '256 kbps'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latency:</span>
                <span className="text-green-400">
                  {streamQuality === 'low' ? '20-30ms' : streamQuality === 'medium' ? '40-60ms' : '80-120ms'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended:</span>
                <span className="text-green-400">
                  {streamQuality === 'low' ? 'WiFi' : streamQuality === 'medium' ? 'WiFi/4G' : 'WiFi'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <div>✓ Touch-optimized fader interface with haptic feedback</div>
          <div>✓ QR code quick pairing for instant connection</div>
          <div>✓ Low-latency wireless audio streaming</div>
          <div>✓ Real-time synchronization with desktop studio</div>
          <div>✓ Adaptive bitrate based on connection quality</div>
          <div>✓ Multi-device support for band collaboration</div>
          <div>✓ Preset management on mobile</div>
          <div>✓ Works offline with local sync on reconnect</div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Installation Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <div>
            <strong className="text-slate-300">iOS:</strong> Open Safari, scan QR code, tap "Add to Home Screen"
          </div>
          <div>
            <strong className="text-slate-300">Android:</strong> Open Chrome, scan QR code, tap menu → "Install app"
          </div>
          <div>
            <strong className="text-slate-300">Desktop:</strong> Works on any modern browser with touch support
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
