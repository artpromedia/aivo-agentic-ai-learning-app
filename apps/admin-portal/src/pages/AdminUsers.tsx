import React, { useState } from 'react';
import { useRBAC } from '@aivo/auth';
import { AdminUser, Role, ROLE_DEFINITIONS, ROLES } from '@aivo/types';

// Inline Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'medium', children }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">{children}</div>
      </div>
    </div>
  );
};

// Inline Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  onClick, 
  children, 
  className = '',
  'data-testid': testId,
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium transition ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

// Inline Card component
const Card: React.FC<{ children: React.ReactNode; padding?: 'none' | 'normal' }> = ({ 
  children, 
  padding = 'normal' 
}) => (
  <div className={`bg-white rounded-xl border-2 border-neutral-200 ${padding === 'normal' ? 'p-6' : ''}`}>
    {children}
  </div>
);

// Inline Input component
interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  'data-testid'?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required,
  leftIcon,
  'data-testid': testId,
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none transition ${leftIcon ? 'pl-10' : ''}`}
        data-testid={testId}
      />
    </div>
  </div>
);

// Inline Switch component
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'data-testid'?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, 'data-testid': testId }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? 'bg-green-500' : 'bg-neutral-300'
    }`}
    data-testid={testId}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// UserRow Component
const UserRow: React.FC<{
  user: AdminUser;
  onToggleRole: (userId: string, role: Role) => void;
  onUpdateUser: (userId: string, updates: Partial<AdminUser>) => void;
  onRemoveUser: (userId: string) => void;
}> = ({ user, onToggleRole, onUpdateUser, onRemoveUser }) => {
  const [showRoles, setShowRoles] = useState(false);

  const handleRemove = () => {
    if (window.confirm(`Remove user ${user.name}? This cannot be undone.`)) {
      onRemoveUser(user.id);
    }
  };

  return (
    <>
      <tr className="hover:bg-neutral-50" data-testid={`user-row-${user.id}`}>
        <td className="p-4">
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-neutral-600">{user.email}</div>
          </div>
        </td>
        
        <td className="p-4">
          <Switch
            checked={user.active}
            onChange={(checked) => onUpdateUser(user.id, { active: checked })}
            data-testid={`user-active-${user.id}`}
          />
        </td>
        
        <td className="p-4">
          <button
            onClick={() => setShowRoles(!showRoles)}
            className="flex flex-wrap gap-1"
            data-testid={`toggle-roles-${user.id}`}
          >
            {user.roles.length === 0 ? (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded">
                No roles
              </span>
            ) : (
              <>
                {user.roles.slice(0, 2).map(role => {
                  const def = ROLE_DEFINITIONS[role];
                  return (
                    <span
                      key={role}
                      className={`px-2 py-1 text-xs rounded ${def.color}`}
                    >
                      {def.name}
                    </span>
                  );
                })}
                {user.roles.length > 2 && (
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                    +{user.roles.length - 2}
                  </span>
                )}
              </>
            )}
          </button>
        </td>
        
        <td className="p-4">
          <span className={`text-sm ${user.mfa_enabled ? 'text-green-600' : 'text-neutral-400'}`}>
            {user.mfa_enabled ? '✓ Enabled' : '○ Disabled'}
          </span>
        </td>
        
        <td className="p-4 text-sm text-neutral-600">
          {user.lastLogin 
            ? new Date(user.lastLogin).toLocaleDateString()
            : 'Never'
          }
        </td>
        
        <td className="p-4 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            data-testid={`remove-user-${user.id}`}
          >
            Remove
          </Button>
        </td>
      </tr>

      {showRoles && (
        <tr>
          <td colSpan={6} className="bg-neutral-50 p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {ROLES.map(role => {
                const def = ROLE_DEFINITIONS[role];
                const hasRole = user.roles.includes(role);
                
                return (
                  <label
                    key={role}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                      ${hasRole ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={hasRole}
                      onChange={() => onToggleRole(user.id, role)}
                      className="mt-1"
                      data-testid={`role-${user.id}-${role}`}
                    />
                    <div className="flex-1">
                      <div className={`text-sm font-medium mb-1 ${def.color} inline-block px-2 py-1 rounded`}>
                        {def.name}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {def.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// AddUserModal Component
const AddUserModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, email: string, roles: Role[]) => AdminUser;
}> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const handleSubmit = () => {
    if (!name || !email) {
      alert('Name and email are required');
      return;
    }

    onAdd(name, email, selectedRoles);
    setName('');
    setEmail('');
    setSelectedRoles([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      size="large"
    >
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Assign Roles
          </label>
          <div className="grid md:grid-cols-2 gap-2">
            {ROLES.map(role => {
              const def = ROLE_DEFINITIONS[role];
              const isSelected = selectedRoles.includes(role);
              
              return (
                <label
                  key={role}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(r => r !== role));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${def.color} inline-block px-2 py-0.5 rounded`}>
                      {def.name}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Main AdminUsersPage Component
export default function AdminUsers() {
  const { users, toggleRole, addUser, removeUser, updateUser } = useRBAC();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      filterRole === 'all' || user.roles.includes(filterRole);
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-neutral-600 mt-1">
            Manage user roles and permissions
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          data-testid="add-user-button"
        >
          + Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<span>🔍</span>}
            data-testid="user-search"
          />
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as Role | 'all')}
            className="px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-blue-500 focus:outline-none"
            data-testid="role-filter"
          >
            <option value="all">All Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>
                {ROLE_DEFINITIONS[role].name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Roles</th>
                <th className="text-left p-4 font-semibold">MFA</th>
                <th className="text-left p-4 font-semibold">Last Login</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  onToggleRole={toggleRole}
                  onUpdateUser={updateUser}
                  onRemoveUser={removeUser}
                />
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              No users found
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addUser}
      />
    </div>
  );
}
