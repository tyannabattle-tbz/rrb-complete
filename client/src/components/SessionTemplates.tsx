import { useState } from "react";
import { Plus, Copy, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  temperature: number;
  model: string;
  createdAt: Date;
  usageCount: number;
}

interface SessionTemplatesProps {
  onCreateFromTemplate?: (template: Template) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export default function SessionTemplates({
  onCreateFromTemplate,
  onDeleteTemplate,
}: SessionTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "template-1",
      name: "Data Analysis",
      description: "Template for data analysis tasks",
      systemPrompt:
        "You are a data analysis expert. Analyze the provided data and generate insights.",
      tools: ["web_search", "file_browser", "api_call"],
      temperature: 0.7,
      model: "gpt-4",
      createdAt: new Date(Date.now() - 86400000),
      usageCount: 12,
    },
    {
      id: "template-2",
      name: "Code Review",
      description: "Template for code review and analysis",
      systemPrompt:
        "You are an expert code reviewer. Review the code and provide constructive feedback.",
      tools: ["file_browser", "api_call"],
      temperature: 0.5,
      model: "gpt-4",
      createdAt: new Date(Date.now() - 172800000),
      usageCount: 8,
    },
    {
      id: "template-3",
      name: "Research",
      description: "Template for research and information gathering",
      systemPrompt:
        "You are a research assistant. Gather and synthesize information from multiple sources.",
      tools: ["web_search", "api_call"],
      temperature: 0.6,
      model: "gpt-4",
      createdAt: new Date(Date.now() - 259200000),
      usageCount: 5,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    model: "gpt-4",
    temperature: 0.7,
  });

  const handleCreateTemplate = () => {
    if (
      formData.name &&
      formData.description &&
      formData.systemPrompt
    ) {
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        tools: [],
        temperature: formData.temperature,
        model: formData.model,
        createdAt: new Date(),
        usageCount: 0,
      };
      setTemplates([...templates, newTemplate]);
      setFormData({
        name: "",
        description: "",
        systemPrompt: "",
        model: "gpt-4",
        temperature: 0.7,
      });
      setShowCreateDialog(false);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
    if (onDeleteTemplate) {
      onDeleteTemplate(templateId);
    }
  };

  const handleUseTemplate = (template: Template) => {
    if (onCreateFromTemplate) {
      onCreateFromTemplate(template);
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Template Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Session Templates</h2>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus size={16} />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-muted rounded">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model:</span>
                  <Badge variant="secondary">{template.model}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">{template.temperature.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used:</span>
                  <span className="font-mono">{template.usageCount} times</span>
                </div>
              </div>

              {/* System Prompt Preview */}
              <div className="bg-muted/50 p-2 rounded text-xs max-h-20 overflow-y-auto">
                <p className="text-muted-foreground line-clamp-3">
                  {template.systemPrompt}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUseTemplate(template)}
                  variant="default"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Copy size={14} />
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Create Template</h2>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Data Analysis"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of the template"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">System Prompt</label>
                  <textarea
                    placeholder="Enter the system prompt..."
                    value={formData.systemPrompt}
                    onChange={(e) =>
                      setFormData({ ...formData, systemPrompt: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5">GPT-3.5</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Temperature</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  className="flex-1 gap-2"
                >
                  <Save size={16} />
                  Create Template
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
