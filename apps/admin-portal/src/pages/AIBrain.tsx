import { useState } from 'react';

/**
 * AI Brain Provider Management Page
 * Manages the primary AI provider connection for AIVO AI Brain training
 * Supports dynamic failover to backup providers
 */
export default function AIBrain() {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCurriculaModal, setShowCurriculaModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 minutes ago');

  // Current active provider (only ONE provider is active at a time)
  const [activeProviderId, setActiveProviderId] = useState('openai');

  // AI Provider configurations
  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI',
      status: 'active',
      isPrimary: true,
      apiCalls24h: 45230,
      avgLatency: 234,
      errorRate: 0.02,
      lastSync: '2 minutes ago',
      models: ['GPT-4', 'GPT-3.5-turbo', 'GPT-4-turbo'],
      uptime: 99.98,
      color: 'green',
      description: 'Primary AI provider for AIVO Brain training',
      connectionHealth: 'excellent',
      trainingStatus: 'Training active - Batch #4,523',
      tokensConsumed24h: 12450000,
      costPerToken: 0.00003,
      monthlySpend: 14250
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      status: 'standby',
      isPrimary: false,
      apiCalls24h: 0,
      avgLatency: 189,
      errorRate: 0.01,
      lastSync: '5 minutes ago',
      models: ['Gemini Pro', 'Gemini Ultra', 'Gemini 1.5'],
      uptime: 99.95,
      color: 'blue',
      description: 'Standby failover provider',
      connectionHealth: 'good',
      trainingStatus: 'Ready for failover',
      tokensConsumed24h: 0,
      costPerToken: 0.000025,
      monthlySpend: 0
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      status: 'standby',
      isPrimary: false,
      apiCalls24h: 0,
      avgLatency: 312,
      errorRate: 0.03,
      lastSync: '1 minute ago',
      models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
      uptime: 99.92,
      color: 'blue',
      description: 'Standby failover provider',
      connectionHealth: 'good',
      trainingStatus: 'Ready for failover',
      tokensConsumed24h: 0,
      costPerToken: 0.000035,
      monthlySpend: 0
    },
    {
      id: 'meta',
      name: 'Meta LLaMA',
      status: 'standby',
      isPrimary: false,
      apiCalls24h: 0,
      avgLatency: 445,
      errorRate: 0.08,
      lastSync: '15 minutes ago',
      models: ['LLaMA 2', 'LLaMA 3', 'LLaMA 3.1'],
      uptime: 99.85,
      color: 'blue',
      description: 'Standby failover provider',
      connectionHealth: 'fair',
      trainingStatus: 'Ready for failover',
      tokensConsumed24h: 0,
      costPerToken: 0.00002,
      monthlySpend: 0
    }
  ];

  const activeProvider = aiProviders.find(p => p.id === activeProviderId)!;
  const standbyProviders = aiProviders.filter(p => p.id !== activeProviderId);

  const handleSwitchProvider = (provider: any) => {
    setSelectedProvider(provider);
    setShowSwitchModal(true);
  };

  const confirmSwitch = () => {
    setActiveProviderId(selectedProvider.id);
    setShowSwitchModal(false);
    alert(`Successfully switched to ${selectedProvider.name}. Training will resume in 30 seconds.`);
  };

  const handleViewDetails = (provider: any) => {
    setSelectedProvider(provider);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowSwitchModal(false);
    setShowDetailsModal(false);
    setShowCurriculaModal(false);
    setSelectedProvider(null);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
      alert('✅ Sync completed! All districts and curricula are up to date.');
    }, 2000);
  };

  const handleViewAllCurricula = () => {
    setShowCurriculaModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'standby':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'disconnected':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-700 border border-neutral-300';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      case 'poor': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-neutral-900">AIVO AI Brain</h1>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-300 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Training Active
          </span>
        </div>
        <p className="text-neutral-600">
          Manage AI provider connections for AIVO Brain training. Only one provider is active at a time with automatic failover capability.
        </p>
      </div>

      {/* Active Provider - Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 shadow-lg border-2 border-green-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">Active Provider</h2>
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold uppercase tracking-wide">
                PRIMARY
              </span>
            </div>
            <p className="text-neutral-600">{activeProvider.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">Current Training Status</p>
            <p className="text-lg font-bold text-green-600">{activeProvider.trainingStatus}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-neutral-900">{activeProvider.name}</h3>
              <p className="text-neutral-600">{activeProvider.models.join(', ')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleViewDetails(activeProvider)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium"
              >
                View Details
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-600 mb-1">Uptime</p>
              <p className="text-2xl font-bold text-green-600">{activeProvider.uptime}%</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-600 mb-1">Avg Latency</p>
              <p className="text-2xl font-bold text-neutral-900">{activeProvider.avgLatency}ms</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-600 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-green-600">{(activeProvider.errorRate * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-600 mb-1">24h API Calls</p>
              <p className="text-2xl font-bold text-neutral-900">{activeProvider.apiCalls24h.toLocaleString()}</p>
            </div>
          </div>

          {/* Training Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-neutral-600 mb-1">Tokens Consumed (24h)</p>
              <p className="text-xl font-bold text-neutral-900">{activeProvider.tokensConsumed24h.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-neutral-600 mb-1">Cost per Token</p>
              <p className="text-xl font-bold text-neutral-900">${activeProvider.costPerToken.toFixed(5)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-neutral-600 mb-1">Monthly Spend</p>
              <p className="text-xl font-bold text-green-600">${activeProvider.monthlySpend.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Connection Health */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-neutral-700 font-medium">Connection Health:</span>
            <span className={`font-bold capitalize ${getHealthColor(activeProvider.connectionHealth)}`}>
              {activeProvider.connectionHealth}
            </span>
          </div>
          <div className="text-sm text-neutral-600">
            Last sync: {activeProvider.lastSync}
          </div>
        </div>
      </div>

      {/* Failover Providers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Failover Providers (Standby)</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Ready to take over if the primary provider experiences issues. Click "Switch to Provider" to manually change.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-neutral-700 font-medium">{standbyProviders.length} providers in standby</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {standbyProviders.map((provider) => (
            <div 
              key={provider.id}
              className="bg-white rounded-lg p-6 shadow-sm border-2 border-neutral-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{provider.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{provider.models.join(', ')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(provider.status)}`}>
                  {provider.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Uptime</span>
                  <span className="font-semibold text-neutral-900">{provider.uptime}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Avg Latency</span>
                  <span className="font-semibold text-neutral-900">{provider.avgLatency}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Error Rate</span>
                  <span className={`font-semibold ${provider.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                    {(provider.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Connection Health</span>
                  <span className={`font-semibold capitalize ${getHealthColor(provider.connectionHealth)}`}>
                    {provider.connectionHealth}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                <p className="text-xs text-blue-800 font-medium">{provider.trainingStatus}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(provider)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium"
                >
                  Details
                </button>
                <button
                  onClick={() => handleSwitchProvider(provider)}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Switch to Provider
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curriculum Training Data */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              District Curriculum Training
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              AIVO dynamically trains on district-specific curriculum. Each child receives personalized learning based on their district's educational standards.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-neutral-700 font-medium">45 Districts • 892 Curricula</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Active Training Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">Active Training</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                Live
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-600">Districts Synced</p>
                <p className="text-2xl font-bold text-neutral-900">45/45</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Curricula Loaded</p>
                <p className="text-2xl font-bold text-blue-600">892</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Last Sync</p>
                <p className="text-sm font-medium text-neutral-900">{lastSyncTime}</p>
              </div>
            </div>
          </div>

          {/* Curriculum Coverage */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-4">Curriculum Coverage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Math</span>
                  <span className="font-semibold text-neutral-900">245 curricula</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Reading</span>
                  <span className="font-semibold text-neutral-900">287 curricula</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">Special Ed</span>
                  <span className="font-semibold text-neutral-900">360 curricula</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-4">Recent Uploads</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">Springfield USD</p>
                  <p className="text-xs text-neutral-600">Grade 3 Math • 5 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">Riverside County</p>
                  <p className="text-xs text-neutral-600">IEP Reading • 12 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">Metro Charter</p>
                  <p className="text-xs text-neutral-600">Social Skills • 28 min ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Management Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-neutral-700">Auto-sync enabled for all districts</span>
              </div>
              <span className="text-xs text-neutral-500">Next sync: 15 minutes</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleViewAllCurricula}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium text-sm transition-colors"
              >
                View All Curricula
              </button>
              <button 
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How Curriculum Training Works */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">How AIVO Trains on District Curriculum</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">District Upload</h3>
            <p className="text-sm text-neutral-600">
              Districts upload curriculum via District Portal (PDFs, DOCx, or through SIS integrations like Clever/PowerSchool)
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">AI Processing</h3>
            <p className="text-sm text-neutral-600">
              Active AI provider (currently {activeProvider.name}) processes and indexes curriculum by grade, subject, and learning objective
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Child Assignment</h3>
            <p className="text-sm text-neutral-600">
              Each child is automatically linked to their district's curriculum based on enrollment data and IEP/504 plans
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-amber-600">4</span>
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Personalized Learning</h3>
            <p className="text-sm text-neutral-600">
              AIVO delivers lessons tailored to the child's district curriculum, learning pace, and accessibility needs
            </p>
          </div>
        </div>
      </div>

      {/* Automatic Failover Configuration */}
      <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Automatic Failover Enabled</h3>
            <p className="text-sm text-neutral-700 mb-3">
              If the active provider experiences an outage or error rate exceeds 5%, AIVO will automatically switch to the next available standby provider based on health score and latency. All curriculum data and training context transfers seamlessly.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-neutral-700">Failover Priority: Gemini → Claude → LLaMA</span>
              </div>
              <button className="px-3 py-1 border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100 font-medium text-xs">
                Configure Priority
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Switch Provider Modal */}
      {showSwitchModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Switch Active Provider</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Critical Operation</p>
                  <p className="text-sm text-amber-700">
                    Switching providers will pause AIVO Brain training for approximately 30 seconds while the connection is established and training context is transferred.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-medium text-neutral-600 mb-2">Current Provider</p>
                  <p className="text-lg font-bold text-neutral-900">{activeProvider.name}</p>
                  <p className="text-sm text-neutral-600 mt-1">{activeProvider.models[0]}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-medium text-neutral-600 mb-2">New Provider</p>
                  <p className="text-lg font-bold text-neutral-900">{selectedProvider.name}</p>
                  <p className="text-sm text-neutral-600 mt-1">{selectedProvider.models[0]}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-800 mb-2">Switch Process:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Pause current training batch</li>
                  <li>Save training state and context</li>
                  <li>Establish connection to {selectedProvider.name}</li>
                  <li>Transfer training context</li>
                  <li>Resume training with new provider</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSwitch}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Curricula Modal */}
      {showCurriculaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">All Curricula</h3>
                <p className="text-neutral-600 mt-1">892 curricula across 45 districts</p>
              </div>
              <button onClick={closeModals} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-2 mb-6 border-b border-neutral-200">
              <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">All (892)</button>
              <button className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900">Math (245)</button>
              <button className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900">Reading (287)</button>
              <button className="px-4 py-2 font-medium text-neutral-600 hover:text-neutral-900">Special Ed (360)</button>
            </div>

            {/* Curricula List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {[
                { district: 'Springfield USD', subject: 'Math', grade: 'Grade 3', count: 24, updated: '5 min ago', status: 'active' },
                { district: 'Riverside County', subject: 'Reading', grade: 'IEP Reading', count: 18, updated: '12 min ago', status: 'active' },
                { district: 'Metro Charter', subject: 'Special Ed', grade: 'Social Skills', count: 32, updated: '28 min ago', status: 'active' },
                { district: 'Oakland Unified', subject: 'Math', grade: 'Grade 5', count: 28, updated: '1 hour ago', status: 'active' },
                { district: 'San Jose Schools', subject: 'Reading', grade: 'Grade 2', count: 22, updated: '2 hours ago', status: 'active' },
                { district: 'Bay Area District', subject: 'Special Ed', grade: 'Adaptive Learning', count: 45, updated: '3 hours ago', status: 'active' },
                { district: 'Central Valley USD', subject: 'Math', grade: 'Grade 4', count: 26, updated: '4 hours ago', status: 'active' },
                { district: 'North County Schools', subject: 'Reading', grade: 'Grade 1', count: 20, updated: '5 hours ago', status: 'active' },
                { district: 'Coastal District', subject: 'Special Ed', grade: 'Communication Skills', count: 38, updated: '6 hours ago', status: 'active' },
                { district: 'Mountain View USD', subject: 'Math', grade: 'Grade 6', count: 30, updated: '8 hours ago', status: 'active' },
              ].map((curriculum, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      curriculum.subject === 'Math' ? 'bg-blue-100' :
                      curriculum.subject === 'Reading' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {curriculum.subject === 'Math' ? '📐' : 
                       curriculum.subject === 'Reading' ? '📖' : '🎓'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{curriculum.district}</h4>
                      <p className="text-sm text-neutral-600">{curriculum.grade} • {curriculum.count} lessons</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        curriculum.subject === 'Math' ? 'bg-blue-100 text-blue-700' :
                        curriculum.subject === 'Reading' ? 'bg-green-100 text-green-700' : 
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {curriculum.subject}
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">Updated {curriculum.updated}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50">
                      View
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">Showing 10 of 892 curricula</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium text-sm">
                  Load More
                </button>
                <button 
                  onClick={closeModals}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {showDetailsModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">{selectedProvider.name}</h3>
                <p className="text-neutral-600 mt-1">{selectedProvider.description}</p>
              </div>
              <button onClick={closeModals} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600 mb-2">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold uppercase ${getStatusBadge(selectedProvider.status)}`}>
                  {selectedProvider.status}
                </span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600 mb-2">Uptime</p>
                <p className="text-xl font-bold text-neutral-900">{selectedProvider.uptime}%</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600 mb-2">Average Latency</p>
                <p className="text-xl font-bold text-neutral-900">{selectedProvider.avgLatency}ms</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-600 mb-2">Error Rate</p>
                <p className={`text-xl font-bold ${selectedProvider.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                  {(selectedProvider.errorRate * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-neutral-900 mb-3">Available Models</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.models.map((model: string) => (
                  <span key={model} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {model}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-neutral-900 mb-3">Cost Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">Cost per Token</p>
                  <p className="text-lg font-bold text-neutral-900">${selectedProvider.costPerToken.toFixed(5)}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">Tokens (24h)</p>
                  <p className="text-lg font-bold text-neutral-900">{selectedProvider.tokensConsumed24h.toLocaleString()}</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">Monthly Spend</p>
                  <p className="text-lg font-bold text-green-600">${selectedProvider.monthlySpend.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-400 mb-3">Recent Activity Log</h4>
              <div className="space-y-1 text-xs font-mono text-green-400">
                <div>[{new Date().toLocaleTimeString()}] Connection health check: {selectedProvider.connectionHealth}</div>
                <div>[{new Date(Date.now() - 60000).toLocaleTimeString()}] Uptime: {selectedProvider.uptime}%</div>
                <div>[{new Date(Date.now() - 120000).toLocaleTimeString()}] Avg latency: {selectedProvider.avgLatency}ms</div>
                <div>[{new Date(Date.now() - 180000).toLocaleTimeString()}] Error rate: {(selectedProvider.errorRate * 100).toFixed(2)}%</div>
                <div>[{new Date(Date.now() - 240000).toLocaleTimeString()}] Status: {selectedProvider.trainingStatus}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium"
              >
                Close
              </button>
              {selectedProvider.status !== 'active' && (
                <button 
                  onClick={() => { closeModals(); handleSwitchProvider(selectedProvider); }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Switch to This Provider
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
