/**
 * RBAC Management Page
 * Manage roles, permissions, and user impersonation for testing
 */

import React, { useState } from 'react';
import { useRBAC } from '@aivo/auth';
import { Role, ROLES, ROLE_DEFINITIONS, AdminUser } from '@aivo/types';
import { RoleBadge } from '@aivo/ui';

export default function RBACManagement() {
  const {
    users,
    currentUser,
    toggleRole,
    addUser,
    removeUser,
    updateUser,
    impersonate,
    resetToDefaults,
  } = useRBAC();

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const handleAddUser = () => {
    if (newUserName && newUserEmail) {
      addUser(newUserName, newUserEmail, selectedRoles);
      setNewUserName('');
      setNewUserEmail('');
      setSelectedRoles([]);
      setShowAddUser(false);
    }
  };

  const handleToggleRole = (userId: string, role: Role) => {
    toggleRole(userId, role);
  };

  const handleImpersonate = (userId: string) => {
    impersonate(userId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RBAC Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage roles, permissions, and test user impersonation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition"
          >
            🔄 Reset to Defaults
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Current User Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Currently Impersonating</p>
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <p className="opacity-90">{currentUser.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.roles.map(role => (
              <span
                key={role}
                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
              >
                {ROLE_DEFINITIONS[role].name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Role Definitions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold mb-4">Role Definitions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map(role => {
            const def = ROLE_DEFINITIONS[role];
            return (
              <div
                key={role}
                className="border-2 border-neutral-200 rounded-xl p-4 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <RoleBadge role={role} showIcon />
                  <span className="text-xs text-neutral-500">
                    Level {def.hierarchy_level}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{def.description}</p>
                <details className="text-xs text-neutral-500">
                  <summary className="cursor-pointer hover:text-neutral-700">
                    {def.permissions.length} permissions
                  </summary>
                  <ul className="mt-2 space-y-1 pl-4">
                    {def.permissions.map(perm => (
                      <li key={perm} className="font-mono">
                        • {perm}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold mb-4">Users & Role Assignments</h2>
        <div className="space-y-3">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser.id}
              onToggleRole={handleToggleRole}
              onImpersonate={handleImpersonate}
              onRemove={() => removeUser(user.id)}
              onUpdateActive={(active) => updateUser(user.id, { active })}
              onUpdateMFA={(mfa_enabled) => updateUser(user.id, { mfa_enabled })}
            />
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-neutral-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-neutral-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role]);
                          } else {
                            setSelectedRoles(selectedRoles.filter(r => r !== role));
                          }
                        }}
                        className="mr-2"
                      />
                      <RoleBadge role={role} size="sm" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                  disabled={!newUserName || !newUserEmail}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserCardProps {
  user: AdminUser;
  isCurrentUser: boolean;
  onToggleRole: (userId: string, role: Role) => void;
  onImpersonate: (userId: string) => void;
  onRemove: () => void;
  onUpdateActive: (active: boolean) => void;
  onUpdateMFA: (enabled: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isCurrentUser,
  onToggleRole,
  onImpersonate,
  onRemove,
  onUpdateActive,
  onUpdateMFA,
}) => {
  return (
    <div
      className={`border-2 rounded-xl p-4 transition ${
        isCurrentUser
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{user.name}</h3>
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                Current
              </span>
            )}
            {!user.active && (
              <span className="px-2 py-0.5 bg-neutral-400 text-white text-xs rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600">{user.email}</p>
          <p className="text-xs text-neutral-500 mt-1">
            Created {new Date(user.createdAt).toLocaleDateString()}
            {user.lastLogin && ` • Last login ${new Date(user.lastLogin).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onImpersonate(user.id)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            disabled={isCurrentUser}
          >
            🎭 Impersonate
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            disabled={isCurrentUser}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-4 mb-3 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={user.active}
            onChange={(e) => onUpdateActive(e.target.checked)}
            className="rounded"
          />
          <span>Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={user.mfa_enabled}
            onChange={(e) => onUpdateMFA(e.target.checked)}
            className="rounded"
          />
          <span>MFA Enabled</span>
        </label>
      </div>

      {/* Roles */}
      <div>
        <p className="text-sm font-medium mb-2">Roles:</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(role => {
            const hasRole = user.roles.includes(role);
            return (
              <button
                key={role}
                onClick={() => onToggleRole(user.id, role)}
                className={`transition ${
                  hasRole ? 'opacity-100' : 'opacity-30 hover:opacity-60'
                }`}
              >
                <RoleBadge role={role} size="sm" showIcon />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
