'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, MapPin, Volume2, Zap, Signal, Clock, Activity } from 'lucide-react';

interface BandMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'recording' | 'idle';
  location: string;
  audioLevel: number;
  signal: number;
  battery: number;
  lastActive: Date;
}

export function MultiOperatorDashboard() {
  const [members, setMembers] = useState<BandMember[]>([
    {
      id: 'member-1',
      name: 'Chris Battle Sr',
      role: 'Lead Vocals & Producer',
      status: 'recording',
      location: 'Main Studio - New York',
      audioLevel: 85,
      signal: 95,
      battery: 92,
      lastActive: new Date(),
    },
    {
      id: 'member-2',
      name: 'C.J. Battle',
      role: 'Drums & Percussion',
      status: 'online',
      location: 'Remote Studio - Atlanta',
      audioLevel: 72,
      signal: 78,
      battery: 68,
      lastActive: new Date(Date.now() - 120000),
    },
    {
      id: 'member-3',
      name: 'Kairen Battle',
      role: 'Bass & Keys',
      status: 'online',
      location: 'Field Recording - Miami',
      audioLevel: 58,
      signal: 62,
      battery: 45,
      lastActive: new Date(Date.now() - 300000),
    },
    {
      id: 'member-4',
      name: 'AP/Amandes Studio',
      role: 'Video & Production',
      status: 'idle',
      location: 'Post-Production - Los Angeles',
      audioLevel: 0,
      signal: 88,
      battery: 100,
      lastActive: new Date(Date.now() - 1800000),
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.status === 'recording' || member.status === 'online') {
            return {
              ...member,
              audioLevel: Math.max(0, Math.min(100, member.audioLevel + (Math.random() - 0.5) * 30)),
              signal: Math.max(20, Math.min(100, member.signal + (Math.random() - 0.5) * 15)),
              battery: Math.max(0, member.battery - Math.random() * 0.5),
            };
          }
          return member;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'idle':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'offline':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return 'text-green-400';
    if (signal >= 60) return 'text-blue-400';
    if (signal >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 60) return 'text-green-400';
    if (battery >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const onlineCount = members.filter((m) => m.status !== 'offline').length;
  const recordingCount = members.filter((m) => m.status === 'recording').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Total Members</div>
            <div className="text-3xl font-bold text-white">{members.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Online</div>
            <div className="text-3xl font-bold text-green-400">{onlineCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Recording</div>
            <div className="text-3xl font-bold text-red-400">{recordingCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/40 border-slate-700/30">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Avg Signal</div>
            <div className="text-3xl font-bold text-blue-400">
              {Math.round(members.reduce((a, b) => a + b.signal, 0) / members.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Band Members */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Band Members
        </h3>
        {members.map((member) => (
          <Card key={member.id} className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{member.name}</h4>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{member.location}</span>
                </div>

                {/* Audio Level */}
                {(member.status === 'recording' || member.status === 'online') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Audio Level
                      </span>
                      <span className="text-sm font-semibold text-white">{Math.round(member.audioLevel)} dB</span>
                    </div>
                    <Progress value={member.audioLevel} className="h-2 bg-slate-700" />
                  </div>
                )}

                {/* Signal & Battery */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Signal */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Signal className="w-3 h-3" />
                        Signal
                      </span>
                      <span className={`text-xs font-semibold ${getSignalColor(member.signal)}`}>
                        {Math.round(member.signal)}%
                      </span>
                    </div>
                    <Progress value={member.signal} className="h-1.5 bg-slate-700" />
                  </div>

                  {/* Battery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Battery
                      </span>
                      <span className={`text-xs font-semibold ${getBatteryColor(member.battery)}`}>
                        {Math.round(member.battery)}%
                      </span>
                    </div>
                    <Progress value={member.battery} className="h-1.5 bg-slate-700" />
                  </div>
                </div>

                {/* Last Active */}
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700/30">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last active:{' '}
                    {member.lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Avg Audio Level</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(
                  members.filter((m) => m.audioLevel > 0).reduce((a, b) => a + b.audioLevel, 0) /
                    Math.max(1, members.filter((m) => m.audioLevel > 0).length)
                )}{' '}
                dB
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Avg Signal Quality</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(members.reduce((a, b) => a + b.signal, 0) / members.length)}%
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Avg Battery</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(members.reduce((a, b) => a + b.battery, 0) / members.length)}%
              </div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Network Health</div>
              <div className="text-2xl font-bold text-green-400">Excellent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
