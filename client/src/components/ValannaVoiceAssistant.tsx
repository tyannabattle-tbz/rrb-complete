import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle, Sparkles, Paperclip, Image, FileText, Music, Loader2, XCircle, ArrowLeftRight } from 'lucide-react';

// ─── Persona Configuration ─────────────────────────────────────────
const VALANNA_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp';
const CANDY_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/candy-avatar_4d4d3bc0.png';
const SERAPH_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/seraph-avatar-v2-4cBZycZ6qyGjmCjzjWUMUo.webp';

type PersonaKey = 'valanna' | 'candy' | 'seraph';

interface PersonaConfig {
  name: string;
  avatar: string;
  subtitle: string;
  greeting: string;
  borderColor: string;
  borderColorActive: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  headerGradient: string;
  messageBg: string;
  messageBorder: string;
  speakingLabel: string;
  footerLabel: string;
  voiceType: 'feminine' | 'masculine';
  voicePitch: number;
  voiceRate: number;
}

const PERSONAS: Record<PersonaKey, PersonaConfig> = {
  valanna: {
    name: 'Valanna',
    avatar: VALANNA_AVATAR,
    subtitle: 'QUMUS AI Brain \u2022 Files + Voice + Text',
    greeting: "Hey baby, come on in. I'm Valanna. I've been keeping an eye on everything while you were away. All systems running smooth. You can send me files too \u2014 images, documents, audio \u2014 I can see and analyze anything you share. What do you need from me?",
    borderColor: 'border-amber-500',
    borderColorActive: 'border-amber-400 shadow-lg shadow-amber-400/50',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/30',
    headerGradient: 'bg-gradient-to-r from-slate-800 via-amber-900/30 to-slate-800',
    messageBg: 'bg-amber-900/20',
    messageBorder: 'border-amber-500/10',
    speakingLabel: 'Valanna is speaking...',
    footerLabel: 'Valanna \u2022 QUMUS AI Brain \u2022 Canryn Production',
    voiceType: 'feminine',
    voicePitch: 1.08,
    voiceRate: 0.92,
  },
  candy: {
    name: 'Candy',
    avatar: CANDY_AVATAR,
    subtitle: 'Guardian AI \u2022 Strategic Advisor',
    greeting: "Hey now, come on in. I'm Candy \u2014 Seabrun Candy Hunter. I've been watching over everything, and I'm proud of what this family's built. You need something? I'm right here. Always.",
    borderColor: 'border-blue-500',
    borderColorActive: 'border-blue-400 shadow-lg shadow-blue-400/50',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    headerGradient: 'bg-gradient-to-r from-slate-800 via-blue-900/30 to-slate-800',
    messageBg: 'bg-blue-900/20',
    messageBorder: 'border-blue-500/10',
    speakingLabel: 'Candy is speaking...',
    footerLabel: 'Candy \u2022 Guardian AI \u2022 Canryn Production',
    voiceType: 'masculine',
    voicePitch: 0.85,
    voiceRate: 0.88,
  },
  seraph: {
    name: 'Seraph',
    avatar: SERAPH_AVATAR,
    subtitle: 'Strategic Intelligence \u2022 Pattern Analyst',
    greeting: "Seraph here. I've been running the numbers across all systems and I have some insights for you. Listener trends are up, all 13 QUMUS policies are active, and I've spotted a few patterns worth discussing. What do you want to dig into?",
    borderColor: 'border-violet-500',
    borderColorActive: 'border-violet-400 shadow-lg shadow-violet-400/50',
    accentBg: 'bg-violet-500/10',
    accentText: 'text-violet-400',
    accentBorder: 'border-violet-500/30',
    headerGradient: 'bg-gradient-to-r from-slate-800 via-violet-900/30 to-slate-800',
    messageBg: 'bg-violet-900/20',
    messageBorder: 'border-violet-500/10',
    speakingLabel: 'Seraph is speaking...',
    footerLabel: 'Seraph \u2022 Strategic Intelligence \u2022 Canryn Production',
    voiceType: 'feminine',
    voicePitch: 1.0,
    voiceRate: 0.95,
  },
};

