import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload, Share2, Trash2, Copy, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Preset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  mixerSettings: any;
  effectsSettings: any;
  createdAt: Date;
  shared: boolean;
  shareUrl?: string;
}

export function PresetManager() {
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Vocal Clarity',
      category: 'Mixing',
      tags: ['vocals', 'clarity', 'professional'],
      mixerSettings: { lead: 85, drums: 70, bass: 65 },
      effectsSettings: { eq: 'bright', compression: 'on', reverb: 'small' },
      createdAt: new Date(),
      shared: true,
      shareUrl: 'https://presets.example.com/vocal-clarity',
    },
    {
      id: '2',
      name: 'Bass Boost',
      category: 'Mixing',
      tags: ['bass', 'low-end', 'heavy'],
      mixerSettings: { lead: 75, drums: 80, bass: 90 },
      effectsSettings: { eq: 'bass-heavy', compression: 'on', reverb: 'large' },
      createdAt: new Date(),
      shared: false,
    },
  ]);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Mixing');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Mixing', 'Recording', 'Effects', 'Mastering', 'Custom'];

  const createPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const preset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      category: selectedCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      mixerSettings: {},
      effectsSettings: {},
      createdAt: new Date(),
      shared: false,
    };

    setPresets([preset, ...presets]);
    setNewPresetName('');
    setNewTags('');
    toast.success(`Preset created: ${newPresetName}`);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    toast.success('Preset deleted');
  };

  const duplicatePreset = (preset: Preset) => {
    const newPreset: Preset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      createdAt: new Date(),
    };
    setPresets([newPreset, ...presets]);
    toast.success(`Duplicated: ${newPreset.name}`);
  };

  const sharePreset = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      const shareUrl = `https://presets.example.com/${preset.id}`;
      setPresets(
        presets.map((p) =>
          p.id === id ? { ...p, shared: !p.shared, shareUrl: !p.shared ? shareUrl : undefined } : p
        )
      );
      toast.success(`Preset ${preset.shared ? 'unshared' : 'shared'}`);
    }
  };

  const exportPreset = (preset: Preset) => {
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name}.json`;
    a.click();
    toast.success(`Exported: ${preset.name}.json`);
  };

  const importPreset = () => {
    toast.success('Import preset file selected');
  };

  const filteredPresets = presets.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Create New Preset */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-400" />
            Create New Preset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Preset Name</label>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
              placeholder="e.g., Vocal Clarity, Bass Boost"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Tags (comma separated)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
                placeholder="vocals, clarity, professional"
              />
            </div>
          </div>

          <Button onClick={createPreset} className="w-full bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Search Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
            placeholder="Search by name or tags..."
          />
        </CardContent>
      </Card>

      {/* Presets List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">
            Saved Presets ({filteredPresets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPresets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No presets found</div>
            ) : (
              filteredPresets.map((preset) => (
                <div key={preset.id} className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white font-semibold">{preset.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {preset.category} • {preset.createdAt.toLocaleDateString()}
                      </div>
                      {preset.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {preset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs text-slate-300"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {preset.shared && (
                      <div className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Shared
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicatePreset(preset)}
                      className="text-xs flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sharePreset(preset.id)}
                      className="text-xs flex-1"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      {preset.shared ? 'Unshare' : 'Share'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportPreset(preset)}
                      className="text-xs flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePreset(preset.id)}
                      className="text-xs flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {preset.shareUrl && (
                    <div className="bg-slate-800 rounded p-2 text-xs text-slate-400 break-all">
                      Share URL: {preset.shareUrl}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Bulk Operations</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={importPreset} variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Import Preset
          </Button>
          <Button
            onClick={() => toast.success('All presets exported')}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
