import { CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export function FinalCTA() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    window.location.href = 'http://localhost:3005/#/assessment';
  };

  const handleScheduleDemo = () => {
    navigate('/contact');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Special Education Program?
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-primary-100 mb-10 max-w-3xl mx-auto">
          Join hundreds of schools using AIVO to save time, improve outcomes, and ensure compliance.
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
            Start Free Trial
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>30-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5" />
            <span>Free onboarding support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
