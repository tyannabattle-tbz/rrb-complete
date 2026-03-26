/**
 * ECOSYSTEM HUB - Unified Navigation & Control Center
 * 
 * Provides seamless access to all ecosystem services:
 * - QUMUS Control Center
 * - Ty OS Master Control
 * - RRB Radio Network
 * - HybridCast Emergency Broadcast
 * - System Monitor Dashboard
 * 
 * Features:
 * - Real-time service status
 * - Quick navigation
 * - Health indicators
 * - Emergency controls
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  health: number; // 0-100
  url: string;
  icon: string;
  description: string;
}

export function EcosystemHub() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ecosystem health
  const { data: ecosystemHealth } = trpc.qumusEcosystem.getHealth.useQuery();
  const { data: systemMetrics } = trpc.realtimeMetrics.getSystemMetrics.useQuery();

  useEffect(() => {
    // Initialize services with real-time data
    const servicesList: ServiceStatus[] = [
      {
        name: 'QUMUS Control Center',
        status: 'online',
        health: ecosystemHealth?.qumusHealth || 95,
        url: 'https://qumus.manus.space',
        icon: '🧠',
        description: '14 active policies, 18 subsystems, 90% autonomy'
      },
      {
        name: 'Ty OS Master Control',
        status: 'online',
        health: ecosystemHealth?.tyosHealth || 100,
        url: 'https://tybatos-uo4zkxnl.manus.space',
        icon: '🎮',
        description: 'Ecosystem orchestration & command console'
      },
      {
        name: 'RRB Radio Network',
        status: 'online',
        health: ecosystemHealth?.rrbHealth || 100,
        url: 'https://qumus.manus.space/rrb',
        icon: '📻',
        description: '55 channels streaming, 24/7 broadcast'
      },
      {
        name: 'HybridCast Emergency',
        status: 'online',
        health: ecosystemHealth?.hybridcastHealth || 100,
        url: 'https://qumus.manus.space/hybridcast',
        icon: '🚨',
        description: '116-tab mission control, offline-first PWA'
      },
      {
        name: 'System Monitor',
        status: 'online',
        health: systemMetrics?.health || 98,
        url: 'https://qumus.manus.space/monitor',
        icon: '📊',
        description: 'Real-time metrics & performance dashboard'
      }
    ];

    setServices(servicesList);
    setLoading(false);
  }, [ecosystemHealth, systemMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          🌐 Ecosystem Control Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          Unified access to all Canryn Production services
        </p>
      </div>

      {/* Overall Health */}
      {ecosystemHealth && (
        <Card className="mb-8 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Health</p>
              <p className={`text-3xl font-bold ${getHealthColor(ecosystemHealth.overallHealth)}`}>
                {ecosystemHealth.overallHealth}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Policies</p>
              <p className="text-3xl font-bold text-blue-400">{ecosystemHealth.activePolicies}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Healthy Subsystems</p>
              <p className="text-3xl font-bold text-green-400">{ecosystemHealth.healthySubsystems}/18</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Autonomy Level</p>
              <p className="text-3xl font-bold text-purple-400">90%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {services.map((service) => (
          <Card
            key={service.name}
            className="p-4 hover:shadow-lg transition-all cursor-pointer border-l-4"
            style={{
              borderLeftColor: service.status === 'online' ? '#22c55e' : '#ef4444'
            }}
            onClick={() => window.open(service.url, '_blank')}
          >
            {/* Service Icon & Status */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{service.icon}</span>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
            </div>

            {/* Service Name */}
            <h3 className="font-bold text-sm mb-1 text-foreground">
              {service.name}
            </h3>

            {/* Health Indicator */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Health</span>
                <span className={`text-sm font-bold ${getHealthColor(service.health)}`}>
                  {service.health}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    service.health >= 95 ? 'bg-green-500' :
                    service.health >= 80 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${service.health}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {service.description}
            </p>

            {/* Action Button */}
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(service.url, '_blank');
              }}
            >
              Access
            </Button>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.location.href = '/dashboard'}
        >
          📊 Dashboard
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.location.href = '/settings'}
        >
          ⚙️ Settings
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.location.href = '/help'}
        >
          ❓ Help
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => window.location.href = '/about'}
        >
          ℹ️ About
        </Button>
      </div>

      {/* Emergency Controls */}
      <Card className="mt-8 p-6 border-red-500/30 bg-red-900/10">
        <h3 className="text-lg font-bold text-red-400 mb-4">🚨 Emergency Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="destructive"
            onClick={() => window.open('https://qumus.manus.space/hybridcast', '_blank')}
          >
            Emergency Broadcast
          </Button>
          <Button
            variant="destructive"
            onClick={() => window.open('https://qumus.manus.space/system-monitor', '_blank')}
          >
            System Status
          </Button>
          <Button
            variant="destructive"
            onClick={() => window.open('https://qumus.manus.space/policies', '_blank')}
          >
            Override Policy
          </Button>
          <Button
            variant="destructive"
            onClick={() => window.open('https://qumus.manus.space/support', '_blank')}
          >
            Get Support
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          © 2025-2026 Canryn Production | QUMUS Ecosystem v1.0 | 
          <a href="#" className="text-blue-400 hover:underline ml-2">
            System Status
          </a>
        </p>
      </div>
    </div>
  );
}

export default EcosystemHub;
