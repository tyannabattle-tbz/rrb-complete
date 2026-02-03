import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Menu, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function QumusChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Welcome to Qumus! I\'m your AI assistant trained specifically for the Qumus video generation platform. I can help you with:\n\n• Video generation from text prompts\n• Watermarking and branding\n• Batch video processing\n• HybridCast widget configuration\n• Analytics and engagement tracking\n• Marketing campaigns\n• Social media integration\n• Wealth-building strategies\n\nWhat would you like to do today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = trpc.qumusChat.chat.useMutation();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        query: input,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: typeof response.message === 'string' ? response.message : 'I encountered an error. Please try again.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-lg">Qumus Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            New Chat
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            Video Generation
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            Watermarking
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            Batch Processing
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-slate-800">
            Marketing
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Qumus AI Assistant</h1>
          <div className="w-10" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-2xl px-5 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-900 border border-slate-200 px-5 py-3 rounded-lg rounded-bl-none shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask about video generation, watermarking, analytics, marketing..."
              className="flex-1 border-slate-300 focus:border-blue-500"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
