"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePreset } from "@/contexts/PresetContext";

interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  effects: Array<{ type: string; intensity: number }>;
  transitions: Array<{ type: string; duration: number }>;
}

interface EditingPresetsProps {
  onApplyPreset?: (presetId: string) => void;
  selectedClipIds?: string[];
}

/**
 * Editing Presets Component
 * Displays and applies pre-built editing templates
 */
export default function EditingPresets({
  onApplyPreset,
  selectedClipIds = [],
}: EditingPresetsProps) {
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);
  const { applyPreset: broadcastPreset } = usePreset();

  // Fetch presets
  const { data: presets } = trpc.editingPresets.getPresets.useQuery();
  const applyPresetMutation = trpc.editingPresets.applyPreset.useMutation();

  const handleApplyPreset = async (presetId: string) => {
    try {
      if (selectedClipIds.length === 0) {
        console.warn("No clips selected");
        return;
      }

      const preset = presets?.find((p: Preset) => p.id === presetId);
      if (!preset) return;

      await applyPresetMutation.mutateAsync({
        presetId,
        clipIds: selectedClipIds,
      });

      broadcastPreset({
        presetId,
        presetName: preset.name,
        effects: preset.effects,
        transitions: preset.transitions,
        appliedAt: Date.now(),
      });

      setAppliedPresetId(presetId);
      onApplyPreset?.(presetId);

      setTimeout(() => setAppliedPresetId(null), 2000);
    } catch (error) {
      console.error("Failed to apply preset:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "professional":
        return "bg-purple-600";
      case "audio":
        return "bg-blue-600";
      case "music":
        return "bg-pink-600";
      case "broadcast":
        return "bg-red-600";
      case "social":
        return "bg-green-600";
      case "custom":
        return "bg-yellow-600";
      default:
        return "bg-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Editing Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedClipIds.length === 0 && (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-sm text-yellow-200">
              Select one or more clips to apply presets
            </div>
          )}

          {!presets || presets.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No presets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presets.map((preset: Preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{preset.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                    </div>
                    <Badge className={`${getCategoryColor(preset.category)} ml-2`}>
                      {preset.category}
                    </Badge>
                  </div>

                  {/* Effects Preview */}
                  <div className="mb-3 space-y-1">
                    <p className="text-xs text-slate-400">Effects:</p>
                    <div className="flex flex-wrap gap-1">
                      {preset.effects.map((effect, idx) => (
                        <Badge
                          key={`item-${idx}`}
                          variant="outline"
                          className="text-xs border-slate-500"
                        >
                          {effect.type} ({effect.intensity}%)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Transitions Preview */}
                  <div className="mb-3 space-y-1">
                    <p className="text-xs text-slate-400">Transitions:</p>
                    <div className="flex flex-wrap gap-1">
                      {preset.transitions.map((transition, idx) => (
                        <Badge
                          key={`item-${idx}`}
                          variant="outline"
                          className="text-xs border-slate-500"
                        >
                          {transition.type} ({transition.duration}ms)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={() => handleApplyPreset(preset.id)}
                    disabled={selectedClipIds.length === 0}
                    className={`w-full ${
                      appliedPresetId === preset.id
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {appliedPresetId === preset.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Applied!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Preset
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preset Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">About Presets</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <p>
            <strong>Cinematic:</strong> Professional film-style with dramatic color grading
          </p>
          <p>
            <strong>Podcast:</strong> Clean, minimal editing for audio-focused content
          </p>
          <p>
            <strong>Music Video:</strong> Vibrant, high-energy with bold colors
          </p>
          <p>
            <strong>News:</strong> Professional broadcast style with neutral tones
          </p>
          <p>
            <strong>Vlog:</strong> Casual, friendly editing with warm tones
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
