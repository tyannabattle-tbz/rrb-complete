import React, { useState } from 'react';
import { Play, Pause, Volume2, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export const SimpleBroadcastViewer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'John', text: 'Great broadcast!', timestamp: new Date() },
    { id: '2', user: 'Sarah', text: 'Love this event', timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(2847);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          user: 'You',
          text: newMessage,
          timestamp: new Date(),
        },
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Main Video Player */}
      <Card className="bg-black rounded-lg overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-blue-900 to-black flex items-center justify-center relative">
          {/* Placeholder for video */}
          <div className="text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <h2 className="text-2xl font-bold text-white">UN WCS Broadcast</h2>
            <p className="text-gray-300 mt-2">March 17, 2026 • Live</p>
          </div>

          {/* Live Badge */}
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>

          {/* Viewer Count */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            👥 {viewerCount.toLocaleString()} watching
          </div>
        </div>

        {/* Player Controls */}
        <div className="bg-gray-900 p-4 space-y-3">
          {/* Play/Pause */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 flex-1">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400 w-8">{volume}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Event Info */}
      <Card className="p-4 bg-blue-50">
        <h3 className="font-bold text-lg mb-2">UN WCS Parallel Event</h3>
        <p className="text-gray-700 text-sm">
          Join us for a global conversation on climate action and sustainable development with panelists from around the world.
        </p>
      </Card>

      {/* Live Chat */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold">Live Chat</h3>
        </div>

        {/* Messages */}
        <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto space-y-2 mb-3">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <span className="font-semibold text-blue-600">{msg.user}:</span>
              <span className="text-gray-700 ml-2">{msg.text}</span>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SimpleBroadcastViewer;
