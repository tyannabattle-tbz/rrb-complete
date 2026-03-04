import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, Play, Pause, CheckCircle, Clock, BarChart3, Plus, 
  Radio, Wifi, Users, TrendingUp 
} from 'lucide-react';

interface Drill {
  id: string;
  name: string;
  description: string;
  type: 'mesh_network' | 'broadcast' | 'communication';
  status: 'scheduled' | 'active' | 'completed';
  scheduled_at: number;
  started_at?: number;
  completed_at?: number;
  participants: number;
  success_rate: number;
}

export default function EmergencyDrills() {
  const [drills, setDrills] = useState<Drill[]>([
    {
      id: 'drill-1',
      name: 'Mesh Network Connectivity Test',
      description: 'Test LoRa/Meshtastic mesh network reliability',
      type: 'mesh_network',
      status: 'completed',
      scheduled_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
      started_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
      completed_at: Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000,
      participants: 47,
      success_rate: 98.5,
    },
    {
      id: 'drill-2',
      name: 'Emergency Broadcast System',
      description: 'Test HybridCast emergency broadcast capability',
      type: 'broadcast',
      status: 'scheduled',
      scheduled_at: Date.now() + 3 * 24 * 60 * 60 * 1000,
      participants: 0,
      success_rate: 0,
    },
    {
      id: 'drill-3',
      name: 'Multi-Channel Communication',
      description: 'Test communication across multiple channels',
      type: 'communication',
      status: 'active',
      scheduled_at: Date.now(),
      started_at: Date.now(),
      participants: 23,
      success_rate: 95.2,
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'active':
        return <Play className="w-5 h-5 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mesh_network':
        return <Wifi className="w-5 h-5" />;
      case 'broadcast':
        return <Radio className="w-5 h-5" />;
      case 'communication':
        return <Users className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mesh_network':
        return 'bg-blue-100 text-blue-800';
      case 'broadcast':
        return 'bg-red-100 text-red-800';
      case 'communication':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedDrills = drills.filter(d => d.status === 'completed');
  const avgSuccessRate = completedDrills.length > 0 
    ? (completedDrills.reduce((sum, d) => sum + d.success_rate, 0) / completedDrills.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold text-white">Emergency Drills</h1>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Drill
          </Button>
        </div>
        <p className="text-gray-300">Test and validate emergency response systems</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Drills</p>
                <p className="text-3xl font-bold text-white mt-1">{completedDrills.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Success Rate</p>
                <p className="text-3xl font-bold text-white mt-1">{avgSuccessRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Participants</p>
                <p className="text-3xl font-bold text-white mt-1">{drills.reduce((sum, d) => sum + d.participants, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Now</p>
                <p className="text-3xl font-bold text-white mt-1">{drills.filter(d => d.status === 'active').length}</p>
              </div>
              <Play className="w-8 h-8 text-red-400 opacity-50 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drills List */}
      <div className="space-y-4">
        {drills.map(drill => (
          <Card key={drill.id} className="bg-slate-800/50 border-red-500/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(drill.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{drill.name}</h3>
                        <Badge className={getTypeColor(drill.type)}>
                          {drill.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{drill.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(drill.status)}
                    <span className="text-sm font-semibold text-white capitalize">{drill.status}</span>
                  </div>
                </div>

                {/* Drill Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-gray-400 text-xs">Participants</p>
                    <p className="text-white font-bold text-lg">{drill.participants}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-gray-400 text-xs">Success Rate</p>
                    <p className="text-white font-bold text-lg">{drill.success_rate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-gray-400 text-xs">Scheduled</p>
                    <p className="text-white font-bold text-sm">{new Date(drill.scheduled_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {drill.status === 'scheduled' && (
                    <>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Play className="w-4 h-4 mr-1" />
                        Start Drill
                      </Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </>
                  )}
                  {drill.status === 'active' && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Pause className="w-4 h-4 mr-1" />
                      End Drill
                    </Button>
                  )}
                  {drill.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
