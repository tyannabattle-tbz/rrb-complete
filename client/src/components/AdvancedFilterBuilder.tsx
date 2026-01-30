import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus, Trash2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AdvancedFilterBuilderProps {
  onApplyFilter?: (results: any[]) => void;
}

export function AdvancedFilterBuilder({ onApplyFilter }: AdvancedFilterBuilderProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [presetName, setPresetName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: presets } = trpc.advancedFilters.getFilterPresets.useQuery();
  const savePresetMutation = trpc.advancedFilters.saveFilterPreset.useMutation();

  const fields = [
    { value: "status", label: "Status" },
    { value: "tool", label: "Tool Used" },
    { value: "duration", label: "Duration (ms)" },
    { value: "result", label: "Result" },
    { value: "date", label: "Date" },
    { value: "user", label: "User" },
  ];

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "gt", label: "Greater Than" },
    { value: "lt", label: "Less Than" },
    { value: "between", label: "Between" },
  ];

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: "status",
      operator: "equals",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleApplyFilter = async () => {
    setIsLoading(true);
    try {
      const filterConfig = conditions.reduce(
        (acc, cond) => {
          acc[cond.field] = { operator: cond.operator, value: cond.value };
          return acc;
        },
        {} as Record<string, any>
      );

      // For now, just show a success message
      alert(`Applied filter with ${conditions.length} condition(s)`);
      if (onApplyFilter) {
        onApplyFilter([]);
      }
    } catch (error) {
      alert(`Failed to apply filter: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert("Please enter a preset name");
      return;
    }

    try {
      const filterConfig = conditions.reduce(
        (acc, cond) => {
          acc[cond.field] = { operator: cond.operator, value: cond.value };
          return acc;
        },
        {} as Record<string, any>
      );

      await savePresetMutation.mutateAsync({
        name: presetName,
        filterConfig,
        isPublic: false,
      });

      setPresetName("");
      alert("Filter preset saved successfully!");
    } catch (error) {
      alert(`Failed to save preset: ${error}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <div>
            <CardTitle>Advanced Filter Builder</CardTitle>
            <CardDescription>Build complex queries with multiple conditions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conditions */}
        <div className="space-y-3">
          {conditions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
              No conditions yet. Add one to get started.
            </div>
          ) : (
            conditions.map((condition) => (
              <div key={condition.id} className="flex gap-2 items-end p-3 border rounded-lg bg-accent/30">
                <Select value={condition.field} onValueChange={(value) => updateCondition(condition.id, { field: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={condition.operator} onValueChange={(value) => updateCondition(condition.id, { operator: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  className="flex-1"
                />

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCondition(condition.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add Condition Button */}
        <Button onClick={addCondition} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Condition
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyFilter} disabled={isLoading || conditions.length === 0} className="flex-1">
            Apply Filter
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={conditions.length === 0}>
                <Save className="w-4 h-4 mr-2" />
                Save as Preset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Filter Preset</DialogTitle>
                <DialogDescription>Give your filter a name to save it for later use</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSavePreset}>Save Preset</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Saved Presets */}
        {presets && presets.presets && presets.presets.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Saved Presets</h4>
            <div className="flex flex-wrap gap-2">
              {presets.presets.map((preset: any) => (
                <Badge key={preset.id} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {preset.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
