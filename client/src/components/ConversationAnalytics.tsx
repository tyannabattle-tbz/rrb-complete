import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MessageCircle, Clock, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToCSV = () => {
    if (!analytics) return;

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `qumus-analytics-${timestamp}.csv`;

      // Prepare CSV content
      const csvContent = [
        ['RRB Conversation Analytics Report'],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Summary Statistics'],
        ['Metric', 'Value'],
        ['Total Messages', analytics.totalMessages],
        ['Total Sessions', analytics.totalSessions],
        ['Average Messages per Session', analytics.averageMessagesPerSession],
        ['Engagement Score', `${analytics.engagementScore}%`],
        ['Last Active', new Date(analytics.lastActiveTime).toLocaleString()],
        [''],
        ['Topic Frequency'],
        ['Topic', 'Count'],
        ...Object.entries(analytics.topicFrequency).map(([topic, count]) => [topic, count]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics exported as CSV');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    if (!analytics) return;

    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `qumus-analytics-${timestamp}.txt`;

      // Prepare text content
      const textContent = `
QUMUS CONVERSATION ANALYTICS REPORT
====================================

Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
------------------
Total Messages: ${analytics.totalMessages}
Total Sessions: ${analytics.totalSessions}
Average Messages per Session: ${analytics.averageMessagesPerSession}
Engagement Score: ${analytics.engagementScore}%
Last Active: ${new Date(analytics.lastActiveTime).toLocaleString()}

TOPIC FREQUENCY
---------------
${
  Object.entries(analytics.topicFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([topic, count]) => `${topic}: ${count} messages`)
    .join('\n')
}

INSIGHTS
--------
- Your engagement level is ${
        analytics.engagementScore > 75
          ? 'very high'
          : analytics.engagementScore > 50
            ? 'moderate'
            : analytics.engagementScore > 25
              ? 'low'
              : 'minimal'
      }
- You have discussed ${Object.keys(analytics.topicFrequency).length} different topics
- Average conversation length: ${analytics.averageMessagesPerSession} messages
`;

      // Create blob and download
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Analytics exported as text file');
    } catch (error) {
      console.error('Error exporting text:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
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

          {/* Export Buttons */}
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium">Export Analytics</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportToCSV}
                disabled={isExporting}
                className="flex-1 h-8 text-xs gap-1"
              >
                <Download className="h-3 w-3" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex-1 h-8 text-xs gap-1"
              >
                <FileText className="h-3 w-3" />
                Text
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
