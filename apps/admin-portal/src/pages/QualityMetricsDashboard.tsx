/**
 * Quality Metrics Dashboard
 * Real-time monitoring of question quality and performance
 */
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Download,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface QualityReport {
  reportGenerated: string;
  dateRange: {
    start: string;
    end: string;
  };
  overview: {
    totalAIGeneratedItems: number;
    totalResponses: number;
    itemsPendingReview: number;
    problematicItems: number;
  };
  qualityDistribution: Record<string, number>;
  domainBreakdown: Array<{
    domain: string;
    itemCount: number;
    avgQuality: number;
    avgAccuracy: number;
  }>;
  problematicItems: Array<{
    itemId: string;
    domain: string;
    gradeBand: string;
    stem: string;
    issues: string[];
    severity: number;
    recommendedAction: string;
  }>;
  recommendations: string[];
}

export function QualityMetricsDashboard() {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadQualityReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadQualityReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:9000/api/v1/baseline/quality-report?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Failed to load quality report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quality-report-${dateRange.start}-to-${dateRange.end}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading quality metrics...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          <AlertCircle className="mx-auto mb-4 h-16 w-16" />
          <p>Failed to load quality report</p>
        </div>
      </div>
    );
  }

  // Chart data
  const qualityDistributionData = {
    labels: Object.keys(report.qualityDistribution),
    datasets: [
      {
        label: 'Number of Items',
        data: Object.values(report.qualityDistribution),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Excellent - green
          'rgba(59, 130, 246, 0.8)', // Good - blue
          'rgba(251, 191, 36, 0.8)', // Fair - yellow
          'rgba(239, 68, 68, 0.8)', // Needs Improvement - red
        ],
      },
    ],
  };

  const domainQualityData = {
    labels: report.domainBreakdown.map((d) => d.domain),
    datasets: [
      {
        label: 'Avg Quality Score',
        data: report.domainBreakdown.map((d) => d.avgQuality),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Avg Accuracy %',
        data: report.domainBreakdown.map((d) => d.avgAccuracy),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Quality Metrics Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor AI-generated question quality and performance
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="rounded-lg border p-2"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="rounded-lg border p-2"
              />
            </div>

            <button
              onClick={downloadReport}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <Activity className="h-8 w-8 text-blue-600" />
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {report.overview.totalAIGeneratedItems}
            </p>
            <p className="text-sm text-gray-600">AI-Generated Items</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {report.overview.totalResponses.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Responses</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              {report.overview.itemsPendingReview > 10 ? (
                <TrendingUp className="h-6 w-6 text-orange-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {report.overview.itemsPendingReview}
            </p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <AlertCircle className="h-8 w-8 text-red-600" />
              {report.overview.problematicItems > 0 ? (
                <AlertCircle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {report.overview.problematicItems}
            </p>
            <p className="text-sm text-gray-600">Problematic Items</p>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quality Distribution */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Quality Distribution</h3>
            <Pie data={qualityDistributionData} />
          </div>

          {/* Domain Performance */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Domain Performance</h3>
            <Bar
              data={domainQualityData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold">Recommendations</h3>
            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-blue-50 p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problematic Items */}
        {report.problematicItems.length > 0 && (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b p-6">
              <h3 className="text-lg font-bold">
                Problematic Items Requiring Attention
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Issues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.problematicItems.map((item) => (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                          {item.stem}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.itemId}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {item.domain}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {item.gradeBand}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="space-y-1 text-sm text-gray-700">
                          {item.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              item.severity >= 6
                                ? 'bg-red-500'
                                : item.severity >= 4
                                  ? 'bg-orange-500'
                                  : 'bg-yellow-500'
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {item.severity}/10
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.recommendedAction === 'retire'
                              ? 'bg-red-100 text-red-800'
                              : item.recommendedAction === 'revise'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {item.recommendedAction.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


