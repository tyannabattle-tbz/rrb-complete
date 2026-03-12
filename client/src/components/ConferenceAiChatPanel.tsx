/**
 * ConferenceAiChatPanel
 * 
 * Mini AI chat sidebar for the Conference Room.
 * Lets users talk to Valanna, Candy, or Seraph without leaving the Jitsi call.
 * Includes TTS auto-play with animated speaking avatars.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Send, X, Volume2, VolumeX, Mic, MicOff, ChevronDown } from 'lucide-react';
import { useAiVoice } from '@/hooks/useAiVoice';
import type { AiPersona } from '@/services/aiVoiceTts';
import { SpeakingAvatar } from './SpeakingAvatar';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  persona?: AiPersona;
  timestamp: number;
}

interface ConferenceAiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conferenceTitle?: string;
}

export function ConferenceAiChatPanel({ isOpen, onClose, conferenceTitle }: ConferenceAiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: `I'm here to assist during "${conferenceTitle || 'the conference'}". Ask me anything — notes, translations, research, or commands.`,
    persona: 'valanna',
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<AiPersona>('valanna');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI Voice TTS
  const { voiceEnabled, toggleVoice, isSpeaking, currentSpeaker, speakAiResponse, stop: stopSpeaking } = useAiVoice({
    persona: selectedPersona,
    defaultEnabled: true,
    autoSpeak: true,
  });

  const chatMutation = trpc.ai.qumusChat.chat.useMutation();

  // Speech recognition setup
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleMic = useCallback(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    }
  }, [isListening]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);

    try {
      const response = await chatMutation.mutateAsync({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        query: userMessage,
        persona: selectedPersona,
      });

      if (response.success) {
        const responseText = String(response.message);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: responseText,
          persona: selectedPersona,
          timestamp: Date.now(),
        }]);

        // Auto-play TTS
        if (voiceEnabled && responseText) {
          const audioUrl = (response as any).audioUrl;
          if (audioUrl) {
            try {
              const audio = new Audio(audioUrl);
              audio.play().catch(() => speakAiResponse(responseText, selectedPersona));
            } catch {
              speakAiResponse(responseText, selectedPersona);
            }
          } else {
            speakAiResponse(responseText, selectedPersona);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        persona: selectedPersona,
        timestamp: Date.now(),
      }]);
    }
  }, [input, messages, selectedPersona, voiceEnabled, chatMutation, speakAiResponse]);

  const personaColors: Record<AiPersona, string> = {
    valanna: '#a78bfa',
    candy: '#60a5fa',
    seraph: '#f59e0b',
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SpeakingAvatar
            persona={selectedPersona}
            isSpeaking={isSpeaking && currentSpeaker === selectedPersona}
            size="sm"
          />
          <div>
            <h3 className="text-white text-xs font-semibold">AI Assistant</h3>
            <div className="flex items-center gap-1">
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value as AiPersona)}
                className="text-[10px] bg-transparent text-white/60 border-none outline-none cursor-pointer p-0"
              >
                <option value="valanna" className="bg-gray-900">Valanna</option>
                <option value="candy" className="bg-gray-900">Candy</option>
                <option value="seraph" className="bg-gray-900">Seraph</option>
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-white/40" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isSpeaking && (
            <span className="text-[9px] text-purple-400 animate-pulse">Speaking...</span>
          )}
          <button
            onClick={() => { if (isSpeaking) stopSpeaking(); else toggleVoice(); }}
            className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
              voiceEnabled ? 'text-purple-400 hover:bg-purple-500/20' : 'text-white/30 hover:bg-white/10'
            }`}
            title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          >
            {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex items-start gap-1.5 max-w-[85%]">
                <SpeakingAvatar
                  persona={msg.persona || 'valanna'}
                  isSpeaking={isSpeaking && currentSpeaker === msg.persona && idx === messages.length - 1}
                  size="xs"
                />
                <div
                  className="px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed text-white/90"
                  style={{ backgroundColor: `${personaColors[msg.persona || 'valanna']}20`, borderLeft: `2px solid ${personaColors[msg.persona || 'valanna']}40` }}
                >
                  {msg.content}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="max-w-[85%] px-2.5 py-1.5 rounded-lg bg-white/10 text-white/90 text-[11px] leading-relaxed">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex items-center gap-1.5 px-2">
            <SpeakingAvatar persona={selectedPersona} isSpeaking={false} size="xs" />
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-2 py-2 border-t border-gray-700/50 shrink-0">
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Ask ${selectedPersona === 'valanna' ? 'Valanna' : selectedPersona === 'candy' ? 'Candy' : 'Seraph'}...`}
            className="flex-1 px-2.5 py-1.5 text-[11px] bg-gray-800/80 border border-gray-700/50 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
          <button
            onClick={toggleMic}
            className={`h-7 w-7 rounded flex items-center justify-center transition-colors shrink-0 ${
              isListening ? 'bg-red-500/30 text-red-400' : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="h-7 w-7 rounded flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 transition-colors shrink-0"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
