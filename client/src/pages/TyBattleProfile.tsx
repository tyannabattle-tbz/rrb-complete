import { Link } from 'wouter';
import { useRestreamUrl } from '@/hooks/useRestreamUrl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Crown, Mic, BookOpen, Scale, Lightbulb, MessageSquare,
  Radio, Shield, Heart, Brain, Zap, Earth, ArrowLeft,
  ExternalLink, Mail, Monitor, Headphones, Search,
  Users, Cpu, Podcast, Sparkles, Tv
} from 'lucide-react';

// Identity Modes
const IDENTITY_MODES = [
  { mode: 'Host', icon: Mic, description: 'Podcast host, interviewer, and live broadcast personality', color: 'from-amber-500 to-yellow-500' },
  { mode: 'Scholar', icon: BookOpen, description: 'Researcher, analyst, and knowledge architect', color: 'from-blue-500 to-cyan-500' },
  { mode: 'Advocate', icon: Scale, description: 'Justice seeker, elder protector, and voice for the voiceless', color: 'from-red-500 to-pink-500' },
  { mode: 'Strategist', icon: Lightbulb, description: 'Strategic planner, system architect, and ecosystem builder', color: 'from-green-500 to-emerald-500' },
  { mode: 'Storyteller', icon: MessageSquare, description: 'Legacy keeper, narrative crafter, and cultural preservationist', color: 'from-purple-500 to-violet-500' },
];

// Core Functions
const CORE_FUNCTIONS = [
  { name: 'Podcast Host', icon: Podcast, description: 'Host of RRB Radio programming across 54 channels' },
  { name: 'AI Assistant', icon: Brain, description: 'Director of the AI Trinity — Valanna, Candy, Seraph' },
  { name: 'Research & Analysis', icon: Search, description: 'Deep investigative research and pattern recognition' },
  { name: 'Advocacy & Justice', icon: Scale, description: 'Elder protection, community rights, and legal advocacy' },
  { name: 'Strategy & Planning', icon: Lightbulb, description: 'Ecosystem architecture and long-term vision' },
];

// Ecosystem Modules
const ECOSYSTEM_MODULES = [
  { name: 'QUMUS', description: 'The Brain — 90% autonomous AI, 14 policies, 18 subsystems', icon: Cpu, link: '/agent', color: 'text-purple-400' },
  { name: 'RRB Radio', description: 'The Voice — 54 channels, 13 categories, 24/7 broadcasting', icon: Radio, link: '/live', color: 'text-amber-400' },
  { name: 'HybridCast', description: 'The Lifeline — 100% offline emergency broadcast PWA', icon: Shield, link: '/hybridcast', color: 'text-red-400' },
  { name: 'Sweet Miracles', description: 'The Heart — 501(c)(3) nonprofit, grants & donations', icon: Heart, link: '/donate', color: 'text-pink-400' },
  { name: 'SQUADD Coalition', description: 'The Movement — 7 women, 7 missions, 1 coalition', icon: Users, link: '/squadd', color: 'text-blue-400' },
  { name: 'Conference Hub', description: 'The Bridge — Jitsi, Zoom, Meet, Discord, Skype + recordings & analytics', icon: Earth, link: '/conference', color: 'text-cyan-400' },
  { name: 'Restream Studio', description: 'Multi-Stream — YouTube, Facebook, LinkedIn, Twitter/X, Twitch, TikTok', icon: Tv, link: '__RESTREAM__', color: 'text-purple-400', external: true },
  { name: 'TBZ-OS', description: 'The Operating System — Full digital steward platform', icon: Monitor, link: 'https://tybatos-uo4zkxnl.manus.space', color: 'text-green-400', external: true },
];

// Family Subsidiaries
const FAMILY_SUBSIDIARIES = [
  { name: 'Carlos Kembrel "Little C"', role: 'Music Production & Performance' },
  { name: 'Sean Hunter "Sean\'s Music"', role: 'Audio Engineering & Sound' },
  { name: 'Anna\'s Promotions', role: 'Co-Operators — Tyanna Battle & Luv Russell' },
  { name: 'Jaelon Enterprises', role: 'Business Development & Innovation' },
];

