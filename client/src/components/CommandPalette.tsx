import { useState, useEffect } from "react";
import { Search, Plus, Share2, Download, HelpCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category: "session" | "search" | "help" | "collaboration";
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const categoryIcons: Record<string, React.ReactNode> = {
    session: <Plus className="h-4 w-4" />,
    search: <Search className="h-4 w-4" />,
    help: <HelpCircle className="h-4 w-4" />,
    collaboration: <Users className="h-4 w-4" />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No commands found
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.action();
                      onClose();
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-accent transition-colors",
                      selectedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {command.icon || categoryIcons[command.category]}
                      <div className="flex-1">
                        <div className="font-medium">{command.title}</div>
                        {command.description && (
                          <div className="text-xs text-muted-foreground">
                            {command.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {command.shortcut && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {command.shortcut}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
