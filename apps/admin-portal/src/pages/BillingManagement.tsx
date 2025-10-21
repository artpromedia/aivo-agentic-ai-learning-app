import { useState } from 'react';
import { getDistricts, getPricingTiers } from '../utils/mockData';

interface InvoiceFormData {
  districtId: string;
  startDate: string;
  endDate: string;
  includeUsageDetails: boolean;
}

export default function BillingManagement() {
  const districts = getDistricts();
  const pricingTiers = getPricingTiers();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    districtId: '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeUsageDetails: true
  });

  const handleGenerateInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = () => {
    const selectedDistrict = districts.find(d => d.id === invoiceData.districtId);
    if (!selectedDistrict) {
      alert('Please select a district');
      return;
    }

    // Simulate PDF generation
    alert(`Generating invoice for ${selectedDistrict.name} from ${invoiceData.startDate} to ${invoiceData.endDate}`);
    setShowInvoiceModal(false);
    setInvoiceData({
      districtId: '',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      includeUsageDetails: true
    });
  };

  const selectedInvoiceDistrict = districts.find(d => d.id === invoiceData.districtId);

  const activeSubscriptions = districts.filter(d => d.accountStatus === 'active' || d.accountStatus === 'trial');
  const totalMRR = districts.reduce((sum, d) => sum + d.monthlyRecurringRevenue, 0);
  const totalARR = totalMRR * 12;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Billing Management</h1>
          <p className="text-neutral-600 mt-1">Subscription management and revenue tracking</p>
        </div>
        <button 
          onClick={handleGenerateInvoice}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all"
        >
          Generate Invoice
        </button>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${(totalMRR / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Annual Recurring Revenue</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">${(totalARR / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Active Subscriptions</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{activeSubscriptions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Churn Rate</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {((districts.filter(d => d.accountStatus === 'churned').length / districts.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">Pricing Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pricingTiers.map((tier) => (
            <div key={tier.name} className="border border-neutral-200 rounded-lg p-4 hover:border-indigo-300 transition">
              <h3 className="text-lg font-bold text-neutral-900 capitalize">{tier.name}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">${tier.pricePerStudent}</p>
              <p className="text-sm text-neutral-600">per student/month</p>
              <p className="text-sm text-neutral-500 mt-2">Min: {tier.minimumSeats} seats</p>
              <p className="text-sm text-neutral-500">Discount: {tier.discount}%</p>
              <p className="text-sm font-medium text-neutral-700 mt-3">{tier.supportLevel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Subscriptions by Tier</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Contract End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">MRR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {districts.slice(0, 10).map((district) => (
                <tr key={district.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{district.name}</td>
                  <td className="px-6 py-4 text-sm capitalize">{district.tier}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {district.contractEnd.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                    ${district.monthlyRecurringRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      district.accountStatus === 'active' ? 'bg-green-100 text-green-700' :
                      district.accountStatus === 'trial' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {district.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Generation Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Generate Invoice</h2>
              <p className="text-neutral-600 mt-1">Create and download a custom invoice</p>
            </div>

            <div className="p-6 space-y-6">
              {/* District Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Select District</label>
                <select
                  value={invoiceData.districtId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, districtId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select a district --</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name} - ${district.monthlyRecurringRevenue.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={invoiceData.startDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={invoiceData.endDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={invoiceData.includeUsageDetails}
                    onChange={(e) => setInvoiceData({ ...invoiceData, includeUsageDetails: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Include detailed usage breakdown</span>
                </label>
              </div>

              {/* Invoice Preview */}
              {selectedInvoiceDistrict && (
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Invoice Preview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">District:</span>
                      <span className="font-medium text-neutral-900">{selectedInvoiceDistrict.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Billing Period:</span>
                      <span className="font-medium text-neutral-900">
                        {new Date(invoiceData.startDate).toLocaleDateString()} - {new Date(invoiceData.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Students:</span>
                      <span className="font-medium text-neutral-900">{selectedInvoiceDistrict.totalStudents.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Pricing Tier:</span>
                      <span className="font-medium text-neutral-900 capitalize">{selectedInvoiceDistrict.tier}</span>
                    </div>
                    <div className="border-t border-neutral-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-neutral-900">Total Amount:</span>
                        <span className="font-bold text-indigo-600 text-lg">${selectedInvoiceDistrict.monthlyRecurringRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={!invoiceData.districtId}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
