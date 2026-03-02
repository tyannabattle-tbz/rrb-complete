import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Wallet, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EarningsDashboardProps {
  totalEarnings?: number;
  monthlyEarnings?: number;
  pendingBalance?: number;
  availableBalance?: number;
  stats?: {
    totalViews: number;
    totalReactions: number;
    totalShares: number;
    averageViewDuration: number;
    engagementRate: number;
  };
  earningsHistory?: Array<{
    month: string;
    earnings: number;
    views: number;
    reactions: number;
  }>;
  videoEarnings?: Array<{
    videoId: string;
    title: string;
    views: number;
    earnings: number;
  }>;
}

export default function EarningsDashboard({
  totalEarnings = 2450.75,
  monthlyEarnings = 385.25,
  pendingBalance = 125.5,
  availableBalance = 2325.25,
  stats = {
    totalViews: 125430,
    totalReactions: 8923,
    totalShares: 2341,
    averageViewDuration: 45,
    engagementRate: 7.1,
  },
  earningsHistory = [],
  videoEarnings = [],
}: EarningsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Earnings Dashboard</h2>
        <p className="text-muted-foreground">Track your video earnings and payouts</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold mt-2">${totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold mt-2">${monthlyEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold mt-2">${availableBalance.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">Ready to withdraw</p>
            </div>
            <Wallet className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-2">${pendingBalance.toFixed(2)}</p>
              <p className="text-xs text-amber-600 mt-1">Processing</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Reactions</p>
          <p className="text-xl font-bold mt-2">{stats.totalReactions.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Shares</p>
          <p className="text-xl font-bold mt-2">{stats.totalShares.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-xl font-bold mt-2">{stats.averageViewDuration}s</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Engagement</p>
          <p className="text-xl font-bold mt-2">{stats.engagementRate}%</p>
        </Card>
      </div>

      {/* Earnings Chart */}
      {earningsHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Earnings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="earnings" stroke="#10b981" name="Earnings ($)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top Videos */}
      {videoEarnings.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Earning Videos</h3>
          <div className="space-y-3">
            {videoEarnings.slice(0, 5).map((video, index) => (
              <div key={video.videoId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <div>
                    <p className="font-medium text-sm">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.views.toLocaleString()} views</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">${video.earnings.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1">Request Payout</Button>
        <Button variant="outline" className="flex-1">
          View Payout History
        </Button>
        <Button variant="outline" className="flex-1">
          Update Settings
        </Button>
      </div>
    </div>
  );
}
