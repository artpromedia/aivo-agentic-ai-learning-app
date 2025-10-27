import { useState, useEffect, useCallback } from 'react';
import { reportsAPI, type Report, type ScheduledReport, type ReportFormat, type ReportType } from '../services/api';

export default function DistrictReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<ReportFormat>('pdf');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  
  // API data state
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Load data on mount
  const loadReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [generated, scheduled] = await Promise.all([
        reportsAPI.list({ limit: 10 }),
        reportsAPI.listScheduled({ is_active: true }),
      ]);
      setGeneratedReports(generated);
      setScheduledReports(scheduled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    const reportType = reportTypes.find((r) => r.id === selectedReport);
    if (!reportType) return;

    setIsGenerating(true);
    setError(null);

    try {
      const reportName = `${reportType.name} - ${new Date().toLocaleDateString()}`;
      
      const report = await reportsAPI.generate({
        report_type: selectedReport as ReportType,
        report_name: reportName,
        format: downloadFormat,
        date_range_start: dateRange.start || undefined,
        date_range_end: dateRange.end || undefined,
      });

      // Close modal
      setShowDownloadModal(false);
      setDateRange({ start: '', end: '' });

      // Refresh reports list
      await loadReportsData();

      // If completed immediately, download it
      if (report.status === 'completed' && report.id) {
        await handleDownloadReport(report.id, report.file_name || `${reportName}.${downloadFormat}`);
      } else {
        alert(`Report "${reportName}" is being generated. You can download it from the "Recently Generated Reports" section once it's ready.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle report download
  const handleDownloadReport = async (reportId: number, fileName: string) => {
    try {
      const blob = await reportsAPI.download(reportId);
      reportsAPI.triggerDownload(blob, fileName);
    } catch (err) {
      alert('Failed to download report. Please try again.');
    }
  };

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
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            + Schedule New Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-neutral-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2">Loading scheduled reports...</p>
          </div>
        ) : scheduledReports.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No scheduled reports yet. Click "+ Schedule New Report" to set up automated reporting.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledReports.map((schedule) => {
              const reportType = reportTypes.find((r) => r.id === schedule.report_type);
              return (
                <div
                  key={schedule.id}
                  className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{reportType?.icon || '📊'}</span>
                    <div>
                      <p className="font-semibold text-neutral-900">{schedule.name}</p>
                      <p className="text-sm text-neutral-600">
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} • {schedule.format.toUpperCase()}
                        {schedule.email_recipients && schedule.email_recipients.length > 0 && ' • Email'}
                      </p>
                      {schedule.next_run_at && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Next run: {new Date(schedule.next_run_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        schedule.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => {
                        // TODO: Implement edit modal
                        alert('Edit functionality coming soon!');
                      }}
                      className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete scheduled report "${schedule.name}"?`)) {
                          try {
                            await reportsAPI.deleteSchedule(schedule.id);
                            await loadReportsData();
                          } catch (err) {
                            alert('Failed to delete scheduled report');
                          }
                        }
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recently Generated Reports</h2>
        
        {loading ? (
          <div className="text-center py-8 text-neutral-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadReportsData}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : generatedReports.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No reports generated yet. Click "Generate Report" on any report type above to create your first report.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {generatedReports.map((report) => (
              <div
                key={report.id}
                className="p-3 border border-neutral-200 rounded-lg flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{report.report_name}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(report.generated_at).toLocaleDateString()} • 
                      {report.file_size ? ` ${(report.file_size / 1024 / 1024).toFixed(2)} MB` : ' Processing...'} • 
                      <span className={`font-semibold ${
                        report.status === 'completed' ? 'text-green-600' :
                        report.status === 'processing' ? 'text-blue-600' :
                        report.status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                {report.status === 'completed' && report.file_name ? (
                  <button
                    onClick={() => handleDownloadReport(report.id, report.file_name!)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Download
                  </button>
                ) : report.status === 'failed' ? (
                  <span className="px-3 py-1.5 text-xs font-medium text-red-600">
                    Failed
                  </span>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-medium text-blue-600">
                    Processing...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
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
              handleGenerateReport();
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
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate {downloadFormat.toUpperCase()}</span>
                      <span>⬇️</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
