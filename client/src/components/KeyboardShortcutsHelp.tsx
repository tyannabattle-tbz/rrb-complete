import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsHelpProps {
  onClose?: () => void;
}

export default function KeyboardShortcutsHelp({
  onClose,
}: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getShortcutDisplay = (key: string, shortcut: any) => {
    const parts: string[] = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.shiftKey) parts.push("Shift");
    if (shortcut.altKey) parts.push("Alt");
    parts.push(shortcut.key.toUpperCase());
    return parts.join("+");
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="Keyboard shortcuts (Shift+?)"
      >
        <HelpCircle size={20} />
      </button>

      {/* Help Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle size={24} />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 space-y-4">
              {Object.entries(DEFAULT_SHORTCUTS).map(([key, shortcut]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {shortcut.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {getShortcutDisplay(key, shortcut)}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
