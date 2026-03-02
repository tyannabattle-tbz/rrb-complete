import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Mic, TrendingUp, Target, Clock, AlertCircle } from 'lucide-react';

interface VoiceCommand {
  id: string;
  trigger: string;
  usageCount: number;
  successRate: number;
  averageConfidence: number;
  lastUsed?: Date;
}

interface AnalyticsData {
  date: string;
  commands: number;
  successRate: number;
  avgConfidence: number;
}

export function VoiceAnalyticsDashboard() {
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [avgSuccessRate, setAvgSuccessRate] = useState(0);

  useEffect(() => {
    // Load voice commands from localStorage
    const stored = localStorage.getItem('voiceCommands');
    if (stored) {
      const parsedCommands = JSON.parse(stored);
      setCommands(parsedCommands);

      // Calculate statistics
      const totalUses = parsedCommands.reduce((sum: number, cmd: VoiceCommand) => sum + cmd.usageCount, 0);
      setTotalUsage(totalUses);

      const avgSuccess = parsedCommands.length > 0
        ? parsedCommands.reduce((sum: number, cmd: VoiceCommand) => sum + cmd.successRate, 0) / parsedCommands.length
        : 0;
      setAvgSuccessRate(avgSuccess);

      // Generate mock analytics data for last 7 days
      const data: AnalyticsData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          commands: Math.floor(Math.random() * parsedCommands.length) + 1,
          successRate: Math.floor(Math.random() * 30) + 70,
          avgConfidence: Math.floor(Math.random() * 20) + 75,
        });
      }
      setAnalyticsData(data);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Commands</p>
                <p className="text-3xl font-bold text-cyan-400">{commands.length}</p>
              </div>
              <Mic className="text-cyan-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Usage</p>
                <p className="text-3xl font-bold text-purple-400">{totalUsage}</p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Success Rate</p>
                <p className="text-3xl font-bold text-green-400">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <Target className="text-green-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Commands</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {commands.filter((c) => c.usageCount > 0).length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {analyticsData.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">7-Day Performance Trend</CardTitle>
            <CardDescription>Success rate and confidence over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#10b981"
                  name="Success Rate (%)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="avgConfidence"
                  stroke="#3b82f6"
                  name="Avg Confidence (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Command Usage Chart */}
      {commands.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Command Usage Statistics</CardTitle>
            <CardDescription>Usage count and success rate by command</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commands.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="trigger" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="usageCount" fill="#8b5cf6" name="Usage Count" />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Command Details Table */}
      {commands.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Trained Commands</CardTitle>
            <CardDescription>Detailed statistics for each voice command</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Command</th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">Usage</th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">Success Rate</th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">Confidence</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-semibold">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((cmd) => (
                    <tr key={cmd.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-slate-300">{cmd.trigger}</td>
                      <td className="text-center py-3 px-4 text-cyan-400 font-semibold">{cmd.usageCount}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            cmd.successRate >= 80
                              ? 'bg-green-900/50 text-green-400'
                              : cmd.successRate >= 60
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {cmd.successRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-purple-400 font-semibold">
                          {(cmd.averageConfidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-slate-400 text-xs">
                        {cmd.lastUsed ? new Date(cmd.lastUsed).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {commands.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 py-12">
              <AlertCircle className="text-slate-500" size={24} />
              <p className="text-slate-400">No voice commands trained yet. Start by training your first command!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
