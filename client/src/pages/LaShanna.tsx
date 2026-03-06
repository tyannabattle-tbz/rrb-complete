import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Star, Award, Heart, Users, Megaphone, Bot, 
  Play, Pause, Volume2, VolumeX, ExternalLink, Sparkles,
  Globe, Music, Shield, BookOpen, Zap, Radio, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// BOT CONFIGURATION — Activated bots for LaShanna's page
// ============================================================================

interface ActiveBot {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'processing';
  platform: string[];
  description: string;
  lastAction: string;
  autonomyLevel: number;
}

const LASHANNA_BOTS: ActiveBot[] = [
  {
    id: 'social_promo_bot',
    name: "Anna's Promotions Bot",
    status: 'active',
    platform: ['Twitter/X', 'Instagram', 'Facebook', 'TikTok'],
    description: 'Cross-platform social media promotion for LaShanna\'s advocacy work and community events',
    lastAction: 'Scheduled community advocacy post for Selma Jubilee 2026',
    autonomyLevel: 0.85,
  },
  {
    id: 'community_engagement_bot',
    name: 'Community Engagement Bot',
    status: 'active',
    platform: ['Web', 'Discord', 'Facebook'],
    description: 'Manages community interactions, event RSVPs, and volunteer coordination',
    lastAction: 'Processing SQUADD coalition member registrations',
    autonomyLevel: 0.80,
  },
  {
    id: 'sweet_miracles_bot',
    name: 'Sweet Miracles Donation Bot',
    status: 'active',
    platform: ['Web', 'Discord'],
    description: 'Tracks donations, impact metrics, and generates community impact reports',
    lastAction: 'Generated monthly impact report for Sweet Miracles 501(c)(3)',
    autonomyLevel: 0.75,
  },
  {
    id: 'content_curator_bot',
    name: 'Content Curator Bot',
    status: 'active',
    platform: ['Web', 'YouTube'],
    description: 'Curates and schedules content showcasing advocacy work and accomplishments',
    lastAction: 'Curated advocacy highlights reel for community outreach',
    autonomyLevel: 0.90,
  },
  {
    id: 'legacy_archive_bot',
    name: 'Legacy Archive Bot',
    status: 'active',
    platform: ['Web'],
    description: 'Preserves and verifies all documentation related to family legacy and accomplishments',
    lastAction: 'Archived Selma Jubilee event documentation',
    autonomyLevel: 0.90,
  },
];

// ============================================================================
// COMMERCIAL DATA — LaShanna's promotional commercials
// ============================================================================

interface Commercial {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'text';
  duration: string;
  script: string;
  tagline: string;
  category: string;
}

