import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tbzOSIntegrationSystem } from '@/lib/tbzOSIntegration';
import { Activity, AlertCircle, CheckCircle, Radio, Zap } from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  icon: React.ReactNode;
  color: string;
  details?: string;
}

export default function SystemStatusWidget() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const updateStatus = () => {
      const liveStatus = tbzOSIntegrationSystem.getLiveSystemsStatus();
      const systemStatus = tbzOSIntegrationSystem.getSystemStatus();

      const statusList: SystemStatus[] = [
        {
          name: 'RRB Radio',
          status: liveStatus.rrbRadio.status as any,
          icon: <Radio className="w-4 h-4" />,
          color: '#FF6B35',
          details: `${liveStatus.rrbRadio.listeners} listeners • ${liveStatus.rrbRadio.channels} channels`,
        },
        {
          name: 'QUMUS',
          status: liveStatus.qumus.status as any,
          icon: <Zap className="w-4 h-4" />,
          color: '#7C3AED',
          details: `${liveStatus.qumus.subsystems} subsystems • ${liveStatus.qumus.autonomy} autonomous`,
        },
        {
          name: 'HybridCast',
          status: liveStatus.hybridCast.status as any,
          icon: <AlertCircle className="w-4 h-4" />,
          color: '#F59E0B',
          details: `${liveStatus.hybridCast.uptime} uptime`,
        },
        {
          name: 'Smart Glasses',
          status: liveStatus.smartGlasses.status as any,
          icon: <Activity className="w-4 h-4" />,
          color: '#3B82F6',
          details: `${liveStatus.smartGlasses.devices} devices connected`,
        },
        {
          name: 'Studio Mic',
          status: liveStatus.studiMic.status as any,
          icon: <Radio className="w-4 h-4" />,
          color: '#10B981',
          details: `${liveStatus.studiMic.channels} channels active`,
        },
        {
          name: 'Robot Bridge',
          status: liveStatus.robotBridge.status as any,
          icon: <Activity className="w-4 h-4" />,
          color: '#EC4899',
          details: `${liveStatus.robotBridge.units} units operational`,
        },
      ];

      setSystems(statusList);

      // Determine overall status
      const inactiveSystems = statusList.filter(s => s.status === 'inactive').length;
      if (inactiveSystems === 0) {
        setOverallStatus('operational');
      } else if (inactiveSystems <= 2) {
        setOverallStatus('degraded');
      } else {
        setOverallStatus('critical');
      }

      setLastUpdate(new Date().toLocaleTimeString());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    operational: 'bg-green-900 text-green-200 border-green-700',
    degraded: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    critical: 'bg-red-900 text-red-200 border-red-700',
  };

  const statusIcon = {
    operational: <CheckCircle className="w-5 h-5" />,
    degraded: <AlertCircle className="w-5 h-5" />,
    critical: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Live Systems Status</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor[overallStatus]}`}>
            {statusIcon[overallStatus]}
            <span className="text-sm font-semibold capitalize">{overallStatus}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {systems.map((system, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: system.color + '20' }}
                >
                  <div style={{ color: system.color }}>
                    {system.icon}
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{system.name}</p>
                  <p className="text-slate-400 text-xs">{system.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    system.status === 'active'
                      ? 'bg-green-500'
                      : system.status === 'maintenance'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-slate-400 capitalize">{system.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-600">
          <p className="text-xs text-slate-500 text-center">
            Last updated: {lastUpdate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
