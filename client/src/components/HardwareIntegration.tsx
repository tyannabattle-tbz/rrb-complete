import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Mic, Volume2, Settings, Power, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HardwareDevice {
  id: string;
  name: string;
  type: 'audio_interface' | 'microphone' | 'midi_controller' | 'monitor';
  manufacturer: string;
  status: 'connected' | 'disconnected' | 'error';
  latency: number;
  sampleRate: number;
  bufferSize: number;
  permissions: string[];
}

export function HardwareIntegration() {
  const [devices, setDevices] = useState<HardwareDevice[]>([
    {
      id: '1',
      name: 'Scarlett 2i2',
      type: 'audio_interface',
      manufacturer: 'Focusrite',
      status: 'connected',
      latency: 5.3,
      sampleRate: 48000,
      bufferSize: 256,
      permissions: ['admin', 'producer', 'engineer'],
    },
    {
      id: '2',
      name: 'Neumann U87',
      type: 'microphone',
      manufacturer: 'Neumann',
      status: 'connected',
      latency: 0.2,
      sampleRate: 48000,
      bufferSize: 256,
      permissions: ['admin', 'producer'],
    },
    {
      id: '3',
      name: 'Akai APC40 mkII',
      type: 'midi_controller',
      manufacturer: 'Akai',
      status: 'disconnected',
      latency: 0,
      sampleRate: 0,
      bufferSize: 0,
      permissions: ['admin', 'producer'],
    },
  ]);

  const [showAutoDetect, setShowAutoDetect] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const autoDetectDevices = () => {
    setShowAutoDetect(true);
    toast.info('Scanning for connected devices...');

    setTimeout(() => {
      // Simulate finding a new device
      const newDevice: HardwareDevice = {
        id: '4',
        name: 'Behringer FCB1010',
        type: 'midi_controller',
        manufacturer: 'Behringer',
        status: 'connected',
        latency: 2.1,
        sampleRate: 0,
        bufferSize: 0,
        permissions: ['admin'],
      };

      setDevices([...devices, newDevice]);
      setShowAutoDetect(false);
      toast.success('New device detected: Behringer FCB1010');
    }, 2000);
  };

  const toggleDevice = (id: string) => {
    setDevices(
      devices.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === 'connected' ? 'disconnected' : 'connected',
            }
          : d
      )
    );
  };

  const removeDevice = (id: string) => {
    const device = devices.find((d) => d.id === id);
    setDevices(devices.filter((d) => d.id !== id));
    toast.success(`${device?.name} removed`);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    } else {
      return <Power className="w-4 h-4 text-slate-400" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'audio_interface':
        return <Volume2 className="w-5 h-5 text-blue-400" />;
      case 'microphone':
        return <Mic className="w-5 h-5 text-red-400" />;
      case 'midi_controller':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'monitor':
        return <Volume2 className="w-5 h-5 text-green-400" />;
      default:
        return <Settings className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Hardware Integration Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={autoDetectDevices}
              disabled={showAutoDetect}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Cpu className="w-4 h-4 mr-2" />
              {showAutoDetect ? 'Scanning...' : 'Auto-Detect Devices'}
            </Button>
            <Button
              onClick={() => toast.success('Opening system preferences...')}
              variant="outline"
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>

          {/* Connected Devices */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Connected Devices</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {devices
                .filter((d) => d.status === 'connected')
                .map((device) => (
                  <div
                    key={device.id}
                    className="bg-slate-900 rounded p-3 border border-slate-700 hover:border-slate-600 cursor-pointer transition"
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getDeviceIcon(device.type)}
                        <div>
                          <div className="text-sm text-white font-semibold flex items-center gap-2">
                            {device.name}
                            {getStatusIcon(device.status)}
                          </div>
                          <div className="text-xs text-slate-400">{device.manufacturer}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDevice(device.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>

                    {device.type === 'audio_interface' && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-2">
                        <div>Latency: {device.latency}ms</div>
                        <div>Sample Rate: {device.sampleRate / 1000}kHz</div>
                        <div>Buffer: {device.bufferSize}</div>
                      </div>
                    )}

                    {/* Permissions */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {device.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded capitalize"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              {devices.filter((d) => d.status === 'connected').length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No devices connected. Click "Auto-Detect" to find devices.
                </div>
              )}
            </div>
          </div>

          {/* Disconnected Devices */}
          {devices.filter((d) => d.status === 'disconnected').length > 0 && (
            <div className="space-y-3 border-t border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-white">Disconnected Devices</h3>
              <div className="space-y-2">
                {devices
                  .filter((d) => d.status === 'disconnected')
                  .map((device) => (
                    <div
                      key={device.id}
                      className="bg-slate-900 rounded p-3 border border-slate-700 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.type)}
                          <div>
                            <div className="text-sm text-slate-400 font-semibold flex items-center gap-2">
                              {device.name}
                              {getStatusIcon(device.status)}
                            </div>
                            <div className="text-xs text-slate-500">{device.manufacturer}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => toggleDevice(device.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Reconnect
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Details */}
      {selectedDevice && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Device Details</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 space-y-2">
            {devices
              .filter((d) => d.id === selectedDevice)
              .map((device) => (
                <div key={device.id} className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-500">Device Name</div>
                      <div className="text-white">{device.name}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Manufacturer</div>
                      <div className="text-white">{device.manufacturer}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Type</div>
                      <div className="text-white capitalize">{device.type.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Status</div>
                      <div className="text-green-400 capitalize flex items-center gap-1">
                        {getStatusIcon(device.status)}
                        {device.status}
                      </div>
                    </div>
                  </div>

                  {device.type === 'audio_interface' && (
                    <div className="bg-slate-900 rounded p-2 border border-slate-700">
                      <div className="text-slate-500 mb-2">Audio Configuration</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-slate-600">Latency</div>
                          <div className="text-white">{device.latency}ms</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Sample Rate</div>
                          <div className="text-white">{device.sampleRate / 1000}kHz</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Buffer Size</div>
                          <div className="text-white">{device.bufferSize}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
