import { useState, useEffect } from 'react';
import { schoolAPI, type School } from '../services/api';

export default function SchoolManagement() {
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'needs-attention'>('all');

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const schools = await schoolAPI.list({ limit: 500 });
      setAllSchools(schools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schools');
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (schoolData: any) => {
    try {
      await schoolAPI.create(schoolData);
      await fetchSchools(); // Refresh the list
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating school:', err);
      alert(err instanceof Error ? err.message : 'Failed to create school');
    }
  };

  const handleToggleStatus = async (schoolId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await schoolAPI.deactivate(schoolId);
      } else {
        await schoolAPI.activate(schoolId);
      }
      await fetchSchools(); // Refresh the list
    } catch (err) {
      console.error('Error toggling school status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update school status');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSchools}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter schools
  const filteredSchools = allSchools.filter((school) => {
    const matchesSearch =
      school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.principal_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && school.is_active) ||
      (filterStatus === 'needs-attention' && (!school.is_active || school.seats_used >= school.seats_allocated * 0.9));

    return matchesSearch && matchesFilter;
  });

  // Calculate district totals
  const districtTotals = {
    totalSchools: allSchools.length,
    activeSchools: allSchools.filter(s => s.is_active).length,
    totalSeatsAllocated: allSchools.reduce((sum, s) => sum + s.seats_allocated, 0),
    totalSeatsUsed: allSchools.reduce((sum, s) => sum + s.seats_used, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">School Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage {allSchools.length} schools across the district
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Add New School
        </button>
      </div>

      {/* District Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Schools</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{districtTotals.totalSchools}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active Schools</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{districtTotals.activeSchools}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Seats</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {districtTotals.totalSeatsAllocated.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Seats Used</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {districtTotals.totalSeatsUsed.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search schools, principals, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Schools ({allSchools.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Active (≥90%)
            </button>
            <button
              onClick={() => setFilterStatus('needs-attention')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === 'needs-attention'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Needs Attention
            </button>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Seats Allocated
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Seats Used
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSchools.map((school) => {
                const seatsUsagePercent = school.seats_allocated > 0 
                  ? Math.floor((school.seats_used / school.seats_allocated) * 100) 
                  : 0;

                return (
                  <tr key={school.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{school.school_name}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {school.school_code || 'No code'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-neutral-900">{school.principal_name || 'Not assigned'}</p>
                        <p className="text-xs text-neutral-500 mt-1">{school.principal_email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-neutral-900">
                          {school.city && school.state ? `${school.city}, ${school.state}` : 'Not set'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{school.postal_code || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          school.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {school.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-semibold text-neutral-900">{school.seats_allocated}</p>
                      <p className="text-xs text-neutral-500">allocated</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-semibold text-neutral-900">{school.seats_used}</p>
                      <p className="text-xs text-green-600">
                        {seatsUsagePercent}% used
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-neutral-900">
                          {school.seats_allocated - school.seats_used}
                        </span>
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              seatsUsagePercent >= 90
                                ? 'bg-red-500'
                                : seatsUsagePercent >= 75
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${seatsUsagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-xs text-neutral-500">
                        {school.district_name || 'District'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(school.id, school.is_active)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            school.is_active
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {school.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-neutral-600">No schools found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Add New School</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddSchool({
                  district_id: formData.get('district_id') as string,
                  school_name: formData.get('school_name') as string,
                  school_code: formData.get('school_code') as string,
                  address: formData.get('address') as string,
                  city: formData.get('city') as string,
                  state: formData.get('state') as string,
                  postal_code: formData.get('postal_code') as string,
                  principal_name: formData.get('principal_name') as string,
                  principal_email: formData.get('principal_email') as string,
                  admin_email: formData.get('admin_email') as string,
                  seats_allocated: parseInt(formData.get('seats_allocated') as string) || 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  name="school_name"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  District ID *
                </label>
                <input
                  type="text"
                  name="district_id"
                  required
                  placeholder="Enter district UUID"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  School Code
                </label>
                <input
                  type="text"
                  name="school_code"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Principal Name
                </label>
                <input
                  type="text"
                  name="principal_name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Principal Email
                </label>
                <input
                  type="email"
                  name="principal_email"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    maxLength={2}
                    placeholder="CA"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Seats Allocated
                </label>
                <input
                  type="number"
                  name="seats_allocated"
                  defaultValue={0}
                  min={0}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
