'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Paperclip, MoreVertical, User, CheckCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'system';
  read: boolean;
  voiceUrl?: string;
}

interface BandMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'recording';
  avatar?: string;
}

export function BandMemberChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [bandMembers, setBandMembers] = useState<BandMember[]>([
    { id: '1', name: 'Chris Battle Sr', role: 'Lead Vocals', status: 'online' },
    { id: '2', name: 'C.J. Battle', role: 'Guitar', status: 'online' },
    { id: '3', name: 'Kairen Battle', role: 'Bass', status: 'recording' },
    { id: '4', name: 'AP/Amandes', role: 'Producer', status: 'online' },
  ]);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate incoming messages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        addSystemMessage('Chris Battle Sr joined the chat');
        addSystemMessage('C.J. Battle joined the chat');
        addSystemMessage('Kairen Battle joined the chat');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'System',
      senderRole: 'system',
      message: text,
      timestamp: new Date(),
      type: 'system',
      read: true,
    }]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      senderRole: 'Producer',
      message: inputValue,
      timestamp: new Date(),
      type: 'text',
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate typing indicator
    setTypingIndicator('C.J. Battle');
    setTimeout(() => setTypingIndicator(null), 2000);

    // Simulate response
    setTimeout(() => {
      const response: ChatMessage = {
        id: Date.now().toString(),
        sender: 'C.J. Battle',
        senderRole: 'Guitar',
        message: 'Sounds great! Ready when you are.',
        timestamp: new Date(),
        type: 'text',
        read: false,
      };
      setMessages(prev => [...prev, response]);
    }, 2500);
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.success('Recording voice message...');
    } else {
      setIsRecording(false);
      
      const voiceMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        senderRole: 'Producer',
        message: 'Voice message (0:15)',
        timestamp: new Date(),
        type: 'voice',
        read: false,
        voiceUrl: 'https://example.com/voice.mp3',
      };

      setMessages(prev => [...prev, voiceMessage]);
      toast.success('Voice message sent');
    }
  };

  const getStatusColor = (status: BandMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'recording':
        return 'bg-red-500 animate-pulse';
      case 'offline':
        return 'bg-slate-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusText = (status: BandMember['status']) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'recording':
        return 'Recording';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-96">
      {/* Band Members List */}
      <Card className="bg-slate-800/40 border-slate-700/30 col-span-1">
        <CardHeader>
          <CardTitle className="text-sm text-white">Band Members</CardTitle>
          <CardDescription>{bandMembers.filter(m => m.status !== 'offline').length} Online</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {bandMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-slate-700/30 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                <p className="text-xs text-slate-400">{getStatusText(member.status)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-slate-800/40 border-slate-700/30 col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm text-white">Live Performance Chat</CardTitle>
          <CardDescription>Real-time band communication</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.type === 'system'
                    ? 'bg-slate-700/30 text-slate-400 text-xs text-center'
                    : msg.sender === 'You'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                }`}
              >
                {msg.type !== 'system' && (
                  <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender}</p>
                )}
                {msg.type === 'voice' ? (
                  <div className="flex items-center gap-2">
                    <Mic className="w-3 h-3" />
                    <span className="text-xs">{msg.message}</span>
                  </div>
                ) : (
                  <p className="text-sm">{msg.message}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-50">
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.sender === 'You' && (
                    msg.read ? <CheckCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {typingIndicator && (
            <div className="flex gap-2 items-center text-slate-400 text-xs">
              <span>{typingIndicator} is typing</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="border-t border-slate-700/30 pt-3 space-y-2">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="bg-slate-700/30 border-slate-600 text-white placeholder-slate-500"
            />
            <Button
              onClick={handleVoiceMessage}
              size="sm"
              className={isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 text-xs text-slate-400">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <Paperclip className="w-3 h-3 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
