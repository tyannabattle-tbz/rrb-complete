import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';

export default function RadioStationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [currentStation, setCurrentStation] = useState<string | null>(null);

  const { data: stations } = trpc.radioStations.getStations.useQuery();
  const { data: currentTrack } = trpc.radioStations.getCurrentTrack.useQuery(
    { stationId: currentStation || '' },
    { enabled: !!currentStation }
  );

  const playMutation = trpc.radioStations.play.useMutation();
  const pauseMutation = trpc.radioStations.pause.useMutation();

  const handlePlay = async (stationId: string) => {
    setCurrentStation(stationId);
    setIsPlaying(true);
    await playMutation.mutateAsync({ stationId });
  };

  const handlePause = async () => {
    setIsPlaying(false);
    if (currentStation) {
      await pauseMutation.mutateAsync({ stationId: currentStation });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Rockin' Radio Station</h1>
          <p className="text-slate-300">Stream your favorite music and shows</p>
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Music className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{currentTrack.title}</h2>
                <p className="text-slate-300">{currentTrack.artist}</p>
                <p className="text-sm text-slate-400 mt-2">{currentTrack.album}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Player Controls */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={currentTrack?.duration || 100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack?.duration || 0)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full w-16 h-16"
                onClick={() => (isPlaying ? handlePause() : handlePlay(currentStation || ''))}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-slate-400" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume(v[0])}
                className="flex-1"
              />
              <span className="text-sm text-slate-400 w-12 text-right">{volume}%</span>
            </div>
          </div>
        </Card>

        {/* Stations Grid */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Available Stations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations?.map((station) => (
              <Card
                key={station.id}
                className={`cursor-pointer transition-all border-2 p-4 ${
                  currentStation === station.id
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500'
                }`}
                onClick={() => handlePlay(station.id)}
              >
                <h4 className="font-bold text-lg mb-2">{station.name}</h4>
                <p className="text-sm opacity-80">{station.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Play Station</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

import { Music } from 'lucide-react';
