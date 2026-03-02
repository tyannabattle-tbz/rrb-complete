import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AgentProfile {
  agentId: string;
  name: string;
  description: string;
  capabilities: string[];
  platforms: string[];
  trustScore: number;
  status: 'online' | 'offline' | 'busy';
}

interface ConnectionRequest {
  requestId: string;
  sourceAgentId: string;
  targetAgentId: string;
  purpose: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const SeamlessAgentConnectionHub: React.FC = () => {
  const { toast } = useToast();
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [discoveredAgents, setDiscoveredAgents] = useState<AgentProfile[]>([]);
  const [activeChannels, setActiveChannels] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [connectionPurpose, setConnectionPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Discover agents
  const discoverAgentsMutation = trpc.seamlessAgentConnection.discoverAgents.useQuery(
    {
      capabilities: selectedCapabilities,
      minTrustScore: 50,
    },
    {
      enabled: selectedCapabilities.length > 0,
    }
  );

  // Get active channels
  const getActiveChannelsQuery = trpc.seamlessAgentConnection.getActiveChannels.useQuery();

  // Get connection recommendations
  const getRecommendationsQuery = trpc.seamlessAgentConnection.getConnectionRecommendations.useQuery();

  // Initiate connection
  const initiateConnectionMutation = trpc.seamlessAgentConnection.initiateConnectionRequest.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Connection Requested',
        description: `Connection request sent to ${selectedAgent?.name}`,
      });
      setConnectionPurpose('');
      setSelectedAgent(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept connection
  const acceptConnectionMutation = trpc.seamlessAgentConnection.acceptConnectionRequest.useMutation({
    onSuccess: () => {
      toast({
        title: 'Connection Accepted',
        description: 'Secure channel established',
      });
    },
  });

  // Broadcast message
  const broadcastMessageMutation = trpc.seamlessAgentConnection.broadcastMessage.useMutation({
    onSuccess: () => {
      toast({
        title: 'Message Broadcast',
        description: 'Message sent to all selected agents',
      });
    },
  });

  useEffect(() => {
    if (discoverAgentsMutation.data) {
      setDiscoveredAgents(discoverAgentsMutation.data);
    }
  }, [discoverAgentsMutation.data]);

  useEffect(() => {
    if (getActiveChannelsQuery.data) {
      setActiveChannels(getActiveChannelsQuery.data);
    }
  }, [getActiveChannelsQuery.data]);

  const handleDiscoverAgents = (capabilities: string[]) => {
    setSelectedCapabilities(capabilities);
  };

  const handleInitiateConnection = async () => {
    if (!selectedAgent || !connectionPurpose) {
      toast({
        title: 'Error',
        description: 'Please select an agent and provide a purpose',
        variant: 'destructive',
      });
      return;
    }

    initiateConnectionMutation.mutate({
      targetAgentId: selectedAgent.agentId,
      purpose: connectionPurpose,
      capabilities: selectedCapabilities,
    });
  };

  const handleAcceptConnection = (requestId: string) => {
    acceptConnectionMutation.mutate({ requestId });
  };

  const handleBroadcastMessage = (agentIds: string[], message: string) => {
    broadcastMessageMutation.mutate({
      targetAgentIds: agentIds,
      messageType: 'broadcast',
      payload: { message },
    });
  };

  const capabilityOptions = [
    'messaging',
    'streaming',
    'analytics',
    'distribution',
    'scheduling',
    'transcoding',
    'storage',
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Seamless Agent Connection Hub</h1>
        <p className="text-gray-600">Discover, connect, and communicate with other autonomous agents</p>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Discover Agents by Capabilities</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {capabilityOptions.map((cap) => (
                    <Button
                      key={cap}
                      variant={selectedCapabilities.includes(cap) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (selectedCapabilities.includes(cap)) {
                          setSelectedCapabilities(selectedCapabilities.filter((c) => c !== cap));
                        } else {
                          setSelectedCapabilities([...selectedCapabilities, cap]);
                        }
                      }}
                    >
                      {cap}
                    </Button>
                  ))}
                </div>
              </div>

              {discoveredAgents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Discovered Agents ({discoveredAgents.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discoveredAgents.map((agent) => (
                      <Card key={agent.agentId} className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{agent.name}</h4>
                            <p className="text-sm text-gray-600">{agent.description}</p>
                          </div>
                          <Badge
                            variant={agent.status === 'online' ? 'default' : 'secondary'}
                          >
                            {agent.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Capabilities:</p>
                            <div className="flex flex-wrap gap-1">
                              {agent.capabilities.map((cap) => (
                                <Badge key={cap} variant="outline" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium">Platforms:</p>
                            <div className="flex flex-wrap gap-1">
                              {agent.platforms.map((platform) => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm">Trust Score: {agent.trustScore}%</span>
                            <Button
                              size="sm"
                              onClick={() => setSelectedAgent(agent)}
                            >
                              Connect
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {selectedAgent && (
            <Card className="p-6 bg-blue-50">
              <h3 className="font-semibold mb-4">Initiate Connection to {selectedAgent.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Connection Purpose</label>
                  <Input
                    placeholder="e.g., Content distribution, Data analysis"
                    value={connectionPurpose}
                    onChange={(e) => setConnectionPurpose(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInitiateConnection}
                    disabled={initiateConnectionMutation.isPending}
                  >
                    {initiateConnectionMutation.isPending ? 'Connecting...' : 'Send Connection Request'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAgent(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Active Secure Channels</h2>

            {activeChannels.length > 0 ? (
              <div className="space-y-2">
                {activeChannels.map((channel) => (
                  <Card key={channel.channelId} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{channel.channelId}</h4>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant="outline">{channel.status}</Badge>
                        </p>
                        <p className="text-sm text-gray-600">
                          Messages: {channel.messageCount} | Latency: {channel.latency}ms
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No active channels</p>
            )}
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Requests</h2>

            {connectionRequests.length > 0 ? (
              <div className="space-y-2">
                {connectionRequests.map((request) => (
                  <Card key={request.requestId} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{request.sourceAgentId}</h4>
                        <p className="text-sm text-gray-600">Purpose: {request.purpose}</p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptConnection(request.requestId)}
                          >
                            Accept
                          </Button>
                          <Button variant="outline" size="sm">
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                          {request.status}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No pending requests</p>
            )}
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recommended Connections</h2>

            {getRecommendationsQuery.data && getRecommendationsQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getRecommendationsQuery.data.map((rec) => (
                  <Card key={rec.agentId} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{rec.name}</h4>
                      <p className="text-sm text-gray-600">Compatibility: {rec.compatibilityScore}%</p>
                      <p className="text-sm text-gray-600">Purpose: {rec.recommendedPurpose}</p>
                      <div>
                        <p className="text-sm font-medium">Common Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.commonCapabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" size="sm">
                        Connect
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recommendations available</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
