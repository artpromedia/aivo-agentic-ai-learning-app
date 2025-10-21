import { useState } from 'react';
import { getUsers, DistrictUser, getSchools } from '../utils/mockData';

export default function UserManagement() {
  const [users, setUsers] = useState(getUsers());
  const schools = getSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<DistrictUser['role'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'teacher' as DistrictUser['role'],
    schoolId: '',
    phoneNumber: '',
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.status === 'active') ||
      (statusFilter === 'inactive' && user.status !== 'active');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => u.role === 'district-admin' || u.role === 'school-admin').length,
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const school = schools.find(s => s.id === newUser.schoolId);
    
    const user: DistrictUser = {
      id: `user-${users.length + 1}`,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phoneNumber,
      role: newUser.role,
      schoolId: newUser.schoolId,
      schoolName: school?.name || 'Unassigned',
      status: 'active',
      lastLogin: new Date(),
      accountCreated: new Date(),
      licenseAssigned: true,
      permissions: ['view_reports', 'manage_students'],
      usageStats: {
        loginCount: 0,
        featuresUsed: [],
        lastFeatureUsed: 'N/A',
      },
    };
    
    setUsers([...users, user]);
    setShowAddUserModal(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'teacher',
      schoolId: '',
      phoneNumber: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage {stats.total} users across the district
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
          >
            📥 Import CSV
          </button>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Users</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active Users</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Teachers</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.teachers}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Parents</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.parents}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Administrators</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, email, or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="district-admin">District Admin</option>
              <option value="school-admin">School Admin</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="support-staff">Support Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive/Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  License
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Login Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredUsers.slice(0, 50).map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'district-admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'school-admin'
                          ? 'bg-blue-100 text-blue-700'
                          : user.role === 'teacher'
                          ? 'bg-green-100 text-green-700'
                          : user.role === 'parent'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {user.role.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-neutral-900">{user.schoolName || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : user.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.licenseAssigned ? (
                      <span className="text-green-600 text-lg">✓</span>
                    ) : (
                      <span className="text-neutral-400 text-lg">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-neutral-900">
                      {Math.floor((Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24))}d ago
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-900">
                      {user.usageStats.loginCount}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-neutral-600">No users found matching your filters</p>
          </div>
        )}

        {filteredUsers.length > 50 && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-600">
              Showing 50 of {filteredUsers.length} users. Use filters to narrow results.
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Add New User</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Create a new user account and assign to a school
              </p>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john.doe@school.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as DistrictUser['role'] })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="school-admin">School Administrator</option>
                    <option value="district-admin">District Administrator</option>
                    <option value="parent">Parent</option>
                    <option value="support-staff">Support Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Assigned School <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newUser.schoolId}
                    onChange={(e) => setNewUser({ ...newUser, schoolId: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a school...</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📧 An invitation email will be sent to <strong>{newUser.email || '(email address)'}</strong> with instructions to set up their account.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({
                      firstName: '',
                      lastName: '',
                      email: '',
                      role: 'teacher',
                      schoolId: '',
                      phoneNumber: '',
                    });
                  }}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create User & Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Import Users from CSV</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Upload a CSV file to bulk import users
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <span className="text-5xl block mb-4">📤</span>
                <p className="text-lg font-medium text-neutral-900 mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-neutral-600 mb-4">
                  Maximum file size: 10MB
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Choose File
                </button>
              </div>

              {/* CSV Template */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Required CSV Format:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-300">
                        <th className="px-3 py-2 text-left font-mono text-xs">firstName</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">lastName</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">email</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">role</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">schoolId</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-neutral-600">
                        <td className="px-3 py-2">John</td>
                        <td className="px-3 py-2">Doe</td>
                        <td className="px-3 py-2">john.doe@school.edu</td>
                        <td className="px-3 py-2">teacher</td>
                        <td className="px-3 py-2">school-1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  📥 Download Template CSV
                </button>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Import Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
