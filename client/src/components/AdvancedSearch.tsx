import { useState } from "react";
import { Search, X, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SearchResult {
  id: number;
  type: "session" | "comment" | "log" | "task";
  title: string;
  description: string;
  context: string;
  date: Date;
  user: string;
  relevance: number;
}

interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void;
  onExport?: (results: SearchResult[]) => void;
}

export default function AdvancedSearch({ onSearch, onExport }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "sessions" | "comments" | "logs" | "tasks">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [user, setUser] = useState("");
  const [status, setStatus] = useState<"all" | "completed" | "failed" | "pending">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);

    try {
      // Simulate search with mock results
      const mockResults: SearchResult[] = [
        {
          id: 1,
          type: "session" as const,
          title: "Agent Session - Data Analysis",
          description: "Session for analyzing customer data",
          context: query,
          date: new Date(),
          user: user || "All Users",
          relevance: 0.95,
        },
        {
          id: 2,
          type: "comment" as const,
          title: "Comment on Session #42",
          description: `Discussion about ${query}`,
          context: query,
          date: new Date(Date.now() - 86400000),
          user: user || "All Users",
          relevance: 0.87,
        },
        {
          id: 3,
          type: "log" as const,
          title: "Tool Execution Log",
          description: `Log entry containing "${query}"`,
          context: query,
          date: new Date(Date.now() - 172800000),
          user: user || "All Users",
          relevance: 0.79,
        },
        {
          id: 4,
          type: "task" as const,
          title: "Task: Process Data",
          description: `Task related to ${query}`,
          context: query,
          date: new Date(Date.now() - 259200000),
          user: user || "All Users",
          relevance: 0.71,
        },
      ].filter((result) => {
        if (searchType !== "all" && result.type !== searchType.slice(0, -1)) return false;
        if (status !== "all" && result.type === "task") return false;
        return true;
      });

      setResults(mockResults);
      if (onSearch) {
        onSearch(mockResults);
      }

      toast.success(`Found ${mockResults.length} results`);
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFilter = (filterName: string) => {
    if (!activeFilters.includes(filterName)) {
      setActiveFilters([...activeFilters, filterName]);
    }
  };

  const handleRemoveFilter = (filterName: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterName));
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }

    if (onExport) {
      onExport(results);
    }

    // Generate CSV
    const csv = [
      ["ID", "Type", "Title", "Date", "User", "Relevance"],
      ...results.map((r) => [
        r.id,
        r.type,
        r.title,
        r.date.toISOString(),
        r.user,
        (r.relevance * 100).toFixed(0) + "%",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-results-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Results exported");
  };

  const handleClearFilters = () => {
    setQuery("");
    setSearchType("all");
    setDateFrom("");
    setDateTo("");
    setUser("");
    setStatus("all");
    setResults([]);
    setActiveFilters([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground mt-1">
          Search across sessions, comments, logs, and tasks
        </p>
      </div>

      {/* Search Input */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search sessions, comments, logs, tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter size={16} />
            Filters
          </h3>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sessions">Sessions</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="logs">Logs</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div>
            <label className="text-sm font-medium mb-2 block">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleAddFilter("dateFrom");
              }}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-sm font-medium mb-2 block">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleAddFilter("dateTo");
              }}
            />
          </div>

          {/* User Filter */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">User</label>
            <Input
              placeholder="Filter by user email"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                if (e.target.value) {
                  handleAddFilter("user");
                }
              }}
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer flex items-center gap-1"
                onClick={() => handleRemoveFilter(filter)}
              >
                {filter}
                <X size={12} />
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Results ({results.length})
            </h3>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Download size={14} />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.id} className="p-3 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{result.type}</Badge>
                      <h4 className="font-semibold">{result.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{result.user}</span>
                      <span>{result.date.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {(result.relevance * 100).toFixed(0)}%
                    </div>
                    <div className="w-12 h-1 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${result.relevance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {results.length === 0 && query && (
        <Card className="p-8 text-center">
          <Search size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </Card>
      )}
    </div>
  );
}
