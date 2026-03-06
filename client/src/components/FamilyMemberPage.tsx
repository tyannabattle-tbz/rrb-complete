import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Star, Award, Heart, Users, Megaphone, Bot, 
  Play, Pause, Volume2, ExternalLink, Sparkles,
  Globe, Music, Shield, BookOpen, Zap, Radio, MessageCircle,
  type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// SHARED TYPES — Used by all family member pages
// ============================================================================

export interface ActiveBot {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'processing';
  platform: string[];
  description: string;
  lastAction: string;
  autonomyLevel: number;
}

export interface Commercial {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'text';
  duration: string;
  script: string;
  tagline: string;
  category: string;
  audioUrl?: string;  // CDN URL for the commercial audio file
}

export interface Accomplishment {
  title: string;
  description: string;
  year: string;
  category: string;
  icon: LucideIcon;
}

export interface FamilyMemberData {
  name: string;
  title: string;
  subtitle: string;
  parentOrg: string;
  accentColor: string;       // e.g. 'purple', 'blue', 'emerald', 'rose', 'amber'
  gradientFrom: string;      // Tailwind gradient class
  gradientVia: string;
  bots: ActiveBot[];
  commercials: Commercial[];
  accomplishments: Accomplishment[];
  platformCount: string;
  showHybridCast?: boolean;
}

// ============================================================================
// COLOR MAPPING — Maps accent color names to Tailwind classes
// ============================================================================

const colorMap: Record<string, {
  border: string;
  borderHover: string;
  bg: string;
  text: string;
  badge: string;
  badgeBorder: string;
  button: string;
  buttonHover: string;
  ring: string;
}> = {
  purple: {
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/40',
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    badge: 'bg-purple-600',
    badgeBorder: 'border-purple-500/30',
    button: 'bg-purple-600',
    buttonHover: 'hover:bg-purple-700',
    ring: 'border-purple-500/50',
  },
  blue: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    badge: 'bg-blue-600',
    badgeBorder: 'border-blue-500/30',
    button: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    ring: 'border-blue-500/50',
  },
  emerald: {
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    badge: 'bg-emerald-600',
    badgeBorder: 'border-emerald-500/30',
    button: 'bg-emerald-600',
    buttonHover: 'hover:bg-emerald-700',
    ring: 'border-emerald-500/50',
  },
  rose: {
    border: 'border-rose-500/20',
    borderHover: 'hover:border-rose-500/40',
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    badge: 'bg-rose-600',
    badgeBorder: 'border-rose-500/30',
    button: 'bg-rose-600',
    buttonHover: 'hover:bg-rose-700',
    ring: 'border-rose-500/50',
  },
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    badge: 'bg-amber-600',
    badgeBorder: 'border-amber-500/30',
    button: 'bg-amber-600',
    buttonHover: 'hover:bg-amber-700',
    ring: 'border-amber-500/50',
  },
  cyan: {
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/40',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300',
    badge: 'bg-cyan-600',
    badgeBorder: 'border-cyan-500/30',
    button: 'bg-cyan-600',
    buttonHover: 'hover:bg-cyan-700',
    ring: 'border-cyan-500/50',
  },
};

// ============================================================================
// REUSABLE FAMILY MEMBER PAGE COMPONENT
// ============================================================================

