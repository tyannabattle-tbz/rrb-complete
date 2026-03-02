import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Scissors, Layers, Type, Palette, Download, Play, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoTimelineEditor() {
  const [activeTrack, setActiveTrack] = useState<'video' | 'audio' | 'text'>('video');
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const clips = [
    { id: 'clip-1', title: 'Intro', duration: 5, startTime: 0, type: 'video' },
    { id: 'clip-2', title: 'Main Content', duration: 30, startTime: 5, type: 'video' },
    { id: 'clip-3', title: 'Outro', duration: 5, startTime: 35, type: 'video' },
  ];

  const transitions = [
    { id: 'fade', name: 'Fade', duration: 0.5 },
    { id: 'slide', name: 'Slide', duration: 0.5 },
    { id: 'wipe', name: 'Wipe', duration: 0.5 },
    { id: 'dissolve', name: 'Dissolve', duration: 0.5 },
  ];

  const effects = [
    { id: 'blur', name: 'Blur', category: 'Blur' },
    { id: 'sharpen', name: 'Sharpen', category: 'Sharpen' },
    { id: 'sepia', name: 'Sepia', category: 'Color' },
    { id: 'grayscale', name: 'Grayscale', category: 'Color' },
    { id: 'pixelate', name: 'Pixelate', category: 'Distortion' },
    { id: 'vignette', name: 'Vignette', category: 'Light' },
  ];

  const colorPresets = [
    { id: 'warm', name: 'Warm', color: '#FFA500' },
    { id: 'cool', name: 'Cool', color: '#0099FF' },
    { id: 'vintage', name: 'Vintage', color: '#8B7355' },
    { id: 'noir', name: 'Noir', color: '#1A1A1A' },
    { id: 'vibrant', name: 'Vibrant', color: '#FF1493' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Video Timeline Editor</h1>
          <p className="text-slate-600 mt-2">Edit, arrange, and enhance your video project</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Download className="w-4 h-4" />
          Export Video
        </Button>
      </div>

      {/* Timeline Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Timeline Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-2" />
              <p className="text-white">Preview: 0:00 / 0:40</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1">
              <Play className="w-3 h-3" />
              Play
            </Button>
            <Button size="sm" variant="outline">Pause</Button>
            <Button size="sm" variant="outline">Stop</Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Tracks */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Timeline Tracks</CardTitle>
          <CardDescription>Manage video, audio, and text layers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Track */}
          <div className="border border-slate-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900">Video Track</span>
              </div>
              <Button size="sm" variant="outline">+ Add Clip</Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip.id)}
                  className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedClip === clip.id
                      ? 'ring-2 ring-blue-600 bg-blue-50'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  style={{ width: `${clip.duration * 20}px` }}
                >
                  <p className="text-xs font-semibold text-slate-900 truncate">{clip.title}</p>
                  <p className="text-xs text-slate-600">{clip.duration}s</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Track */}
          <div className="border border-slate-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-slate-900">Audio Track</span>
              </div>
              <Button size="sm" variant="outline">+ Add Audio</Button>
            </div>
            <div className="h-12 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center">
              <p className="text-sm text-slate-600">Drag audio here or click to add</p>
            </div>
          </div>

          {/* Text Track */}
          <div className="border border-slate-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-900">Text Track</span>
              </div>
              <Button size="sm" variant="outline">+ Add Text</Button>
            </div>
            <div className="h-12 bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center">
              <p className="text-sm text-slate-600">Drag text here or click to add</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editing Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transitions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Transitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {transitions.map((transition) => (
                <Button
                  key={transition.id}
                  variant="outline"
                  className="text-xs"
                  onClick={() => toast.success(`Added ${transition.name} transition`)}
                >
                  {transition.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Effects */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {effects.map((effect) => (
                <Button
                  key={effect.id}
                  variant="outline"
                  className="text-xs"
                  onClick={() => toast.success(`Applied ${effect.name} effect`)}
                >
                  {effect.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Grading */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Grading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => toast.success(`Applied ${preset.name} color grading`)}
                >
                  <div
                    className="w-6 h-6 rounded border border-slate-300"
                    style={{ backgroundColor: preset.color }}
                  ></div>
                  <span className="text-xs font-medium text-slate-900">{preset.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clip Properties */}
      {selectedClip && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Clip Properties</CardTitle>
            <CardDescription>Edit selected clip: {selectedClip}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Start Time (seconds)
                </label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Opacity
              </label>
              <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1">
                <Copy className="w-3 h-3" />
                Duplicate
              </Button>
              <Button variant="outline" className="gap-1 text-red-600">
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Import Music icon
const Music = Film;
