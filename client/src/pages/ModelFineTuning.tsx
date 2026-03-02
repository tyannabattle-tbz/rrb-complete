import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Zap, TrendingUp, BarChart3, Play, Trash2 } from "lucide-react";

export default function ModelFineTuning() {
  const [activeTab, setActiveTab] = useState<"datasets" | "jobs" | "models">("datasets");
  const [showCreateDataset, setShowCreateDataset] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");

  // Fetch data
  const { data: datasets, refetch: refetchDatasets } = trpc.finetuning.getDatasets.useQuery();
  const { data: jobs, refetch: refetchJobs } = trpc.finetuning.getJobs.useQuery();
  const { data: models, refetch: refetchModels } = trpc.finetuning.getModels.useQuery();

  // Mutations
  const createDatasetMutation = trpc.finetuning.createDataset.useMutation({
    onSuccess: () => {
      refetchDatasets();
      setShowCreateDataset(false);
      setDatasetName("");
      setDatasetDescription("");
    },
  });

  const createJobMutation = trpc.finetuning.createJob.useMutation({
    onSuccess: () => refetchJobs(),
  });

  const handleCreateDataset = async () => {
    await createDatasetMutation.mutateAsync({
      name: datasetName,
      description: datasetDescription,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-100 text-green-800";
      case "training":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "draft":
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Model Fine-Tuning</h1>
        <p className="text-gray-600">Create and manage custom AI models</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("datasets")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "datasets" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
          }`}
        >
          Datasets ({datasets?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "jobs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
          }`}
        >
          Training Jobs ({jobs?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("models")}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === "models" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
          }`}
        >
          Models ({models?.length || 0})
        </button>
      </div>

      {/* Datasets Tab */}
      {activeTab === "datasets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Training Datasets</h2>
            <Button onClick={() => setShowCreateDataset(!showCreateDataset)}>
              <Plus className="w-4 h-4 mr-2" />
              New Dataset
            </Button>
          </div>

          {showCreateDataset && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Dataset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Dataset Name</label>
                  <Input
                    placeholder="e.g., Customer Support Training Data"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Describe your dataset..."
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateDataset}
                    disabled={!datasetName || createDatasetMutation.isPending}
                  >
                    Create Dataset
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDataset(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {datasets && datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datasets.map((dataset) => (
                <Card key={dataset.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{dataset.name}</CardTitle>
                        <CardDescription>{dataset.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(dataset.status || "draft")}>
                        {dataset.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Data Points:</span>
                        <div className="font-semibold">{dataset.dataCount || 0}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quality:</span>
                        <div className="font-semibold">{dataset.quality}</div>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Start Training Job
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No datasets yet. Create one to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Training Jobs</h2>

          {jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{job.modelName}</CardTitle>
                        <CardDescription>Base Model: {job.baseModel}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(job.status || "pending")}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {job.status === "training" && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{job.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${job.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Epochs:</span>
                        <div className="font-semibold">{job.epochs}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Batch Size:</span>
                        <div className="font-semibold">{job.batchSize}</div>
                      </div>
                    </div>

                    {job.trainingStartedAt && (
                      <div className="text-xs text-gray-600">
                        Started: {new Date(job.trainingStartedAt).toLocaleString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {job.status === "pending" && (
                        <Button size="sm" className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No training jobs yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Models Tab */}
      {activeTab === "models" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fine-Tuned Models</h2>

          {models && models.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{model.name}</CardTitle>
                        <CardDescription>v{model.version}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(model.status || "active")}>
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <div className="font-semibold">
                          {model.accuracy ? parseFloat(String(model.accuracy)).toFixed(2) : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">F1 Score:</span>
                        <div className="font-semibold">
                          {model.f1Score ? parseFloat(String(model.f1Score)).toFixed(2) : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      Usage Count: {model.usageCount || 0}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Compare
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No fine-tuned models yet. Complete a training job to create one.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
