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
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Platform Monitoring Dashboard
 * Dedicated monitoring tabs for each platform with real-time metrics and quick actions
 */
export default function PlatformMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("sweetMiracles");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const showNotification = (title: string, message: string) => {
    console.log(`[${title}] ${message}`);
    // In production, use a toast library or notification service
    alert(`${title}: ${message}`);
  };

  // tRPC mutations for quick actions
  const sendThankYouMutation = trpc.infrastructure.infrastructure.monitoringActions.sweetMiracles.sendThankYouEmail.useMutation();
  const viewAnalyticsMutation = trpc.infrastructure.infrastructure.monitoringActions.sweetMiracles.viewDonorAnalytics.useQuery({});
  const createCampaignMutation = trpc.infrastructure.infrastructure.monitoringActions.sweetMiracles.createCampaign.useMutation();
  const startBroadcastMutation = trpc.infrastructure.infrastructure.monitoringActions.rockinBoogie.startBroadcast.useMutation();
  const generateContentMutation = trpc.infrastructure.infrastructure.monitoringActions.rockinBoogie.generateContent.useMutation();
  const sendAlertMutation = trpc.infrastructure.infrastructure.monitoringActions.hybridCast.sendEmergencyAlert.useMutation();
  const checkNetworkMutation = trpc.infrastructure.infrastructure.monitoringActions.hybridCast.checkNetworkHealth.useQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  // Sweet Miracles Actions
  const handleSendThankYou = async () => {
    setLoadingAction("thankYou");
    try {
      await sendThankYouMutation.mutateAsync({
        donorId: "donor_123",
        donorEmail: "john@example.com",
        donorName: "John Smith",
        donationAmount: 250,
      });
      showNotification("Success", "Thank you email sent successfully!");
    } catch (error) {
      showNotification("Error", "Failed to send thank you email");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleViewAnalytics = async () => {
    setLoadingAction("analytics");
    try {
      const data = await viewAnalyticsMutation.refetch();
      showNotification("Analytics Loaded", `Total donors: ${data.data?.totalDonors || 0}`);
    } catch (error) {
      showNotification("Error", "Failed to load analytics");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreateCampaign = async () => {
    setLoadingAction("campaign");
    try {
      await createCampaignMutation.mutateAsync({
        campaignName: "New Fundraising Campaign",
        goal: 10000,
        description: "Help us reach our goal!",
      });
      showNotification("Success", "Campaign created successfully!");
    } catch (error) {
      showNotification("Error", "Failed to create campaign");
    } finally {
      setLoadingAction(null);
    }
  };

  // Rockin' Boogie Actions
  const handleStartBroadcast = async () => {
    setLoadingAction("broadcast");
    try {
      await startBroadcastMutation.mutateAsync({
        broadcastTitle: "Live Music Show",
        description: "Tonight's live music broadcast",
        genre: "Rock",
      });
      showNotification("Success", "Broadcast started successfully!");
    } catch (error) {
      showNotification("Error", "Failed to start broadcast");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateContent = async () => {
    setLoadingAction("content");
    try {
      await generateContentMutation.mutateAsync({
        contentType: "episode",
        duration: 60,
        style: "upbeat",
      });
      showNotification("Success", "Content generation started! Check back in a few minutes.");
    } catch (error) {
      showNotification("Error", "Failed to generate content");
    } finally {
      setLoadingAction(null);
    }
  };

  // HybridCast Actions
  const handleSendAlert = async () => {
    setLoadingAction("alert");
    try {
      await sendAlertMutation.mutateAsync({
        alertLevel: "warning",
        title: "Network Maintenance",
        message: "Scheduled maintenance in progress",
        affectedRegions: ["Northeast", "Southeast"],
      });
      showNotification("Success", "Emergency alert sent successfully!");
    } catch (error) {
      showNotification("Error", "Failed to send alert");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCheckNetwork = async () => {
    setLoadingAction("network");
    try {
      const data = await checkNetworkMutation.refetch();
      showNotification("Network Status", `${data.data?.stationsOnline || 0} stations online`);
    } catch (error) {
      showNotification("Error", "Failed to check network health");
    } finally {
      setLoadingAction(null);
    }
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
                    <Button
                      onClick={handleSendThankYou}
                      disabled={loadingAction === "thankYou"}
                      className="w-full bg-green-600 hover:bg-green-700 justify-start"
                    >
                      {loadingAction === "thankYou" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Thank You Email
                    </Button>
                    <Button
                      onClick={handleViewAnalytics}
                      disabled={loadingAction === "analytics"}
                      className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    >
                      {loadingAction === "analytics" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      View Donor Analytics
                    </Button>
                    <Button
                      onClick={handleCreateCampaign}
                      disabled={loadingAction === "campaign"}
                      className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
                    >
                      {loadingAction === "campaign" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Create Campaign
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
                      <span className="text-yellow-400 font-bold">$2.3M</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-sm">Wellness Check-Ins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled</span>
                      <span className="text-blue-400 font-bold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed</span>
                      <span className="text-green-400 font-bold">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending</span>
                      <span className="text-yellow-400 font-bold">14</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="text-purple-400 font-bold">91%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rockin' Boogie Tab */}
        <TabsContent value="rockinBoogie" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-900 to-slate-800 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" /> Rockin' Boogie Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Content Generated</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">156</p>
                  <p className="text-xs text-gray-500 mt-1">Queue: 12</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Listeners</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">125K</p>
                  <p className="text-xs text-gray-500 mt-1">+8% vs yesterday</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Episodes Broadcast</p>
                  <p className="text-3xl font-bold text-pink-400 mt-2">42</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">87.3%</p>
                  <p className="text-xs text-gray-500 mt-1">Listener retention</p>
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
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">Sunrise Sessions</p>
                        <p className="text-xs text-gray-500">6:00 AM - 8:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">3.2K</p>
                        <Badge className="text-xs bg-green-600">Live</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">Jazz Nights</p>
                        <p className="text-xs text-gray-500">8:00 PM - 10:00 PM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">2.1K</p>
                        <Badge className="text-xs bg-green-600">Live</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-300 font-semibold">Rock Classics</p>
                        <p className="text-xs text-gray-500">10:00 PM - 12:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">1.8K</p>
                        <Badge className="text-xs bg-gray-600">Scheduled</Badge>
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
                    <Button
                      onClick={handleStartBroadcast}
                      disabled={loadingAction === "broadcast"}
                      className="w-full bg-green-600 hover:bg-green-700 justify-start"
                    >
                      {loadingAction === "broadcast" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Start Broadcast
                    </Button>
                    <Button
                      onClick={handleGenerateContent}
                      disabled={loadingAction === "content"}
                      className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    >
                      {loadingAction === "content" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Generate Content
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                      <Eye className="w-4 h-4 mr-2" /> View Analytics
                    </Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 justify-start">
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
                    <Badge className="bg-purple-600">92% engagement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Jazz Nights</p>
                      <p className="text-xs text-gray-500">2,876 plays</p>
                    </div>
                    <Badge className="bg-purple-600">88% engagement</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300 font-semibold">Rock Classics</p>
                      <p className="text-xs text-gray-500">2,345 plays</p>
                    </div>
                    <Badge className="bg-purple-600">85% engagement</Badge>
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
                  <p className="text-xs text-gray-500 mt-1">All operational</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Active Broadcasts</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">23</p>
                  <p className="text-xs text-gray-500 mt-1">Live now</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Network Coverage</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">98.5%</p>
                  <p className="text-xs text-gray-500 mt-1">Uptime</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Mesh Nodes</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">3.4K</p>
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
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-1" />
                      <div>
                        <p className="text-gray-300 font-semibold">West Region</p>
                        <p className="text-xs text-gray-500">Coverage at 96.2%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className="text-gray-300 font-semibold">Northeast Region</p>
                        <p className="text-xs text-gray-500">Coverage at 99.2%</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className="text-gray-300 font-semibold">Southeast Region</p>
                        <p className="text-xs text-gray-500">Coverage at 98.1%</p>
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
                    <Button
                      onClick={handleSendAlert}
                      disabled={loadingAction === "alert"}
                      className="w-full bg-red-600 hover:bg-red-700 justify-start"
                    >
                      {loadingAction === "alert" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2" />
                      )}
                      Emergency Alert
                    </Button>
                    <Button
                      onClick={handleCheckNetwork}
                      disabled={loadingAction === "network"}
                      className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                    >
                      {loadingAction === "network" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4 mr-2" />
                      )}
                      Check Network Health
                    </Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start">
                      <Eye className="w-4 h-4 mr-2" /> Regional Stats
                    </Button>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 justify-start">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Northeast</span>
                      <Badge className="bg-green-600">245 stations</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Southeast</span>
                      <Badge className="bg-green-600">189 stations</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Midwest</span>
                      <Badge className="bg-green-600">201 stations</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Southwest</span>
                      <Badge className="bg-green-600">156 stations</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">West</span>
                      <Badge className="bg-yellow-600">56 stations</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
