import { getPlatformMetrics, getSystemHealth, getDistricts } from '../utils/mockData';

export default function Dashboard() {
  // Mock data for dashboard display
  getPlatformMetrics();
  getSystemHealth();
  getDistricts();

  return (
    <div className="space-y-6">
      {/* Top Metric Cards - Colorful Cards like Modernize */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Invoices Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Invoices</p>
              <p className="text-3xl font-bold">59</p>
            </div>
          </div>
        </div>

        {/* Chats Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Chats</p>
              <p className="text-3xl font-bold">3,560</p>
            </div>
          </div>
        </div>

        {/* Blogs Card */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Blogs</p>
              <p className="text-3xl font-bold">696</p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Projects</p>
              <p className="text-3xl font-bold">356</p>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Products</p>
              <p className="text-3xl font-bold">$96k</p>
            </div>
          </div>
        </div>

        {/* Followers Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">Followers</p>
              <p className="text-3xl font-bold">96</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Updates - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Updates</h2>
              <p className="text-sm text-gray-500">Overview of profit</p>
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>March 2024</option>
              <option>April 2024</option>
              <option>May 2024</option>
            </select>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="mb-6">
            <div className="flex items-end justify-center space-x-2 h-64">
              {[45, 70, 60, 85, 65, 75].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Earnings */}
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <p className="text-2xl font-bold text-gray-900">$63,489.50</p>
                </div>
                <p className="text-sm text-gray-600">Total Earnings</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <p className="text-2xl font-bold text-gray-900">$48,820</p>
                </div>
                <p className="text-sm text-gray-600">Earnings this month</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <p className="text-2xl font-bold text-gray-900">$26,498</p>
                </div>
                <p className="text-sm text-gray-600">Expense this month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Breakup */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Yearly Breakup</h2>
          
          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="15" fill="none" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke="#3B82F6" 
                  strokeWidth="15" 
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">$36,358</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-600 font-semibold">+9%</span>
            </div>
            <span className="text-sm text-gray-500">last year</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">2023</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-xs text-gray-600">2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Monthly Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900">$6,820</p>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-600 font-semibold">+9%</span>
              <span className="text-sm text-gray-500">last year</span>
            </div>
          </div>
          {/* Mini line chart */}
          <div className="h-20">
            <svg className="w-full h-full" viewBox="0 0 200 80">
              <path 
                d="M 0 60 Q 50 40, 100 45 T 200 30" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Employee Salary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Salary</h3>
          <p className="text-xs text-gray-500 mb-4">Every month</p>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Salary</span>
                <span className="text-sm font-semibold text-gray-900">$36,358</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profit</span>
                <span className="text-sm font-semibold text-gray-900">$5,296</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
          <div className="mb-2">
            <p className="text-3xl font-bold text-gray-900">36,358</p>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-600 font-semibold">+9%</span>
            </div>
          </div>
          {/* Mini area chart */}
          <div className="h-16">
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <path 
                d="M 0 40 Q 50 20, 100 25 T 200 15 L 200 60 L 0 60 Z" 
                fill="url(#gradient1)" 
                opacity="0.3"
              />
              <path 
                d="M 0 40 Q 50 20, 100 25 T 200 15" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
          <div className="mb-2">
            <p className="text-3xl font-bold text-gray-900">78,298</p>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-600 font-semibold">+9%</span>
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end justify-between h-16 gap-1">
            {[60, 80, 50, 90, 70, 85, 75, 95].map((height, i) => (
              <div 
                key={i}
                className="flex-1 bg-gradient-to-t from-indigo-500 to-blue-400 rounded-sm"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Best Selling Products</h3>
              <p className="text-sm opacity-90">Overview 2023</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute right-0 top-0 opacity-20">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="70" r="30" fill="currentColor" />
                <ellipse cx="50" cy="35" rx="15" ry="20" fill="currentColor" />
                <rect x="45" y="35" width="10" height="35" fill="currentColor" />
              </svg>
            </div>
            
            <div className="relative space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">MaterialPro</span>
                  <span className="text-lg font-bold">$23,568</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '55%' }}></div>
                </div>
                <span className="text-xs opacity-75 mt-1 block">55%</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">MaterialPro</span>
                  <span className="text-lg font-bold">$23,568</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '55%' }}></div>
                </div>
                <span className="text-xs opacity-75 mt-1 block">55%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Stats</h3>
          <p className="text-sm text-gray-500 mb-6">Average sales</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Top Sales</p>
                  <p className="text-sm text-gray-500">Johnathan Doe</p>
                </div>
              </div>
              <div className="text-blue-600 font-semibold">+68</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-transparent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Best Seller</p>
                  <p className="text-sm text-gray-500">MaterialPro Admin</p>
                </div>
              </div>
              <div className="text-cyan-600 font-semibold">+68</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Most Commented</p>
                  <p className="text-sm text-gray-500">Ample Admin</p>
                </div>
              </div>
              <div className="text-purple-600 font-semibold">+68</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Top Performers</h3>
          <p className="text-sm text-gray-500">Best employees</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Project</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Budget</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sunil Joshi', role: 'Web Designer', project: 'Elite Admin', priority: 'Low', budget: '3.9k', color: 'blue' },
                { name: 'John Deo', role: 'Web Designer', project: 'Flexy Admin', priority: 'Medium', budget: '24.5k', color: 'cyan' },
                { name: 'Nirav Joshi', role: 'Web Designer', project: 'Material Pro', priority: 'High', budget: '12.8k', color: 'purple' },
                { name: 'Yuvraj Sheth', role: 'Web Designer', project: 'Xtreme Admin', priority: 'Low', budget: '4.8k', color: 'green' },
                { name: 'Micheal Doe', role: 'Web Designer', project: 'Helping Hands WP', priority: 'High', budget: '9.3k', color: 'orange' },
              ].map((employee, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${employee.color}-100 rounded-full flex items-center justify-center`}>
                        <span className={`text-${employee.color}-600 font-semibold text-sm`}>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{employee.project}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      employee.priority === 'High' ? 'bg-red-100 text-red-700' :
                      employee.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {employee.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">{employee.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