export default function FamilyMemberPage({ data }: { data: FamilyMemberData }) {
  const [, setLocation] = useLocation();
  const [activeCommercial, setActiveCommercial] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [botPulse, setBotPulse] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const c = colorMap[data.accentColor] || colorMap.purple;

  // Simulate bot activity pulses
  useEffect(() => {
    if (data.bots.length === 0) return;
    const interval = setInterval(() => {
      const randomBot = data.bots[Math.floor(Math.random() * data.bots.length)];
      setBotPulse(prev => ({ ...prev, [randomBot.id]: true }));
      setTimeout(() => {
        setBotPulse(prev => ({ ...prev, [randomBot.id]: false }));
      }, 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, [data.bots]);

  const categories = ['All', ...new Set(data.accomplishments.map(a => a.category))];
  const filteredAccomplishments = selectedCategory === 'All' 
    ? data.accomplishments 
    : data.accomplishments.filter(a => a.category === selectedCategory);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const playCommercial = (commercial: Commercial) => {
    // If same commercial, toggle pause/play
    if (activeCommercial === commercial.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setActiveCommercial(null);
      setAudioProgress(0);
      toast('Commercial Paused', { description: commercial.title });
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setActiveCommercial(commercial.id);
      setAudioProgress(0);

      // Play real audio if available
      if (commercial.audioUrl) {
        const audio = new Audio(commercial.audioUrl);
        audioRef.current = audio;
        audio.play().catch(() => {
          toast.error('Audio playback failed', { description: 'Could not play the commercial audio.' });
        });

        // Track progress
        progressIntervalRef.current = setInterval(() => {
          if (audio.duration && audio.currentTime) {
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }
        }, 200);

        audio.onended = () => {
          setActiveCommercial(null);
          setAudioProgress(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          audioRef.current = null;
          toast('Commercial Complete', { description: commercial.title });
        };

        toast('Now Playing', { description: `${commercial.title} — ${commercial.duration}` });
      } else {
        // No audio URL — show script only
        toast('Now Playing (Script)', { description: `${commercial.title} — ${commercial.duration}` });
      }
    }
  };

  return (
    <div className={`min-h-screen ${data.gradientFrom} ${data.gradientVia}`}>
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
            <div className="h-6 w-px bg-white/20" />
            <span className={`${c.text} font-semibold`}>{data.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Bot className="w-3 h-3 mr-1" /> {data.bots.filter(b => b.status === 'active').length} Bots Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 ${c.bg} border ${c.border} rounded-full px-4 py-1.5 mb-6`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className={`${c.text} text-sm`}>{data.parentOrg}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {data.name}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-2">
              {data.title}
            </p>
            <p className="text-amber-300 text-lg">
              {data.subtitle}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Active Bots', value: data.bots.filter(b => b.status === 'active').length.toString(), icon: Bot, color: 'text-green-400' },
              { label: 'Accomplishments', value: data.accomplishments.length.toString(), icon: Award, color: 'text-amber-400' },
              { label: 'Commercials', value: data.commercials.length.toString(), icon: Megaphone, color: c.text },
              { label: 'Platforms', value: data.platformCount, icon: Globe, color: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accomplishments Section */}
      <section className="py-12 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400" />
            Personal Accomplishments
          </h2>
          <p className="text-gray-400 mb-8">Verified achievements and ongoing contributions</p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat 
                  ? `${c.badge} ${c.buttonHover} text-white` 
                  : `${c.badgeBorder} ${c.text} hover:bg-white/5 bg-transparent`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Accomplishments Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredAccomplishments.map((acc, i) => (
              <Card key={i} className={`bg-white/5 ${c.border} ${c.borderHover} transition-all`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                      <acc.icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{acc.title}</h3>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-300 mb-2 text-xs">
                        {acc.year} — {acc.category}
                      </Badge>
                      <p className="text-gray-300 text-sm leading-relaxed">{acc.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commercials Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-amber-400" />
            Commercials
          </h2>
          <p className="text-gray-400 mb-8">Promotional content — A Canryn Production</p>

          <div className="space-y-4">
            {data.commercials.map((commercial) => (
              <Card 
                key={commercial.id} 
                className={`bg-white/5 border transition-all ${
                  activeCommercial === commercial.id 
                    ? 'border-amber-500/50 bg-amber-500/5' 
                    : `${c.border} ${c.borderHover}`
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`shrink-0 w-12 h-12 rounded-full p-0 ${
                        activeCommercial === commercial.id
                          ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                          : `${c.badgeBorder} ${c.text} bg-transparent`
                      }`}
                      onClick={() => playCommercial(commercial)}
                    >
                      {activeCommercial === commercial.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{commercial.title}</h3>
                        <Badge variant="outline" className={`${c.badgeBorder} ${c.text} text-xs`}>
                          {commercial.duration}
                        </Badge>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs">
                          {commercial.category}
                        </Badge>
                      </div>
                      <p className="text-amber-300 text-sm font-medium mb-2">{commercial.tagline}</p>
                      {activeCommercial === commercial.id && (
                        <div className="bg-black/30 rounded-lg p-4 mt-3 border border-amber-500/20">
                          <p className="text-gray-300 text-sm italic leading-relaxed">
                            "{commercial.script}"
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Volume2 className="w-4 h-4 text-amber-400" />
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all duration-200" style={{ width: `${commercial.audioUrl ? audioProgress : 60}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{commercial.duration}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            All commercials are productions of Canryn Production and its subsidiaries. All rights reserved.
          </p>
        </div>
      </section>

      {/* Active Bots Section */}
      <section className="py-12 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-green-400" />
            Active Bots
          </h2>
          <p className="text-gray-400 mb-8">QUMUS-controlled autonomous agents — 90% Valanna / 10% Human Override</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.bots.map((bot) => (
              <Card 
                key={bot.id} 
                className={`bg-white/5 border transition-all ${
                  botPulse[bot.id] 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : c.border
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        bot.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      } ${botPulse[bot.id] ? 'animate-ping' : ''}`} />
                      {bot.name}
                    </CardTitle>
                    <Badge className={`text-xs ${
                      bot.status === 'active' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    }`}>
                      {bot.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-3">{bot.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {bot.platform.map(p => (
                      <Badge key={p} variant="outline" className={`${c.badgeBorder} ${c.text} text-xs`}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-gray-500">Last Action:</span>
                    </div>
                    <p className="text-xs text-gray-300">{bot.lastAction}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Autonomy Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 rounded-full" 
                          style={{ width: `${bot.autonomyLevel * 100}%` }} 
                        />
                      </div>
                      <span className="text-xs text-green-400">{Math.round(bot.autonomyLevel * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Partner — HybridCast Integration (optional) */}
      {data.showHybridCast !== false && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              Platform Partner — HybridCast
            </h2>
            <p className="text-gray-400 mb-8">Emergency broadcast integration — Powered by QUMUS</p>

            <Card className="bg-gradient-to-br from-cyan-950/50 to-slate-900/50 border-cyan-500/20">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <Radio className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">HybridCast Emergency Broadcast PWA</h3>
                    <p className="text-cyan-200 mb-1">v2.47.24 — 116+ Feature Tabs — Offline-First Architecture</p>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      Full emergency broadcast command center with mesh networking, satellite tracking, 
                      AI monitoring, military mapping, and QUMUS autonomous orchestration. Integrated as 
                      a platform partner for community emergency preparedness and crisis communication.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Emergency Alerts', 'Mesh Networking', 'Offline-First', 'GPS Tracking', 'AI Monitoring', 'QUMUS Integration'].map(tag => (
                        <Badge key={tag} variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        onClick={() => window.open('https://hybridcast.manus.space/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Open HybridCast
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 bg-transparent"
                        onClick={() => setLocation('/emergency')}
                      >
                        <Shield className="w-4 h-4 mr-2" /> Emergency Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Canryn Production and its subsidiaries. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {data.parentOrg} | Sweet Miracles 501(c)(3) & 508
          </p>
          <p className="text-gray-600 text-xs mt-1">
            All content verified and presented with proper attribution. Sources available upon request.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// RE-EXPORT ICON REFERENCES for data files
// ============================================================================
export { Star, Award, Heart, Users, Megaphone, Bot, Globe, Music, Shield, BookOpen, Zap, Radio, MessageCircle, Sparkles };
