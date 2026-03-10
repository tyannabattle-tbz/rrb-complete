import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Video, Phone, Users, Globe, Calendar, Clock, Mic,
  Camera, Monitor, MessageSquare, Settings,
  Zap, Radio, Play, Plus, ExternalLink, Copy,
  Shield, Headphones, ArrowRight, Trash2, Eye,
  BarChart3, Archive, Cpu, Tv
} from 'lucide-react';
import { Link } from 'wouter';

// ─── Meeting Type Config ─────────────────────
const MEETING_TYPES = [
  { id: 'huddle', label: 'Quick Huddle', icon: Zap, color: 'text-yellow-400', duration: 15, desc: '15-min standup' },
  { id: 'meeting', label: 'Meeting', icon: Users, color: 'text-blue-400', duration: 60, desc: 'Standard meeting' },
  { id: 'conference', label: 'Conference', icon: Globe, color: 'text-purple-400', duration: 120, desc: 'Large conference' },
  { id: 'webinar', label: 'Webinar', icon: Monitor, color: 'text-green-400', duration: 90, desc: 'Presentation mode' },
  { id: 'broadcast', label: 'Broadcast', icon: Radio, color: 'text-red-400', duration: 60, desc: 'Live broadcast' },
  { id: 'workshop', label: 'Workshop', icon: Settings, color: 'text-orange-400', duration: 180, desc: 'Interactive workshop' },
] as const;

const PLATFORMS = [
  { id: 'rrb_builtin', label: 'RRB Built-in (Jitsi)', icon: Video, color: 'bg-amber-500', desc: 'Free, no account needed' },
  { id: 'zoom', label: 'Zoom', icon: Video, color: 'bg-blue-500', desc: 'External Zoom meeting' },
  { id: 'google_meet', label: 'Google Meet', icon: Video, color: 'bg-green-500', desc: 'External Google Meet' },
  { id: 'discord', label: 'Discord', icon: Headphones, color: 'bg-indigo-500', desc: 'Discord voice/video' },
  { id: 'skype', label: 'Skype', icon: Phone, color: 'bg-sky-500', desc: 'External Skype call' },
  { id: 'rrb_broadcast', label: 'RRB Live Broadcast', icon: Radio, color: 'bg-red-500', desc: 'RRB Radio broadcast' },
] as const;

// ─── Quick Start Templates ─────────────────────
const QUICK_TEMPLATES = [
  { title: 'SQUADD Strategy Session', type: 'meeting' as const, platform: 'rrb_builtin' as const, desc: 'SQUADD Goals planning', duration: 60 },
  { title: 'RRB Production Meeting', type: 'meeting' as const, platform: 'rrb_builtin' as const, desc: 'Canryn Production team sync', duration: 45 },
  { title: 'Sweet Miracles Fundraiser', type: 'webinar' as const, platform: 'rrb_builtin' as const, desc: 'Donation drive webinar', duration: 90 },
  { title: 'HybridCast Emergency Drill', type: 'broadcast' as const, platform: 'rrb_builtin' as const, desc: 'Emergency broadcast test', duration: 30 },
  { title: 'UN CSW70 Prep Call', type: 'conference' as const, platform: 'rrb_builtin' as const, desc: 'Pre-conference planning', duration: 120 },
  { title: 'DJ Workshop', type: 'workshop' as const, platform: 'rrb_builtin' as const, desc: 'AI DJ training session', duration: 180 },
];

type TabType = 'dashboard' | 'create' | 'scheduled' | 'csw70';

