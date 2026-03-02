import { useState } from "react";
import { Search, Filter, X, Calendar, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SessionFilter {
  searchQuery: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags: string[];
  status?: "active" | "completed" | "error";
  minMessages?: number;
}

interface SessionSearchProps {
  onFilterChange: (filter: SessionFilter) => void;
  availableTags?: string[];
}

export function SessionSearch({ onFilterChange, availableTags = [] }: SessionSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [status, setStatus] = useState<"active" | "completed" | "error" | "">();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateFilter({
      searchQuery: value,
      tags: selectedTags,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status: status as "active" | "completed" | "error" | undefined,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateFilter({
      searchQuery,
      tags: newTags,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status: status as "active" | "completed" | "error" | undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setDateFrom("");
    setDateTo("");
    setStatus("");
    updateFilter({
      searchQuery: "",
      tags: [],
    });
  };

  const updateFilter = (filter: Partial<SessionFilter>) => {
    onFilterChange({
      searchQuery: filter.searchQuery || "",
      tags: filter.tags || [],
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      status: filter.status,
    });
  };

  const hasActiveFilters =
    searchQuery || selectedTags.length > 0 || dateFrom || dateTo || status;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions by name, description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
              {(selectedTags.length > 0 ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (status ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  updateFilter({
                    searchQuery,
                    tags: selectedTags,
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                    dateTo: dateTo ? new Date(dateTo) : undefined,
                  });
                }}
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  updateFilter({
                    searchQuery,
                    tags: selectedTags,
                    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                    dateTo: e.target.value ? new Date(e.target.value) : undefined,
                  });
                }}
                placeholder="To"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-2">
              {(["active", "completed", "error"] as const).map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatus(status === s ? "" : s);
                    updateFilter({
                      searchQuery,
                      tags: selectedTags,
                      status: status === s ? undefined : s,
                    });
                  }}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className="gap-1"
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
