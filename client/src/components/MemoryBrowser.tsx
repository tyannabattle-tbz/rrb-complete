import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Edit2, Copy, Check } from "lucide-react";
import { useState as useStateHook } from "react";

interface MemoryEntry {
  id: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryBrowserProps {
  entries: MemoryEntry[];
  isLoading?: boolean;
  onAddEntry?: (key: string, value: string) => Promise<void>;
  onUpdateEntry?: (key: string, value: string) => Promise<void>;
  onDeleteEntry?: (key: string) => Promise<void>;
  sessionId?: number;
}

export default function MemoryBrowser({
  entries,
  isLoading,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  sessionId,
}: MemoryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEntries = entries.filter(
    (entry) =>
      entry.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddEntry = async () => {
    if (!newKey.trim() || !newValue.trim()) return;

    try {
      await onAddEntry?.(newKey, newValue);
      setNewKey("");
      setNewValue("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add entry:", error);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingKey || !editingValue.trim()) return;

    try {
      await onUpdateEntry?.(editingKey, editingValue);
      setEditingKey(null);
      setEditingValue("");
    } catch (error) {
      console.error("Failed to update entry:", error);
    }
  };

  const handleDeleteEntry = async (key: string) => {
    if (confirm(`Delete memory entry "${key}"?`)) {
      try {
        await onDeleteEntry?.(key);
      } catch (error) {
        console.error("Failed to delete entry:", error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Persistent Memory</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!sessionId}>
              <Plus size={16} />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Memory Entry</DialogTitle>
              <DialogDescription>
                Store a new key-value pair in persistent memory
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">Key</Label>
                <Input
                  id="new-key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., research_findings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-value">Value</Label>
                <Textarea
                  id="new-value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the value (can be JSON)"
                  rows={6}
                />
              </div>
              <Button
                onClick={handleAddEntry}
                className="w-full"
                disabled={!newKey.trim() || !newValue.trim()}
              >
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!sessionId && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning mb-6">
          Please create or select a session to view memory
        </div>
      )}

      {/* Search */}
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search memory entries..."
        className="mb-6"
        disabled={!sessionId}
      />

      {/* Memory Entries */}
      <div className="flex-1 overflow-y-auto scrollbar-elegant space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {entries.length === 0
              ? "No memory entries yet"
              : "No matching entries found"}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono font-semibold text-sm text-foreground break-all">
                      {entry.key}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {entry.updatedAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(entry.value, entry.key)}
                      className="p-1.5 hover:bg-muted/20 rounded transition-colors"
                      title="Copy value"
                    >
                      {copiedKey === entry.key ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} className="text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingKey(entry.key);
                        setEditingValue(entry.value);
                      }}
                      className="p-1.5 hover:bg-muted/20 rounded transition-colors"
                      title="Edit entry"
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.key)}
                      className="p-1.5 hover:bg-error/10 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-muted/20 rounded text-xs font-mono text-muted-foreground overflow-auto max-h-24">
                  {entry.value.length > 200
                    ? entry.value.substring(0, 200) + "..."
                    : entry.value}
                </div>

                {/* Edit Mode */}
                {editingKey === entry.key && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      rows={4}
                      className="font-mono text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateEntry}
                        size="sm"
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingKey(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
        <p>Total entries: {entries.length}</p>
        <p>Showing: {filteredEntries.length}</p>
      </div>
    </div>
  );
}
