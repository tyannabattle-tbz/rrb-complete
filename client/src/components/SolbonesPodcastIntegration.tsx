/**
 * Solbones Podcast Integration with Customizable Templates
 * Video-integrated podcast viewer with interactive features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, MessageCircle, Gamepad2, Mic, Video, Share2, Download } from 'lucide-react';

interface PodcastTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'video-primary' | 'video-side' | 'split-view' | 'gallery';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: Array<'chat' | 'game' | 'ai-assistant' | 'call-in'>;
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  audioUrl: string;
  thumbnail: string;
  speakers: Array<{ name: string; role: string; image: string }>;
  publishedAt: Date;
  views: number;
  likes: number;
}

interface SolbonesPodcastIntegrationProps {
  template?: PodcastTemplate;
  episode?: PodcastEpisode;
}

export const SolbonesPodcastIntegration: React.FC<SolbonesPodcastIntegrationProps> = ({
  template,
  episode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [activeTab, setActiveTab] = useState<'chat' | 'game' | 'ai' | 'info'>('info');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; timestamp: Date }>>([
    { user: 'Dr. Jane Smith', message: 'Great insights on water conservation!', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { user: 'Prof. Chen', message: 'The climate data is compelling', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
  ]);
  const [gameActive, setGameActive] = useState(false);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [callInActive, setCallInActive] = useState(false);

  const defaultTemplate: PodcastTemplate = template || {
    id: 'template-1',
    name: 'Professional Broadcast',
    description: 'Video-primary layout with interactive features',
    layout: 'video-primary',
    colors: {
      primary: '#1e40af',
      secondary: '#0f172a',
      accent: '#f97316',
    },
    features: ['chat', 'ai-assistant', 'call-in'],
  };

  const defaultEpisode: PodcastEpisode = episode || {
    id: 'ep-1',
    title: 'UN WCS: Water, Climate & Sustainability',
    description: 'A groundbreaking discussion on global conservation challenges and solutions',
    duration: 120,
    videoUrl: 'https://example.com/video.mp4',
    audioUrl: 'https://example.com/audio.mp3',
    thumbnail: 'https://example.com/thumb.jpg',
    speakers: [
      { name: 'Dr. Jane Smith', role: 'Moderator', image: 'https://example.com/jane.jpg' },
      { name: 'Prof. Michael Chen', role: 'Climate Scientist', image: 'https://example.com/chen.jpg' },
      { name: 'Dr. Sarah Johnson', role: 'Water Policy Expert', image: 'https://example.com/sarah.jpg' },
    ],
    publishedAt: new Date('2026-03-17T09:00:00Z'),
    views: 4250,
    likes: 1240,
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (message: string) => {
    setChatMessages([
      ...chatMessages,
      { user: 'You', message, timestamp: new Date() },
    ]);
  };

  return (
    <div className="w-full bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Main Video Player */}
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        
        {/* Video Placeholder */}
        <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Video Player</p>
          </div>
        </div>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <div className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </button>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="bg-gray-700 h-1 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all"
                style={{ width: `${(currentTime / defaultEpisode.duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(defaultEpisode.duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-full accent-orange-500"
                />
                <span className="text-xs text-gray-300 w-6">{volume}%</span>
              </div>
            </div>

            <div className="text-sm font-medium">{defaultEpisode.title}</div>
          </div>
        </div>
      </div>

      {/* Episode Info & Interactive Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Left: Episode Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{defaultEpisode.title}</h1>
            <p className="text-gray-400 mb-3">{defaultEpisode.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{defaultEpisode.views.toLocaleString()} views</span>
              <span>{defaultEpisode.likes.toLocaleString()} likes</span>
              <span>{formatTime(defaultEpisode.duration)} duration</span>
            </div>
          </div>

          {/* Speakers */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Speakers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {defaultEpisode.speakers.map((speaker, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mb-2" />
                  <p className="font-medium text-sm">{speaker.name}</p>
                  <p className="text-xs text-gray-400">{speaker.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Features Buttons */}
          <div className="flex flex-wrap gap-2">
            {defaultTemplate.features.includes('chat') && (
              <Button
                variant={activeTab === 'chat' ? 'default' : 'outline'}
                onClick={() => setActiveTab('chat')}
                className="gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </Button>
            )}
            {defaultTemplate.features.includes('game') && (
              <Button
                variant={activeTab === 'game' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('game');
                  setGameActive(!gameActive);
                }}
                className="gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Solbones Game
              </Button>
            )}
            {defaultTemplate.features.includes('ai-assistant') && (
              <Button
                variant={activeTab === 'ai' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('ai');
                  setAiAssistantActive(!aiAssistantActive);
                }}
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                AI Assistant
              </Button>
            )}
            {defaultTemplate.features.includes('call-in') && (
              <Button
                variant="outline"
                onClick={() => setCallInActive(!callInActive)}
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                Call In
              </Button>
            )}
          </div>
        </div>

        {/* Right: Interactive Panel */}
        <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-hidden flex flex-col">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <h3 className="font-semibold mb-3">Live Chat</h3>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-orange-400">{msg.user}</p>
                    <p className="text-gray-300">{msg.message}</p>
                    <p className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Send a message..."
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </>
          )}

          {/* Game Tab */}
          {activeTab === 'game' && (
            <>
              <h3 className="font-semibold mb-3">Solbones 4+3+2 Game</h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm text-gray-400">Game active on mobile devices</p>
                  <p className="text-xs text-gray-500 mt-2">Roll the sacred math dice and compete with other viewers</p>
                </div>
              </div>
            </>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <>
              <h3 className="font-semibold mb-3">AI Assistant</h3>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                <div className="bg-gray-700 rounded p-2 text-sm">
                  <p className="text-gray-300">Ask me anything about the broadcast or related topics.</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Ask a question..."
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
              />
            </>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <>
              <h3 className="font-semibold mb-3">Event Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400">Event</p>
                  <p className="font-medium">UN WCS Parallel Event</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="font-medium">March 17, 2026</p>
                </div>
                <div>
                  <p className="text-gray-400">Time</p>
                  <p className="font-medium">9:00 AM UTC</p>
                </div>
                <div>
                  <p className="text-gray-400">Viewers</p>
                  <p className="font-medium">{defaultEpisode.views.toLocaleString()}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Template Customization Section */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <h3 className="font-semibold mb-3">Customize Template</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['video-primary', 'video-side', 'split-view', 'gallery'].map((layout) => (
            <button
              key={layout}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                defaultTemplate.layout === layout
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {layout.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolbonesPodcastIntegration;