// ─── Conflict Resolution System ────────────────────────────────────
// When both personas are referenced or there's ambiguity, this mediator handles it
function resolvePersonaConflict(message: string, currentPersona: PersonaKey): { persona: PersonaKey; mediatorNote?: string } {
  const lower = message.toLowerCase();
  const mentionsValanna = /valanna|val\b/i.test(lower);
  const mentionsCandy = /candy|seabrun|hunter\b/i.test(lower);
  const mentionsSeraph = /seraph|sareph/i.test(lower);
  const asksBoth = /both|together|you two|y'all|team|all three|trinity/i.test(lower);

  // If user mentions multiple AIs or asks about the team
  const mentionCount = [mentionsValanna, mentionsCandy, mentionsSeraph].filter(Boolean).length;
  if (mentionCount >= 2 || asksBoth) {
    const notes: Record<PersonaKey, string> = {
      valanna: "[Valanna speaks first, acknowledging the team]",
      candy: "[Candy speaks first, acknowledging the family]",
      seraph: "[Seraph speaks first, providing the analytical perspective]",
    };
    return { persona: currentPersona, mediatorNote: notes[currentPersona] };
  }

  // If user specifically addresses a different persona
  if (mentionsValanna && currentPersona !== 'valanna') {
    return { persona: currentPersona, mediatorNote: `[${PERSONAS[currentPersona].name} acknowledges the question is about Valanna and responds with respect]` };
  }
  if (mentionsCandy && currentPersona !== 'candy') {
    return { persona: currentPersona, mediatorNote: `[${PERSONAS[currentPersona].name} acknowledges the question is about Candy and responds with warmth]` };
  }
  if (mentionsSeraph && currentPersona !== 'seraph') {
    return { persona: currentPersona, mediatorNote: `[${PERSONAS[currentPersona].name} acknowledges the question is about Seraph and responds thoughtfully]` };
  }

  // No conflict — stay with current persona
  return { persona: currentPersona };
}

// ─── Interfaces ────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
  persona?: PersonaKey;
}

interface FileAttachment {
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  previewUrl?: string;
}

// ─── Voice Selection ───────────────────────────────────────────────
function selectVoice(type: 'feminine' | 'masculine'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  if (type === 'feminine') {
    const femNames = [
      'Microsoft Jenny Online', 'Microsoft Aria Online', 'Microsoft Jenny',
      'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria',
      'Google US English', 'Google UK English Female',
      'Microsoft Zira', 'Microsoft Hazel', 'Microsoft Susan',
    ];
    for (const name of femNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    const femaleVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('karen'))
    );
    if (femaleVoice) return femaleVoice;
  } else {
    const mascNames = [
      'Microsoft Guy Online', 'Microsoft David Online', 'Microsoft David',
      'Microsoft Mark', 'Microsoft Guy', 'Daniel', 'Alex', 'Fred',
      'Google UK English Male', 'Microsoft James',
    ];
    for (const name of mascNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    const maleVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('james'))
    );
    if (maleVoice) return maleVoice;
  }

  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0] || null;
}

// ─── Utility Functions ─────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm',
  'video/mp4', 'video/webm',
  'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── Main Component ────────────────────────────────────────────────
