import { useState } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Server,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description: string;
}

interface DeploymentConfig {
  serverUrl: string;
  environment: "development" | "staging" | "production";
  port: number;
  workers: number;
  maxMemory: number;
  timeout: number;
  variables: EnvVariable[];
}

export default function DeploymentConfig() {
  const [config, setConfig] = useState<DeploymentConfig>({
    serverUrl: "https://agent.example.com",
    environment: "development",
    port: 3000,
    workers: 4,
    maxMemory: 2048,
    timeout: 30,
    variables: [
      {
        id: "1",
        key: "NODE_ENV",
        value: "development",
        isSecret: false,
        description: "Node environment",
      },
      {
        id: "2",
        key: "LOG_LEVEL",
        value: "info",
        isSecret: false,
        description: "Logging level",
      },
    ],
  });

  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [newVar, setNewVar] = useState({ key: "", value: "", description: "", isSecret: false });
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");

  const toggleSecretVisibility = (id: string) => {
    const newShow = new Set(showSecrets);
    if (newShow.has(id)) {
      newShow.delete(id);
    } else {
      newShow.add(id);
    }
    setShowSecrets(newShow);
  };

  const addVariable = () => {
    if (!newVar.key.trim()) {
      toast.error("Variable key is required");
      return;
    }

    const variable: EnvVariable = {
      id: Date.now().toString(),
      key: newVar.key,
      value: newVar.value,
      isSecret: newVar.isSecret,
      description: newVar.description,
    };

    setConfig({
      ...config,
      variables: [...config.variables, variable],
    });

    setNewVar({ key: "", value: "", description: "", isSecret: false });
    toast.success("Variable added successfully");
  };

  const removeVariable = (id: string) => {
    setConfig({
      ...config,
      variables: config.variables.filter((v) => v.id !== id),
    });
    toast.success("Variable removed");
  };

  const updateVariable = (id: string, updates: Partial<EnvVariable>) => {
    setConfig({
      ...config,
      variables: config.variables.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportConfig = () => {
    const envContent = config.variables
      .map((v) => `${v.key}=${v.isSecret ? "***" : v.value}`)
      .join("\n");

    const blob = new Blob([envContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Configuration exported");
  };

  const deployConfig = async () => {
    setDeploymentStatus("deploying");
    try {
      // Simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDeploymentStatus("success");
      toast.success("Deployment successful!");
      setTimeout(() => setDeploymentStatus("idle"), 3000);
    } catch (error) {
      setDeploymentStatus("error");
      toast.error("Deployment failed");
      setTimeout(() => setDeploymentStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Server Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server size={20} />
          <h3 className="text-lg font-semibold">Server Configuration</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Server URL</label>
            <Input
              value={config.serverUrl}
              onChange={(e) =>
                setConfig({ ...config, serverUrl: e.target.value })
              }
              placeholder="https://agent.example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Environment</label>
            <select
              value={config.environment}
              onChange={(e) =>
                setConfig({
                  ...config,
                  environment: e.target.value as any,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Port</label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) =>
                setConfig({ ...config, port: parseInt(e.target.value) })
              }
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Workers</label>
            <Input
              type="number"
              value={config.workers}
              onChange={(e) =>
                setConfig({ ...config, workers: parseInt(e.target.value) })
              }
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Max Memory (MB)</label>
            <Input
              type="number"
              value={config.maxMemory}
              onChange={(e) =>
                setConfig({ ...config, maxMemory: parseInt(e.target.value) })
              }
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Timeout (seconds)</label>
            <Input
              type="number"
              value={config.timeout}
              onChange={(e) =>
                setConfig({ ...config, timeout: parseInt(e.target.value) })
              }
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Environment Variables */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <h3 className="text-lg font-semibold">Environment Variables</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportConfig}>
              Export .env
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Environment Variable</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    <Input
                      value={newVar.key}
                      onChange={(e) =>
                        setNewVar({ ...newVar, key: e.target.value })
                      }
                      placeholder="VARIABLE_NAME"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      value={newVar.value}
                      onChange={(e) =>
                        setNewVar({ ...newVar, value: e.target.value })
                      }
                      placeholder="value"
                      type={newVar.isSecret ? "password" : "text"}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newVar.description}
                      onChange={(e) =>
                        setNewVar({ ...newVar, description: e.target.value })
                      }
                      placeholder="What is this variable for?"
                      className="mt-1 h-20"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newVar.isSecret}
                      onChange={(e) =>
                        setNewVar({ ...newVar, isSecret: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Mark as secret</span>
                  </label>
                  <Button onClick={addVariable} className="w-full">
                    Add Variable
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Variables List */}
        <div className="space-y-2">
          {config.variables.map((variable) => (
            <div
              key={variable.id}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-semibold">
                    {variable.key}
                  </code>
                  {variable.isSecret && (
                    <Badge variant="outline" className="text-xs">
                      Secret
                    </Badge>
                  )}
                </div>
                {variable.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {variable.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background px-2 py-1 rounded">
                  <code className="text-xs font-mono">
                    {showSecrets.has(variable.id)
                      ? variable.value
                      : variable.isSecret
                        ? "•".repeat(Math.min(variable.value.length, 8))
                        : variable.value}
                  </code>
                  {variable.isSecret && (
                    <button
                      onClick={() => toggleSecretVisibility(variable.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {showSecrets.has(variable.id) ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(variable.value)}
                >
                  <Copy size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(variable.id)}
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Deployment Status */}
      <Card className="p-6 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deployment Status</h3>
          {deploymentStatus === "success" && (
            <Badge className="bg-success/10 text-success">
              <CheckCircle size={14} className="mr-1" />
              Deployed
            </Badge>
          )}
          {deploymentStatus === "error" && (
            <Badge className="bg-destructive/10 text-destructive">
              <AlertCircle size={14} className="mr-1" />
              Failed
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Environment</p>
            <p className="font-semibold capitalize">{config.environment}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Port</p>
            <p className="font-semibold">{config.port}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Workers</p>
            <p className="font-semibold">{config.workers}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variables</p>
            <p className="font-semibold">{config.variables.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={deployConfig}
            disabled={deploymentStatus === "deploying"}
            className="flex-1"
          >
            <Server size={16} className="mr-2" />
            {deploymentStatus === "deploying" ? "Deploying..." : "Deploy"}
          </Button>
          <Button variant="outline" className="flex-1">
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button variant="outline" className="flex-1">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
