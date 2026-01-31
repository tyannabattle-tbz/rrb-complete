import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";

export default function AgentDashboardUI() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  const listAgents = trpc.agentMarketplace.listAgents.useQuery({});
  const getMetrics = trpc.agentInfrastructure.getPerformanceMetrics.useQuery(
    { agentId: selectedAgent?.id || 0 },
    {
      enabled: !!selectedAgent,
    }
  );

  useEffect(() => {
    if (listAgents.data) {
      setAgents(listAgents.data);
      if (listAgents.data.length > 0) {
        setSelectedAgent(listAgents.data[0]);
      }
    }
  }, [listAgents.data]);

  useEffect(() => {
    if (getMetrics.data) {
      setMetrics(getMetrics.data);
    }
  }, [getMetrics.data]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "idle":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const performanceData = [
    { time: "00:00", success: 95, error: 5 },
    { time: "04:00", success: 92, error: 8 },
    { time: "08:00", success: 98, error: 2 },
    { time: "12:00", success: 89, error: 11 },
    { time: "16:00", success: 96, error: 4 },
    { time: "20:00", success: 93, error: 7 },
  ];

  const memoryData = [
    { time: "00:00", memory: 45 },
    { time: "04:00", memory: 52 },
    { time: "08:00", memory: 68 },
    { time: "12:00", memory: 75 },
    { time: "16:00", memory: 82 },
    { time: "20:00", memory: 65 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <Button>Deploy New Agent</Button>
      </div>

      {/* Agent List */}
      <div className="grid gap-4 md:grid-cols-4">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={`cursor-pointer transition-all ${selectedAgent?.id === agent.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setSelectedAgent(agent)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                <div className={`h-3 w-3 rounded-full ${getStatusColor(agent.status)}`} />
              </div>
              <CardDescription>{agent.agentType}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-semibold">{metrics?.uptime || "99.9%"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks:</span>
                  <span className="font-semibold">{metrics?.tasksCompleted || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAgent && (
        <>
          {/* Agent Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedAgent.status)}>{selectedAgent.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{selectedAgent.agentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold">{new Date(selectedAgent.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                  <Button size="sm" variant="outline">
                    Stop
                  </Button>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics?.successRate || "95.2%"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold">{metrics?.avgResponseTime || "245ms"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Executions</p>
                  <p className="text-2xl font-bold">{metrics?.totalExecutions || "1,234"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Memory</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-1/2 bg-blue-500 rounded-full" />
                  </div>
                  <p className="mt-1 text-sm">{metrics?.memoryUsage || "512MB"} / 1GB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CPU</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-1/3 bg-green-500 rounded-full" />
                  </div>
                  <p className="mt-1 text-sm">{metrics?.cpuUsage || "33%"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Success vs Error Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" fill="#10b981" />
                    <Bar dataKey="error" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Over Time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="memory" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-semibold">Task {i}</p>
                      <p className="text-sm text-gray-500">Completed in 245ms</p>
                    </div>
                    <Badge className="bg-green-500">Success</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
