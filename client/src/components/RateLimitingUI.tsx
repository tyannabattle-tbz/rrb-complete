import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RateLimitStatus {
  used: number;
  limit: number;
  resetTime: Date;
  percentage: number;
  status: "ok" | "warning" | "critical";
}

interface RateLimitingUIProps {
  hourly: RateLimitStatus;
  daily: RateLimitStatus;
  monthly: RateLimitStatus;
  currentUsage: {
    tokensPerMinute: number;
    requestsPerMinute: number;
  };
}

export function RateLimitingUI({
  hourly,
  daily,
  monthly,
  currentUsage,
}: RateLimitingUIProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "critical":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
      case "critical":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-50 dark:bg-gray-950";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const QuotaCard = ({
    title,
    quota,
    icon: Icon,
  }: {
    title: string;
    quota: RateLimitStatus;
    icon: React.ReactNode;
  }) => (
    <Card className={`border ${getStatusBg(quota.status)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon}
          {title}
        </CardTitle>
        <CardDescription>
          {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} used
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className={`font-semibold ${getStatusColor(quota.status)}`}>
              {quota.percentage}%
            </span>
            <span className="text-muted-foreground text-xs">
              Resets {quota.resetTime.toLocaleTimeString()}
            </span>
          </div>
          <Progress value={quota.percentage} className="h-2" />
        </div>

        {quota.status === "warning" && (
          <Alert className="py-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
              Approaching limit. Consider optimizing your requests.
            </AlertDescription>
          </Alert>
        )}

        {quota.status === "critical" && (
          <Alert className="py-2 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-xs text-red-800 dark:text-red-200">
              Quota nearly exhausted. Requests may be throttled.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rate Limiting & Quotas</h2>
        <p className="text-muted-foreground">Monitor your API usage and rate limits</p>
      </div>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Current Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-muted-foreground">Tokens/Minute</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentUsage.tokensPerMinute.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-muted-foreground">Requests/Minute</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentUsage.requestsPerMinute}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuotaCard
          title="Hourly Limit"
          quota={hourly}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <QuotaCard
          title="Daily Limit"
          quota={daily}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <QuotaCard
          title="Monthly Limit"
          quota={monthly}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">✓</div>
            <div>
              <p className="font-medium text-sm">Batch Requests</p>
              <p className="text-xs text-muted-foreground">Combine multiple requests to reduce API calls</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-green-600 dark:text-green-400 flex-shrink-0">✓</div>
            <div>
              <p className="font-medium text-sm">Use Caching</p>
              <p className="text-xs text-muted-foreground">Cache frequently accessed data locally</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="text-purple-600 dark:text-purple-400 flex-shrink-0">✓</div>
            <div>
              <p className="font-medium text-sm">Upgrade Plan</p>
              <p className="text-xs text-muted-foreground">Higher tiers include increased rate limits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quota History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trend</CardTitle>
          <CardDescription>Last 7 days average usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
              const usage = Math.floor(Math.random() * 100);
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium text-muted-foreground">{day}</span>
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(usage)} transition-all`}
                      style={{ width: `${usage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">{usage}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
