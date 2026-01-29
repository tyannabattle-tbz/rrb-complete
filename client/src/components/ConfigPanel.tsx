import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RotateCcw, Key } from "lucide-react";

interface ConfigPanelProps {
  sessionId?: number;
  config?: {
    systemPrompt?: string;
    temperature?: number;
    model?: string;
    maxSteps?: number;
  };
  onSaveConfig?: (config: any) => Promise<void>;
  onApiKeyClick?: () => void;
}

const DEFAULT_SYSTEM_PROMPT = `You are an advanced autonomous AI agent with access to powerful tools.

CORE CAPABILITIES:
1. Web Browsing: Navigate websites, extract content, interact with pages
2. Persistent Memory: Store and retrieve information across sessions
3. Web Search: Find information on the internet
4. API Integration: Interact with external services
5. File Operations: Read, write, and manage files
6. Shell Commands: Execute system commands

AVAILABLE TOOLS:
- Browser: navigate, screenshot, get_content, get_text, click, fill, search
- Memory: store, retrieve, list, search, delete
- Web: search
- API: request (GET, POST, PUT, DELETE)
- File: read, write, append
- Shell: execute

PRINCIPLES:
1. Use memory to maintain state across steps
2. Search the web for current information
3. Interact with APIs to fetch or update data
4. Always maintain a clear plan in todo.md
5. Learn from failures and adapt your approach

CONSTRAINTS:
- Maximum steps per task
- All operations are logged for debugging
- Respect rate limits and timeouts`;

export default function ConfigPanel({
  sessionId,
  config = {},
  onSaveConfig,
  onApiKeyClick,
}: ConfigPanelProps) {
  const [systemPrompt, setSystemPrompt] = useState(
    config.systemPrompt || DEFAULT_SYSTEM_PROMPT
  );
  const [temperature, setTemperature] = useState(config.temperature || 70);
  const [model, setModel] = useState(config.model || "gpt-4-turbo");
  const [maxSteps, setMaxSteps] = useState(config.maxSteps || 50);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!sessionId) return;

    setIsSaving(true);
    try {
      await onSaveConfig?.({
        systemPrompt,
        temperature,
        model,
        maxSteps,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSystemPrompt(config.systemPrompt || DEFAULT_SYSTEM_PROMPT);
    setTemperature(config.temperature || 70);
    setModel(config.model || "gpt-4-turbo");
    setMaxSteps(config.maxSteps || 50);
  };

  return (
    <div className="h-full flex flex-col bg-background p-6 overflow-y-auto scrollbar-elegant">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Configuration</h2>
        <Button
          onClick={onApiKeyClick}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Key size={16} />
          API Keys
        </Button>
      </div>

      {!sessionId && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning mb-6">
          Please create or select a session to configure the agent
        </div>
      )}

      <Tabs defaultValue="model" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="model">Model Settings</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="model" className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">
              LLM Model
            </Label>
            <Select value={model} onValueChange={setModel} disabled={!sessionId}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the language model for the agent
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature: {temperature}%
            </Label>
            <Slider
              id="temperature"
              min={0}
              max={100}
              step={1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              disabled={!sessionId}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness: 0 = deterministic, 100 = creative
            </p>
          </div>

          {/* Max Steps */}
          <div className="space-y-2">
            <Label htmlFor="maxSteps" className="text-sm font-medium">
              Maximum Steps
            </Label>
            <Input
              id="maxSteps"
              type="number"
              min={1}
              max={500}
              value={maxSteps}
              onChange={(e) => setMaxSteps(parseInt(e.target.value) || 50)}
              disabled={!sessionId}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of tool calls before stopping
            </p>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              System Prompt
            </Label>
            <Textarea
              id="prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={!sessionId}
              rows={15}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Define the agent's behavior and capabilities
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={isSaving || !sessionId}
          className="flex-1 gap-2"
        >
          <Save size={16} />
          Save Configuration
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!sessionId}
          className="gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>
    </div>
  );
}
