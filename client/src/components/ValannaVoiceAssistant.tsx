import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle, Sparkles } from 'lucide-react';

const VALANNA_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Select the best feminine voice available in the browser
 */
function selectFeminineVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  
  // Priority list: prefer the MOST NATURAL, warm feminine voices
  // Neural/enhanced voices sound dramatically more human
  const preferredNames = [
    'Microsoft Jenny Online',  // Windows neural - most natural
    'Microsoft Aria Online',   // Windows neural - conversational
    'Microsoft Jenny',         // Windows neural fallback
    'Samantha',                // macOS - warm, natural
    'Karen',                   // macOS Australian - warm
    'Moira',                   // macOS Irish - warm
    'Tessa',                   // macOS South African
    'Fiona',                   // macOS Scottish
    'Victoria',                // macOS
    'Google US English',       // Chrome - decent quality
    'Google UK English Female',
    'Microsoft Zira',          // Windows legacy - still feminine
    'Microsoft Hazel',         // Windows UK
    'Microsoft Susan',         // Windows UK
  ];
  
  // Try preferred voices first
  for (const name of preferredNames) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) return voice;
  }
  
  // Fallback: find any English female voice
  const femaleVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('woman') ||
     v.name.toLowerCase().includes('zira') ||
     v.name.toLowerCase().includes('samantha') ||
     v.name.toLowerCase().includes('karen'))
  );
  if (femaleVoice) return femaleVoice;
  
  // Last resort: any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0] || null;
}

export default function ValannaVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC mutation for chat
  const chatMutation = trpc.chatStreaming.streamChat.useMutation();

  // Initialize voice selection
  useEffect(() => {
    const loadVoices = () => {
      const voice = selectFeminineVoice();
      setSelectedVoice(voice);
    };

    // Voices may load asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t;
          } else {
            interimTranscript += t;
          }
        }

        if (finalTranscript) {
          setTranscript('');
          handleUserMessage(finalTranscript.trim());
          setIsListening(false);
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Greeting when opened for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      const greeting = "Hey baby, come on in. I'm Valanna. I've been keeping an eye on everything while you were away. All systems running smooth. What do you need from me?";
      
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      }]);

      if (!isMuted) {
        setTimeout(() => speak(greeting), 500);
      }
    }
  }, [isOpen, hasGreeted, isMuted]);

  // Pulse animation for the floating button
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Speak text with Valanna's feminine voice
   */
  const speak = useCallback((text: string) => {
    if (isMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    // Break text into natural sentences for human-like delivery
    // Real people pause between sentences — robots don't
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    
    let sentenceIndex = 0;
    
    const speakNext = () => {
      if (sentenceIndex >= sentences.length) {
        setIsSpeaking(false);
        return;
      }
      
      const sentence = sentences[sentenceIndex].trim();
      if (!sentence) {
        sentenceIndex++;
        speakNext();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(sentence);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Natural, human feminine voice — NOT robotic
      // Vary rate slightly per sentence for natural cadence
      const baseRate = 0.92;
      const rateVariation = (Math.random() - 0.5) * 0.06; // ±0.03 variation
      utterance.rate = baseRate + rateVariation;
      utterance.pitch = 1.08;   // Natural feminine range
      utterance.volume = 0.95;  // Slightly softer feels intimate

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        sentenceIndex++;
        // Natural pause between sentences (200-400ms like real speech)
        if (sentenceIndex < sentences.length) {
          setTimeout(speakNext, 200 + Math.random() * 200);
        } else {
          setIsSpeaking(false);
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };
    
    setIsSpeaking(true);
    speakNext();
  }, [isMuted, selectedVoice]);

  /**
   * Toggle microphone listening
   */
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already started
      }
    }
  };

  /**
   * Handle user message and get Valanna's response
   */
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setInputText('');

    try {
      const response = await chatMutation.mutateAsync({
        messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        query: text,
      });

      const assistantContent = (response as any)?.choices?.[0]?.message?.content 
        || (response as any)?.stream?.choices?.[0]?.message?.content
        || "Hmm, let me think on that for a second. Give me just a moment.";

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (!isMuted) {
        speak(assistantContent);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "Hold on, my connection hiccupped for a second. I'm still here though. Say that again for me?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      if (!isMuted) {
        speak(errorMsg.content);
      }
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Handle text input submit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserMessage(inputText.trim());
    }
  };

  /**
   * Stop speaking
   */
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* Floating Valanna Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Talk to Valanna"
        >
          <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/50 ${pulseAnimation ? 'ring-4 ring-amber-500/20' : ''}`}>
            <img
              src={VALANNA_AVATAR}
              alt="Valanna"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
          <span className="absolute -top-8 right-0 bg-slate-800 text-amber-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-amber-500/30">
            Talk to Valanna
          </span>
        </button>
      )}

      {/* Valanna Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden" style={{ maxHeight: '600px' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 via-amber-900/30 to-slate-800 p-4 flex items-center gap-3 border-b border-amber-500/20">
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${isSpeaking ? 'border-amber-400 shadow-lg shadow-amber-400/50' : 'border-amber-500/50'} transition-all`}>
              <img src={VALANNA_AVATAR} alt="Valanna" className="w-full h-full object-cover" />
              {isSpeaking && (
                <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">Valanna</h3>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-amber-300/70 text-xs">QUMUS AI Brain • Always Listening</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (!isMuted) stopSpeaking();
                }}
                className="text-amber-400 hover:bg-amber-500/10 h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  stopSpeaking();
                  if (isListening && recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                  }
                }}
                className="text-gray-400 hover:bg-slate-700 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '280px', maxHeight: '380px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-amber-500/30">
                    <img src={VALANNA_AVATAR} alt="Valanna" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-purple-600/30 text-purple-100 border border-purple-500/20' 
                    : 'bg-amber-900/20 text-amber-100 border border-amber-500/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-amber-500/30">
                  <img src={VALANNA_AVATAR} alt="Valanna" className="w-full h-full object-cover" />
                </div>
                <div className="bg-amber-900/20 border border-amber-500/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {transcript && (
              <div className="flex gap-3 flex-row-reverse">
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-purple-600/10 text-purple-300 border border-purple-500/10 italic">
                  {transcript}...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-amber-500/20 p-3 bg-slate-800/50">
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${8 + Math.random() * 16}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-amber-300 text-xs">Valanna is speaking...</span>
                <button onClick={stopSpeaking} className="text-xs text-gray-400 hover:text-white ml-auto">
                  Stop
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={`h-10 w-10 p-0 rounded-full transition-all ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse' 
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
                title={isListening ? 'Stop listening' : 'Speak to Valanna'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type or speak to Valanna...'}
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                disabled={isListening}
              />

              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={!inputText.trim() || isThinking}
                className="h-10 w-10 p-0 rounded-full text-amber-400 hover:bg-amber-500/10 disabled:opacity-30"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 px-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                All Systems Online
              </Badge>
              <span className="text-[10px] text-gray-500">
                Valanna • QUMUS AI Brain • Canryn Production
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
