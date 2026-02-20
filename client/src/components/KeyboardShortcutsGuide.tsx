import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Keyboard, X } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: "navigation" | "editing" | "search" | "sessions" | "general";
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["Cmd", "K"], description: "Open command palette", category: "navigation" },
  { keys: ["Cmd", "/"], description: "Show keyboard shortcuts", category: "navigation" },
  { keys: ["Cmd", "1"], description: "Go to Chat tab", category: "navigation" },
  { keys: ["Cmd", "2"], description: "Go to Tools tab", category: "navigation" },
  { keys: ["Cmd", "3"], description: "Go to Analytics tab", category: "navigation" },
  { keys: ["Cmd", "Shift", "S"], description: "Go to Settings", category: "navigation" },

  // Editing
  { keys: ["Cmd", "A"], description: "Select all text", category: "editing" },
  { keys: ["Cmd", "C"], description: "Copy selected text", category: "editing" },
  { keys: ["Cmd", "V"], description: "Paste text", category: "editing" },
  { keys: ["Cmd", "Z"], description: "Undo last action", category: "editing" },
  { keys: ["Cmd", "Shift", "Z"], description: "Redo last action", category: "editing" },

  // Search
  { keys: ["Cmd", "F"], description: "Search in current page", category: "search" },
  { keys: ["Cmd", "Shift", "F"], description: "Advanced search", category: "search" },
  { keys: ["Escape"], description: "Clear search", category: "search" },

  // Sessions
  { keys: ["Cmd", "N"], description: "Create new session", category: "sessions" },
  { keys: ["Cmd", "E"], description: "Export current session", category: "sessions" },
  { keys: ["Cmd", "R"], description: "Rename current session", category: "sessions" },
  { keys: ["Cmd", "D"], description: "Delete current session", category: "sessions" },
  { keys: ["Cmd", "L"], description: "Clone current session", category: "sessions" },

  // General
  { keys: ["Enter"], description: "Send message", category: "general" },
  { keys: ["Shift", "Enter"], description: "New line in message", category: "general" },
  { keys: ["Tab"], description: "Focus next element", category: "general" },
  { keys: ["Shift", "Tab"], description: "Focus previous element", category: "general" },
];

interface KeyboardShortcutsGuideProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KeyboardShortcutsGuide({ open = false, onOpenChange }: KeyboardShortcutsGuideProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const categories = ["navigation", "editing", "search", "sessions", "general"] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    navigation: "Navigation",
    editing: "Editing",
    search: "Search",
    sessions: "Sessions",
    general: "General",
  };

  const KeyDisplay = ({ keys }: { keys: string[] }) => (
    <div className="flex gap-1">
      {keys.map((key, idx) => (
        <div key={`item-${idx}`}>
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
            {key}
          </kbd>
          {idx < keys.length - 1 && <span className="mx-1 text-gray-400">+</span>}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        <DialogDescription>
          Press <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:border-gray-500">Cmd</kbd> or <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:border-gray-500">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:border-gray-500">/</kbd> to toggle this guide
        </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="navigation" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-3">
              {shortcuts
                .filter((s) => s.category === category)
                .map((shortcut, idx) => (
                  <div key={`item-${idx}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <KeyDisplay keys={shortcut.keys} />
                  </div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
