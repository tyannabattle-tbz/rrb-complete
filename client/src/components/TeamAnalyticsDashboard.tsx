import { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  sessionsCreated: number;
  averageExecutionTime: number;
  toolsUsed: number;
  successRate: number;
  lastActive: Date;
}

interface TeamAnalyticsDashboardProps {
  teamMembers?: TeamMember[];
  onExport?: () => void;
}

export default function TeamAnalyticsDashboard({
  teamMembers = [],
  onExport,
}: TeamAnalyticsDashboardProps) {
  // Generate mock data if not provided
  const mockMembers: TeamMember[] = useMemo(
    () =>
      teamMembers.length > 0
        ? teamMembers
        : [
            {
              id: 1,
              name: "Alice Johnson",
              email: "alice@example.com",
              sessionsCreated: 45,
              averageExecutionTime: 2.3,
              toolsUsed: 12,
              successRate: 0.95,
              lastActive: new Date(Date.now() - 3600000),
            },
            {
              id: 2,
              name: "Bob Smith",
              email: "bob@example.com",
              sessionsCreated: 38,
              averageExecutionTime: 3.1,
              toolsUsed: 8,
              successRate: 0.88,
              lastActive: new Date(Date.now() - 7200000),
            },
            {
              id: 3,
              name: "Carol White",
              email: "carol@example.com",
              sessionsCreated: 52,
              averageExecutionTime: 1.9,
              toolsUsed: 15,
              successRate: 0.92,
              lastActive: new Date(Date.now() - 1800000),
            },
            {
              id: 4,
              name: "David Brown",
              email: "david@example.com",
              sessionsCreated: 31,
              averageExecutionTime: 2.7,
              toolsUsed: 10,
              successRate: 0.85,
              lastActive: new Date(Date.now() - 14400000),
            },
          ],
    [teamMembers]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = mockMembers.reduce((sum, m) => sum + m.sessionsCreated, 0);
    const avgExecutionTime =
      mockMembers.reduce((sum, m) => sum + m.averageExecutionTime, 0) / mockMembers.length;
    const totalTools = mockMembers.reduce((sum, m) => sum + m.toolsUsed, 0);
    const avgSuccessRate =
      mockMembers.reduce((sum, m) => sum + m.successRate, 0) / mockMembers.length;

    return {
      totalSessions,
      avgExecutionTime: avgExecutionTime.toFixed(2),
      totalTools,
      avgSuccessRate: (avgSuccessRate * 100).toFixed(0),
    };
  }, [mockMembers]);

  // Chart data - Sessions by member
  const sessionsData = mockMembers.map((m) => ({
    name: m.name.split(" ")[0],
    sessions: m.sessionsCreated,
  }));

  // Chart data - Execution time trend
  const executionTimeData = mockMembers.map((m) => ({
    name: m.name.split(" ")[0],
    time: parseFloat(m.averageExecutionTime.toFixed(2)),
  }));

  // Chart data - Success rate
  const successRateData = mockMembers.map((m) => ({
    name: m.name.split(" ")[0],
    rate: Math.round(m.successRate * 100),
  }));

  // Chart data - Tools distribution
  const toolsDistribution = [
    { name: "API Calls", value: Math.round(stats.totalTools * 0.3) },
    { name: "Database", value: Math.round(stats.totalTools * 0.25) },
    { name: "File Ops", value: Math.round(stats.totalTools * 0.2) },
    { name: "Web Search", value: Math.round(stats.totalTools * 0.15) },
    { name: "Other", value: Math.round(stats.totalTools * 0.1) },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const handleExport = () => {
    if (onExport) {
      onExport();
    }

    // Generate CSV
    const csv = [
      ["Team Member", "Sessions", "Avg Execution Time", "Tools Used", "Success Rate", "Last Active"],
      ...mockMembers.map((m) => [
        m.name,
        m.sessionsCreated,
        m.averageExecutionTime.toFixed(2),
        m.toolsUsed,
        (m.successRate * 100).toFixed(0) + "%",
        m.lastActive.toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-analytics-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Analytics exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance metrics and activity tracking for your team
          </p>
        </div>

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold mt-1">{stats.totalSessions}</p>
            </div>
            <Zap className="text-primary opacity-50" size={32} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Execution Time</p>
              <p className="text-3xl font-bold mt-1">{stats.avgExecutionTime}s</p>
            </div>
            <Clock className="text-primary opacity-50" size={32} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tools Used</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTools}</p>
            </div>
            <TrendingUp className="text-primary opacity-50" size={32} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              <p className="text-3xl font-bold mt-1">{stats.avgSuccessRate}%</p>
            </div>
            <Users className="text-primary opacity-50" size={32} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sessions by Member */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Sessions by Member</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Execution Time Trend */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Avg Execution Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="time" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Success Rate */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Success Rate by Member</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="rate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tools Distribution */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Tools Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={toolsDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {toolsDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Sessions</th>
                <th className="text-left py-2 px-2">Avg Time</th>
                <th className="text-left py-2 px-2">Tools</th>
                <th className="text-left py-2 px-2">Success</th>
                <th className="text-left py-2 px-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {mockMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">{member.sessionsCreated}</td>
                  <td className="py-3 px-2">{member.averageExecutionTime.toFixed(2)}s</td>
                  <td className="py-3 px-2">{member.toolsUsed}</td>
                  <td className="py-3 px-2">
                    <Badge
                      variant={member.successRate >= 0.9 ? "default" : "secondary"}
                    >
                      {(member.successRate * 100).toFixed(0)}%
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs text-muted-foreground">
                    {member.lastActive.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
