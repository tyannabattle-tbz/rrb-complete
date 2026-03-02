"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Copy,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Layers,
  Settings,
} from "lucide-react";

interface TimelineClip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  effects: string[];
  transition?: string;
}

interface TimelineEditorProps {
  onSave?: (timeline: TimelineClip[]) => void;
  initialClips?: TimelineClip[];
}

/**
 * Timeline Editor Component
 * Drag-and-drop video timeline editor with effects and transitions
 */
export default function TimelineEditor({
  onSave,
  initialClips = [],
}: TimelineEditorProps) {
  const [clips, setClips] = useState<TimelineClip[]>(initialClips);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [draggedClip, setDraggedClip] = useState<string | null>(null);

  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  const handleAddClip = () => {
    const newClip: TimelineClip = {
      id: `clip_${Date.now()}`,
      name: `Clip ${clips.length + 1}`,
      startTime: totalDuration,
      duration: 30,
      effects: [],
    };
    setClips([...clips, newClip]);
  };

  const handleDeleteClip = (id: string) => {
    setClips(clips.filter((c) => c.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  };

  const handleDuplicateClip = (id: string) => {
    const clipToDuplicate = clips.find((c) => c.id === id);
    if (clipToDuplicate) {
      const newClip: TimelineClip = {
        ...clipToDuplicate,
        id: `clip_${Date.now()}`,
        startTime: clipToDuplicate.startTime + clipToDuplicate.duration,
      };
      setClips([...clips, newClip]);
    }
  };

  const handleUpdateClipDuration = (id: string, duration: number) => {
    setClips(
      clips.map((c) => (c.id === id ? { ...c, duration } : c))
    );
  };

  const handleAddEffect = (effectType: string) => {
    if (selectedClip) {
      setClips(
        clips.map((c) =>
          c.id === selectedClipId
            ? { ...c, effects: [...c.effects, effectType] }
            : c
        )
      );
    }
  };

  const handleRemoveEffect = (effectIndex: number) => {
    if (selectedClip) {
      setClips(
        clips.map((c) =>
          c.id === selectedClipId
            ? {
                ...c,
                effects: c.effects.filter((_, i) => i !== effectIndex),
              }
            : c
        )
      );
    }
  };

  const handleAddTransition = (transitionType: string) => {
    if (selectedClip) {
      setClips(
        clips.map((c) =>
          c.id === selectedClipId ? { ...c, transition: transitionType } : c
        )
      );
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedClip(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedClip && draggedClip !== targetId) {
      const draggedIndex = clips.findIndex((c) => c.id === draggedClip);
      const targetIndex = clips.findIndex((c) => c.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newClips = [...clips];
        [newClips[draggedIndex], newClips[targetIndex]] = [
          newClips[targetIndex],
          newClips[draggedIndex],
        ];
        setClips(newClips);
      }
    }
    setDraggedClip(null);
  };

  const effectOptions = [
    { name: "Brightness", value: "brightness" },
    { name: "Contrast", value: "contrast" },
    { name: "Saturation", value: "saturation" },
    { name: "Blur", value: "blur" },
    { name: "Grayscale", value: "grayscale" },
  ];

  const transitionOptions = [
    { name: "Fade", value: "fade" },
    { name: "Slide", value: "slide" },
    { name: "Wipe", value: "wipe" },
    { name: "Dissolve", value: "dissolve" },
    { name: "Crossfade", value: "crossfade" },
  ];

  return (
    <div className="space-y-6">
      {/* Timeline Playback Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Timeline Playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Playback Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button
              onClick={() => setCurrentTime(0)}
              variant="outline"
              className="border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={(value) => setCurrentTime(value[0])}
              max={totalDuration}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
              </span>
              <span>
                {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, "0")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Clips */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Timeline Clips</CardTitle>
          <Button
            onClick={handleAddClip}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Clip
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {clips.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No clips added yet. Click "Add Clip" to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  draggable
                  onDragStart={() => handleDragStart(clip.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, clip.id)}
                  onClick={() => setSelectedClipId(clip.id)}
                  className={`p-3 rounded-lg border-2 cursor-move transition-colors ${
                    selectedClipId === clip.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  } ${draggedClip === clip.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{clip.name}</h4>
                      <p className="text-xs text-slate-400">
                        {clip.duration}s • {clip.effects.length} effects
                        {clip.transition && ` • ${clip.transition}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateClip(clip.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClip(clip.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Visual Timeline Bar */}
                  <div className="w-full bg-slate-600 rounded h-1">
                    <div
                      className="bg-blue-500 h-1 rounded"
                      style={{
                        width: `${(clip.duration / totalDuration) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clip Properties */}
      {selectedClip && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Clip Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duration Adjustment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Duration (seconds)</label>
              <Slider
                value={[selectedClip.duration]}
                onValueChange={(value) =>
                  handleUpdateClipDuration(selectedClipId!, value[0])
                }
                min={1}
                max={300}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-slate-400">{selectedClip.duration}s</span>
            </div>

            {/* Effects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <label className="text-sm font-medium text-slate-300">Effects</label>
              </div>

              {selectedClip.effects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedClip.effects.map((effect, index) => (
                    <Badge
                      key={index}
                      className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer"
                      onClick={() => handleRemoveEffect(index)}
                    >
                      {effect} ✕
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {effectOptions.map((effect) => (
                  <Button
                    key={effect.value}
                    onClick={() => handleAddEffect(effect.value)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white"
                    disabled={selectedClip.effects.includes(effect.value)}
                  >
                    {effect.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transitions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <label className="text-sm font-medium text-slate-300">Transition</label>
              </div>

              {selectedClip.transition && (
                <Badge className="bg-purple-600 mb-2">
                  {selectedClip.transition}
                  <button
                    onClick={() =>
                      setClips(
                        clips.map((c) =>
                          c.id === selectedClipId
                            ? { ...c, transition: undefined }
                            : c
                        )
                      )
                    }
                    className="ml-2"
                  >
                    ✕
                  </button>
                </Badge>
              )}

              <div className="grid grid-cols-2 gap-2">
                {transitionOptions.map((transition) => (
                  <Button
                    key={transition.value}
                    onClick={() => handleAddTransition(transition.value)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white"
                    disabled={selectedClip.transition === transition.value}
                  >
                    {transition.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={() => onSave?.(clips)}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Save Timeline Project
      </Button>
    </div>
  );
}
