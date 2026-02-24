import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

// Mock incident data
const mockIncidents = [
  {
    id: "inc-1",
    title: "API Gateway Timeout",
    description: "High latency on API gateway causing request timeouts",
    severity: "critical",
    status: "investigating",
    createdAt: new Date(Date.now() - 30 * 60000),
    affectedServices: ["API Gateway", "Auth Service"],
    affectedUsers: 2500,
    impact: { downtime: 30, usersAffected: 2500, revenue: 25000 },
    timeline: [
      {
        timestamp: new Date(Date.now() - 30 * 60000),
        type: "created",
        description: "Incident detected by monitoring",
      },
      {
        timestamp: new Date(Date.now() - 25 * 60000),
        type: "updated",
        description: "Escalated to critical severity",
      },
      {
        timestamp: new Date(Date.now() - 10 * 60000),
        type: "updated",
        description: "Root cause identified: database connection pool exhaustion",
      },
    ],
  },
  {
    id: "inc-2",
    title: "High Memory Usage",
    description: "Memory utilization exceeding 85% threshold",
    severity: "high",
    status: "mitigating",
    createdAt: new Date(Date.now() - 60 * 60000),
    affectedServices: ["Cache Service"],
    affectedUsers: 500,
    impact: { downtime: 5, usersAffected: 500, revenue: 5000 },
    timeline: [
      {
        timestamp: new Date(Date.now() - 60 * 60000),
        type: "created",
        description: "Memory alert triggered",
      },
    ],
  },
];

export function IncidentManagementDashboard() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const stats = {
    totalIncidents: 15,
    activeIncidents: 2,
    failedIncidents: 3,
    averageExecutionTime: 45,
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: "destructive",
      high: "secondary",
      medium: "outline",
      low: "outline",
    };
    return <Badge variant={variants[severity] || "outline"}>{severity}</Badge>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-50 border-red-200";
      case "investigating":
        return "bg-yellow-50 border-yellow-200";
      case "mitigating":
        return "bg-blue-50 border-blue-200";
      case "resolved":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Incident Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeIncidents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.failedIncidents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageExecutionTime}min</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>Incidents requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockIncidents.filter((i) => i.status !== "resolved").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active incidents</div>
            ) : (
              mockIncidents
                .filter((i) => i.status !== "resolved")
                .map((incident, idx) => (
                  <div
                    key={incident.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(incident.status)}`}
                    onClick={() => setSelectedIncident(incident.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(incident.severity)}
                        <div>
                          <h4 className="font-medium">{incident.title}</h4>
                          <p className="text-xs text-muted-foreground">{incident.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(incident.severity)}
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div>
                        <span className="text-muted-foreground">Affected Services:</span>
                        <p className="font-medium">{incident.affectedServices.join(", ")}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Users Affected:</span>
                        <p className="font-medium">{incident.affectedUsers}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{incident.impact.downtime}min</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incident Details */}
      {selectedIncident && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>
              {mockIncidents.find((i) => i.id === selectedIncident)?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockIncidents.find((i) => i.id === selectedIncident) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      {mockIncidents.find((i) => i.id === selectedIncident)?.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <p className="font-medium">
                      {mockIncidents.find((i) => i.id === selectedIncident)?.severity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {mockIncidents
                        .find((i) => i.id === selectedIncident)
                        ?.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Downtime</p>
                    <p className="font-medium">
                      {mockIncidents.find((i) => i.id === selectedIncident)?.impact.downtime}
                      min
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Timeline</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockIncidents
                      .find((i) => i.id === selectedIncident)
                      ?.timeline.map((event, idx) => (
                        <div key={`item-${idx}`} className="flex gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{event.type}</p>
                            <p className="text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <Button className="w-full">View Full Analysis</Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Incident Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Incident Trends
          </CardTitle>
          <CardDescription>Historical incident patterns and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span className="text-sm">Most Common Severity</span>
              <span className="font-medium">High</span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span className="text-sm">Average Resolution Time</span>
              <span className="font-medium">{stats.averageExecutionTime} min</span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span className="text-sm">Most Affected Service</span>
              <span className="font-medium">API Gateway</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
