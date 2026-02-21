import React, { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Users, Radio } from 'lucide-react';
import { CHANNEL_PRESETS } from '@/lib/streamLibrary';

interface ChannelStats {
  id: string;
  name: string;
  listeners: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  genre: string;
}

export const ListenerLeaderboard: React.FC = () => {
  const [channelStats, setChannelStats] = useState<ChannelStats[]>([]);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    // Generate mock listener data
    const stats: ChannelStats[] = CHANNEL_PRESETS.map((preset, idx) => ({
      id: preset.id,
      name: preset.name,
      listeners: Math.floor(Math.random() * 5000) + 500,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      trendPercent: Math.floor(Math.random() * 30) + 5,
      genre: preset.description || '',
    })).sort((a, b) => b.listeners - a.listeners);

    setChannelStats(stats);
  }, [timeframe]);

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-white">Top Channels</h2>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {channelStats.map((channel, idx) => (
          <div
            key={channel.id}
            className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-orange-500/50 transition-all group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-orange-500/20 transition-colors">
              <span className="font-bold text-white">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
            </div>

            {/* Channel Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                {channel.name}
              </p>
              <p className="text-sm text-slate-400 truncate">
                {channel.genre}
              </p>
            </div>

            {/* Listeners */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-white">
                {(channel.listeners / 1000).toFixed(1)}K
              </span>
            </div>

            {/* Trend */}
            <div className={`flex items-center gap-1 flex-shrink-0 px-3 py-1 rounded-full ${
              channel.trend === 'up'
                ? 'bg-green-500/20 text-green-400'
                : channel.trend === 'down'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {channel.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : channel.trend === 'down' ? (
                <TrendingUp className="w-4 h-4 rotate-180" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {channel.trend === 'stable' ? 'Stable' : `${channel.trendPercent}%`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Total Listeners</p>
          <p className="text-2xl font-bold text-orange-500">
            {(channelStats.reduce((sum, ch) => sum + ch.listeners, 0) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">Active Channels</p>
          <p className="text-2xl font-bold text-orange-500">
            {channelStats.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">Avg Listeners</p>
          <p className="text-2xl font-bold text-orange-500">
            {(channelStats.reduce((sum, ch) => sum + ch.listeners, 0) / channelStats.length / 1000).toFixed(1)}K
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListenerLeaderboard;
