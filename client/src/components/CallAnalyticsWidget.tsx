import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export interface CallAnalyticsMetrics {
  totalListeners: number;
  activeCalls: number;
  callsWaiting: number;
  averageCallDuration: number;
  callCompletionRate: number;
  topFrequencies: Array<{ frequency: number; count: number }>;
  listenerGrowth: Array<{ time: string; count: number }>;
  callSentiment: { positive: number; neutral: number; negative: number };
  peakHours: Array<{ hour: number; calls: number }>;
}

interface CallAnalyticsWidgetProps {
  metrics?: CallAnalyticsMetrics;
  isLive?: boolean;
}

export function CallAnalyticsWidget({ 
  metrics = getDefaultCallMetrics(),
  isLive = true 
}: CallAnalyticsWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState<'calls' | 'listeners' | 'sentiment' | 'frequencies'>('calls');

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Real-Time Call Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span className="text-sm font-semibold text-gray-700">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Active Calls */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-gray-600 mb-1">Active Calls</p>
          <p className="text-3xl font-bold text-red-600">{metrics.activeCalls}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.callsWaiting} waiting</p>
        </div>

        {/* Total Listeners */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-1">Listeners</p>
          <p className="text-3xl font-bold text-blue-600">{metrics.totalListeners.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Online now</p>
        </div>

        {/* Avg Call Duration */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Avg Duration</p>
          <p className="text-3xl font-bold text-purple-600">{metrics.averageCallDuration}m</p>
          <p className="text-xs text-gray-500 mt-1">Per call</p>
        </div>

        {/* Completion Rate */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-gray-600 mb-1">Completion</p>
          <p className="text-3xl font-bold text-green-600">{metrics.callCompletionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Success rate</p>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {(['calls', 'listeners', 'sentiment', 'frequencies'] as const).map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
              selectedMetric === metric
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </button>
        ))}
      </div>

      {/* Metric Content */}
      <div className="mb-8">
        {selectedMetric === 'calls' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Call Activity by Hour</h3>
            <div className="flex items-end gap-2 h-48">
              {metrics.peakHours.map((hour, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${(hour.calls / Math.max(...metrics.peakHours.map(h => h.calls))) * 100}%` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{hour.hour}h</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMetric === 'listeners' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Listener Growth</h3>
            <div className="space-y-2">
              {metrics.listenerGrowth.map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">{point.time}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2"
                      style={{ width: `${(point.count / Math.max(...metrics.listenerGrowth.map(p => p.count))) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{point.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMetric === 'sentiment' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Call Sentiment Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{metrics.callSentiment.positive}</p>
                <p className="text-sm text-gray-600">Positive</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{metrics.callSentiment.neutral}</p>
                <p className="text-sm text-gray-600">Neutral</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{metrics.callSentiment.negative}</p>
                <p className="text-sm text-gray-600">Negative</p>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'frequencies' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Frequencies</h3>
            <div className="space-y-3">
              {metrics.topFrequencies.map((freq, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 w-20">{freq.frequency} Hz</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${(freq.count / Math.max(...metrics.topFrequencies.map(f => f.count))) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{freq.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Status */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <p className="font-semibold text-gray-800">System Status</p>
        </div>
        <p className="text-sm text-gray-700">
          {metrics.activeCalls > 0
            ? `${metrics.activeCalls} active call(s) with ${metrics.totalListeners.toLocaleString()} listeners. Average call quality: Excellent`
            : 'No active calls. System ready for incoming connections.'}
        </p>
      </div>
    </div>
  );
}

/**
 * Get default metrics for demo/testing
 */
function getDefaultCallMetrics(): CallAnalyticsMetrics {
  return {
    totalListeners: 2847,
    activeCalls: 3,
    callsWaiting: 5,
    averageCallDuration: 12,
    callCompletionRate: 94,
    topFrequencies: [
      { frequency: 432, count: 1245 },
      { frequency: 528, count: 987 },
      { frequency: 639, count: 654 },
      { frequency: 741, count: 432 },
      { frequency: 852, count: 321 },
    ],
    listenerGrowth: [
      { time: '12:00 AM', count: 450 },
      { time: '3:00 AM', count: 380 },
      { time: '6:00 AM', count: 620 },
      { time: '9:00 AM', count: 1200 },
      { time: '12:00 PM', count: 2100 },
      { time: '3:00 PM', count: 2847 },
    ],
    callSentiment: {
      positive: 156,
      neutral: 89,
      negative: 12,
    },
    peakHours: [
      { hour: 6, calls: 12 },
      { hour: 9, calls: 34 },
      { hour: 12, calls: 56 },
      { hour: 15, calls: 48 },
      { hour: 18, calls: 72 },
      { hour: 21, calls: 45 },
      { hour: 24, calls: 23 },
    ],
  };
}
