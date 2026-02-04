"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  Clock,
  CheckCircle,
  Heart,
  Radio,
  RefreshCw,
  Download,
  Eye,
  Send,
  Play,
} from "lucide-react";

/**
 * Platform Monitoring Dashboard
 * Dedicated monitoring tabs for each platform with real-time metrics and quick actions
 */
export default function PlatformMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("sweetMiracles");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Platform Monitoring</h1>
            <p className="text-gray-400">Real-time monitoring and quick controls for all platforms</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="sweetMiracles" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>Sweet Miracles</span>
          </TabsTrigger>
          <TabsTrigger value="rockinBoogie" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            <span>Rockin' Boogie</span>
          </TabsTrigger>
          <TabsTrigger value="hybridCast" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>HybridCast</span>
          </TabsTrigger>
        </TabsList>

        {/* Sweet Miracles Tab */}
        <TabsContent value="sweetMiracles" className="space-y-4">
          <Card className="bg-gradient-to-br from-green-900 to-slate-800 border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-400" /> Sweet Miracles Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Donations Today</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">45</p>
                  <p className="text-xs text-gray-500 mt-1">+12% vs yesterday</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Donors</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">2,847</p>
                  <p className="text-xs text-gray-500 mt-1">Active: 342</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Raised</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">$847K</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Donation</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">$298</p>
                  <p className="text-xs text-gray-500 mt-1">Per donor</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Donations */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Donations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">John Smith</p>
                        <p className="text-xs text-gray-500">2 min ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">$250</p>
                        <Badge className="text-xs">Platinum</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">Sarah Johnson</p>
                        <p className="text-xs text-gray-500">5 min ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">$100</p>
                        <Badge className="text-xs">Gold</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">Mike Davis</p>
                        <p className="text-xs text-gray-500">12 min ago</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 font-bold">$50</p>
                        <Badge className="text-xs">Silver</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700 justify-start">
                      <Send className="w-4 h-4 mr-2" /> Send Thank You Email
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                      <Eye className="w-4 h-4 mr-2" /> View Donor Analytics
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                      <Zap className="w-4 h-4 mr-2" /> Create Campaign
                    </Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Manage Alerts
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Grants & Wellness */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Grant Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discovered</span>
                      <span className="text-purple-400 font-bold">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Applied</span>
                      <span className="text-blue-400 font-bold">34</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Approved</span>
                      <span className="text-green-400 font-bold">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Value</span>
                      <span className="text-yellow-400 font-bold">$450K</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Wellness Check-Ins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700 justify-start text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" /> Schedule Check-In
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start text-sm">
                      <Activity className="w-4 h-4 mr-2" /> View Participants
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rockin' Boogie Tab */}
        <TabsContent value="rockinBoogie" className="space-y-4">
          <Card className="bg-gradient-to-br from-orange-900 to-slate-800 border-orange-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-orange-400" /> Rockin' Boogie Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Content Generated</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">156</p>
                  <p className="text-xs text-gray-500 mt-1">7 in queue</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Listeners</p>
                  <p className="text-3xl font-bold text-pink-400 mt-2">125K</p>
                  <p className="text-xs text-gray-500 mt-1">Right now</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Episodes Broadcast</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">42</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">87.3%</p>
                  <p className="text-xs text-gray-500 mt-1">Retention rate</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Live Broadcasts */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Live Broadcasts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-300 font-semibold">Morning Vibes</p>
                        <Badge className="bg-red-500">LIVE</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">15,234 listeners • 2h 30m</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-300 font-semibold">Afternoon Mix</p>
                        <Badge className="bg-red-500">LIVE</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">12,456 listeners • 3h 15m</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 justify-start">
                      <Play className="w-4 h-4 mr-2" /> Start Broadcast
                    </Button>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 justify-start">
                      <Zap className="w-4 h-4 mr-2" /> Generate Content
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" /> View Analytics
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                      <Clock className="w-4 h-4 mr-2" /> Schedule Episode
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Top Content */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-sm">Top Performing Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Sunrise Sessions</p>
                      <p className="text-xs text-gray-500">3,421 plays</p>
                    </div>
                    <Badge className="bg-green-600">92% engagement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Jazz Nights</p>
                      <p className="text-xs text-gray-500">2,876 plays</p>
                    </div>
                    <Badge className="bg-green-600">88% engagement</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HybridCast Tab */}
        <TabsContent value="hybridCast" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-900 to-slate-800 border-blue-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> HybridCast Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Stations Online</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">847</p>
                  <p className="text-xs text-gray-500 mt-1">156 regions</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Broadcasts</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-2">23</p>
                  <p className="text-xs text-gray-500 mt-1">Live now</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Network Coverage</p>
                  <p className="text-3xl font-bold text-teal-400 mt-2">98.5%</p>
                  <p className="text-xs text-gray-500 mt-1">Uptime</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Mesh Nodes</p>
                  <p className="text-3xl font-bold text-indigo-400 mt-2">3,421</p>
                  <p className="text-xs text-gray-500 mt-1">Connected</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Critical Alerts */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Critical Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-300 font-semibold">Northeast Power Outage</p>
                        <Badge className="bg-red-500">Critical</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">3 zones affected • 5 min ago</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-300 font-semibold">Southeast Latency High</p>
                        <Badge className="bg-yellow-500">Warning</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Network latency • 12 min ago</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Emergency Alert
                    </Button>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 justify-start">
                      <Activity className="w-4 h-4 mr-2" /> Network Health
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" /> Regional Stats
                    </Button>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 justify-start">
                      <Zap className="w-4 h-4 mr-2" /> Mesh Config
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Status */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-sm">Regional Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Northeast</p>
                      <p className="text-xs text-gray-500">245 stations</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600">99.2%</Badge>
                      <p className="text-xs text-gray-500 mt-1">coverage</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Southeast</p>
                      <p className="text-xs text-gray-500">189 stations</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600">98.1%</Badge>
                      <p className="text-xs text-gray-500 mt-1">coverage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">All Monitoring Systems Operational</span>
          </div>
          <span className="text-sm text-gray-500">Auto-refresh: Every 5 seconds</span>
        </div>
      </div>
    </div>
  );
}
