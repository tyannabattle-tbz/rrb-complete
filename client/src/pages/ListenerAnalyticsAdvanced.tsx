import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Clock, Activity } from 'lucide-react';

interface ListenerMetric {
  timestamp: string;
  listeners: number;
  engagement: number;
  sessionDuration: number;
  channelPreference: string;
}

interface ChannelData {
  name: string;
  listeners: number;
  percentage: number;
}

interface DemographicData {
  age: string;
  count: number;
  percentage: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

export default function ListenerAnalyticsAdvanced() {
  const [timeRange, setTimeRange] = useState('7d');
  const [listenerData, setListenerData] = useState<ListenerMetric[]>([]);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [demographicData, setDemographicData] = useState<DemographicData[]>([]);
  const [totalListeners, setTotalListeners] = useState(342);
  const [avgSessionDuration, setAvgSessionDuration] = useState(45);
  const [growthRate, setGrowthRate] = useState(12);
  const [engagementRate, setEngagementRate] = useState(78);

  // Generate mock data based on time range
  useEffect(() => {
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    // Generate listener growth data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: ListenerMetric[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      data.push({
        timestamp: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        listeners: Math.floor(300 + Math.random() * 100 + i * 0.5),
        engagement: Math.floor(70 + Math.random() * 20),
        sessionDuration: Math.floor(40 + Math.random() * 30),
        channelPreference: ['432Hz', '528Hz', '741Hz', 'Jazz', 'Rock'][Math.floor(Math.random() * 5)]
      });
    }
    
    setListenerData(data);

    // Generate channel preference data
    setChannelData([
      { name: '432Hz - Heart Chakra', listeners: 120, percentage: 35 },
      { name: '528Hz - Throat Chakra', listeners: 85, percentage: 25 },
      { name: 'Jazz Frequencies', listeners: 70, percentage: 20 },
      { name: 'Rock Frequencies', listeners: 45, percentage: 13 },
      { name: 'Other', listeners: 22, percentage: 7 }
    ]);

    // Generate demographic data
    setDemographicData([
      { age: '18-25', count: 45, percentage: 13 },
      { age: '26-35', count: 95, percentage: 28 },
      { age: '36-45', count: 105, percentage: 31 },
      { age: '46-55', count: 65, percentage: 19 },
      { age: '55+', count: 32, percentage: 9 }
    ]);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Listener Analytics</h1>
          <p className="text-purple-200">Advanced metrics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-slate-800 border-purple-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Listeners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalListeners}</div>
            <p className="text-green-400 text-sm mt-1">+{growthRate}% growth</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{avgSessionDuration}m</div>
            <p className="text-blue-400 text-sm mt-1">+5% vs last period</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{engagementRate}%</div>
            <p className="text-blue-400 text-sm mt-1">Very High</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{growthRate}%</div>
            <p className="text-green-400 text-sm mt-1">Accelerating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listener Growth Chart */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Listener Growth</CardTitle>
            <CardDescription>Active listeners over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={listenerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="listeners" 
                  stroke="#8b5cf6" 
                  dot={{ fill: '#8b5cf6' }}
                  name="Active Listeners"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Preference Chart */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Channel Preferences</CardTitle>
            <CardDescription>Listener distribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8b5cf6"
                  dataKey="listeners"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Engagement Metrics</CardTitle>
            <CardDescription>Listener engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={listenerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="engagement" fill="#ec4899" name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics Chart */}
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Listener Demographics</CardTitle>
            <CardDescription>Age distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="age" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#06b6d4" name="Listeners" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Retention & Cohort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Listener Retention</CardTitle>
            <CardDescription>Cohort retention rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Week 1</span>
                <span className="text-white font-bold">95%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Week 2</span>
                <span className="text-white font-bold">87%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Week 4</span>
                <span className="text-white font-bold">72%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Week 12</span>
                <span className="text-white font-bold">58%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Channels</CardTitle>
            <CardDescription>Highest engagement channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channelData.slice(0, 5).map((channel, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <div className="flex-1">
                  <p className="text-white font-medium">{channel.name}</p>
                  <p className="text-purple-200 text-sm">{channel.listeners} listeners</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{channel.percentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" className="border-purple-500 text-purple-200">
          Export Report
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">
          View Detailed Analytics
        </Button>
      </div>
    </div>
  );
}
