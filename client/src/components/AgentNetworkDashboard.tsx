/**
 * Agent Network Dashboard
 * Unified interface for managing agent connections and cross-platform communications
 * Canryn Production and its subsidiaries
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Network, Send, Users, Activity, Shield, Plus, X } from 'lucide-react';

interface ConnectedAgent {
  peerId: string;
  agentId: string;
  agentName: string;
  status: string;
  trustLevel: number;
  sharedCapabilities: string[];
  lastCommunication: Date;
}

interface DiscoveredAgent {
  agentId: string;
  name: string;
  description: string;
  capabilities: string[];
  autonomyLevel: number;
  trustScore: number;
  uptime: number;
  messageCount: number;
}

export const AgentNetworkDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [discoveredAgents, setDiscoveredAgents] = useState<DiscoveredAgent[]>([]);
  const [connectedAgents, setConnectedAgents] = useState<ConnectedAgent[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [autonomyFilter, setAutonomyFilter] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100,
  });
  const [messageContent, setMessageContent] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [messageType, setMessageType] = useState<'query' | 'command' | 'notification'>('query');

  // Queries
  const { data: agentIdentity } = trpc.agentNetwork.getAgentIdentity.useQuery();
  const { data: networkStatsData } = trpc.agentNetwork.getNetworkStats.useQuery();
  const { data: connectedPeersData } = trpc.agentNetwork.getConnectedPeers.useQuery();
  const { data: topAgentsData } = trpc.agentNetwork.getTopAgents.useQuery({ limit: 10 });

  // Mutations
  const discoverAgentsMutation = trpc.agentNetwork.discoverAgents.useMutation();
  const connectToAgentMutation = trpc.agentNetwork.connectToAgent.useMutation();
  const sendMessageMutation = trpc.agentNetwork.sendMessage.useMutation();
  const disconnectMutation = trpc.agentNetwork.disconnectFromAgent.useMutation();

  useEffect(() => {
    if (networkStatsData?.stats) {
      setNetworkStats(networkStatsData.stats);
    }
    if (connectedPeersData?.peers) {
      setConnectedAgents(connectedPeersData.peers);
    }
  }, [networkStatsData, connectedPeersData]);

  const handleDiscoverAgents = async () => {
    try {
      const result = await discoverAgentsMutation.mutateAsync({
        capabilities: selectedCapabilities.length > 0 ? selectedCapabilities : undefined,
        minAutonomy: autonomyFilter.min,
        maxAutonomy: autonomyFilter.max,
        limit: 20,
      });

      if (result.agents) {
        setDiscoveredAgents(result.agents);
      }
    } catch (error) {
      console.error('Error discovering agents:', error);
    }
  };

  const handleConnectToAgent = async (agentId: string) => {
    try {
      await connectToAgentMutation.mutateAsync({ agentId });
      // Refresh connected peers
      window.location.reload();
    } catch (error) {
      console.error('Error connecting to agent:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAgent || !messageContent) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        toAgentId: selectedAgent,
        type: messageType,
        payload: { content: messageContent },
        priority: 'normal',
        encrypted: true,
        requiresResponse: messageType === 'query',
      });

      setMessageContent('');
      alert('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleDisconnect = async (agentId: string) => {
    try {
      await disconnectMutation.mutateAsync({ agentId });
      setConnectedAgents(connectedAgents.filter((a) => a.agentId !== agentId));
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="w-8 h-8" />
            Agent Network Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage agent connections and cross-platform communications
          </p>
        </div>
      </div>

      {/* Agent Identity Card */}
      {agentIdentity?.identity && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Agent Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Agent ID</p>
                <p className="font-mono text-sm break-all">{agentIdentity.identity.agentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{agentIdentity.identity.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Autonomy Level</p>
                <p className="font-semibold">{agentIdentity.identity.autonomyLevel}%</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {agentIdentity.identity.capabilities.map((cap) => (
                  <Badge key={cap} variant="secondary">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Statistics */}
      {networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.totalAgents}</div>
              <p className="text-xs text-gray-500 mt-1">In network</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{networkStats.activeConnections}</div>
              <p className="text-xs text-gray-500 mt-1">Connected agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Trust Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.averageTrustScore.toFixed(1)}</div>
              <p className="text-xs text-gray-500 mt-1">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{networkStats.totalMessages}</div>
              <p className="text-xs text-gray-500 mt-1">Exchanged</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Top Agents by Trust Score
              </CardTitle>
              <CardDescription>Most trusted agents in the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgentsData?.agents?.map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{agent.name}</p>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                      <div className="flex gap-2 mt-2">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{agent.trustScore}</p>
                      <p className="text-xs text-gray-500">Trust</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discover Agents</CardTitle>
              <CardDescription>Find and connect with other agents in the network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Capabilities</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['ai-chat', 'autonomous-decision', 'monitoring', 'integration', 'offline', 'mobile'].map(
                      (cap) => (
                        <Button
                          key={cap}
                          variant={selectedCapabilities.includes(cap) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedCapabilities((prev) =>
                              prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
                            );
                          }}
                        >
                          {cap}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Autonomy</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={autonomyFilter.min}
                      onChange={(e) =>
                        setAutonomyFilter((prev) => ({ ...prev, min: parseInt(e.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Autonomy</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={autonomyFilter.max}
                      onChange={(e) =>
                        setAutonomyFilter((prev) => ({ ...prev, max: parseInt(e.target.value) }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={handleDiscoverAgents} disabled={discoverAgentsMutation.isPending} className="w-full">
                  {discoverAgentsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Discover Agents
                    </>
                  )}
                </Button>
              </div>

              {discoveredAgents.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold">Discovered Agents ({discoveredAgents.length})</h3>
                  {discoveredAgents.map((agent) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{agent.name}</p>
                        <p className="text-sm text-gray-600">{agent.description}</p>
                        <div className="flex gap-2 mt-2">
                          {agent.capabilities.slice(0, 2).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConnectToAgent(agent.agentId)}
                        disabled={connectToAgentMutation.isPending}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Tab */}
        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Connected Agents ({connectedAgents.length})
              </CardTitle>
              <CardDescription>Agents you are currently connected to</CardDescription>
            </CardHeader>
            <CardContent>
              {connectedAgents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No connected agents yet</p>
              ) : (
                <div className="space-y-3">
                  {connectedAgents.map((agent) => (
                    <div key={agent.peerId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{agent.agentName}</p>
                          <Badge
                            variant={agent.status === 'connected' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{agent.agentId}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Trust: {agent.trustLevel}%</span>
                          <span>Capabilities: {agent.sharedCapabilities.length}</span>
                          <span>Last: {new Date(agent.lastCommunication).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnect(agent.agentId)}
                        disabled={disconnectMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Message to Agent
              </CardTitle>
              <CardDescription>Send queries, commands, or notifications to connected agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Agent</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedAgents.map((agent) => (
                      <SelectItem key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message Type</label>
                <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="query">Query</SelectItem>
                    <SelectItem value="command">Command</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message Content</label>
                <Input
                  placeholder="Enter your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!selectedAgent || !messageContent || sendMessageMutation.isPending}
                className="w-full"
              >
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