function LaunchReadiness() {
  const { data: readiness, isLoading } = trpc.conference.getLaunchReadiness.useQuery();
  if (isLoading) return <div className="text-white/40 text-center py-4">Checking launch readiness...</div>;
  if (!readiness) return null;
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Launch Readiness: {readiness.score}%
          <Badge variant={readiness.ready ? 'default' : 'secondary'} className={readiness.ready ? 'bg-green-600' : 'bg-amber-600'}>
            {readiness.ready ? 'READY' : 'IN PROGRESS'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-white/40">Last checked: {new Date(readiness.timestamp).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {readiness.checks.map((check: any, idx: number) => (
            <div key={idx} className={`p-2 rounded-lg text-xs ${
              check.status === 'pass' ? 'bg-green-500/10 border border-green-500/20' :
              check.status === 'warn' ? 'bg-amber-500/10 border border-amber-500/20' :
              'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className={`font-medium ${
                check.status === 'pass' ? 'text-green-400' :
                check.status === 'warn' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {check.status === 'pass' ? '\u2713' : check.status === 'warn' ? '!' : '\u2717'} {check.name}
              </div>
              <div className="text-white/40 mt-0.5">{check.detail}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RRBConferenceHub() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingType, setMeetingType] = useState<string>('meeting');
  const [platform, setPlatform] = useState<string>('rrb_builtin');
  const [duration, setDuration] = useState(60);
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [password, setPassword] = useState('');
  const [closedCaptions, setClosedCaptions] = useState(true);
  const [recording, setRecording] = useState(true);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Quick join
  const [joinCode, setJoinCode] = useState('');

  // Data
  const { data: stats } = trpc.conference.getStats.useQuery();
  const { data: conferences } = trpc.conference.getConferences.useQuery({ limit: 50 });
  const utils = trpc.useUtils();

  const createMutation = trpc.conference.createConference.useMutation({
    onSuccess: (data: any) => {
      toast.success('Conference created!');
      utils.conference.getConferences.invalidate();
      utils.conference.getStats.invalidate();
      if (data.platform === 'rrb_builtin') {
        navigate(`/conference/room/${data.id}`);
      } else if (data.externalUrl) {
        window.open(data.externalUrl, '_blank');
        setActiveTab('dashboard');
      }
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.conference.deleteConference.useMutation({
    onSuccess: () => {
      toast.success('Conference deleted');
      utils.conference.getConferences.invalidate();
      utils.conference.getStats.invalidate();
    },
  });

  const notifyMutation = trpc.conference.notifyAttendees.useMutation({
    onSuccess: (data: any) => toast.success(`Notified ${data.notifiedCount} attendees`),
    onError: (err: any) => toast.error(err.message),
  });

  const transcribeMutation = trpc.conference.transcribeRecording.useMutation({
    onSuccess: (data: any) => {
      if (data.success) toast.success('Recording transcribed successfully');
      else toast.error(data.error || 'Transcription failed');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bridgeBroadcastMutation = trpc.conference.bridgeToBroadcast.useMutation({
    onSuccess: (data: any) => toast.success(`Bridged to ${data.broadcastChannel}`),
    onError: (err: any) => toast.error(err.message),
  });

  const bridgeHybridCastMutation = trpc.conference.bridgeToHybridCast.useMutation({
    onSuccess: () => toast.success('Bridged to HybridCast emergency network'),
    onError: (err: any) => toast.error(err.message),
  });

  const createFromTemplateMutation = trpc.conference.createFromTemplate.useMutation({
    onSuccess: (data: any) => {
      toast.success(`UN CSW70 conference created! Room: ${data.roomCode}`);
      utils.conference.getConferences.invalidate();
      utils.conference.getStats.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: csw70Templates } = trpc.conference.getCSW70Templates.useQuery();
  const { data: csw70Speakers } = trpc.conference.getCSW70Speakers.useQuery();
  const seedSpeakersMutation = trpc.conference.seedCSW70Speakers.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Seeded ${data.seeded} UN CSW70 speakers`);
      utils.conference.getCSW70Speakers.invalidate();
    },
    onError: () => toast.error('Failed to seed speakers — please log in'),
  });
  const [csw70Date, setCsw70Date] = useState('');
  const [csw70Time, setCsw70Time] = useState('09:00');

  const resetForm = () => {
    setTitle(''); setDescription(''); setMeetingType('meeting'); setPlatform('rrb_builtin');
    setDuration(60); setMaxAttendees(100); setPassword('');
    setClosedCaptions(true); setRecording(true);
    setScheduleDate(''); setScheduleTime(''); setIsScheduled(false);
  };

  const handleCreate = () => {
    if (!title.trim()) { toast.error('Please enter a conference title'); return; }
    if (!user) { toast.error('Please log in to create a conference'); return; }

    let scheduledAt: number | undefined;
    if (isScheduled && scheduleDate && scheduleTime) {
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).getTime();
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      meetingType: meetingType as any,
      platform: platform as any,
      durationMinutes: duration,
      maxAttendees,
      password: password || undefined,
      closedCaptions,
      recording,
      scheduledAt,
    });
  };

  const handleQuickStart = (template: typeof QUICK_TEMPLATES[0]) => {
    if (!user) { toast.error('Please log in to create a conference'); return; }
    createMutation.mutate({
      title: template.title,
      description: template.desc,
      meetingType: template.type,
      platform: template.platform,
      durationMinutes: template.duration,
      maxAttendees: 100,
      closedCaptions: true,
      recording: true,
    });
  };

  const handleQuickJoin = () => {
    if (!joinCode.trim()) { toast.error('Please enter a room code or conference ID'); return; }
    const id = parseInt(joinCode);
    if (!isNaN(id)) { navigate(`/conference/room/${id}`); } else { toast.error('Please enter a valid conference ID'); }
  };

  const liveConferences = useMemo(() => (conferences || []).filter((c: any) => c.status === 'live'), [conferences]);
  const scheduledConferences = useMemo(() => (conferences || []).filter((c: any) => c.status === 'scheduled'), [conferences]);
  const pastConferences = useMemo(() => (conferences || []).filter((c: any) => c.status === 'ended' || c.status === 'cancelled'), [conferences]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                RRB Conference Hub
              </h1>
              <p className="text-white/50 text-sm mt-1">Powered by QUMUS Orchestration Engine &bull; Built-in Jitsi + External Platforms</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats?.total || 0}</div>
                <div className="text-white/40 text-xs">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats?.live || 0}</div>
                <div className="text-white/40 text-xs">Live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats?.scheduled || 0}</div>
                <div className="text-white/40 text-xs">Scheduled</div>
              </div>
            </div>
          </div>

          {/* Tabs + Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {(['dashboard', 'create', 'scheduled', 'csw70'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-gray-800 text-amber-400 border-b-2 border-amber-400'
                      : 'text-white/50 hover:text-white/80 hover:bg-gray-800/50'
                  }`}
                >
                  {tab === 'dashboard' && 'Dashboard'}
                  {tab === 'create' && 'Create New'}
                  {tab === 'scheduled' && 'Scheduled'}
                  {tab === 'csw70' && '🌍 UN CSW70'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href="/conference/calendar">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-medium transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Calendar
                </button>
              </Link>
              <Link href="/conference/analytics">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" /> Analytics
                </button>
              </Link>
              <Link href="/conference/recordings">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors">
                  <Archive className="w-3.5 h-3.5" /> Recordings
                </button>
              </Link>
              <Link href="/conference/checkin/0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Check-In
                </button>
              </Link>
              <Link href="/conference/translation/0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Translation
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* ─── DASHBOARD TAB ─────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Join */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter conference ID to join..."
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button onClick={handleQuickJoin} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    <ArrowRight className="w-4 h-4 mr-1" /> Join
                  </Button>
                  <Button onClick={() => setActiveTab('create')} variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                    <Plus className="w-4 h-4 mr-1" /> New Conference
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Permanent Test Room */}
            <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30 hover:border-amber-500/50 transition-all">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">RRB Conference Test Room</h3>
                      <p className="text-white/50 text-sm">Permanent test room &bull; Always live &bull; Room: rrb-TESTROOM001</p>
                      <p className="text-white/30 text-xs mt-1">Powered by QUMUS &bull; Jitsi Built-in &bull; Recording Enabled &bull; Closed Captions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => {
                        navigator.clipboard.writeText('rrb-TESTROOM001');
                        toast.success('Room code copied!');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy Code
                    </Button>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6"
                      onClick={async () => {
                        try {
                          // Seed/reset the test conference
                          const result = await fetch('/api/trpc/conference.seedTestConference', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                          const data = await result.json();
                          const confId = data?.result?.data?.id;
                          if (confId) {
                            navigate(`/conference/room/${confId}`);
                          } else {
                            // Fallback: try to get the test conference
                            const getResult = await fetch('/api/trpc/conference.getTestConference');
                            const getData = await getResult.json();
                            const testId = getData?.result?.data?.id;
                            if (testId) navigate(`/conference/room/${testId}`);
                            else toast.error('Could not load test room. Try again.');
                          }
                        } catch (err) {
                          toast.error('Failed to enter test room');
                        }
                      }}
                    >
                      <Video className="w-4 h-4 mr-1" /> Enter Test Room
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restream Multi-Stream Hub */}
            <Card className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Tv className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Restream Multi-Stream Hub</h3>
                      <p className="text-white/50 text-sm">Broadcast to YouTube, Facebook, LinkedIn, Twitter/X simultaneously</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400">YouTube</Badge>
                        <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-400">Facebook</Badge>
                        <Badge variant="outline" className="text-[10px] border-sky-500/50 text-sky-400">LinkedIn</Badge>
                        <Badge variant="outline" className="text-[10px] border-cyan-500/50 text-cyan-400">Twitter/X</Badge>
                        <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-400">Twitch</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://studio.restream.io/enk-osex-pju', '_blank')}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" /> Open Restream Studio
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Templates */}
            <div>
              <h2 className="text-lg font-semibold text-white/80 mb-3">Quick Start</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((template, i) => (
                  <Card
                    key={i}
                    className="bg-gray-900/50 border-gray-800 hover:border-amber-500/50 cursor-pointer transition-all"
                    onClick={() => handleQuickStart(template)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white text-sm">{template.title}</h3>
                          <p className="text-white/40 text-xs mt-1">{template.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] border-gray-700 text-white/50">
                              {template.type}
                            </Badge>
                            <span className="text-white/30 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {template.duration}min
                            </span>
                          </div>
                        </div>
                        <Play className="w-8 h-8 text-amber-500/60" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Live Conferences */}
            {liveConferences.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {liveConferences.map((conf: any) => (
                    <Card key={conf.id} className="bg-gray-900/50 border-green-500/30">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{conf.title}</h3>
                            <p className="text-white/40 text-xs mt-1">
                              Host: {conf.host_name} &bull; {conf.attendee_count} attendees &bull; {conf.meeting_type}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/conference/register/${conf.id}`)} className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                              Register
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/conference/checkin/${conf.id}`)} className="border-green-500 text-green-400 hover:bg-green-500/20">
                              <Shield className="w-3 h-3 mr-1" /> Check-In
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/conference/translation/${conf.id}`)} className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
                              <Globe className="w-3 h-3 mr-1" /> Translate
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => window.open('https://studio.restream.io/enk-osex-pju', '_blank')} className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                              <Tv className="w-3 h-3 mr-1" /> Multi-Stream
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/conference/room/${conf.id}`)} className="bg-green-600 hover:bg-green-700">
                              <Video className="w-4 h-4 mr-1" /> Join
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Conferences */}
            {pastConferences.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white/60 mb-3">Recent</h2>
                <div className="space-y-2">
                  {pastConferences.slice(0, 5).map((conf: any) => (
                    <div key={conf.id} className="flex items-center justify-between py-2 px-3 bg-gray-900/30 rounded-lg border border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] ${conf.status === 'ended' ? 'border-gray-600 text-gray-400' : 'border-red-600 text-red-400'}`}>
                          {conf.status}
                        </Badge>
                        <span className="text-white/70 text-sm">{conf.title}</span>
                        <span className="text-white/30 text-xs">{conf.meeting_type} &bull; {conf.attendee_count} attended</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: conf.id })} className="text-red-400/50 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE TAB ─────────────────────── */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-amber-400">Create New Conference</CardTitle>
                <CardDescription className="text-white/40">Set up a meeting, webinar, or broadcast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title & Description */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Title *</label>
                    <Input placeholder="Conference title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Description</label>
                    <Input placeholder="What's this conference about?" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                </div>

                {/* Meeting Type */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Meeting Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MEETING_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button key={type.id} onClick={() => { setMeetingType(type.id); setDuration(type.duration); }}
                          className={`p-3 rounded-lg border text-left transition-all ${meetingType === type.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                          <Icon className={`w-5 h-5 ${type.color} mb-1`} />
                          <div className="text-sm font-medium text-white">{type.label}</div>
                          <div className="text-xs text-white/40">{type.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Platform</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => {
                      const Icon = p.icon;
                      return (
                        <button key={p.id} onClick={() => setPlatform(p.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${platform === p.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}>
                          <div className={`w-6 h-6 ${p.color} rounded flex items-center justify-center mb-1`}>
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                          <div className="text-sm font-medium text-white">{p.label}</div>
                          <div className="text-xs text-white/40">{p.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Duration (min)</label>
                    <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 60)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Max Attendees</label>
                    <Input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(parseInt(e.target.value) || 100)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Password (optional)</label>
                    <Input type="password" placeholder="Room password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                      <input type="checkbox" checked={closedCaptions} onChange={(e) => setClosedCaptions(e.target.checked)} className="accent-amber-500" />
                      Closed Captions
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                      <input type="checkbox" checked={recording} onChange={(e) => setRecording(e.target.checked)} className="accent-amber-500" />
                      Recording
                    </label>
                  </div>
                </div>

                {/* Schedule Toggle */}
                <div className="border-t border-gray-800 pt-4">
                  <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer mb-3">
                    <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="accent-amber-500" />
                    <Calendar className="w-4 h-4" /> Schedule for later
                  </label>
                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/50 mb-1 block">Date</label>
                        <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 mb-1 block">Time</label>
                        <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Button */}
                <Button onClick={handleCreate} disabled={createMutation.isPending || !title.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold py-3 text-lg">
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> Creating...
                    </span>
                  ) : isScheduled ? (
                    <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Schedule Conference</span>
                  ) : (
                    <span className="flex items-center gap-2"><Video className="w-5 h-5" /> Start Conference Now</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── SCHEDULED TAB ─────────────────────── */}
        {activeTab === 'scheduled' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80">Upcoming Conferences</h2>
            {scheduledConferences.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-8 pb-8 text-center">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No scheduled conferences</p>
                  <Button onClick={() => setActiveTab('create')} variant="outline" className="mt-3 border-amber-500/50 text-amber-400">
                    <Plus className="w-4 h-4 mr-1" /> Schedule One
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduledConferences.map((conf: any) => (
                  <Card key={conf.id} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{conf.title}</h3>
                          <p className="text-white/40 text-xs mt-1">
                            {conf.scheduled_at ? new Date(Number(conf.scheduled_at)).toLocaleString() : 'No date set'}
                            {' '}&bull; {conf.meeting_type} &bull; {conf.platform?.replace('_', ' ')} &bull; {conf.duration_minutes}min
                          </p>
                          {conf.description && <p className="text-white/30 text-xs mt-1">{conf.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => notifyMutation.mutate({ conferenceId: conf.id })} variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10" title="Notify attendees">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => bridgeBroadcastMutation.mutate({ conferenceId: conf.id })} variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10" title="Bridge to RRB Radio">
                            <Radio className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => bridgeHybridCastMutation.mutate({ conferenceId: conf.id })} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" title="Bridge to HybridCast">
                            <Shield className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/conference/register/${conf.id}`)} className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10" title="Registration page">
                            <Users className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/conference/checkin/${conf.id}`)} className="border-green-500/50 text-green-400 hover:bg-green-500/10" title="Check-in dashboard">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/conference/translation/${conf.id}`)} className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10" title="Translation overlay">
                            <Globe className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => navigate(`/conference/room/${conf.id}`)} className="bg-amber-500 hover:bg-amber-600 text-black">
                            <Play className="w-4 h-4 mr-1" /> Start
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: conf.id })} className="text-red-400/50 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {/* ─── UN CSW70 TAB ─────────────────────── */}
        {activeTab === 'csw70' && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent">
                🌍 UN CSW70 — The World Stage
              </h2>
              <p className="text-white/50 text-sm mt-2">70th Commission on the Status of Women &bull; Gender Equality &bull; Women's Empowerment</p>
              <p className="text-white/30 text-xs mt-1">Powered by Canryn Production &bull; Sweet Miracles 501(c)/508 &bull; A Voice for the Voiceless</p>
            </div>

            {/* Schedule Picker */}
            <Card className="bg-blue-950/30 border-blue-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-white/50 mb-1 block">Date</label>
                    <Input type="date" value={csw70Date} onChange={(e) => setCsw70Date(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/50 mb-1 block">Time</label>
                    <Input type="time" value={csw70Time} onChange={(e) => setCsw70Time(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(csw70Templates || []).map((tmpl: any) => (
                <Card key={tmpl.id} className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-all">
                  <CardContent className="pt-5 pb-5">
                    <div className="text-3xl mb-2">{tmpl.icon}</div>
                    <h3 className="font-bold text-white text-sm">{tmpl.title}</h3>
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tmpl.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-white/30 text-xs">
                      <Clock className="w-3 h-3" /> {tmpl.durationMinutes}min &bull; Up to {tmpl.maxAttendees} attendees
                    </div>
                    <Button
                      onClick={() => {
                        if (!user) { toast.error('Please log in'); return; }
                        if (!csw70Date) { toast.error('Please select a date'); return; }
                        createFromTemplateMutation.mutate({
                          templateId: tmpl.id,
                          scheduledAt: new Date(`${csw70Date}T${csw70Time}`).getTime(),
                        });
                      }}
                      disabled={createFromTemplateMutation.isPending}
                      className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs"
                    >
                      <Calendar className="w-3 h-3 mr-1" /> Schedule This Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CSW70 Speaker Roster */}
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> UN CSW70 Speaker Roster
                  </CardTitle>
                  {user && (
                    <Button
                      size="sm"
                      onClick={() => seedSpeakersMutation.mutate()}
                      disabled={seedSpeakersMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Seed Roster
                    </Button>
                  )}
                </div>
                <CardDescription className="text-white/40">Confirmed speakers and panelists for the 70th Commission on the Status of Women</CardDescription>
              </CardHeader>
              <CardContent>
                {csw70Speakers && (csw70Speakers as any[]).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {(csw70Speakers as any[]).map((speaker: any) => (
                      <Link key={speaker.id} href={`/conference/speaker/${speaker.id}`}>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-950/20 border border-blue-500/10 hover:border-blue-500/30 transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {speaker.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">{speaker.name}</h4>
                            <p className="text-white/40 text-xs truncate">{speaker.title} — {speaker.organization}</p>
                            <p className="text-blue-400/60 text-xs mt-1 truncate">{speaker.session_topic}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No speakers seeded yet</p>
                    <p className="text-white/20 text-xs mt-1">Click "Seed Roster" to populate the UN CSW70 speaker database</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSW70 Info */}
            <Card className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 border-blue-500/20">
              <CardContent className="pt-5 pb-5">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">RRB Radio</div>
                    <p className="text-white/40 text-xs mt-1">Live broadcast all sessions worldwide via Rockin' Rockin' Boogie radio network</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">HybridCast</div>
                    <p className="text-white/40 text-xs mt-1">Emergency mesh network ensures sessions reach communities even offline</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">QUMUS</div>
                    <p className="text-white/40 text-xs mt-1">Autonomous orchestration manages scheduling, recording, and distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ecosystem Integration Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Link href="/live">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white">RRB Radio</span>
              </div>
              <p className="text-xs text-white/50">Broadcast conferences live on RRB Radio. Bridge listeners into live sessions.</p>
            </div>
          </Link>
          <Link href="/ty-battle">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white">TBZ-OS</span>
              </div>
              <p className="text-xs text-white/50">Ty Bat Zan orchestrates scheduling, monitoring, and autonomous conference management.</p>
            </div>
          </Link>
          <Link href="/hybridcast-hub">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="font-bold text-white">HybridCast</span>
              </div>
              <p className="text-xs text-white/50">Emergency broadcast bridge. Stream conferences through mesh networks and offline-first PWA.</p>
            </div>
          </Link>
        </div>

      {/* Launch Readiness Dashboard */}
      <div className="container py-8">
        <LaunchReadiness />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-12 py-6">
        <div className="container text-center text-xs text-white/30">
          <p>RRB Conference Hub &bull; Powered by QUMUS &bull; Built-in Jitsi + Zoom + Google Meet + Discord + Skype</p>
          <p className="mt-1">Ty Battle (Ty Bat Zan) &bull; Canryn Production LLC &bull; TBZ Operating System</p>
        </div>
      </div>
    </div>
  );
}
