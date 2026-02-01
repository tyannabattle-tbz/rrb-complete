import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalMessages: number;
  totalSessions: number;
  averageMessagesPerSession: number;
  topicFrequency: Record<string, number>;
  lastActiveTime: string;
  engagementScore: number;
}

export const ConversationAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // Load analytics from localStorage
    const saved = localStorage.getItem('qumus_analytics');
    if (saved) {
      setAnalytics(JSON.parse(saved));
    } else {
      // Initialize with default analytics
      const defaultAnalytics: AnalyticsData = {
        totalMessages: 0,
        totalSessions: 0,
        averageMessagesPerSession: 0,
        topicFrequency: {},
        lastActiveTime: new Date().toISOString(),
        engagementScore: 0,
      };
      setAnalytics(defaultAnalytics);
    }
  };

  const trackMessage = (topic?: string) => {
    if (!analytics) return;

    const updated = { ...analytics };
    updated.totalMessages += 1;
    updated.lastActiveTime = new Date().toISOString();

    if (topic) {
      updated.topicFrequency[topic] = (updated.topicFrequency[topic] || 0) + 1;
    }

    // Calculate engagement score (0-100)
    updated.engagementScore = Math.min(
      100,
      Math.round((updated.totalMessages / 10) * 100)
    );

    setAnalytics(updated);
    localStorage.setItem('qumus_analytics', JSON.stringify(updated));
  };

  if (!analytics) return null;

  const topTopics = Object.entries(analytics.topicFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-4 w-4" />
          Conversation Analytics
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{analytics.totalMessages}</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{analytics.totalSessions}</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Avg per Session</p>
              <p className="text-2xl font-bold">
                {analytics.totalSessions > 0
                  ? Math.round(analytics.totalMessages / analytics.totalSessions)
                  : 0}
              </p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className="text-2xl font-bold">{analytics.engagementScore}%</p>
            </div>
          </div>

          {/* Engagement Bar */}
          <div className="space-y-1">
            <p className="text-xs font-medium">Engagement Level</p>
            <div className="h-2 w-full rounded-full bg-background">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${analytics.engagementScore}%` }}
              />
            </div>
          </div>

          {/* Top Topics */}
          {topTopics.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Top Topics</p>
              <div className="space-y-1">
                {topTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{topic}</span>
                    <span className="font-medium">{count} messages</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Active */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Last active:{' '}
              {new Date(analytics.lastActiveTime).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
