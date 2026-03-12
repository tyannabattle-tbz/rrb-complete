import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Mic, Send, Plus, Volume2, VolumeX } from 'lucide-react';
import { useAiVoice } from '@/hooks/useAiVoice';
import type { AiPersona } from '@/services/aiVoiceTts';

export default function EnhancedChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<AiPersona>('valanna');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Voice TTS — auto-speaks all AI responses
  const { voiceEnabled, toggleVoice: toggleTts, isSpeaking, speakAiResponse, stop: stopSpeaking } = useAiVoice({
    persona: selectedPersona,
    defaultEnabled: true,
    autoSpeak: true,
  });

  const sendChat = trpc.ai.qumusChat.chat.useMutation();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
    }
  }, []);

  const startNewSession = async () => {
    setSessionId('new-' + Date.now().toString());
    setMessages([]);
  };

  const toggleMic = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const response = await sendChat.mutateAsync({
      messages,
      query: userMessage,
      persona: selectedPersona,
    });

    if (response.success) {
      const responseText = String(response.message);
      setMessages(prev => [...prev, { role: 'assistant' as const, content: responseText }]);

      // Auto-play TTS audio for the AI response
      if (voiceEnabled && responseText) {
        const audioUrl = (response as any).audioUrl;
        if (audioUrl) {
          try {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => {
              speakAiResponse(responseText, selectedPersona);
            });
          } catch {
            speakAiResponse(responseText, selectedPersona);
          }
        } else {
          speakAiResponse(responseText, selectedPersona);
        }
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Button onClick={startNewSession} size="lg">
          <Plus className="mr-2" /> Start New Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with persona selector and voice toggle */}
      <div className="border-b p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">AI Chat</h1>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as AiPersona)}
            className="text-sm border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="valanna">Valanna</option>
            <option value="candy">Candy</option>
            <option value="seraph">Seraph</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <span className="text-xs text-primary animate-pulse">Speaking...</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { if (isSpeaking) stopSpeaking(); else toggleTts(); }}
            className={`h-8 w-8 p-0 ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`}
            title={voiceEnabled ? 'Voice ON — click to mute' : 'Voice OFF — click to unmute'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type or speak..."
            className="flex-1 px-4 py-2 border rounded-lg bg-background text-foreground"
          />
          <Button onClick={toggleMic} variant={isListening ? 'destructive' : 'outline'}>
            <Mic size={18} />
          </Button>
          <Button onClick={handleSendMessage}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