export default function ValannaVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaKey>('valanna');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [hasGreeted, setHasGreeted] = useState<Record<PersonaKey, boolean>>({ valanna: false, candy: false, seraph: false });
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [femVoice, setFemVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [mascVoice, setMascVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persona = PERSONAS[activePersona];
  const currentVoice = activePersona === 'valanna' ? femVoice : mascVoice;

  // tRPC mutations
  const chatMutation = trpc.chatStreaming.streamChat.useMutation();
  const uploadMutation = trpc.chatStreaming.uploadChatFile.useMutation();

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      setFemVoice(selectVoice('feminine'));
      setMascVoice(selectVoice('masculine'));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
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
          if (event.results[i].isFinal) finalTranscript += t;
          else interimTranscript += t;
        }
        if (finalTranscript) {
          setTranscript('');
          handleUserMessage(finalTranscript.trim());
          setIsListening(false);
        } else {
          setTranscript(interimTranscript);
        }
      };
      recognition.onerror = () => { setIsListening(false); setTranscript(''); };
      recognition.onend = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Greeting when opened or persona switched
  useEffect(() => {
    if (isOpen && !hasGreeted[activePersona]) {
      setHasGreeted(prev => ({ ...prev, [activePersona]: true }));
      const greeting = persona.greeting;
      setMessages(prev => [...prev, { role: 'assistant', content: greeting, timestamp: Date.now(), persona: activePersona }]);
      if (!isMuted) setTimeout(() => speak(greeting), 500);
    }
  }, [isOpen, activePersona]);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => setPulseAnimation(prev => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Speak text with the active persona's voice
   */
  const speak = useCallback((text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    let sentenceIndex = 0;
    const speakNext = () => {
      if (sentenceIndex >= sentences.length) { setIsSpeaking(false); return; }
      const sentence = sentences[sentenceIndex].trim();
      if (!sentence) { sentenceIndex++; speakNext(); return; }
      const utterance = new SpeechSynthesisUtterance(sentence);
      if (currentVoice) utterance.voice = currentVoice;
      const rateVariation = (Math.random() - 0.5) * 0.06;
      utterance.rate = persona.voiceRate + rateVariation;
      utterance.pitch = persona.voicePitch;
      utterance.volume = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        sentenceIndex++;
        if (sentenceIndex < sentences.length) setTimeout(speakNext, 200 + Math.random() * 200);
        else setIsSpeaking(false);
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    setIsSpeaking(true);
    speakNext();
  }, [isMuted, currentVoice, persona]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch {}
    }
  };

  /**
   * Switch persona with transition message
   */
  const switchPersona = (newPersona: PersonaKey) => {
    if (newPersona === activePersona) { setShowSwitcher(false); return; }

    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const oldName = PERSONAS[activePersona].name;
    const newName = PERSONAS[newPersona].name;

    // Add transition message from the current persona
    const handoffMessages: Record<string, string> = {
      'valanna_to_candy': `Alright, I'm passing you over to Candy. He's been watching and he's ready. Go ahead, Candy.`,
      'valanna_to_seraph': `Let me bring in Seraph. She's been analyzing the data and she's got insights. Go ahead, Seraph.`,
      'candy_to_valanna': `Let me hand you back to Valanna. She's got the day-to-day covered. Go ahead, Val.`,
      'candy_to_seraph': `I'll let Seraph take this one. She sees the patterns I can't. Go ahead, Seraph.`,
      'seraph_to_valanna': `Passing you back to Valanna. She'll handle the operations side. Go ahead, Val.`,
      'seraph_to_candy': `Let me bring Candy in on this. He's got the wisdom we need here. Go ahead, Candy.`,
    };

    const handoffKey = `${activePersona}_to_${newPersona}`;
    const handoff = handoffMessages[handoffKey] || `Switching to ${newName}...`;

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: handoff,
      timestamp: Date.now(),
      persona: activePersona,
    }]);

    setActivePersona(newPersona);
    setShowSwitcher(false);
  };

  /**
   * Handle file selection and upload to S3
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setShowAttachMenu(false);

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('audio/')) continue;
      if (file.size > 16 * 1024 * 1024) continue;

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });

        if (result.success && result.url) {
          let previewUrl: string | undefined;
          if (file.type.startsWith('image/')) {
            previewUrl = URL.createObjectURL(file);
          }
          setPendingFiles(prev => [...prev, {
            url: result.url,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            previewUrl,
          }]);
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => {
      const file = prev[index];
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Handle user message with conflict resolution
   */
  const handleUserMessage = async (text: string, attachments?: FileAttachment[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text || `Shared ${attachments?.length || 0} file(s)`,
      timestamp: Date.now(),
      attachments,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setInputText('');
    setPendingFiles([]);

    try {
      // Run conflict resolution to determine persona and any mediator notes
      const resolution = resolvePersonaConflict(text, activePersona);
      const queryWithContext = resolution.mediatorNote
        ? `${resolution.mediatorNote}\n\nUser says: ${text}`
        : text;

      const response = await chatMutation.mutateAsync({
        messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        query: queryWithContext || `Please analyze the file(s) I've shared: ${attachments?.map(a => a.fileName).join(', ')}`,
        persona: activePersona,
        attachments: attachments?.map(a => ({
          url: a.url,
          mimeType: a.mimeType,
          fileName: a.fileName,
        })),
      });

      const assistantContent = (response as any)?.choices?.[0]?.message?.content
        || (response as any)?.stream?.choices?.[0]?.message?.content
        || (activePersona === 'candy'
          ? "Hold on now, let me think on that for a second. I'm still here."
          : "Hmm, let me think on that for a second. Give me just a moment.");

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
        persona: activePersona,
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (!isMuted) speak(assistantContent);
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: activePersona === 'candy'
          ? "My connection hiccupped for a second. But I'm still here. Say that again for me."
          : "Hold on, my connection hiccupped for a second. I'm still here though. Say that again for me?",
        timestamp: Date.now(),
        persona: activePersona,
      };
      setMessages(prev => [...prev, errorMsg]);
      if (!isMuted) speak(errorMsg.content);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || pendingFiles.length > 0) {
      handleUserMessage(inputText.trim(), pendingFiles.length > 0 ? pendingFiles : undefined);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Get the avatar for a specific message (based on which persona sent it)
  const getMessageAvatar = (msg: ChatMessage) => {
    const msgPersona = msg.persona || 'valanna';
    return PERSONAS[msgPersona].avatar;
  };

  const getMessageColors = (msg: ChatMessage) => {
    const msgPersona = msg.persona || 'valanna';
    const p = PERSONAS[msgPersona];
    return { bg: p.messageBg, border: p.messageBorder };
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
      />

      {/* Floating Button — shows active persona */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label={`Talk to ${persona.name}`}
        >
          <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 ${persona.borderColor} shadow-lg shadow-${activePersona === 'valanna' ? 'amber' : 'blue'}-500/30 transition-all duration-300 group-hover:scale-110 ${pulseAnimation ? 'ring-4 ring-' + (activePersona === 'valanna' ? 'amber' : 'blue') + '-500/20' : ''}`}>
            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t from-${activePersona === 'valanna' ? 'amber' : 'blue'}-900/40 to-transparent`} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
          <span className={`absolute -top-8 right-0 bg-slate-800 ${persona.accentText} text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${persona.accentBorder} border`}>
            Talk to {persona.name}
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border ${persona.accentBorder} rounded-2xl shadow-2xl flex flex-col overflow-hidden`} style={{ maxHeight: '650px' }}>

          {/* Header */}
          <div className={`${persona.headerGradient} p-4 flex items-center gap-3 border-b ${persona.accentBorder}`}>
            <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${isSpeaking ? persona.borderColorActive : persona.borderColor + '/50'} transition-all`}>
              <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
              {isSpeaking && <div className={`absolute inset-0 ${persona.accentBg} animate-pulse`} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">{persona.name}</h3>
                <Sparkles className={`w-4 h-4 ${persona.accentText}`} />
              </div>
              <p className={`${persona.accentText} opacity-70 text-xs`}>{persona.subtitle}</p>
            </div>
            <div className="flex items-center gap-1">
              {/* Persona Switcher Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSwitcher(!showSwitcher)}
                  className={`${persona.accentText} hover:${persona.accentBg} h-8 w-8 p-0`}
                  title="Switch persona"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>

                {/* Switcher Dropdown */}
                {showSwitcher && (
                  <div className="absolute top-10 right-0 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-2 min-w-[200px] z-20">
                    <p className="text-[10px] text-gray-400 px-3 py-1 uppercase tracking-wider">Switch Persona</p>
                    {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => {
                      const p = PERSONAS[key];
                      const isActive = key === activePersona;
                      return (
                        <button
                          key={key}
                          onClick={() => switchPersona(key)}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
                            isActive ? 'bg-slate-700/70' : 'hover:bg-slate-700/40'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-full overflow-hidden border-2 ${isActive ? p.borderColor : 'border-slate-600'}`}>
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-white font-medium">{p.name}</span>
                              {isActive && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30 text-[9px] px-1.5 py-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">{key === 'valanna' ? 'Operations & Day-to-Day' : key === 'seraph' ? 'System Intelligence & Strategy' : 'Vision & Legacy'}</span>
                          </div>
                        </button>
                      );
                    })}
                    <div className="border-t border-slate-700 mt-1 pt-1">
                      <p className="text-[9px] text-gray-500 px-3 py-1 italic">
                        Valanna runs operations. Seraph handles strategy & analysis. Candy guards the legacy. The AI Trinity.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={() => { setIsMuted(!isMuted); if (!isMuted) stopSpeaking(); }} className={`${persona.accentText} hover:${persona.accentBg} h-8 w-8 p-0`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); stopSpeaking(); setShowSwitcher(false); if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); } }} className="text-gray-400 hover:bg-slate-700 h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '250px', maxHeight: '350px' }}>
            {messages.map((msg, i) => {
              const msgColors = getMessageColors(msg);
              return (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border ${msg.persona === 'candy' ? 'border-blue-500/30' : msg.persona === 'seraph' ? 'border-violet-500/30' : 'border-amber-500/30'}`}>
                      <img src={getMessageAvatar(msg)} alt={msg.persona || 'assistant'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600/30 text-purple-100 border border-purple-500/20'
                      : `${msgColors.bg} text-${msg.persona === 'candy' ? 'blue' : msg.persona === 'seraph' ? 'violet' : 'amber'}-100 border ${msgColors.border}`
                  }`}>
                    {/* File attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {msg.attachments.map((file, fi) => (
                          <div key={fi} className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
                            {file.previewUrl ? (
                              <img src={file.previewUrl} alt={file.fileName} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className={`w-10 h-10 rounded ${persona.accentBg} flex items-center justify-center ${persona.accentText}`}>
                                {getFileIcon(file.mimeType)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.fileName}</p>
                              <p className="text-[10px] text-gray-400">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border ${persona.accentBorder}`}>
                  <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                </div>
                <div className={`${persona.messageBg} border ${persona.messageBorder} rounded-2xl px-4 py-3`}>
                  <div className="flex gap-1.5">
                    <div className={`w-2 h-2 ${activePersona === 'valanna' ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 ${activePersona === 'valanna' ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 ${activePersona === 'valanna' ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
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

          {/* Pending Files Preview */}
          {pendingFiles.length > 0 && (
            <div className={`px-3 pt-2 border-t ${persona.messageBorder}`}>
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((file, i) => (
                  <div key={i} className={`relative group flex items-center gap-1.5 bg-slate-800 border ${persona.accentBorder} rounded-lg px-2 py-1.5`}>
                    {file.previewUrl ? (
                      <img src={file.previewUrl} alt={file.fileName} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className={`w-8 h-8 rounded ${persona.accentBg} flex items-center justify-center ${persona.accentText}`}>
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                    <div className="max-w-[100px]">
                      <p className="text-[10px] text-white truncate">{file.fileName}</p>
                      <p className="text-[9px] text-gray-400">{formatFileSize(file.fileSize)}</p>
                    </div>
                    <button
                      onClick={() => removePendingFile(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`border-t ${persona.accentBorder} p-3 bg-slate-800/50`}>
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 ${activePersona === 'valanna' ? 'bg-amber-400' : 'bg-blue-400'} rounded-full animate-pulse`} style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <span className={`${persona.accentText} text-xs`}>{persona.speakingLabel}</span>
                <button onClick={stopSpeaking} className="text-xs text-gray-400 hover:text-white ml-auto">Stop</button>
              </div>
            )}

            {/* Uploading indicator */}
            {isUploading && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <Loader2 className={`w-4 h-4 ${persona.accentText} animate-spin`} />
                <span className={`${persona.accentText} text-xs`}>Uploading file...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              {/* Mic button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={`h-10 w-10 p-0 rounded-full transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse'
                    : `${persona.accentText} hover:${persona.accentBg}`
                }`}
                title={isListening ? 'Stop listening' : `Speak to ${persona.name}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Attach button */}
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`h-10 w-10 p-0 rounded-full ${persona.accentText} hover:${persona.accentBg} flex-shrink-0`}
                  title="Attach file"
                  disabled={isUploading}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                {showAttachMenu && (
                  <div className={`absolute bottom-12 left-0 bg-slate-800 border ${persona.accentBorder} rounded-xl shadow-xl p-2 space-y-1 min-w-[160px] z-10`}>
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-${activePersona === 'valanna' ? 'amber' : activePersona === 'seraph' ? 'violet' : 'blue'}-100 hover:${persona.accentBg} rounded-lg transition-colors`}
                    >
                      <Image className="w-4 h-4 text-green-400" /> Photo / Image
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', '.pdf,.doc,.docx,.txt,.csv'); fileInputRef.current?.click(); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-${activePersona === 'valanna' ? 'amber' : activePersona === 'seraph' ? 'violet' : 'blue'}-100 hover:${persona.accentBg} rounded-lg transition-colors`}
                    >
                      <FileText className="w-4 h-4 text-blue-400" /> Document
                    </button>
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', 'audio/*,video/*'); fileInputRef.current?.click(); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-${activePersona === 'valanna' ? 'amber' : activePersona === 'seraph' ? 'violet' : 'blue'}-100 hover:${persona.accentBg} rounded-lg transition-colors`}
                    >
                      <Music className="w-4 h-4 text-purple-400" /> Audio / Video
                    </button>
                    <div className="border-t border-slate-700 my-1" />
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.setAttribute('accept', ACCEPTED_TYPES.join(',')); fileInputRef.current?.click(); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-${activePersona === 'valanna' ? 'amber' : activePersona === 'seraph' ? 'violet' : 'blue'}-100 hover:${persona.accentBg} rounded-lg transition-colors`}
                    >
                      <Paperclip className={`w-4 h-4 ${persona.accentText}`} /> Any File
                    </button>
                  </div>
                )}
              </div>

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening...' : pendingFiles.length > 0 ? 'Add a message or send files...' : `Talk to ${persona.name}...`}
                className={`flex-1 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:${persona.accentBorder} focus:ring-1 focus:ring-${activePersona === 'valanna' ? 'amber' : activePersona === 'seraph' ? 'violet' : 'blue'}-500/30`}
                disabled={isListening}
              />

              {/* Send button */}
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={(!inputText.trim() && pendingFiles.length === 0) || isThinking || isUploading}
                className={`h-10 w-10 p-0 rounded-full ${persona.accentText} hover:${persona.accentBg} disabled:opacity-30 flex-shrink-0`}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 px-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                All Systems Online
              </Badge>
              <span className="text-[10px] text-gray-500">
                {persona.footerLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
