import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface TextWatermark {
  enabled: boolean;
  type: "text" | "both";
  text: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor?: string;
  opacity: number;
  scale: number;
  padding: number;
  rotation?: number;
}

interface LogoWatermark {
  enabled: boolean;
  type: "logo" | "both";
  logoUrl: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  width: number;
  height: number;
  opacity: number;
  scale: number;
  padding: number;
}

export function VideoWatermarkEditor() {
  const [activeTab, setActiveTab] = useState("text");
  const [configId, setConfigId] = useState("default-watermark");
  const [textWatermark, setTextWatermark] = useState<TextWatermark>({
    enabled: true,
    type: "text",
    text: "© 2026 Your Company",
    position: "bottom-right",
    fontSize: 14,
    fontFamily: "Arial",
    fontColor: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    opacity: 0.8,
    scale: 1,
    padding: 10,
  });

  const [logoWatermark, setLogoWatermark] = useState<LogoWatermark>({
    enabled: true,
    type: "logo",
    logoUrl: "https://example.com/logo.png",
    position: "top-right",
    width: 100,
    height: 50,
    opacity: 0.7,
    scale: 0.8,
    padding: 15,
  });

  const [previewWidth, setPreviewWidth] = useState(1280);
  const [previewHeight, setPreviewHeight] = useState(720);
  const [svgPreview, setSvgPreview] = useState("");

  // tRPC queries and mutations
  const getPresetsQuery = trpc.entertainment.watermark.getPresets.useQuery();
  const validateTextQuery = trpc.entertainment.watermark.validateWatermark.useQuery(textWatermark);
  const generateSVGQuery = trpc.entertainment.watermark.generateSVG.useQuery({
    watermark: textWatermark,
    videoWidth: previewWidth,
    videoHeight: previewHeight,
  });
  const saveConfigMutation = trpc.entertainment.watermark.saveConfiguration.useMutation();
  const getConfigQuery = trpc.entertainment.watermark.getConfiguration.useQuery({ configId });

  // Load configuration
  useEffect(() => {
    if (getConfigQuery.data) {
      if (getConfigQuery.data.text) {
        setTextWatermark(getConfigQuery.data.text);
      }
      if (getConfigQuery.data.logo) {
        setLogoWatermark(getConfigQuery.data.logo);
      }
    }
  }, [getConfigQuery.data]);

  // Update SVG preview
  useEffect(() => {
    if (generateSVGQuery.data) {
      setSvgPreview(generateSVGQuery.data.svg);
    }
  }, [generateSVGQuery.data]);

  const handleSaveConfiguration = async () => {
    try {
      await saveConfigMutation.mutateAsync({
        configId,
        text: textWatermark,
        logo: logoWatermark,
      });
      toast.success("Watermark configuration saved!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleApplyPreset = (presetName: string) => {
    const presets = getPresetsQuery.data;
    if (!presets) return;

    const preset = presets[presetName];
    if (preset.text) {
      setTextWatermark(preset.text);
      setActiveTab("text");
    }
    if (preset.logo) {
      setLogoWatermark(preset.logo);
    }

    toast.success(`Preset '${presetName}' applied!`);
  };

  const handleCopySVG = () => {
    navigator.clipboard.writeText(svgPreview);
    toast.success("SVG copied to clipboard!");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Video Watermark Editor</h1>
        <p className="text-gray-500">Add logos and text overlays to your videos</p>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>Apply pre-configured watermark styles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getPresetsQuery.data &&
              Object.keys(getPresetsQuery.data).map((presetName) => (
                <Button
                  key={presetName}
                  variant="outline"
                  onClick={() => handleApplyPreset(presetName)}
                  className="capitalize"
                >
                  {presetName}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration ID */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Configuration ID</label>
              <Input
                value={configId}
                onChange={(e) => setConfigId(e.target.value)}
                placeholder="e.g., my-watermark"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watermark Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Watermark</TabsTrigger>
          <TabsTrigger value="logo">Logo Watermark</TabsTrigger>
        </TabsList>

        {/* Text Watermark Tab */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Text Watermark Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enable Text Watermark</label>
                <input
                  type="checkbox"
                  checked={textWatermark.enabled}
                  onChange={(e) => setTextWatermark({ ...textWatermark, enabled: e.target.checked })}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Text</label>
                <Input
                  value={textWatermark.text}
                  onChange={(e) => setTextWatermark({ ...textWatermark, text: e.target.value })}
                  placeholder="Enter watermark text"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Position</label>
                <select
                  value={textWatermark.position}
                  onChange={(e) =>
                    setTextWatermark({
                      ...textWatermark,
                      position: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Input
                    type="number"
                    min="8"
                    max="72"
                    value={textWatermark.fontSize}
                    onChange={(e) =>
                      setTextWatermark({
                        ...textWatermark,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Font Family</label>
                  <select
                    value={textWatermark.fontFamily}
                    onChange={(e) =>
                      setTextWatermark({
                        ...textWatermark,
                        fontFamily: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Font Color</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={textWatermark.fontColor}
                      onChange={(e) =>
                        setTextWatermark({
                          ...textWatermark,
                          fontColor: e.target.value,
                        })
                      }
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={textWatermark.fontColor}
                      onChange={(e) =>
                        setTextWatermark({
                          ...textWatermark,
                          fontColor: e.target.value,
                        })
                      }
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Opacity</label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textWatermark.opacity}
                    onChange={(e) =>
                      setTextWatermark({
                        ...textWatermark,
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{(textWatermark.opacity * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Scale</label>
                  <Input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={textWatermark.scale}
                    onChange={(e) =>
                      setTextWatermark({
                        ...textWatermark,
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{(textWatermark.scale * 100).toFixed(0)}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Padding</label>
                  <Input
                    type="number"
                    min="0"
                    value={textWatermark.padding}
                    onChange={(e) =>
                      setTextWatermark({
                        ...textWatermark,
                        padding: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Rotation (degrees)</label>
                <Input
                  type="number"
                  min="-360"
                  max="360"
                  value={textWatermark.rotation || 0}
                  onChange={(e) =>
                    setTextWatermark({
                      ...textWatermark,
                      rotation: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logo Watermark Tab */}
        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo Watermark Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enable Logo Watermark</label>
                <input
                  type="checkbox"
                  checked={logoWatermark.enabled}
                  onChange={(e) => setLogoWatermark({ ...logoWatermark, enabled: e.target.checked })}
                  className="w-4 h-4 mt-1 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  value={logoWatermark.logoUrl}
                  onChange={(e) => setLogoWatermark({ ...logoWatermark, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Position</label>
                <select
                  value={logoWatermark.position}
                  onChange={(e) =>
                    setLogoWatermark({
                      ...logoWatermark,
                      position: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={logoWatermark.width}
                    onChange={(e) =>
                      setLogoWatermark({
                        ...logoWatermark,
                        width: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={logoWatermark.height}
                    onChange={(e) =>
                      setLogoWatermark({
                        ...logoWatermark,
                        height: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Opacity</label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={logoWatermark.opacity}
                    onChange={(e) =>
                      setLogoWatermark({
                        ...logoWatermark,
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{(logoWatermark.opacity * 100).toFixed(0)}%</span>
                </div>

                <div>
                  <label className="text-sm font-medium">Scale</label>
                  <Input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={logoWatermark.scale}
                    onChange={(e) =>
                      setLogoWatermark({
                        ...logoWatermark,
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-gray-500">{(logoWatermark.scale * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Padding</label>
                <Input
                  type="number"
                  min="0"
                  value={logoWatermark.padding}
                  onChange={(e) =>
                    setLogoWatermark({
                      ...logoWatermark,
                      padding: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Video dimensions for preview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Preview Width</label>
              <Input
                type="number"
                value={previewWidth}
                onChange={(e) => setPreviewWidth(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preview Height</label>
              <Input
                type="number"
                value={previewHeight}
                onChange={(e) => setPreviewHeight(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          {svgPreview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: svgPreview }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SVG Code */}
      <Card>
        <CardHeader>
          <CardTitle>SVG Code</CardTitle>
          <CardDescription>Generated SVG for watermark overlay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto">
            <code>{svgPreview}</code>
          </div>
          <Button onClick={handleCopySVG} className="w-full">
            <Copy className="w-4 h-4 mr-2" />
            Copy SVG
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={handleSaveConfiguration} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
