import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch =
          (shortcut.ctrlKey ?? false) === (event.ctrlKey || event.metaKey);
        const shiftMatch =
          (shortcut.shiftKey ?? false) === event.shiftKey;
        const altMatch = (shortcut.altKey ?? false) === event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);

  return {
    getShortcutDisplay: (shortcut: KeyboardShortcut) => {
      const parts: string[] = [];
      if (shortcut.ctrlKey) parts.push("Ctrl");
      if (shortcut.shiftKey) parts.push("Shift");
      if (shortcut.altKey) parts.push("Alt");
      parts.push(shortcut.key.toUpperCase());
      return parts.join("+");
    },
  };
}

export const DEFAULT_SHORTCUTS: Record<string, KeyboardShortcut> = {
  search: {
    key: "k",
    ctrlKey: true,
    description: "Open search",
    callback: () => {
      // Will be overridden by component
    },
  },
  newSession: {
    key: "n",
    ctrlKey: true,
    description: "Create new session",
    callback: () => {
      // Will be overridden by component
    },
  },
  bookmarks: {
    key: "b",
    ctrlKey: true,
    description: "Open bookmarks",
    callback: () => {
      // Will be overridden by component
    },
  },
  notifications: {
    key: ".",
    ctrlKey: true,
    description: "Open notifications",
    callback: () => {
      // Will be overridden by component
    },
  },
  help: {
    key: "?",
    shiftKey: true,
    description: "Show help",
    callback: () => {
      // Will be overridden by component
    },
  },
  toggleSidebar: {
    key: "\\",
    ctrlKey: true,
    description: "Toggle sidebar",
    callback: () => {
      // Will be overridden by component
    },
  },
};
