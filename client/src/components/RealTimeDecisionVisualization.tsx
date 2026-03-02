import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DecisionEvent {
  id: string;
  timestamp: Date;
  type: 'decision' | 'approval' | 'execution' | 'error';
  subsystem: string;
  description: string;
  autonomyLevel: number;
  status: 'pending' | 'approved' | 'executed' | 'failed';
  executionTime?: number;
}

interface RealTimeMetrics {
  totalDecisions: number;
  avgAutonomy: number;
  approvalRate: number;
  executionRate: number;
  errorRate: number;
}

export default function RealTimeDecisionVisualization() {
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    totalDecisions: 0,
    avgAutonomy: 0,
    approvalRate: 0,
    executionRate: 0,
    errorRate: 0,
  });
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time decision events
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newEvent: DecisionEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date(),
        type: ['decision', 'approval', 'execution', 'error'][Math.floor(Math.random() * 4)] as any,
        subsystem: ['HybridCast', 'Rockin Rockin Boogie', 'Sweet Miracles', 'Canryn'][
          Math.floor(Math.random() * 4)
        ],
        description: generateDescription(),
        autonomyLevel: Math.floor(Math.random() * 100),
        status: ['pending', 'approved', 'executed', 'failed'][Math.floor(Math.random() * 4)] as any,
        executionTime: Math.floor(Math.random() * 5000),
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);

      // Update metrics
      setMetrics(prev => ({
        totalDecisions: prev.totalDecisions + 1,
        avgAutonomy: Math.floor((prev.avgAutonomy + newEvent.autonomyLevel) / 2),
        approvalRate: newEvent.status === 'approved' ? prev.approvalRate + 1 : prev.approvalRate,
        executionRate: newEvent.status === 'executed' ? prev.executionRate + 1 : prev.executionRate,
        errorRate: newEvent.status === 'failed' ? prev.errorRate + 1 : prev.errorRate,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'execution':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'executed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 gap-4">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Total Decisions</p>
            <p className="text-2xl font-bold text-white">{metrics.totalDecisions}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Avg Autonomy</p>
            <p className="text-2xl font-bold text-blue-400">{metrics.avgAutonomy}%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Approval Rate</p>
            <p className="text-2xl font-bold text-green-400">{metrics.approvalRate}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Execution Rate</p>
            <p className="text-2xl font-bold text-purple-400">{metrics.executionRate}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Error Rate</p>
            <p className="text-2xl font-bold text-red-400">{metrics.errorRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            isLive
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-slate-700 text-slate-400 border border-slate-600'
          }`}
        >
          {isLive ? '🔴 LIVE' : '⏸ PAUSED'}
        </button>
        <p className="text-xs text-slate-400">Real-time decision stream</p>
      </div>

      {/* Decision Events Timeline */}
      <Card className="flex-1 bg-slate-800 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Decision Execution Timeline</CardTitle>
          <CardDescription>Real-time policy execution and autonomous decisions</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>Waiting for decisions...</p>
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                className={`relative p-3 rounded border transition-all ${
                  index === 0 ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700 bg-slate-700/30'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800 border-2 border-blue-500" />

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getEventIcon(event.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white truncate">{event.description}</span>
                      <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400">{event.subsystem}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{formatTime(event.timestamp)}</span>
                    </div>

                    {/* Autonomy bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded transition-all"
                          style={{ width: `${event.autonomyLevel}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{event.autonomyLevel}%</span>
                    </div>

                    {/* Execution time */}
                    {event.executionTime && (
                      <p className="text-xs text-slate-500 mt-1">
                        Execution: {event.executionTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Policy Execution Summary */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 rounded p-2">
              <p className="text-xs font-medium text-white">Emergency Broadcast</p>
              <p className="text-xs text-green-400">✓ Active</p>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <p className="text-xs font-medium text-white">Content Moderation</p>
              <p className="text-xs text-green-400">✓ Active</p>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <p className="text-xs font-medium text-white">Donation Threshold</p>
              <p className="text-xs text-green-400">✓ Active</p>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <p className="text-xs font-medium text-white">Meditation Scheduling</p>
              <p className="text-xs text-green-400">✓ Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateDescription(): string {
  const descriptions = [
    'Emergency broadcast initiated',
    'Content moderation check',
    'Donation processing',
    'Meditation session scheduled',
    'Policy execution triggered',
    'Decision approved by admin',
    'Autonomous action executed',
    'System health check',
    'User activity detected',
    'Subsystem status update',
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
