import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";

export function UsageQuotasUI() {
  const { data: quota, isLoading } = trpc.admin.usageQuotas.getQuota.useQuery();
  const { data: history } = trpc.admin.usageQuotas.getUsageHistory.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading quota information...</div>;
  }

  const percentageUsed = quota?.percentageUsed || 0;
  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 75) return "bg-yellow-500";
    if (percentage < 90) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = (percentage: number) => {
    if (percentage < 50) return "Good";
    if (percentage < 75) return "Moderate";
    if (percentage < 90) return "High";
    return "Critical";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Monthly Token Usage
          </CardTitle>
          <CardDescription>
            Track your token consumption and quota limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Tokens Used</span>
              <span className="text-sm font-medium">
                {quota?.tokensUsed?.toLocaleString()} / {quota?.tokensLimit?.toLocaleString()}
              </span>
            </div>
            <Progress
              value={percentageUsed}
              className="h-3"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{percentageUsed}% used</span>
              <span className={`font-semibold ${getStatusColor(percentageUsed).replace('bg-', 'text-')}`}>
                {getStatusText(percentageUsed)}
              </span>
            </div>
          </div>

          {percentageUsed >= 90 && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Critical Usage Level</p>
                <p>You're using {percentageUsed}% of your monthly quota. Consider upgrading your plan.</p>
              </div>
            </div>
          )}

          {percentageUsed >= 75 && percentageUsed < 90 && (
            <div className="flex gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">High Usage Level</p>
                <p>You're using {percentageUsed}% of your monthly quota. Monitor your usage closely.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Tokens Remaining</p>
              <p className="text-lg font-semibold">
                {quota?.tokensRemaining?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Reset Date</p>
              <p className="text-sm font-semibold">
                {quota?.billingCycleEnd ? new Date(quota.billingCycleEnd).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Trend
          </CardTitle>
          <CardDescription>
            Your token usage over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-4">
            <div className="flex items-end gap-1 h-32 justify-center">
              {[35, 52, 45, 68, 72, 58, 80, 65, 90, 75, 85, 92].map((h, i) => (
                <div key={i} className="w-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:from-purple-500 hover:to-purple-300" style={{ height: `${h}%` }} title={`Period ${i + 1}: ${h}%`} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
