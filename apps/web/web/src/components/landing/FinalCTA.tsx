import { CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ScheduleDemoModal } from '../modals/ScheduleDemoModal';

export function FinalCTA() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleGetStarted = () => {
    // Redirect to role selection page
    window.location.href = '/signup/select-role';
  };

  const handleScheduleDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Give Your Child Their Own AI Learning Companion?
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
          Join thousands of families using AIVO to unlock their child's potential and celebrate progress every day.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button 
            onClick={handleScheduleDemo}
            className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-neutral-50 transition shadow-lg"
          >
            Schedule a Demo
          </button>
          <button 
            onClick={handleGetStarted}
            className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Try for Free
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>Free baseline assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>Cancel anytime</span>
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
