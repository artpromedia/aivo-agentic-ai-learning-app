import { useState } from 'react';
import { getDistricts } from '../utils/mockData';

export default function DistrictManagement() {
  const [districts] = useState(getDistricts());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || district.tier === filterTier;
    const matchesStatus = filterStatus === 'all' || district.accountStatus === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      case 'premium': return 'bg-blue-100 text-blue-700';
      case 'basic': return 'bg-green-100 text-green-700';
      case 'trial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'trial': return 'bg-blue-100 text-blue-700';
      case 'suspended': return 'bg-amber-100 text-amber-700';
      case 'churned': return 'bg-red-100 text-red-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">District Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage districts, contracts, and license allocation
          </p>
        </div>
        <button 
          onClick={() => setShowOnboardModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + Onboard New District
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Districts</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{districts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {districts.filter(d => d.accountStatus === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Trial</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {districts.filter(d => d.accountStatus === 'trial').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total MRR</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ${(districts.reduce((sum, d) => sum + d.monthlyRecurringRevenue, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="churned">Churned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Districts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Schools
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  License Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  MRR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredDistricts.map((district) => (
                <tr key={district.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{district.name}</div>
                      <div className="text-sm text-neutral-500">{district.state}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(district.tier)}`}>
                      {district.tier.charAt(0).toUpperCase() + district.tier.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(district.accountStatus)}`}>
                      {district.accountStatus.charAt(0).toUpperCase() + district.accountStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {district.totalSchools}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {district.totalStudents.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 mr-2">
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden w-24">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(district.usedLicenses / district.totalLicenses) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-neutral-600">
                        {district.usedLicenses}/{district.totalLicenses}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                    ${district.monthlyRecurringRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => { setSelectedDistrict(district); setShowViewModal(true); }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => { setSelectedDistrict(district); setShowEditModal(true); }}
                      className="text-neutral-600 hover:text-neutral-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Showing Results */}
      <div className="text-sm text-neutral-600 text-center">
        Showing {filteredDistricts.length} of {districts.length} districts
      </div>

      {/* Onboard New District Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowOnboardModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Onboard New District</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">District Name</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="Springfield Unified School District" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>CA</option>
                  <option>TX</option>
                  <option>NY</option>
                  <option>FL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Total Students</label>
                <input type="number" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="15000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subscription Tier</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Trial</option>
                  <option>Basic</option>
                  <option>Premium</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">License Count</label>
                <input type="number" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="1000" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Primary Contact Name</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="Dr. Sarah Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Email</label>
                <input type="email" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="contact@district.edu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Phone</label>
                <input type="tel" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="(555) 123-4567" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contract Start Date</label>
                <input type="date" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowOnboardModal(false)} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('District onboarded successfully'); setShowOnboardModal(false); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Onboard District
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View District Modal */}
      {showViewModal && selectedDistrict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">{selectedDistrict.name}</h3>
                <p className="text-neutral-600 mt-1">{selectedDistrict.state} • {selectedDistrict.totalStudents.toLocaleString()} students</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600">Tier</p>
                <p className="text-lg font-bold text-neutral-900 capitalize mt-1">{selectedDistrict.tier}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600">Status</p>
                <p className="text-lg font-bold text-green-600 capitalize mt-1">{selectedDistrict.accountStatus}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600">MRR</p>
                <p className="text-lg font-bold text-neutral-900 mt-1">${selectedDistrict.monthlyRecurringRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">License Usage</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(selectedDistrict.usedLicenses / selectedDistrict.totalLicenses) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{selectedDistrict.usedLicenses} / {selectedDistrict.totalLicenses}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Contract Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-600">Contract Start</p>
                    <p className="font-medium text-neutral-900">{selectedDistrict.contractStart.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Contract End</p>
                    <p className="font-medium text-neutral-900">{selectedDistrict.contractEnd.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowViewModal(false)} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Close
              </button>
              <button onClick={() => { setShowViewModal(false); setShowEditModal(true); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Edit District
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {showEditModal && selectedDistrict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Edit District: {selectedDistrict.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subscription Tier</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg" defaultValue={selectedDistrict.tier}>
                  <option value="trial">Trial</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Account Status</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg" defaultValue={selectedDistrict.accountStatus}>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Total Licenses</label>
                <input type="number" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" defaultValue={selectedDistrict.totalLicenses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Revenue</label>
                <input type="number" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" defaultValue={selectedDistrict.monthlyRecurringRevenue} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Contract End Date</label>
                <input type="date" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('District updated successfully'); setShowEditModal(false); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
