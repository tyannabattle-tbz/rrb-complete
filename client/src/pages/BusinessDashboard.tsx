import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Share2, DollarSign } from 'lucide-react';

export function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('wealth');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Canryn Production Business Hub</h1>
          <p className="text-slate-300">Marketing, Revenue Streams, Social Integration & Wealth Building</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="wealth" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Wealth Building
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <Target className="w-4 h-4" /> Marketing
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Social
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Branding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wealth">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Monthly Revenue</p>
                    <p className="text-white text-3xl font-bold">$180K</p>
                    <p className="text-green-400 text-sm mt-2">+18% growth</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Annual Projection</p>
                    <p className="text-white text-3xl font-bold">$2.3M</p>
                    <p className="text-green-400 text-sm mt-2">+25% YoY</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Total Assets</p>
                    <p className="text-white text-3xl font-bold">$5.2M</p>
                    <p className="text-blue-400 text-sm mt-2">5 revenue streams</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Net Worth</p>
                    <p className="text-white text-3xl font-bold">$7.5M</p>
                    <p className="text-purple-400 text-sm mt-2">Projected</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Premium Subscriptions', revenue: '$50K', growth: '+15%' },
                    { name: 'Template Marketplace', revenue: '$25K', growth: '+25%' },
                    { name: 'API Licensing', revenue: '$30K', growth: '+20%' },
                    { name: 'Enterprise Partnerships', revenue: '$40K', growth: '+30%' },
                    { name: 'Creator Revenue Share', revenue: '$35K', growth: '+18%' },
                  ].map((stream, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-700 p-3 rounded">
                      <span className="text-white">{stream.name}</span>
                      <div className="text-right">
                        <p className="text-white font-semibold">{stream.revenue}</p>
                        <p className="text-green-400 text-sm">{stream.growth}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketing">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Active Campaigns</p>
                    <p className="text-white text-3xl font-bold">12</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Total Reach</p>
                    <p className="text-white text-3xl font-bold">2.5M</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <p className="text-slate-400 text-sm">Avg ROI</p>
                    <p className="text-white text-3xl font-bold">340%</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Campaign Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['Social Media', 'Email Marketing', 'Organic Search', 'Paid Advertising', 'Partnerships'].map((channel, i) => (
                    <div key={i} className="bg-slate-700 p-3 rounded text-white">{channel}</div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Connected Platforms</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {[
                    { platform: 'Twitter', followers: '250K', verified: true },
                    { platform: 'Instagram', followers: '180K', verified: true },
                    { platform: 'TikTok', followers: '500K', verified: true },
                    { platform: 'YouTube', followers: '120K', verified: true },
                    { platform: 'LinkedIn', followers: '95K', verified: true },
                    { platform: 'Facebook', followers: '75K', verified: false },
                  ].map((account, i) => (
                    <div key={i} className="bg-slate-700 p-4 rounded">
                      <h3 className="text-white font-semibold">{account.platform}</h3>
                      <p className="text-slate-400 text-sm">{account.followers} followers</p>
                      <p className="text-green-400 text-xs mt-2">{account.verified ? '✓ Verified' : 'Pending'}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between bg-slate-700 p-3 rounded">
                    <span className="text-white">Total Likes</span>
                    <span className="text-white font-bold">1.2M</span>
                  </div>
                  <div className="flex justify-between bg-slate-700 p-3 rounded">
                    <span className="text-white">Total Shares</span>
                    <span className="text-white font-bold">85K</span>
                  </div>
                  <div className="flex justify-between bg-slate-700 p-3 rounded">
                    <span className="text-white">Total Comments</span>
                    <span className="text-white font-bold">320K</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="branding">
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Canryn Production Subsidiaries</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'QUMUS Engine', desc: 'Autonomous Orchestration' },
                    { name: 'Nexus', desc: 'Creator Collaboration Hub' },
                    { name: 'Forge', desc: 'AI Content Engine' },
                    { name: 'Atlas', desc: 'Distribution & Analytics' },
                  ].map((sub, i) => (
                    <div key={i} className="bg-slate-700 p-4 rounded">
                      <h3 className="text-white font-semibold">{sub.name}</h3>
                      <p className="text-slate-400 text-sm">{sub.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Brand Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['Logo Suite', 'Color Palette', 'Typography', 'Brand Guidelines', 'Templates'].map((asset, i) => (
                    <div key={i} className="bg-slate-700 p-3 rounded text-white flex justify-between">
                      <span>{asset}</span>
                      <span className="text-slate-400">v1.0</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
