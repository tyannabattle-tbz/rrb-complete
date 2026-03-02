// HybridCast Emergency Broadcast Landing
// This is a re-export of the full HybridCast implementation

import { useState } from 'react';
import HybridCastBroadcaster from '@/components/HybridCastBroadcaster';
import { HybridCastStatusWidget } from '@/components/HybridCastStatusWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Wifi, Radio, Map, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HybridCastLanding() {
  const [activeTab, setActiveTab] = useState('broadcaster');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6 pt-24 md:pt-28 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400 animate-pulse" />
            <div>
              <h1 className="text-4xl font-bold text-white">HybridCast</h1>
              <p className="text-sm text-red-300">Emergency Broadcast System • Off-Grid Capable • Always Ready</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-500/20 text-green-400">🟢 READY</Badge>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Mesh Nodes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">24</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">Global</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Offline Capable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-400">✓</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="broadcaster" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Broadcaster</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="operators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Operators</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Broadcaster Tab */}
          <TabsContent value="broadcaster" className="space-y-6 mt-6">
            <HybridCastBroadcaster />
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6 mt-6">
            <HybridCastStatusWidget />
          </TabsContent>

          {/* Operators Tab */}
          <TabsContent value="operators" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Multi-Operator Control</CardTitle>
                <CardDescription>Manage multiple broadcast operators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Primary Operator', status: 'active', role: 'Admin' },
                    { name: 'Secondary Operator', status: 'standby', role: 'Operator' },
                    { name: 'Field Operator', status: 'offline', role: 'Field' },
                  ].map((op) => (
                    <div key={op.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div>
                        <p className="font-semibold text-white">{op.name}</p>
                        <p className="text-sm text-slate-400">{op.role}</p>
                      </div>
                      <Badge className={op.status === 'active' ? 'bg-green-500/20 text-green-400' : op.status === 'standby' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-600/20 text-slate-400'}>
                        {op.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Emergency Broadcast Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <p className="font-semibold text-white mb-2">Offline-First PWA</p>
                    <p className="text-sm text-slate-300">Works without internet connection</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <p className="font-semibold text-white mb-2">Mesh Networking</p>
                    <p className="text-sm text-slate-300">LoRa/Meshtastic support</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <p className="font-semibold text-white mb-2">MGRS Mapping</p>
                    <p className="text-sm text-slate-300">Military Grid Reference System</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/50">
                    <p className="font-semibold text-white mb-2">AI/VR Integration</p>
                    <p className="text-sm text-slate-300">AR/VR visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold text-lg">
            🚨 Send Alert
          </Button>
          <Button className="h-16 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold text-lg">
            📡 Broadcast
          </Button>
          <Button className="h-16 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold text-lg">
            🗺️ Map View
          </Button>
          <Button className="h-16 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-semibold text-lg">
            ⚙️ Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
