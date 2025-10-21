import { useState } from 'react';
import { getDatabaseMetrics } from '../utils/mockData';

export default function DatabaseAdmin() {
  const metrics = getDatabaseMetrics();
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  const handleRunQuery = () => setShowQueryModal(true);
  const handleCreateBackup = () => setShowBackupModal(true);
  const handleRestore = () => setShowRestoreModal(true);
  const handleExport = () => setShowExportModal(true);
  const handleOptimize = () => setShowOptimizeModal(true);
  
  const closeModals = () => {
    setShowQueryModal(false);
    setShowBackupModal(false);
    setShowRestoreModal(false);
    setShowExportModal(false);
    setShowOptimizeModal(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Database Administration</h1>
        <p className="text-neutral-600 mt-1">Database performance and operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Queries</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{(metrics.totalQueries / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Query Time</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{metrics.averageQueryTime.toFixed(1)}ms</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Cache Hit Rate</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.cacheHitRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Database Size</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.databaseSize.toFixed(1)} GB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Active Connections</span>
              <span className="text-lg font-bold text-blue-600">{metrics.activeConnections}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Slow Queries</span>
              <span className="text-lg font-bold text-amber-600">{metrics.slowQueries}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Index Efficiency</span>
              <span className="text-lg font-bold text-green-600">{metrics.indexEfficiency.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Replication Lag</span>
              <span className="text-lg font-bold text-purple-600">{metrics.replicationLag.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={handleRunQuery}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-left flex items-center justify-between"
            >
              <span>Run Manual Query</span>
              <span>→</span>
            </button>
            <button 
              onClick={handleCreateBackup}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-left flex items-center justify-between"
            >
              <span>Create Backup</span>
              <span>→</span>
            </button>
            <button 
              onClick={handleRestore}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-left flex items-center justify-between"
            >
              <span>Restore Database</span>
              <span>→</span>
            </button>
            <button 
              onClick={handleExport}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-left flex items-center justify-between"
            >
              <span>Export Data</span>
              <span>→</span>
            </button>
            <button 
              onClick={handleOptimize}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-left flex items-center justify-between"
            >
              <span>Optimize Indexes</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Run Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Run Manual Query</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">SQL Query</label>
                <textarea 
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-sm" 
                  rows={8}
                  placeholder="SELECT * FROM users WHERE..."
                ></textarea>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">⚠️ <strong>Warning:</strong> Running manual queries can affect production data. Use with caution.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Query executed successfully'); closeModals(); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Execute Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Create Database Backup</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Backup Name</label>
                <input type="text" className="w-full px-3 py-2 border border-neutral-300 rounded-lg" placeholder="backup_2024_01_15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Backup Type</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Full Backup</option>
                  <option>Incremental Backup</option>
                  <option>Differential Backup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Storage Location</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>AWS S3 (Primary)</option>
                  <option>Google Cloud Storage</option>
                  <option>Local Storage</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">💡 Estimated backup size: {metrics.databaseSize.toFixed(1)} GB</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Backup started successfully'); closeModals(); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Start Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Restore Database</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Select Backup</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>backup_2024_01_15_full.sql (250 GB)</option>
                  <option>backup_2024_01_14_full.sql (248 GB)</option>
                  <option>backup_2024_01_13_full.sql (245 GB)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Restore Target</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Production Database</option>
                  <option>Staging Database</option>
                  <option>Development Database</option>
                </select>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">⚠️ <strong>Critical Warning:</strong> Restoring will overwrite all current data in the target database. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { if(confirm('Are you absolutely sure you want to restore? This will overwrite all data.')) { alert('Restore started'); closeModals(); } }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Restore Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Export Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Export Format</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>CSV</option>
                  <option>JSON</option>
                  <option>SQL</option>
                  <option>Excel (XLSX)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tables to Export</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-neutral-300 rounded-lg">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> users</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> districts</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> learners</label>
                  <label className="flex items-center gap-2"><input type="checkbox" /> activity_logs</label>
                  <label className="flex items-center gap-2"><input type="checkbox" /> assessments</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Compression</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>ZIP</option>
                  <option>GZIP</option>
                  <option>None</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Export started. You will receive an email when complete.'); closeModals(); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Start Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimize Indexes Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Optimize Database Indexes</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2"><strong>Current Index Efficiency:</strong> {metrics.indexEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-blue-800">Optimization will analyze and rebuild fragmented indexes to improve query performance.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Optimization Level</label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg">
                  <option>Light (Quick scan, minimal impact)</option>
                  <option>Medium (Balanced optimization)</option>
                  <option>Deep (Comprehensive rebuild, may take hours)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-neutral-700">Run during low-traffic hours only</span>
                </label>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">⏱️ Estimated time: 15-45 minutes depending on level</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Index optimization started'); closeModals(); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                Start Optimization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
