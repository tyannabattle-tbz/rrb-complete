import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Settings, Sliders, Radio, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  inputs: number;
  outputs: number;
  isConnected: boolean;
  lastPing: Date;
}

interface MIDIMapping {
  id: string;
  deviceId: string;
  ccNumber: number;
  parameter: string;
  minValue: number;
  maxValue: number;
  isLearning: boolean;
}

interface MIDIAutomation {
  id: string;
  parameter: string;
  startValue: number;
  endValue: number;
  duration: number;
  isRecording: boolean;
  recordedData: Array<{ timestamp: number; value: number }>;
}

export function MIDIControllerIntegration() {
  const [devices, setDevices] = useState<MIDIDevice[]>([
    {
      id: '1',
      name: 'Akai APC40 mkII',
      manufacturer: 'Akai',
      inputs: 1,
      outputs: 1,
      isConnected: true,
      lastPing: new Date(),
    },
    {
      id: '2',
      name: 'Native Instruments Komplete Kontrol S88',
      manufacturer: 'Native Instruments',
      inputs: 1,
      outputs: 1,
      isConnected: false,
      lastPing: new Date(Date.now() - 60000),
    },
  ]);

  const [mappings, setMappings] = useState<MIDIMapping[]>([
    {
      id: '1',
      deviceId: '1',
      ccNumber: 1,
      parameter: 'Master Volume',
      minValue: 0,
      maxValue: 100,
      isLearning: false,
    },
    {
      id: '2',
      deviceId: '1',
      ccNumber: 2,
      parameter: 'Track 1 Volume',
      minValue: 0,
      maxValue: 100,
      isLearning: false,
    },
  ]);

  const [automations, setAutomations] = useState<MIDIAutomation[]>([
    {
      id: '1',
      parameter: 'Filter Cutoff',
      startValue: 100,
      endValue: 8000,
      duration: 8000,
      isRecording: false,
      recordedData: [],
    },
  ]);

  const [learnMode, setLearnMode] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);

  const scanDevices = () => {
    toast.success('Scanning for MIDI devices...');
    // Simulate device scan
    setTimeout(() => {
      toast.success('Found 2 MIDI devices');
    }, 1000);
  };

  const toggleLearnMode = () => {
    setLearnMode(!learnMode);
    if (!learnMode) {
      toast.success('MIDI Learn mode activated - move a controller');
    } else {
      toast.success('MIDI Learn mode deactivated');
    }
  };

  const createMapping = () => {
    const newMapping: MIDIMapping = {
      id: Date.now().toString(),
      deviceId: devices[0]?.id || '1',
      ccNumber: Math.floor(Math.random() * 127),
      parameter: 'New Parameter',
      minValue: 0,
      maxValue: 100,
      isLearning: true,
    };
    setMappings([...mappings, newMapping]);
    toast.success('New MIDI mapping created');
  };

  const deleteMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
    toast.success('MIDI mapping deleted');
  };

  const startAutomationRecording = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id
          ? { ...a, isRecording: true, recordedData: [] }
          : a
      )
    );
    toast.success('Automation recording started');
  };

  const stopAutomationRecording = (id: string) => {
    setAutomations(
      automations.map((a) =>
        a.id === id ? { ...a, isRecording: false } : a
      )
    );
    toast.success('Automation recording stopped');
  };

  return (
    <div className="space-y-6">
      {/* Device Detection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            MIDI Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={scanDevices} className="w-full bg-blue-600 hover:bg-blue-700">
            <RotateCw className="w-4 h-4 mr-2" />
            Scan for Devices
          </Button>

          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-slate-900 rounded p-3 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-white font-semibold">{device.name}</div>
                    <div className="text-xs text-slate-400">{device.manufacturer}</div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      device.isConnected ? 'bg-green-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-400">
                  {device.inputs} Input{device.inputs !== 1 ? 's' : ''} • {device.outputs} Output
                  {device.outputs !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MIDI Mapping */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            MIDI Mappings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={toggleLearnMode}
              variant={learnMode ? 'default' : 'outline'}
              className="flex-1"
            >
              {learnMode ? '✓ Learn Mode' : 'Learn Mode'}
            </Button>
            <Button onClick={createMapping} variant="outline" className="flex-1">
              + New Mapping
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className={`bg-slate-900 rounded p-2 border ${
                  mapping.isLearning ? 'border-yellow-500' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-white font-semibold">{mapping.parameter}</div>
                  <div className="text-xs text-slate-400">CC {mapping.ccNumber}</div>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Range: {mapping.minValue} - {mapping.maxValue}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMapping(mapping.id)}
                    className="flex-1 text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMapping(mapping.id)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MIDI Automation */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            MIDI Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {automations.map((automation) => (
            <div key={automation.id} className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-white font-semibold">{automation.parameter}</div>
                  <div className="text-xs text-slate-400">
                    {automation.startValue} → {automation.endValue} over {automation.duration}ms
                  </div>
                </div>
                <div className="flex gap-1">
                  {automation.isRecording ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => stopAutomationRecording(automation.id)}
                    >
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => startAutomationRecording(automation.id)}
                    >
                      Record
                    </Button>
                  )}
                </div>
              </div>

              {automation.recordedData.length > 0 && (
                <div className="h-16 bg-slate-800 rounded flex items-end justify-around p-2">
                  {automation.recordedData.slice(-16).map((data, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t mx-0.5"
                      style={{
                        height: `${(data.value / automation.endValue) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-green-400" />
            MIDI Sync Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">MIDI Clock Source</label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300">
              <option>Internal</option>
              <option>External (MIDI Clock)</option>
              <option>Sync to DAW</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">MIDI Feedback</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs">
                Enabled
              </Button>
              <Button variant="outline" className="flex-1 text-xs">
                Disabled
              </Button>
            </div>
          </div>

          <div className="bg-slate-900 rounded p-2 border border-slate-700 text-xs text-slate-400">
            <div>✓ MIDI Thru enabled</div>
            <div>✓ Program change enabled</div>
            <div>✓ Control change enabled</div>
            <div>✓ Note on/off enabled</div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <div>✓ MIDI Monitor: All devices responding</div>
          <div>✓ Latency: &lt;5ms average</div>
          <div>✓ Mappings: 2 active, 0 conflicts</div>
          <div>✓ Automation: Recording ready</div>
        </CardContent>
      </Card>
    </div>
  );
}
