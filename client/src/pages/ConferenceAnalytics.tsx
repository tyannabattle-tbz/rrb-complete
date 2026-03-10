import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { ArrowLeft, BarChart3, Users, Clock, Video, Radio, Shield, Cpu, TrendingUp, Mic, Mail, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const platformLabels: Record<string, string> = {
  jitsi: 'RRB Built-in (Jitsi)',
  zoom: 'Zoom',
  meet: 'Google Meet',
  discord: 'Discord',
  skype: 'Skype',
  'rrb-live': 'RRB Broadcast',
  phone: 'Phone',
};

const typeLabels: Record<string, string> = {
  huddle: 'Huddle',
  meeting: 'Meeting',
  conference: 'Conference',
  webinar: 'Webinar',
  broadcast: 'Broadcast',
  workshop: 'Workshop',
};

export default function ConferenceAnalytics() {
  const { data: analytics, isLoading } = trpc.conference.getAnalytics.useQuery();
  const { data: stats } = trpc.conference.getStats.useQuery();
  const { data: digest } = trpc.conference.getAnalyticsDigest.useQuery(undefined, { enabled: false });
  const { user } = useAuth();
  const { toast } = useToast();
  const sendDigestMutation = trpc.conference.sendWeeklyDigest.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Weekly Digest Sent!', description: `${data.sessions} sessions, ${data.attendees} attendees reported` });
    },
    onError: (err) => toast({ title: 'Failed to send digest', description: err.message, variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totals = analytics?.totals || {};
  const totalConferences = Number(totals.total_conferences) || 0;
  const totalAttendees = Number(totals.total_attendees) || 0;
  const avgDuration = Math.round(Number(totals.avg_duration) || 0);
  const totalMinutes = Number(totals.total_minutes) || 0;
  const totalRecordings = Number(totals.total_recordings) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/conference">
                <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-purple-400" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                  Conference Analytics
                </h1>
                <p className="text-sm text-gray-400">Canryn Production Ecosystem — Powered by QUMUS</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-amber-400"><Radio className="w-3 h-3" /> RRB</span>
              <span className="flex items-center gap-1 text-xs text-purple-400"><Cpu className="w-3 h-3" /> TBZ-OS</span>
              <span className="flex items-center gap-1 text-xs text-red-400"><Shield className="w-3 h-3" /> HybridCast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard icon={<BarChart3 className="w-5 h-5" />} label="Total Conferences" value={totalConferences} color="text-purple-400" />
          <KPICard icon={<Users className="w-5 h-5" />} label="Total Attendees" value={totalAttendees} color="text-amber-400" />
          <KPICard icon={<Clock className="w-5 h-5" />} label="Avg Duration" value={`${avgDuration}m`} color="text-green-400" />
          <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Total Hours" value={`${Math.round(totalMinutes / 60)}`} color="text-blue-400" />
          <KPICard icon={<Video className="w-5 h-5" />} label="Recordings" value={totalRecordings} color="text-red-400" />
        </div>

        {/* Live Status */}
        {stats && Number(stats.live) > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-300 font-medium">{stats.live} conference{Number(stats.live) > 1 ? 's' : ''} live now</span>
            <Link href="/conference">
              <button className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                View Live
              </button>
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Platform Usage */}
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" /> Platform Usage
            </h2>
            <div className="space-y-3">
              {(analytics?.platforms || []).map((p: any) => {
                const count = Number(p.count) || 0;
                const maxCount = Math.max(...(analytics?.platforms || []).map((x: any) => Number(x.count) || 0), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={p.platform}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{platformLabels[p.platform] || p.platform}</span>
                      <span className="text-gray-400">{count} conferences &bull; {Number(p.total_attendees) || 0} attendees</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!analytics?.platforms || analytics.platforms.length === 0) && (
                <p className="text-gray-500 text-sm">No conference data yet. Create your first conference!</p>
              )}
            </div>
          </div>

          {/* Meeting Type Breakdown */}
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Meeting Types
            </h2>
            <div className="space-y-3">
              {(analytics?.types || []).map((t: any) => {
                const count = Number(t.count) || 0;
                const maxCount = Math.max(...(analytics?.types || []).map((x: any) => Number(x.count) || 0), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{typeLabels[t.type] || t.type}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!analytics?.types || analytics.types.length === 0) && (
                <p className="text-gray-500 text-sm">No meeting data yet.</p>
              )}
            </div>
          </div>

          {/* Top Hosts */}
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" /> Top Hosts
            </h2>
            <div className="space-y-3">
              {(analytics?.topHosts || []).map((h: any, i: number) => (
                <div key={h.host_name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-amber-700/20 text-amber-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{h.host_name}</div>
                    <div className="text-xs text-gray-400">{Number(h.conferences_hosted)} conferences &bull; {Number(h.total_attendees) || 0} attendees</div>
                  </div>
                </div>
              ))}
              {(!analytics?.topHosts || analytics.topHosts.length === 0) && (
                <p className="text-gray-500 text-sm">No host data yet.</p>
              )}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Monthly Trend
            </h2>
            <div className="space-y-3">
              {(analytics?.monthlyTrend || []).reverse().map((m: any) => {
                const count = Number(m.count) || 0;
                const maxCount = Math.max(...(analytics?.monthlyTrend || []).map((x: any) => Number(x.count) || 0), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{m.month}</span>
                      <span className="text-gray-400">{count} conferences &bull; {Number(m.attendees) || 0} attendees</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!analytics?.monthlyTrend || analytics.monthlyTrend.length === 0) && (
                <p className="text-gray-500 text-sm">No trend data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Ecosystem Integration Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <IntegrationCard
              name="RRB Radio"
              icon={<Radio className="w-6 h-6" />}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              borderColor="border-amber-500/30"
              features={['Broadcast conferences live', 'DJ announcements for events', 'Commercial integration', 'Live listener bridge']}
            />
            <IntegrationCard
              name="TBZ-OS"
              icon={<Cpu className="w-6 h-6" />}
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              borderColor="border-purple-500/30"
              features={['Ty Bat Zan scheduling', 'QUMUS orchestration', 'Autonomous monitoring', 'System health tracking']}
            />
            <IntegrationCard
              name="HybridCast"
              icon={<Shield className="w-6 h-6" />}
              color="text-red-400"
              bgColor="bg-red-500/10"
              borderColor="border-red-500/30"
              features={['Emergency broadcast bridge', 'Multi-platform streaming', 'Offline-first recording', 'Mesh network relay']}
            />
          </div>
        </div>
      </div>

      {/* Weekly Digest Section */}
      {user && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Weekly Conference Digest</h3>
                  <p className="text-xs text-gray-400">QUMUS auto-sends every Sunday at 8pm &bull; Manual trigger available</p>
                </div>
              </div>
              <button
                onClick={() => sendDigestMutation.mutate()}
                disabled={sendDigestMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {sendDigestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Digest Now
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Sessions This Week</p>
                <p className="text-xl font-bold text-white">{totalConferences}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Attendees</p>
                <p className="text-xl font-bold text-white">{totalAttendees}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Recordings</p>
                <p className="text-xl font-bold text-white">{totalRecordings}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Avg Duration</p>
                <p className="text-xl font-bold text-white">{avgDuration}m</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-purple-500/10 mt-8 py-4 text-center text-xs text-gray-600">
        Canryn Production Conference Analytics &bull; Powered by QUMUS &bull; Ty Bat Zan, Digital Steward
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function IntegrationCard({ name, icon, color, bgColor, borderColor, features }: {
  name: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; features: string[];
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={color}>{icon}</span>
        <span className="font-bold text-white">{name}</span>
        <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Connected</span>
      </div>
      <ul className="space-y-1">
        {features.map(f => (
          <li key={f} className="text-xs text-gray-300 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-green-500" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
