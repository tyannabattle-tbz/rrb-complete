import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Download, Zap } from "lucide-react";
import { toast } from "sonner";

interface VideoEditorProps {
  videoUrl: string;
  videoId: string;
  onSave?: (editedVideo: Blob) => void;
}

export default function VideoEditor({ videoUrl, videoId, onSave }: VideoEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);

  const effects = [
    { id: "grayscale", name: "Grayscale", filter: "grayscale(100%)" },
    { id: "sepia", name: "Sepia", filter: "sepia(100%)" },
    { id: "blur", name: "Blur", filter: "blur(5px)" },
    { id: "invert", name: "Invert", filter: "invert(100%)" },
    { id: "huerotate", name: "Hue Rotate", filter: "hue-rotate(90deg)" },
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSpeed(1);
    setSelectedEffect(null);
    toast.success("Reset to original");
  };

  const handleDownload = () => {
    toast.success("Download started!");
    // In production, would process the video with selected edits
  };

  const handleApplyEffect = (effectId: string) => {
    setSelectedEffect(selectedEffect === effectId ? null : effectId);
    toast.success(`Effect ${selectedEffect === effectId ? "removed" : "applied"}`);
  };

  const getFilterStyle = () => {
    const effect = effects.find((e) => e.id === selectedEffect);
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
        effect ? effect.filter : ""
      }`,
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Video Preview */}
      <Card className="overflow-hidden bg-black">
        <div className="relative aspect-video flex items-center justify-center">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            style={getFilterStyle()}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group"
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-muted p-4 space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={(val) => setCurrentTime(val[0])}
            max={duration}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
            </span>
            <span>
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
            </span>
          </div>
        </div>
      </Card>

      {/* Editing Tools */}
      <Tabs defaultValue="trim" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trim">Trim</TabsTrigger>
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="speed">Speed</TabsTrigger>
        </TabsList>

        {/* Trim Tab */}
        <TabsContent value="trim" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Trim Video</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Time: {trimStart}%</label>
                <Slider
                  value={[trimStart]}
                  onValueChange={(val) => setTrimStart(Math.min(val[0], trimEnd - 1))}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Time: {trimEnd}%</label>
                <Slider
                  value={[trimEnd]}
                  onValueChange={(val) => setTrimEnd(Math.max(val[0], trimStart + 1))}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Color Tab */}
        <TabsContent value="color" className="space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Color Adjustments</h3>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Brightness: {brightness}%
              </label>
              <Slider
                value={[brightness]}
                onValueChange={(val) => setBrightness(val[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Contrast: {contrast}%</label>
              <Slider
                value={[contrast]}
                onValueChange={(val) => setContrast(val[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Saturation: {saturation}%
              </label>
              <Slider
                value={[saturation]}
                onValueChange={(val) => setSaturation(val[0])}
                min={0}
                max={200}
                step={1}
                className="w-full"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Visual Effects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {effects.map((effect) => (
                <Button
                  key={effect.id}
                  variant={selectedEffect === effect.id ? "default" : "outline"}
                  onClick={() => handleApplyEffect(effect.id)}
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {effect.name}
                </Button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Speed Tab */}
        <TabsContent value="speed" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Playback Speed</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Speed: {speed}x</label>
                <Slider
                  value={[speed]}
                  onValueChange={(val) => setSpeed(val[0])}
                  min={0.25}
                  max={2}
                  step={0.25}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 0.75, 1, 1.5, 2].map((s) => (
                  <Button
                    key={s}
                    variant={speed === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSpeed(s)}
                  >
                    {s}x
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download Edited Video
        </Button>
      </div>
    </div>
  );
}
