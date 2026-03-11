/**
 * Podcasts Hub — Landing page for all 3 podcast shows
 * Shows artwork, next episode times, episode listings, and one-click entry to each room.
 * Fully wired to podcastManagement tRPC router.
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Mic2, Play, Pause, Clock, Users, Headphones, Radio, Podcast,
  ChevronRight, Calendar, Download, ExternalLink, Sparkles, Gamepad2,
  Globe, Heart, Upload, BarChart3, TrendingUp, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ─── Show Configs ─────────────────────────────────────────
const SHOW_CONFIGS: Record<string, {
  slug: string;
  route: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  hostName: string;
  hostVoice: string;
  tagline: string;
  features: string[];
  schedule: string;
}> = {
  "candys-corner": {
    slug: "candys-corner",
    route: "/podcast/candys-corner",
    color: "text-blue-400",
    gradient: "from-blue-900/60 to-blue-700/30",
    icon: <Mic2 className="w-6 h-6" />,
    hostName: "Candy",
    hostVoice: "Echo (Warm Male)",
    tagline: "Real talk, real stories, real community",
    features: ["Live guests", "Call-in line", "Video stage", "AI co-host"],
    schedule: "Tue & Thu @ 7:00 PM CT",
  },
  "solbones": {
    slug: "solbones",
    route: "/podcast/solbones",
    color: "text-amber-400",
    gradient: "from-amber-900/60 to-amber-700/30",
    icon: <Gamepad2 className="w-6 h-6" />,
    hostName: "Seraph AI",
    hostVoice: "Onyx (Deep Male)",
    tagline: "Sacred math, healing frequencies, and the Solbones 4+3+2 game",
    features: ["Solbones dice game", "Healing frequencies", "Solfeggio tones", "Live play"],
    schedule: "Wed & Sat @ 8:00 PM CT",
  },
  "around-the-qumunity": {
    slug: "around-the-qumunity",
    route: "/podcast/around-the-qumunity",
    color: "text-purple-400",
    gradient: "from-purple-900/60 to-purple-700/30",
    icon: <Globe className="w-6 h-6" />,
    hostName: "Valanna",
    hostVoice: "Nova (Warm Female)",
    tagline: "Community voices, QUMUS updates, and ecosystem deep-dives",
    features: ["Community spotlight", "QUMUS updates", "Ecosystem news", "Live Q&A"],
    schedule: "Mon & Fri @ 6:00 PM CT",
  },
};

// ─── Stats Banner ─────────────────────────────────────────
function StatsBanner({ stats }: { stats: any }) {
  const items = [
    { label: "Shows", value: stats?.showCount ?? 3, icon: <Podcast className="w-4 h-4" /> },
    { label: "Episodes", value: stats?.totalEpisodes ?? 0, icon: <Mic2 className="w-4 h-4" /> },
    { label: "Published", value: stats?.publishedEpisodes ?? 0, icon: <Radio className="w-4 h-4" /> },
    { label: "Total Plays", value: stats?.totalPlays ?? 0, icon: <Headphones className="w-4 h-4" /> },
    { label: "Downloads", value: stats?.totalDownloads ?? 0, icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-8">
      {items.map((item) => (
        <div key={item.label} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </div>
          <div className="text-xl font-bold text-white">{item.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Show Card ────────────────────────────────────────────
function ShowCard({ showSlug, dbShow }: { showSlug: string; dbShow?: any }) {
  const config = SHOW_CONFIGS[showSlug];
  if (!config) return null;

  const isLive = dbShow?.isLive === 1;
  const episodeCount = dbShow?.totalEpisodes ?? 0;
  const listenerCount = dbShow?.totalListeners ?? 0;

  return (
    <Card className="bg-zinc-900/80 border-zinc-700/50 overflow-hidden hover:border-zinc-600 transition-all">
      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${config.gradient} p-6 relative`}>
        {isLive && (
          <Badge className="absolute top-3 right-3 bg-red-600 text-white animate-pulse">
            LIVE NOW
          </Badge>
        )}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-black/30 ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {dbShow?.title ?? showSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <p className="text-sm text-zinc-300 mt-0.5">{config.tagline}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Host & Schedule */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-3.5 h-3.5" />
            <span>Host: <span className="text-white font-medium">{config.hostName}</span></span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">{config.schedule}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Mic2 className="w-3.5 h-3.5" />
            {episodeCount} episodes
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5" />
            {listenerCount.toLocaleString()} listeners
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {config.features.map((f) => (
            <Badge key={f} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
              {f}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={config.route} className="flex-1">
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
              <Radio className="w-4 h-4 mr-2" />
              Enter Studio
            </Button>
          </Link>
          <Link href={`${config.route}#episodes`}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Play className="w-4 h-4" />
            </Button>
          </Link>
          <a href={`/api/podcasts/${config.slug}/feed.xml`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-zinc-700 text-orange-400 hover:bg-orange-900/20" title="RSS Feed">
              <Podcast className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Episode Row ──────────────────────────────────────────
function EpisodeRow({ episode, showConfig }: { episode: any; showConfig: any }) {
  const [playing, setPlaying] = useState(false);
  const trackPlay = trpc.podcastManagement.trackPlay.useMutation();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlay = () => {
    if (episode.audioUrl) {
      setPlaying(!playing);
      if (!playing) {
        trackPlay.mutate({ episodeId: episode.id });
      }
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors group">
      <button
        onClick={handlePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          episode.audioUrl
            ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        }`}
        disabled={!episode.audioUrl}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">EP {episode.episodeNumber}</span>
          <h4 className="text-sm font-medium text-white truncate">{episode.title}</h4>
        </div>
        {episode.description && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{episode.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(episode.duration)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {episode.playCount ?? 0}
        </span>
        <Badge
          variant="outline"
          className={`text-[10px] ${
            episode.status === "published"
              ? "border-green-700 text-green-400"
              : episode.status === "ready"
              ? "border-blue-700 text-blue-400"
              : "border-zinc-700 text-zinc-500"
          }`}
        >
          {episode.status}
        </Badge>
      </div>
    </div>
  );
}

// ─── Main Hub Page ────────────────────────────────────────
export default function PodcastsHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("shows");

  // Fetch data
  const { data: stats } = trpc.podcastManagement.getStats.useQuery();
  const { data: shows } = trpc.podcastManagement.getShows.useQuery();

  // Map shows by slug
  const showsBySlug: Record<string, any> = {};
  shows?.forEach((s: any) => {
    showsBySlug[s.slug] = s;
  });

  // Get show IDs for episode queries
  const showIds = shows?.map((s: any) => s.id) ?? [];
  const { data: candysEpisodes } = trpc.podcastManagement.getEpisodes.useQuery(
    { showId: showsBySlug["candys-corner"]?.id ?? 0, limit: 5 },
    { enabled: !!showsBySlug["candys-corner"]?.id }
  );
  const { data: solbonesEpisodes } = trpc.podcastManagement.getEpisodes.useQuery(
    { showId: showsBySlug["solbones"]?.id ?? 0, limit: 5 },
    { enabled: !!showsBySlug["solbones"]?.id }
  );
  const { data: qumunityEpisodes } = trpc.podcastManagement.getEpisodes.useQuery(
    { showId: showsBySlug["around-the-qumunity"]?.id ?? 0, limit: 5 },
    { enabled: !!showsBySlug["around-the-qumunity"]?.id }
  );

  const episodesBySlug: Record<string, any[]> = {
    "candys-corner": candysEpisodes?.episodes ?? [],
    "solbones": solbonesEpisodes?.episodes ?? [],
    "around-the-qumunity": qumunityEpisodes?.episodes ?? [],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-zinc-950 to-zinc-950" />
        <div className="relative container max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Podcast className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Canryn Podcasts</h1>
                <p className="text-zinc-400 text-sm">3 shows, live video, call-in, AI hosts, and QUMUS automation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/api/podcasts/opml" download>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> OPML
                </Button>
              </a>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-700 text-orange-400 hover:bg-orange-900/20"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/podcasts/candys-corner/feed.xml`);
                  toast({ title: 'RSS URL Copied', description: 'Paste in your podcast app to subscribe' });
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Subscribe via RSS
              </Button>
            </div>
          </div>

          {/* Stats */}
          <StatsBanner stats={stats} />
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="shows" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Radio className="w-4 h-4 mr-2" /> Shows
            </TabsTrigger>
            <TabsTrigger value="episodes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Mic2 className="w-4 h-4 mr-2" /> All Episodes
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Shows Tab */}
          <TabsContent value="shows">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(SHOW_CONFIGS).map((slug) => (
                <ShowCard key={slug} showSlug={slug} dbShow={showsBySlug[slug]} />
              ))}
            </div>

            {/* Latest Episodes per Show */}
            <div className="mt-8 space-y-6">
              {Object.entries(SHOW_CONFIGS).map(([slug, config]) => {
                const episodes = episodesBySlug[slug] ?? [];
                if (episodes.length === 0) return null;
                return (
                  <div key={slug}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-lg font-semibold ${config.color}`}>
                        Latest from {config.hostName}
                      </h3>
                      <Link href={config.route}>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                          View all <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800/50">
                      {episodes.map((ep: any) => (
                        <EpisodeRow key={ep.id} episode={ep} showConfig={config} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.values(episodesBySlug).every((eps) => eps.length === 0) && (
                <div className="text-center py-16 text-zinc-500">
                  <Mic2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No episodes yet</p>
                  <p className="text-sm mt-1">Enter a studio to create your first episode</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Episodes Tab */}
          <TabsContent value="episodes">
            <div className="space-y-4">
              {Object.entries(SHOW_CONFIGS).map(([slug, config]) => {
                const episodes = episodesBySlug[slug] ?? [];
                return (
                  <div key={slug}>
                    <h3 className={`text-sm font-semibold ${config.color} mb-2 flex items-center gap-2`}>
                      {config.icon}
                      {config.hostName}'s Episodes
                    </h3>
                    {episodes.length > 0 ? (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg divide-y divide-zinc-800/50">
                        {episodes.map((ep: any) => (
                          <EpisodeRow key={ep.id} episode={ep} showConfig={config} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-6 text-center text-zinc-600 text-sm">
                        No episodes recorded yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Broadcast Schedule</h3>
              {[
                { day: "Monday", shows: [{ slug: "around-the-qumunity", time: "6:00 PM CT" }] },
                { day: "Tuesday", shows: [{ slug: "candys-corner", time: "7:00 PM CT" }] },
                { day: "Wednesday", shows: [{ slug: "solbones", time: "8:00 PM CT" }] },
                { day: "Thursday", shows: [{ slug: "candys-corner", time: "7:00 PM CT" }] },
                { day: "Friday", shows: [{ slug: "around-the-qumunity", time: "6:00 PM CT" }] },
                { day: "Saturday", shows: [{ slug: "solbones", time: "8:00 PM CT" }] },
                { day: "Sunday", shows: [] },
              ].map((daySchedule) => (
                <div
                  key={daySchedule.day}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    daySchedule.shows.length > 0
                      ? "bg-zinc-900/50 border-zinc-800"
                      : "bg-zinc-900/20 border-zinc-800/30"
                  }`}
                >
                  <div className="w-24 text-sm font-medium text-zinc-400">{daySchedule.day}</div>
                  <div className="flex-1">
                    {daySchedule.shows.length > 0 ? (
                      daySchedule.shows.map((s) => {
                        const config = SHOW_CONFIGS[s.slug];
                        return (
                          <Link key={s.slug} href={config.route}>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800/50 rounded p-2 -m-2 transition-colors">
                              <div className={config.color}>{config.icon}</div>
                              <span className="text-white font-medium text-sm">
                                {showsBySlug[s.slug]?.title ?? s.slug.replace(/-/g, " ")}
                              </span>
                              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                {s.time}
                              </Badge>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <span className="text-zinc-600 text-sm">No scheduled shows</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Podcast Analytics</h3>

              {/* Per-show stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats?.shows?.map((show: any) => {
                  const config = SHOW_CONFIGS[show.slug];
                  if (!config) return null;
                  return (
                    <Card key={show.id} className="bg-zinc-900/80 border-zinc-700/50">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-sm ${config.color} flex items-center gap-2`}>
                          {config.icon}
                          {show.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Episodes</span>
                          <span className="text-white font-medium">{show.totalEpisodes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Listeners</span>
                          <span className="text-white font-medium">{show.totalListeners.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Status</span>
                          <Badge
                            variant="outline"
                            className={show.isLive ? "border-red-700 text-red-400" : "border-zinc-700 text-zinc-400"}
                          >
                            {show.isLive ? "LIVE" : "Offline"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Schedule</span>
                          <span className="text-zinc-300 text-xs">{show.scheduleDay} @ {show.scheduleTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Aggregate metrics */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Growth Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats?.totalPlays?.toLocaleString() ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats?.totalDownloads?.toLocaleString() ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{stats?.publishedEpisodes ?? 0}</div>
                    <div className="text-xs text-zinc-500 mt-1">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats?.showCount ?? 3}</div>
                    <div className="text-xs text-zinc-500 mt-1">Active Shows</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
