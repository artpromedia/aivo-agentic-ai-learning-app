import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

export function ComparisonTable() {
  const traditional = [
    'Same content for all students',
    'Fixed difficulty levels',
    'Generic progress reports',
    'Manual activity selection',
    'One-way feedback',
    'Separate IEP tracking',
  ];

  const aivo = [
    'Unique AI model for each learner',
    'Real-time difficulty adaptation',
    'Personalized progress insights',
    'AI-recommended activities',
    'Two-way adaptive learning',
    'IEP-integrated automatically',
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Traditional Learning vs. Personal AI Model
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Traditional */}
          <div className="bg-neutral-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-neutral-500 mb-8 text-center">
              Traditional Platforms
            </h3>
            <ul className="space-y-4">
              {traditional.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-neutral-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AIVO */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-200 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                </div>
                <span className="font-semibold text-sm">AI Powered</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-purple-600 mb-8 text-center mt-4">
              AIVO Personal AI Model
            </h3>
            <ul className="space-y-4">
              {aivo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-neutral-900 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2 opacity-90">Traditional</div>
              <div className="text-3xl font-bold">1 curriculum for 1,000 kids</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/30"></div>
            <div className="flex-1 text-right">
              <div className="text-sm font-semibold mb-2 opacity-90">AIVO</div>
              <div className="text-3xl font-bold">1,000 unique AI models for 1,000 kids</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#demo" className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg hover:text-purple-700 transition">
            Experience the Difference
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
