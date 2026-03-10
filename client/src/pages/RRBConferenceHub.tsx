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
  Shield, Headphones, ArrowRight, Trash2, Eye
} from 'lucide-react';

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

type TabType = 'dashboard' | 'create' | 'scheduled';

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

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['dashboard', 'create', 'scheduled'] as TabType[]).map((tab) => (
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
              </button>
            ))}
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
                          <Button size="sm" onClick={() => navigate(`/conference/room/${conf.id}`)} className="bg-green-600 hover:bg-green-700">
                            <Video className="w-4 h-4 mr-1" /> Join
                          </Button>
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
