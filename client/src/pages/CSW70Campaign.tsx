/**
 * U.N. CSW70 Campaign Page
 * 70th Session of the Commission on the Status of Women
 * March 9-19, 2026 — United Nations Headquarters, New York
 * 
 * "Ensuring and strengthening access to justice for all women and girls"
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { 
  Globe, Radio, Heart, Shield, Users, Mic, 
  Calendar, MapPin, ExternalLink, Play, Volume2,
  Sparkles, BookOpen, Scale, Megaphone
} from 'lucide-react';

export default function CSW70Campaign() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const campaignPillars = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: 'Access to Justice',
      description: 'Leveraging technology to ensure all women and girls have access to justice systems, legal resources, and advocacy platforms.',
      action: 'HybridCast Emergency Broadcast delivers real-time alerts and legal resource information to communities worldwide.',
      color: 'bg-blue-600',
    },
    {
      icon: <Radio className="w-8 h-8" />,
      title: 'Amplifying Women\'s Voices',
      description: '54 radio channels broadcasting diverse content — music, talk, healing frequencies, and community programming led by women.',
      action: 'Rockin\' Rockin\' Boogie Radio provides a global platform for women creators, artists, and community leaders.',
      color: 'bg-purple-600',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Digital Safety & Empowerment',
      description: 'Technology infrastructure ensuring women\'s safety online and offline through mesh networking and emergency systems.',
      action: 'HybridCast mesh networking enables communication even when traditional infrastructure fails — critical for disaster response.',
      color: 'bg-emerald-600',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Charitable Impact',
      description: 'Sweet Miracles Foundation channels donations directly to programs supporting women and girls globally.',
      action: 'Every donation processed through Stripe goes directly to verified programs — transparent, accountable, immediate.',
      color: 'bg-rose-600',
    },
  ];

  const schedule = [
    { date: 'March 9', event: 'CSW70 Opening — "For ALL Women and Girls"', location: 'UN General Assembly Hall', status: 'completed' },
    { date: 'March 10', event: 'Ghana Delegation Opening Statement', location: 'Conference Room 4', status: 'completed' },
    { date: 'March 11', event: 'Technology & Justice Panel', location: 'ECOSOC Chamber', status: 'completed' },
    { date: 'March 12', event: 'Digital Empowerment Workshop', location: 'Conference Room 1', status: 'completed' },
    { date: 'March 13', event: 'Women in Broadcasting Roundtable', location: 'Conference Room 2', status: 'completed' },
    { date: 'March 14', event: 'Ministerial Roundtable — Ghana Statement', location: 'Trusteeship Council', status: 'completed' },
    { date: 'March 15', event: 'RRB Ecosystem Global Launch', location: 'Virtual — All Platforms', status: 'active' },
    { date: 'March 16', event: 'Community Voices Live Broadcast', location: 'RRB Radio Network', status: 'upcoming' },
    { date: 'March 17', event: 'Sweet Miracles Fundraising Drive', location: 'All Digital Platforms', status: 'upcoming' },
    { date: 'March 18', event: 'Closing Advocacy — Digital Justice Declaration', location: 'UN Headquarters', status: 'upcoming' },
    { date: 'March 19', event: 'CSW70 Closing — Global Agreement Adoption', location: 'UN General Assembly Hall', status: 'upcoming' },
  ];

  const ecosystemContributions = [
    { system: 'RRB Radio Network', channels: 54, description: '54 live radio channels amplifying diverse voices 24/7', link: '/radio' },
    { system: 'HybridCast', channels: 1, description: 'Emergency broadcast system with mesh networking for women\'s safety', link: '/hybridcast' },
    { system: 'Sweet Miracles', channels: 1, description: 'Charitable foundation with direct Stripe-connected donations', link: '/sweet-miracles' },
    { system: 'Conference Hub', channels: 6, description: '6-platform conference system (Jitsi, Zoom, Meet, Discord, Skype)', link: '/conference' },
    { system: 'Production Studio', channels: 1, description: 'Full recording studio for women creators and podcasters', link: '/studio' },
    { system: 'Healing Frequencies', channels: 3, description: 'Solfeggio frequency channels for wellness and meditation', link: '/meditation' },
    { system: 'QUMUS Brain', channels: 1, description: 'Autonomous AI orchestration — 20 policies, 90% autonomy', link: '/qumus' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">LIVE NOW</Badge>
            <Badge variant="outline" className="border-amber-400 text-amber-400 px-4 py-1 text-sm">CSW70 — March 9-19, 2026</Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-blue-400">United Nations</span><br />
            <span className="text-white">Commission on the</span><br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Status of Women</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mb-4">
            "Ensuring and strengthening access to justice for all women and girls"
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mb-8">
            70th Session — United Nations Headquarters, New York
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/radio">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Play className="w-5 h-5" /> Listen Live — 54 Channels
              </Button>
            </Link>
            <Link href="/sweet-miracles">
              <Button size="lg" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400/10 gap-2">
                <Heart className="w-5 h-5" /> Support the Mission
              </Button>
            </Link>
            <Link href="/conference">
              <Button size="lg" variant="outline" className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 gap-2">
                <Users className="w-5 h-5" /> Join Conference
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Campaign Overview</TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Event Schedule</TabsTrigger>
            <TabsTrigger value="ecosystem" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Our Ecosystem</TabsTrigger>
            <TabsTrigger value="action" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Take Action</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4 text-blue-300">Technology for Justice</h2>
              <p className="text-lg text-slate-300 max-w-4xl mb-8">
                The Rockin' Rockin' Boogie ecosystem — powered by QUMUS autonomous AI — represents 
                the intersection of technology and social justice that CSW70 envisions. Our platform 
                amplifies women's voices through 54 radio channels, protects communities through 
                HybridCast emergency broadcast, and channels charitable giving through Sweet Miracles 
                Foundation — all orchestrated by AI with 90% autonomy and human oversight for critical decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {campaignPillars.map((pillar, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700 hover:border-slate-500 transition-colors">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className={`${pillar.color} p-3 rounded-lg text-white`}>
                      {pillar.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{pillar.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-3">{pillar.description}</p>
                    <p className="text-sm text-blue-400 italic">{pillar.action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ghana Connection */}
            <Card className="bg-gradient-to-r from-green-900/30 to-amber-900/30 border-green-700/50 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-green-300 flex items-center gap-3">
                  <Globe className="w-7 h-7" /> Ghana at CSW70
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Ghana leads a delegation to CSW70, delivering statements at the Opening Dialogue 
                  and Ministerial Roundtable. Deputy Minister Lartey champions technology-driven 
                  solutions for women's empowerment — aligning directly with the QUMUS ecosystem's mission.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-green-700 text-white">Opening Dialogue Statement</Badge>
                  <Badge className="bg-amber-700 text-white">Ministerial Roundtable</Badge>
                  <Badge className="bg-red-700 text-white">Digital Justice Advocacy</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <h2 className="text-3xl font-bold mb-6 text-blue-300">CSW70 Campaign Schedule</h2>
            <div className="space-y-3">
              {schedule.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    item.status === 'active' 
                      ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500/50' 
                      : item.status === 'completed'
                      ? 'bg-slate-900/30 border-slate-700 opacity-70'
                      : 'bg-slate-900/50 border-slate-700'
                  }`}
                >
                  <div className="w-24 shrink-0">
                    <span className={`text-sm font-bold ${
                      item.status === 'active' ? 'text-blue-400' : 'text-slate-400'
                    }`}>{item.date}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      item.status === 'active' ? 'text-white' : 'text-slate-300'
                    }`}>{item.event}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  </div>
                  <Badge className={
                    item.status === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                    item.status === 'completed' ? 'bg-slate-600 text-slate-300' :
                    'bg-slate-700 text-slate-300'
                  }>
                    {item.status === 'active' ? 'LIVE NOW' : item.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Ecosystem Tab */}
          <TabsContent value="ecosystem">
            <h2 className="text-3xl font-bold mb-6 text-blue-300">The QUMUS Ecosystem</h2>
            <p className="text-slate-300 mb-8 max-w-3xl">
              Every system in the Rockin' Rockin' Boogie ecosystem contributes to the CSW70 mission. 
              QUMUS orchestrates all subsystems autonomously — ensuring 24/7 operation, real-time 
              response, and maximum impact.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecosystemContributions.map((sys, i) => (
                <Link key={i} href={sys.link}>
                  <Card className="bg-slate-900/50 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-white">{sys.system}</h3>
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          {sys.channels} {sys.channels > 1 ? 'channels' : 'system'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400">{sys.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* QUMUS Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Radio Channels', value: '54', icon: <Radio className="w-5 h-5" /> },
                { label: 'QUMUS Policies', value: '20', icon: <Sparkles className="w-5 h-5" /> },
                { label: 'Autonomy Level', value: '90%', icon: <Shield className="w-5 h-5" /> },
                { label: 'Subsystems', value: '21', icon: <Globe className="w-5 h-5" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2 text-blue-400">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Take Action Tab */}
          <TabsContent value="action">
            <h2 className="text-3xl font-bold mb-6 text-blue-300">Take Action</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-rose-900/30 to-slate-900 border-rose-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-300 flex items-center gap-2">
                    <Heart className="w-6 h-6" /> Donate to Sweet Miracles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Every dollar goes directly to programs supporting women and girls. 
                    Powered by Stripe — transparent, secure, immediate.
                  </p>
                  <Link href="/donate">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white w-full">
                      Donate Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-300 flex items-center gap-2">
                    <Radio className="w-6 h-6" /> Listen & Share
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Tune into any of our 54 radio channels. Share the broadcast links 
                    with your network to amplify women's voices globally.
                  </p>
                  <Link href="/radio">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      Listen Live
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border-emerald-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-300 flex items-center gap-2">
                    <Users className="w-6 h-6" /> Join a Conference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Connect with advocates worldwide through our 6-platform conference hub. 
                    Jitsi, Zoom, Meet, Discord, and Skype — all integrated.
                  </p>
                  <Link href="/conference">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                      Join Conference
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900 border-purple-700/50">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-300 flex items-center gap-2">
                    <Mic className="w-6 h-6" /> Create Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Use our Production Studio to record podcasts, create broadcasts, 
                    and produce content that supports the CSW70 mission.
                  </p>
                  <Link href="/studio">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                      Open Studio
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Social Sharing */}
            <Card className="mt-8 bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-amber-300 flex items-center gap-2">
                  <Megaphone className="w-6 h-6" /> Spread the Word
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Share the CSW70 campaign across your social networks. Use these hashtags:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['#CSW70', '#ForALLWomenAndGirls', '#AccessToJustice', '#RockinRockinBoogie', '#QUMUS', '#SweetMiracles', '#WomenInTech', '#DigitalJustice'].map(tag => (
                    <Badge key={tag} variant="outline" className="border-amber-500 text-amber-400 text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-slate-500 text-sm">
            Canryn Production &middot; Rockin' Rockin' Boogie &middot; Powered by QUMUS Autonomous AI
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Supporting the 70th Session of the U.N. Commission on the Status of Women &middot; March 9-19, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
