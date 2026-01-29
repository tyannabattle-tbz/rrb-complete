import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface AnalyticsFilterOptions {
  dateRange: "1h" | "24h" | "7d" | "30d" | "custom";
  startDate?: Date;
  endDate?: Date;
  toolType?: string;
  status?: "success" | "failed" | "all";
  minDuration?: number;
  maxDuration?: number;
  minSuccessRate?: number;
}

interface AnalyticsFilterProps {
  onFilterChange: (filters: AnalyticsFilterOptions) => void;
  availableTools?: string[];
}

export default function AnalyticsFilter({
  onFilterChange,
  availableTools = [
    "Web Search",
    "File Operations",
    "Database Query",
    "API Call",
    "Code Execution",
  ],
}: AnalyticsFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilterOptions>({
    dateRange: "24h",
    status: "all",
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleDateRangeChange = (value: string) => {
    const newFilters = {
      ...filters,
      dateRange: value as AnalyticsFilterOptions["dateRange"],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleToolTypeChange = (value: string) => {
    const newFilters = {
      ...filters,
      toolType: value === "all" ? undefined : value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      ...filters,
      status: value as AnalyticsFilterOptions["status"],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleMinDurationChange = (value: string) => {
    const newFilters = {
      ...filters,
      minDuration: value ? parseFloat(value) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleMaxDurationChange = (value: string) => {
    const newFilters = {
      ...filters,
      maxDuration: value ? parseFloat(value) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const handleMinSuccessRateChange = (value: string) => {
    const newFilters = {
      ...filters,
      minSuccessRate: value ? parseFloat(value) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const updateActiveFilters = (currentFilters: AnalyticsFilterOptions) => {
    const active: string[] = [];

    if (currentFilters.dateRange !== "24h") {
      active.push(`Date: ${currentFilters.dateRange}`);
    }

    if (currentFilters.toolType) {
      active.push(`Tool: ${currentFilters.toolType}`);
    }

    if (currentFilters.status !== "all") {
      active.push(`Status: ${currentFilters.status}`);
    }

    if (currentFilters.minDuration !== undefined) {
      active.push(`Min Duration: ${currentFilters.minDuration}s`);
    }

    if (currentFilters.maxDuration !== undefined) {
      active.push(`Max Duration: ${currentFilters.maxDuration}s`);
    }

    if (currentFilters.minSuccessRate !== undefined) {
      active.push(`Min Success Rate: ${currentFilters.minSuccessRate}%`);
    }

    setActiveFilters(active);
  };

  const handleReset = () => {
    const defaultFilters: AnalyticsFilterOptions = {
      dateRange: "24h",
      status: "all",
    };
    setFilters(defaultFilters);
    setActiveFilters([]);
    onFilterChange(defaultFilters);
  };

  const removeFilter = (filterLabel: string) => {
    if (filterLabel.startsWith("Date:")) {
      handleDateRangeChange("24h");
    } else if (filterLabel.startsWith("Tool:")) {
      handleToolTypeChange("all");
    } else if (filterLabel.startsWith("Status:")) {
      handleStatusChange("all");
    } else if (filterLabel.startsWith("Min Duration:")) {
      handleMinDurationChange("");
    } else if (filterLabel.startsWith("Max Duration:")) {
      handleMaxDurationChange("");
    } else if (filterLabel.startsWith("Min Success Rate:")) {
      handleMinSuccessRateChange("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <Button
          variant={isExpanded ? "default" : "outline"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter size={16} />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            Reset All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-foreground"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {isExpanded && (
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tool Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tool Type</label>
              <Select
                value={filters.toolType || "all"}
                onValueChange={handleToolTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  {availableTools.map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status || "all"} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Success Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Success Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="5"
                placeholder="0"
                value={filters.minSuccessRate || ""}
                onChange={(e) => handleMinSuccessRateChange(e.target.value)}
              />
            </div>

            {/* Min Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Duration (seconds)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={filters.minDuration || ""}
                onChange={(e) => handleMinDurationChange(e.target.value)}
              />
            </div>

            {/* Max Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Duration (seconds)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="No limit"
                value={filters.maxDuration || ""}
                onChange={(e) => handleMaxDurationChange(e.target.value)}
              />
            </div>
          </div>

          {/* Custom Date Range (if selected) */}
          {filters.dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="datetime-local" />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => setIsExpanded(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
