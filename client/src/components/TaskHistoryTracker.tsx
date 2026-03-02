import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Calendar,
  Timer,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: number;
  taskDescription: string;
  status: "pending" | "in_progress" | "completed" | "failed" | null;
  outcome?: string | null;
  duration?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
}

interface TaskHistoryTrackerProps {
  tasks: Task[];
  isLoading?: boolean;
}

export default function TaskHistoryTracker({ tasks, isLoading = false }: TaskHistoryTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "duration" | "status">("recent");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.outcome?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "duration") {
      filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === "status") {
      const statusOrder = { completed: 0, in_progress: 1, pending: 2, failed: 3 };
      filtered.sort(
        (a, b) =>
          (statusOrder[a.status as keyof typeof statusOrder] || 999) -
          (statusOrder[b.status as keyof typeof statusOrder] || 999)
      );
    }

    return filtered;
  }, [tasks, searchQuery, selectedStatus, sortBy]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      avgDuration:
        tasks.length > 0
          ? Math.round(tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / tasks.length)
          : 0,
    };
  }, [tasks]);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-success" />;
      case "failed":
        return <AlertCircle size={16} className="text-error" />;
      case "in_progress":
        return <Loader2 size={16} className="animate-spin text-info" />;
      case "pending":
        return <Clock size={16} className="text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case "failed":
        return <Badge className="bg-error/10 text-error">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-info/10 text-info">In Progress</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDuration = (ms?: number | null) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const exportTasks = () => {
    const csv = [
      ["Task", "Status", "Duration", "Created", "Completed", "Outcome"].join(","),
      ...filteredAndSortedTasks.map((task) =>
        [
          `"${(task.taskDescription || "").replace(/"/g, '""')}"`,
          task.status || "N/A",
          formatDuration(task.duration),
          new Date(task.createdAt).toISOString(),
          task.completedAt ? new Date(task.completedAt).toISOString() : "N/A",
          `"${((task.outcome || "") as string).replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-history-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Tasks exported successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task History</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={exportTasks}
          disabled={filteredAndSortedTasks.length === 0}
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-3 text-center bg-success/5">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </Card>
        <Card className="p-3 text-center bg-info/5">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-info">{stats.inProgress}</p>
        </Card>
        <Card className="p-3 text-center bg-error/5">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-error">{stats.failed}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold">{formatDuration(stats.avgDuration || 0)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredAndSortedTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </Card>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <Card
              key={task.id}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm line-clamp-2">{task.taskDescription}</span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      {task.duration && (
                        <div className="flex items-center gap-1">
                          <Timer size={14} />
                          {formatDuration(task.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {expandedId === task.id ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === task.id && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Task Description */}
                  <div>
                    <p className="font-semibold text-sm mb-2">Task Description</p>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded">
                      {task.taskDescription}
                    </p>
                  </div>

                  {/* Outcome */}
                  {task.outcome && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Outcome</p>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded">
                        {task.outcome}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Status</p>
                      <p className="mt-1">{task.status || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Duration</p>
                      <p className="mt-1">{formatDuration(task.duration)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Created</p>
                      <p className="mt-1">{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {task.completedAt && (
                    <div className="text-xs text-muted-foreground">
                      Completed: {new Date(task.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
