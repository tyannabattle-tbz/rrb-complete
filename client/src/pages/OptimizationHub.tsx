import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Zap, Bot, Brain, Palette } from 'lucide-react';

export function OptimizationHub() {
  const [activeTab, setActiveTab] = useState('streaming');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Qumus Optimization Hub</h1>
          <p className="text-slate-400">Advanced video streaming, analytics, AI bots, and intelligent assistants</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="streaming" className="flex items-center gap-2">
              <Play className="w-4 h-4" /> Streaming
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <Bot className="w-4 h-4" /> AI Bots
            </TabsTrigger>
            <TabsTrigger value="assistants" className="flex items-center gap-2">
              <Brain className="w-4 h-4" /> IA Assistants
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaming">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Video Streaming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Adaptive Quality</h3>
                    <p className="text-slate-400 text-sm">Automatically adjusts video quality based on network speed</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Real-time Metrics</h3>
                    <p className="text-slate-400 text-sm">Monitor bitrate, buffering, and performance in real-time</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Quality Switching</h3>
                    <p className="text-slate-400 text-sm">Seamless quality transitions (360p to 4K)</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Session Management</h3>
                    <p className="text-slate-400 text-sm">Track and manage multiple streaming sessions</p>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Streaming Session</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Widget Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Total Views</p>
                    <p className="text-white text-2xl font-bold">0</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Engagement Score</p>
                    <p className="text-white text-2xl font-bold">0%</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Completion Rate</p>
                    <p className="text-white text-2xl font-bold">0%</p>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">View Detailed Analytics</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bots">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Bots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Generator Bot</h3>
                    <p className="text-slate-400 text-sm">Autonomous video generation</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Optimizer Bot</h3>
                    <p className="text-slate-400 text-sm">Video quality and format optimization</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Analyzer Bot</h3>
                    <p className="text-slate-400 text-sm">Performance and engagement analysis</p>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Create New Bot</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistants">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">IA Assistants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Recommender</h3>
                    <p className="text-slate-400 text-sm">Smart recommendations for optimization</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Strategist</h3>
                    <p className="text-slate-400 text-sm">Strategic insights and planning</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Analyst</h3>
                    <p className="text-slate-400 text-sm">Deep data analysis and insights</p>
                  </div>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Recommendations</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Watermark Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Animated</h3>
                    <p className="text-slate-400 text-sm">10+ animated templates</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Gradient</h3>
                    <p className="text-slate-400 text-sm">8+ gradient templates</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Branded</h3>
                    <p className="text-slate-400 text-sm">5+ branded templates</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-white font-semibold">Premium</h3>
                    <p className="text-slate-400 text-sm">Exclusive premium designs</p>
                  </div>
                </div>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">Browse Templates</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
