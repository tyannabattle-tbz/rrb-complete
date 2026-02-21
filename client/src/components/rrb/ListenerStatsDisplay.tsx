/**
 * Listener Stats Display Component
 * Shows real-time listener counts from SomaFM API
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { useChannelListeners } from '@/hooks/useSomaFMListeners';

interface ListenerStatsDisplayProps {
  channelId: string;
  showTrend?: boolean;
  compact?: boolean;
}

function formatListenerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function ListenerStatsDisplay({
  channelId,
  showTrend = true,
  compact = false,
}: ListenerStatsDisplayProps) {
  const { listeners, isLoading } = useChannelListeners(channelId);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [prevListeners, setPrevListeners] = useState(listeners);

  useEffect(() => {
    if (listeners > prevListeners) {
      setTrend('up');
    } else if (listeners < prevListeners) {
      setTrend('down');
    } else {
      setTrend('stable');
    }
    setPrevListeners(listeners);
  }, [listeners, prevListeners]);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Users className="w-3 h-3 text-amber-400" />
        <span className="font-semibold text-amber-400">
          {isLoading ? '...' : formatListenerCount(listeners)}
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
            {isLoading ? 'Loading...' : formatListenerCount(listeners)}
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
