import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Send, MapPin, Clock, Users, Radio, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  regions: string[];
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  createdAt: number;
  scheduledFor?: number;
  recipients: number;
  deliveryRate: number;
}

interface BroadcastNode {
  id: string;
  name: string;
  region: string;
  status: 'ready' | 'broadcasting' | 'offline';
  coverage: number;
}

export default function EmergencyAlertSystem() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([
    {
      id: '1',
      title: 'Severe Weather Warning',
      message: 'Tornado warning in effect for the following areas...',
      severity: 'critical',
      regions: ['North America'],
      status: 'active',
      createdAt: Date.now() - 300000,
      recipients: 1243000,
      deliveryRate: 99.8,
    },
    {
      id: '2',
      title: 'Public Safety Alert',
      message: 'Missing person alert - please contact authorities if seen',
      severity: 'high',
      regions: ['North America', 'Europe'],
      status: 'active',
      createdAt: Date.now() - 600000,
      recipients: 2100000,
      deliveryRate: 99.5,
    },
  ]);

  const [broadcastNodes, setBroadcastNodes] = useState<BroadcastNode[]>([
    { id: '1', name: 'Primary Hub', region: 'North America', status: 'ready', coverage: 98.5 },
    { id: '2', name: 'Secondary Hub', region: 'Europe', status: 'ready', coverage: 97.2 },
    { id: '3', name: 'Tertiary Hub', region: 'Asia-Pacific', status: 'broadcasting', coverage: 95.8 },
  ]);

  const [showNewAlert, setShowNewAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    severity: 'high' as const,
    regions: [] as string[],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-slate-100 dark:bg-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleBroadcast = (alertId: string) => {
    alert(`Broadcasting alert ${alertId} through HybridCast to all regions...`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                Emergency Alert System
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Trigger emergency broadcasts through HybridCast infrastructure
              </p>
            </div>
            <Button
              onClick={() => setShowNewAlert(!showNewAlert)}
              className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertTriangle className="w-4 h-4" />
              New Alert
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Alerts</p>
            <p className="text-2xl font-bold text-red-600">{alerts.filter((a) => a.status === 'active').length}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Broadcasting now</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Recipients</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {(alerts.reduce((sum, a) => sum + a.recipients, 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Reached today</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Delivery Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {(alerts.reduce((sum, a) => sum + a.deliveryRate, 0) / alerts.length).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Via HybridCast</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alert Management */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active & Scheduled Alerts</h2>

            {showNewAlert && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 mb-4 border-2 border-red-300 dark:border-red-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Create Emergency Alert</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Alert Title"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                  />
                  <textarea
                    placeholder="Alert Message"
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                    rows={3}
                  ></textarea>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select
                      multiple
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                    >
                      <option>North America</option>
                      <option>Europe</option>
                      <option>Asia-Pacific</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Send className="w-4 h-4" />
                      Broadcast Now
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-2 p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedAlert === alert.id ? 'ring-2 ring-red-500' : ''
                } ${getSeverityColor(alert.severity)}`}
                onClick={() => setSelectedAlert(alert.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getStatusIcon(alert.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{alert.title}</h3>
                      <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs font-medium text-slate-900 dark:text-white">
                    {alert.status.toUpperCase()}
                  </span>
                </div>

                {/* Alert Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-white dark:bg-slate-700 bg-opacity-50 rounded">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Recipients</p>
                    <p className="font-bold">{(alert.recipients / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Delivery Rate</p>
                    <p className="font-bold">{alert.deliveryRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Regions</p>
                    <p className="font-bold text-sm">{alert.regions.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Created</p>
                    <p className="font-bold text-sm">{Math.floor((Date.now() - alert.createdAt) / 60000)}m ago</p>
                  </div>
                </div>

                {/* Controls */}
                {alert.status !== 'completed' && (
                  <div className="flex gap-2 pt-3 border-t border-current border-opacity-20">
                    <Button
                      size="sm"
                      className="bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-opacity-90 gap-1"
                      onClick={() => handleBroadcast(alert.id)}
                    >
                      <Radio className="w-3 h-3" />
                      Broadcast
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      Edit
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* HybridCast Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">HybridCast Nodes</h2>

            {broadcastNodes.map((node) => (
              <Card key={node.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{node.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{node.region}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      node.status === 'ready'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : node.status === 'broadcasting'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Coverage</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${node.coverage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.coverage}%</p>
                </div>

                <Button size="sm" variant="outline" className="w-full gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Test Connection
                </Button>
              </Card>
            ))}

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Emergency Features</h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>✓ Multi-region failover</li>
                <li>✓ Offline broadcasting</li>
                <li>✓ AI-powered routing</li>
                <li>✓ Real-time monitoring</li>
                <li>✓ Automated alerts</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
