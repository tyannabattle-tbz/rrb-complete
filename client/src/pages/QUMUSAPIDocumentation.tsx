/**
 * QUMUS API Documentation Portal
 * Interactive API reference with examples, authentication, and integration guides
 * Enables external systems to integrate with QUMUS autonomously
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Search } from 'lucide-react';

interface APIEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: {
    status: number;
    example: Record<string, any>;
  };
  authentication: 'bearer' | 'api-key' | 'none';
  rateLimit: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    name: 'Create Collaboration Session',
    method: 'POST',
    path: '/api/trpc/collaboration.createSession',
    description: 'Start a new co-hosting session on an RRB Radio channel',
    parameters: [
      { name: 'channelId', type: 'string', required: true, description: 'Target RRB channel ID' },
      { name: 'title', type: 'string', required: true, description: 'Session title' },
      { name: 'description', type: 'string', required: false, description: 'Session description' },
      { name: 'primaryHostId', type: 'string', required: true, description: 'Primary host ID' },
    ],
    response: {
      status: 200,
      example: {
        id: 'collab_1234567890_abc123',
        channelId: 'rrb_channel_1',
        title: 'Live Co-hosting Session',
        status: 'idle',
        hosts: [{ id: 'host_1', name: 'Host Name', role: 'primary' }],
      },
    },
    authentication: 'bearer',
    rateLimit: '100 requests/minute',
  },
  {
    name: 'Add Host to Session',
    method: 'POST',
    path: '/api/trpc/collaboration.addHost',
    description: 'Add a co-host to an active collaboration session',
    parameters: [
      { name: 'sessionId', type: 'string', required: true, description: 'Collaboration session ID' },
      { name: 'hostId', type: 'string', required: true, description: 'Host ID to add' },
      { name: 'hostName', type: 'string', required: true, description: 'Display name' },
      { name: 'role', type: 'string', required: false, description: 'Host role (secondary, guest, moderator)' },
    ],
    response: {
      status: 200,
      example: {
        id: 'host_2',
        name: 'Co-host Name',
        role: 'secondary',
        status: 'online',
        micActive: true,
      },
    },
    authentication: 'bearer',
    rateLimit: '50 requests/minute',
  },
  {
    name: 'Process Creator Payout',
    method: 'POST',
    path: '/api/trpc/payments.processPayout',
    description: 'Process royalty payout for a creator via Stripe',
    parameters: [
      { name: 'creatorId', type: 'string', required: true, description: 'Creator ID' },
      { name: 'amount', type: 'number', required: false, description: 'Payout amount (USD)' },
    ],
    response: {
      status: 200,
      example: {
        id: 'payout_1234567890_abc123',
        creatorId: 'creator_1',
        amount: 150.5,
        status: 'pending',
        stripePayoutId: 'po_1234567890',
      },
    },
    authentication: 'bearer',
    rateLimit: '20 requests/minute',
  },
  {
    name: 'Get Ecosystem Status',
    method: 'GET',
    path: '/api/trpc/ecosystem.getStatus',
    description: 'Get real-time status of all QUMUS subsystems',
    parameters: [],
    response: {
      status: 200,
      example: {
        isRunning: true,
        totalSystems: 18,
        healthyCount: 18,
        degradedCount: 0,
        overallHealth: '100%',
        systems: [
          { name: 'Stream Engine', status: 'healthy', uptime: 99.9 },
        ],
      },
    },
    authentication: 'none',
    rateLimit: '1000 requests/minute',
  },
  {
    name: 'Submit Training Progress',
    method: 'POST',
    path: '/api/trpc/training.trackProgress',
    description: 'Track user progress in training modules',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'User ID' },
      { name: 'moduleId', type: 'string', required: true, description: 'Training module ID' },
      { name: 'lessonsCompleted', type: 'number', required: true, description: 'Lessons completed' },
      { name: 'score', type: 'number', required: true, description: 'Module score (0-100)' },
    ],
    response: {
      status: 200,
      example: {
        userId: 'user_123',
        moduleId: 'operator_0',
        score: 85,
        certificateEarned: true,
      },
    },
    authentication: 'bearer',
    rateLimit: '100 requests/minute',
  },
  {
    name: 'Create Donation',
    method: 'POST',
    path: '/api/trpc/payments.createDonation',
    description: 'Create a donation for legacy recovery efforts',
    parameters: [
      { name: 'amount', type: 'number', required: true, description: 'Donation amount (USD)' },
      { name: 'donorEmail', type: 'string', required: true, description: 'Donor email' },
      { name: 'purpose', type: 'string', required: true, description: 'Purpose (legacy_recovery, general_support, content_creation)' },
      { name: 'message', type: 'string', required: false, description: 'Optional message' },
    ],
    response: {
      status: 200,
      example: {
        id: 'donation_1234567890_abc123',
        amount: 50,
        purpose: 'legacy_recovery',
        status: 'pending',
        createdAt: 1711270800000,
      },
    },
    authentication: 'none',
    rateLimit: '50 requests/minute',
  },
];

export default function QUMUSAPIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(API_ENDPOINTS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredEndpoints = API_ENDPOINTS.filter(
    (ep) =>
      ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const generateCurlExample = (endpoint: APIEndpoint) => {
    const authHeader = endpoint.authentication === 'bearer' ? '-H "Authorization: Bearer YOUR_TOKEN" ' : '';
    const method = endpoint.method === 'GET' ? '' : `-X ${endpoint.method} `;
    const data =
      endpoint.method !== 'GET'
        ? `-d '${JSON.stringify(endpoint.response.example)}' `
        : '';

    return `curl ${method}${authHeader}-H "Content-Type: application/json" ${data}https://api.qumus.manus.space${endpoint.path}`;
  };

  const generateJavaScriptExample = (endpoint: APIEndpoint) => {
    return `const response = await fetch('https://api.qumus.manus.space${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    ${endpoint.authentication === 'bearer' ? "'Authorization': 'Bearer YOUR_TOKEN'," : ''}
  },
  ${endpoint.method !== 'GET' ? `body: JSON.stringify(${JSON.stringify(endpoint.response.example, null, 2)})` : ''}
});

const data = await response.json();
console.log(data);`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">QUMUS API Documentation</h1>
          <p className="text-purple-200 text-lg">
            Integrate with QUMUS autonomously. Complete API reference with examples and authentication guides.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400">{API_ENDPOINTS.length}</div>
              <p className="text-slate-400 text-sm">API Endpoints</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-400">v1.0</div>
              <p className="text-slate-400 text-sm">API Version</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-400">99.9%</div>
              <p className="text-slate-400 text-sm">Uptime SLA</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-400">REST</div>
              <p className="text-slate-400 text-sm">Architecture</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoints List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Endpoints</CardTitle>
                <CardDescription>Search and select endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search endpoints..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredEndpoints.map((endpoint) => (
                    <button
                      key={endpoint.path}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className={`w-full text-left p-3 rounded transition-colors ${
                        selectedEndpoint?.path === endpoint.path
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                      </div>
                      <div className="text-sm font-mono truncate">{endpoint.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endpoint Details */}
          <div className="lg:col-span-2">
            {selectedEndpoint && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <CardTitle className="text-white">{selectedEndpoint.name}</CardTitle>
                      <CardDescription>{selectedEndpoint.description}</CardDescription>
                    </div>
                    <Badge className={getMethodColor(selectedEndpoint.method)}>
                      {selectedEndpoint.method}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Endpoint Path */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Endpoint</h3>
                    <div className="bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm text-purple-300 flex items-center justify-between">
                      <span>{selectedEndpoint.path}</span>
                      <button
                        onClick={() => copyToClipboard(selectedEndpoint.path, 'path')}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Parameters */}
                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Parameters</h3>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param) => (
                          <div key={param.name} className="bg-slate-900 border border-slate-700 rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-purple-300 font-mono">{param.name}</code>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && <Badge variant="destructive">Required</Badge>}
                            </div>
                            <p className="text-slate-400 text-sm">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authentication */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Authentication</h3>
                    <Badge className="bg-blue-600">{selectedEndpoint.authentication.toUpperCase()}</Badge>
                  </div>

                  {/* Rate Limit */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Rate Limit</h3>
                    <p className="text-slate-300">{selectedEndpoint.rateLimit}</p>
                  </div>

                  {/* Response Example */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Response Example</h3>
                    <div className="bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm text-green-300 overflow-x-auto flex items-start justify-between">
                      <pre>{JSON.stringify(selectedEndpoint.response.example, null, 2)}</pre>
                      <button
                        onClick={() =>
                          copyToClipboard(JSON.stringify(selectedEndpoint.response.example, null, 2), 'response')
                        }
                        className="text-slate-400 hover:text-white transition-colors ml-4"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-slate-700">
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl" className="space-y-2">
                      <div className="bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm text-green-300 overflow-x-auto">
                        <pre>{generateCurlExample(selectedEndpoint)}</pre>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(generateCurlExample(selectedEndpoint), 'curl')
                        }
                        variant="outline"
                        className="w-full"
                      >
                        {copiedCode === 'curl' ? 'Copied!' : 'Copy cURL'}
                      </Button>
                    </TabsContent>

                    <TabsContent value="javascript" className="space-y-2">
                      <div className="bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm text-yellow-300 overflow-x-auto">
                        <pre>{generateJavaScriptExample(selectedEndpoint)}</pre>
                      </div>
                      <Button
                        onClick={() =>
                          copyToClipboard(generateJavaScriptExample(selectedEndpoint), 'js')
                        }
                        variant="outline"
                        className="w-full"
                      >
                        {copiedCode === 'js' ? 'Copied!' : 'Copy JavaScript'}
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* External Links */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View in Postman
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      API Reference
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400">
          <p>
            Need help? Check out our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              integration guides
            </a>
            {' '}or{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
