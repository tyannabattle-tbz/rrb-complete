import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Video, Phone, Users, Globe, Calendar, Clock, Mic, MicOff,
  Camera, CameraOff, Monitor, Share2, MessageSquare, Settings,
  Zap, Radio, Play, Plus, ExternalLink, Copy, ChevronDown,
  ChevronUp, Shield, Headphones, Tv, Link2, ArrowRight
} from 'lucide-react';

// ─── Conference Platform Integrations ─────────────────────
interface ConferencePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  status: 'active' | 'coming_soon';
  launchUrl?: string;
}

const PLATFORMS: ConferencePlatform[] = [
  {
    id: 'zoom',
    name: 'Zoom Meetings',
    icon: '📹',
    color: 'from-blue-600 to-blue-700',
    description: 'HD video conferencing with breakout rooms, recording, and up to 1,000 participants',
    features: ['HD Video', 'Breakout Rooms', 'Cloud Recording', 'Screen Share', 'Closed Captions'],
    status: 'active',
    launchUrl: import.meta.env.VITE_ZOOM_URL || 'https://zoom.us/join',
  },
  {
    id: 'meet',
    name: 'Google Meet',
    icon: '🎥',
    color: 'from-green-600 to-teal-600',
    description: 'Google Meet integration for quick video calls and team huddles',
    features: ['Live Captions', 'Screen Share', 'Noise Cancellation', 'Polls', 'Q&A'],
    status: 'active',
    launchUrl: import.meta.env.VITE_MEET_URL || 'https://meet.google.com',
  },
  {
    id: 'discord',
    name: 'Discord Community',
    icon: '💬',
    color: 'from-indigo-600 to-purple-600',
    description: 'Community voice channels, text chat, and live streaming for the RRB family',
    features: ['Voice Channels', 'Text Chat', 'Go Live', 'Stage Channels', 'Community Events'],
    status: 'active',
    launchUrl: import.meta.env.VITE_DISCORD_URL || 'https://discord.gg',
  },
  {
    id: 'skype',
    name: 'Skype',
    icon: '📞',
    color: 'from-sky-500 to-blue-500',
    description: 'Classic video calling for one-on-one and small group conversations',
    features: ['Video Calls', 'Screen Share', 'Call Recording', 'Live Subtitles', 'Phone Calls'],
    status: 'active',
    launchUrl: import.meta.env.VITE_SKYPE_URL || 'https://web.skype.com',
  },
  {
    id: 'rrb-live',
    name: 'RRB Live Broadcast',
    icon: '📡',
    color: 'from-amber-600 to-orange-600',
    description: 'Broadcast directly to all 7 RRB Radio channels via QUMUS orchestration',
    features: ['7-Channel Broadcast', 'QUMUS Managed', 'Real-time Chat', 'Listener Analytics', 'Auto-Archive'],
    status: 'active',
    launchUrl: '/live',
  },
];

// ─── Upcoming Conferences & Events ─────────────────────
interface ScheduledEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  platform: string;
  host: string;
  attendees: number;
  maxAttendees: number;
  type: 'conference' | 'meeting' | 'webinar' | 'broadcast' | 'workshop';
  status: 'upcoming' | 'live' | 'completed';
  description: string;
}

const SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: 1, title: 'SQUADD Goals Weekly Strategy', date: 'Every Monday', time: '10:00 AM CST',
    platform: 'zoom', host: 'Candy AI', attendees: 24, maxAttendees: 100,
    type: 'meeting', status: 'upcoming',
    description: 'Weekly strategy session for SQUADD Goals — Sisters Questing Unapologetically After Divine Destiny',
  },
  {
    id: 2, title: 'RRB Community Town Hall', date: 'Every Wednesday', time: '7:00 PM CST',
    platform: 'rrb-live', host: 'Valanna', attendees: 342, maxAttendees: 5000,
    type: 'broadcast', status: 'upcoming',
    description: 'Open community town hall broadcast across all RRB channels — voice of the people',
  },
  {
    id: 3, title: 'Canryn Production Board Meeting', date: 'Monthly — 1st Friday', time: '2:00 PM CST',
    platform: 'meet', host: 'Seabrun Candy Hunter', attendees: 12, maxAttendees: 25,
    type: 'meeting', status: 'upcoming',
    description: 'Monthly board meeting for Canryn Production and all subsidiaries',
  },
  {
    id: 4, title: 'HybridCast Emergency Drill', date: 'Quarterly', time: '9:00 AM CST',
    platform: 'discord', host: 'Seraph', attendees: 48, maxAttendees: 200,
    type: 'workshop', status: 'upcoming',
    description: 'Quarterly emergency broadcast drill — testing all HybridCast systems and mesh networks',
  },
  {
    id: 5, title: 'Sweet Miracles Donor Appreciation', date: 'March 15, 2026', time: '6:00 PM CST',
    platform: 'zoom', host: 'Sweet Miracles Team', attendees: 67, maxAttendees: 500,
    type: 'webinar', status: 'upcoming',
    description: 'Annual donor appreciation event — celebrating the impact of every contribution',
  },
  {
    id: 6, title: 'Gospel Hour Live Worship', date: 'Every Sunday', time: '9:00 AM CST',
    platform: 'rrb-live', host: 'Gospel Hour Team', attendees: 289, maxAttendees: 5000,
    type: 'broadcast', status: 'upcoming',
    description: 'Live Sunday worship broadcast — traditional and contemporary gospel across all channels',
  },
];

