import { useState } from "react";
import { Plus, Trash2, Play, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkflowBuilder, type WorkflowNodeType } from "@/hooks/useWorkflowBuilder";

interface WorkflowBuilderProps {
  compact?: boolean;
}

const nodeTypeColors: Record<WorkflowNodeType, string> = {
  trigger: "bg-blue-100 border-blue-300",
  action: "bg-green-100 border-green-300",
  condition: "bg-yellow-100 border-yellow-300",
  webhook: "bg-purple-100 border-purple-300",
  notification: "bg-pink-100 border-pink-300",
  delay: "bg-gray-100 border-gray-300",
};

export function WorkflowBuilder({ compact = false }: WorkflowBuilderProps) {
  const {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    createWorkflow,
    addNode,
    removeNode,
    addEdge,
    removeEdge,
    updateNode,
    toggleWorkflow,
    deleteWorkflow,
    executeWorkflow,
    validateWorkflow,
  } = useWorkflowBuilder({ enabled: true });

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      createWorkflow(newWorkflowName);
      setNewWorkflowName("");
      setShowNewWorkflow(false);
    }
  };

  const handleValidate = () => {
    const result = validateWorkflow();
    setValidation(result);
  };

  const handleExecute = () => {
    handleValidate();
    if (currentWorkflow) {
      executeWorkflow(currentWorkflow.id);
    }
  };

  if (compact) {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Workflows</h3>
          <span className="text-sm text-muted-foreground">{workflows.length} total</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {workflows.slice(0, 5).map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{workflow.name}</div>
                <div className="text-xs text-muted-foreground">
                  {workflow.nodes.length} nodes • {workflow.executions} executions
                </div>
              </div>
              <div className={cn("h-2 w-2 rounded-full", workflow.enabled ? "bg-green-600" : "bg-gray-400")} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflows List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Workflows</h3>
          <Button
            size="sm"
            onClick={() => setShowNewWorkflow(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>

        {workflows.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">No workflows yet</div>
          </Card>
        ) : (
          <div className="grid gap-2">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={cn(
                  "p-4 cursor-pointer hover:bg-accent transition-colors",
                  currentWorkflow?.id === workflow.id && "ring-2 ring-primary"
                )}
                onClick={() => setCurrentWorkflow(workflow)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{workflow.name}</div>
                    {workflow.description && (
                      <div className="text-sm text-muted-foreground">{workflow.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      {workflow.nodes.length} nodes • {workflow.edges.length} connections • {workflow.executions} executions
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflow(workflow.id);
                      }}
                    >
                      {workflow.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkflow(workflow.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Editor */}
      {currentWorkflow && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Workflow Editor</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidate}
                className="gap-2"
              >
                {validation.valid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Valid
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Invalid
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleExecute}
                disabled={!validation.valid}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Execute
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.valid && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
              {validation.errors.map((error, idx) => (
                <div key={idx} className="text-sm text-red-700">
                  • {error}
                </div>
              ))}
            </div>
          )}

          {/* Workflow Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-muted rounded">
              <div className="text-sm font-medium">{currentWorkflow.nodes.length}</div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="text-sm font-medium">{currentWorkflow.edges.length}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="text-sm font-medium">{currentWorkflow.executions}</div>
              <div className="text-xs text-muted-foreground">Executions</div>
            </div>
          </div>

          {/* Nodes */}
          <div className="space-y-2">
            <div className="font-medium text-sm">Nodes</div>
            {currentWorkflow.nodes.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted rounded">
                No nodes yet. Add nodes to build your workflow.
              </div>
            ) : (
              <div className="space-y-2">
                {currentWorkflow.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "p-3 rounded border-2 flex items-center justify-between",
                      nodeTypeColors[node.type]
                    )}
                  >
                    <div>
                      <div className="font-medium text-sm">{node.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{node.type}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNode(node.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* New Workflow Dialog */}
      {showNewWorkflow && (
        <Card className="p-4 space-y-3 border-2 border-primary">
          <h3 className="font-medium">Create New Workflow</h3>
          <Input
            placeholder="Workflow name..."
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateWorkflow();
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewWorkflow(false);
                setNewWorkflowName("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={!newWorkflowName.trim()}
              className="flex-1"
            >
              Create
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
