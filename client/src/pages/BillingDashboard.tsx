import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export function BillingDashboard() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Fetch billing data
  const { data: tiers } = trpc.billing.getSubscriptionTiers.useQuery();
  const { data: subscription } = trpc.billing.getUserSubscription.useQuery();
  const { data: usageStats } = trpc.billing.getUsageStats.useQuery();
  const { data: alerts } = trpc.billing.getQuotaAlerts.useQuery();
  const { data: billingHistory } = trpc.billing.getBillingHistory.useQuery();

  const upgradeMutation = trpc.billing.upgradeSubscription.useMutation();

  const handleUpgrade = async (tierId: number) => {
    try {
      await upgradeMutation.mutateAsync({ tierId });
      alert("Subscription upgraded successfully!");
    } catch (error) {
      alert("Failed to upgrade subscription");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-500">Manage your subscription and monitor usage</p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="font-medium">
                  {new Date(subscription.billingCycleStart).toLocaleDateString()} -{" "}
                  {new Date(subscription.billingCycleEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto-Renew</p>
                <p className="font-medium">{subscription.autoRenew ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No active subscription</p>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Current billing cycle usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageStats ? (
            <div className="space-y-4">
              {/* Requests */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">API Requests</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.requestsUsed} / {usageStats.requestsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usageStats.requestsPercentage > 90 ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(usageStats.requestsPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Tokens */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tokens Used</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.tokensUsed} / {usageStats.tokensLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usageStats.tokensPercentage > 90 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(usageStats.tokensPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Sessions */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Sessions Created</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.sessionsCreated} / {usageStats.sessionsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usageStats.sessionsPercentage > 90 ? "bg-red-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${Math.min(usageStats.sessionsPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Cost */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Estimated Cost</span>
                  <span className="text-sm text-gray-500">
                    ${usageStats.costAccrued.toFixed(2)} / ${usageStats.costLimit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usageStats.costPercentage > 90 ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${Math.min(usageStats.costPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No usage data available</p>
          )}
        </CardContent>
      </Card>

      {/* Quota Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Quota Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">{alert.quotaType} quota at {alert.threshold}%</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Tiers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers?.map((tier: any) => (
            <Card key={tier.id} className={subscription?.tierId === tier.id ? "border-blue-500 border-2" : ""}>
              <CardHeader>
                <CardTitle>{tier.displayName}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">${tier.monthlyPrice}/mo</div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {tier.requestsPerMonth.toLocaleString()} requests/month
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {tier.maxTokensPerRequest.toLocaleString()} tokens/request
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {tier.maxConcurrentSessions} concurrent sessions
                  </p>
                </div>
                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={subscription?.tierId === tier.id}
                  className="w-full"
                >
                  {subscription?.tierId === tier.id ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {billingHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {billingHistory.invoices?.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.tier}</p>
                    <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
