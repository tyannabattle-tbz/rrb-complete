import { useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Conflict {
  id: string;
  summary: string;
  edit1: { userId: string; value: unknown; timestamp: Date };
  edit2: { userId: string; value: unknown; timestamp: Date };
  resolved: boolean;
  resolution?: "keep_first" | "keep_latest" | "merge";
}

interface ConflictResolverProps {
  conflicts: Conflict[];
  onResolve?: (conflictId: string, resolution: "keep_first" | "keep_latest" | "merge") => void;
}

export default function ConflictResolver({
  conflicts,
  onResolve,
}: ConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(
    conflicts.length > 0 ? conflicts[0].id : null
  );

  const current = conflicts.find((c) => c.id === selectedConflict);
  const unresolvedCount = conflicts.filter((c) => !c.resolved).length;

  const handleResolve = (resolution: "keep_first" | "keep_latest" | "merge") => {
    if (selectedConflict && onResolve) {
      onResolve(selectedConflict, resolution);
    }
  };

  if (conflicts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="mx-auto mb-2 text-success" size={32} />
        <p className="text-sm text-muted-foreground">No conflicts detected</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conflict Summary */}
      <Card className="p-4 bg-warning/10 border-warning/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-warning mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-sm">
              {unresolvedCount} conflict{unresolvedCount !== 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Multiple users made concurrent edits. Please review and resolve.
            </p>
          </div>
        </div>
      </Card>

      {/* Conflict List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conflicts Sidebar */}
        <div className="space-y-2">
          {conflicts.map((conflict) => (
            <button
              key={conflict.id}
              onClick={() => setSelectedConflict(conflict.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedConflict === conflict.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {conflict.summary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conflict.edit1.userId} vs {conflict.edit2.userId}
                  </p>
                </div>
                {conflict.resolved ? (
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-warning flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Conflict Details */}
        {current && (
          <div className="md:col-span-2 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Resolve Conflict</h3>

              {/* Edit 1 */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    {current.edit1.userId}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {current.edit1.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-background p-2 rounded border border-border text-sm font-mono text-xs break-words">
                  {JSON.stringify(current.edit1.value, null, 2)}
                </div>
              </div>

              {/* vs */}
              <div className="flex items-center justify-center my-3">
                <div className="flex-1 border-t border-border" />
                <span className="px-3 text-xs text-muted-foreground font-medium">
                  VS
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Edit 2 */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    {current.edit2.userId}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {current.edit2.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-background p-2 rounded border border-border text-sm font-mono text-xs break-words">
                  {JSON.stringify(current.edit2.value, null, 2)}
                </div>
              </div>

              {/* Resolution Options */}
              {!current.resolved && (
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium">Choose resolution:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleResolve("keep_first")}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Keep First
                    </Button>
                    <Button
                      onClick={() => handleResolve("keep_latest")}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Keep Latest
                    </Button>
                    <Button
                      onClick={() => handleResolve("merge")}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      Merge
                    </Button>
                  </div>
                </div>
              )}

              {current.resolved && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-sm text-success font-medium">
                      Resolved: {current.resolution}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
