import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Save, Trash2, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface SmartCollection {
  id: string;
  name: string;
  description: string;
  filter: string;
  count: number;
  icon: React.ReactNode;
}

interface FilterState {
  searchTerm: string;
  dateRange: "all" | "today" | "week" | "month";
  status: "all" | "active" | "completed" | "failed";
  tokenUsage: "all" | "low" | "medium" | "high";
  sortBy: "recent" | "oldest" | "name" | "tokens";
}

export function AdvancedFiltering() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    dateRange: "all",
    status: "all",
    tokenUsage: "all",
    sortBy: "recent",
  });

  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: FilterState }>>([]);
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const smartCollections: SmartCollection[] = [
    {
      id: "recent",
      name: "Last 7 Days",
      description: "Sessions from the past week",
      filter: "dateRange:week",
      count: 12,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "high-usage",
      name: "High Token Usage",
      description: "Sessions using >10k tokens",
      filter: "tokenUsage:high",
      count: 5,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "failed",
      name: "Failed Sessions",
      description: "Sessions with errors",
      filter: "status:failed",
      count: 2,
      icon: <AlertCircle className="w-4 h-4" />,
    },
  ];

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      setSavedFilters([...savedFilters, { name: filterName, filters }]);
      setFilterName("");
      setShowSaveDialog(false);
    }
  };

  const handleApplySavedFilter = (savedFilter: typeof savedFilters[0]) => {
    setFilters(savedFilter.filters);
  };

  const handleDeleteSavedFilter = (index: number) => {
    setSavedFilters(savedFilters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Advanced Search & Filtering</h2>
        <p className="text-muted-foreground">Find sessions with powerful filters and smart collections</p>
      </div>

      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="collections">Smart Collections</TabsTrigger>
          <TabsTrigger value="saved">Saved Filters ({savedFilters.length})</TabsTrigger>
        </TabsList>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Search by session name or content..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["all", "today", "week", "month"].map((range) => (
                    <Button
                      key={range}
                      variant={filters.dateRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, dateRange: range as any })}
                    >
                      {range === "all" ? "All Time" : range === "today" ? "Today" : range === "week" ? "Last 7 Days" : "Last 30 Days"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["all", "active", "completed", "failed"].map((status) => (
                    <Button
                      key={status}
                      variant={filters.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, status: status as any })}
                    >
                      {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Token Usage */}
              <div>
                <label className="text-sm font-medium">Token Usage</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["all", "low", "medium", "high"].map((usage) => (
                    <Button
                      key={usage}
                      variant={filters.tokenUsage === usage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, tokenUsage: usage as any })}
                    >
                      {usage === "all" ? "All" : usage.charAt(0).toUpperCase() + usage.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["recent", "oldest", "name", "tokens"].map((sort) => (
                    <Button
                      key={sort}
                      variant={filters.sortBy === sort ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters({ ...filters, sortBy: sort as any })}
                    >
                      {sort === "recent" ? "Most Recent" : sort === "oldest" ? "Oldest" : sort === "name" ? "Name" : "Token Usage"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowSaveDialog(true)} variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Filter
                </Button>
                <Button
                  onClick={() =>
                    setFilters({
                      searchTerm: "",
                      dateRange: "all",
                      status: "all",
                      tokenUsage: "all",
                      sortBy: "recent",
                    })
                  }
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smartCollections.map((collection) => (
              <Card key={collection.id} className="hover:border-primary cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {collection.icon}
                    {collection.name}
                  </CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{collection.count} sessions</Badge>
                    <Button size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Saved Filters Tab */}
        <TabsContent value="saved" className="space-y-4">
          {savedFilters.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No saved filters yet. Create one from the Filters tab.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {savedFilters.map((filter, idx) => (
                <Card key={`item-${idx}`}>
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{filter.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Object.entries(filter.filters)
                          .filter(([_, v]) => v !== "all" && v !== "")
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApplySavedFilter(filter)}>
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSavedFilter(idx)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Save Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveFilter();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSaveDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
