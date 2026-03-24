'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users, Mic, Volume2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  isSystemMessage?: boolean;
  audioUrl?: string;
}

interface BandMember {
  id: string;
  name: string;
  instrument: string;
  status: 'connected' | 'disconnected' | 'recording';
  latency: number;
  isTyping?: boolean;
}

interface CollaborationChatProps {
  bandMembers: BandMember[];
  performanceId: string;
  isPerforming: boolean;
}

export function BandCollaborationChat({ bandMembers, performanceId, isPerforming }: CollaborationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecordingVoiceMessage, setIsRecordingVoiceMessage] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate receiving messages from other band members
  useEffect(() => {
    if (!isPerforming) return;

    const interval = setInterval(() => {
      // Randomly simulate a message from a band member
      const randomMember = bandMembers[Math.floor(Math.random() * bandMembers.length)];
      if (randomMember && Math.random() > 0.7) {
        const sampleMessages = [
          `${randomMember.name} is ready!`,
          `Adjusting my ${randomMember.instrument}...`,
          `Can you hear me okay?`,
          `Let's sync up!`,
          `Feeling good about this take!`,
          `One more time?`,
          `Perfect timing!`,
        ];
        
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: randomMember.name,
          senderRole: randomMember.instrument,
          message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        if (!showChatPanel) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isPerforming, bandMembers, showChatPanel]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Broadcast typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete('You');
        return updated;
      });
    }, 3000);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'You',
      senderRole: 'Producer',
      message: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsSending(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSending(false);

    toast.success('Message sent to all band members');
  };

  const startVoiceMessage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const voiceMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'You',
          senderRole: 'Producer',
          message: '🎤 Voice Message',
          timestamp: new Date(),
          audioUrl,
        };

        setMessages(prev => [...prev, voiceMessage]);
        toast.success('Voice message sent');
      };

      mediaRecorder.start();
      setIsRecordingVoiceMessage(true);
      toast.info('Recording voice message...');
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopVoiceMessage = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoiceMessage(false);
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400';
      case 'recording':
        return 'bg-red-500/20 text-red-400';
      case 'disconnected':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (!showChatPanel) {
    return (
      <Button
        onClick={() => {
          setShowChatPanel(true);
          setUnreadCount(0);
        }}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 via-purple-900/20 to-slate-800/80 border-purple-500/20 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Band Collaboration</CardTitle>
            <Badge className="bg-purple-500/20 text-purple-300 text-xs">LIVE</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowChatPanel(false)}
            className="text-slate-400 hover:text-slate-300"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>Real-time communication during performance</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
        {/* Band Members Status */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Band Members ({bandMembers.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {bandMembers.map((member) => (
              <div
                key={member.id}
                className={`p-2 rounded-lg border border-purple-500/10 text-xs ${getMemberStatusColor(member.status)}`}
              >
                <div className="font-semibold">{member.name}</div>
                <div className="text-[10px] opacity-75">{member.instrument}</div>
                {member.isTyping && (
                  <div className="text-[10px] mt-1 animate-pulse">typing...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 bg-slate-900/40 rounded-lg p-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'You'
                      ? 'bg-purple-600/40 text-white'
                      : 'bg-slate-700/40 text-slate-200'
                  }`}
                >
                  {msg.sender !== 'You' && (
                    <div className="text-xs font-semibold text-purple-300 mb-1">
                      {msg.sender} • {msg.senderRole}
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  {msg.audioUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          const audio = new Audio(msg.audioUrl);
                          audio.play();
                        }}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-slate-400">Voice message</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="space-y-2 border-t border-purple-500/10 pt-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="bg-slate-700/60 border-purple-500/20 text-white text-sm"
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Voice Message Button */}
          <Button
            onClick={isRecordingVoiceMessage ? stopVoiceMessage : startVoiceMessage}
            size="sm"
            className={`w-full ${
              isRecordingVoiceMessage
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecordingVoiceMessage ? 'Stop Recording' : 'Voice Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
