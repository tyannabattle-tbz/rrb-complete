import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Heart, Gift, TrendingUp, DollarSign, Users, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SweetMiraclesDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [donationAmount, setDonationAmount] = useState("50");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch donor data
  const { data: donors } = trpc.sweetMiraclesDonors.list.useQuery();
  const { data: donorStats } = trpc.sweetMiraclesDonors.getStats.useQuery();

  // Fetch grant data
  const { data: grants } = trpc.sweetMiraclesGrants.list.useQuery();
  const { data: grantStats } = trpc.sweetMiraclesGrants.getStats.useQuery();

  // Fetch alerts
  const { data: alerts } = trpc.sweetMiraclesAlerts.list.useQuery();
  const { data: alertStats } = trpc.sweetMiraclesAlerts.getStats.useQuery();

  // Stripe integration
  const createCheckoutSession = trpc.stripePayments.createCheckoutSession.useMutation();

  const handleDonate = async () => {
    try {
      setIsProcessing(true);
      const result = await createCheckoutSession.mutateAsync({
        amount: Math.round(parseFloat(donationAmount) * 100),
        currency: "usd",
        donorName: "Sweet Miracles Donor",
        donorEmail: "donor@example.com",
        donorTier: "bronze",
        campaignId: "general",
        isRecurring: false,
        successUrl: `${window.location.origin}/sweet-miracles?status=success`,
        cancelUrl: `${window.location.origin}/sweet-miracles?status=cancel`,
      });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank");
      }
    } catch (error) {
      console.error("Donation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-500" />
            Sweet Miracles
          </h1>
          <p className="text-muted-foreground mt-2 italic">"A Voice for the Voiceless" - Supporting Senior & Elderly Advocacy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">New Campaign</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${donorStats?.totalRaised?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">From {donorStats?.totalDonors || 0} donors</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorStats?.activeDonors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Engaged supporters</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Available Grants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grantStats?.totalAvailableGrants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">${grantStats?.totalFundingAvailable?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertStats?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Emergency broadcasts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="grants">Grants</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Donor Distribution</CardTitle>
                <CardDescription>Breakdown by tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {donorStats?.donorsByTier && (
                  <>
                    <div className="flex justify-between">
                      <span>Platinum</span>
                      <Badge variant="default">{donorStats.donorsByTier.platinum}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Gold</span>
                      <Badge variant="secondary">{donorStats.donorsByTier.gold}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Silver</span>
                      <Badge variant="outline">{donorStats.donorsByTier.silver}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bronze</span>
                      <Badge variant="outline">{donorStats.donorsByTier.bronze}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Status</CardTitle>
                <CardDescription>This month's progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Target: $50,000</span>
                    <span className="text-sm font-bold">${donorStats?.monthlyTrend?.[1]?.amount?.toLocaleString() || "0"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "37%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Donors Tab */}
        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Your most generous supporters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donors?.slice(0, 5).map((donor: any) => (
                  <div key={donor.donorId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{donor.name}</p>
                      <p className="text-sm text-muted-foreground">{donor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${donor.totalDonated?.toLocaleString() || "0"}</p>
                      <Badge variant="outline" className="mt-1">{donor.donorTier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grants Tab */}
        <TabsContent value="grants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Match Grants</CardTitle>
              <CardDescription>Best opportunities for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grants?.slice(0, 3).map((grant: any) => (
                  <div key={grant.grantId} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{grant.title}</p>
                        <p className="text-sm text-muted-foreground">{grant.organization}</p>
                      </div>
                      <Badge variant="default" className="ml-2">{Math.round(grant.matchScore * 100)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">${grant.amount?.toLocaleString() || "0"}</span>
                      <span className="text-xs text-muted-foreground">Deadline: {grant.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Active Emergency Alerts
              </CardTitle>
              <CardDescription>Current broadcasts via Rockin' Rockin' Boogie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts?.slice(0, 5).map((alert: any) => (
                  <div key={alert.id} className="p-3 border-l-4 border-red-600 bg-red-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                      <Badge variant="destructive">{alert.severity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
