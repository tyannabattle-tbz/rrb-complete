import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Activity, Radio, Zap, Heart, Music } from 'lucide-react';

export function CanrynDashboard() {
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null);

  // Fetch ecosystem data
  const ecosystemConfig = trpc.qumusOrchestration.getEcosystemConfig.useQuery();
  const subsidiaries = trpc.qumusOrchestration.getSubsidiaries.useQuery();
  const healthReport = trpc.qumusOrchestration.getHealthReport.useQuery();
  const metrics = trpc.qumusOrchestration.getMetrics.useQuery();
  const integrationMap = trpc.qumusOrchestration.getIntegrationMap.useQuery();

  const getSubsidiaryIcon = (name: string) => {
    switch (name) {
      case 'QUMUS':
        return <Zap className="w-5 h-5" />;
      case 'RRB Radio':
        return <Radio className="w-5 h-5" />;
      case 'HybridCast':
        return <Activity className="w-5 h-5" />;
      case 'Sweet Miracles':
        return <Heart className="w-5 h-5" />;
      case 'Rockin Rockin Boogie':
        return <Music className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (ecosystemConfig.isLoading || subsidiaries.isLoading) {
    return <div className="p-8 text-center">Loading Canryn Ecosystem...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-white">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Canryn Ecosystem</h1>
        <p className="text-slate-300">{ecosystemConfig.data?.mission}</p>
        <p className="text-lg font-semibold text-amber-400">Motto: {ecosystemConfig.data?.motto}</p>
      </div>

      {/* Company Info */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle>Company Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Founder</p>
              <p className="text-lg font-semibold">{ecosystemConfig.data?.founder}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Operators</p>
              <p className="text-lg font-semibold">{ecosystemConfig.data?.operators?.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Autonomy Target</p>
              <p className="text-lg font-semibold">{ecosystemConfig.data?.autonomyTarget}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Human Oversight</p>
              <p className="text-lg font-semibold">{ecosystemConfig.data?.humanOversightLevel}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      {healthReport.data && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <Badge
                  className={`mt-2 ${
                    healthReport.data.status === 'HEALTHY'
                      ? 'bg-green-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {healthReport.data.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-400">System Health</p>
                <p className={`text-2xl font-bold mt-2 ${getHealthColor(
                  healthReport.data.systemHealth
                )}`}>
                  {healthReport.data.systemHealth}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Autonomy Level</p>
                <p className="text-2xl font-bold text-blue-400 mt-2">
                  {healthReport.data.autonomyLevel}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subsidiaries Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Subsidiaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subsidiaries.data?.map((subsidiary) => (
            <Card
              key={subsidiary.subsidiaryId}
              className="bg-slate-700 border-slate-600 cursor-pointer hover:bg-slate-600 transition"
              onClick={() => setSelectedSubsidiary(subsidiary.subsidiaryId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getSubsidiaryIcon(subsidiary.name)}
                  {subsidiary.name}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {subsidiary.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <Badge className={getStatusColor(subsidiary.status)}>
                    {subsidiary.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Autonomy</span>
                  <span className="font-semibold">{subsidiary.autonomyLevel}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Integrations</span>
                  <span className="font-semibold">{subsidiary.integrations.length}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Map */}
      {integrationMap.data && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>Integration Network</CardTitle>
            <CardDescription className="text-slate-300">
              Cross-subsidiary connections and dependencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(integrationMap.data).map(([subsidiary, integrations]) => (
                <div key={subsidiary} className="flex items-start gap-4">
                  <div className="font-semibold min-w-[150px]">{subsidiary}</div>
                  <div className="flex flex-wrap gap-2">
                    {integrations.map((integration) => (
                      <Badge key={integration} variant="outline" className="bg-slate-600 border-slate-500">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {metrics.data && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>Ecosystem Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">Total Subsidiaries</p>
                <p className="text-2xl font-bold">{metrics.data.totalSubsidiaries}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-400">{metrics.data.activeSubsidiaries}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">System Health</p>
                <p className="text-2xl font-bold text-blue-400">{metrics.data.systemHealth}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Human Interventions</p>
                <p className="text-2xl font-bold text-amber-400">{metrics.data.humanInterventions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-600">
        <p>Canryn Production | Founded by {ecosystemConfig.data?.founder}</p>
        <p>Operated by {ecosystemConfig.data?.operators?.join(' and ')}</p>
        <p className="mt-2 text-amber-400 font-semibold">{ecosystemConfig.data?.motto}</p>
      </div>
    </div>
  );
}
