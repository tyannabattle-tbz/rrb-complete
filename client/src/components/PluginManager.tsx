import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings, Download, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  name: string;
  type: 'VST' | 'AU' | 'AAX';
  category: string;
  manufacturer: string;
  version: string;
  cpuUsage: number;
  memoryUsage: number;
  isActive: boolean;
  parameters: Record<string, number>;
}

interface PluginChain {
  id: string;
  name: string;
  plugins: Plugin[];
  presets: string[];
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: '1',
      name: 'FabFilter Pro-Q 3',
      type: 'VST',
      category: 'EQ',
      manufacturer: 'FabFilter',
      version: '3.19',
      cpuUsage: 2.3,
      memoryUsage: 45,
      isActive: true,
      parameters: { frequency: 1000, gain: 0, q: 1 },
    },
    {
      id: '2',
      name: 'Waves C6',
      type: 'VST',
      category: 'Compressor',
      manufacturer: 'Waves',
      version: '12.0',
      cpuUsage: 3.1,
      memoryUsage: 52,
      isActive: true,
      parameters: { threshold: -20, ratio: 4, makeup: 0 },
    },
  ]);
  const [pluginChains, setPluginChains] = useState<PluginChain[]>([
    {
      id: '1',
      name: 'Vocal Chain',
      plugins: plugins,
      presets: ['Bright Vocal', 'Warm Vocal', 'Radio Ready'],
    },
  ]);
  const [selectedChain, setSelectedChain] = useState<string>('1');
  const [totalCpuUsage, setTotalCpuUsage] = useState(5.4);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const addPlugin = () => {
    const newPlugin: Plugin = {
      id: Date.now().toString(),
      name: 'New Plugin',
      type: 'VST',
      category: 'Effect',
      manufacturer: 'Unknown',
      version: '1.0',
      cpuUsage: 0,
      memoryUsage: 0,
      isActive: false,
      parameters: {},
    };
    setPlugins([...plugins, newPlugin]);
    toast.success('Plugin added to chain');
  };

  const removePlugin = (id: string) => {
    setPlugins(plugins.filter((p) => p.id !== id));
    toast.success('Plugin removed');
  };

  const togglePlugin = (id: string) => {
    setPlugins(
      plugins.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const updateParameter = (pluginId: string, param: string, value: number) => {
    setPlugins(
      plugins.map((p) =>
        p.id === pluginId
          ? { ...p, parameters: { ...p.parameters, [param]: value } }
          : p
      )
    );
  };

  const savePreset = () => {
    toast.success('Plugin chain preset saved');
  };

  const loadPreset = (presetName: string) => {
    toast.success(`Loaded preset: ${presetName}`);
  };

  return (
    <div className="space-y-6">
      {/* Plugin Marketplace */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-400" />
            Plugin Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setShowMarketplace(!showMarketplace)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Browse & Install Plugins
          </Button>

          {showMarketplace && (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {[
                { name: 'FabFilter Pro-L 2', type: 'Limiter', price: '$99' },
                { name: 'Waves SSL 4000E', type: 'Console', price: '$299' },
                { name: 'iZotope RX 11', type: 'Restoration', price: '$399' },
                { name: 'Serum', type: 'Synth', price: '$189' },
                { name: 'Omnisphere', type: 'Synth', price: '$495' },
                { name: 'Kontakt 7', type: 'Sampler', price: '$399' },
              ].map((plugin) => (
                <div
                  key={plugin.name}
                  className="bg-slate-900 rounded p-2 border border-slate-700"
                >
                  <div className="text-xs text-white font-semibold">{plugin.name}</div>
                  <div className="text-xs text-slate-400">{plugin.type}</div>
                  <div className="text-xs text-green-400 font-bold mt-1">{plugin.price}</div>
                  <Button size="sm" variant="outline" className="w-full mt-1 text-xs">
                    Install
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Plugin Chain */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Active Plugin Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-slate-900 rounded p-3 border border-slate-700">
            <div className="text-sm text-white font-semibold mb-2">
              {pluginChains.find((c) => c.id === selectedChain)?.name}
            </div>
            <div className="space-y-2">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={plugin.isActive}
                      onChange={() => togglePlugin(plugin.id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="text-xs text-white font-semibold">{plugin.name}</div>
                      <div className="text-xs text-slate-400">
                        {plugin.manufacturer} • {plugin.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Opened ${plugin.name} settings`)}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePlugin(plugin.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={addPlugin} variant="outline" className="w-full mt-3">
              <Plus className="w-3 h-3 mr-2" />
              Add Plugin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Parameters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Plugin Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-48 overflow-y-auto">
          {plugins
            .filter((p) => p.isActive)
            .map((plugin) => (
              <div key={plugin.id} className="bg-slate-900 rounded p-3 border border-slate-700">
                <div className="text-xs text-white font-semibold mb-2">{plugin.name}</div>
                <div className="space-y-2">
                  {Object.entries(plugin.parameters).map(([param, value]) => (
                    <div key={param}>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="capitalize">{param}</span>
                        <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={typeof value === 'number' ? value : 0}
                        onChange={(e) =>
                          updateParameter(plugin.id, param, parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* CPU & Memory Usage */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Total CPU Usage</span>
                <span className={totalCpuUsage > 80 ? 'text-red-400' : 'text-green-400'}>
                  {totalCpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded h-2">
                <div
                  className={`h-full rounded transition-all ${
                    totalCpuUsage > 80 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${totalCpuUsage}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              {plugins.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-slate-300">
                    {p.cpuUsage.toFixed(1)}% CPU • {p.memoryUsage}MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Management */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Plugin Chain Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pluginChains
            .find((c) => c.id === selectedChain)
            ?.presets.map((preset) => (
              <Button
                key={preset}
                onClick={() => loadPreset(preset)}
                variant="outline"
                className="w-full text-xs"
              >
                {preset}
              </Button>
            ))}
          <Button onClick={savePreset} className="w-full bg-green-600 hover:bg-green-700 text-xs">
            Save Current as Preset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
