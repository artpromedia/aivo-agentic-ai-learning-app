import { useState } from 'react';
import { getAIModels } from '../utils/mockData';

interface AIModel {
  modelId: string;
  studentName: string;
  districtName: string;
  averageAccuracy: number;
  totalInferences: number;
  inferenceLatency: number;
  errorRate: number;
  lastTrainedDate: Date;
}

export default function AIModelManagement() {
  const [models] = useState(getAIModels());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const handleViewModel = (model: any) => {
    setSelectedModel(model);
    setShowModelModal(true);
  };

  const filteredModels = models.filter(model =>
    model.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.modelId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgAccuracy = models.reduce((sum, m) => sum + m.averageAccuracy, 0) / models.length;
  const avgLatency = models.reduce((sum, m) => sum + m.inferenceLatency, 0) / models.length;
  const totalInferences = models.reduce((sum, m) => sum + m.totalInferences, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">AI Model Management</h1>
        <p className="text-neutral-600 mt-1">Monitor and manage AI models across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Models</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{models.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Accuracy</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{avgAccuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Latency</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{avgLatency.toFixed(0)}ms</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Total Inferences</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{(totalInferences / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <input
          type="text"
          placeholder="Search by model ID or student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Model ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Inferences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Error Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredModels.slice(0, 20).map((model) => (
                <tr key={model.modelId} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-mono text-neutral-600">{model.modelId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{model.studentName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{model.districtName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      model.averageAccuracy >= 90 ? 'text-green-600' :
                      model.averageAccuracy >= 80 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {model.averageAccuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{model.totalInferences.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{model.inferenceLatency.toFixed(0)}ms</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      model.errorRate < 1 ? 'text-green-600' :
                      model.errorRate < 2 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {model.errorRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleViewModel(model)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Details Modal */}
      {showModelModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModelModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">AI Model Details</h2>
                  <p className="text-neutral-600 mt-1">{selectedModel.modelId}</p>
                </div>
                <button
                  onClick={() => setShowModelModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-1">Student</p>
                  <p className="text-lg font-bold text-neutral-900">{selectedModel.studentName}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-neutral-600 mb-1">District</p>
                  <p className="text-lg font-bold text-neutral-900">{selectedModel.districtName}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-medium text-green-600 mb-1">Accuracy</p>
                    <p className="text-3xl font-bold text-green-700">{selectedModel.averageAccuracy.toFixed(1)}%</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Inferences</p>
                    <p className="text-3xl font-bold text-blue-700">{selectedModel.totalInferences.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm font-medium text-purple-600 mb-1">Latency</p>
                    <p className="text-3xl font-bold text-purple-700">{selectedModel.inferenceLatency.toFixed(0)}ms</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm font-medium text-amber-600 mb-1">Error Rate</p>
                    <p className="text-3xl font-bold text-amber-700">{selectedModel.errorRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              {/* Training History */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Training History</h3>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Last Trained</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {selectedModel.lastTrainedDate?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Training Episodes</span>
                      <span className="text-sm font-semibold text-neutral-900">247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Model Version</span>
                      <span className="text-sm font-semibold text-neutral-900">v2.3.1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Inference Logs */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Inference Logs</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Timestamp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Input Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Confidence</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {[
                        { time: '2 min ago', type: 'Math Problem', confidence: 94.5, result: 'Success' },
                        { time: '15 min ago', type: 'Reading Comp', confidence: 88.2, result: 'Success' },
                        { time: '1 hour ago', type: 'Math Problem', confidence: 91.7, result: 'Success' },
                        { time: '2 hours ago', type: 'Vocabulary', confidence: 96.1, result: 'Success' },
                      ].map((log, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 text-neutral-600">{log.time}</td>
                          <td className="px-4 py-2 text-neutral-900">{log.type}</td>
                          <td className="px-4 py-2">
                            <span className={`font-semibold ${
                              log.confidence >= 90 ? 'text-green-600' :
                              log.confidence >= 80 ? 'text-blue-600' : 'text-amber-600'
                            }`}>
                              {log.confidence}%
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                              {log.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Error Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Error Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-2">Type 1 Errors</p>
                    <p className="text-2xl font-bold text-neutral-900">12</p>
                    <p className="text-xs text-neutral-500 mt-1">False Positives</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-2">Type 2 Errors</p>
                    <p className="text-2xl font-bold text-neutral-900">8</p>
                    <p className="text-xs text-neutral-500 mt-1">False Negatives</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <p className="text-xs text-neutral-500 mb-2">Timeout Errors</p>
                    <p className="text-2xl font-bold text-neutral-900">3</p>
                    <p className="text-xs text-neutral-500 mt-1">Exceeded threshold</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => alert('Archiving model...')}
                className="px-5 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium text-neutral-700 transition-colors"
              >
                Archive Model
              </button>
              <button
                onClick={() => alert('Starting model retraining...')}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retrain Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
