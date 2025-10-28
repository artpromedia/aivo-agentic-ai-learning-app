import React from 'react';
import { CheckCircleIcon, DeviceTabletIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const AivoPadSection: React.FC = () => {
  const features = [
    {
      icon: '🖊️',
      title: '4,096-Level Stylus',
      description: 'Natural handwriting that feels like pen and paper',
    },
    {
      icon: '🔒',
      title: 'COPPA/FERPA Compliant',
      description: 'Secure by design with hardware encryption',
    },
    {
      icon: '📴',
      title: 'Full Offline Mode',
      description: 'Complete curriculum without internet',
    },
    {
      icon: '🛡️',
      title: 'School-Rugged',
      description: '4-foot drop tested, IP54 water resistant',
    },
    {
      icon: '🔋',
      title: '10+ Hour Battery',
      description: 'All-day learning with fast charging',
    },
    {
      icon: '♿',
      title: 'Built-in Accessibility',
      description: 'WCAG 2.1 AA compliant interface',
    },
  ];

  const highlights = [
    'Purpose-built for education, not consumer entertainment',
    'Dedicated NPU for on-device AI personalization',
    '5 years of guaranteed security updates',
    'MIL-STD-810G military-grade durability',
    'Works seamlessly with existing iPads, Chromebooks, and Windows devices',
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-6">
            <DeviceTabletIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Meet the Aivo Pad
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            The first tablet purpose-built for neurodiverse learners. Where AI meets hardware designed for how your child learns.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Device Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
              <img 
                src="/devices/aivopad6.png" 
                alt="Aivo Pad - Purpose-Built Educational Tablet" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-accent-500 text-white px-6 py-3 rounded-xl shadow-lg transform rotate-3">
              <p className="font-bold text-lg">Starting at $149</p>
              <p className="text-sm opacity-90">Volume discounts available</p>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-3xl font-bold mb-8">
              Built for Learning, Not Distractions
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-neutral-300">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Key Highlights */}
            <div className="bg-primary-500/20 backdrop-blur-sm rounded-2xl p-6 border border-primary-500/30">
              <h4 className="font-bold text-lg mb-4">Why Aivo Pad?</h4>
              <ul className="space-y-3">
                {highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-200">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Device Compatibility Note */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <p className="text-lg text-neutral-300 mb-4">
            <strong className="text-white">Already have devices?</strong> No problem! Aivo Learning works seamlessly on iPads, Android tablets, Chromebooks, and Windows devices.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-400">
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary-400" />
              Apple iPad
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary-400" />
              Android Tablets
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary-400" />
              Chromebooks
            </span>
            <span className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary-400" />
              Windows Devices
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="/devices"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors font-semibold text-lg shadow-lg shadow-primary-500/30"
          >
            Explore Aivo Pad
            <ArrowRightIcon className="w-5 h-5" />
          </a>
          <a
            href="/devices#pricing"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-colors font-semibold text-lg border border-white/20"
          >
            View Pricing & Discounts
          </a>
        </div>
      </div>
    </section>
  );
};
