import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";

interface APIEndpoint {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  params?: Record<string, string>;
  example: string;
}

const endpoints: APIEndpoint[] = [
  {
    name: "Create Session",
    method: "POST",
    path: "/trpc/agent.createSession",
    description: "Create a new agent session",
    params: {
      sessionName: "string",
      systemPrompt: "string",
      temperature: "number",
      model: "string",
      maxSteps: "number",
    },
    example: `const result = await trpc.system.createSession.mutate({
  sessionName: "My Session",
  systemPrompt: "You are a helpful assistant",
  temperature: 70,
  model: "gpt-4-turbo",
  maxSteps: 50
});`,
  },
  {
    name: "Get Sessions",
    method: "GET",
    path: "/trpc/agent.getSessions",
    description: "Retrieve all user sessions",
    example: `const { data: sessions } = trpc.system.getSessions.useQuery();`,
  },
  {
    name: "Add Message",
    method: "POST",
    path: "/trpc/messages.addMessage",
    description: "Add a message to a session",
    params: {
      sessionId: "number",
      role: "user | assistant",
      content: "string",
    },
    example: `await trpc.messages.addMessage.mutate({
  sessionId: 1,
  role: "user",
  content: "Hello, how are you?"
});`,
  },
  {
    name: "Clone Agent",
    method: "POST",
    path: "/trpc/agentCloning.cloneAgent",
    description: "Clone an existing agent with configuration",
    params: {
      sourceAgentId: "number",
      newName: "string",
      includeHistory: "boolean",
    },
    example: `const cloned = await trpc.integrations.agentCloning.cloneAgent.mutate({
  sourceAgentId: 1,
  newName: "Cloned Agent",
  includeHistory: true
});`,
  },
  {
    name: "Get Usage Quotas",
    method: "GET",
    path: "/trpc/usageQuotas.getQuotas",
    description: "Retrieve current usage quotas",
    example: `const { data: quotas } = trpc.admin.usageQuotas.getQuotas.useQuery();`,
  },
  {
    name: "Send Collaboration Invite",
    method: "POST",
    path: "/trpc/collaborationInvites.sendInvite",
    description: "Send a collaboration invite to another user",
    params: {
      sessionId: "number",
      inviteeEmail: "string",
      permissionLevel: "view | edit | admin",
    },
    example: `await trpc.integrations.collaborationInvites.sendInvite.mutate({
  sessionId: 1,
  inviteeEmail: "user@example.com",
  permissionLevel: "edit"
});`,
  },
];

export function APIDocumentation() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete reference for tRPC endpoints and usage examples
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Installation</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>npm install @trpc/client @trpc/react-query</code>
            </pre>
          </div>
          <div>
            <h3 className="font-medium mb-2">Basic Usage</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { trpc } from '@/lib/trpc';

// Query
const { data } = trpc.system.getSessions.useQuery();

// Mutation
const mutation = trpc.system.createSession.useMutation();
mutation.mutate({ ... });`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        {endpoints.map((endpoint, index) => (
          <Card key={`api-${index}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        endpoint.method === "GET"
                          ? "bg-blue-600"
                          : endpoint.method === "POST"
                            ? "bg-green-600"
                            : endpoint.method === "PUT"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    {endpoint.name}
                  </CardTitle>
                  <CardDescription className="mt-2 font-mono text-xs">
                    {endpoint.path}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </div>

              {endpoint.params && (
                <div>
                  <p className="text-sm font-medium mb-2">Parameters</p>
                  <div className="space-y-1">
                    {Object.entries(endpoint.params).map(([key, type]) => (
                      <div key={key} className="text-sm font-mono">
                        <span className="text-blue-600">{key}</span>
                        <span className="text-muted-foreground">: {type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Example</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(endpoint.example, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{endpoint.example}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`const mutation = trpc.system.createSession.useMutation({
  onSuccess: (data) => {
    console.log("Session created:", data);
  },
  onError: (error) => {
    console.error("Error:", error.message);
  },
});`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            All endpoints require authentication via Manus OAuth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Authentication is handled automatically by the tRPC client. Your session cookie is sent with each request.
          </p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`// Check authentication status
const { data: user } = trpc.auth.me.useQuery();

// Logout
const logout = trpc.auth.logout.useMutation();`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
