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
  Copy,
  Download,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ActionLog {
  id: number;
  toolName: string;
  parameters: string | null;
  result: string | null;
  error: string | null;
  status: "pending" | "running" | "completed" | "failed" | null;
  duration: number | null;
  createdAt: Date;
}

interface ActionLogViewerProps {
  logs: ActionLog[];
  isLoading?: boolean;
}

export default function ActionLogViewer({ logs, isLoading = false }: ActionLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tools = useMemo(() => {
    const unique = new Set(logs.map((log) => log.toolName));
    return Array.from(unique).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.parameters?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesTool = selectedTool === "all" || log.toolName === selectedTool;
      const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;

      return matchesSearch && matchesTool && matchesStatus;
    });
  }, [logs, searchQuery, selectedTool, selectedStatus]);

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-success" />;
      case "failed":
        return <AlertCircle size={16} className="text-error" />;
      case "running":
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
      case "running":
        return <Badge className="bg-info/10 text-info">Running</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportLogs = () => {
    const csv = [
      ["Tool", "Status", "Duration (ms)", "Created At", "Parameters", "Result", "Error"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.toolName,
          log.status,
          log.duration,
          new Date(log.createdAt).toISOString(),
          `"${(log.parameters || "").replace(/"/g, '""')}"`,
          `"${(log.result || "").replace(/"/g, '""')}"`,
          `"${(log.error || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `action-logs-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Logs exported successfully");
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
        <h2 className="text-xl font-semibold">Action Log</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={exportLogs}
          disabled={filteredLogs.length === 0}
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by tool name or parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={selectedTool} onValueChange={setSelectedTool}>
          <SelectTrigger className="w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tools</SelectItem>
            {tools.map((tool, idx) => (
              <SelectItem key={tool} value={tool}>
                {tool}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No action logs found</p>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card
              key={`log-${idx}-${log.id}`}
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(log.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{log.toolName}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.createdAt).toLocaleString()} • {log.duration}ms
                    </p>
                  </div>
                </div>
                {expandedId === log.id ? (
                  <ChevronUp size={20} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground" />
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === log.id && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {/* Parameters */}
              {log.parameters && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">Parameters</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(log.parameters || "");
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-40 text-foreground">
                    {JSON.stringify(JSON.parse(log.parameters || "{}"), null, 2)}
                  </pre>
                </div>
              )}

                  {/* Result */}
                  {log.result && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-success">Result</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(log.result || "");
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <pre className="bg-success/5 p-3 rounded text-xs overflow-auto max-h-40 text-foreground">
                        {JSON.stringify(JSON.parse(log.result || "{}"), null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {log.error && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-error">Error</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(log.error || "");
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <pre className="bg-error/5 p-3 rounded text-xs overflow-auto max-h-40 text-error">
                        {log.error}
                      </pre>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="font-semibold">Duration</p>
                      <p>{(log.duration || 0)}ms</p>
                    </div>
                    <div>
                      <p className="font-semibold">Created</p>
                      <p>{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredLogs.length > 0 && (
        <Card className="p-4 bg-muted/30">
            <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-xl font-semibold">{filteredLogs.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold text-success">
                {filteredLogs.filter((l) => l.status === "completed").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed</p>
              <p className="text-xl font-semibold text-error">
                {filteredLogs.filter((l) => l.status === "failed").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Duration</p>
              <p className="text-xl font-semibold">
                {Math.round(filteredLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / filteredLogs.length)}ms
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
