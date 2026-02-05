import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Radio, Clock } from 'lucide-react';

export interface ListenerData {
  currentListeners: number;
  peakListeners: number;
  totalListenersToday: number;
  averageSessionDuration: number;
  currentTrack: string;
  currentChannel: number;
  uptime: number;
}

interface ListenerMetricsProps {
  data?: ListenerData;
  isLive?: boolean;
}

export function ListenerMetrics({ data, isLive = true }: ListenerMetricsProps) {
  const [displayData, setDisplayData] = useState<ListenerData>({
    currentListeners: 1250,
    peakListeners: 3420,
    totalListenersToday: 8750,
    averageSessionDuration: 45,
    currentTrack: 'Rockin\' Rockin\' Boogie - Original Recording',
    currentChannel: 7,
    uptime: 99.8,
  });

  useEffect(() => {
    if (data) {
      setDisplayData(data);
    }
  }, [data]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="border-orange-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-orange-600">📊 Live Metrics</CardTitle>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-green-600">LIVE</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Track */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            NOW PLAYING
          </p>
          <p className="font-semibold text-sm truncate">
            {displayData.currentTrack}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Channel {displayData.currentChannel}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Listeners */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">
                LISTENING NOW
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {displayData.currentListeners.toLocaleString()}
            </p>
          </div>

          {/* Peak Listeners */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">PEAK TODAY</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {displayData.peakListeners.toLocaleString()}
            </p>
          </div>

          {/* Total Listeners */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">
                TOTAL TODAY
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {displayData.totalListenersToday.toLocaleString()}
            </p>
          </div>

          {/* Avg Session */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">
                AVG SESSION
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatDuration(displayData.averageSessionDuration)}
            </p>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-300 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              NETWORK UPTIME
            </span>
            <span className="text-lg font-bold text-green-600">
              {displayData.uptime}%
            </span>
          </div>
          <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${displayData.uptime}%` }}
            ></div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Updated {new Date().toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
