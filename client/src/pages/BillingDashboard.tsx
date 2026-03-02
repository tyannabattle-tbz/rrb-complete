import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export function BillingDashboard() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch billing data
  const { data: plans } = trpc.admin.billing.getSubscriptionPlans.useQuery({});
  const { data: subscription } = trpc.admin.billing.getCurrentSubscription.useQuery({});
  const { data: usageStats } = trpc.admin.billing.getUsage.useQuery({});
  const { data: billingHistory } = trpc.admin.billing.getBillingHistory.useQuery({});

  const upgradeMutation = trpc.admin.billing.upgradeSubscription.useMutation();

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeMutation.mutateAsync({ planId, paymentMethod: "card" });
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
          {subscription && subscription.subscription ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={subscription.subscription.status === "active" ? "default" : "destructive"}>
                  {subscription.subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium">{subscription.subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing Cycle</p>
                <p className="font-medium">
                  {new Date(subscription.subscription.startDate).toLocaleDateString()} -{" "}
                  {new Date(subscription.subscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auto-Renew</p>
                <p className="font-medium">{subscription.subscription.autoRenew ? "Enabled" : "Disabled"}</p>
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
              {/* API Calls */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">API Calls</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.usage.apiCalls.used} / {usageStats.usage.apiCalls.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(usageStats.usage.apiCalls.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.usage.storage.used} GB / {usageStats.usage.storage.limit} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(usageStats.usage.storage.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Video Minutes */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Video Minutes</span>
                  <span className="text-sm text-gray-500">
                    {usageStats.usage.videoMinutes.used} / {usageStats.usage.videoMinutes.limit} minutes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(usageStats.usage.videoMinutes.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading usage statistics...</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade your subscription for more features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans?.plans?.map((plan: any) => (
              <div key={plan.id} className="border rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold">${plan.price}/mo</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {plan.requestsLimit} requests/month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    {(plan.storageLimit / 1024 / 1024 / 1024).toFixed(1)} GB storage
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={subscription?.subscription?.planId === plan.id}
                  className="w-full"
                >
                  {subscription?.subscription?.planId === plan.id ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory && billingHistory.invoices && billingHistory.invoices.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Invoice #{invoice.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${invoice.amount}</p>
                    <Badge
                      variant={invoice.status === "paid" ? "default" : "outline"}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No billing history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
