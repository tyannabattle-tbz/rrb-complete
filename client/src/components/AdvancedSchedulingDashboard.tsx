import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export const AdvancedSchedulingDashboard: React.FC<{ stationId: number }> = ({ stationId }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'schedule' | 'ab-tests' | 'analytics'>('schedule');

  // Fetch data
  const { data: templates } = trpc.advancedScheduling.getUserTemplates.useQuery();
  const { data: scheduledPosts } = trpc.advancedScheduling.getScheduledPosts.useQuery({ stationId });
  const { data: abTests } = trpc.advancedScheduling.getActiveABTests.useQuery();
  const { data: analytics } = trpc.advancedScheduling.getSchedulingAnalytics.useQuery();
  const { data: optimalTimes } = trpc.advancedScheduling.getOptimalPostingTimes.useQuery({
    stationId,
    contentType: 'mixed',
  });
  const { data: recommendations } = trpc.advancedScheduling.getContentRecommendations.useQuery({ stationId });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Advanced Scheduling</h2>
          <p className="text-muted-foreground">AI-powered posting optimization & A/B testing</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['schedule', 'templates', 'ab-tests', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'schedule' && 'Schedule'}
            {tab === 'templates' && 'Templates'}
            {tab === 'ab-tests' && 'A/B Tests'}
            {tab === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Optimal Times Card */}
          {optimalTimes && (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Optimal Posting Times
                </CardTitle>
                <CardDescription>AI-recommended times for maximum engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {optimalTimes.times.map((time, idx) => (
                    <div key={idx} className="p-4 bg-background rounded-lg border border-border">
                      <p className="font-semibold text-foreground">
                        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {optimalTimes.confidence * 100}% confidence
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scheduled Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
              <CardDescription>{scheduledPosts?.length || 0} posts scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledPosts?.map((post) => (
                  <div key={post.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{post.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      <div className="flex gap-2 mt-2">
                        {post.platforms.map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(post.scheduledTime).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduledTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <Badge
                        variant={post.status === 'scheduled' ? 'default' : 'secondary'}
                        className="mt-2"
                      >
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Recommended Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <Badge>{template.contentType}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{template.contentBody}</p>
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'ab-tests' && (
        <div className="space-y-4">
          {abTests?.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{test.testName}</CardTitle>
                    <CardDescription>Station {test.stationId}</CardDescription>
                  </div>
                  <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>{test.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Control</p>
                    <p className="text-sm text-muted-foreground">{test.controlVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Test</p>
                    <p className="text-sm text-muted-foreground">{test.testVersion}</p>
                  </div>
                </div>

                {test.results && (
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Control Engagement:</span>
                      <span className="font-medium">{test.results.controlEngagement}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Test Engagement:</span>
                      <span className="font-medium">{test.results.testEngagement}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span>Winner:</span>
                      <Badge variant={test.results.winner === 'test' ? 'default' : 'secondary'}>
                        {test.results.winner === 'tie' ? 'Tie' : test.results.winner.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Posts Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Scheduled</span>
                      <span className="font-semibold">{analytics.totalScheduledPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Published</span>
                      <span className="font-semibold text-green-600">{analytics.publishedPosts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Failed</span>
                      <span className="font-semibold text-red-600">{analytics.failedPosts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Engagement</span>
                      <span className="font-semibold">{analytics.averageEngagement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Time</span>
                      <span className="font-semibold">{analytics.topPerformingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Top Content</span>
                      <span className="font-semibold capitalize">{analytics.topPerformingContentType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
                      <div key={platform} className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground capitalize">{platform}</p>
                        <p className="text-2xl font-bold text-foreground">{count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSchedulingDashboard;
