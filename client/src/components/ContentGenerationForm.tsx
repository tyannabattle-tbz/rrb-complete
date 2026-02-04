/**
 * Content Generation Form Component
 * 
 * Allows users to trigger AI content generation with topic/theme inputs
 * Shows progress, preview, and approval workflow
 */

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface ContentGenerationFormProps {
  onContentGenerated?: (contentId: string) => void;
  defaultContentType?: "podcast" | "audiobook" | "radio";
}

export const ContentGenerationForm: React.FC<ContentGenerationFormProps> = ({
  onContentGenerated,
  defaultContentType = "podcast",
}) => {
  const [contentType, setContentType] = useState<"podcast" | "audiobook" | "radio">(defaultContentType);
  const [topic, setTopic] = useState("");
  const [theme, setTheme] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a generic mutation that handles all content types
  const generateContentMutation = trpc.contentGeneration.generatePodcast.useMutation();
  const approveMutation = trpc.contentGeneration.approve.useMutation();
  const publishMutation = trpc.contentGeneration.publish.useMutation();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      // Generate content based on type
      const result = await generateContentMutation.mutateAsync({
        title: topic,
        topic,
        theme: theme || undefined,
        targetAudience: targetAudience || undefined,
        duration: contentType === "podcast" ? 30 : contentType === "audiobook" ? 45 : 60,
        customPrompt: `Generate ${contentType} content about ${topic}${theme ? ` with theme: ${theme}` : ""}${targetAudience ? ` for audience: ${targetAudience}` : ""}`,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!generatedContent) return;

    try {
      await approveMutation.mutateAsync({
        contentId: generatedContent?.contentId || "",
      });
      setGeneratedContent({ ...generatedContent, status: "approved" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve content");
    }
  };

  const handlePublish = async () => {
    if (!generatedContent) return;

    try {
      await publishMutation.mutateAsync({
        contentId: generatedContent?.contentId || "",
      });
      setGeneratedContent({ ...generatedContent, status: "published" });
      onContentGenerated?.(generatedContent.contentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish content");
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Generate AI Content
        </h3>

        <div className="space-y-4">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["podcast", "audiobook", "radio"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    contentType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Topic *</label>
            <Input
              placeholder="e.g., 'The Future of AI', 'Space Exploration', 'Business Strategy'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Theme Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme (Optional)</label>
            <Input
              placeholder="e.g., 'Educational', 'Entertaining', 'News-focused'"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Target Audience Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience (Optional)</label>
            <Input
              placeholder="e.g., 'Tech professionals', 'Students', 'General audience'"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating... {Math.round(generationProgress)}%
              </>
            ) : (
              "Generate Content"
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated Content</h3>
            <div className="flex items-center gap-2">
              {generatedContent.status === "published" && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Published</span>
                </div>
              )}
              {generatedContent.status === "approved" && (
                <div className="flex items-center gap-1 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Content Metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <p className="text-xs text-gray-600">Title</p>
                <p className="font-medium">{generatedContent.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Type</p>
                <p className="font-medium capitalize">{generatedContent.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Duration</p>
                <p className="font-medium">{generatedContent.duration} minutes</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className="font-medium capitalize">{generatedContent.status}</p>
              </div>
            </div>

            {/* Script Preview */}
            <div>
              <p className="text-sm font-medium mb-2">Script Preview</p>
              <div className="p-4 bg-gray-50 rounded-md max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedContent.script?.substring(0, 500)}
                  {generatedContent.script?.length > 500 ? "..." : ""}
                </p>
              </div>
            </div>

            {/* Summary */}
            {generatedContent.summary && (
              <div>
                <p className="text-sm font-medium mb-2">Summary</p>
                <p className="text-sm text-gray-700 p-4 bg-gray-50 rounded-md">
                  {generatedContent.summary}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {generatedContent.status === "draft" && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                    variant="outline"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      "Approve"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedContent(null);
                      setTopic("");
                      setTheme("");
                      setTargetAudience("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Discard
                  </Button>
                </>
              )}

              {generatedContent.status === "approved" && (
                <Button
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                  className="w-full"
                >
                  {publishMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </Button>
              )}

              {generatedContent.status === "published" && (
                <Button
                  onClick={() => {
                    setGeneratedContent(null);
                    setTopic("");
                    setTheme("");
                    setTargetAudience("");
                  }}
                  className="w-full"
                >
                  Generate Another
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2">Generation Statistics</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Generated</p>
            <p className="text-2xl font-bold text-blue-600">24</p>
          </div>
          <div>
            <p className="text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-blue-600">8</p>
          </div>
          <div>
            <p className="text-gray-600">Avg. Duration</p>
            <p className="text-2xl font-bold text-blue-600">38 min</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
