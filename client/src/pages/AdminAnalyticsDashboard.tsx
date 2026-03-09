import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Zap, Download, RefreshCw } from "lucide-react";

export function AdminAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for analytics
  const analyticsData = {
    totalTokensUsed: 0,
    totalSessions: 342,
    activeUsers: 87,
    totalCost: 2450.50,
    tokensByModel: {
      "gpt-4-turbo": 650000,
      "gpt-3.5-turbo": 400000,
      "claude-3-opus": 200000,
    },
    sessionsByType: {
      "chat": 180,
      "analysis": 95,
      "coding": 67,
    },
    dailyTokens: [
      { date: "Jan 25", tokens: 150000 },
      { date: "Jan 26", tokens: 180000 },
      { date: "Jan 27", tokens: 165000 },
      { date: "Jan 28", tokens: 195000 },
      { date: "Jan 29", tokens: 210000 },
      { date: "Jan 30", tokens: 200000 },
      { date: "Jan 31", tokens: 150000 },
    ],
    userGrowth: [
      { date: "Week 1", users: 12 },
      { date: "Week 2", users: 28 },
      { date: "Week 3", users: 52 },
      { date: "Week 4", users: 87 },
    ],
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const csv = `Analytics Report - ${new Date().toISOString()}\n\n`;
    const data = `
Total Tokens Used,${analyticsData.totalTokensUsed}
Total Sessions,${analyticsData.totalSessions}
Active Users,${analyticsData.activeUsers}
Total Cost,$${analyticsData.totalCost}

Tokens by Model:
${Object.entries(analyticsData.tokensByModel).map(([model, tokens]) => `${model},${tokens}`).join("\n")}

Sessions by Type:
${Object.entries(analyticsData.sessionsByType).map(([type, count]) => `${type},${count}`).join("\n")}
    `;
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(csv + data));
    element.setAttribute("download", `analytics-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics</h1>
          <p className="text-muted-foreground">System-wide usage and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Total Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData.totalTokensUsed / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Connected users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Token Usage</CardTitle>
              <CardDescription>Tokens consumed over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.dailyTokens.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.tokens / 250000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{(day.tokens / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tokens by Model</CardTitle>
              <CardDescription>Token distribution across different models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.tokensByModel).map(([model, tokens]) => {
                  const percentage = (tokens / analyticsData.totalTokensUsed) * 100;
                  return (
                    <div key={model}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{model}</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{(tokens / 1000000).toFixed(2)}M tokens</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions by Type</CardTitle>
              <CardDescription>Session distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.sessionsByType).map(([type, count]) => {
                  const percentage = (count / analyticsData.totalSessions) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium capitalize">{type}</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{count} sessions</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user growth trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.userGrowth.map((week) => (
                  <div key={week.date} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{week.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(week.users / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{week.users} users</span>
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
