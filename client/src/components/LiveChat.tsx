import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

interface LiveChatProps {
  conversationId: string;
  userId: string;
}

export function LiveChat({ conversationId, userId }: LiveChatProps) {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = trpc.chat.getMessages.useQuery({
    conversationId,
  });

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText('');
      refetch();
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMutation.mutate({
      conversationId,
      senderId: userId,
      content: messageText,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 flex flex-col h-96">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === userId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === userId
                    ? 'bg-amber-500 text-white rounded-br-none'
                    : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : 'Just now'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 space-y-3">
        {isTyping && (
          <p className="text-xs text-slate-400">Someone is typing...</p>
        )}
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-300">
            <Smile className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
