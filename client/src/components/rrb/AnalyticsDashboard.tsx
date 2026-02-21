import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Globe, Smartphone } from 'lucide-react';
import { useAnalyticsStore, generateMockAnalytics } from '@/lib/analyticsService';
import { Button } from '@/components/ui/button';

interface AnalyticsDashboardProps {
  channelId: string;
  channelName: string;
}

export function AnalyticsDashboard({ channelId, channelName }: AnalyticsDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { analytics, updateChannelAnalytics, getChannelAnalytics, selectChannel, selectedChannelId } = useAnalyticsStore();

  // Initialize with mock data on first load
  useEffect(() => {
    if (!getChannelAnalytics(channelId)) {
      const mockData = generateMockAnalytics(channelId, channelName);
      updateChannelAnalytics(channelId, mockData);
    }
  }, [channelId, channelName]);

  const channelAnalytics = getChannelAnalytics(channelId);
  const isSelected = selectedChannelId === channelId;

  if (!channelAnalytics) {
    return null;
  }

  const {
    totalListeners,
    peakListeners,
    averageListeners,
    peakHour,
    totalStreamsToday,
    listenerDemographics,
    topTracks,
    trendingMetrics,
  } = channelAnalytics;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          selectChannel(isExpanded ? null : channelId);
        }}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-slate-900">Analytics</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{totalListeners.toLocaleString()}</p>
            <p className="text-xs text-slate-500">current listeners</p>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Peak Listeners</p>
              <p className="text-2xl font-bold text-blue-600">{peakListeners.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Average</p>
              <p className="text-2xl font-bold text-green-600">{averageListeners.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Peak Hour</p>
              <p className="text-2xl font-bold text-purple-600">{peakHour}:00</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Streams Today</p>
              <p className="text-2xl font-bold text-orange-600">{totalStreamsToday}</p>
            </div>
          </div>

          {/* Trending Metrics */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Trending</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Listener Trend</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${trendingMetrics.listenerTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trendingMetrics.listenerTrend === 'up' ? '↑' : '↓'} {trendingMetrics.trendPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Weekly Growth</span>
                <span className="text-sm font-bold text-green-600">+{trendingMetrics.weeklyGrowth}%</span>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Listener Demographics
            </h4>

            {/* Countries */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Top Countries</p>
              <div className="space-y-1">
                {Object.entries(listenerDemographics.countries)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{country}</span>
                      <span className="font-semibold text-slate-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Devices */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Devices
              </p>
              <div className="space-y-1">
                {Object.entries(listenerDemographics.devices)
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{device}</span>
                      <span className="font-semibold text-slate-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top Tracks */}
          {topTracks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Top Tracks
              </h4>
              <div className="space-y-2">
                {topTracks.map((track, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{track.title}</p>
                        <p className="text-xs text-slate-500 truncate">{track.artist}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 flex-shrink-0 ml-2">{track.plays}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            Export Report
          </Button>
        </div>
      )}
    </div>
  );
}
