import { Button } from '@aivo/ui';
import { 
  DocumentArrowDownIcon, 
  Cog6ToothIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: DocumentArrowDownIcon,
      title: 'Import Your Data',
      description: 'Seamlessly migrate existing IEPs and student records. We integrate with your SIS (PowerSchool, Infinite Campus, etc.)',
    },
    {
      number: 2,
      icon: Cog6ToothIcon,
      title: 'Customize Your Workflow',
      description: 'Configure settings to match your district\'s processes, forms, and compliance requirements.',
    },
    {
      number: 3,
      icon: RocketLaunchIcon,
      title: 'Start Collaborating',
      description: 'Invite your team, create IEPs, track progress, and experience streamlined special education management.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 mb-16">
          Get Started in 3 Simple Steps
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              {/* Number Badge */}
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold text-2xl flex items-center justify-center mb-6 shadow-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                <step.icon className="w-10 h-10 text-primary-600" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                {step.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="primary" size="lg">
            Start Your Free Trial
          </Button>
          <p className="mt-4 text-sm text-neutral-600">
            No credit card required • 30-day trial
          </p>
        </div>
      </div>
    </section>
  );
}
