/**
 * Commercial Management Admin Dashboard
 * 
 * Allows admins to:
 * - Preview and manage all commercials
 * - Adjust rotation rules and frequency
 * - View listener analytics
 * - Manage commercial schedules per channel
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Settings, BarChart3, Plus, Trash2 } from 'lucide-react';

export default function CommercialManagement() {
  const [selectedCommercial, setSelectedCommercial] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const channels = [
    { id: 'legacy_restored', name: 'Legacy Restored' },
    { id: 'healing_frequencies', name: 'Healing Frequencies' },
    { id: 'proof_vault', name: 'Proof Vault' },
    { id: 'qmunity', name: 'QMunity' },
    { id: 'sweet_miracles', name: 'Sweet Miracles' },
    { id: 'music_radio', name: 'Music & Radio' },
    { id: 'studio_sessions', name: 'Studio Sessions' },
  ];

  const commercials = [
    {
      id: 'station_id_1',
      title: 'RRB Radio Station ID',
      category: 'station_id',
      duration: 30,
      bitrate: 192,
      voiceStyle: 'male_professional',
      playCount: 1240,
      channels: ['legacy_restored', 'music_radio', 'studio_sessions'],
      rotationFrequency: 4,
      priority: 8,
    },
    {
      id: 'psa_sweet_miracles_1',
      title: 'Sweet Miracles Foundation PSA',
      category: 'psa',
      duration: 60,
      bitrate: 128,
      voiceStyle: 'female_warm',
      playCount: 856,
      channels: ['sweet_miracles', 'qmunity'],
      rotationFrequency: 2,
      priority: 7,
    },
    {
      id: 'promo_rrb_radio',
      title: 'RRB Radio Promo',
      category: 'promo',
      duration: 45,
      bitrate: 192,
      voiceStyle: 'narrator',
      playCount: 1089,
      channels: ['all'],
      rotationFrequency: 3,
      priority: 6,
    },
    {
      id: 'division_annas_promotions',
      title: "Anna's Promotions Commercial",
      category: 'division',
      duration: 60,
      bitrate: 192,
      voiceStyle: 'female_professional',
      playCount: 342,
      channels: ['legacy_restored', 'music_radio'],
      rotationFrequency: 2,
      priority: 5,
    },
    {
      id: 'division_little_c',
      title: 'Little C Commercial',
      category: 'division',
      duration: 60,
      bitrate: 192,
      voiceStyle: 'male_energetic',
      playCount: 298,
      channels: ['music_radio', 'studio_sessions'],
      rotationFrequency: 2,
      priority: 5,
    },
    {
      id: 'division_seans_music',
      title: "Sean's Music Commercial",
      category: 'division',
      duration: 60,
      bitrate: 192,
      voiceStyle: 'male_warm',
      playCount: 267,
      channels: ['music_radio'],
      rotationFrequency: 3,
      priority: 5,
    },
  ];

  const filteredCommercials = commercials.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || c.channels.includes(selectedChannel);
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Commercial Management</h1>
        <p className="text-muted-foreground">Manage commercials, rotation rules, and broadcast schedules</p>
      </div>

      <Tabs defaultValue="commercials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commercials">Commercials</TabsTrigger>
          <TabsTrigger value="rotation">Rotation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Commercials Tab */}
        <TabsContent value="commercials" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search commercials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channels.map(ch => (
                  <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Commercial
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredCommercials.map(commercial => (
              <Card key={commercial.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{commercial.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {commercial.duration}s • {commercial.bitrate} kbps • {commercial.voiceStyle}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{commercial.category}</Badge>
                      <Badge variant="secondary">Priority {commercial.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Play Count</p>
                      <p className="text-2xl font-bold">{commercial.playCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rotation Freq</p>
                      <p className="text-2xl font-bold">{commercial.rotationFrequency}x/hr</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Channels</p>
                      <p className="text-2xl font-bold">{commercial.channels.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="mt-1">Active</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Play className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Volume2 className="w-4 h-4" />
                      Adjust Volume
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-2 ml-auto">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rotation Rules Tab */}
        <TabsContent value="rotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Rotation Rules</CardTitle>
              <CardDescription>Configure how often commercials play on each channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.map(channel => (
                <div key={channel.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{channel.name}</h4>
                    <Button size="sm" variant="outline">Edit Rules</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Commercials/Hour</p>
                      <p className="font-semibold">4</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Duration</p>
                      <p className="font-semibold">8 minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Active Commercials</p>
                      <p className="font-semibold">6</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">24,892</p>
                <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">52s</p>
                <p className="text-xs text-muted-foreground mt-1">Across all commercials</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Listener Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">18.4K</p>
                <p className="text-xs text-muted-foreground mt-1">Unique listeners</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">73%</p>
                <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Commercials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCommercials.slice(0, 3).map((commercial, idx) => (
                  <div key={commercial.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-semibold">#{idx + 1} {commercial.title}</p>
                      <p className="text-sm text-muted-foreground">{commercial.playCount} plays</p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Broadcast Schedule</CardTitle>
              <CardDescription>View and manage commercial air times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map(channel => (
                  <div key={channel.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{channel.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Commercial Break</span>
                        <span className="font-semibold">in 12 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Content</span>
                        <span className="font-semibold">Music Block #3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commercials Today</span>
                        <span className="font-semibold">28 / 96</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
