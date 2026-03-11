import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Radio, Zap, Play, Music, Mic2, Podcast, AlertTriangle, Heart, Newspaper, ChevronLeft, Loader2, BarChart3, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';

const SHOW_TYPE_COLORS: Record<string, string> = {
  music: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  talk: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  podcast: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  commercial: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  healing: 'bg-green-500/20 text-green-300 border-green-500/30',
  live_event: 'bg-red-500/20 text-red-300 border-red-500/30',
  news: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  gospel: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  emergency: 'bg-red-600/20 text-red-400 border-red-600/30',
};

const SHOW_TYPE_ICONS: Record<string, React.ReactNode> = {
  music: <Music className="w-3 h-3" />,
  talk: <Mic2 className="w-3 h-3" />,
  podcast: <Podcast className="w-3 h-3" />,
  commercial: <Radio className="w-3 h-3" />,
  healing: <Heart className="w-3 h-3" />,
  live_event: <Play className="w-3 h-3" />,
  news: <Newspaper className="w-3 h-3" />,
  gospel: <Music className="w-3 h-3" />,
  emergency: <AlertTriangle className="w-3 h-3" />,
};

const DAYS = ['daily', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ContentScheduler() {
  const [, setLocation] = useLocation();
  const [selectedDay, setSelectedDay] = useState<string>('daily');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const scheduleQuery = trpc.contentScheduler.getSchedule.useQuery();
  const statsQuery = trpc.contentScheduler.getStats.useQuery();
  const nowPlayingQuery = trpc.contentScheduler.getNowPlaying.useQuery();
  const seedMutation = trpc.contentScheduler.seedDefaultSchedule.useMutation({
    onSuccess: (data) => {
      toast.success('Schedule seeded', { description: `${data.count} entries created across all channels` });
      scheduleQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => toast.error('Seed failed', { description: err.message }),
  });

  const schedule = scheduleQuery.data || [];
  const stats = statsQuery.data;
  const nowPlaying = nowPlayingQuery.data || [];

  const filteredSchedule = useMemo(() => {
    let items = schedule;
    if (selectedDay !== 'all') {
      items = items.filter((s: any) => s.dayOfWeek === selectedDay || s.dayOfWeek === 'daily');
    }
    if (selectedType !== 'all') {
      items = items.filter((s: any) => s.showType === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((s: any) =>
        s.showName.toLowerCase().includes(q) ||
        s.channelName.toLowerCase().includes(q) ||
        (s.host || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [schedule, selectedDay, selectedType, searchQuery]);

  // Group by time slot for timeline view
  const timeSlots = useMemo(() => {
    const slots: Record<string, any[]> = {};
    for (const entry of filteredSchedule) {
      const key = (entry as any).startTime || '00:00';
      if (!slots[key]) slots[key] = [];
      slots[key].push(entry);
    }
    return Object.entries(slots).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSchedule]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation('/rrb')} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  QUMUS Content Scheduler
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">24/7</Badge>
                </h1>
                <p className="text-xs text-slate-400">Autonomous content scheduling across 51 channels</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => { scheduleQuery.refetch(); statsQuery.refetch(); nowPlayingQuery.refetch(); }}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                {seedMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
                Seed Default Schedule
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats?.totalEntries || 0}</p>
              <p className="text-xs text-slate-400">Total Entries</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats?.activeEntries || 0}</p>
              <p className="text-xs text-slate-400">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats?.uniqueChannels || 0}</p>
              <p className="text-xs text-slate-400">Channels</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats?.qumusManaged || 0}</p>
              <p className="text-xs text-slate-400">QUMUS Managed</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{nowPlaying.length}</p>
              <p className="text-xs text-slate-400">On Air Now</p>
            </CardContent>
          </Card>
        </div>

        {/* Now Playing */}
        {nowPlaying.length > 0 && (
          <Card className="bg-gradient-to-r from-green-900/20 via-slate-800/60 to-green-900/20 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Play className="w-4 h-4 text-green-400" />
                On Air Now
                <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {nowPlaying.map((entry: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg">
                    <div className="flex-shrink-0">
                      {SHOW_TYPE_ICONS[entry.showType] || <Radio className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{entry.showName}</p>
                      <p className="text-[10px] text-slate-400">{entry.channelName} • {entry.host || 'QUMUS Auto'}</p>
                    </div>
                    <Badge className={`text-[10px] ${SHOW_TYPE_COLORS[entry.showType] || 'bg-slate-500/20 text-slate-300'}`}>
                      {entry.showType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Search shows, channels, hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800/60 border-purple-500/20 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={selectedDay === 'all' ? 'default' : 'outline'} onClick={() => setSelectedDay('all')}
              className={selectedDay === 'all' ? 'bg-purple-600' : 'border-purple-500/20 text-slate-300 hover:bg-purple-500/10'}>
              All Days
            </Button>
            {DAYS.map(day => (
              <Button key={day} size="sm" variant={selectedDay === day ? 'default' : 'outline'} onClick={() => setSelectedDay(day)}
                className={selectedDay === day ? 'bg-purple-600' : 'border-purple-500/20 text-slate-300 hover:bg-purple-500/10'}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={selectedType === 'all' ? 'default' : 'outline'} onClick={() => setSelectedType('all')}
              className={selectedType === 'all' ? 'bg-amber-600' : 'border-amber-500/20 text-slate-300 hover:bg-amber-500/10'}>
              <Filter className="w-3 h-3 mr-1" /> All Types
            </Button>
            {Object.keys(SHOW_TYPE_COLORS).map(type => (
              <Button key={type} size="sm" variant={selectedType === type ? 'default' : 'outline'} onClick={() => setSelectedType(type)}
                className={selectedType === type ? 'bg-amber-600' : 'border-amber-500/20 text-slate-300 hover:bg-amber-500/10'}>
                {SHOW_TYPE_ICONS[type]} <span className="ml-1">{type.replace('_', ' ')}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Schedule Timeline */}
        {scheduleQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : timeSlots.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Schedule Entries</h3>
              <p className="text-sm text-slate-400 mb-4">Click "Seed Default Schedule" to populate all 51 channels with 24/7 content</p>
              <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-amber-600">
                <Zap className="w-4 h-4 mr-1" /> Seed Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Schedule Timeline
              <Badge className="bg-purple-500/10 text-purple-300 text-xs">{filteredSchedule.length} entries</Badge>
            </h3>
            {timeSlots.map(([time, entries]) => (
              <div key={time} className="flex gap-4">
                {/* Time Column */}
                <div className="flex-shrink-0 w-16 pt-1">
                  <p className="text-sm font-mono font-bold text-amber-400">{time}</p>
                </div>
                {/* Entries */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {entries.map((entry: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-800/50 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-white truncate">{entry.showName}</p>
                        <Badge className={`text-[10px] ${SHOW_TYPE_COLORS[entry.showType] || 'bg-slate-500/20 text-slate-300'}`}>
                          {SHOW_TYPE_ICONS[entry.showType]} <span className="ml-1">{entry.showType}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{entry.channelName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-500">{entry.startTime} – {entry.endTime}</span>
                        <span className="text-[10px] text-purple-400">{entry.host || 'QUMUS Auto'}</span>
                      </div>
                      {entry.description && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{entry.description}</p>
                      )}
                      {entry.qumusManaged && (
                        <Zap className="w-3 h-3 text-purple-400/40 mt-1" title="QUMUS Managed" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Type Distribution */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Content Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {SHOW_TYPE_ICONS[type]}
                      <span className="text-sm text-white capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xl font-bold text-purple-300">{count as number}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => setLocation('/rrb')} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12">
            <Radio className="w-5 h-5 mr-2" /> Back to Radio
          </Button>
          <Button onClick={() => setLocation('/qumus')} className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 h-12">
            <Zap className="w-5 h-5 mr-2" /> QUMUS Dashboard
          </Button>
          <Button onClick={() => setLocation('/admin/policies')} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12">
            <BarChart3 className="w-5 h-5 mr-2" /> Policy Dashboard
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-purple-500/10">
          <p className="text-xs text-slate-500">
            QUMUS Content Scheduler • 51 Channels • 24/7 Autonomous Programming • A Canryn Production
          </p>
        </footer>
      </main>
    </div>
  );
}
