import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export const EngagementDashboard: React.FC<{ stationId: number }> = ({ stationId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Fetch data
  const { data: metrics } = trpc.engagementWebhooks.getRealTimeMetrics.useQuery({ stationId });
  const { data: aggregated } = trpc.engagementWebhooks.getAggregatedMetrics.useQuery({ stationId });
  const { data: alerts } = trpc.engagementWebhooks.getAnomalyAlerts.useQuery({ stationId });
  const { data: comparison } = trpc.engagementWebhooks.getPlatformComparison.useQuery({ stationId });
  const { data: trends } = trpc.engagementWebhooks.getEngagementTrend.useQuery({
    stationId,
    platform: selectedPlatform === 'all' ? 'twitter' : selectedPlatform,
    days: 7,
  });

  const acknowledgeAlert = trpc.engagementWebhooks.acknowledgeAlert.useMutation();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Engagement Analytics</h2>
        <p className="text-muted-foreground">Real-time metrics across all platforms</p>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.severity === 'high'
                  ? 'border-l-red-500 bg-red-500/5'
                  : alert.severity === 'medium'
                    ? 'border-l-yellow-500 bg-yellow-500/5'
                    : 'border-l-blue-500 bg-blue-500/5'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {alert.severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                    {alert.severity === 'medium' && <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                    {alert.severity === 'low' && <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
                    <div>
                      <p className="font-semibold text-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acknowledgeAlert.mutate({ alertId: alert.id! })}
                    disabled={alert.acknowledged}
                  >
                    {alert.acknowledged ? <CheckCircle className="w-4 h-4" /> : 'Acknowledge'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Aggregated Metrics */}
      {aggregated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(aggregated.totalLikes || 0) + (aggregated.totalShares || 0) + (aggregated.totalComments || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Likes + Shares + Comments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{(aggregated.totalViews || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {((aggregated.averageEngagementRate || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average across platforms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Comparison */}
      {comparison && comparison.platforms && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Engagement metrics by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.platforms.map((platform: any) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize text-foreground">{platform.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {platform.engagementRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{platform.engagement.toLocaleString()} engagements</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((platform.engagement / 5000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Metrics by Platform</CardTitle>
            <CardDescription>Last updated {new Date().toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.platform} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <p className="font-semibold capitalize text-foreground">{metric.platform}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Likes</p>
                      <p className="font-medium text-foreground">{metric.likes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shares</p>
                      <p className="font-medium text-foreground">{metric.shares.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Comments</p>
                      <p className="font-medium text-foreground">{metric.comments.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium text-foreground">{metric.views.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground text-xs">Followers</p>
                    <p className="font-medium text-foreground">{metric.followers.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Trend */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              7-Day Engagement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.map((point) => (
                <div key={point.date} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{point.date}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-primary h-2 rounded transition-all"
                        style={{
                          width: `${Math.min((point.engagement / 2000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-16 text-right">
                      {point.engagement.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngagementDashboard;
