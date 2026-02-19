import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  MessageSquare,
  Settings,
  Eye,
  Radio,
  Plus,
  X,
  Volume2,
  VolumeX,
  Hand,
  CheckCircle,
} from 'lucide-react';

interface Collaborator {
  id: number;
  name: string;
  role: 'host' | 'guest' | 'moderator';
  isMuted: boolean;
  isCameraOff: boolean;
  isActive: boolean;
  audioLevel: number;
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  isModerator: boolean;
}

export function CollaborativeBroadcast() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: 'You (Host)',
      role: 'host',
      isMuted: false,
      isCameraOff: false,
      isActive: true,
      audioLevel: 85,
    },
    {
      id: 2,
      name: 'Guest Speaker',
      role: 'guest',
      isMuted: false,
      isCameraOff: false,
      isActive: true,
      audioLevel: 72,
    },
    {
      id: 3,
      name: 'Moderator',
      role: 'moderator',
      isMuted: true,
      isCameraOff: true,
      isActive: true,
      audioLevel: 0,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      user: 'Guest Speaker',
      message: 'Great to be here! Excited for this broadcast.',
      timestamp: '14:32',
      isModerator: false,
    },
    {
      id: 2,
      user: 'Moderator',
      message: 'We have 2.5K viewers tuned in!',
      timestamp: '14:33',
      isModerator: true,
    },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
  const [viewerCount, setViewerCount] = useState(2534);
  const [isLive, setIsLive] = useState(true);

  const toggleMute = (id: number) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const toggleCamera = (id: number) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCameraOff: !c.isCameraOff } : c))
    );
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          user: 'You',
          message: chatInput,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isModerator: false,
        },
      ]);
      setChatInput('');
    }
  };

  const removeCollaborator = (id: number) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const addCollaborator = () => {
    const newCollaborator: Collaborator = {
      id: Math.max(...collaborators.map((c) => c.id)) + 1,
      name: 'New Guest',
      role: 'guest',
      isMuted: true,
      isCameraOff: true,
      isActive: false,
      audioLevel: 0,
    };
    setCollaborators((prev) => [...prev, newCollaborator]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold text-white">Live Collaborative Broadcast</h1>
              {isLive && (
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded">
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-orange-400">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">{viewerCount.toLocaleString()}</span>
              </div>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? 'End Broadcast' : 'Start Broadcast'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Video */}
            <Card className="bg-gray-800 border-gray-700 overflow-hidden aspect-video">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative">
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Primary Video Stream</p>
                </div>

                {/* Collaborator Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-4 py-2 rounded">
                  <p className="text-white font-semibold">You (Host)</p>
                  <p className="text-gray-300 text-sm">Main Broadcast</p>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-green-600 px-3 py-1 rounded text-white text-sm font-semibold flex items-center gap-1">
                    <Mic className="w-4 h-4" /> Audio
                  </div>
                  <div className="bg-green-600 px-3 py-1 rounded text-white text-sm font-semibold flex items-center gap-1">
                    <Video className="w-4 h-4" /> Video
                  </div>
                </div>
              </div>
            </Card>

            {/* Collaborator Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collaborators ({collaborators.length})
                </h2>
                <Button
                  size="sm"
                  onClick={addCollaborator}
                  className="bg-orange-600 hover:bg-orange-700 gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Guest
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collaborators.map((collab) => (
                  <Card
                    key={collab.id}
                    className={`bg-gray-800 border-gray-700 overflow-hidden cursor-pointer transition-all ${
                      selectedCollaborator === collab.id
                        ? 'ring-2 ring-orange-500'
                        : ''
                    }`}
                    onClick={() => setSelectedCollaborator(collab.id)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center relative">
                      {collab.isCameraOff ? (
                        <div className="text-center">
                          <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400">{collab.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400">{collab.name}</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {collab.isActive ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        )}
                      </div>

                      {/* Role Badge */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-semibold text-white">
                        {collab.role === 'host' ? '🎤 Host' : collab.role === 'moderator' ? '👮 Mod' : '👤 Guest'}
                      </div>

                      {/* Audio Level */}
                      <div className="absolute bottom-2 left-2 w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                          style={{ width: `${collab.audioLevel}%` }}
                        ></div>
                      </div>

                      {/* Controls */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute(collab.id);
                          }}
                          className={
                            collab.isMuted
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }
                        >
                          {collab.isMuted ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCamera(collab.id);
                          }}
                          className={
                            collab.isCameraOff
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }
                        >
                          {collab.isCameraOff ? (
                            <VideoOff className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                        </Button>
                        {collab.role !== 'host' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCollaborator(collab.id);
                            }}
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-white font-semibold text-sm">{collab.name}</p>
                      <p className="text-gray-400 text-xs">
                        {collab.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Broadcast Controls */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-4">Broadcast Controls</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button className="bg-gray-700 hover:bg-gray-600 gap-2">
                  <Mic className="w-4 h-4" /> Mute All
                </Button>
                <Button className="bg-gray-700 hover:bg-gray-600 gap-2">
                  <Volume2 className="w-4 h-4" /> Audio Mix
                </Button>
                <Button className="bg-gray-700 hover:bg-gray-600 gap-2">
                  <Share2 className="w-4 h-4" /> Share Screen
                </Button>
                <Button className="bg-gray-700 hover:bg-gray-600 gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar - Chat & Info */}
          <div className="space-y-6">
            {/* Live Chat */}
            <Card className="bg-gray-800 border-gray-700 flex flex-col h-96">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Live Chat
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{msg.user}</p>
                      {msg.isModerator && (
                        <span className="px-1.5 py-0.5 bg-orange-600 text-white text-xs rounded">
                          MOD
                        </span>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">{msg.timestamp}</p>
                    </div>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send message..."
                    className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="sm"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>

            {/* Broadcast Stats */}
            <Card className="bg-gray-800 border-gray-700 p-4 space-y-3">
              <h3 className="text-white font-semibold">Broadcast Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Viewers</span>
                  <span className="text-white font-semibold">{viewerCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white font-semibold">45:32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bitrate</span>
                  <span className="text-white font-semibold">5.2 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Collaborators</span>
                  <span className="text-white font-semibold">{collaborators.length}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700 p-4 space-y-2">
              <Button className="w-full bg-gray-700 hover:bg-gray-600 gap-2 justify-start">
                <Hand className="w-4 h-4" /> Raise Hand
              </Button>
              <Button className="w-full bg-gray-700 hover:bg-gray-600 gap-2 justify-start">
                <CheckCircle className="w-4 h-4" /> Approve Guest
              </Button>
              <Button className="w-full bg-gray-700 hover:bg-gray-600 gap-2 justify-start">
                <Radio className="w-4 h-4" /> Schedule Next
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
