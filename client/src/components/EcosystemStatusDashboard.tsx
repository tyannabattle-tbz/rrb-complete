import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Activity, AlertCircle, CheckCircle, Radio, Music, Gift, Zap } from 'lucide-react';

interface EcosystemEntity {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  uptime: number;
  lastCommand?: string;
  commandsExecuted: number;
  successRate: number;
  metrics: Record<string, number | string>;
}

interface EcosystemStatus {
  rrb: EcosystemEntity;
  hybridcast: EcosystemEntity;
  canryn: EcosystemEntity;
  sweetMiracles: EcosystemEntity;
}

interface EcosystemStatusDashboardProps {
  status?: EcosystemStatus;
  isLoading?: boolean;
}

export function EcosystemStatusDashboard({ status, isLoading = false }: EcosystemStatusDashboardProps) {
  const [expandedEcosystem, setExpandedEcosystem] = useState<string | null>(null);

  const defaultStatus: EcosystemStatus = {
    rrb: {
      name: 'Rockin Rockin Boogie',
      status: 'active',
      uptime: 99.8,
      lastCommand: 'Schedule broadcast',
      commandsExecuted: 1234,
      successRate: 98.5,
      metrics: {
        activeStreams: 3,
        listeners: 1523,
        bandwidth: '2.5 Mbps',
        cpuUsage: '45%',
        memoryUsage: '62%',
      },
    },
    hybridcast: {
      name: 'HybridCast Emergency',
      status: 'active',
      uptime: 99.95,
      lastCommand: 'Broadcast alert',
      commandsExecuted: 856,
      successRate: 99.2,
      metrics: {
        activeChannels: 5,
        subscribers: 3421,
        bandwidth: '4.2 Mbps',
        cpuUsage: '38%',
        memoryUsage: '58%',
      },
    },
    canryn: {
      name: 'Canryn Production',
      status: 'active',
      uptime: 99.5,
      lastCommand: 'Create content',
      commandsExecuted: 567,
      successRate: 97.8,
      metrics: {
        activeProductions: 2,
        contentItems: 234,
        storageUsed: '45 GB',
        cpuUsage: '52%',
        memoryUsage: '71%',
      },
    },
    sweetMiracles: {
      name: 'Sweet Miracles',
      status: 'active',
      uptime: 99.7,
      lastCommand: 'Process donation',
      commandsExecuted: 432,
      successRate: 99.5,
      metrics: {
        activeFunds: 12,
        totalRaised: '$125,430',
        donors: 1823,
        cpuUsage: '28%',
        memoryUsage: '42%',
      },
    },
  };

  const ecosystemData = status || defaultStatus;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'inactive':
        return <Activity size={20} className="text-slate-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'maintenance':
        return <Zap size={20} className="text-yellow-500" />;
      default:
        return <Activity size={20} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900 text-green-200';
      case 'inactive':
        return 'bg-slate-700 text-slate-200';
      case 'error':
        return 'bg-red-900 text-red-200';
      case 'maintenance':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const getEcosystemIcon = (key: string) => {
    switch (key) {
      case 'rrb':
        return <Music size={20} />;
      case 'hybridcast':
        return <Radio size={20} />;
      case 'canryn':
        return <Zap size={20} />;
      case 'sweetMiracles':
        return <Gift size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const ecosystems = Object.entries(ecosystemData).map(([key, data]) => ({
    key,
    ...data,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Ecosystem Status</h2>
        <div className="text-sm text-slate-400">
          {ecosystems.filter((e) => e.status === 'active').length}/{ecosystems.length} Active
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-400">Loading ecosystem status...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ecosystems.map((ecosystem) => (
            <Card
              key={ecosystem.key}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
              onClick={() =>
                setExpandedEcosystem(expandedEcosystem === ecosystem.key ? null : ecosystem.key)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-400">{getEcosystemIcon(ecosystem.key)}</div>
                    <div>
                      <CardTitle className="text-base text-white">{ecosystem.name}</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        {ecosystem.commandsExecuted} commands executed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ecosystem.status)}
                    <Badge className={getStatusColor(ecosystem.status)}>{ecosystem.status}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-700/50 rounded p-2">
                    <span className="text-xs text-slate-400">Uptime</span>
                    <p className="text-sm font-bold text-white">{ecosystem.uptime}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-2">
                    <span className="text-xs text-slate-400">Success Rate</span>
                    <p className="text-sm font-bold text-green-400">{ecosystem.successRate}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-2">
                    <span className="text-xs text-slate-400">Last Command</span>
                    <p className="text-xs font-mono text-blue-400 truncate">
                      {ecosystem.lastCommand || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedEcosystem === ecosystem.key && (
                  <div className="pt-3 border-t border-slate-700 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Metrics</h4>
                      <div className="space-y-2">
                        {Object.entries(ecosystem.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-slate-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-white font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        onClick={() => console.log('Send command to', ecosystem.name)}
                      >
                        Send Command
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-300 border-slate-600 hover:bg-slate-700 flex-1"
                        onClick={() => console.log('View logs for', ecosystem.name)}
                      >
                        View Logs
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Health Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm text-white">System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Overall Uptime</span>
              <span className="text-sm font-bold text-green-400">
                {(
                  ecosystems.reduce((sum, e) => sum + e.uptime, 0) / ecosystems.length
                ).toFixed(2)}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Average Success Rate</span>
              <span className="text-sm font-bold text-green-400">
                {(
                  ecosystems.reduce((sum, e) => sum + e.successRate, 0) / ecosystems.length
                ).toFixed(2)}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Commands</span>
              <span className="text-sm font-bold text-blue-400">
                {ecosystems.reduce((sum, e) => sum + e.commandsExecuted, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
