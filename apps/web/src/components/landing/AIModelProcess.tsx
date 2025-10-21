import { SparklesIcon, ArrowTrendingUpIcon, BoltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function AIModelProcess() {
  const steps = [
    {
      number: '01',
      title: 'Your Child Gets Their Own AI Brain',
      icon: SparklesIcon,
      color: 'purple',
      items: [
        'Automatically created from student\'s IEP goals',
        '15-minute baseline assessment captures levels',
        'Unique AI model configured for your child',
      ],
    },
    {
      number: '02',
      title: 'The Model Learns How Your Child Learns',
      icon: ArrowTrendingUpIcon,
      color: 'blue',
      items: [
        'Tracks every interaction and engagement',
        'Discovers learning style preferences',
        'Identifies strengths and support areas',
      ],
    },
    {
      number: '03',
      title: 'Instant Personalization Every Session',
      icon: BoltIcon,
      color: 'orange',
      items: [
        'Adjusts difficulty based on performance',
        'Recommends IEP-aligned activities',
        'Generates personalized hints and feedback',
      ],
    },
    {
      number: '04',
      title: 'Automatic Progress Tracking',
      icon: ArrowPathIcon,
      color: 'green',
      items: [
        'All sessions update IEP goals automatically',
        'Parents see real-time dashboard',
        'Teachers receive data-driven insights',
      ],
    },
  ];

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
  };

  const bgColors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            From IEP to Personal AI Model in Minutes
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Your child's learning journey, powered by their own AI brain
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg transition"
              >
                {/* Number Badge */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]} text-lg font-bold mb-4`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 ${bgColors[step.color as keyof typeof bgColors]} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-neutral-900 mb-4">
                  {step.title}
                </h3>

                {/* Items */}
                <ul className="space-y-2">
                  {step.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <svg className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#demo" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition">
            Watch the AI Model in Action
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
