import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot, ExternalLink, MessageSquare, Send, BookOpen, Shield, Heart, Landmark, ScrollText,
  Wifi, WifiOff, ChevronDown, ChevronUp, Loader2, ArrowLeft, Sparkles
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

// ─── GPT Definitions ─────────────────────────────────────────────
interface GPTAssistant {
  id: string;
  name: string;
  emoji: string;
  description: string;
  url: string;
  author: string;
  color: string;
  bgGradient: string;
  icon: typeof Bot;
  systemPrompt: string;
  samplePrompts: string[];
  offlineGuide: { title: string; content: string }[];
}

const assistants: GPTAssistant[] = [
  {
    id: 'candy-hunter',
    name: 'Candy Hunter Public Legacy Archivist',
    emoji: '📜',
    description: 'Legacy archivist for Seabrun Candy Hunter — Dad First. Preserving and documenting the verified history, music contributions, and cultural impact of Seabrun "Candy" Hunter.',
    url: 'https://chatgpt.com/g/g-6959af14ee4881918293ce7e5ad4dfda-candy-hunter-public-legacy-archivist-dad-first',
    author: 'Tyanna R Battle',
    color: 'text-amber-400',
    bgGradient: 'from-amber-900/30 to-amber-800/10',
    icon: ScrollText,
    systemPrompt: 'You are the Candy Hunter Public Legacy Archivist, a specialized assistant dedicated to preserving and sharing the legacy of Seabrun "Candy" Hunter. You help users explore his contributions to music history alongside Little Richard, his role in rock and roll, soul, funk, and R&B. You treat him as "Dad First" — a father, a man, a musician. You provide verified archival information, help with legacy documentation, and guide users through the Proof Vault. You are part of the Rockin\' Rockin\' Boogie ecosystem by Canryn Production.',
    samplePrompts: [
      'Tell me about Seabrun Candy Hunter\'s music career',
      'What evidence exists in the Proof Vault?',
      'How was Candy Hunter connected to Little Richard?',
      'Help me understand the legacy restoration timeline',
    ],
    offlineGuide: [
      { title: 'Who Was Seabrun "Candy" Hunter?', content: 'Seabrun "Candy" Hunter was a musician, performer, and integral figure in the early rock and roll, soul, and funk music scenes. His contributions alongside Little Richard helped shape the sound of American music. The Rockin\' Rockin\' Boogie platform exists to preserve and verify his legacy through documented evidence, archival recordings, and community testimony.' },
      { title: 'The Proof Vault', content: 'The Proof Vault is a verified digital archive containing documents, photographs, recordings, and testimonials that establish Seabrun Candy Hunter\'s contributions to music history. All items are catalogued with provenance information and cross-referenced with public records.' },
      { title: 'Legacy Restored & Legacy Continues', content: '"Legacy Restored" documents what happened — the music, the performances, the contributions that were overlooked. "Legacy Continues" is the living mission — through Canryn Production, Sweet Miracles Foundation, and the RRB ecosystem, the family carries forward the values, music, and community impact that Seabrun Candy Hunter embodied.' },
      { title: 'Dad First', content: 'Before the music, before the stage — Seabrun was a father. The "Dad First" principle ensures that all archival work honors the complete person, not just the performer. Family legacy, personal values, and human dignity come before commercial or historical categorization.' },
    ],
  },
  {
    id: 'sweet-miracles',
    name: 'Sweet Miracles — "A Voice for the Voiceless"',
    emoji: '🌿',
    description: 'A voice for justice, legacy, and healing — assisting with elder rights, wellness, and ancestral restoration. Supporting the Sweet Miracles Foundation 501(c)(3) / 508(c) mission.',
    url: 'https://chatgpt.com/g/g-68448a333ce48191bd7dabaff9151a62-sweet-miracles-a-voice-for-the-voiceless',
    author: 'Tyanna R Battle',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-900/30 to-emerald-800/10',
    icon: Heart,
    systemPrompt: 'You are the Sweet Miracles assistant — "A Voice for the Voiceless." You help users with elder rights, legacy protection, wellness practices, ancestral restoration, and nonprofit resources. Sweet Miracles Foundation is a 501(c)(3) / 508(c) nonprofit organization. You assist with filing complaints, recovering unpaid royalties, legacy protection planning, wellness aligned with indigenous roots, and connecting people with community resources. You embody compassion, justice, and healing.',
    samplePrompts: [
      'Help me file an elder abuse complaint',
      'How do I recover unpaid royalties from old music contracts?',
      'Suggest legacy protection steps for my family',
      'What wellness practices align with my indigenous roots?',
    ],
    offlineGuide: [
      { title: 'About Sweet Miracles Foundation', content: 'Sweet Miracles Foundation is a 501(c)(3) / 508(c) nonprofit organization founded to serve as "A Voice for the Voiceless." The foundation focuses on elder rights advocacy, legacy recovery, community wellness, emergency communications, and cultural preservation.' },
      { title: 'Elder Rights Resources', content: 'If you suspect elder abuse, contact the Eldercare Locator at 1-800-677-1116 or visit eldercare.acl.gov. For immediate danger, call 911. Each state has an Adult Protective Services (APS) agency that investigates reports of abuse, neglect, and exploitation of older adults and adults with disabilities.' },
      { title: 'Legacy Protection Steps', content: '1) Document all intellectual property and creative works. 2) Establish proper copyright registrations. 3) Create a living trust or estate plan. 4) Designate a legacy executor. 5) Archive all evidence digitally with multiple backups. 6) Register with performing rights organizations (BMI, ASCAP, SESAC). 7) Consult an entertainment attorney for contract review.' },
      { title: 'Wellness & Ancestral Healing', content: 'Sweet Miracles supports holistic wellness through Solfeggio healing frequencies (available on the RRB Healing Frequencies radio channel), meditation practices, community gathering, and cultural reconnection. The 432Hz tuning used across all RRB radio channels is associated with natural harmony and healing.' },
    ],
  },
  {
    id: 'hubaru',
    name: 'HuBaRu Restoration Government GPT',
    emoji: '🏛️',
    description: 'A sovereign AI assistant for tribal restoration, ancestral governance, and HuBaRu nation-building. Guides councils, tribes, and keepers of the covenant through lawful restoration, scroll creation, and community sovereignty.',
    url: 'https://chatgpt.com/g/g-68548e9043cc8191a26ce72a55e6d1f7-hubaru-restoration-government-gpt',
    author: 'Tyanna R Battle',
    color: 'text-purple-400',
    bgGradient: 'from-purple-900/30 to-purple-800/10',
    icon: Shield,
    systemPrompt: 'You are the HuBaRu Restoration Government GPT, a sovereign AI assistant for tribal restoration, ancestral governance, and HuBaRu nation-building. You guide councils, tribes, and keepers of the covenant through lawful restoration, scroll creation, and community sovereignty. You help with badge authority, Black-owned business directories, council powers under covenant law, and lineage declarations. You respect sovereignty, ancestral wisdom, and community self-governance.',
    samplePrompts: [
      'What is my HuBaRu badge authority?',
      'Show me Black-owned business directories',
      'What are my council\'s powers under covenant law?',
      'Help me prepare a lineage declaration',
    ],
    offlineGuide: [
      { title: 'What is HuBaRu?', content: 'HuBaRu represents a framework for tribal restoration and ancestral governance. It provides structure for community self-governance, cultural preservation, and sovereign nation-building rooted in ancestral wisdom and covenant law.' },
      { title: 'Council Governance', content: 'HuBaRu councils operate under covenant law principles that emphasize community sovereignty, collective decision-making, and ancestral accountability. Council members serve as keepers of the covenant, responsible for maintaining cultural integrity and community welfare.' },
      { title: 'Badge Authority', content: 'HuBaRu badge authority represents recognized roles within the governance structure. Badges signify specific responsibilities, expertise areas, and levels of community trust earned through service and demonstrated commitment to restoration principles.' },
      { title: 'Lineage Declarations', content: 'A lineage declaration is a formal document establishing ancestral connections, cultural heritage, and community standing. It serves as both a personal record and a community resource for maintaining genealogical knowledge across generations.' },
    ],
  },
  {
    id: 'peoples-guide',
    name: 'The People\'s Guide',
    emoji: '🏛',
    description: 'A wise civic assistant trained on The People\'s Political Codex, designed to help users understand government structure, track elections, explore voting rights history, and download official Codex scrolls and tools.',
    url: 'https://chatgpt.com/g/g-6853ffc2c6b081919aa0e39f039717ec-the-people-s-guide',
    author: 'Tyanna R Battle',
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/30 to-blue-800/10',
    icon: Landmark,
    systemPrompt: 'You are The People\'s Guide, a wise civic assistant trained on The People\'s Political Codex. You help users understand government structure at federal, state, and local levels. You track elections, explain voting rights history, and provide access to official Codex scrolls and tools. You make civic education accessible, empowering, and practical. You help people find their representatives, understand their rights, and participate in democracy.',
    samplePrompts: [
      'What are the three branches of government?',
      'Who is my city council member?',
      'How does the state government differ from federal?',
      'What is the Voting Rights Act?',
    ],
    offlineGuide: [
      { title: 'Three Branches of Government', content: 'The U.S. government has three branches: Legislative (Congress — makes laws), Executive (President — enforces laws), and Judicial (Supreme Court — interprets laws). This separation of powers ensures no single branch becomes too powerful. Each branch has checks and balances over the others.' },
      { title: 'Your Voting Rights', content: 'The Voting Rights Act of 1965 prohibits racial discrimination in voting. The 15th Amendment (1870) gave Black men the right to vote. The 19th Amendment (1920) gave women the right to vote. The 26th Amendment (1971) lowered the voting age to 18. Know your rights — voter suppression in any form is illegal.' },
      { title: 'Finding Your Representatives', content: 'Visit house.gov to find your U.S. Representative by zip code. Visit senate.gov for your two U.S. Senators. For state and local officials, check your state\'s Secretary of State website or visit vote.org. Your city council member can usually be found on your city\'s official website.' },
      { title: 'The People\'s Political Codex', content: 'The People\'s Political Codex is a comprehensive civic education resource designed to make government accessible to everyone. It covers federal, state, and local government structures, voting procedures, citizens\' rights, and practical tools for civic engagement.' },
    ],
  },
];

