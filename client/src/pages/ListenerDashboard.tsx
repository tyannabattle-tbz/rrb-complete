import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Listening Dashboard</h1>
          <p className="text-slate-400">Track your podcast listening journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Episodes</p>
                <p className="text-3xl font-bold text-white">{STATS.totalEpisodes}</p>
              </div>
              <Music className="w-12 h-12 text-amber-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-white">{STATS.totalHours}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Favorites</p>
                <p className="text-3xl font-bold text-white">{STATS.favoriteCount}</p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Listening Streak</p>
                <p className="text-3xl font-bold text-white">{STATS.streakDays} days</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Listening */}
          <Card className="bg-slate-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Listening</h3>
            <ResponsiveContainer width="100%" height={300}>
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
          <Card className="bg-slate-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">When You Listen</h3>
            <ResponsiveContainer width="100%" height={300}>
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
                  {LISTENING_TIME_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Favorite Podcasts */}
        <Card className="bg-slate-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Your Favorite Podcasts</h3>
          <div className="space-y-4">
            {FAVORITE_PODCASTS.map((podcast, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-amber-500 text-black">#{idx + 1}</Badge>
                    <h4 className="font-semibold text-white">{podcast.name}</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    {podcast.episodes} episodes • {podcast.hours} hours
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${(podcast.episodes / FAVORITE_PODCASTS[0].episodes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements Section */}
        <Card className="bg-slate-800 p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-6">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎵', title: '100 Episodes', desc: 'Listened to 100 episodes' },
              { icon: '⏰', title: '100 Hours', desc: 'Accumulated 100 listening hours' },
              { icon: '❤️', title: 'Collector', desc: 'Favorited 10 episodes' },
              { icon: '🔥', title: 'On Fire', desc: '7-day listening streak' },
            ].map((achievement, idx) => (
              <div key={idx} className="p-4 bg-slate-700 rounded-lg text-center">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-1">{achievement.title}</h4>
                <p className="text-xs text-slate-400">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
