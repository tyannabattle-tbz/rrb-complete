import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Zap, TrendingDown, TrendingUp } from "lucide-react";

interface DeploymentStatus {
  environment: "blue" | "green";
  version: string;
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  healthChecks: {
    name: string;
    status: "passing" | "failing";
    latency: number;
  }[];
  trafficPercentage: number;
  lastDeployed: Date;
}

interface DeploymentDashboardProps {
  onDeploy?: () => void;
  onRollback?: () => void;
}

export function DeploymentDashboard({ onDeploy, onRollback }: DeploymentDashboardProps) {
  const [blueStatus, setBlueStatus] = useState<DeploymentStatus>({
    environment: "blue",
    version: "v2.1.0",
    status: "healthy",
    uptime: 99.95,
    healthChecks: [
      { name: "API Server", status: "passing", latency: 45 },
      { name: "Database", status: "passing", latency: 12 },
      { name: "Cache", status: "passing", latency: 8 },
    ],
    trafficPercentage: 100,
    lastDeployed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  const [greenStatus, setGreenStatus] = useState<DeploymentStatus>({
    environment: "green",
    version: "v2.2.0",
    status: "healthy",
    uptime: 99.9,
    healthChecks: [
      { name: "API Server", status: "passing", latency: 42 },
      { name: "Database", status: "passing", latency: 11 },
      { name: "Cache", status: "passing", latency: 7 },
    ],
    trafficPercentage: 0,
    lastDeployed: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  const [deploymentHistory, setDeploymentHistory] = useState([
    { version: "v2.1.0", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: "success", duration: 45 },
    { version: "v2.0.5", date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), status: "success", duration: 38 },
    { version: "v2.0.4", date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), status: "success", duration: 42 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4" />;
      case "unhealthy":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Blue Environment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Blue Environment</CardTitle>
                <CardDescription>{blueStatus.version}</CardDescription>
              </div>
              <Badge className={getStatusColor(blueStatus.status)}>
                {getStatusIcon(blueStatus.status)}
                <span className="ml-1">{blueStatus.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold">{blueStatus.uptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${blueStatus.uptime}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Traffic</span>
                <span className="font-semibold">{blueStatus.trafficPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${blueStatus.trafficPercentage}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Health Checks</h4>
              {blueStatus.healthChecks.map((check) => (
                <div key={check.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {check.status === "passing" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    {check.name}
                  </span>
                  <span className="text-gray-600">{check.latency}ms</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Last deployed: {blueStatus.lastDeployed.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Green Environment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Green Environment</CardTitle>
                <CardDescription>{greenStatus.version}</CardDescription>
              </div>
              <Badge className={getStatusColor(greenStatus.status)}>
                {getStatusIcon(greenStatus.status)}
                <span className="ml-1">{greenStatus.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold">{greenStatus.uptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${greenStatus.uptime}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Traffic</span>
                <span className="font-semibold">{greenStatus.trafficPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${greenStatus.trafficPercentage}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Health Checks</h4>
              {greenStatus.healthChecks.map((check) => (
                <div key={check.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {check.status === "passing" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    {check.name}
                  </span>
                  <span className="text-gray-600">{check.latency}ms</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Last deployed: {greenStatus.lastDeployed.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Controls</CardTitle>
          <CardDescription>Manage blue-green deployments and traffic switching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={onDeploy} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Deploy to Green
            </Button>
            <Button onClick={onRollback} variant="outline" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Rollback
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Traffic Distribution</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Blue</span>
                  <span>{blueStatus.trafficPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${blueStatus.trafficPercentage}%` }}></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Green</span>
                  <span>{greenStatus.trafficPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${greenStatus.trafficPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>Recent deployments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deploymentHistory.map((deployment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {deployment.status === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{deployment.version}</p>
                    <p className="text-xs text-gray-500">{deployment.date.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={deployment.status === "success" ? "default" : "destructive"}>
                    {deployment.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{deployment.duration}m</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
