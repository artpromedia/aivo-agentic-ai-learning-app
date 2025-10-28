import { CheckIcon } from '@heroicons/react/24/solid';
import { Button } from '@aivo/ui';
import { useState } from 'react';
import { ScheduleDemoModal } from '../modals/ScheduleDemoModal';

export function Pricing() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleGetStarted = () => {
    // Navigate to role selection
    window.location.href = '/signup/select-role';
  };

  const handleScheduleDemo = () => {
    setShowDemoModal(true);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Both include the full AIVO experience with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Families Plan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-neutral-200 hover:border-primary-300 transition relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Families</h3>
              <p className="text-neutral-600">Perfect for home learning</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-neutral-900">$29.99</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <div className="text-sm text-neutral-600 mt-2">
                for 1 child
              </div>
              <div className="text-sm text-primary-600 font-semibold">
                $25/child/month for 2+ children
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                'Complete AIVO learning system',
                'Personalized AI model for your child',
                'IEP-aware lesson adaptation',
                'Parent progress dashboard',
                'Unlimited offline access',
                'COPPA-compliant privacy protection',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              onClick={handleGetStarted}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-semibold"
            >
              Try for Free
            </Button>
            <p className="text-center text-sm text-neutral-500 mt-4">
              30-day money-back guarantee
            </p>
          </div>

          {/* Districts Plan */}
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl p-8 border-2 border-neutral-300 hover:border-neutral-400 transition relative">
            {/* Enterprise Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-neutral-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Enterprise
              </div>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Districts & NGOs</h3>
              <p className="text-neutral-600">Scale personalized learning</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-neutral-900">$20</span>
                <span className="text-neutral-600">/child/month</span>
              </div>
              <div className="text-sm text-neutral-600 mt-2">
                25-seat minimum
              </div>
              <div className="text-sm text-green-600 font-semibold">
                Volume discounts available
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                'Classroom management dashboard',
                'Teacher training and support',
                'FERPA-compliant data handling',
                'Real-time learning analytics',
                'Offline-first deployment',
                'Custom integration support',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              className="w-full bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-300 py-4 text-lg font-semibold"
              onClick={handleScheduleDemo}
            >
              Schedule Demo
            </Button>
            <p className="text-center text-sm text-neutral-600 mt-4">
              Custom pricing for 1000+ students
            </p>
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
