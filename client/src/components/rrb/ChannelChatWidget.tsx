import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  likes: number;
}

interface ChannelChatWidgetProps {
  channelId: string;
  channelName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelChatWidget: React.FC<ChannelChatWidgetProps> = ({
  channelId,
  channelName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const storageKey = `chat_${channelId}`;
    const storedMessages = localStorage.getItem(storageKey);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    setActiveUsers(Math.floor(Math.random() * 50) + 5);
  }, [channelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    setIsLoading(true);
    try {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        username: user.name || 'Anonymous',
        message: inputValue.trim(),
        timestamp: new Date(),
        likes: 0,
      };

      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Save to localStorage
      const storageKey = `chat_${channelId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages.slice(-100))); // Keep last 100 messages

      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeMessage = (messageId: string) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-96 h-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-500" />
          <div>
            <p className="font-semibold text-white text-sm">{channelName} Chat</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activeUsers} active
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-sm">No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="group">
              <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-white text-sm">{msg.username}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-slate-300 text-sm break-words">{msg.message}</p>
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleLikeMessage(msg.id)}
                    className="text-xs text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                  >
                    ❤️ {msg.likes > 0 ? msg.likes : ''}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            maxLength={500}
            disabled={!user || isLoading}
            className="flex-1 bg-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !user || isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 text-white rounded-lg px-3 py-2 transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!user && (
          <p className="text-xs text-slate-400 mt-2">Log in to send messages</p>
        )}
      </div>
    </div>
  );
};

export default ChannelChatWidget;
