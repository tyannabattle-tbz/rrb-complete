/**
 * Mega Control Station Dashboard Component
 * Real-time monitoring and control interface for all production activities
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { controlDashboard } from '@/lib/controlDashboard';
import { resourceMonitor } from '@/lib/resourceMonitoring';
import { projectManager } from '@/lib/projectManagement';
import { teamManager } from '@/lib/teamManagement';
import { productionAssistant } from '@/lib/productionBots';
import { automationScheduler } from '@/lib/automationScheduling';

export function MegaControlStationDashboard() {
  const [systemStatus, setSystemStatus] = useState(controlDashboard.getSystemStatus());
  const [productionMetrics, setProductionMetrics] = useState(controlDashboard.getProductionMetrics());
  const [resourceSummary, setResourceSummary] = useState(resourceMonitor.getResourceSummary());
  const [projects, setProjects] = useState(projectManager.getAllProjects());
  const [tasks, setTasks] = useState(automationScheduler.getScheduledTasks());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Initialize systems
    controlDashboard.initialize();
    resourceMonitor.recordMetric(45, 62, 55, 30, 8);

    // Update dashboard every 5 seconds
    const interval = setInterval(() => {
      setSystemStatus(controlDashboard.getSystemStatus());
      setProductionMetrics(controlDashboard.getProductionMetrics());
      setResourceSummary(resourceMonitor.getResourceSummary());
      setProjects(projectManager.getAllProjects());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string | undefined) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mega Control Station</h1>
          <p className="text-gray-500">Real-time production monitoring and control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Refresh</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-full ${getHealthColor(resourceSummary?.health)} flex items-center justify-center text-white font-bold`}>
                {resourceSummary?.health?.[0].toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold capitalize">{resourceSummary?.health}</p>
                <p className="text-xs text-gray-500">Overall Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-xs text-gray-500">In Production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Videos Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productionMetrics?.videosGenerated || 0}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productionMetrics?.successRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemStatus && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <Badge variant="outline">{systemStatus.cpu.value}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <Badge variant="outline">{systemStatus.memory.value}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Storage Usage</span>
                      <Badge variant="outline">{systemStatus.storage.value}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <Badge variant="outline">{systemStatus.activeUsers.value}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Production Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Production Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Processing</span>
                      <Badge variant="outline">{productionMetrics.videosProcessing}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Time</span>
                      <Badge variant="outline">{productionMetrics.averageProcessingTime}s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <Badge variant="outline">{productionMetrics.successRate.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failure Rate</span>
                      <Badge variant="outline">{productionMetrics.failureRate.toFixed(1)}%</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest production activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {controlDashboard.getActivityFeed().map((activity, idx) => (
                  <div key={`item-${idx}`} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.details}</p>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Monitoring</CardTitle>
              <CardDescription>System resource usage and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resourceSummary && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CPU: {resourceSummary.current.cpu}%</span>
                      <span className="text-xs text-gray-500">Avg: {resourceSummary.averages.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${resourceSummary.current.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Memory: {resourceSummary.current.memory}%</span>
                      <span className="text-xs text-gray-500">Avg: {resourceSummary.averages.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${resourceSummary.current.memory}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Storage: {resourceSummary.current.storage}%</span>
                      <span className="text-xs text-gray-500">Avg: {resourceSummary.averages.storage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${resourceSummary.current.storage}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {resourceSummary?.recommendations && resourceSummary.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resourceSummary.recommendations.map((rec, idx) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-gray-500">{rec.description}</p>
                        <p className="text-xs text-green-600 mt-1">Savings: {rec.estimatedSavings}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>All production projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((project, idx) => (
                  <div key={project.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.description}</p>
                      </div>
                      <Badge>{project.status}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${projectManager.calculateProgress(project.id)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {projectManager.calculateProgress(project.id)}% Complete
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tasks</CardTitle>
              <CardDescription>Automated workflows and scheduled tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{task.name}</p>
                      <p className="text-xs text-gray-500">{task.action}</p>
                    </div>
                    <Badge variant={task.enabled ? 'default' : 'secondary'}>
                      {task.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Active alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resourceSummary?.alerts && resourceSummary.alerts.length > 0 ? (
                  resourceSummary.alerts.map((alert, idx) => (
                    <div key={alert.id} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-red-900">{alert.message}</p>
                          <p className="text-xs text-red-700">{alert.type}</p>
                        </div>
                        <Badge variant="destructive">{alert.severity}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active alerts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
