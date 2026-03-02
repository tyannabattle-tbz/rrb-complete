import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, Download, Share2, Clock, Eye } from "lucide-react";

interface VODStream {
  id: string;
  title: string;
  broadcaster: string;
  thumbnail: string;
  duration: number;
  views: number;
  date: Date;
  quality: string;
  description: string;
}

const mockVODs: VODStream[] = [
  {
    id: "vod_1",
    title: "Tech Conference 2026 - Opening Keynote",
    broadcaster: "Tech Summit",
    thumbnail: "🎥",
    duration: 3600,
    views: 5234,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    quality: "4K",
    description: "Opening keynote from the Tech Conference 2026 featuring industry leaders discussing AI and innovation.",
  },
  {
    id: "vod_2",
    title: "Live Coding Session - Building Accessible Apps",
    broadcaster: "Dev Academy",
    thumbnail: "💻",
    duration: 7200,
    views: 3421,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    quality: "1080p",
    description: "Learn how to build accessible web applications with real-time coding examples and best practices.",
  },
  {
    id: "vod_3",
    title: "Business Networking Event - London",
    broadcaster: "Business Network",
    thumbnail: "🤝",
    duration: 5400,
    views: 2156,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    quality: "1080p",
    description: "Networking event featuring industry professionals and entrepreneurs from around the world.",
  },
];

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const BroadcastVOD: React.FC = () => {
  const [selectedVOD, setSelectedVOD] = useState<VODStream | null>(mockVODs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Video Player */}
      {selectedVOD && (
        <Card className="overflow-hidden bg-black">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {/* Placeholder Video */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-6xl">{selectedVOD.thumbnail}</div>
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center hover:bg-black/30 transition-colors group"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors shadow-lg">
                {isPlaying ? (
                  <Pause size={40} className="text-white ml-1" />
                ) : (
                  <Play size={40} className="text-white ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* Player Controls */}
          <div className="bg-gray-900 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={selectedVOD.duration}
                value={currentTime}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Video progress"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(selectedVOD.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>

                <div className="flex items-center gap-2">
                  <Volume2 size={18} className="text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    aria-label="Volume control"
                  />
                  <span className="text-xs text-gray-400 w-8">{volume}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                  aria-label="Download video"
                >
                  <Download size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800"
                  aria-label="Share video"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6 bg-white space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedVOD.title}</h2>
              <p className="text-gray-600 mb-4">{selectedVOD.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Eye size={16} />
                {selectedVOD.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {formatDate(selectedVOD.date)}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {selectedVOD.quality}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {formatDuration(selectedVOD.duration)}
              </span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Broadcaster:</strong> {selectedVOD.broadcaster}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* VOD Library */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Video Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockVODs.map((vod) => (
            <Card
              key={vod.id}
              onClick={() => {
                setSelectedVOD(vod);
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                selectedVOD?.id === vod.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black aspect-video flex items-center justify-center group">
                <div className="text-5xl">{vod.thumbnail}</div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Play size={40} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <h4 className="font-semibold text-sm line-clamp-2">{vod.title}</h4>
                <p className="text-xs text-gray-600">{vod.broadcaster}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {vod.views.toLocaleString()}
                  </span>
                  <span>{formatDuration(vod.duration)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
