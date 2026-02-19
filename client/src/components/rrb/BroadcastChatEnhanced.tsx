import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BroadcastChatEnhancedProps {
  broadcastId: string;
}

export function BroadcastChatEnhanced({ broadcastId }: BroadcastChatEnhancedProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = trpc.broadcastChat.getMessages.useQuery({
    broadcastId,
  });

  // Fetch viewer count
  const { data: viewerData } = trpc.broadcastChat.getViewerCount.useQuery({
    broadcastId,
  });

  // Fetch chat stats
  const { data: statsData } = trpc.broadcastChat.getChatStats.useQuery({
    broadcastId,
  });

  // Send message mutation
  const sendMessageMutation = trpc.broadcastChat.sendMessage.useMutation({
    onSuccess: () => {
      setInputMessage('');
      // Refetch messages
      trpc.broadcastChat.getMessages.useQuery({ broadcastId });
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  // Search messages mutation
  const searchMutation = trpc.broadcastChat.searchMessages.useQuery(
    { broadcastId, query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    await sendMessageMutation.mutateAsync({
      broadcastId,
      user: 'You',
      message: inputMessage,
      avatar: '👤',
    });

    toast.success('Message sent to chat');
  };

  const messages = messagesData?.data || [];
  const viewers = viewerData?.data?.viewers || 0;
  const stats = statsData?.data;
  const searchResults = searchMutation.data?.data || [];

  const displayMessages = showSearch && searchQuery ? searchResults : messages;

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Live Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-32"
              />
            </div>
          )}
          <Button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            <span>{viewers}</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-gray-850 border-b border-gray-700 px-4 py-2 flex gap-4 text-xs text-gray-400">
          <span>Messages: {stats.totalMessages}</span>
          <span>Users: {stats.uniqueUsers}</span>
          <span>Rate: {stats.messageRate.toFixed(1)}/min</span>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">
              {showSearch && searchQuery ? 'No messages found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          displayMessages.map((msg) => (
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
          ))
        )}
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
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
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
