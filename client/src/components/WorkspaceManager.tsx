import { useState } from "react";
import { Plus, Grid, List, Search, Folder, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WorkspaceItem {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  sessionCount: number;
  createdAt: Date;
  owner: string;
}

interface WorkspaceManagerProps {
  workspaces?: WorkspaceItem[];
  onSelectWorkspace?: (id: number) => void;
  onCreateWorkspace?: () => void;
  onDeleteWorkspace?: (id: number) => void;
}

export default function WorkspaceManager({
  workspaces = [],
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
}: WorkspaceManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
    null
  );

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (id: number) => {
    setSelectedWorkspaceId(id);
    if (onSelectWorkspace) {
      onSelectWorkspace(id);
    }
  };

  const handleDeleteWorkspace = (id: number) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      if (onDeleteWorkspace) {
        onDeleteWorkspace(id);
      }
      toast.success("Workspace deleted");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team workspaces and collaborate with members
          </p>
        </div>

        <Button onClick={onCreateWorkspace} className="gap-2">
          <Plus size={16} />
          New Workspace
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Workspaces Display */}
      {filteredWorkspaces.length === 0 ? (
        <Card className="p-12 text-center">
          <Folder size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first workspace to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={onCreateWorkspace} className="gap-2">
              <Plus size={16} />
              Create Workspace
            </Button>
          )}
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedWorkspaceId === workspace.id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => handleSelectWorkspace(workspace.id)}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workspace.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    <span>{workspace.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-muted-foreground" />
                    <span>{workspace.sessionCount} sessions</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline">{workspace.owner}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(workspace.createdAt)}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectWorkspace(workspace.id);
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedWorkspaceId === workspace.id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => handleSelectWorkspace(workspace.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {workspace.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    <span>{workspace.memberCount} members</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-muted-foreground" />
                    <span>{workspace.sessionCount} sessions</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span>{formatDate(workspace.createdAt)}</span>
                  </div>

                  <Badge variant="outline">{workspace.owner}</Badge>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectWorkspace(workspace.id);
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {filteredWorkspaces.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Workspaces</p>
              <p className="text-2xl font-bold">{filteredWorkspaces.length}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">
                {filteredWorkspaces.reduce((sum, ws) => sum + ws.memberCount, 0)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">
                {filteredWorkspaces.reduce((sum, ws) => sum + ws.sessionCount, 0)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
