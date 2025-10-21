import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  handler: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for registering global keyboard shortcuts
 * 
 * @example
 * // Using object parameter
 * useKeyboardShortcuts({ shortcuts: [...], enabled: true });
 * 
 * // Using array parameter (convenience)
 * useKeyboardShortcuts([...]);
 */
export function useKeyboardShortcuts(
  param: UseKeyboardShortcutsOptions | KeyboardShortcut[]
) {
  const options: UseKeyboardShortcutsOptions = Array.isArray(param)
    ? { shortcuts: param, enabled: true }
    : param;

  const { shortcuts, enabled = true } = options;
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.alt ? e.altKey : !e.altKey;
        const metaMatches = shortcut.meta ? e.metaKey : !e.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKeyName(modifier: 'ctrl' | 'shift' | 'alt' | 'meta'): string {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  
  const modifierNames: Record<string, string> = {
    ctrl: isMac ? '⌃' : 'Ctrl',
    shift: isMac ? '⇧' : 'Shift',
    alt: isMac ? '⌥' : 'Alt',
    meta: isMac ? '⌘' : 'Win',
  };

  return modifierNames[modifier] || modifier;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push(getModifierKeyName('ctrl'));
  if (shortcut.shift) parts.push(getModifierKeyName('shift'));
  if (shortcut.alt) parts.push(getModifierKeyName('alt'));
  if (shortcut.meta) parts.push(getModifierKeyName('meta'));

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  COMMAND_PALETTE: {
    key: 'k',
    ctrl: true,
    description: 'Open command palette',
  },
  SEARCH: {
    key: 'f',
    ctrl: true,
    description: 'Search',
  },
  SAVE: {
    key: 's',
    ctrl: true,
    description: 'Save',
  },
  UNDO: {
    key: 'z',
    ctrl: true,
    description: 'Undo',
  },
  REDO: {
    key: 'y',
    ctrl: true,
    description: 'Redo',
  },
  HELP: {
    key: '/',
    ctrl: true,
    description: 'Show keyboard shortcuts',
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Close dialog/Cancel',
  },
} as const;

export default useKeyboardShortcuts;
