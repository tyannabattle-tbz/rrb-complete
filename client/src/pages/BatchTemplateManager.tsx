import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Play, Trash2, Plus, Settings } from "lucide-react";

export default function BatchTemplateManager() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch templates
  const { data: templates, refetch } = trpc.batchTemplates.listTemplates.useQuery({
    category: selectedCategory || undefined,
  });

  const { data: categories } = trpc.batchTemplates.getCategories.useQuery();
  const { data: stats } = trpc.batchTemplates.getStats.useQuery();

  // Mutations
  const deleteTemplateMutation = trpc.batchTemplates.deleteTemplate.useMutation({
    onSuccess: () => refetch(),
  });

  const cloneTemplateMutation = trpc.batchTemplates.cloneTemplate.useMutation({
    onSuccess: () => refetch(),
  });

  const applyTemplateMutation = trpc.batchTemplates.applyTemplate.useMutation();

  const handleDelete = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate({ templateId });
    }
  };

  const handleClone = (templateId: string, templateName: string) => {
    const newName = prompt(`Clone template as:`, `${templateName} (Copy)`);
    if (newName) {
      cloneTemplateMutation.mutate({ templateId, newName });
    }
  };

  const handleApply = (templateId: string) => {
    // In a real app, this would navigate to job creation with template pre-filled
    applyTemplateMutation.mutate({
      templateId,
      jobName: "New Job from Template",
      inputFiles: [],
      queueId: 1,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Batch Templates</h1>
              <p className="text-lg text-slate-600">Manage and apply batch processing templates</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stats?.totalTemplates || 0}</div>
                <p className="text-sm text-slate-600">Total Templates</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.recentlyUpdated?.length || 0}
                </div>
                <p className="text-sm text-slate-600">Recently Updated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(stats?.byCategory || {}).length || 0}
                </div>
                <p className="text-sm text-slate-600">Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Filter by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories?.map((category: string, idx) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template: any, idx) => (
            <Card key={template.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                  <Badge className={getPriorityColor(template.jobConfig.priority)}>
                    {template.jobConfig.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Format:</span>
                    <span className="font-medium">{template.videoSettings.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Resolution:</span>
                    <span className="font-medium">{template.videoSettings.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bitrate:</span>
                    <span className="font-medium">{template.videoSettings.bitrate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">FPS:</span>
                    <span className="font-medium">{template.videoSettings.fps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Timeout:</span>
                    <span className="font-medium">{template.jobConfig.timeout}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Retries:</span>
                    <span className="font-medium">{template.jobConfig.retries}</span>
                  </div>
                </div>

                {/* Processing Steps */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Processing Steps:</p>
                  <div className="space-y-1">
                    {template.processingSteps.map((step: any, idx: number) => (
                      <div key={`item-${idx}`} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        {idx + 1}. {step.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApply(template.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClone(template.id, template.name)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates?.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No templates found</p>
              <p className="text-slate-500 text-sm mb-4">Create your first template to get started</p>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
