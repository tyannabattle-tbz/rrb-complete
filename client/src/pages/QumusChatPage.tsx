import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { trpc } from '@/lib/trpc';
import AdminOverridePanel from '@/components/AdminOverridePanel';
import RealTimeDecisionVisualization from '@/components/RealTimeDecisionVisualization';
import { QumusChatCommandCenter } from '@/components/QumusChatCommandCenter';
import { VoiceToText } from '@/components/VoiceToText';
import { FunctionalFeatures } from '@/components/FunctionalFeatures';
import { MonitoringDashboard } from '@/components/MonitoringDashboard';
import { useAiVoice } from '@/hooks/useAiVoice';
import type { AiPersona } from '@/services/aiVoiceTts';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedPersona, setSelectedPersona] = useState<AiPersona>('valanna');

  // AI Voice TTS — auto-speaks all AI responses
  const { voiceEnabled, toggleVoice, isSpeaking, speakAiResponse, stop: stopSpeaking } = useAiVoice({
    persona: selectedPersona,
    defaultEnabled: true,
    autoSpeak: true,
  });

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Listen for mobile menu toggle events
  useEffect(() => {
    const handleMenuToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSidebarOpen(customEvent.detail.open);
    };
    
    window.addEventListener('mobileMenuToggle', handleMenuToggle);
    return () => window.removeEventListener('mobileMenuToggle', handleMenuToggle);
  }, []);

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
        persona: selectedPersona,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: response.message || 'I understand. How can I help you further?',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto-play TTS audio for the AI response
      if (voiceEnabled && response.message) {
        const audioUrl = (response as any).audioUrl;
        if (audioUrl) {
          // Play server-generated high-quality TTS audio
          try {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => {
              // Fallback to browser TTS if autoplay blocked
              speakAiResponse(response.message, selectedPersona);
            });
          } catch {
            speakAiResponse(response.message, selectedPersona);
          }
        } else {
          // Fallback to browser TTS
          speakAiResponse(response.message, selectedPersona);
        }
      }
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
      {/* Mobile Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile overlay, desktop fixed */}
      <div className={`${sidebarOpen ? 'fixed md:relative' : 'hidden md:flex'} inset-0 md:inset-auto z-40 md:z-auto ${sidebarOpen ? 'w-64' : 'md:w-64'} bg-slate-900 border-r border-slate-700 transition-all overflow-hidden flex-col`}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-white font-bold">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-slate-800 p-1 rounded"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Button 
            onClick={() => {
              setMessages([{ id: '0', role: 'assistant', content: 'Starting a new chat...', timestamp: Date.now() }]);
              setInput('');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            New Chat
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('features');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Video Generation
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('features');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Watermarking
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('features');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Batch Processing
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('features');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Analytics
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('features');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Marketing
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('monitoring');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800"
          >
            Monitoring
          </Button>
          <div className="border-t border-slate-700 my-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 px-2 py-2">TABS</h3>
          </div>
          <Button 
            onClick={() => {
              setActiveTab('chat');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800 text-sm"
          >
            💬 Chat
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('decisions');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800 text-sm"
          >
            ⚡ Decisions
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('override');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800 text-sm"
          >
            🔐 Override
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('commands');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800 text-sm"
          >
            ⚙️ Command Center
          </Button>
          <Button 
            onClick={() => {
              setActiveTab('voice');
              if (isMobile) setSidebarOpen(false);
            }}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-slate-800 text-sm"
          >
            🎤 Voice to Text
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
            {/* Header with persona selector and voice toggle */}
            <div className="bg-white border-b border-slate-200 p-3 md:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-slate-900">AI Chat</h1>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value as AiPersona)}
                  className="text-sm border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="valanna">Valanna</option>
                  <option value="candy">Candy</option>
                  <option value="seraph">Seraph</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <span className="text-xs text-blue-500 animate-pulse">Speaking...</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { if (isSpeaking) stopSpeaking(); else toggleVoice(); }}
                  className={`h-8 w-8 p-0 ${voiceEnabled ? 'text-blue-500' : 'text-slate-400'}`}
                  title={voiceEnabled ? 'Voice ON — click to mute' : 'Voice OFF — click to unmute'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50 min-h-0">
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
              <div className="md:hidden flex flex-wrap gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Generate a video about ')}
                  className="text-xs h-8 px-2 flex-1 min-w-max"
                >
                  🎬 Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Show analytics for ')}
                  className="text-xs h-8 px-2 flex-1 min-w-max"
                >
                  📊 Analytics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Help with watermarking ')}
                  className="text-xs h-8 px-2 flex-1 min-w-max"
                >
                  🎨 Watermark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Marketing campaign for ')}
                  className="text-xs h-8 px-2 flex-1 min-w-max"
                >
                  📢 Marketing
                </Button>
              </div>

              {/* Input Field */}
              <div className="w-full flex gap-2 md:gap-3">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask about video generation, watermarking, analytics, marketing..."
                  className="flex-1 border-slate-300 focus:border-blue-500 h-10 md:h-10 text-sm md:text-sm"
                  disabled={loading}
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-1 px-3 md:px-6 h-10 md:h-10 flex-shrink-0"
                >
                  <Send className="w-4 md:w-4 h-4 md:h-4" />
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
