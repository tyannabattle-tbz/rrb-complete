/**
 * Content Preview Modal Component
 * 
 * Displays full generated content with script, summary, metadata
 * Allows manual edits before approval
 */

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Edit2, Copy, Download } from "lucide-react";

export interface ContentPreviewModalProps {
  isOpen: boolean;
  content: {
    contentId: string;
    title: string;
    type: "podcast" | "audiobook" | "radio";
    script: string;
    summary: string;
    duration: number;
    topic: string;
    theme?: string;
    targetAudience?: string;
    status: string;
    createdAt: string;
  };
  onClose: () => void;
  onApprove: (contentId: string, editedScript?: string) => void;
  onDiscard: () => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  isOpen,
  content,
  onClose,
  onApprove,
  onDiscard,
}) => {
  const [editedScript, setEditedScript] = useState(content.script);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(editedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const element = document.createElement("a");
    const file = new Blob([editedScript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title}-script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {content.type.charAt(0).toUpperCase() + content.type.slice(1)} • {content.duration} min
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Topic</p>
              <p className="text-sm text-foreground mt-1">{content.topic}</p>
            </div>
            {content.theme && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Theme</p>
                <p className="text-sm text-foreground mt-1">{content.theme}</p>
              </div>
            )}
            {content.targetAudience && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Audience</p>
                <p className="text-sm text-foreground mt-1">{content.targetAudience}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Created</p>
              <p className="text-sm text-foreground mt-1">
                {new Date(content.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
            <Card className="p-4 bg-accent/5 border-accent/20">
              <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>
            </Card>
          </div>

          {/* Script */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Script</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {isEditing ? "Done Editing" : "Edit"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyScript}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadScript}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="w-full h-64 p-4 border border-input rounded-md bg-background text-foreground font-mono text-sm"
                placeholder="Edit script here..."
              />
            ) : (
              <Card className="p-4 bg-muted/50">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {editedScript}
                </pre>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onDiscard} className="flex-1">
              Discard
            </Button>
            <Button
              onClick={() => onApprove(content.contentId, editedScript)}
              className="flex-1"
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
