/**
 * Ty OS Home Page
 * Master control interface for the complete QUMUS ecosystem
 * Provides unified access to all subsystems, real-time metrics, and autonomous orchestration
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Radio,
  Settings,
  BarChart3,
  Users,
  Zap,
  Shield,
  Activity,
  Cpu,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Gauge,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function TyOSHome() {
  const [, setLocation] = useLocation();
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  // Fetch real-time metrics
  const { data: systemMetrics } = trpc.realtimeMetrics.getSystemMetrics.useQuery();
  const { data: controlStatus } = trpc.tyOsQumusIntegration.getControlStatus.useQuery();

  const ecosystemSystems = [
    {
      id: 'qumus',
      icon: Cpu,
      title: '🧠 QUMUS Control Center',
      description: 'Autonomous orchestration brain - 20 active policies, 18 subsystems',
      features: ['90% Autonomy', '20 Policies', '18 Subsystems', 'Real-time Monitoring'],
      path: '/qumus-dashboard',
      color: 'from-purple-600 to-indigo-600',
      status: 'operational',
    },
    {
      id: 'radio',
      icon: Radio,
      title: '📻 54-Channel Radio Network',
      description: 'Real-time broadcast streaming with healing frequencies',
      features: [
        `${systemMetrics?.activeChannels || 54} Active Channels`,
        `${systemMetrics?.totalListeners || 20550} Live Listeners`,
        'Solfeggio Frequencies',
        '24/7 Streaming',
      ],
      path: '/listen',
      color: 'from-pink-600 to-orange-600',
      status: 'active',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: '📊 Real-Time Analytics',
      description: 'Live listener demographics, channel performance, revenue tracking',
      features: ['Live Metrics', 'Revenue Reports', 'Listener Analytics', 'Export Tools'],
      path: '/admin/analytics',
      color: 'from-blue-600 to-cyan-600',
      status: 'operational',
    },
    {
      id: 'creators',
      icon: Users,
      title: '👥 Creator Marketplace',
      description: 'Manage creators, content, and monetization',
      features: ['Creator Profiles', 'Content Management', 'Royalty Tracking', 'Payments'],
      path: '/marketplace',
      color: 'from-green-600 to-emerald-600',
      status: 'operational',
    },
    {
      id: 'security',
      icon: Shield,
      title: '🔐 Security & Compliance',
      description: 'Content moderation, audit trails, blockchain verification',
      features: ['AI Moderation', 'Audit Logs', 'Blockchain Hash', 'Policy Enforcement'],
      path: '/admin/moderation',
      color: 'from-red-600 to-pink-600',
      status: 'operational',
    },
    {
      id: 'settings',
      icon: Settings,
      title: '⚙️ System Configuration',
      description: 'Manage policies, integrations, and autonomous settings',
      features: ['Policy Editor', 'Integrations', 'Webhooks', 'Automation'],
      path: '/settings',
      color: 'from-slate-600 to-gray-600',
      status: 'operational',
    },
  ];

  const metricsCards = [
    {
      title: 'Total Listeners',
      value: systemMetrics?.totalListeners || 20550,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Channels',
      value: systemMetrics?.activeChannels || 54,
      icon: Radio,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'System Uptime',
      value: `${systemMetrics?.systemUptime || 99.95}%`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Autonomy Level',
      value: `${((systemMetrics?.autonomyLevel || 0.9) * 100).toFixed(0)}%`,
      icon: Gauge,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Ty OS</h1>
                <p className="text-xs text-slate-400">Master Control - QUMUS Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricsCards.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                    </div>
                    <div className={`${metric.bgColor} p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Control Status */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Bidirectional Control Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Real-time QUMUS ↔ Ty OS policy execution and decision flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Total Decisions (24h)</p>
                <p className="text-2xl font-bold text-white">{controlStatus?.totalDecisions || 0}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-500">{controlStatus?.pendingReview || 0}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">Avg Autonomy Score</p>
                <p className="text-2xl font-bold text-green-500">
                  {((controlStatus?.averageAutonomy || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ecosystem Systems Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Ecosystem Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemSystems.map((system) => {
              const Icon = system.icon;
              return (
                <Card
                  key={system.id}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 cursor-pointer group"
                  onMouseEnter={() => setHoveredSystem(system.id)}
                  onMouseLeave={() => setHoveredSystem(null)}
                  onClick={() => handleNavigate(system.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${system.color} opacity-10 group-hover:opacity-20 transition-opacity`}>
                        <Icon className={`w-6 h-6 text-white`} />
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                        {system.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{system.title}</CardTitle>
                    <CardDescription className="text-slate-400">{system.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {system.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-0">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleNavigate(system.path)}
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border-0 group-hover:shadow-lg transition-all"
                      >
                        Access System
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              onClick={() => handleNavigate('/admin/analytics')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              onClick={() => handleNavigate('/admin/moderation')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Moderation
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              onClick={() => handleNavigate('/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
              onClick={() => handleNavigate('/admin/health')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Health
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
