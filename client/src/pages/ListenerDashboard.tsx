import { useState, useEffect } from 'react';
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

const LISTENING_TIME: EpisodeHistory[] = [
  { date: 'Mon', episodes: 2 },
  { date: 'Tue', episodes: 3 },
  { date: 'Wed', episodes: 1 },
  { date: 'Thu', episodes: 2 },
  { date: 'Fri', episodes: 3 },
  { date: 'Sat', episodes: 4 },
  { date: 'Sun', episodes: 2 },
];

const LISTENING_DISTRIBUTION = [
  { name: 'Morning', value: 35 },
  { name: 'Afternoon', value: 25 },
  { name: 'Evening', value: 30 },
  { name: 'Night', value: 10 },
];

const FAVORITE_PODCASTS: FavoritePodcast[] = [
  { name: "Rockin' Rockin' Boogie", episodes: 85, hours: 142 },
  { name: 'Rock Around the Clock', episodes: 62, hours: 104 },
  { name: 'Classic Rock Legends', episodes: 45, hours: 75 },
];

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981'];

export function ListenerDashboard() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-4xl font-bold text-white mb-1">Your Listening Dashboard</h1>
          <p className="text-xs md:text-base text-slate-400">Track your podcast listening journey</p>
        </div>

        {/* Stats Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
          <Card className="bg-slate-800 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm mb-1">Total Episodes</p>
                <p className="text-xl md:text-3xl font-bold text-white">{STATS.totalEpisodes}</p>
              </div>
              <Music className="w-6 h-6 md:w-12 md:h-12 text-amber-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm mb-1">Total Hours</p>
                <p className="text-xl md:text-3xl font-bold text-white">{STATS.totalHours}</p>
              </div>
              <Clock className="w-6 h-6 md:w-12 md:h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm mb-1">Favorites</p>
                <p className="text-xl md:text-3xl font-bold text-white">{STATS.favoriteCount}</p>
              </div>
              <Heart className="w-6 h-6 md:w-12 md:h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm mb-1">Listening Streak</p>
                <p className="text-xl md:text-3xl font-bold text-white">{STATS.streakDays} days</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-12 md:h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts - Mobile: 1 col, Desktop: 2 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-8 mb-4 md:mb-8">
          <Card className="bg-slate-800 p-3 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4">Weekly Listening</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={LISTENING_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                <Bar dataKey="episodes" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="bg-slate-800 p-3 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4">When You Listen</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={LISTENING_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {LISTENING_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Favorite Podcasts */}
        <Card className="bg-slate-800 p-3 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4">Your Favorite Podcasts</h2>
          <div className="space-y-2 md:space-y-4">
            {FAVORITE_PODCASTS.map((podcast, index) => (
              <div key={index} className="flex items-center justify-between pb-2 md:pb-4 border-b border-slate-700 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-white truncate">{podcast.name}</p>
                  <p className="text-xs md:text-sm text-slate-400">{podcast.episodes} episodes • {podcast.hours} hours</p>
                </div>
                <Badge variant="secondary" className="ml-2 text-xs md:text-sm">{Math.round((podcast.episodes / 200) * 100)}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
