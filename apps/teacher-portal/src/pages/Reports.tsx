import { useState } from 'react';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('progress');

  const reportTypes = [
    { id: 'progress', name: 'Progress Report', icon: '📈', description: 'Student progress across all subjects' },
    { id: 'iep', name: 'IEP Summary', icon: '📋', description: 'IEP goals and accommodations' },
    { id: 'attendance', name: 'Attendance Log', icon: '📅', description: 'Student attendance records' },
    { id: 'goals', name: 'Goal Achievement', icon: '🎯', description: 'Goal completion rates and trends' },
  ];

  const recentReports = [
    { name: 'Q2 Progress Report - Grade 5', date: 'March 1, 2025', type: 'PDF', size: '2.4 MB' },
    { name: 'IEP Review - Emma Johnson', date: 'Feb 28, 2025', type: 'PDF', size: '1.8 MB' },
    { name: 'Class Attendance - February', date: 'Feb 27, 2025', type: 'Excel', size: '580 KB' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Reports & Data Export</h1>
        <p className="text-neutral-600 mt-1">Generate and export reports for IEP meetings and documentation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-6 rounded-2xl text-left transition-all border-2 ${
              selectedReport === report.id
                ? 'border-teal-600 bg-teal-50 shadow-lg'
                : 'border-neutral-200 bg-white hover:border-teal-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 mb-1">{report.name}</h3>
                <p className="text-sm text-neutral-600">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Generate Report</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
              />
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Students</label>
            <select className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm">
              <option>All Students</option>
              <option>Emma Johnson</option>
              <option>Michael Chen</option>
              <option>James Martinez</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Format</label>
            <select className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm">
              <option>PDF Document</option>
              <option>Excel Spreadsheet</option>
              <option>Print-Friendly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Include</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm text-neutral-700">Progress Data</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm text-neutral-700">Goal Status</span>
              </label>
            </div>
          </div>
        </div>
        <button className="mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all">
          Generate & Download Report
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Recent Reports</h2>
        <div className="space-y-3">
          {recentReports.map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{report.name}</p>
                  <p className="text-sm text-neutral-600">
                    {report.date} • {report.type} • {report.size}
                  </p>
                </div>
              </div>
              <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
