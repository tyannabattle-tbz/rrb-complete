import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  onSearchFocus?: () => void;
  onEscapePress?: () => void;
}

export function useKeyboardShortcuts({ onSearchFocus, onEscapePress }: KeyboardShortcutOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Cmd+K or Ctrl+K for search focus
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearchFocus?.();
      }

      // Escape key to close dropdowns
      if (event.key === 'Escape') {
        onEscapePress?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus, onEscapePress]);
}
