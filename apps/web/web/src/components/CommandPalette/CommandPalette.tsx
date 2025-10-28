import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Inline Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  'data-testid'?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'medium',
  className = '',
  'data-testid': testId,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

// Command interface
interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  action: () => void;
  category: 'navigation' | 'action' | 'search';
  keywords: string[];
}

// CommandPalette Props
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: Command[] = useMemo(
    () => [
      {
        id: 'nav-home',
        title: 'Go to Home',
        subtitle: 'Landing page',
        icon: '🏠',
        action: () => navigate('/'),
        category: 'navigation',
        keywords: ['home', 'landing', 'main'],
      },
      {
        id: 'nav-admin',
        title: 'Open Admin Dashboard',
        subtitle: 'Admin portal',
        icon: '⚙️',
        action: () => navigate('/admin'),
        category: 'navigation',
        keywords: ['admin', 'dashboard', 'settings'],
      },
      {
        id: 'nav-routes',
        title: 'Open Route Catalog',
        subtitle: 'Developer tools',
        icon: '🗺️',
        action: () => navigate('/dev/routes'),
        category: 'navigation',
        keywords: ['routes', 'catalog', 'dev', 'developer'],
      },
      {
        id: 'nav-users',
        title: 'Manage Admin Users',
        subtitle: 'User administration',
        icon: '👥',
        action: () => navigate('/admin-users'),
        category: 'navigation',
        keywords: ['users', 'admin', 'roles', 'permissions'],
      },
      {
        id: 'nav-rbac',
        title: 'RBAC Management',
        subtitle: 'Role-based access control',
        icon: '🔐',
        action: () => navigate('/rbac'),
        category: 'navigation',
        keywords: ['rbac', 'roles', 'permissions', 'access', 'control'],
      },
      {
        id: 'nav-audit',
        title: 'Audit Log',
        subtitle: 'View audit trail',
        icon: '📋',
        action: () => navigate('/audit-log'),
        category: 'navigation',
        keywords: ['audit', 'log', 'compliance', 'security', 'impersonation'],
      },
      {
        id: 'nav-parent',
        title: 'Parent Portal',
        subtitle: 'Parent dashboard',
        icon: '👨‍👩‍👧',
        action: () => navigate('/parent'),
        category: 'navigation',
        keywords: ['parent', 'dashboard', 'family'],
      },
      {
        id: 'nav-teacher',
        title: 'Teacher Portal',
        subtitle: 'Teacher dashboard',
        icon: '👩‍🏫',
        action: () => navigate('/teacher'),
        category: 'navigation',
        keywords: ['teacher', 'educator', 'classroom'],
      },
      {
        id: 'nav-learner',
        title: 'Learner App',
        subtitle: 'Student learning interface',
        icon: '🎓',
        action: () => navigate('/learner'),
        category: 'navigation',
        keywords: ['learner', 'student', 'learn', 'education'],
      },
      {
        id: 'nav-district',
        title: 'District Admin',
        subtitle: 'District management',
        icon: '🏫',
        action: () => navigate('/district'),
        category: 'navigation',
        keywords: ['district', 'admin', 'school', 'management'],
      },
      {
        id: 'action-theme-light',
        title: 'Switch to Light Theme',
        icon: '☀️',
        action: () => {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        },
        category: 'action',
        keywords: ['theme', 'light', 'appearance', 'mode'],
      },
      {
        id: 'action-theme-dark',
        title: 'Switch to Dark Theme',
        icon: '🌙',
        action: () => {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        },
        category: 'action',
        keywords: ['theme', 'dark', 'appearance', 'mode'],
      },
      {
        id: 'action-clear-cache',
        title: 'Clear Browser Cache',
        subtitle: 'Reset local storage',
        icon: '🗑️',
        action: () => {
          localStorage.clear();
          sessionStorage.clear();
          alert('Cache cleared! Page will reload.');
          window.location.reload();
        },
        category: 'action',
        keywords: ['clear', 'cache', 'reset', 'storage'],
      },
      {
        id: 'action-keyboard-shortcuts',
        title: 'View Keyboard Shortcuts',
        icon: '⌨️',
        action: () => {
          alert('Keyboard Shortcuts:\n\nCtrl+K (Cmd+K) - Command Palette\nCtrl+/ - Show shortcuts\nEsc - Close dialogs');
        },
        category: 'action',
        keywords: ['keyboard', 'shortcuts', 'hotkeys', 'help'],
      },
    ],
    [navigate]
  );

  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.subtitle?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    );
  }, [query, commands]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<Command['category'], Command[]> = {
      navigation: [],
      action: [],
      search: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      className="command-palette overflow-hidden"
      data-testid="command-palette"
    >
      <div>
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full pl-14 pr-4 py-4 text-lg border-b-2 border-neutral-200 outline-none focus:border-blue-500"
            autoFocus
            data-testid="command-input"
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>No commands found for "{query}"</div>
              <div className="text-sm mt-2">Try searching for navigation, actions, or settings</div>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => {
                if (cmds.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase">
                      {category}
                    </div>
                    {cmds.map((cmd) => {
                      const index = filteredCommands.indexOf(cmd);
                      const isSelected = index === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          className={`
                            w-full text-left px-4 py-3 flex items-center gap-3 transition
                            ${
                              isSelected
                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                : 'hover:bg-neutral-50 border-l-4 border-transparent'
                            }
                          `}
                          data-testid={`command-${cmd.id}`}
                        >
                          <span className="text-2xl">{cmd.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{cmd.title}</div>
                            {cmd.subtitle && (
                              <div className="text-sm text-neutral-600 truncate">{cmd.subtitle}</div>
                            )}
                          </div>
                          {isSelected && (
                            <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-mono">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-4 py-3 flex items-center justify-between text-xs text-neutral-600 bg-neutral-50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-neutral-300 rounded font-mono">Esc</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
          <span className="font-medium">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

// Keyboard shortcut hook
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const meta = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+K or Ctrl+K to toggle command palette
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Ctrl+/ to show keyboard shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        alert(
          'Keyboard Shortcuts:\n\n' +
            (isMac ? '⌘+K' : 'Ctrl+K') + ' - Command Palette\n' +
            'Ctrl+/ - Show this help\n' +
            'Esc - Close dialogs\n' +
            '↑↓ - Navigate lists\n' +
            '↵ - Confirm/Select'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}

// Export default
export default CommandPalette;
