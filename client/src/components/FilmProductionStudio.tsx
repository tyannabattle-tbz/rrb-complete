import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Plus, Trash2, Edit, Play, Download } from 'lucide-react';
import { createDragonInDaHoodFilm, createFilmProducer } from '@/lib/filmProduction';

export interface FilmProductionStudioProps {
  dragonImage1: string;
  dragonImage2: string;
  onFilmGenerated?: (filmData: string) => void;
}

export function FilmProductionStudio({
  dragonImage1,
  dragonImage2,
  onFilmGenerated,
}: FilmProductionStudioProps) {
  const [film, setFilm] = useState(() => createDragonInDaHoodFilm(dragonImage1, dragonImage2));
  const [producer] = useState(() => createFilmProducer(film));
  const [selectedSceneId, setSelectedSceneId] = useState(film.scenes[0]?.id);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedScene = film.scenes.find((s) => s.id === selectedSceneId);
  const timeline = producer.getTimeline();

  const handleExportFilm = () => {
    const filmData = producer.export();
    if (onFilmGenerated) {
      onFilmGenerated(filmData);
    }

    // Trigger download
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(filmData)}`);
    element.setAttribute('download', `${film.title.replace(/\s+/g, '-')}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePlayFilm = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (producer.removeScene(sceneId)) {
      setFilm({ ...film, scenes: film.scenes.filter((s) => s.id !== sceneId) });
      if (selectedSceneId === sceneId) {
        setSelectedSceneId(film.scenes[0]?.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Film Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{film.title}</h2>
              <p className="text-purple-100">{film.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{film.totalDuration}s</p>
            <p className="text-purple-100">{film.scenes.length} scenes</p>
          </div>
        </div>
      </Card>

      {/* Film Controls */}
      <div className="flex gap-2">
        <Button onClick={handlePlayFilm} className="flex-1" size="lg">
          <Play className="w-4 h-4 mr-2" />
          {isPlaying ? 'Pause Film' : 'Play Film'}
        </Button>
        <Button onClick={handleExportFilm} variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Export Film
        </Button>
      </div>

      {/* Main Editor */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Film Timeline</h3>
            <div className="space-y-2">
              {timeline.map((item, index) => (
                <div
                  key={item.sceneId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSceneId === item.sceneId
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedSceneId(item.sceneId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">
                        Scene {index + 1}: {item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.startTime.toFixed(1)}s - {item.endTime.toFixed(1)}s ({item.duration}s)
                      </p>
                    </div>
                    <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(item.duration / film.totalDuration) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {film.scenes.map((scene, index) => (
              <Card
                key={scene.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedSceneId === scene.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedSceneId(scene.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Scene {index + 1}</p>
                      <h4 className="font-semibold">{scene.title}</h4>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit scene
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScene(scene.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{scene.description}</p>

                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {scene.duration}s
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {scene.animations.length} effects
                    </span>
                    {scene.voiceOver && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        Voice Over
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add New Scene
          </Button>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {selectedScene ? (
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedScene.title}</h3>
                <p className="text-gray-600">{selectedScene.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{selectedScene.duration}s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Animation Effects</p>
                  <p className="font-semibold">{selectedScene.animations.length}</p>
                </div>
              </div>

              {selectedScene.animations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Effects</p>
                  <div className="space-y-2">
                    {selectedScene.animations.map((anim, idx) => (
                      <div key={`item-${idx}`} className="p-2 bg-gray-100 rounded text-sm">
                        <p className="font-medium capitalize">{anim.effect}</p>
                        <p className="text-gray-600">
                          Duration: {anim.duration}s | Intensity: {anim.intensity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedScene.voiceOver && (
                <div>
                  <p className="text-sm font-semibold mb-2">Voice Over</p>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm">{selectedScene.voiceOver.text}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Starts at {selectedScene.voiceOver.startTime}s, Duration: {selectedScene.voiceOver.duration}s
                    </p>
                  </div>
                </div>
              )}

              {selectedScene.soundEffects && selectedScene.soundEffects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Sound Effects</p>
                  <div className="space-y-2">
                    {selectedScene.soundEffects.map((sfx, idx) => (
                      <div key={`item-${idx}`} className="p-2 bg-orange-50 rounded border border-orange-200 text-sm">
                        <p className="font-medium">{sfx.name}</p>
                        <p className="text-gray-600">
                          {sfx.startTime}s - {sfx.startTime + sfx.duration}s (Volume: {sfx.volume})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              <p>Select a scene to view details</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Film Metadata */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Director</p>
            <p className="font-semibold">{film.director}</p>
          </div>
          <div>
            <p className="text-gray-600">Genre</p>
            <p className="font-semibold">{film.genre}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold capitalize">{film.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-semibold">{film.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
