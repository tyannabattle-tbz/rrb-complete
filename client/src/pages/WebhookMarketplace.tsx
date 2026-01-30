import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Download, Settings, Trash2, Plus } from "lucide-react";

export default function WebhookMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"browse" | "installed">("browse");

  // Fetch marketplace stats
  const { data: stats } = trpc.marketplace.getStats.useQuery();

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = trpc.marketplace.getTemplates.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory,
    limit: 20,
  });

  // Fetch installed templates
  const { data: installations, refetch: refetchInstallations } = trpc.marketplace.getInstallations.useQuery();

  // Mutations
  const installMutation = trpc.marketplace.installTemplate.useMutation({
    onSuccess: () => refetchInstallations(),
  });

  const deleteMutation = trpc.marketplace.deleteInstallation.useMutation({
    onSuccess: () => refetchInstallations(),
  });

  const rateMutation = trpc.marketplace.rateTemplate.useMutation();

  const handleInstall = async (templateId: number, templateName: string) => {
    await installMutation.mutateAsync({
      templateId,
      name: `${templateName} - ${new Date().toLocaleDateString()}`,
      config: {},
    });
  };

  const handleDelete = async (installationId: number) => {
    if (confirm("Are you sure you want to remove this webhook installation?")) {
      await deleteMutation.mutateAsync({ installationId });
    }
  };

  const categories = stats?.topCategories.map((c) => c.category) || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Webhook Marketplace</h1>
        <p className="text-gray-600">Discover and install pre-built webhook integrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalTemplates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Installations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{installations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "browse" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
          }`}
        >
          Browse Templates
        </button>
        <button
          onClick={() => setActiveTab("installed")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "installed" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
          }`}
        >
          My Installations ({installations?.length || 0})
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          {templatesLoading ? (
            <div>Loading templates...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                      {template.icon && (
                        <img src={template.icon} alt={template.name} className="w-8 h-8 rounded" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{template.category}</Badge>
                      {template.rating && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {typeof template.rating === "number"
                            ? (template.rating as number).toFixed(1)
                            : parseFloat(String(template.rating)).toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <div>Downloads: {template.downloads || 0}</div>
                      <div>Reviews: {template.reviews || 0}</div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleInstall(template.id, template.name)}
                      disabled={installMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Installed Tab */}
      {activeTab === "installed" && (
        <div className="space-y-4">
          {installations && installations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installations.map((installation) => (
                <Card key={installation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{installation.name}</CardTitle>
                        <CardDescription>
                          {installation.isActive ? (
                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="mt-2 bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <div>Success: {installation.successCount || 0}</div>
                      <div>Failures: {installation.failureCount || 0}</div>
                      {installation.lastTriggered && (
                        <div>
                          Last Triggered: {new Date(installation.lastTriggered).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(installation.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">No webhooks installed yet</p>
                <Button onClick={() => setActiveTab("browse")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Templates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
