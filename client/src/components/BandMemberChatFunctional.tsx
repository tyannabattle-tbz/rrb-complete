'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
}

interface BandMember {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'recording';
  avatar: string;
}

const BAND_MEMBERS: BandMember[] = [
  { id: '1', name: 'Chris Battle Sr', status: 'online', avatar: '👨‍🎤' },
  { id: '2', name: 'C.J. Battle', status: 'online', avatar: '🎸' },
  { id: '3', name: 'Kairen Battle', status: 'recording', avatar: '🥁' },
  { id: '4', name: 'AP/Amandes Studio', status: 'online', avatar: '🎹' },
];

export function BandMemberChatFunctional() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Chris Battle Sr',
      content: '🎵 Ready for tonight\'s performance?',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
    },
    {
      id: '2',
      sender: 'C.J. Battle',
      content: '🔥 Let\'s bring the heat! Sound check in 10?',
      timestamp: new Date(Date.now() - 240000),
      type: 'text',
    },
    {
      id: '3',
      sender: 'Kairen Battle',
      content: '🥁 Drums are locked and loaded',
      timestamp: new Date(Date.now() - 180000),
      type: 'text',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: inputValue,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
    }
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice recording
      setTimeout(() => {
        const voiceMessage: Message = {
          id: Date.now().toString(),
          sender: 'You',
          content: '🎤 Voice message recorded',
          timestamp: new Date(),
          type: 'voice',
        };
        setMessages([...messages, voiceMessage]);
        setIsRecording(false);
      }, 3000);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      {/* Band Members Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BAND_MEMBERS.map((member) => (
          <Card key={member.id} className="bg-slate-700/40 border-slate-600/30 p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{member.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      member.status === 'online'
                        ? 'bg-green-500'
                        : member.status === 'recording'
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400 capitalize">{member.status}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chat Messages */}
      <Card className="bg-slate-700/40 border-slate-600/30 h-96 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'You'
                      ? 'bg-purple-600/60 text-white'
                      : 'bg-slate-600/60 text-slate-100'
                  }`}
                >
                  {message.sender !== 'You' && (
                    <p className="text-xs font-semibold text-slate-300 mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="bg-slate-700/40 border-slate-600/30 text-white placeholder:text-slate-500"
        />
        <Button
          onClick={handleVoiceMessage}
          variant={isRecording ? 'destructive' : 'outline'}
          size="icon"
          className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button
          onClick={handleSendMessage}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} className="hidden" />

      {/* Info */}
      <div className="text-sm text-slate-400">
        <p>💬 {messages.length} messages • 🎤 Real-time band communication</p>
      </div>
    </div>
  );
}
