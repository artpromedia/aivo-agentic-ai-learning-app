import { Button } from '@aivo/ui';
import { 
  DocumentArrowDownIcon, 
  Cog6ToothIcon, 
  RocketLaunchIcon 
} from '@heroicons/react/24/outline';

export function HowItWorks() {
  const handleStartTrial = () => {
    // Redirect to role selection page
    window.location.href = '/signup/select-role';
  };
  
  const steps = [
    {
      number: 1,
      icon: DocumentArrowDownIcon,
      title: 'Tell Us About Your Child',
      description: 'Share their IEP, learning preferences, and what makes them unique. Upload documents or tell us in your own words—we make it easy.',
    },
    {
      number: 2,
      icon: Cog6ToothIcon,
      title: 'AI Builds Their Personal Model',
      description: 'In minutes, we create a unique AI tutor trained on your child\'s goals, strengths, and needs. It starts learning from day one.',
    },
    {
      number: 3,
      icon: RocketLaunchIcon,
      title: 'Watch Your Child Thrive',
      description: 'As your child learns, their AI adapts—getting smarter about what works, what doesn\'t, and how to keep them engaged and making progress.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-neutral-900 mb-16">
          Your Child's Personalized AI in 3 Simple Steps
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
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleStartTrial}
          >
            Try for Free
          </Button>
          <p className="mt-4 text-sm text-neutral-600">
            Free baseline assessment included • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
