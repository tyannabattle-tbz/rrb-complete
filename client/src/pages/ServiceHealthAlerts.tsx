import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, AlertTriangle, Zap, Bell, X } from 'lucide-react';

interface ServiceAlert {
  id: string;
  service: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  activeAlerts: number;
}

export default function ServiceHealthAlerts() {
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Mock services
  const mockServices: ServiceStatus[] = [
    { name: 'Stripe Payment', status: 'healthy', uptime: 99.98, responseTime: 145, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Slack Notifications', status: 'healthy', uptime: 99.95, responseTime: 230, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Email Delivery', status: 'degraded', uptime: 98.5, responseTime: 850, lastCheck: new Date(), activeAlerts: 1 },
    { name: 'Analytics', status: 'healthy', uptime: 99.99, responseTime: 120, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Video Processing', status: 'healthy', uptime: 99.92, responseTime: 2500, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Authentication', status: 'healthy', uptime: 99.99, responseTime: 85, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Content Moderation', status: 'healthy', uptime: 99.97, responseTime: 1200, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Database', status: 'healthy', uptime: 99.99, responseTime: 50, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'Cache (Redis)', status: 'healthy', uptime: 99.98, responseTime: 5, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'CDN', status: 'healthy', uptime: 99.99, responseTime: 30, lastCheck: new Date(), activeAlerts: 0 },
    { name: 'WebSocket Server', status: 'healthy', uptime: 99.94, responseTime: 150, lastCheck: new Date(), activeAlerts: 0 },
  ];

  const mockAlerts: ServiceAlert[] = [
    {
      id: 'alert-001',
      service: 'Email Delivery',
      severity: 'warning',
      title: 'High Response Time',
      message: 'Email delivery service response time exceeded 800ms threshold',
      timestamp: new Date(Date.now() - 5 * 60000),
      resolved: false,
    },
  ];

  useEffect(() => {
    setServices(mockServices);
    setAlerts(mockAlerts);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-600 text-white';
      case 'degraded':
        return 'bg-yellow-600 text-white';
      case 'down':
        return 'bg-red-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const activeAlerts = alerts.filter(a => !a.resolved && !dismissedAlerts.includes(a.id));
  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Service Health Alerts</h1>
        <p className="text-slate-400 mt-2">Real-time monitoring of all 11+ integrated services</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Services</p>
            <p className="text-3xl font-bold text-white">{services.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Healthy</p>
            <p className="text-3xl font-bold text-green-500">{healthyServices}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Degraded</p>
            <p className="text-3xl font-bold text-yellow-500">{degradedServices}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Active Alerts</p>
            <p className="text-3xl font-bold text-red-500">{activeAlerts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="bg-red-900 border-red-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="p-3 bg-red-800 rounded border border-red-600 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <h4 className="font-semibold text-white">{alert.title}</h4>
                    <p className="text-sm text-red-100 mt-1">{alert.message}</p>
                    <p className="text-xs text-red-200 mt-2">{alert.service} • {alert.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-red-200 border-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Service Status Grid */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Service Status</CardTitle>
          <CardDescription>Real-time health metrics for all integrated services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(service => (
              <div key={service.name} className="p-4 bg-slate-700 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <h3 className="font-semibold text-white">{service.name}</h3>
                  </div>
                  <Badge className={getStatusBadge(service.status)}>
                    {service.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-white font-medium">{service.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Response Time</span>
                    <span className="text-white font-medium">{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Alerts</span>
                    <span className={service.activeAlerts > 0 ? 'text-yellow-400 font-medium' : 'text-green-400 font-medium'}>
                      {service.activeAlerts}
                    </span>
                  </div>
                </div>

                {service.status !== 'healthy' && (
                  <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                    View Details
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Alert History</CardTitle>
          <CardDescription>Recent alerts from the past 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${
                  alert.resolved ? 'bg-slate-700 border-slate-600' : 'bg-slate-700 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {alert.service} • {alert.timestamp.toLocaleString()}
                        {alert.resolved && ` • Resolved at ${alert.resolvedAt?.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityBadge(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
