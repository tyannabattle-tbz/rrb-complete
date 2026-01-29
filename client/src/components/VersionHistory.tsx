import { useState } from "react";
import { GitBranch, Clock, Tag, Download, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Version {
  id: string;
  versionNumber: number;
  createdBy: string;
  createdAt: Date;
  description?: string;
  tags?: string[];
  branchName?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestore?: (versionId: string) => void;
  onCompare?: (versionId1: string, versionId2: string) => void;
  onExport?: (versionId: string) => void;
}

export default function VersionHistory({
  versions,
  onRestore,
  onCompare,
  onExport,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    versions.length > 0 ? versions[0].id : null
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);

  const sorted = [...versions].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const current = sorted.find((v) => v.id === selectedVersion);
  const compareWith = sorted.find((v) => v.id === compareVersion);

  const handleCompare = (versionId: string) => {
    if (compareMode) {
      if (selectedVersion && onCompare) {
        onCompare(selectedVersion, versionId);
      }
      setCompareMode(false);
    } else {
      setCompareMode(true);
      setCompareVersion(versionId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Version Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timeline Sidebar */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sorted.map((version, index) => (
            <button
              key={version.id}
              onClick={() => setSelectedVersion(version.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all relative ${
                selectedVersion === version.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Timeline Connector */}
              {index < sorted.length - 1 && (
                <div className="absolute left-6 top-full w-0.5 h-2 bg-border" />
              )}

              <div className="flex items-start gap-2">
                <Clock size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    v{version.versionNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {version.createdBy}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {version.createdAt.toLocaleDateString()}{" "}
                    {version.createdAt.toLocaleTimeString()}
                  </p>
                  {version.branchName && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <GitBranch size={12} className="mr-1" />
                      {version.branchName}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Version Details */}
        {current && (
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Version {current.versionNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created by {current.createdBy} on{" "}
                    {current.createdAt.toLocaleString()}
                  </p>
                </div>

                {current.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm bg-muted/50 p-2 rounded">
                      {current.description}
                    </p>
                  </div>
                )}

                {current.tags && current.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {current.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {current.branchName && (
                  <div className="p-3 bg-info/10 border border-info/30 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <GitBranch size={16} />
                      Branch: {current.branchName}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => onRestore && onRestore(current.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    Restore
                  </Button>
                  <Button
                    onClick={() => handleCompare(current.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {compareMode ? "Cancel Compare" : "Compare"}
                  </Button>
                  <Button
                    onClick={() => onExport && onExport(current.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>

            {/* Comparison View */}
            {compareMode && compareWith && (
              <Card className="p-4 border-info/50 bg-info/5">
                <h4 className="font-semibold mb-3 text-sm">
                  Comparing v{current.versionNumber} vs v{compareWith.versionNumber}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Version {current.versionNumber}
                      </p>
                      <p className="text-xs">
                        {current.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Version {compareWith.versionNumber}
                      </p>
                      <p className="text-xs">
                        {compareWith.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Comparison details will be shown here
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
