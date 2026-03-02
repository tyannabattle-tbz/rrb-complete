import React, { useState } from 'react';
import { Activity, Users, Music, TrendingUp, Radio, Zap, Battery, Signal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGestureControls } from '@/hooks/useGestureControls';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

export function MobileOptimizedDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'streaming' | 'network' | 'system'>('overview');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const gestureRef = useGestureControls({
    onSwipeLeft: () => {
      const tabs: Array<'overview' | 'streaming' | 'network' | 'system'> = ['overview', 'streaming', 'network', 'system'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const tabs: Array<'overview' | 'streaming' | 'network' | 'system'> = ['overview', 'streaming', 'network', 'system'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
  });

  const overviewMetrics: MetricCard[] = [
    {
      id: 'active-users',
      title: 'Active Users',
      value: '1,247',
      icon: <Users className="w-5 h-5" />,
      trend: 12,
      color: 'bg-blue-500/20 border-blue-500',
    },
    {
      id: 'total-streams',
      title: 'Total Streams',
      value: '5,892',
      icon: <Music className="w-5 h-5" />,
      trend: 8,
      color: 'bg-purple-500/20 border-purple-500',
    },
    {
      id: 'engagement',
      title: 'Engagement',
      value: '87%',
      icon: <Activity className="w-5 h-5" />,
      trend: 5,
      color: 'bg-green-500/20 border-green-500',
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$12.5K',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: 15,
      color: 'bg-amber-500/20 border-amber-500',
    },
  ];

  const streamingMetrics: MetricCard[] = [
    {
      id: 'live-streams',
      title: 'Live Streams',
      value: '23',
      icon: <Radio className="w-5 h-5" />,
      color: 'bg-red-500/20 border-red-500',
    },
    {
      id: 'avg-bitrate',
      title: 'Avg Bitrate',
      value: '320 kbps',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-yellow-500/20 border-yellow-500',
    },
    {
      id: 'buffer-time',
      title: 'Buffer Time',
      value: '0.2s',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-green-500/20 border-green-500',
    },
    {
      id: 'peak-listeners',
      title: 'Peak Listeners',
      value: '892',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-500/20 border-blue-500',
    },
  ];

  const networkMetrics: MetricCard[] = [
    {
      id: 'agents-online',
      title: 'Agents Online',
      value: '156',
      icon: <Signal className="w-5 h-5" />,
      color: 'bg-green-500/20 border-green-500',
    },
    {
      id: 'avg-latency',
      title: 'Avg Latency',
      value: '45ms',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-blue-500/20 border-blue-500',
    },
    {
      id: 'uptime',
      title: 'Uptime',
      value: '99.9%',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-green-500/20 border-green-500',
    },
    {
      id: 'connections',
      title: 'Active Connections',
      value: '2,341',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-500/20 border-purple-500',
    },
  ];

  const systemMetrics: MetricCard[] = [
    {
      id: 'cpu-usage',
      title: 'CPU Usage',
      value: '34%',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-blue-500/20 border-blue-500',
    },
    {
      id: 'memory',
      title: 'Memory',
      value: '62%',
      icon: <Battery className="w-5 h-5" />,
      color: 'bg-yellow-500/20 border-yellow-500',
    },
    {
      id: 'disk-space',
      title: 'Disk Space',
      value: '78%',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-orange-500/20 border-orange-500',
    },
    {
      id: 'response-time',
      title: 'Response Time',
      value: '124ms',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-green-500/20 border-green-500',
    },
  ];

  const getMetrics = () => {
    switch (activeTab) {
      case 'streaming':
        return streamingMetrics;
      case 'network':
        return networkMetrics;
      case 'system':
        return systemMetrics;
      default:
        return overviewMetrics;
    }
  };

  const metrics = getMetrics();

  return (
    <div ref={gestureRef} className="w-full h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border p-4">
        <h1 className="text-lg font-bold text-foreground mb-4">Mobile Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['overview', 'streaming', 'network', 'system'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="whitespace-nowrap text-xs"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-3">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className={`p-4 cursor-pointer transition-all ${metric.color} border ${
              expandedCard === metric.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setExpandedCard(expandedCard === metric.id ? null : metric.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-foreground">{metric.icon}</div>
                  <p className="text-sm font-medium text-foreground/80">{metric.title}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                {metric.trend && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ↑ {metric.trend}% from last hour
                  </p>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedCard === metric.id && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Peak:</span>
                  <span className="font-semibold text-foreground">
                    {typeof metric.value === 'string' ? metric.value : metric.value + 10}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Average:</span>
                  <span className="font-semibold text-foreground">
                    {typeof metric.value === 'string' ? metric.value : Math.floor(metric.value as number * 0.8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Last Updated:</span>
                  <span className="font-semibold text-foreground">Just now</span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Gesture Hint */}
      <div className="p-4 text-center text-xs text-foreground/50">
        💡 Swipe left/right to switch tabs
      </div>
    </div>
  );
}
