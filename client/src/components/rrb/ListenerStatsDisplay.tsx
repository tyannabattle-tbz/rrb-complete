/**
 * Listener Stats Display Component
 * Shows real-time listener counts for channels
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { getChannelStats, formatListenerCount } from '@/lib/listenerStats';

interface ListenerStatsDisplayProps {
  channelId: string;
  showTrend?: boolean;
  compact?: boolean;
}

export function ListenerStatsDisplay({
  channelId,
  showTrend = true,
  compact = false,
}: ListenerStatsDisplayProps) {
  const [stats, setStats] = useState(() => getChannelStats(channelId));
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  // Update stats every 30 seconds to simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = getChannelStats(channelId);
      setStats(prevStats => {
        if (newStats.listenerCount > prevStats.listenerCount) {
          setTrend('up');
        } else if (newStats.listenerCount < prevStats.listenerCount) {
          setTrend('down');
        } else {
          setTrend('stable');
        }
        return newStats;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [channelId]);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Users className="w-3 h-3 text-amber-400" />
        <span className="font-semibold text-amber-400">
          {formatListenerCount(stats.listenerCount)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-400" />
        <div>
          <div className="text-xs text-zinc-400">Listeners</div>
          <div className="text-sm font-bold text-white">
            {formatListenerCount(stats.listenerCount)}
          </div>
        </div>
      </div>

      {showTrend && (
        <div className="flex items-center gap-1 ml-auto">
          <TrendingUp
            className={`w-4 h-4 ${
              trend === 'up'
                ? 'text-green-400'
                : trend === 'down'
                ? 'text-red-400'
                : 'text-zinc-500'
            }`}
          />
          <span className="text-xs text-zinc-400">
            {trend === 'up' ? '+' : trend === 'down' ? '-' : '→'}
          </span>
        </div>
      )}
    </div>
  );
}
