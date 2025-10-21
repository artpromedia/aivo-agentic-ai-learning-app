import React, { useState } from 'react';
import { useRBAC } from '@aivo/auth';
import { ROLE_DEFINITIONS } from '@aivo/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  'data-testid'?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  children,
  'data-testid': testId,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid={testId}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  onClick,
  children,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const ViewAsSelector: React.FC = () => {
  const { users, currentUser, impersonate } = useRBAC();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImpersonate = (userId: string) => {
    impersonate(userId);
    setIsOpen(false);
    
    // Log impersonation for audit
    console.log(`[IMPERSONATION] Switched to user: ${userId}`);
    
    // Show notification
    const user = users.find(u => u.id === userId);
    if (user) {
      alert(`Now viewing as: ${user.name} (${user.email})`);
    }
  };

  return (
    <>
      {/* Compact Selector in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg hover:bg-yellow-100 transition"
        title="View as different user (QA/Testing)"
        data-testid="view-as-button"
      >
        <span className="text-sm font-medium">👤 View as:</span>
        <span className="text-sm text-neutral-700">{currentUser.name}</span>
        <div className="flex gap-1">
          {currentUser.roles.slice(0, 2).map(role => {
            const def = ROLE_DEFINITIONS[role];
            return (
              <span
                key={role}
                className={`px-2 py-0.5 rounded text-xs ${def.color}`}
              >
                {def.name.split(' ')[0]}
              </span>
            );
          })}
          {currentUser.roles.length > 2 && (
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600">
              +{currentUser.roles.length - 2}
            </span>
          )}
        </div>
      </button>

      {/* Full User Selector Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="View As User"
        size="large"
        data-testid="view-as-modal"
      >
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">
                  Impersonation Mode
                </p>
                <p className="text-sm text-yellow-800">
                  This feature is for QA testing and debugging only. All actions will be logged.
                  Switch back to your account when done.
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl"
            data-testid="user-search"
            autoFocus
          />

          {/* User List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleImpersonate(user.id)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition
                  ${user.id === currentUser.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
                data-testid={`impersonate-${user.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{user.name}</span>
                      {user.id === currentUser.id && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          CURRENT
                        </span>
                      )}
                      {!user.active && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{user.email}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded">
                          No roles
                        </span>
                      ) : (
                        user.roles.map(role => {
                          const def = ROLE_DEFINITIONS[role];
                          return (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs rounded ${def.color}`}
                            >
                              {def.name}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {user.id !== currentUser.id && (
                    <div className="text-blue-600 font-medium text-sm">
                      Switch →
                    </div>
                  )}
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
