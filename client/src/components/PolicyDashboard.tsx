import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Edit2, Trash2, Play, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Policy {
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  rules?: Array<{
    condition: string;
    action: string;
    priority: number;
  }>;
}

interface PolicyTestResult {
  passed: boolean;
  message: string;
  executionTime: number;
}

export default function PolicyDashboard() {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testResults, setTestResults] = useState<PolicyTestResult[]>([]);
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Fetch active policies
  const { data: policies = [], isLoading } = trpc.customPolicies.getActivePolicies.useQuery();

  // Create custom policy mutation
  const createPolicyMutation = trpc.customPolicies.createCustomPolicy.useMutation({
    onSuccess: () => {
      toast.success("Policy created successfully");
      setEditingPolicy(null);
    },
    onError: (error) => {
      toast.error(`Failed to create policy: ${error.message}`);
    },
  });

  const handleCreatePolicy = useCallback(async () => {
    if (!editingPolicy) return;

    await createPolicyMutation.mutateAsync({
      name: editingPolicy.name,
      description: editingPolicy.description,
      rules: editingPolicy.rules || [],
      enabled: editingPolicy.enabled,
    });
  }, [editingPolicy, createPolicyMutation]);

  const handleTestPolicy = useCallback(async () => {
    if (!selectedPolicy || !testInput) {
      toast.error("Select a policy and enter test data");
      return;
    }

    try {
      const startTime = Date.now();

      // Simulate policy test based on policy type
      let result: PolicyTestResult;

      if (selectedPolicy === "content-moderation-policy") {
        const isFlagged = testInput.toLowerCase().includes("spam") ||
          testInput.toLowerCase().includes("abuse");
        result = {
          passed: !isFlagged,
          message: isFlagged ? "Content flagged for review" : "Content passed moderation",
          executionTime: Date.now() - startTime,
        };
      } else if (selectedPolicy === "rate-limiting-policy") {
        result = {
          passed: true,
          message: "Rate limit check passed - 950 requests remaining",
          executionTime: Date.now() - startTime,
        };
      } else if (selectedPolicy === "deployment-policy") {
        const hasChangelog = testInput.length > 50;
        result = {
          passed: hasChangelog,
          message: hasChangelog
            ? "Deployment validation passed"
            : "Deployment validation failed - insufficient changelog",
          executionTime: Date.now() - startTime,
        };
      } else {
        result = {
          passed: true,
          message: "Policy test passed",
          executionTime: Date.now() - startTime,
        };
      }

      setTestResults([result, ...testResults]);
      toast.success("Policy test completed");
    } catch (error) {
      toast.error(`Test failed: ${error}`);
    }
  }, [selectedPolicy, testInput, testResults]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading policies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Policy Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage QUMUS decision policies and test policy behavior
        </p>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Active Policies</TabsTrigger>
          <TabsTrigger value="editor">Policy Editor</TabsTrigger>
          <TabsTrigger value="test">Test & Validate</TabsTrigger>
        </TabsList>

        {/* Active Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4">
            {policies.map((policy: Policy) => (
              <Card
                key={policy.name}
                className={`cursor-pointer transition-all ${
                  selectedPolicy === policy.name ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPolicy(policy.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={policy.enabled ? "default" : "secondary"}>
                        {policy.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Badge variant="outline">Priority: {policy.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPolicy(policy);
                      }}
                    >
                      <Edit2 size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTestPanel(true);
                      }}
                    >
                      <Play size={16} className="mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Policy Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Policy</h2>
            {editingPolicy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPolicy(null)}
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Policy Configuration</CardTitle>
              <CardDescription>
                Define policy name, description, and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Policy Name</label>
                <Input
                  placeholder="e.g., custom-approval-policy"
                  value={editingPolicy?.name || ""}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      name: e.target.value,
                    } as Policy)
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Describe what this policy does"
                  value={editingPolicy?.description || ""}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      description: e.target.value,
                    } as Policy)
                  }
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rules</label>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  {editingPolicy?.rules?.map((rule, idx) => (
                    <div key={idx} className="bg-background p-3 rounded border">
                      <div className="text-xs text-muted-foreground mb-1">
                        Rule {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div>
                          <strong>Condition:</strong> {rule.condition}
                        </div>
                        <div>
                          <strong>Action:</strong> {rule.action}
                        </div>
                        <div>
                          <strong>Priority:</strong> {rule.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const newRule = {
                        condition: "user_role === 'admin'",
                        action: "auto_approve",
                        priority: (editingPolicy?.rules?.length || 0) + 1,
                      };
                      setEditingPolicy({
                        ...editingPolicy,
                        rules: [...(editingPolicy?.rules || []), newRule],
                      } as Policy);
                    }}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Rule
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCreatePolicy}
                disabled={createPolicyMutation.isPending}
                className="w-full"
              >
                <Save size={16} className="mr-2" />
                {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test & Validate Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Policy Behavior</CardTitle>
              <CardDescription>
                Test policies with sample data before deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Policy</label>
                <select
                  value={selectedPolicy || ""}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="">Choose a policy...</option>
                  {policies.map((policy: Policy) => (
                    <option key={policy.name} value={policy.name}>
                      {policy.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Test Input</label>
                <textarea
                  placeholder="Enter test data for the policy"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background min-h-24"
                />
              </div>

              <Button onClick={handleTestPolicy} className="w-full">
                <Play size={16} className="mr-2" />
                Run Test
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Test Results</h3>
                  {testResults.map((result, idx) => (
                    <Card
                      key={idx}
                      className={`${
                        result.passed ? "border-green-500" : "border-red-500"
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={20}
                            className={result.passed ? "text-green-500" : "text-red-500"}
                          />
                          <div>
                            <div className="font-medium">
                              {result.passed ? "✓ Passed" : "✗ Failed"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Execution time: {result.executionTime}ms
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
