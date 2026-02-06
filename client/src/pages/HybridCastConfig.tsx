import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Upload, RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface HybridCastConfig {
  widgetId: string;
  appearance: {
    theme: "light" | "dark" | "auto";
    primaryColor: string;
    accentColor: string;
    borderRadius: number;
    fontSize: number;
    fontFamily: string;
  };
  behavior: {
    autoPlay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
    fullscreen: boolean;
    pip: boolean;
  };
  layout: {
    position: "inline" | "popup" | "sidebar";
    width: number;
    height: number;
    maxWidth: number;
    maxHeight: number;
  };
  analytics: {
    trackViews: boolean;
    trackEngagement: boolean;
    trackShares: boolean;
    trackDownloads: boolean;
  };
  branding: {
    showLogo: boolean;
    showBranding: boolean;
    customLogo?: string;
    customBranding?: string;
  };
}

export function HybridCastConfig() {
  const [widgetId, setWidgetId] = useState("default-widget");
  const [config, setConfig] = useState<HybridCastConfig | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // tRPC queries and mutations
  const getConfigQuery = trpc.entertainment.hybridCast.getConfig.useQuery({ widgetId });
  const saveConfigMutation = trpc.entertainment.hybridCast.saveConfig.useMutation();
  const generateEmbedCodeQuery = trpc.entertainment.hybridCast.generateEmbedCode.useQuery({ widgetId });
  const getPresetsQuery = trpc.entertainment.hybridCast.getPresets.useQuery();
  const applyPresetMutation = trpc.entertainment.hybridCast.applyPreset.useMutation();
  const resetConfigMutation = trpc.entertainment.hybridCast.resetConfig.useMutation();
  const exportConfigQuery = trpc.entertainment.hybridCast.exportConfig.useQuery({ widgetId });
  const importConfigMutation = trpc.entertainment.hybridCast.importConfig.useMutation();

  // Load configuration on mount
  useEffect(() => {
    if (getConfigQuery.data) {
      setConfig(getConfigQuery.data);
    }
  }, [getConfigQuery.data]);

  // Load embed code
  useEffect(() => {
    if (generateEmbedCodeQuery.data) {
      setEmbedCode(generateEmbedCodeQuery.data.containerHtml);
    }
  }, [generateEmbedCodeQuery.data]);

  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      await saveConfigMutation.mutateAsync(config);
      toast.success("Configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleApplyPreset = async (presetName: string) => {
    try {
      const result = await applyPresetMutation.mutateAsync({ widgetId, presetName });
      setConfig(result.config);
      setSelectedPreset(presetName);
      toast.success(`Preset '${presetName}' applied!`);
    } catch (error) {
      toast.error("Failed to apply preset");
    }
  };

  const handleResetConfig = async () => {
    try {
      const result = await resetConfigMutation.mutateAsync({ widgetId });
      setConfig(result.config);
      setSelectedPreset("");
      toast.success("Configuration reset to defaults");
    } catch (error) {
      toast.error("Failed to reset configuration");
    }
  };

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  const handleExportConfig = () => {
    if (!exportConfigQuery.data) return;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(exportConfigQuery.data.json));
    element.setAttribute("download", exportConfigQuery.data.filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Configuration exported!");
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        const result = await importConfigMutation.mutateAsync({ jsonString });
        setConfig(result.config);
        setWidgetId(result.config.widgetId);
        toast.success("Configuration imported successfully!");
      } catch (error) {
        toast.error("Failed to import configuration");
      }
    };
    reader.readAsText(file);
  };

  if (!config) {
    return <div className="p-6">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">HybridCast Widget Configuration</h1>
        <p className="text-gray-500">Customize your video widget appearance and behavior</p>
      </div>

      {/* Widget ID */}
      <Card>
        <CardHeader>
          <CardTitle>Widget Identification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Widget ID</label>
              <Input
                value={widgetId}
                onChange={(e) => setWidgetId(e.target.value)}
                placeholder="e.g., my-video-widget"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>Apply pre-configured styles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getPresetsQuery.data &&
              Object.keys(getPresetsQuery.data).map((presetName) => (
                <Button
                  key={presetName}
                  variant={selectedPreset === presetName ? "default" : "outline"}
                  onClick={() => handleApplyPreset(presetName)}
                  className="capitalize"
                >
                  {presetName}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select
                  value={config.appearance.theme}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      appearance: { ...config.appearance, theme: e.target.value as any },
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          appearance: { ...config.appearance, primaryColor: e.target.value },
                        })
                      }
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={config.appearance.primaryColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          appearance: { ...config.appearance, primaryColor: e.target.value },
                        })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Accent Color</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={config.appearance.accentColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          appearance: { ...config.appearance, accentColor: e.target.value },
                        })
                      }
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={config.appearance.accentColor}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          appearance: { ...config.appearance, accentColor: e.target.value },
                        })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Border Radius</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={config.appearance.borderRadius}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        appearance: { ...config.appearance, borderRadius: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Input
                    type="number"
                    min="8"
                    max="32"
                    value={config.appearance.fontSize}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        appearance: { ...config.appearance, fontSize: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Font Family</label>
                <Input
                  value={config.appearance.fontFamily}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      appearance: { ...config.appearance, fontFamily: e.target.value },
                    })
                  }
                  placeholder="system-ui, -apple-system, sans-serif"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.behavior).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        behavior: { ...config.behavior, [key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Position</label>
                <select
                  value={config.layout.position}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      layout: { ...config.layout, position: e.target.value as any },
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="inline">Inline</option>
                  <option value="popup">Popup</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Width (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.layout.width}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layout: { ...config.layout, width: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Height (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.layout.height}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layout: { ...config.layout, height: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Width (px)</label>
                  <Input
                    type="number"
                    value={config.layout.maxWidth}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layout: { ...config.layout, maxWidth: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Height (px)</label>
                  <Input
                    type="number"
                    value={config.layout.maxHeight}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        layout: { ...config.layout, maxHeight: parseInt(e.target.value) },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.analytics).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        analytics: { ...config.analytics, [key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>Copy this code to embed the widget on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>{embedCode}</code>
          </div>
          <Button onClick={handleCopyEmbedCode} className="w-full">
            <Copy className="w-4 h-4 mr-2" />
            Copy Embed Code
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={handleSaveConfig} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={handleResetConfig} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleExportConfig} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <label className="flex-1">
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
