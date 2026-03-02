import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clapperboard,
  Download,
  Zap,
  Film,
  Lightbulb,
  Volume2,
  Palette,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  location: string;
  mood: string;
  duration: number;
  shots: Array<{
    shotNumber: number;
    composition: string;
    angle: string;
    movement: string;
    duration: number;
  }>;
  lighting: string;
  soundDesign: string;
  visualEffects: string[];
}

interface Storyboard {
  id: string;
  title: string;
  scenes: Scene[];
  totalDuration: number;
  metadata: {
    genre: string;
    colorPalette: string[];
  };
}

export const AIStoryboardingEngine: React.FC = () => {
  const [scriptContent, setScriptContent] = useState('');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate storyboard mutation
  const generateStoryboardMutation = (trpc as any).storyboard.generate.useMutation({
    onSuccess: (generated: any) => {
      setStoryboard(generated);
      if (generated.scenes.length > 0) {
        setSelectedScene(generated.scenes[0]);
      }
      toast.success('Storyboard generated successfully');
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate storyboard');
      setIsGenerating(false);
    },
  });

  const handleGenerateStoryboard = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter a script');
      return;
    }

    setIsGenerating(true);
    generateStoryboardMutation.mutate({ scriptContent });
  };

  const handleExportPDF = async () => {
    if (!storyboard) {
      toast.error('No storyboard to export');
      return;
    }

    try {
      const response = await (trpc as any).storyboard.exportPDF.mutate({
        storyboardId: storyboard.id,
      });
      toast.success('PDF exported successfully');
      // In a real app, trigger download
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Script Editor</TabsTrigger>
          <TabsTrigger value="storyboard" disabled={!storyboard}>
            Storyboard
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedScene}>
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Script Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <Card className="p-4 bg-slate-900 border-slate-700">
            <label className="text-sm font-semibold text-white mb-2 block">
              Script Content
            </label>
            <Textarea
              placeholder="Enter your script here. Use standard screenplay format:
INT./EXT. LOCATION - TIME OF DAY
Description of action
CHARACTER NAME
Dialogue"
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="min-h-64 bg-slate-800 border-slate-700 text-white"
            />
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateStoryboard}
              disabled={isGenerating || !scriptContent.trim()}
              className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Storyboard'}
            </Button>
          </div>

          {/* Quick Templates */}
          <Card className="p-4 bg-slate-900 border-slate-700">
            <p className="text-sm font-semibold text-white mb-3">
              Quick Templates
            </p>
            <div className="space-y-2">
              <Button
                onClick={() =>
                  setScriptContent(`INT. COFFEE SHOP - DAY

A mysterious figure enters the crowded cafe.

JOHN
What brings you here?

SARAH
I need your help.

EXT. CITY STREET - NIGHT

They walk together through neon-lit streets.

JOHN
This is dangerous.

SARAH
I know.`)
                }
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Film className="w-4 h-4 mr-2" />
                Drama Scene
              </Button>
              <Button
                onClick={() =>
                  setScriptContent(`INT. WAREHOUSE - NIGHT

An explosion rocks the building. Fire spreads rapidly.

HERO
Run!

EXT. ROOFTOP - CONTINUOUS

They escape across rooftops as helicopters circle.`)
                }
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Clapperboard className="w-4 h-4 mr-2" />
                Action Scene
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Storyboard Tab */}
        <TabsContent value="storyboard" className="space-y-4">
          {storyboard && (
            <>
              <Card className="p-4 bg-slate-900 border-slate-700">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {storyboard.title}
                    </h2>
                    <p className="text-sm text-slate-400">
                      Genre: {storyboard.metadata.genre} • Duration:{' '}
                      {Math.floor(storyboard.totalDuration / 60)}m
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">
                      Color Palette
                    </p>
                    <div className="flex gap-2">
                      {storyboard.metadata.colorPalette.map((color) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded border border-slate-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleExportPDF}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="w-4 h-4" />
                    Export as PDF
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ScrollArea className="md:col-span-1 h-96 border border-slate-700 rounded-lg p-3">
                  <div className="space-y-2">
                    {storyboard.scenes.map((scene) => (
                      <Card
                        key={scene.id}
                        onClick={() => setSelectedScene(scene)}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedScene?.id === scene.id
                            ? 'bg-purple-900 border-purple-500'
                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">
                          Scene {scene.sceneNumber}
                        </p>
                        <p className="text-xs text-slate-400">
                          {scene.location}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {scene.duration}s
                        </p>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <div className="md:col-span-2 space-y-3">
                  {selectedScene && (
                    <>
                      <Card className="p-4 bg-slate-900 border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {selectedScene.title}
                        </h3>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-400">
                              Location
                            </p>
                            <p className="text-white">
                              {selectedScene.location}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-400">
                              Mood
                            </p>
                            <p className="text-white">{selectedScene.mood}</p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Lighting
                            </p>
                            <p className="text-white text-sm">
                              {selectedScene.lighting}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              Sound Design
                            </p>
                            <p className="text-white text-sm">
                              {selectedScene.soundDesign}
                            </p>
                          </div>

                          {selectedScene.visualEffects.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 mb-1">
                                Visual Effects
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {selectedScene.visualEffects.map((effect) => (
                                  <span
                                    key={effect}
                                    className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                                  >
                                    {effect}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-4 bg-slate-900 border-slate-700">
                        <h4 className="font-semibold text-white mb-3">Shots</h4>
                        <ScrollArea className="h-40">
                          <div className="space-y-2">
                            {selectedScene.shots.map((shot) => (
                              <Card
                                key={shot.shotNumber}
                                className="p-2 bg-slate-800 border-slate-700"
                              >
                                <p className="text-xs font-semibold text-white">
                                  Shot {shot.shotNumber}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {shot.composition} • {shot.angle} angle •{' '}
                                  {shot.movement} • {shot.duration}s
                                </p>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {selectedScene && (
            <Card className="p-6 bg-slate-900 border-slate-700">
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Clapperboard className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">
                      Scene {selectedScene.sceneNumber} Preview
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedScene.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-slate-800 border-slate-700">
                    <p className="text-xs font-semibold text-slate-400">
                      Mood
                    </p>
                    <p className="text-white">{selectedScene.mood}</p>
                  </Card>

                  <Card className="p-3 bg-slate-800 border-slate-700">
                    <p className="text-xs font-semibold text-slate-400">
                      Duration
                    </p>
                    <p className="text-white">{selectedScene.duration}s</p>
                  </Card>

                  <Card className="p-3 bg-slate-800 border-slate-700">
                    <p className="text-xs font-semibold text-slate-400">
                      Total Shots
                    </p>
                    <p className="text-white">{selectedScene.shots.length}</p>
                  </Card>

                  <Card className="p-3 bg-slate-800 border-slate-700">
                    <p className="text-xs font-semibold text-slate-400">
                      Lighting
                    </p>
                    <p className="text-white text-sm">
                      {selectedScene.lighting.split(' ')[0]}
                    </p>
                  </Card>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIStoryboardingEngine;