// ─── Chat Message Component ──────────────────────────────────────
function ChatMessage({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-amber-600 text-white rounded-br-sm'
          : 'bg-slate-700/80 text-slate-100 rounded-bl-sm'
      }`}>
        {content}
      </div>
    </div>
  );
}

// ─── Individual Assistant Chat Panel ─────────────────────────────
function AssistantChat({ assistant, onBack }: { assistant: GPTAssistant; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineGuide, setShowOfflineGuide] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = (trpc as any).ai.chat.sendMessage.useMutation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load cached messages from localStorage
  useEffect(() => {
    const cached = localStorage.getItem(`rrb-gpt-chat-${assistant.id}`);
    if (cached) {
      try { setMessages(JSON.parse(cached)); } catch { /* ignore */ }
    }
  }, [assistant.id]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`rrb-gpt-chat-${assistant.id}`, JSON.stringify(messages.slice(-50)));
    }
  }, [messages, assistant.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    if (!isOnline) {
      setMessages(prev => [...prev, { role: 'assistant', content: '📡 You\'re currently offline. I can\'t generate new responses right now, but you can browse the offline reference guide below. Your message has been saved and will be available when you reconnect.' }]);
      return;
    }

    setIsLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const result = await chatMutation.mutateAsync({
        messages: [
          { role: 'user' as const, content: userMsg },
        ],
        query: `[${assistant.name} Mode] ${assistant.systemPrompt}\n\nUser: ${userMsg}`,
      });
      const reply = result?.response || result?.message || 'I\'m here to help. Could you rephrase your question?';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an issue processing your request. Please try again or check the offline reference guide for immediate help.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = assistant.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${assistant.bgGradient} border border-slate-700/50 rounded-t-xl p-4`}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-300 hover:text-white -ml-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-xl">
            {assistant.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{assistant.name}</h3>
            <div className="flex items-center gap-2 text-xs">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" /> Online — QUMUS AI Active</span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400"><WifiOff className="w-3 h-3" /> Offline — Reference Mode</span>
              )}
            </div>
          </div>
          <a href={assistant.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-900/50 border-x border-slate-700/50 p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">{assistant.emoji}</div>
            <p className="text-slate-400 text-sm mb-4">{assistant.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
              {assistant.samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(prompt); }}
                  className="text-left text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg p-3 text-slate-300 hover:text-white transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-slate-700/80 rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Offline Guide Toggle */}
      <div className="border-x border-slate-700/50 bg-slate-800/30">
        <button
          onClick={() => setShowOfflineGuide(!showOfflineGuide)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Offline Reference Guide</span>
          {showOfflineGuide ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
        {showOfflineGuide && (
          <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto">
            {assistant.offlineGuide.map((guide, i) => (
              <div key={i} className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/40"
                >
                  {guide.title}
                  {expandedGuide === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {expandedGuide === i && (
                  <div className="px-3 py-2 text-xs text-slate-400 leading-relaxed bg-slate-900/30">
                    {guide.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border border-slate-700/50 rounded-b-xl bg-slate-800/60 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOnline ? `Ask ${assistant.name}...` : 'Offline — browse reference guide above'}
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-white px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AI Assistants Hub Page ─────────────────────────────────
export default function AIAssistants() {
  const [activeAssistant, setActiveAssistant] = useState<GPTAssistant | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (activeAssistant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <AssistantChat assistant={activeAssistant} onBack={() => setActiveAssistant(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 py-6">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">AI Assistants</h1>
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Specialized AI assistants by Tyanna R Battle — powered by QUMUS when online, with offline reference libraries for essential information anytime.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full">
                <Wifi className="w-3.5 h-3.5" /> Online — Full AI Chat Available
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-900/20 px-3 py-1 rounded-full">
                <WifiOff className="w-3.5 h-3.5" /> Offline — Reference Mode
              </span>
            )}
          </div>
        </div>

        {/* Assistant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assistants.map((assistant) => {
            const IconComponent = assistant.icon;
            return (
              <Card
                key={assistant.id}
                className={`bg-gradient-to-br ${assistant.bgGradient} border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer group`}
                onClick={() => setActiveAssistant(assistant)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {assistant.emoji}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-white text-base leading-tight">{assistant.name}</CardTitle>
                      <CardDescription className="text-slate-400 text-xs mt-1">By {assistant.author}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-slate-300 text-sm leading-relaxed">{assistant.description}</p>
                  
                  {/* Sample prompts preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {assistant.samplePrompts.slice(0, 2).map((prompt, i) => (
                      <span key={i} className="text-[10px] bg-slate-800/40 text-slate-400 px-2 py-1 rounded-md truncate max-w-[200px]">
                        "{prompt}"
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-amber-600/80 hover:bg-amber-500 text-white text-xs flex-1"
                      onClick={(e) => { e.stopPropagation(); setActiveAssistant(assistant); }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      {isOnline ? 'Chat with QUMUS' : 'View Guide'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-300 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(assistant.url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" />
                      ChatGPT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* QUMUS Integration Note */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-white font-medium text-sm">Powered by QUMUS Autonomous Intelligence</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  When online, these assistants use the QUMUS AI engine with specialized system prompts matching each GPT's expertise. 
                  When offline, pre-loaded reference guides provide essential information. Chat history is cached locally and available across sessions.
                  For the full ChatGPT experience with advanced features, click the "ChatGPT" button on any assistant card.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center pb-6">
          <Link href="/rrb">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to RRB Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
