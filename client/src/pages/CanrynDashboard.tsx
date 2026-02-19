import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Activity, Radio, Zap, Heart, Music, BookOpen, Truck, Users, DollarSign, Mic, Globe, Play, Pause, Volume2 } from 'lucide-react';

export function CanrynDashboard() {
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const RRB_AUDIO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3';

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(RRB_AUDIO_URL);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Fetch ecosystem data
  const ecosystemConfig = trpc.qumusOrchestration.getEcosystemConfig.useQuery();
  const subsidiaries = trpc.qumusOrchestration.getSubsidiaries.useQuery();
  const healthReport = trpc.qumusOrchestration.getHealthReport.useQuery();
  const metrics = trpc.qumusOrchestration.getMetrics.useQuery();
  const integrationMap = trpc.qumusOrchestration.getIntegrationMap.useQuery();

  const getSubsidiaryIcon = (name: string) => {
    switch (name) {
      // Legacy Restored
      case 'Canryn Publishing Co.':
        return <BookOpen className="w-5 h-5" />;
      case 'Seasha Distribution Co.':
        return <Truck className="w-5 h-5" />;
      case 'Anna Promotion Co.':
        return <Users className="w-5 h-5" />;
      case 'Jaelon Enterprises':
        return <DollarSign className="w-5 h-5" />;
      case 'Little C Recording Co.':
        return <Mic className="w-5 h-5" />;
      case "Sean's Music World":
        return <Globe className="w-5 h-5" />;
      // Legacy Continued
      case 'Qumus':
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
        <h1 className="text-4xl font-bold">Canryn Production Inc.</h1>
        <p className="text-slate-300">{ecosystemConfig.data?.mission}</p>
        <p className="text-lg font-semibold text-amber-400">{ecosystemConfig.data?.motto}</p>
      </div>

      {/* Rockin' Rockin' Boogie Audio Player */}
      <Card className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-amber-700">
        <CardContent className="flex items-center gap-4 py-4">
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-amber-200">Rockin' Rockin' Boogie</p>
            <p className="text-sm text-amber-400/80">Written by Seabrun "Candy" Hunter Jr. & Little Richard — 1972 Boogie Revival</p>
          </div>
          <Volume2 className="w-5 h-5 text-amber-400/60 shrink-0" />
        </CardContent>
      </Card>

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
        <h2 className="text-2xl font-bold">Legacy Restored & Legacy Continued</h2>
        <p className="text-slate-400">The original 6 subsidiaries form the foundation. The digital platform products carry the legacy forward.</p>
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

      {/* Featured Book - Dad's Published Works */}
      <Card className="bg-gradient-to-r from-amber-900/60 to-stone-800 border-amber-700/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/oiSGBGXClDhKLqMj.png"
                alt="All About Candy by Seabrun Hunter"
                className="w-32 h-44 object-cover rounded-lg shadow-xl"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <Badge className="bg-amber-600 text-white">Featured Book</Badge>
              <h3 className="text-2xl font-bold text-amber-200">All About Candy</h3>
              <p className="text-stone-300">The first book from the HAPPENINGS series — a true autobiography with real occurrences from the past of Seabrun "Candy" Hunter Jr. Available on Barnes & Noble.</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a href="https://www.barnesandnoble.com/w/all-about-candy-seabrun-hunter/1122724263?ean=2940150866133" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
                    <BookOpen className="w-4 h-4" />
                    Buy on Barnes & Noble
                  </Button>
                </a>
                <a href="/rrb/books">
                  <Button variant="outline" className="border-amber-600 text-amber-300 hover:bg-amber-900/50 gap-2">
                    View All 14 Books
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block shrink-0 text-center">
              <p className="text-5xl font-bold text-amber-400">14</p>
              <p className="text-sm text-amber-200/70">Published Books</p>
              <p className="text-xs text-stone-400 mt-1">on Barnes & Noble</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-600">
        <p>Canryn Production | Founded by {ecosystemConfig.data?.founder}</p>
        <p>Operated by {ecosystemConfig.data?.operators?.join(' and ')}</p>
        <p className="mt-2 text-amber-400 font-semibold">{ecosystemConfig.data?.motto}</p>
      </div>
    </div>
  );
}
