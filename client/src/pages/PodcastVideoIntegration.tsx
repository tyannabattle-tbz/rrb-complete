'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Settings, Download, Share2, Clock, BookOpen } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  timestamp: number;
  description: string;
}

interface PodcastVideo {
  id: string;
  title: string;
  episodeNumber: number;
  duration: number;
  videoUrl: string;
  audioUrl: string;
  thumbnail: string;
  description: string;
  chapters: Chapter[];
  transcript: string;
  views: number;
  likes: number;
  publishDate: number;
}

const mockPodcast: PodcastVideo = {
  id: '1',
  title: 'The Future of AI in Music Production',
  episodeNumber: 42,
  duration: 3600,
  videoUrl: 'https://example.com/video.mp4',
  audioUrl: 'https://example.com/audio.mp3',
  thumbnail: 'https://via.placeholder.com/1280x720',
  description: 'In this episode, we explore how AI is transforming music production and creative workflows.',
  chapters: [
    { id: '1', title: 'Introduction', timestamp: 0, description: 'Welcome to the show' },
    { id: '2', title: 'AI Basics', timestamp: 300, description: 'Understanding artificial intelligence' },
    { id: '3', title: 'Music Production Tools', timestamp: 900, description: 'AI-powered production software' },
    { id: '4', title: 'Case Studies', timestamp: 1800, description: 'Real-world examples' },
    { id: '5', title: 'Future Outlook', timestamp: 2700, description: 'What\'s next for AI in music' },
    { id: '6', title: 'Q&A', timestamp: 3300, description: 'Listener questions answered' },
  ],
  transcript: 'Full episode transcript would appear here with timestamps...',
  views: 15420,
  likes: 2340,
  publishDate: Date.now() - 86400000 * 7,
};

export default function PodcastVideoIntegration() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [quality, setQuality] = useState('1080p');
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentTime(chapter.timestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = chapter.timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-purple-900/30 border-purple-500">
              Episode {mockPodcast.episodeNumber}
            </Badge>
            <Badge variant="outline" className="bg-blue-900/30 border-blue-500">
              {formatTime(mockPodcast.duration)}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{mockPodcast.title}</h1>
          <p className="text-slate-400 mb-4">{mockPodcast.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>👁️ {mockPodcast.views.toLocaleString()} views</span>
            <span>❤️ {mockPodcast.likes.toLocaleString()} likes</span>
            <span>📅 {new Date(mockPodcast.publishDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  src={mockPodcast.videoUrl}
                  poster={mockPodcast.thumbnail}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTime)}
                />
                {!isPlaying && (
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition"
                  >
                    <Play className="w-16 h-16 text-white" />
                  </button>
                )}
              </div>

              {/* Video Controls */}
              <CardContent className="pt-6 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={mockPodcast.duration}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(mockPodcast.duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                          } else {
                            videoRef.current.play();
                          }
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 border-0"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          if (videoRef.current) {
                            videoRef.current.volume = newVolume;
                          }
                        }}
                        className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="px-3 py-1 bg-slate-700 text-white text-sm rounded border border-slate-600 hover:border-slate-500"
                    >
                      <option>480p</option>
                      <option>720p</option>
                      <option selected>1080p</option>
                      <option>4K</option>
                    </select>

                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Chapters & Transcript */}
          <div className="space-y-6">
            {/* Chapter Markers */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Chapters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockPodcast.chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-purple-900/40 border border-purple-500'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{chapter.title}</p>
                        <p className="text-slate-400 text-xs">{chapter.description}</p>
                      </div>
                      <span className="text-slate-400 text-xs whitespace-nowrap ml-2">
                        {formatTime(chapter.timestamp)}
                      </span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Transcript Toggle */}
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>

            {/* Transcript Preview */}
            {showTranscript && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-300 text-sm space-y-2 max-h-96 overflow-y-auto">
                    <p className="text-slate-400 italic">
                      [00:00] Welcome to the podcast. Today we're discussing the future of AI in music production...
                    </p>
                    <p className="text-slate-400 italic">
                      [05:00] Let's start with the basics of artificial intelligence and how it's being applied...
                    </p>
                    <p className="text-slate-400 italic">
                      [15:00] There are several AI-powered tools available for music producers today...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
