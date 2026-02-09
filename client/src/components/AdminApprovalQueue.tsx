/**
 * Admin Approval Queue Component
 * 
 * Shows pending generated content with approval/rejection workflow
 * Integrates with audit logging for compliance
 */

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CheckCircle, XCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { ContentPreviewModal } from "./ContentPreviewModal";

export interface PendingContent {
  contentId: string;
  title: string;
  type: "podcast" | "audiobook" | "radio";
  topic: string;
  script: string;
  summary: string;
  duration: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  createdBy: string;
}

export interface AdminApprovalQueueProps {
  onApprove?: (contentId: string) => void;
  onReject?: (contentId: string, reason?: string) => void;
}

export const AdminApprovalQueue: React.FC<AdminApprovalQueueProps> = ({
  onApprove,
  onReject,
}) => {
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([
    {
      contentId: "gen-1",
      title: "Top of the Sol Tech News - Feb 4",
      type: "podcast",
      topic: "Technology News",
      script: "Welcome to Top of the Sol Tech News...",
      summary: "Daily technology news briefing covering latest AI developments and tech industry updates.",
      duration: 12,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: "QUMUS-ContentGen",
    },
    {
      contentId: "gen-2",
      title: "Chapter 3: The Great Adventure",
      type: "audiobook",
      topic: "Classic Literature",
      script: "The Top of the Sol sun rose over the distant hills...",
      summary: "Audiobook chapter narration for classic literature series.",
      duration: 18,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      createdBy: "QUMUS-ContentGen",
    },
  ]);

  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = (contentId: string) => {
    setPendingContent(
      pendingContent.map((c) =>
        c.contentId === contentId ? { ...c, status: "approved" } : c
      )
    );
    onApprove?.(contentId);
  };

  const handleReject = (contentId: string) => {
    setPendingContent(
      pendingContent.map((c) =>
        c.contentId === contentId ? { ...c, status: "rejected" } : c
      )
    );
    onReject?.(contentId, rejectionReason);
    setRejectingId(null);
    setRejectionReason("");
  };

  const pendingCount = pendingContent.filter((c) => c.status === "pending").length;
  const approvedCount = pendingContent.filter((c) => c.status === "approved").length;
  const rejectedCount = pendingContent.filter((c) => c.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Approval Queue</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Review and approve AI-generated content before publication
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Pending</p>
          <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
        </Card>
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">Approved</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{approvedCount}</p>
        </Card>
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{rejectedCount}</p>
        </Card>
      </div>

      {/* Queue */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Queue</h2>

        {pendingContent.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No content in queue</p>
          </Card>
        ) : (
          pendingContent.map((content) => (
            <Card
              key={content.contentId}
              className={`p-4 ${
                content.status === "pending"
                  ? "border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10"
                  : content.status === "approved"
                  ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10"
                  : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {content.status === "pending" && (
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                    {content.status === "approved" && (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                    {content.status === "rejected" && (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <h3 className="font-semibold text-foreground">{content.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="text-foreground capitalize">{content.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="text-foreground">{content.duration} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="text-foreground">
                        {new Date(content.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="text-foreground capitalize font-medium">{content.status}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{content.summary}</p>
                </div>

                {content.status === "pending" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedContent(content);
                        setShowPreview(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(content.contentId)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectingId(content.contentId)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Rejection Reason Input */}
              {rejectingId === content.contentId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleReject(content.contentId)}
                      variant="destructive"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {selectedContent && (
        <ContentPreviewModal
          isOpen={showPreview}
          content={{
            contentId: selectedContent.contentId,
            title: selectedContent.title,
            type: selectedContent.type,
            script: selectedContent.script,
            summary: selectedContent.summary,
            duration: selectedContent.duration,
            topic: selectedContent.topic,
            status: selectedContent.status,
            createdAt: selectedContent.createdAt,
          }}
          onClose={() => setShowPreview(false)}
          onApprove={(contentId) => {
            handleApprove(contentId);
            setShowPreview(false);
          }}
          onDiscard={() => setShowPreview(false)}
        />
      )}

      {/* Compliance Info */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Audit Logging</h3>
            <p className="text-sm text-muted-foreground">
              All approvals and rejections are logged for compliance and audit purposes. Decisions are tracked with timestamps and user information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
