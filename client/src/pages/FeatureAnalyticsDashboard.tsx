import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Zap, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function FeatureAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Analytics report exported as PDF');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const metrics = {
    completionRate: 0.78,
    engagementScore: 0.82,
    dayOneRetention: 0.85,
    day30Retention: 0.58,
  };

  const features = [
    {
      name: 'Voice Commands',
      usageCount: 156,
      successRate: 0.94,
      avgDuration: 2.3,
      trend: 'up',
    },
    {
      name: 'Batch Processing',
      usageCount: 89,
      successRate: 0.91,
      avgDuration: 45.2,
      trend: 'up',
    },
    {
      name: 'AI Storyboarding',
      usageCount: 34,
      successRate: 0.88,
      avgDuration: 120.5,
      trend: 'stable',
    },
    {
      name: 'Notifications',
      usageCount: 234,
      successRate: 0.99,
      avgDuration: 0.5,
      trend: 'up',
    },
  ];

  const onboardingSteps = [
    { step: 1, name: 'Welcome', completion: 1.0, avgTime: 45 },
    { step: 2, name: 'Voice Commands', completion: 0.95, avgTime: 180 },
    { step: 3, name: 'Batch Processing', completion: 0.87, avgTime: 240 },
    { step: 4, name: 'AI Storyboarding', completion: 0.82, avgTime: 300 },
    { step: 5, name: 'Notifications', completion: 0.75, avgTime: 120 },
    { step: 6, name: 'Templates', completion: 0.68, avgTime: 360 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Feature Analytics</h1>
          <p className="text-slate-600 mt-2">Track feature adoption, user engagement, and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            onClick={handleExportReport}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Onboarding Completion</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {(metrics.completionRate * 100).toFixed(0)}%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Engagement Score</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {(metrics.engagementScore * 100).toFixed(0)}%
                </p>
              </div>
              <Zap className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Day 1 Retention</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {(metrics.dayOneRetention * 100).toFixed(0)}%
                </p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Day 30 Retention</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {(metrics.day30Retention * 100).toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Progress */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>User completion rate by onboarding step</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step) => (
              <div key={step.step}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{step.name}</p>
                    <p className="text-sm text-slate-600">Avg time: {step.avgTime}s</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {(step.completion * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${step.completion * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
          <CardDescription>Usage statistics and success rates by feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.name} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{feature.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {feature.trend === 'up' ? '↑' : '→'} {feature.trend}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{feature.usageCount} uses</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Success Rate</p>
                    <p className="font-semibold text-slate-900">
                      {(feature.successRate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Avg Duration</p>
                    <p className="font-semibold text-slate-900">{feature.avgDuration.toFixed(1)}s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Discovery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Discovered Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Voice Commands', date: '30 days ago' },
                { name: 'Batch Processing', date: '25 days ago' },
                { name: 'AI Storyboarding', date: '20 days ago' },
              ].map((feature) => (
                <div key={feature.name} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm text-slate-900">{feature.name}</span>
                  <span className="text-xs text-slate-600">{feature.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Undiscovered Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Advanced Webhooks', 'Custom Templates', 'API Integration'].map((feature) => (
                <div key={feature} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">{feature}</span>
                  <Badge variant="outline" className="text-xs">
                    Not used
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Platform performance and reliability metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Page Load Time</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">1.2s</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">API Response Time</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">0.45s</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">2%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Uptime</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">99.99%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-lg bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>• Encourage users to explore AI Storyboarding (currently 82% completion)</li>
            <li>• Promote advanced webhook configurations to power users</li>
            <li>• Create tutorial content for Custom Templates feature</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
