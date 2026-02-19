import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  avatar: string;
}

interface BroadcastChatProps {
  broadcastId?: string;
}

export function BroadcastChat({ broadcastId }: BroadcastChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'StreamHost',
      message: '🎙️ Welcome to the live broadcast! Feel free to join the conversation.',
      timestamp: new Date(Date.now() - 5 * 60000),
      avatar: '🎙️',
    },
    {
      id: '2',
      user: 'Listener_42',
      message: 'Great energy today! Love the frequency tuning feature.',
      timestamp: new Date(Date.now() - 3 * 60000),
      avatar: '👤',
    },
    {
      id: '3',
      user: 'MusicLover',
      message: '432 Hz is my favorite! The healing frequency is amazing.',
      timestamp: new Date(Date.now() - 1 * 60000),
      avatar: '🎵',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(127);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: inputMessage,
      timestamp: new Date(),
      avatar: '👤',
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    toast.success('Message sent to chat');

    // Simulate other viewers sending messages
    setTimeout(() => {
      const responses = [
        'That was a great point!',
        'Thanks for sharing!',
        '💯 Totally agree',
        'Love this content!',
        'Keep it up!',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const randomUser = ['Listener_' + Math.floor(Math.random() * 1000), 'Viewer_' + Math.floor(Math.random() * 1000)][Math.floor(Math.random() * 2)];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: randomUser,
          message: randomResponse,
          timestamp: new Date(),
          avatar: '👤',
        },
      ]);

      // Simulate viewer count changes
      setViewerCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Live Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users className="w-4 h-4" />
          <span>{viewerCount} viewers</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
              {msg.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-white">{msg.user}</span>
                <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-200 break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border-t border-gray-700 p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400">Press Enter to send • Shift+Enter for new line</p>
      </div>
    </Card>
  );
}