// ─── Quick Meeting Templates ─────────────────────
const QUICK_TEMPLATES = [
  { label: 'Team Huddle', icon: '👥', duration: '15 min', platform: 'meet' },
  { label: 'Board Meeting', icon: '🏛️', duration: '60 min', platform: 'zoom' },
  { label: 'Community Call', icon: '📢', duration: '45 min', platform: 'discord' },
  { label: 'Live Broadcast', icon: '📡', duration: 'Open', platform: 'rrb-live' },
  { label: '1-on-1 Check-in', icon: '☎️', duration: '30 min', platform: 'skype' },
  { label: 'Workshop', icon: '🎓', duration: '90 min', platform: 'zoom' },
];

export default function RRBConferenceHub() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'platforms' | 'schedule' | 'quick'>('platforms');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [meetingLink, setMeetingLink] = useState('');

  const handleLaunchPlatform = (platform: ConferencePlatform) => {
    if (platform.id === 'rrb-live') {
      setLocation('/live');
      return;
    }
    if (platform.launchUrl) {
      window.open(platform.launchUrl, '_blank');
      toast.success(`Opening ${platform.name}`, {
        description: 'Launching in a new tab...',
      });
    }
  };

  const handleJoinMeeting = () => {
    if (!meetingLink.trim()) {
      toast.error('Please enter a meeting link or ID');
      return;
    }
    const link = meetingLink.trim();
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      // Assume Zoom meeting ID
      window.open(`https://zoom.us/j/${link.replace(/\s/g, '')}`, '_blank');
    }
    toast.success('Joining meeting...', { description: link });
    setMeetingLink('');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    });
  };

  const handleQuickMeeting = (template: typeof QUICK_TEMPLATES[0]) => {
    const platform = PLATFORMS.find(p => p.id === template.platform);
    if (platform) {
      handleLaunchPlatform(platform);
      toast.success(`Starting ${template.label}`, {
        description: `${template.duration} on ${platform.name}`,
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'meeting': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'webinar': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'broadcast': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'workshop': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Video className="w-8 h-8 text-blue-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">RRB Conference Hub</h1>
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <span>Video Conferencing • Meetings • Live Broadcasts</span>
                  <span className="text-purple-500">•</span>
                  <span className="text-amber-400">QUMUS Integrated</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLocation('/rrb-radio')} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <Radio className="w-4 h-4 mr-1" /> RRB Radio
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/convention-hub')} className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                <Calendar className="w-4 h-4 mr-1" /> Convention Hub
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* Quick Join Bar */}
        <Card className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-blue-900/30 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-white">Quick Join:</span>
              </div>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
                placeholder="Paste meeting link or Zoom ID..."
                className="flex-1 bg-slate-800/60 border-blue-500/20 text-white placeholder:text-slate-500"
              />
              <Button onClick={handleJoinMeeting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowRight className="w-4 h-4 mr-1" /> Join
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-purple-500/20 pb-2">
          {[
            { key: 'platforms', label: 'Platforms', icon: Globe },
            { key: 'schedule', label: 'Scheduled Events', icon: Calendar },
            { key: 'quick', label: 'Quick Start', icon: Zap },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Platforms Tab ─── */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => (
                <Card
                  key={platform.id}
                  className="bg-slate-800/50 border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer"
                  onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl`}>
                          {platform.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base text-white">{platform.name}</CardTitle>
                          <Badge className={platform.status === 'active' ? 'bg-green-500/20 text-green-400 text-xs' : 'bg-yellow-500/20 text-yellow-400 text-xs'}>
                            {platform.status === 'active' ? 'Active' : 'Coming Soon'}
                          </Badge>
                        </div>
                      </div>
                      {expandedPlatform === platform.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-400">{platform.description}</p>

                    {expandedPlatform === platform.id && (
                      <div className="space-y-3 pt-2 border-t border-slate-700/50">
                        <div className="flex flex-wrap gap-1">
                          {platform.features.map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px] border-slate-600 text-slate-300">{f}</Badge>
                          ))}
                        </div>
                        {platform.launchUrl && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleLaunchPlatform(platform); }}
                              className={`flex-1 bg-gradient-to-r ${platform.color} hover:opacity-90`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> Launch
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleCopyLink(platform.launchUrl || ''); }}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Video Production Quick Access */}
            <Card className="bg-gradient-to-r from-amber-900/20 via-slate-800/60 to-amber-900/20 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Tv className="w-8 h-8 text-amber-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Video Production Studio</h3>
                      <p className="text-xs text-slate-400">Generate AI videos, edit timelines, manage video queue — all QUMUS orchestrated</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setLocation('/video-production')} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                      <Video className="w-4 h-4 mr-1" /> Video Studio
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setLocation('/live')} className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                      <Play className="w-4 h-4 mr-1" /> Live Stream
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Scheduled Events Tab ─── */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {SCHEDULED_EVENTS.map((event) => {
              const platform = PLATFORMS.find(p => p.id === event.platform);
              return (
                <Card key={event.id} className="bg-slate-800/50 border-purple-500/10 hover:border-purple-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-800/60 flex flex-col items-center justify-center border border-purple-500/20">
                        <Calendar className="w-5 h-5 text-purple-400 mb-1" />
                        <span className="text-[10px] text-slate-400">{event.time}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-bold text-white">{event.title}</h3>
                          <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                          {event.status === 'live' && <Badge className="bg-red-500/20 text-red-400 animate-pulse">LIVE NOW</Badge>}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.date} • {event.time}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendees}/{event.maxAttendees}</span>
                          <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Host: {event.host}</span>
                          {platform && <span className="flex items-center gap-1">{platform.icon} {platform.name}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {platform && (
                          <Button size="sm" onClick={() => handleLaunchPlatform(platform)} className={`bg-gradient-to-r ${platform.color} hover:opacity-90`}>
                            <ExternalLink className="w-3 h-3 mr-1" /> Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="text-center py-4">
              <Button variant="outline" onClick={() => setLocation('/convention-hub')} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <Calendar className="w-4 h-4 mr-2" /> View Full Convention Hub
              </Button>
            </div>
          </div>
        )}

        {/* ─── Quick Start Tab ─── */}
        {activeTab === 'quick' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {QUICK_TEMPLATES.map((template, idx) => {
                const platform = PLATFORMS.find(p => p.id === template.platform);
                return (
                  <Card
                    key={idx}
                    className="bg-slate-800/50 border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => handleQuickMeeting(template)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{template.icon}</div>
                      <h3 className="text-sm font-bold text-white mb-1">{template.label}</h3>
                      <p className="text-xs text-slate-400 mb-2">{template.duration}</p>
                      {platform && (
                        <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                          {platform.icon} {platform.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Accessibility Note */}
            <Card className="bg-gradient-to-r from-green-900/20 via-slate-800/60 to-green-900/20 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Accessibility & Inclusion</h3>
                    <p className="text-xs text-slate-400">
                      All RRB conferences support closed captions, screen reader compatibility, and keyboard navigation.
                      Live broadcasts include real-time captioning powered by QUMUS. Need accommodations? Contact the host before the event.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => setLocation('/rrb-radio')} variant="outline" className="h-12 border-purple-500/20 text-purple-300 hover:bg-purple-500/10">
            <Radio className="w-4 h-4 mr-2" /> RRB Radio
          </Button>
          <Button onClick={() => setLocation('/video-production')} variant="outline" className="h-12 border-amber-500/20 text-amber-300 hover:bg-amber-500/10">
            <Video className="w-4 h-4 mr-2" /> Video Studio
          </Button>
          <Button onClick={() => setLocation('/convention-hub')} variant="outline" className="h-12 border-blue-500/20 text-blue-300 hover:bg-blue-500/10">
            <Calendar className="w-4 h-4 mr-2" /> Conventions
          </Button>
          <Button onClick={() => setLocation('/qumus')} variant="outline" className="h-12 border-green-500/20 text-green-300 hover:bg-green-500/10">
            <Zap className="w-4 h-4 mr-2" /> QUMUS
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/80 mt-8 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-300 text-sm">
            RRB Conference Hub • Video Conferencing • Live Broadcasting • QUMUS Orchestrated
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Accessible to all • Closed captions available • A Canryn Production and its subsidiaries
          </p>
        </div>
      </footer>
    </div>
  );
}
