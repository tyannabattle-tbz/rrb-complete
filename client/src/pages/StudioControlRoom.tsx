import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Video, Mic, MicOff, Monitor, Users, Play, Square, Radio,
  Plus, Copy, UserPlus, Settings, Eye, Clock, Film,
  Tv, Globe, Headphones, PhoneCall, ScreenShare
} from "lucide-react";

type SessionType = "podcast" | "live_show" | "interview" | "panel" | "workshop" | "convention_panel" | "recording";
type GuestStatus = "invited" | "accepted" | "declined" | "waiting" | "connected" | "on_air" | "muted" | "disconnected";

export default function StudioControlRoom() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    sessionType: "podcast" as SessionType,
    maxGuests: 8,
    isPublic: true,
    recordingEnabled: true,
  });
  const [newGuest, setNewGuest] = useState({
    guestName: "",
    guestEmail: "",
    platform: "internal" as "internal" | "youtube" | "twitch" | "zoom" | "discord" | "twitter_spaces" | "custom",
    platformHandle: "",
    role: "guest" as "host" | "co_host" | "panelist" | "guest" | "moderator" | "speaker" | "attendee",
    bio: "",
  });

  const sessionsQuery = trpc.studio.getSessions.useQuery(undefined, { enabled: !!user });
  const activeSession = trpc.studio.getSession.useQuery(
    { id: activeSessionId! },
    { enabled: !!activeSessionId, refetchInterval: 5000 }
  );
  const studioStats = trpc.studio.getStudioStats.useQuery(undefined, { enabled: !!user });
  const recordingsQuery = trpc.studio.getRecordings.useQuery(undefined, { enabled: !!user });

  const createSession = trpc.studio.createSession.useMutation({
    onSuccess: (data) => {
      toast({ title: "Studio Session Created", description: `Join code: ${data.joinCode}` });
      setActiveSessionId(data.id);
      setShowCreateForm(false);
      sessionsQuery.refetch();
    },
  });

  const goLive = trpc.studio.goLive.useMutation({
    onSuccess: () => {
      toast({ title: "You're LIVE!", description: "Broadcasting to all connected viewers" });
      activeSession.refetch();
    },
  });

  const endSession = trpc.studio.endSession.useMutation({
    onSuccess: () => {
      toast({ title: "Session Ended", description: "All guests disconnected" });
      activeSession.refetch();
      sessionsQuery.refetch();
    },
  });

  const inviteGuest = trpc.studio.inviteGuest.useMutation({
    onSuccess: () => {
      toast({ title: "Guest Invited", description: `Invitation sent to ${newGuest.guestName}` });
      setShowInviteForm(false);
      setNewGuest({ guestName: "", guestEmail: "", platform: "internal", platformHandle: "", role: "guest", bio: "" });
      activeSession.refetch();
    },
  });

  const admitGuest = trpc.studio.admitGuest.useMutation({
    onSuccess: () => { activeSession.refetch(); },
  });

  const removeGuest = trpc.studio.removeGuest.useMutation({
    onSuccess: () => { activeSession.refetch(); },
  });

  const toggleMute = trpc.studio.toggleMute.useMutation({
    onSuccess: () => { activeSession.refetch(); },
  });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-600", scheduled: "bg-blue-600", greenroom: "bg-yellow-600",
    live: "bg-red-600 animate-pulse", recording: "bg-orange-600", ended: "bg-gray-500", archived: "bg-gray-400",
  };

  const guestStatusColors: Record<GuestStatus, string> = {
    invited: "bg-blue-500/20 text-blue-300", accepted: "bg-green-500/20 text-green-300",
    declined: "bg-red-500/20 text-red-300", waiting: "bg-yellow-500/20 text-yellow-300",
    connected: "bg-emerald-500/20 text-emerald-300", on_air: "bg-red-500/20 text-red-300",
    muted: "bg-orange-500/20 text-orange-300", disconnected: "bg-gray-500/20 text-gray-300",
  };

  const platformIcons: Record<string, React.ReactNode> = {
    internal: <Globe className="w-4 h-4" />, youtube: <Tv className="w-4 h-4 text-red-500" />,
    twitch: <Monitor className="w-4 h-4 text-purple-500" />, zoom: <Video className="w-4 h-4 text-blue-500" />,
    discord: <Headphones className="w-4 h-4 text-indigo-500" />, twitter_spaces: <Radio className="w-4 h-4 text-sky-500" />,
    custom: <PhoneCall className="w-4 h-4" />,
  };

  const sessionData = activeSession.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Production Studio</h1>
              <p className="text-xs text-gray-400">Video/Podcast Control Room</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {studioStats.data && (
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Film className="w-4 h-4" /> {studioStats.data.sessions?.total || 0} sessions</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {studioStats.data.sessions?.totalViewers || 0} total views</span>
              </div>
            )}
            <Button onClick={() => setShowCreateForm(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> New Session
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Session List */}
          <div className="col-span-3">
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
                {sessionsQuery.data?.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      activeSessionId === session.id
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{session.title}</span>
                      <Badge className={`${statusColors[session.status]} text-[10px] px-1.5`}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="capitalize">{session.sessionType?.replace("_", " ")}</span>
                      <span>·</span>
                      <span>{session.viewerCount || 0} viewers</span>
                    </div>
                  </button>
                ))}
                {(!sessionsQuery.data || sessionsQuery.data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No sessions yet</p>
                    <p className="text-xs mt-1">Create your first studio session</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center: Main Stage */}
          <div className="col-span-6">
            {sessionData ? (
              <div className="space-y-4">
                {/* Live Stage */}
                <Card className="bg-gray-900/50 border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{sessionData.title}</CardTitle>
                        <p className="text-xs text-gray-400 mt-1">{sessionData.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColors[sessionData.status]}`}>
                          {sessionData.status === "live" ? "● LIVE" : sessionData.status?.toUpperCase()}
                        </Badge>
                        {sessionData.joinCode && (
                          <Button
                            variant="outline" size="sm"
                            className="text-xs border-white/20"
                            onClick={() => {
                              navigator.clipboard.writeText(sessionData.joinCode || "");
                              toast({ title: "Join code copied!" });
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" /> {sessionData.joinCode}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Guest Grid - The "Stage" */}
                    <div className="bg-black/60 rounded-xl p-4 min-h-[320px] mb-4">
                      {sessionData.guests && sessionData.guests.length > 0 ? (
                        <div className={`grid gap-3 h-full ${
                          sessionData.guests.length <= 2 ? "grid-cols-2" :
                          sessionData.guests.length <= 4 ? "grid-cols-2" :
                          sessionData.guests.length <= 6 ? "grid-cols-3" : "grid-cols-4"
                        }`}>
                          {sessionData.guests
                            .filter((g: any) => ["connected", "on_air", "muted"].includes(g.status))
                            .map((guest: any) => (
                            <div
                              key={guest.id}
                              className={`relative rounded-xl overflow-hidden border-2 min-h-[140px] flex flex-col items-center justify-center ${
                                guest.status === "on_air" ? "border-red-500" :
                                guest.status === "muted" ? "border-orange-500" : "border-emerald-500"
                              } bg-gradient-to-br from-gray-800 to-gray-900`}
                            >
                              {/* Avatar placeholder */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold mb-2">
                                {guest.guestAvatar ? (
                                  <img src={guest.guestAvatar} alt={guest.guestName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  guest.guestName?.charAt(0)?.toUpperCase()
                                )}
                              </div>
                              <span className="text-sm font-medium">{guest.guestName}</span>
                              <div className="flex items-center gap-1 mt-1">
                                {platformIcons[guest.platform] || platformIcons.internal}
                                <span className="text-[10px] text-gray-400 capitalize">{guest.role?.replace("_", " ")}</span>
                              </div>
                              {/* Status indicators */}
                              <div className="absolute top-2 right-2 flex gap-1">
                                {guest.isMuted && <MicOff className="w-4 h-4 text-orange-400" />}
                                {guest.isScreenSharing && <ScreenShare className="w-4 h-4 text-blue-400" />}
                                {guest.status === "on_air" && (
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                )}
                              </div>
                              {/* Control buttons */}
                              <div className="absolute bottom-2 flex gap-1">
                                <button
                                  onClick={() => toggleMute.mutate({ guestId: guest.id, muted: !guest.isMuted })}
                                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                                  title={guest.isMuted ? "Unmute" : "Mute"}
                                >
                                  {guest.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => removeGuest.mutate({ guestId: guest.id })}
                                  className="p-1 rounded bg-red-500/20 hover:bg-red-500/40"
                                  title="Remove"
                                >
                                  <Square className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No guests on stage</p>
                            <p className="text-xs mt-1">Invite guests or admit from waiting room</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Control Bar */}
                    <div className="flex items-center justify-between bg-black/40 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        {sessionData.status !== "live" && sessionData.status !== "ended" && (
                          <Button
                            onClick={() => goLive.mutate({ sessionId: sessionData.id })}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={goLive.isPending}
                          >
                            <Play className="w-4 h-4 mr-2" /> Go Live
                          </Button>
                        )}
                        {sessionData.status === "live" && (
                          <Button
                            onClick={() => endSession.mutate({ sessionId: sessionData.id })}
                            variant="destructive"
                            disabled={endSession.isPending}
                          >
                            <Square className="w-4 h-4 mr-2" /> End Session
                          </Button>
                        )}
                        <Button
                          variant="outline" className="border-white/20"
                          onClick={() => setShowInviteForm(true)}
                        >
                          <UserPlus className="w-4 h-4 mr-2" /> Invite Guest
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {sessionData.viewerCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {sessionData.guests?.length || 0}
                        </span>
                        {sessionData.recordingEnabled && (
                          <span className="flex items-center gap-1 text-red-400">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> REC
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-white/10 min-h-[500px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-gray-300">Select or Create a Session</h3>
                  <p className="text-sm mt-2 max-w-md">
                    Start a new podcast, live show, interview, or panel discussion.
                    Invite guests from YouTube, Twitch, Zoom, Discord, Twitter Spaces, or your own platform.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Waiting Room + Recordings */}
          <div className="col-span-3 space-y-4">
            {/* Waiting Room */}
            {sessionData && (
              <Card className="bg-gray-900/50 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Waiting Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {sessionData.guests
                    ?.filter((g: any) => ["waiting", "invited", "accepted"].includes(g.status))
                    .map((guest: any) => (
                    <div key={guest.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold">
                          {guest.guestName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{guest.guestName}</p>
                          <div className="flex items-center gap-1">
                            {platformIcons[guest.platform]}
                            <Badge className={`${guestStatusColors[guest.status as GuestStatus]} text-[10px]`}>
                              {guest.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                          onClick={() => admitGuest.mutate({ guestId: guest.id })}
                        >
                          Admit
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 text-xs text-red-400 hover:text-red-300"
                          onClick={() => removeGuest.mutate({ guestId: guest.id })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!sessionData.guests || sessionData.guests.filter((g: any) => ["waiting", "invited", "accepted"].includes(g.status)).length === 0) && (
                    <p className="text-xs text-gray-500 text-center py-4">No guests waiting</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Recordings */}
            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Film className="w-4 h-4" /> Recent Recordings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[30vh] overflow-y-auto">
                {recordingsQuery.data?.map((rec) => (
                  <div key={rec.id} className="p-2 rounded-lg bg-white/5">
                    <p className="text-sm font-medium truncate">{rec.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{rec.format?.toUpperCase()}</span>
                      {rec.durationSeconds && <span>{Math.floor(rec.durationSeconds / 60)}m</span>}
                      <Badge className={rec.isPublished ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
                        {rec.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!recordingsQuery.data || recordingsQuery.data.length === 0) && (
                  <p className="text-xs text-gray-500 text-center py-4">No recordings yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateForm(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" /> New Studio Session
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="My Podcast Episode #1"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <Input
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="What's this session about?"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Session Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["podcast", "live_show", "interview", "panel", "workshop", "recording"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewSession({ ...newSession, sessionType: type })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                        newSession.sessionType === type
                          ? "border-red-500 bg-red-500/20 text-red-300"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Max Guests</label>
                  <Input
                    type="number" min={1} max={50}
                    value={newSession.maxGuests}
                    onChange={(e) => setNewSession({ ...newSession, maxGuests: parseInt(e.target.value) || 8 })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox" checked={newSession.isPublic}
                      onChange={(e) => setNewSession({ ...newSession, isPublic: e.target.checked })}
                      className="rounded"
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox" checked={newSession.recordingEnabled}
                      onChange={(e) => setNewSession({ ...newSession, recordingEnabled: e.target.checked })}
                      className="rounded"
                    />
                    Record
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => createSession.mutate(newSession)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!newSession.title || createSession.isPending}
                >
                  Create Session
                </Button>
                <Button variant="outline" className="border-white/20" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Guest Modal */}
      {showInviteForm && activeSessionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowInviteForm(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" /> Invite Guest
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Guest Name</label>
                <Input
                  value={newGuest.guestName}
                  onChange={(e) => setNewGuest({ ...newGuest, guestName: e.target.value })}
                  placeholder="Guest name"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email (optional)</label>
                <Input
                  value={newGuest.guestEmail}
                  onChange={(e) => setNewGuest({ ...newGuest, guestEmail: e.target.value })}
                  placeholder="guest@example.com"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["internal", "youtube", "twitch", "zoom", "discord", "twitter_spaces", "custom"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewGuest({ ...newGuest, platform: p })}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1 justify-center transition-all ${
                        newGuest.platform === p
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {platformIcons[p]} {p.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["guest", "co_host", "panelist", "moderator", "speaker"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setNewGuest({ ...newGuest, role: r })}
                      className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                        newGuest.role === r
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {r.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => inviteGuest.mutate({ sessionId: activeSessionId, ...newGuest })}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!newGuest.guestName || inviteGuest.isPending}
                >
                  Send Invitation
                </Button>
                <Button variant="outline" className="border-white/20" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
