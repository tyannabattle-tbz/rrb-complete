import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Calendar, Users, Plus, MapPin, Ticket, Clock,
  Video, Mic, MessageSquare, Star, ChevronRight, Search,
  Layout, Layers, UserPlus, CheckCircle, Tv
} from "lucide-react";

type Tab = "conventions" | "create" | "detail";

export default function ConventionHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("conventions");
  const [selectedConventionId, setSelectedConventionId] = useState<number | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newConvention, setNewConvention] = useState({
    title: "",
    subtitle: "",
    description: "",
    startDate: "",
    endDate: "",
    timezone: "America/New_York",
    maxAttendees: 500,
    isVirtual: true,
    isHybrid: false,
    registrationFee: "0.00",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    role: "attendee" as "attendee" | "speaker" | "panelist" | "moderator" | "vip" | "sponsor" | "organizer",
    ticketType: "free" as "free" | "general" | "vip" | "speaker" | "sponsor",
    platform: "",
    bio: "",
  });

  const conventionsQuery = trpc.convention.getConventions.useQuery({});
  const conventionStats = trpc.convention.getConventionStats.useQuery(undefined, { enabled: !!user });
  const conventionDetail = trpc.convention.getConvention.useQuery(
    { id: selectedConventionId! },
    { enabled: !!selectedConventionId }
  );
  const tracks = trpc.convention.getTracks.useQuery(
    { conventionId: selectedConventionId! },
    { enabled: !!selectedConventionId }
  );
  const sessions = trpc.convention.getConventionSessions.useQuery(
    { conventionId: selectedConventionId!, track: selectedTrack || undefined },
    { enabled: !!selectedConventionId }
  );

  const createConvention = trpc.convention.createConvention.useMutation({
    onSuccess: (data) => {
      toast({ title: "Convention Created!", description: "Your convention is ready to configure" });
      setSelectedConventionId(data.id);
      setActiveTab("detail");
      conventionsQuery.refetch();
    },
  });

  const registerAttendee = trpc.convention.registerAttendee.useMutation({
    onSuccess: (data) => {
      toast({ title: "Registered!", description: `Status: ${data.status}` });
      setShowRegisterForm(false);
      conventionDetail.refetch();
    },
  });

  const updateStatus = trpc.convention.updateConventionStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Status Updated" });
      conventionDetail.refetch();
      conventionsQuery.refetch();
    },
  });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-600", announced: "bg-blue-600", registration_open: "bg-green-600",
    active: "bg-emerald-600", day_of: "bg-red-600 animate-pulse", ended: "bg-gray-500", archived: "bg-gray-400",
  };

  const sessionTypeIcons: Record<string, React.ReactNode> = {
    keynote: <Star className="w-4 h-4 text-yellow-400" />,
    panel: <Users className="w-4 h-4 text-blue-400" />,
    workshop: <Layout className="w-4 h-4 text-green-400" />,
    breakout: <Layers className="w-4 h-4 text-purple-400" />,
    networking: <MessageSquare className="w-4 h-4 text-pink-400" />,
    performance: <Mic className="w-4 h-4 text-red-400" />,
    qa: <MessageSquare className="w-4 h-4 text-orange-400" />,
    fireside_chat: <Video className="w-4 h-4 text-amber-400" />,
  };

  const conv = conventionDetail.data;

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Convention Hub</h1>
              <p className="text-xs text-gray-400">Host Global Virtual Conventions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {conventionStats.data && (
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{conventionStats.data.total || 0} conventions</span>
                <span>{conventionStats.data.totalAttendees || 0} attendees</span>
              </div>
            )}
            <Button onClick={() => setActiveTab("create")} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" /> New Convention
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Conventions List */}
        {activeTab === "conventions" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conventions..."
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>

            {/* Convention Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conventionsQuery.data
                ?.filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((convention) => (
                <Card
                  key={convention.id}
                  className="bg-gray-900/50 border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group"
                  onClick={() => { setSelectedConventionId(convention.id); setActiveTab("detail"); }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${statusColors[convention.status]} text-xs`}>
                        {convention.status?.replace("_", " ")}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {convention.isVirtual && <Globe className="w-3 h-3" />}
                        {convention.isHybrid && <MapPin className="w-3 h-3" />}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-300 transition-colors">
                      {convention.title}
                    </h3>
                    {convention.subtitle && (
                      <p className="text-sm text-gray-400 mb-3">{convention.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(convention.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {convention.currentAttendees}/{convention.maxAttendees}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" /> {convention.registrationFee === "0.00" ? "Free" : `$${convention.registrationFee}`}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors mt-3 ml-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!conventionsQuery.data || conventionsQuery.data.length === 0) && (
              <div className="text-center py-16 text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-gray-300">No Conventions Yet</h3>
                <p className="text-sm mt-2">Create your first global virtual convention</p>
                <Button onClick={() => setActiveTab("create")} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" /> Create Convention
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Convention */}
        {activeTab === "create" && (
          <Card className="bg-gray-900/50 border-white/10 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" /> Create New Convention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Convention Title</label>
                <Input
                  value={newConvention.title}
                  onChange={(e) => setNewConvention({ ...newConvention, title: e.target.value })}
                  placeholder="RRB Global Music & Tech Convention 2026"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Subtitle</label>
                <Input
                  value={newConvention.subtitle}
                  onChange={(e) => setNewConvention({ ...newConvention, subtitle: e.target.value })}
                  placeholder="Where Music Meets Technology"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={newConvention.description}
                  onChange={(e) => setNewConvention({ ...newConvention, description: e.target.value })}
                  placeholder="Describe your convention..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={newConvention.startDate}
                    onChange={(e) => setNewConvention({ ...newConvention, startDate: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                  <Input
                    type="datetime-local"
                    value={newConvention.endDate}
                    onChange={(e) => setNewConvention({ ...newConvention, endDate: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Max Attendees</label>
                  <Input
                    type="number" min={10} max={10000}
                    value={newConvention.maxAttendees}
                    onChange={(e) => setNewConvention({ ...newConvention, maxAttendees: parseInt(e.target.value) || 500 })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Registration Fee</label>
                  <Input
                    value={newConvention.registrationFee}
                    onChange={(e) => setNewConvention({ ...newConvention, registrationFee: e.target.value })}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox" checked={newConvention.isVirtual}
                      onChange={(e) => setNewConvention({ ...newConvention, isVirtual: e.target.checked })}
                      className="rounded"
                    />
                    Virtual
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox" checked={newConvention.isHybrid}
                      onChange={(e) => setNewConvention({ ...newConvention, isHybrid: e.target.checked })}
                      className="rounded"
                    />
                    Hybrid
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newConvention.title || !newConvention.startDate || !newConvention.endDate) {
                      toast({ title: "Missing fields", description: "Title, start date, and end date are required", variant: "destructive" });
                      return;
                    }
                    createConvention.mutate({
                      ...newConvention,
                      startDate: new Date(newConvention.startDate).getTime(),
                      endDate: new Date(newConvention.endDate).getTime(),
                    });
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={createConvention.isPending}
                >
                  Create Convention
                </Button>
                <Button variant="outline" className="border-white/20" onClick={() => setActiveTab("conventions")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Convention Detail */}
        {activeTab === "detail" && conv && (
          <div className="space-y-6">
            {/* Back button */}
            <Button variant="ghost" className="text-gray-400" onClick={() => { setActiveTab("conventions"); setSelectedConventionId(null); }}>
              ← Back to Conventions
            </Button>

            {/* Convention Header */}
            <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={`${statusColors[conv.status]} mb-2`}>
                    {conv.status?.replace("_", " ").toUpperCase()}
                  </Badge>
                  <h2 className="text-2xl font-bold">{conv.title}</h2>
                  {conv.subtitle && <p className="text-gray-400 mt-1">{conv.subtitle}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(conv.startDate)} - {formatDate(conv.endDate)}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {conv.currentAttendees}/{conv.maxAttendees}</span>
                    <span className="flex items-center gap-1"><Ticket className="w-4 h-4" /> {conv.registrationFee === "0.00" ? "Free" : `$${conv.registrationFee}`}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {conv.status === "draft" && (
                    <Button onClick={() => updateStatus.mutate({ id: conv.id, status: "announced" })} className="bg-blue-600 hover:bg-blue-700" size="sm">
                      Announce
                    </Button>
                  )}
                  {conv.status === "announced" && (
                    <Button onClick={() => updateStatus.mutate({ id: conv.id, status: "registration_open" })} className="bg-green-600 hover:bg-green-700" size="sm">
                      Open Registration
                    </Button>
                  )}
                  {conv.status === "registration_open" && (
                    <Button onClick={() => updateStatus.mutate({ id: conv.id, status: "active" })} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                      Go Active
                    </Button>
                  )}
                  {conv.status === "active" && (
                    <Button onClick={() => updateStatus.mutate({ id: conv.id, status: "day_of" })} className="bg-red-600 hover:bg-red-700" size="sm">
                      Day Of!
                    </Button>
                  )}
                  <Button onClick={() => setShowRegisterForm(true)} variant="outline" className="border-white/20" size="sm">
                    <UserPlus className="w-4 h-4 mr-1" /> Register
                  </Button>
                </div>
              </div>

              {/* Attendee Stats */}
              {conv.attendeeStats && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {[
                    { label: "Total", value: conv.attendeeStats.total || 0, color: "text-white" },
                    { label: "Confirmed", value: conv.attendeeStats.confirmed || 0, color: "text-green-400" },
                    { label: "Checked In", value: conv.attendeeStats.checkedIn || 0, color: "text-emerald-400" },
                    { label: "Speakers", value: conv.attendeeStats.speakers || 0, color: "text-blue-400" },
                    { label: "VIPs", value: conv.attendeeStats.vips || 0, color: "text-yellow-400" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-black/30 rounded-lg p-3 text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Track Filter + Sessions */}
            <div className="grid grid-cols-12 gap-6">
              {/* Track Sidebar */}
              <div className="col-span-3">
                <Card className="bg-gray-900/50 border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-300">Tracks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <button
                      onClick={() => setSelectedTrack(null)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                        !selectedTrack ? "bg-indigo-500/20 text-indigo-300" : "hover:bg-white/5"
                      }`}
                    >
                      All Sessions
                    </button>
                    {tracks.data?.map((track) => (
                      <button
                        key={track}
                        onClick={() => setSelectedTrack(track as string)}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                          selectedTrack === track ? "bg-indigo-500/20 text-indigo-300" : "hover:bg-white/5"
                        }`}
                      >
                        {track as string}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sessions Grid */}
              <div className="col-span-9">
                <div className="space-y-3">
                  {sessions.data?.map((session) => (
                    <Card key={session.id} className="bg-gray-900/50 border-white/10 hover:border-indigo-500/20 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {sessionTypeIcons[session.sessionType] || <Video className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              {session.description && (
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{session.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </span>
                                {session.track && (
                                  <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px]">{session.track}</Badge>
                                )}
                                {session.room && (
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.room}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {session.currentParticipants}/{session.maxParticipants}
                                </span>
                              </div>
                              {/* Speakers */}
                              {session.speakers && Array.isArray(session.speakers) && (session.speakers as any[]).length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {(session.speakers as any[]).map((speaker: any, i: number) => (
                                    <div key={i} className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[8px]">
                                        {speaker.name?.charAt(0)}
                                      </div>
                                      <span className="text-[10px]">{speaker.name}</span>
                                      {speaker.platform && (
                                        <span className="text-[10px] text-gray-500">({speaker.platform})</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              session.status === "live" ? "bg-red-600 animate-pulse" :
                              session.status === "scheduled" ? "bg-blue-600" :
                              session.status === "ended" ? "bg-gray-600" : "bg-gray-500"
                            } text-xs`}>
                              {session.status === "live" ? "● LIVE" : session.status}
                            </Badge>
                            {session.studioSessionId && session.status === "live" && (
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs h-7">
                                <Tv className="w-3 h-3 mr-1" /> Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!sessions.data || sessions.data.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No sessions scheduled yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegisterForm && selectedConventionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRegisterForm(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" /> Register for Convention
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                <Input
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <Input
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Role</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["attendee", "speaker", "panelist", "vip"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegisterData({ ...registerData, role: r })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                        registerData.role === r
                          ? "border-indigo-500 bg-indigo-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ticket Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "general", "vip"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setRegisterData({ ...registerData, ticketType: t })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                        registerData.ticketType === t
                          ? "border-indigo-500 bg-indigo-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Platform (optional)</label>
                <Input
                  value={registerData.platform}
                  onChange={(e) => setRegisterData({ ...registerData, platform: e.target.value })}
                  placeholder="YouTube, Twitch, etc."
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => registerAttendee.mutate({ conventionId: selectedConventionId, ...registerData })}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!registerData.name || !registerData.email || registerAttendee.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Register
                </Button>
                <Button variant="outline" className="border-white/20" onClick={() => setShowRegisterForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Platform Integration */}
      <div className="mt-8 grid md:grid-cols-3 gap-4 px-4">
        <a href="/conference" className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-colors block">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">Conference Hub</span>
          </div>
          <p className="text-xs text-white/50">Schedule and manage conferences with Jitsi, Zoom, Meet, Discord. Bridge to RRB Radio and HybridCast.</p>
        </a>
        <a href="/live" className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-colors block">
          <div className="flex items-center gap-2 mb-2">
            <Tv className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white">RRB Radio Live</span>
          </div>
          <p className="text-xs text-white/50">Broadcast convention sessions live on Rockin' Rockin' Boogie Radio. 24/7 streaming.</p>
        </a>
        <a href="/squadd" className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-colors block">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-white">SQUADD Goals</span>
          </div>
          <p className="text-xs text-white/50">UN CSW70 partnership with Ghana. Sisters Questing Unapologetically After Divine Destiny.</p>
        </a>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-8 py-6 text-center text-xs text-white/30">
        <p>Convention Hub &bull; Powered by QUMUS &bull; Canryn Production LLC &bull; Sweet Miracles 501(c)/508</p>
        <p className="mt-1">A Voice for the Voiceless &bull; TBZ Operating System</p>
      </div>
    </div>
  );
}