const COMMERCIALS: Commercial[] = [
  {
    id: 'comm_advocacy',
    title: 'A Voice for the Voiceless',
    type: 'audio',
    duration: '30s',
    script: `When communities need a champion, LaShanna Russell answers the call. From Selma to the United Nations, she's building bridges that connect people to the resources they need. Sweet Miracles — A Voice for the Voiceless. Because every community deserves to be heard. Visit manuweb.sbs to learn more.`,
    tagline: 'Sweet Miracles — A Voice for the Voiceless',
    category: 'Community Advocacy',
  },
  {
    id: 'comm_squadd',
    title: 'SQUADD Coalition — Stronger Together',
    type: 'audio',
    duration: '30s',
    script: `Sisters Questing Unapologetically After Divine Destiny. The SQUADD Coalition brings women together from across the globe to create lasting change. Led by visionary advocates like LaShanna Russell, SQUADD is turning faith into action. Join the movement at manuweb.sbs/squadd. A Canryn Production.`,
    tagline: 'SQUADD — Sisters Questing Unapologetically After Divine Destiny',
    category: 'Coalition Building',
  },
  {
    id: 'comm_selma',
    title: 'Grits & Greens — Selma Jubilee 2026',
    type: 'audio',
    duration: '15s',
    script: `Grits and Greens — Selma Jubilee 2026! Turning individual grit into collective green. March 7th at Wallace Community College. Join LaShanna Russell and the SQUADD Coalition for a day of community, culture, and connection. Details at manuweb.sbs/selma.`,
    tagline: 'Turning Individual Grit into Collective Green',
    category: 'Events',
  },
  {
    id: 'comm_annas',
    title: "Anna's Promotions — Building Brands, Building Community",
    type: 'audio',
    duration: '30s',
    script: `Anna's Promotions — where community meets creativity. Named in honor of family legacy, Anna's Promotions handles promotional duties for Canryn Production and its subsidiaries. From event planning to brand development, LaShanna Russell and Tyanna Battle bring vision to life. Anna's Promotions — Building Brands, Building Community. A Canryn Production subsidiary.`,
    tagline: "Anna's Promotions — Building Brands, Building Community",
    category: 'Business',
  },
  {
    id: 'comm_un',
    title: 'UN NGO CSW70 — Global Advocacy',
    type: 'audio',
    duration: '30s',
    script: `From Selma, Alabama to the United Nations in New York. LaShanna Russell represents the SQUADD Coalition at the UN NGO Commission on the Status of Women, CSW70, in partnership with Ghana. Advocating for women's rights, community empowerment, and divine destiny on the world stage. March 17, 2026. A Canryn Production.`,
    tagline: 'From Selma to the United Nations — Global Advocacy',
    category: 'International',
  },
];

// ============================================================================
// ACCOMPLISHMENTS DATA
// ============================================================================

interface Accomplishment {
  title: string;
  description: string;
  year: string;
  category: string;
  icon: typeof Star;
}