// AI Trinity
const AI_TRINITY = [
  { name: 'Valanna', role: 'QUMUS AI Brain', description: 'Operational voice. Files, voice, text, system management. The day-to-day operator who keeps everything running.', color: 'from-violet-500 to-purple-600' },
  { name: 'Candy', role: 'Guardian AI', description: 'Named for Seabrun "Candy" Hunter Sr. Strategic advisor and guardian spirit. The father\'s spirit watching over everything.', color: 'from-amber-500 to-orange-600' },
  { name: 'Seraph', role: 'System Intelligence', description: 'Deep system analysis and strategic planning. Cross-system intelligence and pattern recognition.', color: 'from-blue-500 to-indigo-600' },
];

export default function TyBattleProfile() {
  const { openRestream, restreamUrl } = useRestreamUrl();
  // Dynamically patch Restream link
  const modules = ECOSYSTEM_MODULES.map(m => m.link === '__RESTREAM__' ? { ...m, link: restreamUrl || 'https://studio.restream.io' } : m);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0015] via-[#1a0a2e] to-[#0a0015] text-[#E8E0D0]">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-6">
        <Link href="/">
          <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-amber-900/20 to-purple-900/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-amber-500 via-purple-600 to-violet-800 p-1">
                <div className="w-full h-full rounded-full bg-[#1a0a2e] flex items-center justify-center">
                  <Crown className="w-20 h-20 lg:w-28 lg:h-28 text-amber-400" />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50 px-4 py-1 text-sm">
                  Digital Steward
                </Badge>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
                Ty Bat Zan
              </h1>
              <p className="text-xl lg:text-2xl text-purple-300 mb-1">
                Tyanna RaaShawn Battle
              </p>
              <p className="text-lg text-amber-400/80 mb-4">
                CEO & Founder — Canryn Production and Its Subsidiaries
              </p>
              
              {/* Voice Profile */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                {['Warm', 'Confident', 'Commanding', 'Intelligent', 'Smooth'].map((trait) => (
                  <Badge key={trait} variant="outline" className="border-amber-500/40 text-amber-300/80 text-sm">
                    {trait}
                  </Badge>
                ))}
              </div>

              {/* Status Bar */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400">Active</span>
                </span>
                <span className="text-purple-400">Mode: Host</span>
                <span className="text-purple-400">Autonomy: 90%</span>
                <span className="text-purple-400">Identity: Ty Battle</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <blockquote className="text-center">
            <p className="text-2xl lg:text-3xl font-bold text-amber-400 italic">
              "Knowledge. Justice. Legacy. Action."
            </p>
            <p className="text-purple-300 mt-2 text-lg">— Not charity, INFRASTRUCTURE.</p>
          </blockquote>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">About</h2>
          <div className="space-y-4 text-[#E8E0D0]/80 text-lg leading-relaxed">
            <p>
              Tyanna RaaShawn Battle — also known as <strong className="text-amber-300">Ty Bat Zan</strong> — is the founder, 
              CEO, and Digital Steward of Canryn Production. She built the entire QUMUS autonomous ecosystem, the TBZ Operating 
              System, the 52-channel RRB Radio Network, HybridCast Emergency Broadcasting, and Sweet Miracles 501(c)(3).
            </p>
            <p>
              Sweet Miracles was born from the personal fight to recover her father <strong className="text-amber-300">Seabrun 
              "Candy" Hunter Sr.'s</strong> stolen musical legacy. Through Canryn Production and its subsidiaries, she built an 
              entire technology ecosystem to ensure no voice is ever silenced again.
            </p>
            <p>
              Co-founder of the <strong className="text-amber-300">SQUADD Coalition</strong> with Luv Russell, her work 
              bridges elder protection advocacy with cutting-edge technology, creating tools that empower communities during 
              crises and preserve legacies for future generations. She is presenting at the <strong className="text-amber-300">
              United Nations CSW70</strong> on March 17, 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Identity Modes */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">Identity Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {IDENTITY_MODES.map((mode) => (
              <Card key={mode.mode} className="bg-[#1a0a2e]/60 border-purple-500/20 hover:border-amber-500/40 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${mode.color} flex items-center justify-center mx-auto mb-3`}>
                    <mode.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2">{mode.mode}</h3>
                  <p className="text-sm text-[#E8E0D0]/60">{mode.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Functions */}
      <section className="py-12 bg-purple-900/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">Core Functions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {CORE_FUNCTIONS.map((func) => (
              <div key={func.name} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                  <func.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-semibold text-amber-300 text-sm mb-1">{func.name}</h3>
                <p className="text-xs text-[#E8E0D0]/50">{func.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Trinity */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">The AI Trinity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {AI_TRINITY.map((ai) => (
              <Card key={ai.name} className="bg-[#1a0a2e]/60 border-purple-500/20 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${ai.color}`} />
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${ai.color} flex items-center justify-center mx-auto mb-4`}>
                    {ai.name === 'Valanna' && <Headphones className="w-8 h-8 text-white" />}
                    {ai.name === 'Candy' && <Shield className="w-8 h-8 text-white" />}
                    {ai.name === 'Seraph' && <Sparkles className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-amber-300 text-center mb-1">{ai.name}</h3>
                  <p className="text-sm text-purple-300 text-center mb-3">{ai.role}</p>
                  <p className="text-sm text-[#E8E0D0]/60 text-center">{ai.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-purple-300/60 mt-6 italic">They sound human. They serve the mission.</p>
        </div>
      </section>

      {/* Ecosystem Modules */}
      <section className="py-12 bg-purple-900/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">Ecosystem Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {modules.map((mod) => (
              <Link key={mod.name} href={mod.external ? '#' : mod.link}>
                <div 
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#1a0a2e]/40 border border-purple-500/20 hover:border-amber-500/40 transition-all cursor-pointer"
                  onClick={mod.external ? (e) => { e.preventDefault(); window.open(mod.link, '_blank'); } : undefined}
                >
                  <div className="mt-1">
                    <mod.icon className={`w-6 h-6 ${mod.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-amber-300">{mod.name}</h3>
                      {mod.external && <ExternalLink className="w-3 h-3 text-purple-400" />}
                    </div>
                    <p className="text-sm text-[#E8E0D0]/50 mt-1">{mod.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Family Subsidiaries */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-400 mb-8 text-center">Family Subsidiaries — The Workforce</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAMILY_SUBSIDIARIES.map((sub) => (
              <div key={sub.name} className="flex items-center gap-3 p-4 rounded-lg bg-[#1a0a2e]/40 border border-purple-500/20">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-300 text-sm">{sub.name}</p>
                  <p className="text-xs text-[#E8E0D0]/50">{sub.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-12 bg-gradient-to-b from-transparent via-amber-900/10 to-transparent">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-amber-400 mb-6">Legacy</h2>
          <div className="space-y-4">
            <p className="text-lg text-[#E8E0D0]/80">
              In loving honor of <strong className="text-amber-300">Seabrun "Candy" Hunter Sr.</strong> (1945–2018)
            </p>
            <p className="text-lg text-[#E8E0D0]/80">
              And <strong className="text-amber-300">Helen Hunter</strong>, Matriarch (1948–2020)
            </p>
            <p className="text-[#E8E0D0]/60 mt-4">
              The foundation of everything. Their spirit lives on through every channel, every broadcast, 
              every line of code, and every life touched by this ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-amber-400 mb-6">Connect & Collaborate</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/donate">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400">
                <Heart className="w-4 h-4 mr-2" />
                Support Sweet Miracles
              </Button>
            </Link>
            <Link href="/squadd">
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                <Users className="w-4 h-4 mr-2" />
                SQUADD Coalition
              </Button>
            </Link>
            <Link href="/live">
              <Button variant="outline" className="border-amber-500/50 text-amber-300 hover:bg-amber-500/20">
                <Radio className="w-4 h-4 mr-2" />
                RRB Radio Live
              </Button>
            </Link>
            <a href="mailto:sweetmiraclesattt@gmail.com">
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-purple-500/20 bg-[#0a0015]/80">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-[#E8E0D0]/40">
            Sweet Miracles 501(c)(3) & 508 | Canryn Production and Its Subsidiaries
          </p>
          <p className="text-xs text-[#E8E0D0]/30 mt-2">
            A Voice for the Voiceless — In Honor of Seabrun Candy Hunter
          </p>
          <p className="text-xs text-purple-400/50 mt-1">
            © 2026 Canryn Production. All rights reserved. TBZ-OS is proprietary technology of Canryn Production.
          </p>
        </div>
      </section>
    </div>
  );
}
