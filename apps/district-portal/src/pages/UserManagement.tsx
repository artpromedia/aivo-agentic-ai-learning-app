import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { getSchools } from '../utils/mockData';
import { userAPI, type User } from '../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    teachers: 0,
    parents: 0,
    admins: 0,
  });
  const schools = getSchools();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<User['role'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'teacher' as User['role'],
    schoolId: '',
    password: '',
  });
  const [editUser, setEditUser] = useState({
    full_name: '',
    email: '',
    role: 'teacher' as User['role'],
    school_name: '',
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState<{
    total_rows: number;
    successful: number;
    failed: number;
    errors: Array<{ row: number; email: string; error: string }>;
  } | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userAPI.list({ limit: 100 });
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats from API
  const fetchStats = async () => {
    try {
      const data = await userAPI.getStats();
      setStats({
        total: data.total_users,
        active: data.active_users,
        teachers: data.users_by_role['teacher'] || 0,
        parents: data.users_by_role['parent'] || 0,
        admins: (data.users_by_role['district-admin'] || 0) + (data.users_by_role['school-admin'] || 0),
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Filter users (client-side for now, could move to API params)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.school_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle add user
  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const school = schools.find(s => s.id === newUser.schoolId);
      
      await userAPI.create({
        email: newUser.email,
        full_name: `${newUser.firstName} ${newUser.lastName}`,
        password: newUser.password || 'ChangeMe123!', // Temporary password
        role: newUser.role,
        school_name: school?.name,
      });

      // Refresh user list and stats
      await fetchUsers();
      await fetchStats();
      
      setShowAddUserModal(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: 'teacher',
        schoolId: '',
        password: '',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  // Handle deactivate user
  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await userAPI.deactivate(userId);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  // Handle activate user
  const handleActivateUser = async (userId: string) => {
    try {
      await userAPI.activate(userId);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to activate user');
    }
  };

  // Handle view user
  const handleViewUser = async (userId: string) => {
    try {
      const user = await userAPI.get(userId);
      setSelectedUser(user);
      setShowViewUserModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to fetch user details');
    }
  };

  // Handle edit user (open modal)
  const handleEditUserClick = async (userId: string) => {
    try {
      const user = await userAPI.get(userId);
      setSelectedUser(user);
      setEditUser({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        school_name: user.school_name || '',
      });
      setShowEditUserModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to fetch user details');
    }
  };

  // Handle update user (submit)
  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await userAPI.update(selectedUser.id, editUser);
      await fetchUsers();
      await fetchStats();
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  // Handle CSV file selection
  const handleCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setCsvFile(file);
      setCsvImportResult(null);
    }
  };

  // Handle CSV import
  const handleImportCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setCsvImporting(true);
      const result = await userAPI.importCSV(csvFile);
      setCsvImportResult(result);
      
      if (result.successful > 0) {
        await fetchUsers();
        await fetchStats();
      }
      
      // Don't close modal automatically so user can see results
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import users');
    } finally {
      setCsvImporting(false);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const template = 'email,full_name,password,role,school_name,district_name\n' +
                    'john.doe@school.edu,John Doe,password123,teacher,Lincoln Elementary,Springfield District\n' +
                    'jane.smith@school.edu,Jane Smith,password456,parent,Lincoln Elementary,Springfield District';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Reset CSV import modal
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setCsvFile(null);
    setCsvImportResult(null);
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Error Loading Users</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              onChange={(e) => setRoleFilter(e.target.value as User['role'] | 'all')}
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
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
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {user.full_name}
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
                    <p className="text-sm text-neutral-900">{user.school_name || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {user.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.is_verified ? (
                      <span className="text-green-600 text-lg">✓</span>
                    ) : (
                      <span className="text-neutral-400 text-lg">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm text-neutral-900">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-semibold text-neutral-900">
                      —
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditUserClick(user.id)}
                        className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          Activate
                        </button>
                      )}
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
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Leave blank for default: ChangeMe123!"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  If left blank, default password "ChangeMe123!" will be used. User will be prompted to change on first login.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
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
                      password: '',
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
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-5xl block mb-4">📤</span>
                  <p className="text-lg font-medium text-neutral-900 mb-2">
                    {csvFile ? csvFile.name : 'Drop your CSV file here or click to browse'}
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Maximum file size: 10MB
                  </p>
                  <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    Choose File
                  </span>
                </label>
              </div>

              {/* Import Results */}
              {csvImportResult && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Import Results:</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{csvImportResult.total_rows}</p>
                      <p className="text-sm text-neutral-600">Total Rows</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{csvImportResult.successful}</p>
                      <p className="text-sm text-neutral-600">Successful</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{csvImportResult.failed}</p>
                      <p className="text-sm text-neutral-600">Failed</p>
                    </div>
                  </div>
                  
                  {csvImportResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Errors:</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {csvImportResult.errors.map((error, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                            <p className="text-red-700">
                              <span className="font-semibold">Row {error.row}:</span> {error.email}
                            </p>
                            <p className="text-red-600 text-xs mt-1">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CSV Template */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Required CSV Format:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-300">
                        <th className="px-3 py-2 text-left font-mono text-xs">email</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">full_name</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">password</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">role</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">school_name</th>
                        <th className="px-3 py-2 text-left font-mono text-xs">district_name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-neutral-600">
                        <td className="px-3 py-2">john.doe@school.edu</td>
                        <td className="px-3 py-2">John Doe</td>
                        <td className="px-3 py-2">password123</td>
                        <td className="px-3 py-2">teacher</td>
                        <td className="px-3 py-2">Lincoln Elementary</td>
                        <td className="px-3 py-2">Springfield District</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-sm text-neutral-600">
                  <p className="mb-2"><span className="font-semibold">Valid roles:</span> teacher, parent, school-admin, district-admin, support-staff</p>
                  <p><span className="font-semibold">Note:</span> school_name and district_name are optional</p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  📥 Download Template CSV
                </button>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                <button
                  onClick={handleCloseImportModal}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  {csvImportResult ? 'Close' : 'Cancel'}
                </button>
                {!csvImportResult && (
                  <button 
                    onClick={handleImportCSV}
                    disabled={!csvFile || csvImporting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {csvImporting ? 'Importing...' : 'Import Users'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`}
                    alt={selectedUser.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{selectedUser.full_name}</h2>
                    <p className="text-sm text-neutral-600">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">User ID</label>
                  <p className="text-sm text-neutral-900 font-mono bg-neutral-50 p-2 rounded">{selectedUser.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Role</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedUser.role === 'district-admin'
                        ? 'bg-purple-100 text-purple-700'
                        : selectedUser.role === 'school-admin'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedUser.role === 'teacher'
                        ? 'bg-green-100 text-green-700'
                        : selectedUser.role === 'parent'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {selectedUser.role.replace('-', ' ')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">School</label>
                  <p className="text-sm text-neutral-900">{selectedUser.school_name || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">District</label>
                  <p className="text-sm text-neutral-900">{selectedUser.district_name || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Status</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedUser.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Email Verified</label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedUser.is_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {selectedUser.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Onboarding Status</label>
                  <p className="text-sm text-neutral-900 capitalize">{selectedUser.onboarding_status.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Last Login</label>
                  <p className="text-sm text-neutral-900">
                    {selectedUser.last_login 
                      ? new Date(selectedUser.last_login).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Account Created</label>
                  <p className="text-sm text-neutral-900">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-500 mb-1">Last Updated</label>
                  <p className="text-sm text-neutral-900">
                    {new Date(selectedUser.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div className="space-x-2">
                  {selectedUser.is_active ? (
                    <button
                      onClick={() => {
                        handleDeactivateUser(selectedUser.id);
                        setShowViewUserModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Deactivate User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleActivateUser(selectedUser.id);
                        setShowViewUserModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      Activate User
                    </button>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setShowViewUserModal(false);
                      handleEditUserClick(selectedUser.id);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      setShowViewUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Edit User</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Update user information for {selectedUser.full_name}
              </p>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john.doe@school.edu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as User['role'] })}
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
                    Assigned School
                  </label>
                  <select
                    value={schools.find(s => s.name === editUser.school_name)?.id || ''}
                    onChange={(e) => {
                      const school = schools.find(s => s.id === e.target.value);
                      setEditUser({ ...editUser, school_name: school?.name || '' });
                    }}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Not assigned</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Changes will take effect immediately. The user may need to log out and log back in for role changes to apply.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