const ACCOMPLISHMENTS: Accomplishment[] = [
  {
    title: 'SQUADD Coalition Co-Founder',
    description: 'Co-founded Sisters Questing Unapologetically After Divine Destiny — a coalition uniting women across communities for advocacy, empowerment, and collective action.',
    year: '2024–Present',
    category: 'Leadership',
    icon: Users,
  },
  {
    title: 'UN NGO CSW70 Representative',
    description: 'Selected to represent the SQUADD Coalition at the United Nations NGO Commission on the Status of Women (CSW70) in partnership with Ghana, advocating for women\'s rights on the global stage.',
    year: '2026',
    category: 'International',
    icon: Globe,
  },
  {
    title: 'Grits & Greens — Selma Jubilee 2026 Organizer',
    description: 'Lead organizer of the Grits & Greens Selma Jubilee 2026 event — "Turning Individual Grit into Collective Green" — bringing community together for empowerment and cultural celebration.',
    year: '2026',
    category: 'Events',
    icon: Award,
  },
  {
    title: "Anna's Promotions Co-Director",
    description: "Co-directs Anna's Promotions alongside Tyanna Battle — the promotional arm of Canryn Production, handling brand development, event promotion, and community outreach.",
    year: '2024–Present',
    category: 'Business',
    icon: Megaphone,
  },
  {
    title: 'Sweet Miracles Community Advocate',
    description: 'Active advocate for Sweet Miracles 501(c)(3) & 508 organization — "A Voice for the Voiceless" — connecting communities with resources during crises and beyond.',
    year: '2024–Present',
    category: 'Nonprofit',
    icon: Heart,
  },
  {
    title: 'Legacy Preservation Champion',
    description: 'Instrumental in the Rockin Rockin Boogie legacy restoration project, ensuring the preservation of Seabrun Candy Hunter\'s musical legacy and family history for future generations.',
    year: '2024–Present',
    category: 'Legacy',
    icon: BookOpen,
  },
  {
    title: 'Community Broadcasting Pioneer',
    description: 'Helping establish community broadcasting infrastructure through Canryn Production, ensuring communities have access to their own media production and broadcast capabilities.',
    year: '2025–Present',
    category: 'Broadcasting',
    icon: Radio,
  },
  {
    title: 'Digital Innovation Leader',
    description: 'Driving digital transformation through the QUMUS ecosystem — autonomous orchestration, HybridCast emergency broadcasting, and community-first technology platforms.',
    year: '2025–Present',
    category: 'Technology',
    icon: Zap,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LaShanna() {
  const [, setLocation] = useLocation();

  const [activeCommercial, setActiveCommercial] = useState<string | null>(null);
  const [botPulse, setBotPulse] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Simulate bot activity pulses
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBot = LASHANNA_BOTS[Math.floor(Math.random() * LASHANNA_BOTS.length)];
      setBotPulse(prev => ({ ...prev, [randomBot.id]: true }));
      setTimeout(() => {
        setBotPulse(prev => ({ ...prev, [randomBot.id]: false }));
      }, 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['All', ...new Set(ACCOMPLISHMENTS.map(a => a.category))];
  const filteredAccomplishments = selectedCategory === 'All' 
    ? ACCOMPLISHMENTS 
    : ACCOMPLISHMENTS.filter(a => a.category === selectedCategory);

  const playCommercial = (commercial: Commercial) => {
    if (activeCommercial === commercial.id) {
      setActiveCommercial(null);
      toast({ title: 'Commercial Paused', description: commercial.title });
    } else {
      setActiveCommercial(commercial.id);
      toast({ title: 'Now Playing', description: `${commercial.title} — ${commercial.duration}` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
            <div className="h-6 w-px bg-purple-500/30" />
            <span className="text-purple-300 font-semibold">LaShanna Russell</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Bot className="w-3 h-3 mr-1" /> {LASHANNA_BOTS.filter(b => b.status === 'active').length} Bots Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-purple-300 text-sm">Canryn Production — Anna's Promotions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              LaShanna Russell
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-2">
              Community Advocate — Coalition Builder — Legacy Champion
            </p>
            <p className="text-amber-300 text-lg">
              Co-Director, Anna's Promotions | SQUADD Coalition | Sweet Miracles
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Active Bots', value: LASHANNA_BOTS.filter(b => b.status === 'active').length.toString(), icon: Bot, color: 'text-green-400' },
              { label: 'Accomplishments', value: ACCOMPLISHMENTS.length.toString(), icon: Award, color: 'text-amber-400' },
              { label: 'Commercials', value: COMMERCIALS.length.toString(), icon: Megaphone, color: 'text-purple-400' },
              { label: 'Platforms', value: '5+', icon: Globe, color: 'text-blue-400' },
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
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent'}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Accomplishments Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredAccomplishments.map((acc, i) => (
              <Card key={i} className="bg-white/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <acc.icon className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{acc.title}</h3>
                      </div>
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
            {COMMERCIALS.map((commercial) => (
              <Card 
                key={commercial.id} 
                className={`bg-white/5 border transition-all ${
                  activeCommercial === commercial.id 
                    ? 'border-amber-500/50 bg-amber-500/5' 
                    : 'border-purple-500/20 hover:border-purple-500/40'
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
                          : 'border-purple-500/30 text-purple-300 bg-transparent'
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
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
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
                              <div className="h-full bg-amber-400 rounded-full animate-pulse" style={{ width: '60%' }} />
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
            {LASHANNA_BOTS.map((bot) => (
              <Card 
                key={bot.id} 
                className={`bg-white/5 border transition-all ${
                  botPulse[bot.id] 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-purple-500/20'
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
                      <Badge key={p} variant="outline" className="border-purple-500/20 text-purple-300 text-xs">
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

      {/* Platform Partner — HybridCast Integration */}
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

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-purple-500/10">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Canryn Production and its subsidiaries. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Anna's Promotions — A Canryn Production subsidiary | Sweet Miracles 501(c)(3) & 508
          </p>
          <p className="text-gray-600 text-xs mt-1">
            All content verified and presented with proper attribution. Sources available upon request.
          </p>
        </div>
      </footer>
    </div>
  );
}
