import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Clock, Zap } from "lucide-react";

export function RateLimitingDashboard() {
  const [quotaMetrics, setQuotaMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotaMetrics();
    const interval = setInterval(fetchQuotaMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuotaMetrics = async () => {
    try {
      // Mock data for demonstration
      setQuotaMetrics({
        minuteUsage: 45,
        hourUsage: 650,
        dayUsage: 5200,
        percentageUsed: 52,
        resetTime: new Date(Date.now() + 60000),
        throttled: false,
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch quota metrics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading quota information...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">API Rate Limiting Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your API usage and quota consumption</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Minute Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaMetrics?.minuteUsage || 0}</div>
            <p className="text-xs text-gray-600">of {quotaMetrics?.requestsPerMinute || 60} requests</p>
            <Progress value={(quotaMetrics?.minuteUsage / quotaMetrics?.requestsPerMinute) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Hour Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaMetrics?.hourUsage || 0}</div>
            <p className="text-xs text-gray-600">of {quotaMetrics?.requestsPerHour || 1000} requests</p>
            <Progress value={(quotaMetrics?.hourUsage / quotaMetrics?.requestsPerHour) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Day Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotaMetrics?.dayUsage || 0}</div>
            <p className="text-xs text-gray-600">of {quotaMetrics?.requestsPerDay || 10000} requests</p>
            <Progress value={(quotaMetrics?.dayUsage / quotaMetrics?.requestsPerDay) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {quotaMetrics?.throttled && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Rate Limit Exceeded
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600">
            You have exceeded your rate limit. Requests will be throttled until your quota resets.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quota Reset Information</CardTitle>
          <CardDescription>Your quotas reset on the following schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Next Reset:</span>
            <span className="font-mono text-sm">{quotaMetrics?.resetTime?.toLocaleTimeString()}</span>
          </div>
          <Button variant="outline" className="w-full">
            View Detailed Usage History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
