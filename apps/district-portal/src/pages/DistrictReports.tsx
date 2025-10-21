import { useState } from 'react';

export default function DistrictReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const reportTypes = [
    {
      id: 'district-performance',
      name: 'District Performance Summary',
      description: 'Comprehensive overview of district-wide performance metrics',
      icon: '📊',
      frequency: 'Weekly',
    },
    {
      id: 'school-comparison',
      name: 'School Comparison Report',
      description: 'Side-by-side analysis of all schools in the district',
      icon: '🏫',
      frequency: 'Monthly',
    },
    {
      id: 'iep-compliance',
      name: 'IEP Compliance Report',
      description: 'Detailed compliance tracking and overdue items',
      icon: '✓',
      frequency: 'Weekly',
    },
    {
      id: 'student-progress',
      name: 'Student Progress Report',
      description: 'District-wide student achievement and growth data',
      icon: '📈',
      frequency: 'Monthly',
    },
    {
      id: 'teacher-effectiveness',
      name: 'Teacher Effectiveness Report',
      description: 'Teacher adoption rates and feature usage analytics',
      icon: '👩‍🏫',
      frequency: 'Quarterly',
    },
    {
      id: 'resource-utilization',
      name: 'Resource Utilization Report',
      description: 'License usage and resource allocation analysis',
      icon: '🔑',
      frequency: 'Monthly',
    },
    {
      id: 'parent-engagement',
      name: 'Parent Engagement Report',
      description: 'Parent portal usage and communication metrics',
      icon: '👨‍👩‍👧',
      frequency: 'Monthly',
    },
    {
      id: 'special-education',
      name: 'Special Education Services Report',
      description: 'Complete special education program analysis',
      icon: '🎓',
      frequency: 'Quarterly',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">District Reports</h1>
        <p className="text-neutral-600 mt-1">
          Generate and schedule comprehensive district-level reports
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
              selectedReport === report.id
                ? 'border-indigo-500 shadow-md'
                : 'border-neutral-200 hover:border-indigo-300'
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{report.icon}</span>
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
                {report.frequency}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{report.name}</h3>
            <p className="text-sm text-neutral-600 mb-4">{report.description}</p>
            <button
              className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReport(report.id);
                setShowDownloadModal(true);
              }}
            >
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {/* Export Options */}
      {selectedReport && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Export Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                setDownloadFormat('pdf');
                setShowDownloadModal(true);
              }}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-center group"
            >
              <span className="text-3xl block mb-2">📄</span>
              <span className="text-sm font-medium text-neutral-900 group-hover:text-red-600">
                Export as PDF
              </span>
              <p className="text-xs text-neutral-500 mt-1">Printable format</p>
            </button>

            <button 
              onClick={() => {
                setDownloadFormat('excel');
                setShowDownloadModal(true);
              }}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center group"
            >
              <span className="text-3xl block mb-2">📊</span>
              <span className="text-sm font-medium text-neutral-900 group-hover:text-green-600">
                Export as Excel
              </span>
              <p className="text-xs text-neutral-500 mt-1">Formatted spreadsheet</p>
            </button>

            <button 
              onClick={() => {
                setDownloadFormat('csv');
                setShowDownloadModal(true);
              }}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
            >
              <span className="text-3xl block mb-2">📑</span>
              <span className="text-sm font-medium text-neutral-900 group-hover:text-blue-600">
                Export as CSV
              </span>
              <p className="text-xs text-neutral-500 mt-1">Raw data analysis</p>
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Scheduled Automated Reports</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
            + Schedule New Report
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-semibold text-neutral-900">Weekly Performance Summary</p>
                <p className="text-sm text-neutral-600">Every Monday at 8:00 AM • PDF & Email</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
              <button className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm">
                Edit
              </button>
            </div>
          </div>

          <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-semibold text-neutral-900">Monthly IEP Compliance</p>
                <p className="text-sm text-neutral-600">1st of each month • Excel & Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
              <button className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm">
                Edit
              </button>
            </div>
          </div>

          <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🏫</span>
              <div>
                <p className="font-semibold text-neutral-900">Quarterly School Comparison</p>
                <p className="text-sm text-neutral-600">End of each quarter • PDF & Email</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Active
              </span>
              <button className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recently Generated Reports</h2>
        <div className="space-y-2">
          {[
            { name: 'District Performance Summary - Week 42', date: '2 days ago', size: '2.4 MB' },
            { name: 'IEP Compliance Report - October', date: '5 days ago', size: '1.8 MB' },
            { name: 'School Comparison Report Q3', date: '1 week ago', size: '3.2 MB' },
            { name: 'Parent Engagement Analysis', date: '2 weeks ago', size: '1.1 MB' },
          ].map((report, index) => (
            <div
              key={index}
              className="p-3 border border-neutral-200 rounded-lg flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{report.name}</p>
                  <p className="text-xs text-neutral-500">
                    {report.date} • {report.size}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Download Report Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">Download Report</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Configure export settings for {selectedReport ? reportTypes.find(r => r.id === selectedReport)?.name : 'your report'}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const report = reportTypes.find(r => r.id === selectedReport);
              if (report) {
                // Simulate download
                const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${downloadFormat === 'excel' ? 'xlsx' : downloadFormat}`;
                console.log('Downloading:', fileName, 'Format:', downloadFormat, 'Date Range:', dateRange);
                // In a real app, this would trigger a file download
                alert(`Report "${report.name}" will be downloaded as ${downloadFormat.toUpperCase()}`);
                setShowDownloadModal(false);
                setDateRange({ start: '', end: '' });
              }
            }} className="p-6 space-y-6">
              {/* Report Info */}
              {selectedReport && reportTypes.find(r => r.id === selectedReport) && (
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reportTypes.find(r => r.id === selectedReport)?.icon}</span>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {reportTypes.find(r => r.id === selectedReport)?.name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {reportTypes.find(r => r.id === selectedReport)?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Export Format *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDownloadFormat('pdf')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      downloadFormat === 'pdf'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-neutral-200 hover:border-red-300 text-neutral-700'
                    }`}
                  >
                    <span className="block text-2xl mb-1">📄</span>
                    <span className="text-sm font-medium">PDF</span>
                    <p className="text-xs text-neutral-500 mt-1">Printable</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDownloadFormat('excel')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      downloadFormat === 'excel'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-neutral-200 hover:border-green-300 text-neutral-700'
                    }`}
                  >
                    <span className="block text-2xl mb-1">📊</span>
                    <span className="text-sm font-medium">Excel</span>
                    <p className="text-xs text-neutral-500 mt-1">Spreadsheet</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDownloadFormat('csv')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      downloadFormat === 'csv'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-neutral-200 hover:border-blue-300 text-neutral-700'
                    }`}
                  >
                    <span className="block text-2xl mb-1">📋</span>
                    <span className="text-sm font-medium">CSV</span>
                    <p className="text-xs text-neutral-500 mt-1">Raw Data</p>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Helper Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Download Options:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li><strong>PDF</strong> - Best for printing and sharing with stakeholders</li>
                      <li><strong>Excel</strong> - Editable spreadsheet with charts and formatting</li>
                      <li><strong>CSV</strong> - Raw data for custom analysis or importing into other tools</li>
                    </ul>
                    <p className="mt-2">
                      {dateRange.start && dateRange.end 
                        ? `Data from ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
                        : 'Leave date range empty to include all available data'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDateRange({ start: '', end: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <span>Download {downloadFormat.toUpperCase()}</span>
                  <span>⬇️</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
