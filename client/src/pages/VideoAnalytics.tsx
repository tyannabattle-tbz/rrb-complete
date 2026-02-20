import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, Heart, MessageSquare, Share2, TrendingUp } from "lucide-react";

const viewsData = [
  { date: "Mon", views: 240 },
  { date: "Tue", views: 380 },
  { date: "Wed", views: 200 },
  { date: "Thu", views: 278 },
  { date: "Fri", views: 189 },
  { date: "Sat", views: 239 },
  { date: "Sun", views: 349 },
];

const demographicsData = [
  { name: "18-24", value: 35 },
  { name: "25-34", value: 28 },
  { name: "35-44", value: 20 },
  { name: "45+", value: 17 },
];

const engagementData = [
  { metric: "Likes", value: 1250 },
  { metric: "Comments", value: 340 },
  { metric: "Shares", value: 189 },
  { metric: "Saves", value: 567 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function VideoAnalytics() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Analytics</h1>
          <p className="text-gray-600">Track your video performance and audience engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">2,847</p>
                <p className="text-green-600 text-sm mt-1">↑ 12% from last week</p>
              </div>
              <Eye className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Likes</p>
                <p className="text-3xl font-bold text-gray-900">1,250</p>
                <p className="text-green-600 text-sm mt-1">↑ 8% from last week</p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Comments</p>
                <p className="text-3xl font-bold text-gray-900">340</p>
                <p className="text-green-600 text-sm mt-1">↑ 5% from last week</p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg. Watch Time</p>
                <p className="text-3xl font-bold text-gray-900">4m 23s</p>
                <p className="text-green-600 text-sm mt-1">↑ 15% from last week</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views Over Time */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Views Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Engagement Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audience Demographics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audience by Age</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={demographicsData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {demographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Performing Videos */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Videos</h2>
            <div className="space-y-4">
              {[
                { title: "Sunset Cinematic", views: 1250, engagement: 89 },
                { title: "Motion Graphics", views: 980, engagement: 76 },
                { title: "Abstract Art", views: 617, engagement: 54 },
              ].map((video, idx) => (
                <div key={`item-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{video.title}</p>
                    <p className="text-sm text-gray-600">{video.views} views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{video.engagement}%</p>
                    <p className="text-xs text-gray-600">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
