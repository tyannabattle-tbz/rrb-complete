import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Music, Clock, TrendingUp, Heart } from 'lucide-react';

interface ListeningStats {
  totalEpisodes: number;
  totalHours: number;
  favoriteCount: number;
  streakDays: number;
}

interface EpisodeHistory {
  date: string;
  episodes: number;
}

interface FavoritePodcast {
  name: string;
  episodes: number;
  hours: number;
}

const STATS: ListeningStats = {
  totalEpisodes: 247,
  totalHours: 412,
  favoriteCount: 18,
  streakDays: 15,
};

const LISTENING_HISTORY: EpisodeHistory[] = [
  { date: 'Mon', episodes: 3 },
  { date: 'Tue', episodes: 5 },
  { date: 'Wed', episodes: 2 },
  { date: 'Thu', episodes: 4 },
  { date: 'Fri', episodes: 6 },
  { date: 'Sat', episodes: 8 },
  { date: 'Sun', episodes: 4 },
];

const FAVORITE_PODCASTS: FavoritePodcast[] = [
  { name: 'Rockin\' Rockin\' Boogie', episodes: 85, hours: 142 },
  { name: 'Rock Around the Clock', episodes: 62, hours: 104 },
  { name: 'Classic Rock Legends', episodes: 45, hours: 75 },
  { name: 'Vinyl Stories', episodes: 32, hours: 53 },
  { name: 'Music History Deep Dives', episodes: 23, hours: 38 },
];

const LISTENING_TIME_DATA = [
  { name: 'Morning (6-12)', value: 25 },
  { name: 'Afternoon (12-18)', value: 35 },
  { name: 'Evening (18-24)', value: 30 },
  { name: 'Night (24-6)', value: 10 },
];

const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'];

export function ListenerDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Your Listening Dashboard</h1>
          <p className="text-xs sm:text-base text-slate-400">Track your podcast listening journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="bg-slate-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Episodes</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{STATS.totalEpisodes}</p>
              </div>
              <Music className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Hours</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{STATS.totalHours}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Favorites</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{STATS.favoriteCount}</p>
              </div>
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Listening Streak</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{STATS.streakDays} days</p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-2 mb-6 sm:mb-8">
          {/* Weekly Listening */}
          <Card className="bg-slate-800 p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Weekly Listening</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={LISTENING_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="episodes" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Listening Time Distribution */}
          <Card className="bg-slate-800 p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">When You Listen</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={LISTENING_TIME_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Favorite Podcasts */}
        <Card className="bg-slate-800 p-3 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Your Favorite Podcasts</h3>
          <div className="space-y-3 sm:space-y-4">
            {FAVORITE_PODCASTS.map((podcast) => (
              <div key={podcast.name} className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-700 last:border-b-0">
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white">{podcast.name}</p>
                  <p className="text-xs sm:text-sm text-slate-400">{podcast.episodes} episodes • {podcast.hours} hours</p>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm">{Math.round((podcast.hours / STATS.totalHours) * 100)}%</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Time Range Selector */}
        <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className="text-xs sm:text-sm"
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className="text-xs sm:text-sm"
          >
            This Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            className="text-xs sm:text-sm"
          >
            This Year
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ListenerDashboard;
