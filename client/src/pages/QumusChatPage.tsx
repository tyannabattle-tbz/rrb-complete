import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Menu, X } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { trpc } from '@/lib/trpc';
import AdminOverridePanel from '@/components/AdminOverridePanel';
import RealTimeDecisionVisualization from '@/components/RealTimeDecisionVisualization';
import { QumusChatCommandCenter } from '@/components/QumusChatCommandCenter';
import { VoiceToText } from '@/components/VoiceToText';
import { FunctionalFeatures } from '@/components/FunctionalFeatures';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';

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
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Swipe gestures for mobile
  useSwipeGesture(
    {
      onSwipeRight: () => {
        // Swipe right to open menu on mobile
        if (window.innerWidth < 768) {
          setSidebarOpen(true);
        }
      },
      onSwipeLeft: () => {
        // Swipe left to close menu on mobile
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      },
    },
    chatContainerRef.current
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = trpc.ai.qumusChat.chat.useMutation();

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
        messages: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        query: input,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: response.message || 'I understand. How can I help you further?',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - hidden on mobile */}
      <div className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 border-r border-slate-700 transition-all overflow-hidden flex-col`}>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Button 
            onClick={() => {
              setMessages([{ id: '0', role: 'assistant', content: 'Starting a new chat...', timestamp: Date.now() }]);
              setInput('');
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            New Chat
          </Button>
          <Button 
            onClick={() => setActiveTab('features')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Video Generation
          </Button>
          <Button 
            onClick={() => setActiveTab('features')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Watermarking
          </Button>
          <Button 
            onClick={() => setActiveTab('features')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Batch Processing
          </Button>
          <Button 
            onClick={() => setActiveTab('features')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Analytics
          </Button>
          <Button 
            onClick={() => setActiveTab('features')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Marketing
          </Button>
          <Button 
            onClick={() => setActiveTab('monitoring')}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Monitoring
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs - hidden on mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="hidden md:flex w-full justify-start border-b border-slate-200 bg-white rounded-none">
            <TabsTrigger value="chat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              💬 Chat
            </TabsTrigger>
            <TabsTrigger value="decisions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              ⚡ Decisions
            </TabsTrigger>
            <TabsTrigger value="override" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              🔐 Override
            </TabsTrigger>
            <TabsTrigger value="commands" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              ⚙️ Command Center
            </TabsTrigger>
            <TabsTrigger value="voice" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              🎤 Voice to Text
            </TabsTrigger>
            <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              ✨ Features
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              📊 Monitoring
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
            {/* Header - simplified for mobile */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-slate-600"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <h1 className="text-xl font-bold text-slate-900">Qumus AI Assistant</h1>
              <div className="w-10" />
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
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

            {/* Input Area - Mobile Optimized */}
            <div className="bg-white border-t border-slate-200 p-3 md:p-4 space-y-3">
              {/* Quick Actions - Mobile Only */}
              <div className="md:hidden grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Generate a video about ')}
                  className="text-xs h-9"
                >
                  🎬 Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Show analytics for ')}
                  className="text-xs h-9"
                >
                  📊 Analytics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Help with watermarking ')}
                  className="text-xs h-9"
                >
                  🎨 Watermark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Marketing campaign for ')}
                  className="text-xs h-9"
                >
                  📢 Marketing
                </Button>
              </div>

              {/* Input Field */}
              <div className="max-w-4xl mx-auto flex gap-2 md:gap-3">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask about video generation, watermarking, analytics, marketing..."
                  className="flex-1 border-slate-300 focus:border-blue-500 h-11 md:h-10 text-base md:text-sm"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-4 md:px-6 h-11 md:h-10"
                >
                  <Send className="w-5 md:w-4 h-5 md:h-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
              <p className="text-xs text-slate-500 md:block hidden">Shift+Enter for new line</p>
              <p className="text-xs text-slate-500 md:hidden">Swipe right to open menu</p>
            </div>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="flex-1 overflow-hidden">
            <RealTimeDecisionVisualization />
          </TabsContent>

          {/* Override Tab */}
          <TabsContent value="override" className="flex-1 overflow-hidden">
            <AdminOverridePanel />
          </TabsContent>

          {/* Command Center Tab */}
          <TabsContent value="commands" className="flex-1 overflow-hidden">
            <QumusChatCommandCenter />
          </TabsContent>

          {/* Voice to Text Tab */}
          <TabsContent value="voice" className="flex-1 overflow-hidden overflow-y-auto">
            <VoiceToText />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="flex-1 overflow-hidden overflow-y-auto">
            <FunctionalFeatures />
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="flex-1 overflow-hidden overflow-y-auto">
            <MonitoringDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
