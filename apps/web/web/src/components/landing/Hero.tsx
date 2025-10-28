import { Button } from '@aivo/ui';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ScheduleDemoModal } from '../modals/ScheduleDemoModal';

export function Hero() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleGetStarted = () => {
    // Redirect to role selection page
    window.location.href = '/signup/select-role';
  };

  const handleScheduleDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Trust Badge */}
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              ✓ Built by AI Expert & Father of Neurodiverse Children
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Your Child's Personal
              <br />
              <span className="text-primary-600">AI Learning Companion</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-neutral-600 mb-8 max-w-xl leading-relaxed">
              AIVO adapts to your child's unique brain—whether they have ADHD, autism, dyslexia, or other learning differences. Watch them thrive with an AI that truly understands how they learn best.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button variant="primary" size="lg" onClick={handleGetStarted}>
                Try for Free
              </Button>
              <button 
                onClick={handleScheduleDemo}
                className="px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:border-neutral-400 hover:bg-neutral-50 transition"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-success-600" />
                <span className="font-medium">COPPA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-success-600" />
                <span className="font-medium">Parent-Controlled Privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-success-600" />
                <span className="font-medium">No Ads, Ever</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Screenshot */}
          <div className="relative">
            {/* Placeholder for dashboard screenshot/illustration */}
            <div className="relative rounded-2xl shadow-2xl bg-white p-6 border border-neutral-200">
              {/* Mock Dashboard UI */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <h3 className="font-semibold text-neutral-900">IEP Dashboard</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-success-400"></div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-primary-50 to-success-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-neutral-700 mb-2">Progress Timeline</div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-success-500 rounded-full"></div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">75% of annual goals met</div>
                </div>

                {/* Student Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Math Goals', value: '12/15', color: 'success' },
                    { name: 'Reading', value: '8/10', color: 'primary' },
                    { name: 'Speech', value: '5/6', color: 'accent' },
                    { name: 'Writing', value: '9/12', color: 'primary' },
                  ].map((item, i) => (
                    <div key={i} className="bg-neutral-50 rounded-lg p-3">
                      <div className={`text-2xl font-bold text-${item.color}-600 mb-1`}>{item.value}</div>
                      <div className="text-xs text-neutral-600">{item.name}</div>
                    </div>
                  ))}
                </div>

                {/* Chart Visualization */}
                <div className="bg-neutral-50 rounded-lg p-4 h-32 flex items-end gap-2">
                  {[65, 80, 70, 90, 85, 95].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-success-100 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Schedule Demo Modal */}
      <ScheduleDemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </section>
  );
}
