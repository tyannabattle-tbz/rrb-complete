/**
 * Broadcast Channel Management
 * Manage all broadcast channels and streaming configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Channel {
  id: number;
  name: string;
  frequency?: string;
  status: 'active' | 'inactive' | 'maintenance';
  listeners: number;
  streamUrl: string;
}

export default function BroadcastChannelManagement() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChannelName, setNewChannelName] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        // TODO: Implement tRPC query to fetch channels
        // const { data } = await trpc.channels.list.useQuery();
        // setChannels(data);
      } catch (error) {
        toast.error('Failed to load channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Channel name is required');
      return;
    }

    setCreating(true);
    try {
      // TODO: Implement tRPC mutation to create channel
      toast.success('Channel created successfully');
      setNewChannelName('');
    } catch (error) {
      toast.error('Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleChannel = async (channelId: number) => {
    try {
      // TODO: Implement tRPC mutation to toggle channel status
      toast.success('Channel status updated');
    } catch (error) {
      toast.error('Failed to update channel');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Broadcast Channel Management</h1>
          <p className="text-muted-foreground">Manage all your broadcast channels and streaming configuration</p>
        </div>

        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Active Channels</TabsTrigger>
            <TabsTrigger value="create">Create Channel</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Loading channels...</p>
                </CardContent>
              </Card>
            ) : channels.length > 0 ? (
              <div className="grid gap-4">
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{channel.name}</CardTitle>
                          <CardDescription>
                            {channel.frequency && `Frequency: ${channel.frequency}`}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {channel.listeners.toLocaleString()} listeners
                          </p>
                          <p className={`text-xs font-semibold ${
                            channel.status === 'active' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {channel.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Stream URL</Label>
                        <p className="font-mono text-sm break-all">{channel.streamUrl}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleChannel(channel.id)}
                        >
                          {channel.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No channels yet. Create one to get started.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Channel</CardTitle>
                <CardDescription>Set up a new broadcast channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="channel-name">Channel Name</Label>
                  <Input
                    id="channel-name"
                    placeholder="Enter channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="channel-frequency">Frequency (Optional)</Label>
                  <Input
                    id="channel-frequency"
                    placeholder="e.g., 88.5 FM"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="channel-description">Description</Label>
                  <Input
                    id="channel-description"
                    placeholder="Describe your channel"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleCreateChannel}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Channel'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Channel Settings</CardTitle>
                <CardDescription>Configure default channel behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-bitrate">Default Bitrate</Label>
                  <Input
                    id="default-bitrate"
                    placeholder="128 kbps"
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-listeners">Max Concurrent Listeners</Label>
                  <Input
                    id="max-listeners"
                    type="number"
                    placeholder="10000"
                    className="mt-2"
                  />
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
